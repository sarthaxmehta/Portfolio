import { generateSecret, generateURI, verifySync } from 'otplib';
import QRCode from 'qrcode';
import { prisma } from './prisma';

const SERVICE_NAME = 'Sarthak Mehta Admin';

/**
 * Generate a new secret key for TOTP 2FA
 */
export function generateTotpSecret(): string {
  return generateSecret();
}

/**
 * Generate a QR Code Data URL (PNG base64) for scanning with Google/Microsoft Authenticator
 */
export async function generateTotpQrCodeUrl(secret: string, accountName: string = 'sarthakm.cs.24@nitj.ac.in'): Promise<string> {
  const otpauth = generateURI({
    secret,
    label: accountName,
    issuer: SERVICE_NAME,
  });

  return await QRCode.toDataURL(otpauth, {
    margin: 2,
    width: 260,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
}

/**
 * Verify a 6-digit TOTP token against a secret
 */
export function verifyTotpToken(token: string, secret: string): boolean {
  if (!token || !secret) return false;
  const cleanToken = token.replace(/\s+/g, '').trim();
  try {
    const result = verifySync({
      token: cleanToken,
      secret,
    });
    return result?.valid === true;
  } catch (err) {
    console.error('TOTP verification error:', err);
    return false;
  }
}

/**
 * Get current TOTP configuration status from DB
 */
export async function getTotpStatus(): Promise<{ enabled: boolean; secret?: string }> {
  try {
    const enabledSetting = await prisma.adminSetting.findUnique({
      where: { key: 'totp_enabled' },
    });
    const secretSetting = await prisma.adminSetting.findUnique({
      where: { key: 'totp_secret' },
    });

    const enabled = enabledSetting?.value === 'true';
    const secret = secretSetting?.value || undefined;

    return { enabled, secret };
  } catch (err) {
    console.error('Error reading TOTP status:', err);
    return { enabled: false };
  }
}

/**
 * Enable TOTP 2FA after verifying initial code
 */
export async function enableTotp(secret: string, initialToken: string) {
  const isValid = verifyTotpToken(initialToken, secret);
  if (!isValid) {
    return { success: false, error: 'Invalid 6-digit code from Google/Microsoft Authenticator app. Please check your app time synchronization and try again.' };
  }

  await prisma.adminSetting.upsert({
    where: { key: 'totp_secret' },
    update: { value: secret },
    create: { key: 'totp_secret', value: secret },
  });

  await prisma.adminSetting.upsert({
    where: { key: 'totp_enabled' },
    update: { value: 'true' },
    create: { key: 'totp_enabled', value: 'true' },
  });

  return { success: true, message: 'Google/Microsoft Authenticator 2FA activated successfully!' };
}

/**
 * Disable TOTP 2FA
 */
export async function disableTotp(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    await prisma.adminSetting.upsert({
      where: { key: 'totp_enabled' },
      update: { value: 'false' },
      create: { key: 'totp_enabled', value: 'false' },
    });

    return { success: true, message: 'Two-Factor Authentication disabled.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to disable 2FA.' };
  }
}

