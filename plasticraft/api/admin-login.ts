import { createHmac } from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';

declare const process: { env: Record<string, string | undefined> };

function json(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let buf = '';
    req.setEncoding('utf8');
    req.on('data', (chunk: string) => { buf += chunk; });
    req.on('end', () => resolve(buf));
    req.on('error', reject);
  });
}

function dayString(offsetMs = 0): string {
  return new Date(Date.now() + offsetMs).toISOString().slice(0, 10);
}

export function makeToken(secret: string, day = dayString()): string {
  return createHmac('sha256', secret).update(day).digest('hex');
}

export function verifyToken(token: string, secret: string): boolean {
  // Accept today's and yesterday's token to avoid midnight lockouts
  return (
    token === makeToken(secret, dayString()) ||
    token === makeToken(secret, dayString(-86_400_000))
  );
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') return res.writeHead(405).end('Method Not Allowed');

  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return json(res, 500, { error: 'ADMIN_PASSWORD env var not set' });

  let body: { password?: string } = {};
  try { body = JSON.parse(await readBody(req)); } catch { /* empty body */ }

  if (!body.password || body.password !== secret) {
    return json(res, 401, { error: 'Invalid password' });
  }

  // Token is valid for ~48 h (today + yesterday accepted on verify)
  const expiresAt = Date.now() + 48 * 60 * 60 * 1000;
  return json(res, 200, { token: makeToken(secret), expiresAt });
}
