import type { PlasticId } from '../data/plastics';
import { DEMO_PLASTIC } from '../data/plastics';

export interface ScanResult {
  plasticId: PlasticId;
  confidence: number;
}

/**
 * Identifies the plastic type from a captured camera image.
 *
 * Calls the /api/identify Vercel edge function which uses Claude Vision
 * (claude-opus-4-6) to analyse the image and return the resin type.
 *
 * On any network or API error the caller (App.tsx) falls back to DEMO_PLASTIC,
 * so the quiz flow always continues regardless.
 *
 * To replace with a different backend: change the fetch URL or body shape,
 * keeping the return type { plasticId: PlasticId; confidence: number } intact.
 */
export async function identifyPlastic(imageDataUrl: string): Promise<ScanResult> {
  const res = await fetch('/api/identify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageDataUrl }),
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  const { plasticId, confidence } = (await res.json()) as ScanResult;
  return { plasticId, confidence };
}

/** Fallback used when the API is unavailable (local dev without vercel dev). */
export { DEMO_PLASTIC };
