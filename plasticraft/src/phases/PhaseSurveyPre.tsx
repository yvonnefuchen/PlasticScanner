import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../components/T';
import { StarRating } from '../components/StarRating';
import { PlasticMascot } from '../components/PlasticMascot';
import { savePre, type YesNo, type MicrowaveChoice } from '../services/survey';
import type { Tri } from '../data/plastics';

interface Props {
  onComplete: (sessionId: string) => void;
}

type PreAnswers = {
  q1: YesNo | null;
  q2: YesNo | null;
  q3: MicrowaveChoice | null;
  q4: number; // 0 = unanswered
};

const TITLE: Tri = {
  zh: '開始前，幾個小問題！',
  ja: '始める前に、ちょっとした質問！',
  en: 'A Few Quick Questions First!',
};
const BUBBLE: Tri = {
  zh: '餵我之前，先讓我了解你一下！',
  ja: '食べさせる前に、少し教えて！',
  en: 'Before you feed me, tell me a little about yourself!',
};
const Q1: Tri = {
  zh: '1. 你聽過「PP」或「PS」塑膠嗎？',
  ja: '1.「PP」や「PS」プラスチックを聞いたことがありますか？',
  en: '1. Have you ever heard of "PP" or "PS" plastics before?',
};
const Q2: Tri = {
  zh: '2. 透明瓶子和白色肉托盤，是同一種塑膠嗎？',
  ja: '2. 透明なボトルと白い肉トレイは同じプラスチックですか？',
  en: '2. Are a clear bottle and a white meat tray the same plastic?',
};
const Q3: Tri = {
  zh: '3. 微波便當時，哪種塑膠最安全？',
  ja: '3. お弁当を電子レンジで温めるとき、どのプラスチックが安全？',
  en: '3. Which plastic is safest for microwaving your lunch?',
};
const Q4: Tri = {
  zh: '4. 你平時有多喜歡學習回收知識？',
  ja: '4. リサイクルについて学ぶのはどのくらい好き？',
  en: '4. How much do you usually like learning about recycling?',
};
const YES: Tri = { zh: '聽過', ja: 'はい', en: 'Yes' };
const NO: Tri = { zh: '沒有', ja: 'いいえ', en: 'No' };
const NOT_SURE: Tri = { zh: '不確定', ja: 'わからない', en: 'Not sure' };
const LOW4: Tri = { zh: '不喜歡', ja: 'あまり…', en: 'Not much' };
const HIGH4: Tri = { zh: '超喜歡！', ja: '大好き！', en: 'Love it!' };
const SUBMIT: Tri = { zh: '送出，開始掃描！', ja: '送信してスキャン開始！', en: 'Submit & Start Scanning!' };
const THANKS: Tri = {
  zh: '謝謝！現在，餵我你帶來的塑膠吧！',
  ja: 'ありがとう！さあ、プラスチックを食べさせて！',
  en: 'Thanks! Now feed me the plastic you brought!',
};

export function PhaseSurveyPre({ onComplete }: Props) {
  const [answers, setAnswers] = useState<PreAnswers>({ q1: null, q2: null, q3: null, q4: 0 });
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = answers.q1 !== null && answers.q2 !== null && answers.q3 !== null && answers.q4 > 0;

  const handleSubmit = () => {
    if (!allAnswered) return;
    const id = savePre({
      q1_heard_pp_ps: answers.q1!,
      q2_same_plastic: answers.q2!,
      q3_microwave_safe: answers.q3!,
      q4_enjoy_recycling: answers.q4,
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
          <motion.div
            key="thanks"
            className="survey-thanks"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <PlasticMascot state="waving" size={110} />
            <p className="survey-thanks__text"><T s={THANKS} /></p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="survey-title"><T s={TITLE} /></h2>

            {/* Mascot + bubble */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              <PlasticMascot state="idle" size={80} />
              <div className="speech-bubble" style={{ fontSize: '0.9rem', padding: '10px 14px' }}>
                <T s={BUBBLE} />
              </div>
            </div>

            {/* Q1 */}
            <div className="survey-q-block">
              <p className="survey-q-label"><T s={Q1} /></p>
              <div className="yn-btns">
                {(['yes', 'no'] as YesNo[]).map(v => (
                  <button
                    key={v}
                    type="button"
                    className={`yn-btn ${answers.q1 === v ? 'yn-btn--selected' : ''}`}
                    onClick={() => set('q1', v)}
                  >
                    {v === 'yes' ? <T s={YES} /> : <T s={NO} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Q2 */}
            <div className="survey-q-block">
              <p className="survey-q-label"><T s={Q2} /></p>
              <div className="yn-btns">
                {(['yes', 'no'] as YesNo[]).map(v => (
                  <button
                    key={v}
                    type="button"
                    className={`yn-btn ${answers.q2 === v ? 'yn-btn--selected' : ''}`}
                    onClick={() => set('q2', v)}
                  >
                    {v === 'yes' ? <T s={YES} /> : <T s={NO} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Q3 */}
            <div className="survey-q-block">
              <p className="survey-q-label"><T s={Q3} /></p>
              <div className="choice-grid">
                {(['PP', 'PS', 'PET', 'not_sure'] as MicrowaveChoice[]).map(v => (
                  <button
                    key={v}
                    type="button"
                    className={`choice-btn ${answers.q3 === v ? 'choice-btn--selected' : ''}`}
                    onClick={() => set('q3', v)}
                  >
                    {v === 'not_sure' ? <T s={NOT_SURE} /> : v}
                  </button>
                ))}
              </div>
            </div>

            {/* Q4 */}
            <div className="survey-q-block">
              <p className="survey-q-label"><T s={Q4} /></p>
              <StarRating
                value={answers.q4}
                onChange={v => set('q4', v)}
                lowLabel={undefined}
                highLabel={undefined}
              />
              <div className="star-labels-row">
                <span className="star-label"><T s={LOW4} /></span>
                <span className="star-label" style={{ marginLeft: 'auto' }}><T s={HIGH4} /></span>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={!allAnswered}
              style={{ opacity: allAnswered ? 1 : 0.45, marginTop: 4 }}
            >
              <T s={SUBMIT} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
