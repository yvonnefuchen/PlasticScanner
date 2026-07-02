import type { PlasticId } from '../data/plastics';
import { DEMO_PLASTIC } from '../data/plastics';

/* ── Types matching the PlastiCraft AI system prompt output schema ─────── */

export interface ReshapeSuggestion {
  emoji: string;
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
  reasoning_en: string;
  reasoning_ja: string;
  reasoning_zh: string;
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

/* ── Image resize helper ─────────────────────────────────────────────────── */

export function resizeImage(dataUrl: string, maxWidth: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.75));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/* ── API call ─────────────────────────────────────────────────────────────── */

export async function identifyPlastic(imageDataUrl: string): Promise<ScanResult> {
  const small = await resizeImage(imageDataUrl, 800);
  const res = await fetch('/api/identify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: small }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body.slice(0, 300)}`);
  }

  return res.json() as Promise<ScanResult>;
}

export { DEMO_PLASTIC };

/* ── Demo scan data shown when API is unavailable (local dev / fallback) ── */
export const DEMO_SCAN_DATA: ScanData = {
  detected_objects: [
    {
      object_name_en: 'foam tray',
      object_name_ja: 'はっぽう トレイ',
      object_name_zh: '保麗龍托盤',
      material_full_en: 'Polystyrene (PS)',
      material_full_ja: 'ポリスチレン（PS）',
      material_full_zh: '聚苯乙烯（PS）',
      material_code: 'PS',
      confidence: 'high',
      confidence_score: 0.88,
      melting_point_celsius: 240,
      japan_bin_ja: 'プラスチックの ようき・ほうそう',
      japan_bin_en: 'plastics packaging bin',
      label_to_look_for_en: "Look for 'PS' printed on the item",
      label_to_look_for_ja: "しょうひんに『PS』って かいてある ところを さがしてみよう",
      reasoning_en: '[DEMO MODE — Gemini API not connected] White foam texture, lightweight, flat tray shape → Polystyrene (PS). No label visible.',
      reasoning_ja: '[でもモード — Gemini API せつぞくなし] しろい はっぽうの てざわり、かるい、たいらな トレイの かたち → ポリスチレン（PS）。ラベルは みえない。',
      reasoning_zh: '[示範模式 — Gemini API 未連接] 白色泡沫質地、輕盈、平板托盤形狀 → 聚苯乙烯（PS）。未見標籤。',
      character_message_en: "Hi! I am Polystyrene (PS)! I am super light — that is because I am mostly air bubbles! My melting point is 240°C. I am often used as a foam tray for meat or eggs. That is why I go in a different bin from PET bottles!",
      character_message_ja: "こんにちは！ぼくは ポリスチレン（PS）！とっても かるいでしょ？それは ぼくが ほとんど くうきの あわで できているから！とける おんどは 240°Cだよ。おにくや たまごの トレイに よく つかわれてるんだ。だから PETボトルとは べつの ごみばこに いれるんだよ！",
      character_message_zh: "你好！我是聚苯乙烯（PS）！我超級輕盈，因為我幾乎都是氣泡！我的融點是240°C，常被用來做肉品或雞蛋的托盤。這就是為什麼我要和PET瓶分開丟！",
      reshape_suggestions: [
        {
          emoji: '🏎️',
          item_en: 'mini racetrack for toy cars',
          item_ja: 'おもちゃカーのミニコース',
          item_zh: 'PS 托盤迷你跑道',
          image_search_query: 'toy car track ramp DIY foam',
        },
        {
          emoji: '🌱',
          item_en: 'seedling planting tray',
          item_ja: 'うえきの なえ トレイ',
          item_zh: '種植小苗的育苗盤',
          image_search_query: 'seedling tray gardening sprouts',
        },
        {
          emoji: '🎨',
          item_en: 'stamp printing art',
          item_ja: 'スタンプアート',
          item_zh: '泡棉印章藝術',
          image_search_query: 'foam stamp printing art kids craft',
        },
      ],
      separation_lesson_en: 'Polystyrene (PS) softens around 100°C and fully melts at 240°C. Mixed with PET or PP in the recycling factory, it ruins the whole batch. Always check your local bin rules for PS!',
      separation_lesson_ja: 'ポリスチレン（PS）は 100°Cくらいから やわらかく なって、240°Cで すっかり とけます。こうじょうで PETや PPと まざると ぜんぶ だめに なって しまいます。PSは じもとの ルールを たしかめよう！',
      separation_lesson_zh: '聚苯乙烯（PS）在100°C左右開始軟化，240°C完全融化。與PET或PP混入回收廠會污染整批。請查閱當地的PS回收規定！',
    },
  ],
  uncertainty_prompt: null,
  overall_confidence: 'high',
};
