// ─── Send Email via Gmail SMTP (Deno edge function) ──────────────────────────
// Uses raw TLS connection to Gmail SMTP to send password reset emails.
// Requires LCTRON_EMAIL_APP_PASSWORD env var.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const SMTP_HOST = 'smtp.gmail.com';
const SMTP_PORT = 465;
const FROM_EMAIL = 'lctronop234@gmail.com';
const FROM_NAME = 'Lctron Optimizer';

function base64Encode(str) {
  return btoa(str);
}

function buildMimeMessage(to, subject, textBody, htmlBody) {
  const boundary = '----=_Part_' + Date.now();
  const lines = [
    `From: "${FROM_NAME}" <${FROM_EMAIL}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    textBody,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`,
    '',
  ];
  return lines.join('\r\n');
}

/** Read one SMTP reply (may be multiple lines ending with "NNN " line). */
async function readSmtpReply(reader, decoder, pending) {
  const lines = [];
  for (;;) {
    let idx = pending.buf.indexOf('\r\n');
    while (idx === -1) {
      const { value, done } = await reader.read();
      if (done) throw new Error('SMTP connection closed unexpectedly');
      pending.buf += decoder.decode(value, { stream: true });
      idx = pending.buf.indexOf('\r\n');
    }
    const line = pending.buf.slice(0, idx);
    pending.buf = pending.buf.slice(idx + 2);
    if (line.length < 4) continue;
    lines.push(line);
    if (line[3] === ' ') break;
  }
  return lines.join('\r\n');
}

async function sendEmailViaSMTP(to, subject, textBody, htmlBody) {
  const appPassword = Deno.env.get('LCTRON_EMAIL_APP_PASSWORD');
  if (!appPassword) throw new Error('LCTRON_EMAIL_APP_PASSWORD not set');

  const conn = await Deno.connectTls({ hostname: SMTP_HOST, port: SMTP_PORT });
  const reader = conn.readable.getReader();
  const writer = conn.writable.getWriter();
  const decoder = new TextDecoder();
  const pending = { buf: '' };

  try {
    async function expectReply(allowedCodes) {
      const text = await readSmtpReply(reader, decoder, pending);
      const parts = text.split('\r\n').filter((l) => l.length > 0);
      const lastLine = parts[parts.length - 1] || '';
      const code = lastLine.slice(0, 3);
      if (!allowedCodes.includes(code)) {
        throw new Error('Unexpected SMTP reply: ' + lastLine);
      }
      return text;
    }

    await expectReply(['220']);

    const enc = new TextEncoder();
    await writer.write(enc.encode('EHLO lctron.app\r\n'));
    await expectReply(['250']);

    await writer.write(enc.encode('AUTH LOGIN\r\n'));
    await expectReply(['334']);

    await writer.write(enc.encode(base64Encode(FROM_EMAIL) + '\r\n'));
    await expectReply(['334']);

    await writer.write(enc.encode(base64Encode(appPassword) + '\r\n'));
    await expectReply(['235']);

    await writer.write(enc.encode(`MAIL FROM:<${FROM_EMAIL}>\r\n`));
    await expectReply(['250']);

    await writer.write(enc.encode(`RCPT TO:<${to}>\r\n`));
    await expectReply(['250', '251']);

    await writer.write(enc.encode('DATA\r\n'));
    await expectReply(['354']);

    const mimeMsg = buildMimeMessage(to, subject, textBody, htmlBody);
    await writer.write(enc.encode(mimeMsg + '\r\n.\r\n'));
    await expectReply(['250']);

    await writer.write(enc.encode('QUIT\r\n'));
  } finally {
    try {
      reader.releaseLock();
    } catch {
      /* ignore */
    }
    try {
      writer.releaseLock();
    } catch {
      /* ignore */
    }
    try {
      conn.close();
    } catch {
      /* ignore */
    }
  }
}

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response('', { status: 204, headers: CORS });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST required' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }

  const { to, code } = body;
  if (!to || !code) {
    return new Response(JSON.stringify({ error: 'to and code required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }

  const subject = 'Lctron Password Reset Code';
  const textBody = `Your Lctron password reset code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.`;
  const htmlBody = `<div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:24px;background:#0a0a0a;border:1px solid #222;border-radius:12px;color:#fff"><h2 style="color:#e03030;margin:0 0 16px">Password Reset</h2><p style="color:#aaa;font-size:14px">Your verification code is:</p><div style="font-size:32px;font-weight:800;letter-spacing:8px;text-align:center;padding:20px;background:#111;border-radius:8px;margin:16px 0;color:#e03030">${code}</div><p style="color:#666;font-size:12px">This code expires in 10 minutes. If you didn't request a password reset, you can safely ignore this email.</p><p style="color:#444;font-size:11px;margin-top:20px">— Lctron Optimizer</p></div>`;

  try {
    await sendEmailViaSMTP(to, subject, textBody, htmlBody);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }
}

export const config = {
  path: ['/api/send-email', '/.netlify/functions/send-email'],
};
