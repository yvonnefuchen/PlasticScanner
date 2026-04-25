import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';

export const config = { maxDuration: 30 };

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

function makeSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function verifyAdminToken(token: string): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret || !token) return false;
  const day = (offsetMs = 0) => new Date(Date.now() + offsetMs).toISOString().slice(0, 10);
  const makeToken = (d: string) => createHmac('sha256', secret).update(d).digest('hex');
  return token === makeToken(day()) || token === makeToken(day(-86_400_000));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const supabase = makeSupabase();

  /* ── GET: list all sessions (admin only) ───────────────────────────────── */
  if (req.method === 'GET') {
    const auth = (req.headers['authorization'] ?? '') as string;
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!verifyAdminToken(token)) return json(res, 401, { error: 'Unauthorized' });

    if (!supabase) return json(res, 503, { error: 'Database not configured' });

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) return json(res, 500, { error: error.message });

    const sessions = data.map((row: Record<string, unknown>) => ({
      id: row['id'],
      timestamp: row['timestamp'],
      surveyVersion: row['survey_version'],
      pre: row['pre'],
      post: row['post'],
      scanPhotoUrl: row['scan_photo_url'],
      carPhotoUrl: row['car_photo_url'],
      reshapeImages: row['reshape_images'],
      location: row['location'],
    }));
    return json(res, 200, sessions);
  }

  /* ── POST: mutate session data ─────────────────────────────────────────── */
  if (req.method === 'POST') {
    let body: Record<string, unknown> = {};
    try { body = JSON.parse(await readBody(req)); } catch { /* empty body */ }

    const action = body['action'] as string | undefined;

    if (!supabase) {
      // No DB configured yet — silently acknowledge so the frontend doesn't error
      return json(res, 200, { ok: true });
    }

    if (action === 'savePre') {
      const { id, timestamp, pre } = body as { id: string; timestamp: string; pre: unknown };
      if (!id || !pre) return json(res, 400, { error: 'Missing id or pre' });
      const location = {
        country: req.headers['x-vercel-ip-country'] as string | undefined,
        city: req.headers['x-vercel-ip-city'] as string | undefined,
        region: req.headers['x-vercel-ip-country-region'] as string | undefined,
      };
      const surveyVersion = (body as { surveyVersion?: number })['surveyVersion'] ?? 1;
      const { error } = await supabase.from('sessions').upsert({ id, timestamp, pre, location, survey_version: surveyVersion });
      if (error) return json(res, 500, { error: error.message });
      return json(res, 200, { ok: true });
    }

    if (action === 'savePost') {
      const { id, post } = body as { id: string; post: unknown };
      if (!id || !post) return json(res, 400, { error: 'Missing id or post' });
      const { error } = await supabase.from('sessions').update({ post }).eq('id', id);
      if (error) return json(res, 500, { error: error.message });
      return json(res, 200, { ok: true });
    }

    if (action === 'saveScanPhoto') {
      const { id, photoUrl } = body as { id: string; photoUrl: string };
      if (!id || !photoUrl) return json(res, 400, { error: 'Missing id or photoUrl' });
      const publicUrl = await uploadImage(supabase, photoUrl, `${id}/scan_photo`);
      if (!publicUrl) return json(res, 500, { error: 'Scan photo upload failed' });
      const { error } = await supabase.from('sessions').update({ scan_photo_url: publicUrl }).eq('id', id);
      if (error) return json(res, 500, { error: error.message });
      return json(res, 200, { ok: true });
    }

    if (action === 'saveCarPhoto') {
      const { id, photoUrl } = body as { id: string; photoUrl: string };
      if (!id || !photoUrl) return json(res, 400, { error: 'Missing id or photoUrl' });
      const publicUrl = await uploadImage(supabase, photoUrl, `${id}/car_photo`);
      if (!publicUrl) return json(res, 500, { error: 'Car photo upload failed' });
      const { error } = await supabase.from('sessions').update({ car_photo_url: publicUrl }).eq('id', id);
      if (error) return json(res, 500, { error: error.message });
      return json(res, 200, { ok: true });
    }

    if (action === 'saveReshapeImage') {
      const { id, label, dataUrl } = body as { id: string; label: string; dataUrl: string };
      if (!id || !label || !dataUrl) return json(res, 400, { error: 'Missing id, label, or dataUrl' });

      const safeName = label.replace(/[^a-zA-Z0-9]/g, '_');
      const publicUrl = await uploadImage(supabase, dataUrl, `${id}/reshape_${safeName}`);
      if (!publicUrl) return json(res, 500, { error: 'Image upload failed' });

      // Append (or replace same label) in reshape_images array
      const { data: current } = await supabase
        .from('sessions')
        .select('reshape_images')
        .eq('id', id)
        .single();

      const existing = (current?.['reshape_images'] as Array<{ label: string; url: string }>) ?? [];
      const updated = [...existing.filter((i: { label: string }) => i.label !== label), { label, url: publicUrl }];

      const { error: updateErr } = await supabase
        .from('sessions')
        .update({ reshape_images: updated })
        .eq('id', id);

      if (updateErr) return json(res, 500, { error: updateErr.message });
      return json(res, 200, { ok: true, url: publicUrl });
    }

    if (action === 'deleteSession') {
      const { id } = body as { id: string };
      if (!id) return json(res, 400, { error: 'Missing id' });
      const { error } = await supabase.from('sessions').delete().eq('id', id);
      if (error) return json(res, 500, { error: error.message });
      return json(res, 200, { ok: true });
    }

    return json(res, 400, { error: `Unknown action: ${action}` });
  }

  res.writeHead(405).end('Method Not Allowed');
}

/* Upload a base64 data URL to the session-assets Storage bucket.
   Returns the public URL on success, null on failure. */
async function uploadImage(
  supabase: ReturnType<typeof createClient>,
  dataUrl: string,
  path: string,  // without extension — derived from mimeType
): Promise<string | null> {
  const mimeType = dataUrl.match(/^data:(image\/\w+);base64,/)?.[1] ?? 'image/jpeg';
  const ext = mimeType.split('/')[1];
  const fullPath = `${path}.${ext}`;
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');

  const { error } = await supabase.storage
    .from('session-assets')
    .upload(fullPath, buffer, { contentType: mimeType, upsert: true });

  if (error) return null;
  const { data } = supabase.storage.from('session-assets').getPublicUrl(fullPath);
  return data.publicUrl;
}
