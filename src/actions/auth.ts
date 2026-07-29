'use server';

import { loginAdmin, logoutAdmin, isAuthorizedAdmin, updateAdminPasscode } from '../lib/auth';

export async function adminLoginAction(passcode: string) {
  return await loginAdmin(passcode);
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
