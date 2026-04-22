/* Vercel serverless function — reshape illustration via Nano Banana (gemini-2.5-flash-image)
 * Accepts the original captured photo as input and generates an image showing that item
 * reshaped into the suggested recycled product.
 *
 * Uses serverless runtime (NOT edge) — image generation can exceed the 25s edge timeout.
 * Calls Gemini REST API directly (no SDK needed, avoiding ESM/CJS bundling issues).
 */
declare const process: { env: Record<string, string | undefined> };

export const config = { maxDuration: 30 };

interface RequestBody {
  imageDataUrl: string;   // original captured photo (data:image/...;base64,...)
  objectName: string;     // e.g. "bottle cap"
  reshapeTarget: string;  // e.g. "DIY melted plastic keychain craft"
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const body = await req.json() as Partial<RequestBody>;
  const { imageDataUrl, objectName, reshapeTarget } = body;

  if (!reshapeTarget) {
    return Response.json({ url: null });
  }

  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? '';
  if (!apiKey) {
    return Response.json({ url: null });
  }

  const itemDesc = objectName ? `the ${objectName} in this photo` : 'this plastic item';
  const prompt = `Take ${itemDesc} and show it being recycled and creatively reshaped into: ${reshapeTarget}. Draw a child-friendly cartoon illustration. Bright cheerful colors, simple cute style, clear before-and-after transformation. Educational and fun for children aged 6–12.`;

  // Build content parts — include original image if provided
  type Part = { text: string } | { inlineData: { mimeType: string; data: string } };
  const parts: Part[] = [];

  if (imageDataUrl) {
    const mediaMatch = imageDataUrl.match(/^data:(image\/\w+);base64,/);
    const mimeType = mediaMatch?.[1] ?? 'image/jpeg';
    const base64 = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
    parts.push({ inlineData: { mimeType, data: base64 } });
  }

  parts.push({ text: prompt });

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseModalities: ['IMAGE'] },
      }),
    });

    if (!res.ok) {
      return Response.json({ url: null });
    }

    const data = await res.json() as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            inlineData?: { mimeType: string; data: string };
          }>;
        };
      }>;
    };

    const imgPart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!imgPart?.inlineData) {
      return Response.json({ url: null });
    }

    const { mimeType, data: base64 } = imgPart.inlineData;
    return Response.json({ url: `data:${mimeType};base64,${base64}` });
  } catch {
    return Response.json({ url: null });
  }
}
