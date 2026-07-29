import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'mehta_os_super_secret_master_key_2026_x99';
const DEFAULT_PASSCODE = process.env.ADMIN_PASSCODE || 'sarthak2026';
const COOKIE_NAME = 'mehta_admin_session';

// Simple in-memory rate limiter for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

/**
 * Get current active master passcode from DB or fallback
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
  // Default hashed passcode
  return hashPasscode(DEFAULT_PASSCODE);
}

/**
 * Hash raw passcode with HMAC-SHA256
 */
export function hashPasscode(passcode: string): string {
  return crypto.createHmac('sha256', ADMIN_SECRET).update(passcode).digest('hex');
}

/**
 * Generate a signed session token
 */
export function generateSessionToken(passcodeHash: string): string {
  const timestamp = Date.now();
  const rawPayload = `admin:${passcodeHash}:${timestamp}`;
  const signature = crypto.createHmac('sha256', ADMIN_SECRET).update(rawPayload).digest('hex');
  return `${rawPayload}:${signature}`;
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

  // Session lasts 7 days
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > SEVEN_DAYS_MS) return false;

  const rawPayload = `admin:${hash}:${timestampStr}`;
  const expectedSig = crypto.createHmac('sha256', ADMIN_SECRET).update(rawPayload).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
}

/**
 * Authenticate login attempt
 */
export async function loginAdmin(passcode: string, ip: string = '127.0.0.1') {
  // Rate limiting check
  const now = Date.now();
  const attemptInfo = loginAttempts.get(ip) || { count: 0, lastAttempt: now };

  if (attemptInfo.count >= 5 && now - attemptInfo.lastAttempt < 15 * 60 * 1000) {
    const remainingMins = Math.ceil((15 * 60 * 1000 - (now - attemptInfo.lastAttempt)) / 60000);
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
    return {
      success: false,
      error: remaining > 0 ? `Invalid passcode. ${remaining} attempt(s) remaining.` : 'Too many failed attempts. Account locked for 15 minutes.',
    };
  }

  // Clear failed attempts on success
  loginAttempts.delete(ip);

  // Set HTTP-Only Secure Cookie
  const token = generateSessionToken(expectedHash);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return { success: true, token };
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
