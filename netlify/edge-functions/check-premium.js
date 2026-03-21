const OWNER_EMAIL = 'omariirvin44@gmail.com';
const STORE = 'premium-users';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function getBlobCtx() {
  const raw = Deno.env.get('NETLIFY_BLOBS_CONTEXT');
  if (!raw) return null;
  try {
    return JSON.parse(atob(raw));
  } catch {
    return null;
  }
}

async function blobGet(email) {
  const ctx = getBlobCtx();
  if (!ctx) return null;
  try {
    const url = `${ctx.edgeURL}/${ctx.siteID}/${STORE}/${encodeURIComponent(email)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${ctx.token}` } });
    if (res.status === 200) return res.text();
  } catch {
    return null;
  }
  return null;
}

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response('', { status: 204, headers: CORS });
  }

  const { searchParams } = new URL(request.url);
  const email = (searchParams.get('email') || '').toLowerCase().trim();

  if (!email) {
    return new Response(JSON.stringify({ error: 'email required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }

  if (email === OWNER_EMAIL.toLowerCase()) {
    return new Response(JSON.stringify({ premium: true }), {
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }

  try {
    const val = await blobGet(email);
    return new Response(JSON.stringify({ premium: val === 'true' }), {
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  } catch {
    return new Response(JSON.stringify({ premium: false }), {
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }
}

export const config = {
  path: ['/api/check-premium', '/.netlify/functions/check-premium'],
};
