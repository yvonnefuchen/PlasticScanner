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
  reasoning: string;
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

/* ── Demo scan data shown when API is unavailable (local dev / fallback) ── */
export const DEMO_SCAN_DATA: ScanData = {
  detected_objects: [
    {
      object_name_en: 'foam tray',
      object_name_ja: '発泡トレイ',
      object_name_zh: '保麗龍托盤',
      material_full_en: 'Polystyrene (PS)',
      material_full_ja: 'ポリスチレン（PS）',
      material_full_zh: '聚苯乙烯（PS）',
      material_code: 'PS',
      confidence: 'high',
      confidence_score: 0.88,
      melting_point_celsius: 240,
      japan_bin_ja: 'プラスチック製容器包装',
      japan_bin_en: 'plastics packaging bin',
      label_to_look_for_en: "Look for 'PS' printed on the item",
      label_to_look_for_ja: "商品に『PS』と書いてある部分を探してみよう",
      reasoning: '[DEMO MODE — Gemini API not connected] White foam texture, lightweight, flat tray shape → Polystyrene (PS). No label visible.',
      character_message_en: "Hi! I am Polystyrene (PS)! I am super light — that is because I am mostly air bubbles! My melting point is 240°C. I am often used as a foam tray for meat or eggs. That is why I go in a different bin from PET bottles!",
      character_message_ja: "こんにちは！ぼくはポリスチレン（PS）！とっても軽いでしょ？それはぼくがほとんど空気のあわでできているから！融点は240°Cだよ。お肉や卵のトレイによく使われてるんだ。だからPETボトルとは別のゴミ箱に入れるんだよ！",
      character_message_zh: "你好！我是聚苯乙烯（PS）！我超級輕盈，因為我幾乎都是氣泡！我的融點是240°C，常被用來做肉品或雞蛋的托盤。這就是為什麼我要和PET瓶分開丟！",
      reshape_suggestions: [
        {
          item_en: 'mini racetrack for toy cars',
          item_ja: 'おもちゃカーのミニコース',
          item_zh: 'PS 托盤迷你跑道',
          image_search_query: 'toy car track ramp DIY foam',
        },
        {
          item_en: 'seedling planting tray',
          item_ja: '植木の苗トレイ',
          item_zh: '種植小苗的育苗盤',
          image_search_query: 'seedling tray gardening sprouts',
        },
        {
          item_en: 'stamp printing art',
          item_ja: 'スタンプアート',
          item_zh: '泡棉印章藝術',
          image_search_query: 'foam stamp printing art kids craft',
        },
      ],
      separation_lesson_en: 'Polystyrene (PS) softens around 100°C and fully melts at 240°C. Mixed with PET or PP in the recycling factory, it ruins the whole batch. Always check your local bin rules for PS!',
      separation_lesson_ja: 'ポリスチレン（PS）は100°C頃から柔らかくなり、240°Cで完全に溶けます。工場でPETやPPと混ざると全部だめになってしまいます。PSは地域のルールを確認しよう！',
      separation_lesson_zh: '聚苯乙烯（PS）在100°C左右開始軟化，240°C完全融化。與PET或PP混入回收廠會污染整批。請查閱當地的PS回收規定！',
    },
  ],
  uncertainty_prompt: null,
  overall_confidence: 'high',
};
