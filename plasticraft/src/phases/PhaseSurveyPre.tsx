import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../components/T';
import { StarRating } from '../components/StarRating';
import { PlasticMascot } from '../components/PlasticMascot';
import { useLang } from '../context/LangContext';
import { savePre, type McChoice } from '../services/survey';
import type { Tri } from '../data/plastics';

interface Props {
  onComplete: (sessionId: string) => void;
}

type PreAnswers = {
  q1: McChoice | null;
  q2: McChoice | null;
  q3: McChoice | null;
  q4: McChoice | null;
  q5: number;
  q6: number;
  q7: string;
};

const MC_VALS: McChoice[] = ['A', 'B', 'C', 'D'];

/* ── Strings ── */
const TITLE: Tri = { zh: '開始前，幾個小問題！', ja: '始める前に、ちょっとした質問！', en: 'A Few Quick Questions First!' };
const BUBBLE: Tri = { zh: '餵我之前，先讓我了解你一下！', ja: '食べさせる前に、少し教えて！', en: 'Before you feed me, tell me a little about yourself!' };
const SUBMIT: Tri = { zh: '送出，開始掃描！', ja: '送信してスキャン開始！', en: 'Submit & Start Scanning!' };
const THANKS: Tri = { zh: '謝謝！現在，餵我你帶來的塑膠吧！', ja: 'ありがとう！さあ、プラスチックを食べさせて！', en: 'Thanks! Now feed me the plastic you brought!' };

const Q1: Tri = { zh: '1. 丟棄塑膠瓶時，瓶蓋應該怎麼處理？', ja: '1. プラスチックボトルを捨てるとき、キャップはどうする？', en: '1. When you throw away a plastic bottle, what should you do with the cap?' };
const Q1_OPTS: Tri[] = [
  { zh: 'A) 留在瓶子上',    ja: 'A) そのまま付けておく', en: 'A) Leave it on' },
  { zh: 'B) 從瓶身分開',    ja: 'B) ボトルから外す',     en: 'B) Separate it from the bottle' },
  { zh: 'C) 丟進一般垃圾',  ja: 'C) 一般ゴミに捨てる',   en: 'C) Throw in general rubbish' },
  { zh: 'D) 沒關係',        ja: 'D) どちらでもいい',      en: "D) Doesn't matter" },
];

const Q2: Tri = { zh: '2. 瓶蓋通常是哪種材料？', ja: '2. ボトルのキャップは通常どの素材？', en: '2. Bottle caps are usually made of which material?' };
const Q2_OPTS: Tri[] = [
  { zh: 'A) PET',   ja: 'A) PET',   en: 'A) PET' },
  { zh: 'B) PP',    ja: 'B) PP',    en: 'B) PP' },
  { zh: 'C) 玻璃',  ja: 'C) ガラス', en: 'C) Glass' },
  { zh: 'D) 鋁',    ja: 'D) アルミ', en: 'D) Aluminium' },
];

const Q3: Tri = { zh: '3. 為什麼某些塑膠在回收前需要分開？', ja: '3. なぜ一部のプラスチックはリサイクル前に分ける必要があるの？', en: '3. Why do some plastics need to be separated before recycling?' };
const Q3_OPTS: Tri[] = [
  { zh: 'A) 顏色不同',     ja: 'A) 色が違うから',         en: 'A) Different colours' },
  { zh: 'B) 融化溫度不同', ja: 'B) 溶ける温度が違うから',  en: 'B) Different melting temperatures' },
  { zh: 'C) 重量不同',     ja: 'C) 重さが違うから',        en: 'C) Different weights' },
  { zh: 'D) 工廠空間問題', ja: 'D) 工場のスペースの問題',  en: 'D) Factory space' },
];

const Q4: Tri = { zh: '4. 在日本，塑膠瓶蓋應放進哪個垃圾桶？', ja: '4. 日本では、プラスチックキャップはどのゴミ箱に？', en: '4. In Japan, which bin does a plastic bottle cap go into?' };
const Q4_OPTS: Tri[] = [
  { zh: 'A) PETボトル',    ja: 'A) PETボトル',    en: 'A) PETボトル bin' },
  { zh: 'B) プラスチック', ja: 'B) プラスチック', en: 'B) プラスチック bin' },
  { zh: 'C) 燃えるゴミ',   ja: 'C) 燃えるゴミ',   en: 'C) 燃えるゴミ bin' },
  { zh: 'D) 哪個都可以',   ja: 'D) どのゴミ箱でも', en: 'D) Any bin' },
];

const Q5: Tri = { zh: '5. 我在家裡會嘗試正確分類垃圾。', ja: '5. 家でゴミを正しく分別しようとしている。', en: '5. I try to separate rubbish correctly at home.' };
const Q5_LOW: Tri = { zh: '從不', ja: '全然しない', en: 'Never' };
const Q5_HIGH: Tri = { zh: '總是', ja: 'いつもする', en: 'Always' };

const Q6: Tri = { zh: '6. 我有信心自己知道如何正確回收塑膠。', ja: '6. プラスチックを正しくリサイクルする方法を知っている自信がある。', en: '6. I feel confident that I know how to recycle plastic correctly.' };
const Q6_LOW: Tri = { zh: '完全沒信心', ja: '全く自信なし', en: 'Not at all' };
const Q6_HIGH: Tri = { zh: '非常有信心', ja: 'とても自信あり', en: 'Very confident' };

const Q7: Tri = { zh: '7. 請用自己的話說說看，為什麼你認為瓶身和瓶蓋需要放進不同的回收桶？', ja: '7. 自分の言葉で：なぜボトル本体とキャップを別々のゴミ箱に入れる必要があると思う？', en: '7. In your own words, why do you think the bottle body and bottle cap need to go into different recycling bins?' };
const Q7_PH: Tri = { zh: '在這裡寫下你的想法…', ja: 'ここに考えを書いてみよう…', en: 'Write your thoughts here…' };

/* ── Sub-components ── */
function McQuestion({ q, opts, value, onChange }: { q: Tri; opts: Tri[]; value: McChoice | null; onChange: (v: McChoice) => void }) {
  return (
    <div className="survey-q-block">
      <p className="survey-q-label"><T s={q} /></p>
      <div className="choice-grid">
        {MC_VALS.map((v, i) => (
          <button key={v} type="button"
            className={`choice-btn ${value === v ? 'choice-btn--selected' : ''}`}
            onClick={() => onChange(v)}
          >
            <T s={opts[i]} />
          </button>
        ))}
      </div>
    </div>
  );
}

function OpenQuestion({ q, placeholder, value, onChange }: { q: Tri; placeholder: Tri; value: string; onChange: (v: string) => void }) {
  const { lang } = useLang();
  return (
    <div className="survey-q-block">
      <p className="survey-q-label"><T s={q} /></p>
      <textarea
        className="survey-open-text"
        rows={3}
        value={value}
        placeholder={placeholder[lang]}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

/* ── Main ── */
export function PhaseSurveyPre({ onComplete }: Props) {
  const [answers, setAnswers] = useState<PreAnswers>({ q1: null, q2: null, q3: null, q4: null, q5: 0, q6: 0, q7: '' });
  const [submitted, setSubmitted] = useState(false);

  const allAnswered =
    answers.q1 !== null && answers.q2 !== null &&
    answers.q3 !== null && answers.q4 !== null &&
    answers.q5 > 0 && answers.q6 > 0 &&
    answers.q7.trim().length > 0;

  const handleSubmit = () => {
    if (!allAnswered) return;
    const id = savePre({
      q1_cap_disposal: answers.q1!,
      q2_cap_material: answers.q2!,
      q3_why_separate: answers.q3!,
      q4_japan_bin: answers.q4!,
      q5_separate_habit: answers.q5,
      q6_confidence: answers.q6,
      q7_open: answers.q7.trim(),
    });
    setSubmitted(true);
    setTimeout(() => onComplete(id), 1800);
  };

  const set = <K extends keyof PreAnswers>(k: K, v: PreAnswers[K]) =>
    setAnswers(a => ({ ...a, [k]: v }));

  return (
    <div className="phase-container phase-survey">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div key="thanks" className="survey-thanks" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <PlasticMascot state="waving" size={110} />
            <p className="survey-thanks__text"><T s={THANKS} /></p>
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

            <McQuestion q={Q1} opts={Q1_OPTS} value={answers.q1} onChange={v => set('q1', v)} />
            <McQuestion q={Q2} opts={Q2_OPTS} value={answers.q2} onChange={v => set('q2', v)} />
            <McQuestion q={Q3} opts={Q3_OPTS} value={answers.q3} onChange={v => set('q3', v)} />
            <McQuestion q={Q4} opts={Q4_OPTS} value={answers.q4} onChange={v => set('q4', v)} />

            <div className="survey-q-block">
              <p className="survey-q-label"><T s={Q5} /></p>
              <StarRating value={answers.q5} onChange={v => set('q5', v)} />
              <div className="star-labels-row">
                <span className="star-label"><T s={Q5_LOW} /></span>
                <span className="star-label" style={{ marginLeft: 'auto' }}><T s={Q5_HIGH} /></span>
              </div>
            </div>

            <div className="survey-q-block">
              <p className="survey-q-label"><T s={Q6} /></p>
              <StarRating value={answers.q6} onChange={v => set('q6', v)} />
              <div className="star-labels-row">
                <span className="star-label"><T s={Q6_LOW} /></span>
                <span className="star-label" style={{ marginLeft: 'auto' }}><T s={Q6_HIGH} /></span>
              </div>
            </div>

            <OpenQuestion q={Q7} placeholder={Q7_PH} value={answers.q7} onChange={v => set('q7', v)} />

            <button className="btn-primary" onClick={handleSubmit} disabled={!allAnswered} style={{ opacity: allAnswered ? 1 : 0.45, marginTop: 4 }}>
              <T s={SUBMIT} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
