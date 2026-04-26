const OWNER_EMAIL = 'omariirvin44@gmail.com';
const STORE = 'premium-users';

// Manually granted premium users (fallback if API token not available)
const MANUAL_PREMIUM = [
  'theunthinkable234@gmail.com',
];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function blobGet(email) {
  const token =
    Deno.env.get('NETLIFY_API_TOKEN') ||
    Deno.env.get('Netlify_API_TOKEN') ||
    '';
  const siteId = Deno.env.get('NETLIFY_BLOBS_SITE_ID') || 'ab849e15-836d-4b57-9c2f-347b58a40b78';
  if (!token) return null;
  try {
    const url = `https://api.netlify.com/api/v1/blobs/${siteId}/${STORE}/${encodeURIComponent(email)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
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

  if (email === OWNER_EMAIL.toLowerCase() || MANUAL_PREMIUM.includes(email)) {
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
