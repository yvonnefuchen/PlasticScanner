import { GoogleGenAI } from '@google/genai';
import { Redis } from '@upstash/redis';
import type { IncomingMessage, ServerResponse } from 'http';

export const config = { maxDuration: 60 };

declare const process: { env: Record<string, string | undefined> };

type JobState =
  | { status: 'pending'; params: JobParams }
  | { status: 'generating'; params: JobParams; startedAt: number }
  | { status: 'done'; url: string }
  | { status: 'error'; error: string };

interface JobParams {
  imageDataUrl: string | null;
  objectName: string;
  reshapeTarget: string;
  promptStyle?: string;
  lang?: string;
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

    if (job.status === 'done' || job.status === 'error') {
      return json(res, 200, job);
    }
    /* If stuck generating for >90s (prior function timeout), reset to pending */
    if (job.status === 'generating') {
      if (Date.now() - job.startedAt < 90_000) return json(res, 200, { status: 'pending' });
      /* fell through — treat as retriable */
    }

    /* status === 'pending' (or stale generating): this GET triggers generation */
    await redis.set(`job:${jobId}`, { status: 'generating', params: job.params, startedAt: Date.now() }, { ex: 300 });

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
        promptStyle: body.promptStyle,
        lang: body.lang,
      },
    };

    await redis.set(`job:${jobId}`, initialState, { ex: 3600 });
    return json(res, 200, { jobId });
  }

  res.writeHead(405).end('Method Not Allowed');
}

type ImgPart = { inlineData?: { mimeType: string; data: string } };

async function generateImage(params: JobParams): Promise<string> {
  const item = params.objectName;
  const lang = params.lang ?? 'en';

  let prompt: string;
  if (params.promptStyle === 'vehicle') {
    const titleMap: Record<string, { title: string; sub: string }> = {
      zh: { title: `${item}變身未來探索器大挑戰！`,             sub: `分析這個物品⋯發明你的新探索器！` },
      ja: { title: `${item}で未来の探査機を作ろうチャレンジ！`,  sub: `この素材を分析して...新しい探索機を発明しよう！` },
      en: { title: `${item.toUpperCase()} TO FUTURISTIC CRAFT CHALLENGE!`, sub: `Analyze the object... and invent your new explorer!` },
    };
    const { title, sub } = titleMap[lang] ?? titleMap['en'];
    prompt =
      `Create a whimsical, mixed-media blueprint conceptual art piece for a children's maker workshop. ` +
      `Rendered in a cheerful colored-pencil and crayon style; a single clean panel on textured grid paper adorned with hand-drawn stars and planets. ` +
      `At the top, a clearly defined input section shows a specific everyday household item precisely matching the object seen in the provided photo, alongside a stylized arrow. ` +
      `The main central illustration presents a conceptual 'Futuristic [auto-select one of: Mars Rover, Deep-Sea Submarine, Galactic Star-Fighter, or Flying Scooter] Exploration Craft'. ` +
      `This craft's core form is visibly constructed by upcycling the physical structure of the ${item} — e.g. a water bottle's cylinder becomes the hull; a detergent jug's handle becomes the engine intake. ` +
      `Assembled using only kid-friendly crafting materials: colorful washi tape joints, cardboard panels, paper fins, and glue — not technical machining. ` +
      `The object's identifiable features (colors, handles, screw caps) are preserved and repurposed. ` +
      `A large friendly title at the bottom reads: '${title}' with smaller text: '${sub}'`;
  } else {
    prompt =
      `Child-friendly cartoon illustration: a ${item} being recycled and creatively transformed into a ${params.reshapeTarget}. ` +
      `Style: Bright cheerful colors, simple cute 2D vector art, educational and fun. ` +
      `No text, no realistic photos, high contrast.`;
  }

  type Part = { text: string } | { inlineData: { mimeType: string; data: string } };
  const parts: Part[] = [];

  if (params.imageDataUrl) {
    const mimeType = params.imageDataUrl.match(/^data:(image\/\w+);base64,/)?.[1] ?? 'image/jpeg';
    const data = params.imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
    parts.push({ inlineData: { mimeType, data } });
  }
  parts.push({ text: prompt });

  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 50_000);
  let result;
  try {
    result = await ai.models.generateContent({
      model: 'models/gemini-2.0-flash-preview-image-generation',
      config: { responseModalities: ['IMAGE'], abortSignal: abort.signal },
      contents: [{ role: 'user', parts }],
    });
  } finally {
    clearTimeout(timer);
  }

  for (const part of (result.candidates?.[0]?.content?.parts ?? []) as ImgPart[]) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error('AI returned no image part');
}
