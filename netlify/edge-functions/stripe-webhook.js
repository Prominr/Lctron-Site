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
      'raw', enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const hmacBytes = await crypto.subtle.sign('HMAC', key, enc.encode(`${ts}.${rawBody}`));
    const hmacHex = Array.from(new Uint8Array(hmacBytes))
      .map((b) => b.toString(16).padStart(2, '0')).join('');
    return timingSafeEqual(hmacHex, v1);
  } catch {
    return false;
  }
}

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
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
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
        await blobPut(email, 'true');
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Storage error', detail: e.message }), {
          status: 500, headers: { 'Content-Type': 'application/json' },
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
