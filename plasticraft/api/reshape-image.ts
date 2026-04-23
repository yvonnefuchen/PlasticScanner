import { GoogleGenAI } from '@google/genai';
import { Redis } from '@upstash/redis';
import type { IncomingMessage, ServerResponse } from 'http';

export const config = { maxDuration: 60 };

declare const process: { env: Record<string, string | undefined> };

type JobState =
  | { status: 'pending'; params: JobParams }
  | { status: 'generating' }
  | { status: 'done'; url: string }
  | { status: 'error'; error: string };

interface JobParams {
  imageDataUrl: string | null;
  objectName: string;
  reshapeTarget: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? '' });
const redis = Redis.fromEnv();

function json(res: ServerResponse, status: number, data: unknown) {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(body);
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

function getQuery(req: IncomingMessage): Record<string, string> {
  const qIndex = (req.url ?? '').indexOf('?');
  if (qIndex === -1) return {};
  return Object.fromEntries(new URLSearchParams((req.url ?? '').slice(qIndex + 1)));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  /* ── GET: check status or trigger generation ───────────────────────────── */
  if (req.method === 'GET') {
    const { jobId } = getQuery(req);
    if (!jobId) return json(res, 400, { error: 'Missing jobId' });

    const job = await redis.get<JobState>(`job:${jobId}`);
    if (!job) return json(res, 404, { error: 'Job not found' });

    if (job.status === 'done' || job.status === 'error' || job.status === 'generating') {
      return json(res, 200, job);
    }

    /* status === 'pending': this GET triggers generation */
    await redis.set(`job:${jobId}`, { status: 'generating' }, { ex: 300 });

    try {
      const imageUrl = await generateImage(job.params);
      const finalState: JobState = { status: 'done', url: imageUrl };
      await redis.set(`job:${jobId}`, finalState, { ex: 3600 });
      return json(res, 200, finalState);
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Unknown generation error';
      const errorState: JobState = { status: 'error', error };
      await redis.set(`job:${jobId}`, errorState, { ex: 300 });
      return json(res, 200, errorState);
    }
  }

  /* ── POST: store params, return jobId immediately ──────────────────────── */
  if (req.method === 'POST') {
    let body: Partial<JobParams> = {};
    try { body = JSON.parse(await readBody(req)); } catch { /* empty body */ }
    if (!body.reshapeTarget) return json(res, 400, { error: 'Missing reshapeTarget' });

    const jobId = crypto.randomUUID();
    const initialState: JobState = {
      status: 'pending',
      params: {
        imageDataUrl: body.imageDataUrl ?? null,
        objectName: body.objectName ?? 'plastic item',
        reshapeTarget: body.reshapeTarget,
      },
    };

    await redis.set(`job:${jobId}`, initialState, { ex: 3600 });
    return json(res, 200, { jobId });
  }

  res.writeHead(405).end('Method Not Allowed');
}

type ImgPart = { inlineData?: { mimeType: string; data: string } };

async function generateImage(params: JobParams): Promise<string> {
  const prompt =
    `Child-friendly cartoon illustration: a ${params.objectName} being recycled and creatively transformed into a ${params.reshapeTarget}. ` +
    `Style: Bright cheerful colors, simple cute 2D vector art, educational and fun. ` +
    `No text, no realistic photos, high contrast.`;

  type Part = { text: string } | { inlineData: { mimeType: string; data: string } };
  const parts: Part[] = [];

  if (params.imageDataUrl) {
    const mimeType = params.imageDataUrl.match(/^data:(image\/\w+);base64,/)?.[1] ?? 'image/jpeg';
    const data = params.imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
    parts.push({ inlineData: { mimeType, data } });
  }
  parts.push({ text: prompt });

  const result = await ai.models.generateContent({
    model: 'models/gemini-3.1-flash-image-preview',
    config: { responseModalities: ['IMAGE'] },
    contents: [{ role: 'user', parts }],
  });

  for (const part of (result.candidates?.[0]?.content?.parts ?? []) as ImgPart[]) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error('AI returned no image part');
}
