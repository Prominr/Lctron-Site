const crypto = require('crypto');
const https = require('https');
const { URL } = require('url');

const STORE = 'premium-users';

function verifyStripeSignature(rawBody, sigHeader, secret) {
  try {
    const parts = sigHeader.split(',');
    const ts = parts.find(p => p.startsWith('t=')).slice(2);
    const sig = parts.find(p => p.startsWith('v1=')).slice(3);
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${ts}.${rawBody}`)
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
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

function httpsPut(urlStr, authToken, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const buf = Buffer.from(body, 'utf-8');
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Length': buf.length,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (d) => (data += d));
        res.on('end', () => resolve({ status: res.statusCode }));
      }
    );
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('timeout')); });
    req.write(buf);
    req.end();
  });
}

async function blobSet(key, value) {
  const ctx = getBlobCtx();
  if (!ctx) throw new Error('NETLIFY_BLOBS_CONTEXT not available');
  const url = `${ctx.edgeURL}/${ctx.siteID}/${STORE}/${encodeURIComponent(key)}`;
  const res = await httpsPut(url, ctx.token, value);
  if (res.status >= 400) throw new Error(`Blob PUT failed: ${res.status}`);
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sigHeader = event.headers['stripe-signature'];

  if (webhookSecret && sigHeader) {
    if (!verifyStripeSignature(event.body, sigHeader, webhookSecret)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid Stripe signature' }) };
    }
  }

  let stripeEvent;
  try {
    stripeEvent = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data?.object || {};
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
        return { statusCode: 500, body: JSON.stringify({ error: 'Storage error' }) };
      }
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ received: true }),
  };
};
