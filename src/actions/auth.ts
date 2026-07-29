'use server';

import {
  loginAdmin,
  verify2FAAndLogin,
  logoutAdmin,
  isAuthorizedAdmin,
  updateAdminPasscode,
} from '../lib/auth';
import {
  generateTotpSecret,
  generateTotpQrCodeUrl,
  getTotpStatus,
  enableTotp,
  disableTotp,
} from '../lib/totp';
import { getSmtpConfig, updateSmtpConfig } from '../lib/email';

export async function adminLoginAction(passcode: string) {
  return await loginAdmin(passcode);
}

export async function verify2FAAction(tempToken: string, totpCode: string) {
  return await verify2FAAndLogin(tempToken, totpCode);
}

export async function adminLogoutAction() {
  return await logoutAdmin();
}

export async function checkAdminSessionAction() {
  const isAuth = await isAuthorizedAdmin();
  return { authenticated: isAuth };
}

export async function updateAdminPasscodeAction(currentPass: string, newPass: string) {
  return await updateAdminPasscode(currentPass, newPass);
}

/**
 * Get setup details for Google/Microsoft Authenticator (QR code data URL & secret)
 */
export async function getTotpSetupAction() {
  const isAuth = await isAuthorizedAdmin();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized.' };
  }

  const status = await getTotpStatus();
  const secret = status.secret || generateTotpSecret();
  const qrCodeUrl = await generateTotpQrCodeUrl(secret);

  return {
    success: true,
    enabled: status.enabled,
    secret,
    qrCodeUrl,
  };
}

/**
 * Enable Google/Microsoft Authenticator 2FA after scanning QR code & entering initial code
 */
export async function enableTotpAction(secret: string, initialCode: string) {
  const isAuth = await isAuthorizedAdmin();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized.' };
  }

  return await enableTotp(secret, initialCode);
}

/**
 * Disable Google/Microsoft Authenticator 2FA
 */
export async function disableTotpAction() {
  const isAuth = await isAuthorizedAdmin();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized.' };
  }

  return await disableTotp();
}

/**
 * Get current Email SMTP Alert configuration
 */
export async function getSmtpConfigAction() {
  const isAuth = await isAuthorizedAdmin();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized.' };
  }

  const config = await getSmtpConfig();
  // Mask password for UI
  return {
    success: true,
    config: {
      host: config.host,
      port: config.port,
      user: config.user,
      pass: config.pass ? '••••••••••••••••' : '',
      to: config.to,
      isConfigured: Boolean(config.user && config.pass),
    },
  };
}

/**
 * Update Email Alert credentials (e.g. Gmail address & App Password)
 */
export async function updateSmtpConfigAction(config: {
  host: string;
  port: number;
  user: string;
  pass: string;
  to: string;
}) {
  const isAuth = await isAuthorizedAdmin();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized.' };
  }

  if (!config.user || !config.to) {
    return { success: false, error: 'Email address is required.' };
  }

  return await updateSmtpConfig(config);
}
