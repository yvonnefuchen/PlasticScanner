import type { PlasticId } from '../data/plastics';
import { DEMO_PLASTIC } from '../data/plastics';

export interface ScanResult {
  plasticId: PlasticId;
  confidence: number;
}

/**
 * Identifies the plastic type from a captured camera image.
 *
 * ─── HOW TO REPLACE WITH A REAL AI BACKEND ───────────────────────────────────
 *
 * Option A — Custom REST endpoint:
 *   const res = await fetch('/api/identify', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ image: imageDataUrl }),
 *   });
 *   const { plasticId, confidence } = await res.json();
 *   return { plasticId, confidence };
 *
 * Option B — Claude claude-opus-4-6 Vision (via your own proxy):
 *   Send imageDataUrl as a base64 image_url message to the Messages API.
 *   Parse the response text to extract the plastic type.
 *
 * Option C — Google Cloud Vision / Custom AutoML:
 *   Use the Vision API labelDetection or an AutoML image classification model.
 *   Map the label to a PlasticId.
 *
 * Option D — TensorFlow.js (on-device):
 *   Load a tflite / tfjs model trained on plastic type images.
 *   Run inference on the ImageData from the camera canvas.
 *
 * The `imageDataUrl` argument is a standard `data:image/jpeg;base64,...` string
 * produced by `canvas.toDataURL('image/jpeg', 0.8)`.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function identifyPlastic(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _imageDataUrl: string,
): Promise<ScanResult> {
  // DEMO MODE — simulates a 1.8 s AI processing delay then returns PS.
  // Replace the body of this function with a real API call when ready.
  await new Promise<void>((resolve) => setTimeout(resolve, 1800));
  return { plasticId: DEMO_PLASTIC, confidence: 0.94 };
}
