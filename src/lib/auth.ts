import crypto from 'crypto';
import { cookies, headers } from 'next/headers';
import { prisma } from './prisma';
import { getTotpStatus, verifyTotpToken } from './totp';
import { sendSecurityAlertEmail } from './email';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'mehta_os_super_secret_master_key_2026_x99';
const DEFAULT_PASSCODE = process.env.ADMIN_PASSCODE || 'sarthak2026';
const COOKIE_NAME = 'mehta_admin_session';

// In-memory rate limiter for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

/**
 * Get active master passcode hash from DB or fallback
 */
export async function getActivePasscodeHash(): Promise<string> {
  try {
    const setting = await prisma.adminSetting.findUnique({
      where: { key: 'admin_passcode_hash' },
    });
    if (setting && setting.value) {
      return setting.value;
    }
  } catch (err) {
    console.error('Error fetching admin passcode hash:', err);
  }
  return hashPasscode(DEFAULT_PASSCODE);
}

/**
 * Hash raw passcode with HMAC-SHA256
 */
export function hashPasscode(passcode: string): string {
  return crypto.createHmac('sha256', ADMIN_SECRET).update(passcode).digest('hex');
}

/**
 * Generate a signed session token (valid for 7 days)
 */
export function generateSessionToken(passcodeHash: string): string {
  const timestamp = Date.now();
  const rawPayload = `admin:${passcodeHash}:${timestamp}`;
  const signature = crypto.createHmac('sha256', ADMIN_SECRET).update(rawPayload).digest('hex');
  return `${rawPayload}:${signature}`;
}

/**
 * Generate a temporary 2FA pending token (valid for 5 minutes)
 */
export function generateTemp2FaToken(passcodeHash: string): string {
  const timestamp = Date.now();
  const rawPayload = `temp2fa:${passcodeHash}:${timestamp}`;
  const signature = crypto.createHmac('sha256', ADMIN_SECRET).update(rawPayload).digest('hex');
  return `${rawPayload}:${signature}`;
}

/**
 * Verify temp 2FA token
 */
export function verifyTemp2FaToken(token: string, expectedHash: string): boolean {
  if (!token) return false;
  const parts = token.split(':');
  if (parts.length !== 4) return false;
  const [role, hash, timestampStr, signature] = parts;
  if (role !== 'temp2fa' || hash !== expectedHash) return false;

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Temp token valid for 5 minutes
  const FIVE_MINS_MS = 5 * 60 * 1000;
  if (Date.now() - timestamp > FIVE_MINS_MS) return false;

  const rawPayload = `temp2fa:${hash}:${timestampStr}`;
  const expectedSig = crypto.createHmac('sha256', ADMIN_SECRET).update(rawPayload).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
}

/**
 * Verify session token validity
 */
export function verifySessionToken(token: string, expectedHash: string): boolean {
  if (!token) return false;
  const parts = token.split(':');
  if (parts.length !== 4) return false;
  const [role, hash, timestampStr, signature] = parts;
  if (role !== 'admin' || hash !== expectedHash) return false;

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > SEVEN_DAYS_MS) return false;

  const rawPayload = `admin:${hash}:${timestampStr}`;
  const expectedSig = crypto.createHmac('sha256', ADMIN_SECRET).update(rawPayload).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
}

/**
 * Extract client IP & User Agent for audit telemetry
 */
async function getClientTelemetry() {
  try {
    const h = await headers();
    const ip = h.get('x-forwarded-for') || h.get('x-real-ip') || '127.0.0.1';
    const userAgent = h.get('user-agent') || 'Browser / Direct';
    return { ip, userAgent };
  } catch {
    return { ip: '127.0.0.1', userAgent: 'Direct' };
  }
}

/**
 * Step 1 Login Attempt: Check passcode & send email alert
 */
export async function loginAdmin(passcode: string) {
  const { ip, userAgent } = await getClientTelemetry();
  const now = Date.now();
  const attemptInfo = loginAttempts.get(ip) || { count: 0, lastAttempt: now };

  // Rate limiting check (5 attempts max per 15 mins)
  if (attemptInfo.count >= 5 && now - attemptInfo.lastAttempt < 15 * 60 * 1000) {
    const remainingMins = Math.ceil((15 * 60 * 1000 - (now - attemptInfo.lastAttempt)) / 60000);
    
    // Trigger email alert for locked attempt
    await sendSecurityAlertEmail({
      type: 'FAILED',
      ip,
      userAgent,
      details: `Account locked. Rate limit triggered after ${attemptInfo.count} failed attempts.`,
    });

    return {
      success: false,
      error: `Too many failed attempts. Account locked for ${remainingMins} minute(s).`,
    };
  }

  const expectedHash = await getActivePasscodeHash();
  const inputHash = hashPasscode(passcode);

  if (inputHash !== expectedHash) {
    loginAttempts.set(ip, {
      count: attemptInfo.count + 1,
      lastAttempt: now,
    });
    const remaining = 5 - (attemptInfo.count + 1);

    // Send email alert for failed passcode attempt
    await sendSecurityAlertEmail({
      type: 'FAILED',
      ip,
      userAgent,
      details: `Incorrect passcode entered. ${remaining} attempt(s) remaining before lockout.`,
    });

    return {
      success: false,
      error: remaining > 0 ? `Invalid passcode. ${remaining} attempt(s) remaining.` : 'Too many failed attempts. Account locked for 15 minutes.',
    };
  }

  // Passcode is correct -> check if 2FA TOTP is enabled
  const totpStatus = await getTotpStatus();

  if (totpStatus.enabled && totpStatus.secret) {
    // Generate temporary 2FA token
    const tempToken = generateTemp2FaToken(expectedHash);
    return {
      success: true,
      requires2FA: true,
      tempToken,
    };
  }

  // 2FA is not enabled -> clear failed attempts & issue session cookie
  loginAttempts.delete(ip);

  const token = generateSessionToken(expectedHash);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });

  // Send email alert for successful login
  await sendSecurityAlertEmail({
    type: 'SUCCESS',
    ip,
    userAgent,
    details: 'Successful passcode login (2FA optional/disabled).',
  });

  return { success: true, requires2FA: false };
}

/**
 * Step 2 Login Attempt: Verify 6-digit TOTP code from Google/Microsoft Authenticator
 */
export async function verify2FAAndLogin(tempToken: string, totpCode: string) {
  const { ip, userAgent } = await getClientTelemetry();
  const expectedHash = await getActivePasscodeHash();

  if (!verifyTemp2FaToken(tempToken, expectedHash)) {
    await sendSecurityAlertEmail({
      type: '2FA_FAILED',
      ip,
      userAgent,
      details: 'Expired or invalid 2FA session token.',
    });
    return { success: false, error: '2FA session expired. Please enter your passcode again.' };
  }

  const totpStatus = await getTotpStatus();
  if (!totpStatus.enabled || !totpStatus.secret) {
    return { success: false, error: '2FA is not configured on this account.' };
  }

  const isValid = verifyTotpToken(totpCode, totpStatus.secret);
  if (!isValid) {
    await sendSecurityAlertEmail({
      type: '2FA_FAILED',
      ip,
      userAgent,
      details: 'Incorrect 6-digit TOTP code entered from Google/Microsoft Authenticator app.',
    });
    return { success: false, error: 'Invalid 6-digit code. Check your Google or Microsoft Authenticator app.' };
  }

  // Clear rate limits & issue full session cookie
  loginAttempts.delete(ip);

  const token = generateSessionToken(expectedHash);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });

  // Send email alert for successful 2FA login
  await sendSecurityAlertEmail({
    type: 'SUCCESS',
    ip,
    userAgent,
    details: 'Successful login (Google/Microsoft Authenticator 2FA verified).',
  });

  return { success: true };
}

/**
 * Verify current request authorization
 */
export async function isAuthorizedAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;
    const expectedHash = await getActivePasscodeHash();
    return verifySessionToken(token, expectedHash);
  } catch {
    return false;
  }
}

/**
 * Logout admin
 */
export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return { success: true };
}

/**
 * Change passcode
 */
export async function updateAdminPasscode(currentPasscode: string, newPasscode: string) {
  const isAuth = await isAuthorizedAdmin();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized.' };
  }

  const expectedHash = await getActivePasscodeHash();
  if (hashPasscode(currentPasscode) !== expectedHash) {
    return { success: false, error: 'Current passcode is incorrect.' };
  }

  if (newPasscode.length < 6) {
    return { success: false, error: 'New passcode must be at least 6 characters long.' };
  }

  const newHash = hashPasscode(newPasscode);

  await prisma.adminSetting.upsert({
    where: { key: 'admin_passcode_hash' },
    update: { value: newHash },
    create: { key: 'admin_passcode_hash', value: newHash },
  });

  const { ip, userAgent } = await getClientTelemetry();
  await sendSecurityAlertEmail({
    type: 'PASSCODE_CHANGED',
    ip,
    userAgent,
    details: 'Master admin passcode updated successfully.',
  });

  // Re-issue session cookie with new hash
  const token = generateSessionToken(newHash);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });

  return { success: true, message: 'Passcode updated successfully.' };
}
