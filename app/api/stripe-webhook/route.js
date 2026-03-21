import { createHmac, timingSafeEqual } from 'crypto';

const STORE = 'premium-users';

function verifyStripeSignature(rawBody, sigHeader, secret) {
  try {
    const parts = sigHeader.split(',');
    const ts = parts.find((p) => p.startsWith('t=')).slice(2);
    const sig = parts.find((p) => p.startsWith('v1=')).slice(3);
    const expected = createHmac('sha256', secret)
      .update(`${ts}.${rawBody}`)
      .digest('hex');
    return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

function getBlobCtx() {
  const raw = process.env.NETLIFY_BLOBS_CONTEXT;
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}

async function blobSet(key, value) {
  const ctx = getBlobCtx();
  if (!ctx) throw new Error('NETLIFY_BLOBS_CONTEXT not available');
  const url = `${ctx.edgeURL}/${ctx.siteID}/${STORE}/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'PUT',
    body: value,
    headers: {
      Authorization: `Bearer ${ctx.token}`,
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
  if (!res.ok) throw new Error(`Blob PUT failed: ${res.status}`);
}

export async function POST(request) {
  const rawBody = await request.text();
  const sigHeader = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (webhookSecret && sigHeader) {
    if (!verifyStripeSignature(rawBody, sigHeader, webhookSecret)) {
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data?.object || {};
    const email = (
      session.customer_email ||
      session.customer_details?.email ||
      ''
    ).toLowerCase().trim();

    if (email) {
      try {
        await blobSet(email, 'true');
        console.log(`[Lctron] Premium activated: ${email}`);
      } catch (e) {
        console.error(`[Lctron] Blob store error: ${e.message}`);
        return Response.json({ error: 'Storage error' }, { status: 500 });
      }
    }
  }

  return Response.json({ received: true });
}
