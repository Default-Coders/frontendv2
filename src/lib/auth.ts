import Cookies from 'js-cookie';

const ROLE_KEY = 'user_role';
const NAME_KEY = 'user_name';
const EMAIL_KEY = 'user_email';
const FIRST_LOGIN_KEY = 'first_login';
const COOKIE_OPTIONS = { sameSite: 'lax' as const };

export function setAuthData(role: string, name?: string, email?: string, firstLogin = false) {
  Cookies.set(ROLE_KEY, role, COOKIE_OPTIONS);
  if (name) Cookies.set(NAME_KEY, name, COOKIE_OPTIONS);
  if (email) Cookies.set(EMAIL_KEY, email, COOKIE_OPTIONS);
  Cookies.set(FIRST_LOGIN_KEY, String(firstLogin), COOKIE_OPTIONS);
}

export function clearAuthData() {
  Cookies.remove(ROLE_KEY);
  Cookies.remove(NAME_KEY);
  Cookies.remove(EMAIL_KEY);
  Cookies.remove(FIRST_LOGIN_KEY);
}

export function getUserRole(): string | undefined {
  return Cookies.get(ROLE_KEY);
}

export function getUserName(): string | undefined {
  return Cookies.get(NAME_KEY);
}

export function getUserEmail(): string | undefined {
  return Cookies.get(EMAIL_KEY);
}

export function isFirstLogin(): boolean {
  return Cookies.get(FIRST_LOGIN_KEY) === 'true';
}

export function completeFirstLogin() {
  Cookies.set(FIRST_LOGIN_KEY, 'false', COOKIE_OPTIONS);
}

export function isAuthenticated(): boolean {
  return Boolean(getUserRole());
}
