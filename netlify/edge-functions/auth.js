// ─── Unified Auth API ─────────────────────────────────────────────────────────
// Backs both lctron-site and the Electron app with a single user store.
// Endpoints (via ?action=...):
//   register   – create account
//   login      – sign in
//   google     – Google OAuth sign-in / auto-register
//   send-reset – send forgot-password code by email (never returns the code in JSON)
//   reset-pw   – verify code + set new password
// All user records stored in Netlify Blobs under store "lctron-users".

const STORE = 'lctron-users';
const OWNER_EMAIL = 'omariirvin44@gmail.com';
const SALT = 'lctron-salt-2024';
const DEFAULT_SITE_ID = 'ab849e15-836d-4b57-9c2f-347b58a40b78';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });

// ── Blob helpers (REST only — no npm imports; Edge bundler compatible) ───────
// Token: NETLIFY_API_TOKEN (canonical) or Netlify_API_TOKEN — both are accepted.

function getNetlifyPat() {
  return (
    Deno.env.get('NETLIFY_API_TOKEN') ||
    Deno.env.get('Netlify_API_TOKEN') ||
    ''
  );
}

function blobHeaders() {
  const token = getNetlifyPat();
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}

function blobUrl(key) {
  const siteId = Deno.env.get('NETLIFY_BLOBS_SITE_ID') || DEFAULT_SITE_ID;
  return `https://api.netlify.com/api/v1/blobs/${siteId}/${STORE}/${encodeURIComponent(key)}`;
}

async function getUser(email) {
  const key = email.toLowerCase().trim();
  const h = blobHeaders();
  if (!h) return null;
  try {
    const res = await fetch(blobUrl(key), { headers: h });
    if (res.status === 200) {
      const text = await res.text();
      return JSON.parse(text);
    }
  } catch {}
  return null;
}

async function putUser(email, data) {
  const key = email.toLowerCase().trim();
  const h = blobHeaders();
  if (!h) throw new Error('Netlify API token not set (NETLIFY_API_TOKEN or Netlify_API_TOKEN)');
  const res = await fetch(blobUrl(key), {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: { ...h, 'Content-Type': 'text/plain; charset=utf-8' },
  });
  if (!res.ok) throw new Error(`Blob PUT failed: ${res.status}`);
}

function blobsAvailable() {
  return !!getNetlifyPat();
}

// ── SHA-256 hash (matching both Electron and site client) ─────────────────────
async function hashPassword(password) {
  const enc = new TextEncoder().encode(password + SALT);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response('', { status: 204, headers: CORS });
  }
  if (request.method !== 'POST') {
    return json({ error: 'POST required' }, 405);
  }

  let body;
  try { body = await request.json(); } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const action = (body.action || '').toLowerCase();

  // ── REGISTER ────────────────────────────────────────────────────────────────
  if (action === 'register') {
    const { name, email, password } = body;
    if (!email || !password) return json({ success: false, error: 'Email and password required.' }, 400);
    const key = email.toLowerCase().trim();
    let existing = await getUser(key);
    if (existing) return json({ success: false, error: 'An account with this email already exists. Try signing in.' });
    const passwordHash = await hashPassword(password);
    const isPremium = key === OWNER_EMAIL.toLowerCase();
    const user = { name: (name || '').trim() || key.split('@')[0], email: key, passwordHash, isPremium, createdAt: new Date().toISOString() };
    await putUser(key, user);
    return json({ success: true, user: { name: user.name, email: user.email, isPremium, picture: null } });
  }

  // ── LOGIN ───────────────────────────────────────────────────────────────────
  if (action === 'login') {
    const { email, password, migrateLocal } = body;
    if (!email || !password) return json({ success: false, error: 'Email and password required.' }, 400);
    const key = email.toLowerCase().trim();
    let user = await getUser(key);
    
    // Auto-create owner account if missing
    if (!user && key === OWNER_EMAIL.toLowerCase()) {
      const passwordHash = await hashPassword(password);
      user = { name: 'Owner', email: key, passwordHash, isPremium: true, createdAt: new Date().toISOString(), picture: null };
      await putUser(key, user);
    }
    
    // If no remote account but migration data provided, create it
    if (!user && migrateLocal) {
      const passwordHash = await hashPassword(password);
      user = { name: migrateLocal.name || key.split('@')[0], email: key, passwordHash, isPremium: !!migrateLocal.isPremium, createdAt: migrateLocal.createdAt || new Date().toISOString(), picture: migrateLocal.picture || null };
      await putUser(key, user);
    }
    
    if (!user) return json({ success: false, error: 'No account found with this email. Please sign up first.' });
    const hash = await hashPassword(password);
    if (user.passwordHash !== hash) return json({ success: false, error: 'Incorrect password. Please try again.' });
    const isPremium = key === OWNER_EMAIL.toLowerCase() || !!user.isPremium;
    return json({ success: true, user: { name: user.name, email: user.email, isPremium, picture: user.picture || null } });
  }

  // ── GOOGLE (OAuth sign-in / auto-register) ──────────────────────────────────
  if (action === 'google') {
    const { email, name, picture } = body;
    if (!email) return json({ success: false, error: 'Email required.' }, 400);
    const key = email.toLowerCase().trim();
    const isPremium = key === OWNER_EMAIL.toLowerCase();
    let user = await getUser(key);
    if (!user) {
      user = { name: (name || '').trim() || key.split('@')[0], email: key, passwordHash: '', isPremium, picture: picture || null, createdAt: new Date().toISOString() };
      await putUser(key, user);
    } else {
      // Update picture/name if changed
      let changed = false;
      if (picture && user.picture !== picture) { user.picture = picture; changed = true; }
      if (name && user.name !== name) { user.name = name; changed = true; }
      if (isPremium && !user.isPremium) { user.isPremium = true; changed = true; }
      if (changed) await putUser(key, user);
    }
    return json({ success: true, user: { name: user.name, email: user.email, isPremium: isPremium || !!user.isPremium, picture: user.picture || null } });
  }

  // ── SEND-RESET (forgot password step 1) ─────────────────────────────────────
  if (action === 'send-reset') {
    const { email } = body;
    if (!email) return json({ success: false, error: 'Email required.' }, 400);
    const key = email.toLowerCase().trim();
    if (!blobsAvailable()) {
      return json(
        {
          success: false,
          error: 'Account service is temporarily unavailable. Please try again later.',
        },
        503,
      );
    }
    let user = await getUser(key);
    // Match login behavior: owner can bootstrap a remote record so reset works even if they
    // previously only used Google or local-only storage and never got a blob written.
    if (!user && key === OWNER_EMAIL.toLowerCase()) {
      user = {
        name: 'Owner',
        email: key,
        passwordHash: '',
        isPremium: true,
        createdAt: new Date().toISOString(),
        picture: null,
      };
      await putUser(key, user);
    }
    if (!user) return json({ success: false, error: 'No account found with this email.' });
    const code = String(Math.floor(100000 + Math.random() * 900000));
    // Store code in blob alongside user (edge functions are stateless)
    user._resetCode = code;
    user._resetExpires = Date.now() + 10 * 60 * 1000;
    await putUser(key, user);
    const siteOrigin =
      Deno.env.get('URL') ||
      Deno.env.get('DEPLOY_PRIME_URL') ||
      new URL(request.url).origin;
    try {
      const emailRes = await fetch(`${siteOrigin}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: key, code }),
      });
      let emailData;
      try {
        emailData = await emailRes.json();
      } catch {
        emailData = { success: false, error: 'Invalid response from mail service' };
      }
      if (emailData.success) {
        return json({ success: true, method: 'email' });
      }
      delete user._resetCode;
      delete user._resetExpires;
      await putUser(key, user);
      return json(
        {
          success: false,
          error:
            emailData.error ||
            'We could not send the reset email. Check your connection and try again in a few minutes.',
        },
        500,
      );
    } catch {
      delete user._resetCode;
      delete user._resetExpires;
      await putUser(key, user);
      return json(
        {
          success: false,
          error: 'Password reset email could not be sent. Please try again later.',
        },
        500,
      );
    }
  }

  // ── RESET-PW (forgot password step 2) ───────────────────────────────────────
  if (action === 'reset-pw') {
    const { email, code, newPassword } = body;
    if (!email || !code || !newPassword) return json({ success: false, error: 'Email, code, and new password required.' }, 400);
    const key = email.toLowerCase().trim();
    const user = await getUser(key);
    if (!user) return json({ success: false, error: 'Account not found.' });
    if (!user._resetCode) return json({ success: false, error: 'No reset code requested for this email.' });
    if (Date.now() > (user._resetExpires || 0)) {
      delete user._resetCode; delete user._resetExpires;
      await putUser(key, user);
      return json({ success: false, error: 'Reset code has expired. Please request a new one.' });
    }
    if (user._resetCode !== code) return json({ success: false, error: 'Invalid code. Please try again.' });
    user.passwordHash = await hashPassword(newPassword);
    delete user._resetCode;
    delete user._resetExpires;
    await putUser(key, user);
    return json({ success: true });
  }

  // ── CHECK (check if account exists) ─────────────────────────────────────────
  if (action === 'check') {
    const { email } = body;
    if (!email) return json({ success: false, error: 'Email required.' }, 400);
    const key = email.toLowerCase().trim();
    const user = await getUser(key);
    return json({ success: true, exists: !!user });
  }

  return json({ error: `Unknown action: ${action}` }, 400);
}

export const config = {
  path: ['/api/auth', '/.netlify/functions/auth'],
};
