/* Diagnostic endpoint — lists available Gemini models for the configured API key */
declare const process: { env: Record<string, string | undefined> };

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? '';
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
  );
  const data = await res.json();
  return Response.json(data);
}
