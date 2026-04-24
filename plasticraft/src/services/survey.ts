export type McChoice = 'A' | 'B' | 'C' | 'D';

export interface PreSurvey {
  q1_cap_disposal: McChoice;   // correct: B
  q2_cap_material: McChoice;   // correct: B (PP)
  q3_why_separate: McChoice;   // correct: B (melting temps)
  q4_japan_bin: McChoice;      // correct: B (プラスチック)
  q5_separate_habit: number;   // 1–5 Likert: Never → Always
  q6_confidence: number;       // 1–5 Likert: Not at all → Very confident
  q7_open: string;
}

export interface PostSurvey {
  // Section 1: Knowledge
  s1q1_main_reason: McChoice;   // correct: B (melting points)
  s1q2_cap_material: McChoice;  // correct: C (PP)
  s1q3_contamination: McChoice; // correct: B (PP melts first)
  s1q4_japan_bin: McChoice;     // correct: B (プラスチック)
  // Section 2: Motivation & Behaviour
  s2q5_plan_separate: number;   // 1–5
  s2q6_confidence: number;      // 1–5
  s2q7_open: string;
  // Section 3: AI Experience
  s3q8_ai_helped: number;       // 1–5
  s3q9_melting_point: number;   // 1–5
  // Section 4: Making Experience
  s4q10_ironing: McChoice;      // correct: A (melting it)
  s4q11_keychain: number;       // 1–5
  s4q12_open: string;
}

export interface SurveySession {
  id: string;
  timestamp: string;
  pre: PreSurvey;
  post: PostSurvey | null;
  photoUrl?: string;
}

const KEY = 'plasticraft_surveys';

function load(): SurveySession[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as SurveySession[];
  } catch {
    return [];
  }
}

function persist(data: SurveySession[]): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function savePre(pre: PreSurvey): string {
  const id = Math.random().toString(36).slice(2, 10);
  const all = load();
  all.push({ id, timestamp: new Date().toISOString(), pre, post: null });
  persist(all);
  return id;
}

export function savePost(id: string, post: PostSurvey): void {
  const all = load();
  const session = all.find(s => s.id === id);
  if (session) {
    session.post = post;
    persist(all);
  }
}

export function savePhoto(id: string, photoUrl: string): void {
  const all = load();
  const session = all.find(s => s.id === id);
  if (session) {
    session.photoUrl = photoUrl;
    persist(all);
  }
}

export function getSessions(): SurveySession[] {
  return load();
}

export function deleteSession(id: string): void {
  persist(load().filter(s => s.id !== id));
}

export function exportCSV(): string {
  const all = load();
  const headers = [
    'id', 'timestamp',
    // Pre
    'pre_q1_cap_disposal', 'pre_q2_cap_material', 'pre_q3_why_separate', 'pre_q4_japan_bin',
    'pre_q5_separate_habit', 'pre_q6_confidence', 'pre_q7_open',
    // Post S1
    'post_s1q1_main_reason', 'post_s1q2_cap_material', 'post_s1q3_contamination', 'post_s1q4_japan_bin',
    // Post S2
    'post_s2q5_plan_separate', 'post_s2q6_confidence', 'post_s2q7_open',
    // Post S3
    'post_s3q8_ai_helped', 'post_s3q9_melting_point',
    // Post S4
    'post_s4q10_ironing', 'post_s4q11_keychain', 'post_s4q12_open',
  ];
  const esc = (v: string | number | undefined) => {
    if (v === undefined || v === null) return '';
    const s = String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = all.map(s => [
    s.id, s.timestamp,
    s.pre.q1_cap_disposal, s.pre.q2_cap_material, s.pre.q3_why_separate, s.pre.q4_japan_bin,
    s.pre.q5_separate_habit, s.pre.q6_confidence, s.pre.q7_open,
    s.post?.s1q1_main_reason, s.post?.s1q2_cap_material, s.post?.s1q3_contamination, s.post?.s1q4_japan_bin,
    s.post?.s2q5_plan_separate, s.post?.s2q6_confidence, s.post?.s2q7_open,
    s.post?.s3q8_ai_helped, s.post?.s3q9_melting_point,
    s.post?.s4q10_ironing, s.post?.s4q11_keychain, s.post?.s4q12_open,
  ].map(esc));
  return [headers, ...rows].map(r => r.join(',')).join('\n');
}
