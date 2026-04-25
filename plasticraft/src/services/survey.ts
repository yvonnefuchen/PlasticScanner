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
  p3_ai_interest: number;      // 1–5: AI image → want to learn more about waste and recycling
  p4_ai_clarity: number;       // 1–5: AI image was helpful hint for making car
  p5_ai_achievement: number;   // 1–5: AI image → proud/accomplished seeing trash transformed
  // Action & Overall
  p6_sort_intention: number;   // 1–5: Will sort at home
  p7_fun: number;              // 1–5: How fun was today
}

export interface SurveySession {
  id: string;
  timestamp: string;
  surveyVersion: number;
  pre: PreSurvey;
  post: PostSurvey | null;
  scanPhotoUrl?: string;
  carPhotoUrl?: string;
  reshapeImages?: Array<{ label: string; url: string }>;
  location?: { country?: string; city?: string; region?: string };
}

// Increment this whenever survey questions change. Document the change in db/SURVEY_CHANGELOG.md.
export const SURVEY_VERSION = 1;

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

/* Fire-and-forget API sync — localStorage is always the source of truth */
function apiPost(action: string, payload: Record<string, unknown>): void {
  fetch('/api/survey', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  }).then(res => {
    if (!res.ok) res.json().then(e => console.warn('[survey api]', action, e)).catch(() => {});
  }).catch(() => { /* offline — silent */ });
}

export function savePre(pre: PreSurvey): string {
  const id = Math.random().toString(36).slice(2, 10);
  const timestamp = new Date().toISOString();
  const all = load();
  all.push({ id, timestamp, surveyVersion: SURVEY_VERSION, pre, post: null });
  persist(all);
  apiPost('savePre', { id, timestamp, surveyVersion: SURVEY_VERSION, pre });
  return id;
}

export function savePost(id: string, post: PostSurvey): void {
  const all = load();
  const session = all.find(s => s.id === id);
  if (session) {
    session.post = post;
    persist(all);
    apiPost('savePost', { id, post });
  }
}

export function saveScanPhoto(id: string, photoUrl: string): void {
  const all = load();
  const session = all.find(s => s.id === id);
  if (session) {
    session.scanPhotoUrl = photoUrl;
    persist(all);
    apiPost('saveScanPhoto', { id, photoUrl });
  }
}

export function saveCarPhoto(id: string, photoUrl: string): void {
  const all = load();
  const session = all.find(s => s.id === id);
  if (session) {
    session.carPhotoUrl = photoUrl;
    persist(all);
    apiPost('saveCarPhoto', { id, photoUrl });
  }
}

export function saveReshapeImage(id: string, label: string, url: string): void {
  const all = load();
  const session = all.find(s => s.id === id);
  if (session) {
    const existing = session.reshapeImages ?? [];
    // Replace if same label already stored, otherwise append
    const updated = [...existing.filter(i => i.label !== label), { label, url }];
    session.reshapeImages = updated;
    persist(all);
    apiPost('saveReshapeImage', { id, label, dataUrl: url });
  }
}


export function getSessions(): SurveySession[] {
  return load();
}

export async function getSessionsFromApi(token: string): Promise<SurveySession[] | null> {
  try {
    const res = await fetch('/api/survey', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json() as SurveySession[];
  } catch {
    return null;
  }
}

export function deleteSession(id: string): void {
  persist(load().filter(s => s.id !== id));
  apiPost('deleteSession', { id });
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
    // Meta
    'survey_version', 'location_country', 'location_city',
    // Photos
    'scan_photo', 'car_photo', 'reshape_images_count',
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
    s.surveyVersion ?? 1, s.location?.country ?? '', s.location?.city ?? '',
    s.scanPhotoUrl ? '[photo]' : '',
    s.carPhotoUrl ? '[photo]' : '',
    s.reshapeImages?.length ?? 0,
  ].map(esc));
  return [headers, ...rows].map(r => r.join(',')).join('\n');
}
