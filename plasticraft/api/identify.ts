import { GoogleGenAI } from '@google/genai';

type PlasticId = 'PET' | 'HDPE' | 'PP' | 'PS' | 'PVC';
const VALID_IDS: PlasticId[] = ['PET', 'HDPE', 'PP', 'PS', 'PVC'];

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const body = await req.json() as { image?: string };
  if (!body.image) {
    return new Response('Missing image', { status: 400 });
  }

  // Strip data URL prefix to get raw base64
  const base64 = body.image.replace(/^data:image\/\w+;base64,/, '');
  const mediaMatch = body.image.match(/^data:(image\/\w+);base64,/);
  const mimeType = (mediaMatch?.[1] ?? 'image/jpeg') as string;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? '' });

  const result = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          { inlineData: { mimeType, data: base64 } },
          {
            text: `Identify the plastic resin type shown in this image.
Return ONLY valid JSON — no markdown, no explanation:
{"plasticId":"PS","confidence":0.87}

plasticId must be exactly one of: PET HDPE PP PS PVC

Quick visual guide:
- PET (①): clear/transparent bottles, thin film
- HDPE (②): opaque white/coloured jugs, shampoo bottles
- PP  (⑤): semi-translucent caps, straws, food containers, capsule shells
- PS  (⑥): white/foam, brittle, meat trays, styrofoam, Yakult bottles
- PVC (③): clear flexible film, pipes, blister packs

If uncertain, return your best guess with a lower confidence value.`,
          },
        ],
      },
    ],
  });

  const text = (result.text ?? '').trim();
  const parsed = JSON.parse(text) as { plasticId: string; confidence: number };

  if (!(VALID_IDS as string[]).includes(parsed.plasticId)) {
    return new Response(`Unexpected plasticId: ${parsed.plasticId}`, { status: 502 });
  }

  return Response.json({
    plasticId: parsed.plasticId as PlasticId,
    confidence: parsed.confidence,
  });
}
