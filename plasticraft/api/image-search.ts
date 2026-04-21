/* Vercel edge function — image search via Pixabay (free tier, no billing required)
 * Set PIXABAY_API_KEY in Vercel env vars: https://pixabay.com/api/docs/
 * Falls back to empty array if key is not set.
 *
 * IMPORTANT: keep runtime: 'edge' — same reason as identify.ts
 */
declare const process: { env: Record<string, string | undefined> };

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';

  const apiKey = process.env.PIXABAY_API_KEY ?? '';
  if (!apiKey || !q) {
    return Response.json({ url: null });
  }

  const endpoint = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(q)}&image_type=photo&safesearch=true&per_page=3&lang=en`;

  const res = await fetch(endpoint);
  if (!res.ok) return Response.json({ url: null });

  const data = await res.json() as {
    hits?: Array<{ webformatURL?: string }>;
  };

  const url = data.hits?.[0]?.webformatURL ?? null;
  return Response.json({ url });
}
