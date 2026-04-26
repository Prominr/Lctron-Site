// Returns: { premium: bool, trial: { start, end, daysLeft, active, expired } | null, hasAccess: bool }
//
// `premium`   — true if the user has paid (legacy `premium-users` blob, owner, or manual list)
// `trial`     — computed from the user's `trialStart` or `createdAt` in the `lctron-users` blob
// `hasAccess` — convenience: premium OR trial.active. Clients can use this as the single gate.
const OWNER_EMAIL = 'omariirvin44@gmail.com';
const PREMIUM_STORE = 'premium-users';
const USERS_STORE = 'lctron-users';
const TRIAL_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_SITE_ID = 'ab849e15-836d-4b57-9c2f-347b58a40b78';

// Manually granted premium users (fallback if API token not available)
const MANUAL_PREMIUM = [
  'theunthinkable234@gmail.com',
];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function getToken() {
  return Deno.env.get('NETLIFY_API_TOKEN') || Deno.env.get('Netlify_API_TOKEN') || '';
}
function siteId() {
  return Deno.env.get('NETLIFY_BLOBS_SITE_ID') || DEFAULT_SITE_ID;
}

async function blobGetText(store, email) {
  const token = getToken();
  if (!token) return null;
  try {
    const url = `https://api.netlify.com/api/v1/blobs/${siteId()}/${store}/${encodeURIComponent(email)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 200) return await res.text();
  } catch {}
  return null;
}

function computeTrial(user) {
  if (!user) return null;
  const anchor = user.trialStart || user.createdAt;
  if (!anchor) return null;
  const startMs = Date.parse(anchor);
  if (Number.isNaN(startMs)) return null;
  const endMs = startMs + TRIAL_DAYS * DAY_MS;
  const now = Date.now();
  return {
    start: new Date(startMs).toISOString(),
    end: new Date(endMs).toISOString(),
    daysLeft: Math.max(0, Math.ceil((endMs - now) / DAY_MS)),
    active: now < endMs && !user.isPremium,
    expired: now >= endMs,
  };
}

function respond(body) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
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

  // Owner / manual list short-circuit (no blob lookup needed)
  if (email === OWNER_EMAIL.toLowerCase() || MANUAL_PREMIUM.includes(email)) {
    return respond({ premium: true, trial: null, hasAccess: true });
  }

  // Premium check (legacy blob)
  let premium = false;
  try {
    const val = await blobGetText(PREMIUM_STORE, email);
    premium = val === 'true';
  } catch {}

  // Trial check — look up the user record so we can compute trial from createdAt.
  let trial = null;
  try {
    const userJson = await blobGetText(USERS_STORE, email);
    if (userJson) {
      const user = JSON.parse(userJson);
      // Make sure isPremium-on-user is reflected in trial.active calculation.
      if (premium) user.isPremium = true;
      trial = computeTrial(user);
    }
  } catch {}

  const hasAccess = premium || !!(trial && trial.active);
  return respond({ premium, trial, hasAccess });
}

export const config = {
  path: ['/api/check-premium', '/.netlify/functions/check-premium'],
};
