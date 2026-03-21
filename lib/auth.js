export const OWNER_EMAIL = 'omariirvin44@gmail.com';
export const isOwner = (email) => email?.toLowerCase().trim() === OWNER_EMAIL.toLowerCase();

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
