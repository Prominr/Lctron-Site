const https = require('https');
const { URL } = require('url');

const OWNER_EMAIL = 'omariirvin44@gmail.com';
const STORE = 'premium-users';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function httpsGet(urlStr, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const req = https.request(
      { hostname: u.hostname, path: u.pathname + u.search, method: 'GET', headers },
      (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => resolve({ status: res.statusCode, body }));
      }
    );
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
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

async function blobGet(email) {
  const ctx = getBlobCtx();
  if (!ctx) return null;
  const url = `${ctx.edgeURL}/${ctx.siteID}/${STORE}/${encodeURIComponent(email)}`;
  const res = await httpsGet(url, { Authorization: `Bearer ${ctx.token}` });
  if (res.status === 200) return res.body;
  return null;
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  const email = (event.queryStringParameters?.email || '').toLowerCase().trim();
  if (!email) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'email required' }) };
  }

  if (email === OWNER_EMAIL.toLowerCase()) {
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ premium: true }) };
  }

  try {
    const val = await blobGet(email);
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ premium: val === 'true' }) };
  } catch {
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ premium: false }) };
  }
};
