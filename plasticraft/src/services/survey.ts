export type McChoice = 'A' | 'B' | 'C' | 'D';

export interface PreSurvey {
  q1_sort_habit: number;     // 1–5 Likert: Never → Always
  q2_seen_marks: McChoice;   // A=Yes, B=Not yet
  q3_cap_behavior: McChoice; // A=Keep on, B=Separate, C=Not sure
}

export interface PostSurvey {
  // Knowledge
  p1_cap_material: McChoice;   // A=PET, B=PP  ← correct: B
  p2_mix_result: McChoice;     // A=Stronger, B=Breaks  ← correct: B
  // AI Image Experience
  p3_ai_interest: number;      // 1–5: AI image → want to learn more about material
  p4_ai_clarity: number;       // 1–5: AI image → sorting felt easier to understand
  p5_ai_achievement: number;   // 1–5: AI image → proud/accomplished seeing trash transformed
  // Action & Overall
  p6_sort_intention: number;   // 1–5: Will sort at home
  p7_fun: number;              // 1–5: How fun was today
}

export interface SurveySession {
  id: string;
  timestamp: string;
  pre: PreSurvey;
  post: PostSurvey | null;
  photoUrl?: string;
  aiImageUrl?: string;
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

export function saveAiImage(id: string, aiImageUrl: string): void {
  const all = load();
  const session = all.find(s => s.id === id);
  if (session && !session.aiImageUrl) {
    session.aiImageUrl = aiImageUrl;
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
    'pre_q1_sort_habit', 'pre_q2_seen_marks', 'pre_q3_cap_behavior',
    // Post Knowledge
    'post_p1_cap_material', 'post_p2_mix_result',
    // Post AI
    'post_p3_ai_interest', 'post_p4_ai_clarity', 'post_p5_ai_achievement',
    // Post Action
    'post_p6_sort_intention', 'post_p7_fun',
  ];
  const esc = (v: string | number | undefined) => {
    if (v === undefined || v === null) return '';
    const s = String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = all.map(s => [
    s.id, s.timestamp,
    s.pre.q1_sort_habit, s.pre.q2_seen_marks, s.pre.q3_cap_behavior,
    s.post?.p1_cap_material, s.post?.p2_mix_result,
    s.post?.p3_ai_interest, s.post?.p4_ai_clarity, s.post?.p5_ai_achievement,
    s.post?.p6_sort_intention, s.post?.p7_fun,
  ].map(esc));
  return [headers, ...rows].map(r => r.join(',')).join('\n');
}
