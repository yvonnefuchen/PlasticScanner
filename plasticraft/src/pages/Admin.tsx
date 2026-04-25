import { useEffect, useState } from 'react';
import { getSessions, getSessionsFromApi, exportCSV, deleteSession, type SurveySession } from '../services/survey';

/* ── Admin auth ─────────────────────────────────────────────────────────── */
const TOKEN_KEY = 'plasticraft_admin_token';

interface StoredToken { token: string; expiresAt: number }

function loadToken(): string | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const stored: StoredToken = JSON.parse(raw);
    if (Date.now() > stored.expiresAt) { localStorage.removeItem(TOKEN_KEY); return null; }
    return stored.token;
  } catch { return null; }
}

async function login(password: string): Promise<string | null> {
  const res = await fetch('/api/admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) return null;
  const { token, expiresAt } = await res.json();
  localStorage.setItem(TOKEN_KEY, JSON.stringify({ token, expiresAt }));
  return token;
}

function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const token = await login(pw);
    setLoading(false);
    if (token) { onAuth(); }
    else { setError('Incorrect password'); setPw(''); }
  };

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0d1117',
    }}>
      <form onSubmit={submit} style={{
        background: '#161b22', border: '1px solid rgba(240,244,255,0.1)', borderRadius: 16,
        padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 280,
      }}>
        <h2 style={{ margin: 0, color: '#f0f4ff', fontSize: '1.1rem', textAlign: 'center' }}>
          🔒 PlastiCraft Admin
        </h2>
        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          autoFocus
          style={{
            background: '#0d1117', border: '1px solid rgba(240,244,255,0.15)', borderRadius: 8,
            color: '#f0f4ff', padding: '0.6rem 0.9rem', fontSize: '1rem', outline: 'none',
          }}
        />
        {error && <span style={{ color: '#ef5350', fontSize: '0.85rem', textAlign: 'center' }}>{error}</span>}
        <button
          type="submit"
          disabled={loading || !pw}
          style={{
            background: loading || !pw ? 'rgba(100,210,255,0.2)' : 'rgba(100,210,255,0.85)',
            color: '#0d1117', border: 'none', borderRadius: 8, padding: '0.65rem',
            fontWeight: 700, fontSize: '1rem', cursor: loading || !pw ? 'default' : 'pointer',
          }}
        >
          {loading ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function avg(nums: number[]): string {
  if (nums.length === 0) return '—';
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
}

function stars(n: number | undefined): string {
  if (!n) return '—';
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function Cell({ v, correct }: { v: string | undefined; correct?: boolean | null }) {
  if (!v) return <td className="cell-empty">—</td>;
  if (correct === true) return <td className="cell-correct">{v} ✓</td>;
  if (correct === false) return <td className="cell-wrong">{v} ✗</td>;
  return <td>{v}</td>;
}

function downloadCSV() {
  const csv = exportCSV();
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `plasticraft-survey-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Main ────────────────────────────────────────────────────────────────── */

export default function Admin() {
  const [authed, setAuthed] = useState(() => loadToken() !== null);
  const [sessions, setSessions] = useState<SurveySession[]>(() => getSessions());
  const [fetching, setFetching] = useState(false);
  const [imgStyle, setImgStyle] = useState<'auto' | 'vehicle'>(
    () => (localStorage.getItem('plasticraft_img_style') as 'auto' | 'vehicle') ?? 'auto'
  );
  const [appMode, setAppMode] = useState<'production' | 'testing'>(
    () => (localStorage.getItem('plasticraft_app_mode') as 'production' | 'testing') ?? 'production'
  );

  useEffect(() => {
    if (!authed) return;
    setFetching(true);
    const token = loadToken();
    (token ? getSessionsFromApi(token) : Promise.resolve(null)).then(data => {
      setSessions(data ?? getSessions());
      setFetching(false);
    });
  }, [authed]);

  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} />;

  const refresh = () => {
    setFetching(true);
    const token = loadToken();
    (token ? getSessionsFromApi(token) : Promise.resolve(null)).then(data => {
      setSessions(data ?? getSessions());
      setFetching(false);
    });
  };

  const handleDelete = async (id: string) => {
    deleteSession(id);
    setSessions(s => s.filter(x => x.id !== id));
  };

  const handleStyleChange = (s: 'auto' | 'vehicle') => {
    localStorage.setItem('plasticraft_img_style', s);
    setImgStyle(s);
  };
  const handleModeChange = (m: 'production' | 'testing') => {
    localStorage.setItem('plasticraft_app_mode', m);
    setAppMode(m);
  };

  const completed = sessions.filter(s => s.post !== null);
  const q1Ratings = sessions.map(s => s.pre.q1_sort_habit).filter(Boolean);
  const p3Ratings = completed.map(s => s.post!.p3_ai_interest);
  const p4Ratings = completed.map(s => s.post!.p4_ai_clarity);
  const p5Ratings = completed.map(s => s.post!.p5_ai_achievement);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>🧪 PlastiCraft Survey Results</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="admin-csv-btn" onClick={refresh} disabled={fetching}>
            {fetching ? '⏳' : '↻'} Refresh
          </button>
          <button className="admin-csv-btn" onClick={downloadCSV}>⬇ Export CSV</button>
          <button className="admin-csv-btn" onClick={() => { localStorage.removeItem(TOKEN_KEY); setAuthed(false); }}>
            🔒 Sign out
          </button>
        </div>
      </div>

      {/* Image generation mode toggle */}
      <div className="admin-settings">
        <span className="admin-settings__label">🖼️ Image Generation Mode</span>
        <div className="admin-settings__btns">
          {(['auto', 'vehicle'] as const).map(s => (
            <button
              key={s}
              className={`admin-settings__btn${imgStyle === s ? ' admin-settings__btn--active' : ''}`}
              onClick={() => handleStyleChange(s)}
            >
              {s === 'auto' ? '🎴 Automatic suggestions' : '🚀 Reshape to futuristic vehicle'}
            </button>
          ))}
        </div>
      </div>

      {/* App mode toggle */}
      <div className="admin-settings">
        <span className="admin-settings__label">⚙️ App Mode</span>
        <div className="admin-settings__btns">
          {(['production', 'testing'] as const).map(m => (
            <button
              key={m}
              className={`admin-settings__btn${appMode === m ? ' admin-settings__btn--active' : ''}`}
              onClick={() => handleModeChange(m)}
            >
              {m === 'production' ? '🏭 Production' : '🔬 Testing'}
            </button>
          ))}
        </div>
        {appMode === 'testing' && (
          <span style={{ fontSize: '0.75rem', color: '#FFAB40', marginLeft: 4 }}>
            Skips surveys — jumps straight to scanner
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="admin-stats">
        {[
          { label: 'Total Sessions', value: sessions.length },
          { label: 'Completed Post-Survey', value: `${completed.length} (${sessions.length ? Math.round(completed.length / sessions.length * 100) : 0}%)` },
          { label: 'Pre: Avg Sort Habit 😊', value: avg(q1Ratings) },
          { label: 'Post: Avg AI Interest 😊', value: avg(p3Ratings) },
          { label: 'Post: Avg AI Hint 😊', value: avg(p4Ratings) },
          { label: 'Post: Avg AI Achievement 😊', value: avg(p5Ratings) },
        ].map(s => (
          <div key={s.label} className="admin-stat">
            <div className="admin-stat__value">{s.value}</div>
            <div className="admin-stat__label">{s.label}</div>
          </div>
        ))}
      </div>

      {fetching && sessions.length === 0 ? (
        <div className="admin-empty" style={{ opacity: 0.5 }}>Loading…</div>
      ) : sessions.length === 0 ? (
        <div className="admin-empty">No survey responses yet. Play the game to collect data!</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>#</th>
                <th>Time</th>
                <th>V</th>
                <th>Location</th>
                <th>Scan Photo</th>
                <th>Car Photo</th>
                <th>AI Images</th>
                {/* Pre */}
                <th>Pre Q1 Sort 😊</th>
                <th>Pre Q2 Marks</th>
                <th>Pre Q3 Cap</th>
                {/* Post Knowledge */}
                <th>Post P1 Mat</th>
                <th>Post P2 Mix</th>
                {/* Post AI */}
                <th>Post P3 AI Interest 😊</th>
                <th>Post P4 AI Hint 😊</th>
                <th>Post P5 AI Proud 😊</th>
                {/* Post Action */}
                <th>Post P6 Sort 😊</th>
                <th>Post P7 Fun 😊</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => {
                const images = s.reshapeImages ?? [];
                return (
                  <tr key={s.id}>
                    <td>
                      <button
                        onClick={() => handleDelete(s.id)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'rgba(239,83,80,0.6)', fontSize: '1rem', padding: '2px 6px',
                          borderRadius: 6, lineHeight: 1,
                        }}
                        title="Delete entry"
                      >
                        🗑️
                      </button>
                    </td>
                    <td style={{ color: 'rgba(240,244,255,0.4)', fontSize: '0.75rem' }}>{i + 1}</td>
                    <td style={{ color: 'rgba(240,244,255,0.5)', fontSize: '0.75rem' }}>
                      {new Date(s.timestamp).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ fontSize: '0.7rem', color: 'rgba(240,244,255,0.35)', textAlign: 'center' }}>
                      {s.surveyVersion ?? 1}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'rgba(240,244,255,0.6)', whiteSpace: 'nowrap' }}>
                      {s.location?.city || s.location?.country
                        ? `${s.location.city ? s.location.city + ', ' : ''}${s.location.country ?? ''}`
                        : <span style={{ color: 'rgba(240,244,255,0.25)' }}>—</span>}
                    </td>
                    <td>
                      {s.scanPhotoUrl
                        ? <img src={s.scanPhotoUrl} alt="scan" className="admin-photo" />
                        : <span style={{ color: 'rgba(240,244,255,0.25)' }}>—</span>}
                    </td>
                    <td>
                      {s.carPhotoUrl
                        ? <img src={s.carPhotoUrl} alt="car" className="admin-photo" />
                        : <span style={{ color: 'rgba(240,244,255,0.25)' }}>—</span>}
                    </td>
                    <td>
                      {images.length > 0
                        ? <div style={{ display: 'flex', gap: 3 }}>
                            {images.map(img => (
                              <img key={img.label} src={img.url} alt={img.label} className="admin-photo" title={img.label} />
                            ))}
                          </div>
                        : <span style={{ color: 'rgba(240,244,255,0.25)' }}>—</span>}
                    </td>
                    {/* Pre */}
                    <td>{stars(s.pre.q1_sort_habit)}</td>
                    <Cell v={s.pre.q2_seen_marks} correct={null} />
                    <Cell v={s.pre.q3_cap_behavior} correct={s.pre.q3_cap_behavior === 'B' ? true : false} />
                    {/* Post Knowledge */}
                    <Cell v={s.post?.p1_cap_material} correct={s.post ? s.post.p1_cap_material === 'B' : null} />
                    <Cell v={s.post?.p2_mix_result} correct={s.post ? s.post.p2_mix_result === 'B' : null} />
                    {/* Post AI */}
                    <td>{stars(s.post?.p3_ai_interest)}</td>
                    <td>{stars(s.post?.p4_ai_clarity)}</td>
                    <td>{stars(s.post?.p5_ai_achievement)}</td>
                    {/* Post Action */}
                    <td>{stars(s.post?.p6_sort_intention)}</td>
                    <td>{stars(s.post?.p7_fun)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
