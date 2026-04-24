import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../components/T';
import { EmojiRating } from '../components/EmojiRating';
import { PlasticMascot } from '../components/PlasticMascot';
import { savePre, type McChoice } from '../services/survey';
import type { Tri } from '../data/plastics';

interface Props {
  onComplete: (sessionId: string) => void;
}

type PreAnswers = {
  q1: number;
  q2: McChoice | null;
  q3: McChoice | null;
};

/* ── Strings ── */
const TITLE: Tri = {
  zh: '🗺️ 作戰前的祕密任務！',
  ja: '🗺️ さくせん カード！ スタート まえの ひみつ ちょうさ！',
  en: '🗺️ Mission Card — Secret Survey Before We Start!',
};
const BUBBLE: Tri = {
  zh: '嗨！先告訴我你知道什麼，我才能更好地幫你！',
  ja: 'やあ！まず きみの こと おしえて！もっと うまく てつだえるよ！',
  en: "Hi! Tell me what you know — I'll be a better helper!",
};
const SUBMIT: Tri = {
  zh: '送出，開始任務！🚀',
  ja: 'そうしん して、さくせん かいし！🚀',
  en: 'Submit & Start the Mission! 🚀',
};
const AI_PREVIEW: Tri = {
  zh: '掃描前，先讓我展示一下我的能力！',
  ja: 'スキャン まえに、ぼくの すごい ところを みてみよう！',
  en: "Before scanning, let's see what I am capable of!",
};

/* Q1 */
const Q1: Tri = {
  zh: '1. 你平常在家有分類垃圾嗎？',
  ja: '1. おうちで ゴミを 種類（しゅるい）ごとに 分（わ）けてる？',
  en: '1. Do you sort your rubbish at home?',
};
const Q1_LOW: Tri = { zh: '從來沒有 😞', ja: 'ぜんぜん 😞', en: 'Never 😞' };
const Q1_HIGH: Tri = { zh: '每次都有！🤩', ja: 'いつも してるよ！🤩', en: 'Always! 🤩' };

/* Q2 */
const Q2: Tri = {
  zh: '2. 你看過這些「神祕符號」嗎？',
  ja: '2. このマーク、見（み）たことある？',
  en: '2. Have you seen these marks before?',
};
const Q2_A: Tri = { zh: '🅰️ 見過！有！', ja: '🅰️ ある！', en: '🅰️ Yes!' };
const Q2_B: Tri = { zh: '🅱️ 還沒看過', ja: '🅱️ まだない', en: '🅱️ Not yet' };

/* Q3 */
const Q3: Tri = {
  zh: '3. 喝完飲料，瓶蓋你怎麼丟？',
  ja: '3. のみものを のんだあと、キャップは どうする？',
  en: '3. After drinking, what do you do with the bottle cap?',
};
const Q3_A: Tri = { zh: '🅰️ 蓋著一起丟', ja: '🅰️ つけたまま すてる', en: '🅰️ Keep it on the bottle' };
const Q3_B: Tri = { zh: '🅱️ 拿下來分開丟', ja: '🅱️ はずして すてる', en: '🅱️ Take it off separately' };
const Q3_C: Tri = { zh: '🅾️ 我不確定耶', ja: '🅾️ よく わからない', en: '🅾️ I\'m not sure' };

/* ── Mark badge visual ── */
function MarkBadges() {
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', margin: '8px 0 4px' }}>
      <div style={{
        border: '2.5px solid #4FC3F7', borderRadius: 10, padding: '8px 16px',
        textAlign: 'center', background: 'rgba(79,195,247,0.1)',
      }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#4FC3F7', letterSpacing: 2 }}>PET</div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: 2 }}>ペットボトル</div>
      </div>
      <div style={{
        border: '2.5px solid #81C784', borderRadius: 10, padding: '8px 16px',
        textAlign: 'center', background: 'rgba(129,199,132,0.1)',
      }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#81C784', letterSpacing: 2 }}>プラ</div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: 2 }}>PP キャップ</div>
      </div>
    </div>
  );
}

/* ── 2-option choice button ── */
function TwoChoiceQuestion({ q, optA, optB, optC, value, onChange, extra }: {
  q: Tri; optA: Tri; optB: Tri; optC?: Tri;
  value: McChoice | null; onChange: (v: McChoice) => void;
  extra?: React.ReactNode;
}) {
  const opts: { val: McChoice; label: Tri }[] = [
    { val: 'A', label: optA },
    { val: 'B', label: optB },
    ...(optC ? [{ val: 'C' as McChoice, label: optC }] : []),
  ];
  return (
    <div className="survey-q-block">
      <p className="survey-q-label"><T s={q} /></p>
      {extra}
      <div className="choice-grid" style={{ gridTemplateColumns: `repeat(${opts.length}, 1fr)` }}>
        {opts.map(({ val, label }) => (
          <button key={val} type="button"
            className={`choice-btn ${value === val ? 'choice-btn--selected' : ''}`}
            onClick={() => onChange(val)}
          >
            <T s={label} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main ── */
export function PhaseSurveyPre({ onComplete }: Props) {
  const [answers, setAnswers] = useState<PreAnswers>({ q1: 0, q2: null, q3: null });
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = answers.q1 > 0 && answers.q2 !== null && answers.q3 !== null;

  const handleSubmit = () => {
    if (!allAnswered) return;
    const id = savePre({
      q1_sort_habit: answers.q1,
      q2_seen_marks: answers.q2!,
      q3_cap_behavior: answers.q3!,
    });
    setSubmitted(true);
    setTimeout(() => onComplete(id), 3800);
  };

  const set = <K extends keyof PreAnswers>(k: K, v: PreAnswers[K]) =>
    setAnswers(a => ({ ...a, [k]: v }));

  return (
    <div className="phase-container phase-survey">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div key="thanks" className="survey-thanks" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 72 }}>
                {([
                  { delay: 0,    heights: [14, 58] as [number, number] },
                  { delay: 0.13, heights: [28, 50] as [number, number] },
                  { delay: 0.27, heights: [8,  66] as [number, number] },
                  { delay: 0.06, heights: [22, 54] as [number, number] },
                  { delay: 0.19, heights: [18, 62] as [number, number] },
                  { delay: 0.34, heights: [12, 48] as [number, number] },
                  { delay: 0.08, heights: [24, 56] as [number, number] },
                ]).map((b, i) => (
                  <motion.div key={i}
                    style={{ width: 13, borderRadius: 4, background: 'linear-gradient(to top, #6ee7f7, #6ef7a0)', originY: 1 }}
                    animate={{ height: [b.heights[0], b.heights[1], b.heights[0]] }}
                    transition={{ duration: 0.72 + i * 0.04, repeat: Infinity, delay: b.delay, ease: 'easeInOut' }}
                  />
                ))}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#6ee7f7', fontWeight: 700, letterSpacing: '0.06em' }}>◈ AI ANALYSING…</div>
            </div>
            <p className="survey-thanks__text"><T s={AI_PREVIEW} /></p>
          </motion.div>
        ) : (
          <motion.div key="form" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="survey-title"><T s={TITLE} /></h2>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              <PlasticMascot state="idle" size={80} />
              <div className="speech-bubble" style={{ fontSize: '0.9rem', padding: '10px 14px' }}>
                <T s={BUBBLE} />
              </div>
            </div>

            {/* Q1: Emoji Likert */}
            <div className="survey-q-block">
              <p className="survey-q-label"><T s={Q1} /></p>
              <EmojiRating value={answers.q1} onChange={v => set('q1', v)} />
              <div className="star-labels-row">
                <span className="star-label"><T s={Q1_LOW} /></span>
                <span className="star-label" style={{ marginLeft: 'auto' }}><T s={Q1_HIGH} /></span>
              </div>
            </div>

            {/* Q2: Seen marks */}
            <TwoChoiceQuestion
              q={Q2} optA={Q2_A} optB={Q2_B}
              value={answers.q2} onChange={v => set('q2', v)}
              extra={<MarkBadges />}
            />

            {/* Q3: Cap behavior */}
            <TwoChoiceQuestion
              q={Q3} optA={Q3_A} optB={Q3_B} optC={Q3_C}
              value={answers.q3} onChange={v => set('q3', v)}
            />

            <button className="btn-primary" onClick={handleSubmit} disabled={!allAnswered}
              style={{ opacity: allAnswered ? 1 : 0.45, marginTop: 4 }}>
              <T s={SUBMIT} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
