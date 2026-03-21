const OWNER_EMAIL = 'omariirvin44@gmail.com';
const STORE = 'premium-users';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function getBlobCtx() {
  const raw = process.env.NETLIFY_BLOBS_CONTEXT;
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}

async function blobGet(email) {
  const ctx = getBlobCtx();
  if (!ctx) return null;
  const url = `${ctx.edgeURL}/${ctx.siteID}/${STORE}/${encodeURIComponent(email)}`;
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${ctx.token}` } });
    if (res.status === 200) return res.text();
  } catch {
    return null;
  }
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = (searchParams.get('email') || '').toLowerCase().trim();

  if (!email) {
    return Response.json({ error: 'email required' }, { status: 400, headers: CORS });
  }

  if (email === OWNER_EMAIL.toLowerCase()) {
    return Response.json({ premium: true }, { headers: CORS });
  }

  try {
    const val = await blobGet(email);
    return Response.json({ premium: val === 'true' }, { headers: CORS });
  } catch {
    return Response.json({ premium: false }, { headers: CORS });
  }
}

export async function OPTIONS() {
  return new Response('', { status: 204, headers: CORS });
}
