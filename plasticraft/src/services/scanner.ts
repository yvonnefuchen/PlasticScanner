import type { PlasticId } from '../data/plastics';
import { DEMO_PLASTIC } from '../data/plastics';

/* ── Types matching the PlastiCraft AI system prompt output schema ─────── */

export interface ReshapeSuggestion {
  item_en: string;
  item_ja: string;
  item_zh: string;
  image_search_query: string;
}

export interface DetectedObject {
  object_name_en: string;
  object_name_ja: string;
  object_name_zh: string;
  material_full_en: string;
  material_full_ja: string;
  material_full_zh: string;
  material_code: string;
  confidence: 'high' | 'medium' | 'low';
  confidence_score: number;
  melting_point_celsius: number;
  japan_bin_ja: string;
  japan_bin_en: string;
  label_to_look_for_en: string;
  label_to_look_for_ja: string;
  character_message_en: string;
  character_message_ja: string;
  character_message_zh: string;
  reshape_suggestions: ReshapeSuggestion[];
  separation_lesson_en: string;
  separation_lesson_ja: string;
  separation_lesson_zh: string;
}

export interface UncertaintyPrompt {
  message_en: string;
  message_ja: string;
  message_zh: string;
  look_for_en: string;
  look_for_ja: string;
  look_for_zh: string;
}

export interface ScanData {
  detected_objects: DetectedObject[];
  uncertainty_prompt: UncertaintyPrompt | null;
  overall_confidence: 'high' | 'medium' | 'low';
}

export interface ScanResult {
  plasticId: PlasticId;
  confidence: number;
  scanData?: ScanData | null;
}

/* ── API call ─────────────────────────────────────────────────────────────── */

export async function identifyPlastic(imageDataUrl: string): Promise<ScanResult> {
  const res = await fetch('/api/identify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageDataUrl }),
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  return res.json() as Promise<ScanResult>;
}

export { DEMO_PLASTIC };
