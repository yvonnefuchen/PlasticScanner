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
  const q1Ratings = sessions.map(s => s.pre.q1_sort_habit).filter(Boolean);
  const p3Ratings = completed.map(s => s.post!.p3_ai_interest);
  const p4Ratings = completed.map(s => s.post!.p4_ai_clarity);
  const p5Ratings = completed.map(s => s.post!.p5_ai_achievement);

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
          { label: 'Pre: Avg Sort Habit 😊', value: avg(q1Ratings) },
          { label: 'Post: Avg AI Interest 😊', value: avg(p3Ratings) },
          { label: 'Post: Avg AI Clarity 😊', value: avg(p4Ratings) },
          { label: 'Post: Avg AI Achievement 😊', value: avg(p5Ratings) },
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
                {/* Pre */}
                <th>Pre Q1 Sort 😊</th>
                <th>Pre Q2 Marks</th>
                <th>Pre Q3 Cap</th>
                {/* Post Knowledge */}
                <th>Post P1 Mat</th>
                <th>Post P2 Mix</th>
                {/* Post AI */}
                <th>Post P3 AI Interest 😊</th>
                <th>Post P4 AI Clarity 😊</th>
                <th>Post P5 AI Proud 😊</th>
                {/* Post Action */}
                <th>Post P6 Sort 😊</th>
                <th>Post P7 Fun 😊</th>
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
