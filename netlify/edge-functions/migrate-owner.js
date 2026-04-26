// ─── Seed Owner Account ───────────────────────────────────────────────────────
// One-time script to create the owner account in the remote database
// Call this once to migrate omariirvin44@gmail.com

const STORE = 'lctron-users';
const OWNER_EMAIL = 'omariirvin44@gmail.com';
const SALT = 'lctron-salt-2024';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });

function blobHeaders() {
  const token =
    Deno.env.get('NETLIFY_API_TOKEN') ||
    Deno.env.get('Netlify_API_TOKEN') ||
    '';
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}

function blobUrl(key) {
  const siteId = Deno.env.get('NETLIFY_BLOBS_SITE_ID') || 'ab849e15-836d-4b57-9c2f-347b58a40b78';
  return `https://api.netlify.com/api/v1/blobs/${siteId}/${STORE}/${encodeURIComponent(key)}`;
}

async function putUser(email, data) {
  const h = blobHeaders();
  if (!h) throw new Error('Netlify API token not set');
  const res = await fetch(blobUrl(email), {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: { ...h, 'Content-Type': 'text/plain; charset=utf-8' },
  });
  if (!res.ok) throw new Error(`Blob PUT failed: ${res.status}`);
}

async function hashPassword(password) {
  const enc = new TextEncoder().encode(password + SALT);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

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

  const { action, password } = body;

  if (action === 'seed-owner') {
    const key = OWNER_EMAIL.toLowerCase();
    const passwordHash = await hashPassword(password || 'lctron2024');
    const user = {
      name: 'Owner',
      email: key,
      passwordHash,
      isPremium: true,
      createdAt: new Date().toISOString(),
      picture: null,
    };
    try {
      await putUser(key, user);
      return json({ success: true, message: 'Owner account seeded' });
    } catch (e) {
      return json({ success: false, error: e.message }, 500);
    }
  }

  return json({ error: 'Unknown action' }, 400);
}

export const config = {
  path: '/api/migrate-owner',
};
