export type YesNo = 'yes' | 'no';
export type MicrowaveChoice = 'PP' | 'PS' | 'PET' | 'not_sure';
export type MaterialChoice = 'PET' | 'PP' | 'PS';

export interface PreSurvey {
  q1_heard_pp_ps: YesNo;
  q2_same_plastic: YesNo;
  q3_microwave_safe: MicrowaveChoice;
  q4_enjoy_recycling: number; // 1–5
}

export interface PostSurvey {
  s1_q1_straw: MaterialChoice;
  s1_q2_connector: MaterialChoice;
  s1_q3_pvc_microwave: YesNo;
  s2_q1_hint_clarity: number;   // 1–5
  s2_q2_personality: number;    // 1–5
  s3_q1_token: number;          // 1–5
  s3_q2_claw: number;           // 1–5
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

export function exportCSV(): string {
  const all = load();
  const headers = [
    'id', 'timestamp',
    'pre_heard_pp_ps', 'pre_same_plastic', 'pre_microwave', 'pre_enjoy_recycling',
    'post_straw', 'post_connector', 'post_pvc_microwave',
    'post_hint_clarity', 'post_personality',
    'post_token_motivation', 'post_claw_excitement',
  ];
  const rows = all.map(s => [
    s.id, s.timestamp,
    s.pre.q1_heard_pp_ps, s.pre.q2_same_plastic,
    s.pre.q3_microwave_safe, s.pre.q4_enjoy_recycling,
    s.post?.s1_q1_straw ?? '',
    s.post?.s1_q2_connector ?? '',
    s.post?.s1_q3_pvc_microwave ?? '',
    s.post?.s2_q1_hint_clarity ?? '',
    s.post?.s2_q2_personality ?? '',
    s.post?.s3_q1_token ?? '',
    s.post?.s3_q2_claw ?? '',
  ]);
  return [headers, ...rows].map(r => r.join(',')).join('\n');
}
