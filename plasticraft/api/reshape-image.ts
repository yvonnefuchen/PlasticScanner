/* Vercel serverless — reshape illustration via gemini-2.0-flash-preview-image-generation
 * Generates a child-friendly cartoon showing the plastic item reshaped into a new product.
 * Text-only prompt (no source image) keeps payload small and avoids base64 memory spikes.
 * Returns { url: string } on success, { url: null, error: string } on failure — never throws.
 */
declare const process: { env: Record<string, string | undefined> };

export const config = { maxDuration: 45 };

export default async function handler(req: Request): Promise<Response> {
  // Top-level guard — nothing escapes as an unhandled exception
  try {
    if (req.method !== 'POST') {
      return Response.json({ url: null, error: 'Method Not Allowed' }, { status: 405 });
    }

    let body: { imageDataUrl?: string; objectName?: string; reshapeTarget?: string } = {};
    try {
      body = await req.json() as typeof body;
    } catch (e) {
      return Response.json({ url: null, error: `Bad request body: ${String(e).slice(0, 80)}` }, { status: 400 });
    }

    const { imageDataUrl, objectName, reshapeTarget } = body;
    if (!reshapeTarget) {
      return Response.json({ url: null, error: 'Missing reshapeTarget' });
    }

    const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? '';
    if (!apiKey) {
      return Response.json({ url: null, error: 'No API key configured' });
    }

    const item = objectName ?? 'plastic item';
    const prompt =
      `Child-friendly cartoon illustration: a ${item} being recycled and creatively transformed into ${reshapeTarget}. ` +
      `Bright cheerful colors, simple cute style, before-and-after transformation visible. ` +
      `Educational and fun for children aged 6–12. No text in the image.`;

    // Build parts — include original photo if provided
    type Part = { text: string } | { inlineData: { mimeType: string; data: string } };
    const parts: Part[] = [];
    if (imageDataUrl) {
      const mediaMatch = imageDataUrl.match(/^data:(image\/\w+);base64,/);
      const mimeType = mediaMatch?.[1] ?? 'image/jpeg';
      const base64 = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
      parts.push({ inlineData: { mimeType, data: base64 } });
    }
    parts.push({ text: prompt });

    const model = 'gemini-2.5-flash-image';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    console.log('[reshape-image] calling', model, '| target:', reshapeTarget, '| hasImage:', !!imageDataUrl);

    const geminiRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseModalities: ['IMAGE'] },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text().catch(() => '');
      console.error('[reshape-image] Gemini HTTP', geminiRes.status, errText.slice(0, 200));
      return Response.json({ url: null, error: `Gemini ${geminiRes.status}: ${errText.slice(0, 120)}` });
    }

    const data = await geminiRes.json() as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ inlineData?: { mimeType: string; data: string }; text?: string }>;
        };
      }>;
    };

    const imgPart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!imgPart?.inlineData) {
      const textSnippet = data.candidates?.[0]?.content?.parts
        ?.map(p => p.text).filter(Boolean).join(' ')?.slice(0, 100) ?? 'none';
      console.warn('[reshape-image] no inlineData. text:', textSnippet);
      return Response.json({ url: null, error: `no image returned. model text: ${textSnippet}` });
    }

    const { mimeType, data: b64 } = imgPart.inlineData;
    console.log('[reshape-image] ✓ image generated mimeType:', mimeType, 'b64 len:', b64.length);
    return Response.json({ url: `data:${mimeType};base64,${b64}` });

  } catch (e) {
    // Absolute last resort — should never reach here
    console.error('[reshape-image] unhandled exception:', e);
    return Response.json({ url: null, error: `Unhandled: ${String(e).slice(0, 120)}` }, { status: 500 });
  }
}
