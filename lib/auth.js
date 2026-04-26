export const OWNER_EMAIL = 'omariirvin44@gmail.com';
export const isOwner = (email) => email?.toLowerCase().trim() === OWNER_EMAIL.toLowerCase();

export const AUTH_API = 'https://lctronoptimizer.netlify.app/api/auth';

export async function authFetch(body) {
  const res = await fetch(AUTH_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

/** Google userinfo for OAuth access_token; throws with a clear message on failure. */
export async function fetchGoogleProfile(accessToken) {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    const msg = data.error_description || data.error || `Google profile request failed (${res.status})`;
    throw new Error(typeof msg === 'string' ? msg : 'Google profile request failed');
  }
  if (!data.email) {
    throw new Error('Google did not return an email. Allow email access for this app in your Google account.');
  }
  return data;
}

// Matches the Electron app's: crypto.createHash('sha256').update(password + 'lctron-salt-2024').digest('hex')
export async function hashPassword(password) {
  const enc = new TextEncoder().encode(password + 'lctron-salt-2024');
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('lctron-site-user') || 'null'); } catch { return null; }
}

export function setStoredUser(user) {
  localStorage.setItem('lctron-site-user', JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem('lctron-site-user');
}

export function getStoredUsers() {
  try { return JSON.parse(localStorage.getItem('lctron-users') || '[]'); } catch { return []; }
}

export function setStoredUsers(users) {
  localStorage.setItem('lctron-users', JSON.stringify(users));
}
