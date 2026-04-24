import { useState } from 'react';
import { getSessions, exportCSV, deleteSession, type SurveySession } from '../services/survey';

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

function Trunc({ v }: { v: string | undefined }) {
  if (!v) return <td className="cell-empty">—</td>;
  return <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.75rem', color: 'rgba(240,244,255,0.6)' }} title={v}>{v}</td>;
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

export default function Admin() {
  const [sessions, setSessions] = useState<SurveySession[]>(() => getSessions());
  const [imgStyle, setImgStyle] = useState<'auto' | 'vehicle'>(
    () => (localStorage.getItem('plasticraft_img_style') as 'auto' | 'vehicle') ?? 'auto'
  );
  const [appMode, setAppMode] = useState<'production' | 'testing'>(
    () => (localStorage.getItem('plasticraft_app_mode') as 'production' | 'testing') ?? 'production'
  );

  const completed = sessions.filter(s => s.post !== null);
  const q5Ratings = sessions.map(s => s.pre.q5_separate_habit).filter(Boolean);
  const q6Ratings = sessions.map(s => s.pre.q6_confidence).filter(Boolean);
  const s2q5Ratings = completed.map(s => s.post!.s2q5_plan_separate);
  const s3q8Ratings = completed.map(s => s.post!.s3q8_ai_helped);
  const s3q9Ratings = completed.map(s => s.post!.s3q9_melting_point);

  const refresh = () => setSessions(getSessions());
  const handleStyleChange = (s: 'auto' | 'vehicle') => {
    localStorage.setItem('plasticraft_img_style', s);
    setImgStyle(s);
  };
  const handleModeChange = (m: 'production' | 'testing') => {
    localStorage.setItem('plasticraft_app_mode', m);
    setAppMode(m);
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>🧪 PlastiCraft Survey Results</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="admin-csv-btn" onClick={refresh}>↻ Refresh</button>
          <button className="admin-csv-btn" onClick={downloadCSV}>⬇ Export CSV</button>
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
          { label: 'Pre: Avg Separate Habit ★', value: avg(q5Ratings) },
          { label: 'Pre: Avg Confidence ★', value: avg(q6Ratings) },
          { label: 'Post: Avg Plan Separate ★', value: avg(s2q5Ratings) },
          { label: 'Post: Avg AI Helped ★', value: avg(s3q8Ratings) },
          { label: 'Post: Avg Melting Point ★', value: avg(s3q9Ratings) },
        ].map(s => (
          <div key={s.label} className="admin-stat">
            <div className="admin-stat__value">{s.value}</div>
            <div className="admin-stat__label">{s.label}</div>
          </div>
        ))}
      </div>

      {sessions.length === 0 ? (
        <div className="admin-empty">No survey responses yet. Play the game to collect data!</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>#</th>
                <th>Time</th>
                <th>Photo</th>
                {/* Pre */}
                <th>Pre Q1 Cap</th>
                <th>Pre Q2 Mat</th>
                <th>Pre Q3 Why</th>
                <th>Pre Q4 Bin</th>
                <th>Pre Q5 ★</th>
                <th>Pre Q6 ★</th>
                <th>Pre Q7 Open</th>
                {/* Post S1 */}
                <th>Post S1Q1</th>
                <th>Post S1Q2</th>
                <th>Post S1Q3</th>
                <th>Post S1Q4</th>
                {/* Post S2 */}
                <th>Post S2Q5 ★</th>
                <th>Post S2Q6 ★</th>
                <th>Post S2Q7 Open</th>
                {/* Post S3 */}
                <th>Post S3Q8 ★</th>
                <th>Post S3Q9 ★</th>
                {/* Post S4 */}
                <th>Post S4Q10</th>
                <th>Post S4Q11 ★</th>
                <th>Post S4Q12 Open</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={s.id}>
                  <td>
                    <button
                      onClick={() => { deleteSession(s.id); refresh(); }}
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
                  <td>
                    {s.photoUrl
                      ? <img src={s.photoUrl} alt="car" className="admin-photo" />
                      : <span style={{ color: 'rgba(240,244,255,0.25)' }}>—</span>}
                  </td>
                  {/* Pre */}
                  <Cell v={s.pre.q1_cap_disposal} correct={s.pre.q1_cap_disposal === 'B' ? true : false} />
                  <Cell v={s.pre.q2_cap_material} correct={s.pre.q2_cap_material === 'B' ? true : false} />
                  <Cell v={s.pre.q3_why_separate} correct={s.pre.q3_why_separate === 'B' ? true : false} />
                  <Cell v={s.pre.q4_japan_bin} correct={s.pre.q4_japan_bin === 'B' ? true : false} />
                  <td>{stars(s.pre.q5_separate_habit)}</td>
                  <td>{stars(s.pre.q6_confidence)}</td>
                  <Trunc v={s.pre.q7_open} />
                  {/* Post S1 */}
                  <Cell v={s.post?.s1q1_main_reason} correct={s.post ? s.post.s1q1_main_reason === 'B' : null} />
                  <Cell v={s.post?.s1q2_cap_material} correct={s.post ? s.post.s1q2_cap_material === 'C' : null} />
                  <Cell v={s.post?.s1q3_contamination} correct={s.post ? s.post.s1q3_contamination === 'B' : null} />
                  <Cell v={s.post?.s1q4_japan_bin} correct={s.post ? s.post.s1q4_japan_bin === 'B' : null} />
                  {/* Post S2 */}
                  <td>{stars(s.post?.s2q5_plan_separate)}</td>
                  <td>{stars(s.post?.s2q6_confidence)}</td>
                  <Trunc v={s.post?.s2q7_open} />
                  {/* Post S3 */}
                  <td>{stars(s.post?.s3q8_ai_helped)}</td>
                  <td>{stars(s.post?.s3q9_melting_point)}</td>
                  {/* Post S4 */}
                  <Cell v={s.post?.s4q10_ironing} correct={s.post ? s.post.s4q10_ironing === 'A' : null} />
                  <td>{stars(s.post?.s4q11_keychain)}</td>
                  <Trunc v={s.post?.s4q12_open} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
