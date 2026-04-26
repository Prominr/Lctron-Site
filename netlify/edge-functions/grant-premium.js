const OWNER_EMAIL = 'omariirvin44@gmail.com';
const STORE = 'premium-users';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function blobPut(email, value) {
  const token =
    Deno.env.get('NETLIFY_API_TOKEN') ||
    Deno.env.get('Netlify_API_TOKEN') ||
    '';
  const siteId = Deno.env.get('NETLIFY_BLOBS_SITE_ID') || 'ab849e15-836d-4b57-9c2f-347b58a40b78';
  if (!token) throw new Error('Netlify API token not set');
  const url = `https://api.netlify.com/api/v1/blobs/${siteId}/${STORE}/${encodeURIComponent(email)}`;
  const res = await fetch(url, {
    method: 'PUT',
    body: value,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
  if (!res.ok) throw new Error(`Blob PUT failed: ${res.status}`);
}

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response('', { status: 204, headers: CORS });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST required' }), {
      status: 405, headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }

  const { email, owner, revoke } = body;

  if (!owner || owner.toLowerCase().trim() !== OWNER_EMAIL.toLowerCase()) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }

  const target = (email || '').toLowerCase().trim();
  if (!target) {
    return new Response(JSON.stringify({ error: 'email required' }), {
      status: 400, headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }

  try {
    await blobPut(target, revoke ? 'false' : 'true');
    return new Response(JSON.stringify({ success: true, email: target, premium: !revoke }), {
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }
}

export const config = {
  path: ['/api/grant-premium', '/.netlify/functions/grant-premium'],
};
