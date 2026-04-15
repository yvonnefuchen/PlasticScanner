import { useState } from 'react';
import { getSessions, exportCSV, type SurveySession } from '../services/survey';

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

  const completed = sessions.filter(s => s.post !== null);
  const enjoyRatings = sessions.map(s => s.pre.q4_enjoy_recycling).filter(Boolean);
  const hintRatings = completed.map(s => s.post!.s2_q1_hint_clarity);
  const personalityRatings = completed.map(s => s.post!.s2_q2_personality);
  const tokenRatings = completed.map(s => s.post!.s3_q1_token);
  const clawRatings = completed.map(s => s.post!.s3_q2_claw);

  const refresh = () => setSessions(getSessions());

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>🧪 PlastiCraft Survey Results</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="admin-csv-btn" onClick={refresh}>↻ Refresh</button>
          <button className="admin-csv-btn" onClick={downloadCSV}>⬇ Export CSV</button>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        {[
          { label: 'Total Sessions', value: sessions.length },
          { label: 'Completed Post-Survey', value: `${completed.length} (${sessions.length ? Math.round(completed.length / sessions.length * 100) : 0}%)` },
          { label: 'Avg Enjoy Recycling ★', value: avg(enjoyRatings) },
          { label: 'Avg Hint Clarity ★', value: avg(hintRatings) },
          { label: 'Avg Personality Help ★', value: avg(personalityRatings) },
          { label: 'Avg Token Motivation ★', value: avg(tokenRatings) },
          { label: 'Avg Claw Excitement ★', value: avg(clawRatings) },
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
                <th>#</th>
                <th>Time</th>
                <th>Photo</th>
                <th>Pre: Heard PP/PS?</th>
                <th>Pre: Same plastic?</th>
                <th>Pre: Microwave safe?</th>
                <th>Pre: Enjoy ★</th>
                <th>Post: Straw</th>
                <th>Post: Connector</th>
                <th>Post: PVC microwave?</th>
                <th>Post: Hint ★</th>
                <th>Post: Personality ★</th>
                <th>Post: Token ★</th>
                <th>Post: Claw ★</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={s.id}>
                  <td style={{ color: 'rgba(240,244,255,0.4)', fontSize: '0.75rem' }}>{i + 1}</td>
                  <td style={{ color: 'rgba(240,244,255,0.5)', fontSize: '0.75rem' }}>
                    {new Date(s.timestamp).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    {s.photoUrl
                      ? <img src={s.photoUrl} alt="car" className="admin-photo" />
                      : <span style={{ color: 'rgba(240,244,255,0.25)' }}>—</span>}
                  </td>
                  <Cell v={s.pre.q1_heard_pp_ps} />
                  <Cell v={s.pre.q2_same_plastic} correct={s.pre.q2_same_plastic === 'no' ? true : s.pre.q2_same_plastic === 'yes' ? false : null} />
                  <Cell v={s.pre.q3_microwave_safe} correct={s.pre.q3_microwave_safe === 'PP' ? true : false} />
                  <td>{stars(s.pre.q4_enjoy_recycling)}</td>
                  <Cell v={s.post?.s1_q1_straw} correct={s.post ? s.post.s1_q1_straw === 'PP' : null} />
                  <Cell v={s.post?.s1_q2_connector} correct={s.post ? s.post.s1_q2_connector === 'PP' : null} />
                  <Cell v={s.post?.s1_q3_pvc_microwave} correct={s.post ? s.post.s1_q3_pvc_microwave === 'no' : null} />
                  <td>{stars(s.post?.s2_q1_hint_clarity)}</td>
                  <td>{stars(s.post?.s2_q2_personality)}</td>
                  <td>{stars(s.post?.s3_q1_token)}</td>
                  <td>{stars(s.post?.s3_q2_claw)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
