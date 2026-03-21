const STORE = 'premium-users';

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function verifyStripeSignature(rawBody, sigHeader, secret) {
  try {
    const parts = sigHeader.split(',');
    const ts = parts.find((p) => p.startsWith('t=')).slice(2);
    const v1 = parts.find((p) => p.startsWith('v1=')).slice(3);

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const hmacBytes = await crypto.subtle.sign('HMAC', key, enc.encode(`${ts}.${rawBody}`));
    const hmacHex = Array.from(new Uint8Array(hmacBytes))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return timingSafeEqual(hmacHex, v1);
  } catch {
    return false;
  }
}

function getBlobCtx() {
  const raw = Deno.env.get('NETLIFY_BLOBS_CONTEXT');
  if (!raw) return null;
  try {
    return JSON.parse(atob(raw));
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

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const rawBody = await request.text();
  const sigHeader = request.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (webhookSecret && sigHeader) {
    const valid = await verifyStripeSignature(rawBody, sigHeader, webhookSecret);
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
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
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Storage error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export const config = {
  path: ['/api/stripe-webhook', '/.netlify/functions/stripe-webhook'],
};
