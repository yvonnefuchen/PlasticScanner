import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../components/T';
import { StarRating } from '../components/StarRating';
import { PlasticMascot } from '../components/PlasticMascot';
import { savePost, type MaterialChoice, type YesNo } from '../services/survey';
import type { Tri } from '../data/plastics';

interface Props {
  sessionId: string;
  onDone: () => void;
}

type PostAnswers = {
  s1q1: MaterialChoice | null;
  s1q2: MaterialChoice | null;
  s1q3: YesNo | null;
  s2q1: number;
  s2q2: number;
  s3q1: number;
  s3q2: number;
};

/* ── Strings ── */
const TITLE: Tri = { zh: '幾個小問題！', ja: 'ちょっとした質問！', en: 'Quick Questions!' };
const S1_HEAD: Tri = { zh: 'Section 1：你學到了什麼？', ja: 'Section 1：学んだこと', en: 'Section 1: Knowledge Check' };
const S1Q1: Tri = {
  zh: '「動力轉軸」（吸管）是哪種材質？',
  ja: '「ダイナミックアクスル」（ストロー）は何の材質？',
  en: 'Which material was the "Dynamic Axle" (Straw)?',
};
const S1Q2: Tri = {
  zh: '「動力核心」（連接件）是哪種材質？',
  ja: '「エナジーコア」（コネクター）は何の材質？',
  en: 'Which material was the "Energy Core" (Connector)?',
};
const S1Q3: Tri = {
  zh: 'AI 說 PVC 是「神秘叛逆者」。它可以用來微波加熱嗎？',
  ja: 'AIはPVCを「謎の反逆者」と言った。電子レンジで使えますか？',
  en: 'The AI called PVC a "Mystery Rebel." Should you use it for microwaving?',
};
const S2_HEAD: Tri = { zh: 'Section 2：學習體驗', ja: 'Section 2：学習体験', en: 'Section 2: Learning Experience' };
const S2Q1: Tri = {
  zh: 'AI 給出「提示」後，你分辨塑膠有多容易？',
  ja: 'AIの「ヒント」の後、プラスチックの見分けはどのくらい楽だった？',
  en: 'How easy was it to distinguish plastics after the AI gave you a Hint?',
};
const S2Q1_LOW: Tri = { zh: '還是很混亂', ja: 'まだ混乱', en: 'Still confusing' };
const S2Q1_HIGH: Tri = { zh: '超清楚！', ja: 'とても明快！', en: 'Very clear!' };
const S2Q2: Tri = {
  zh: '塑膠的「個性」（超級英雄PP、易碎PS）幫你記憶了嗎？',
  ja: 'プラスチックの「個性」（スーパーヒーローPP、脆いPS）は記憶に役立った？',
  en: 'Did the plastic "Personality" (Superhero PP, Fragile PS) help you remember?',
};
const S2Q2_LOW: Tri = { zh: '完全沒用', ja: '全然役立たなかった', en: 'Not at all' };
const S2Q2_HIGH: Tri = { zh: '很有幫助！', ja: 'とても役立った！', en: 'Helped a lot!' };
const S3_HEAD: Tri = { zh: 'Section 3：動力與激勵', ja: 'Section 3：モチベーション', en: 'Section 3: Motivation' };
const S3Q1: Tri = {
  zh: '因為有「PP瓶蓋代幣」，你更想答對題目嗎？',
  ja: '「PPボトルキャップトークン」があったから、もっと正解したくなった？',
  en: 'Did the "PP Token" motivate you to identify the plastic correctly?',
};
const S3Q1_LOW: Tri = { zh: '沒差別', ja: '関係ない', en: 'No difference' };
const S3Q1_HIGH: Tri = { zh: '超有動力！', ja: 'とてもやる気に！', en: 'Much more motivated!' };
const S3Q2: Tri = {
  zh: '使用夾娃娃機夾取「動力核心」，你的興奮程度？',
  ja: 'クレーンゲームで「エナジーコア」をゲット、興奮度は？',
  en: 'How excited were you using the Claw Machine to get your "Energy Core"?',
};
const S3Q2_LOW: Tri = { zh: '很無聊', ja: '退屈', en: 'Bored' };
const S3Q2_HIGH: Tri = { zh: '超興奮！', ja: '超興奮！', en: 'Extremely excited!' };
const YES: Tri = { zh: '可以', ja: 'はい', en: 'Yes' };
const NO: Tri = { zh: '不行', ja: 'いいえ', en: 'No' };
const NEXT_BTN: Tri = { zh: '下一頁', ja: '次へ', en: 'Next' };
const SUBMIT_BTN: Tri = { zh: '送出！', ja: '送信！', en: 'Submit!' };
const THANKS: Tri = {
  zh: '感謝參與！你棒棒的！🎉',
  ja: 'ご参加ありがとう！すごいね！🎉',
  en: 'Thank you for participating! You were amazing! 🎉',
};

const MATERIALS: MaterialChoice[] = ['PET', 'PP', 'PS'];

export function PhaseSurveyPost({ sessionId, onDone }: Props) {
  const [page, setPage] = useState(0);
  const [answers, setAnswers] = useState<PostAnswers>({
    s1q1: null, s1q2: null, s1q3: null,
    s2q1: 0, s2q2: 0, s3q1: 0, s3q2: 0,
  });
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof PostAnswers>(k: K, v: PostAnswers[K]) =>
    setAnswers(a => ({ ...a, [k]: v }));

  const page0Done = answers.s1q1 !== null && answers.s1q2 !== null && answers.s1q3 !== null;
  const page1Done = answers.s2q1 > 0 && answers.s2q2 > 0 && answers.s3q1 > 0 && answers.s3q2 > 0;

  const handleSubmit = () => {
    if (!page1Done) return;
    savePost(sessionId, {
      s1_q1_straw: answers.s1q1!,
      s1_q2_connector: answers.s1q2!,
      s1_q3_pvc_microwave: answers.s1q3!,
      s2_q1_hint_clarity: answers.s2q1,
      s2_q2_personality: answers.s2q2,
      s3_q1_token: answers.s3q1,
      s3_q2_claw: answers.s3q2,
    });
    setSubmitted(true);
    setTimeout(onDone, 2200);
  };

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
            <PlasticMascot state="excited" size={110} />
            <p className="survey-thanks__text"><T s={THANKS} /></p>
          </motion.div>
        ) : page === 0 ? (
          <motion.div
            key="page0"
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >
            <h2 className="survey-title"><T s={TITLE} /></h2>
            <p className="survey-section-head"><T s={S1_HEAD} /></p>

            {/* S1Q1 */}
            <div className="survey-q-block">
              <p className="survey-q-label"><T s={S1Q1} /></p>
              <div className="choice-grid">
                {MATERIALS.map(v => (
                  <button key={v} type="button"
                    className={`choice-btn ${answers.s1q1 === v ? 'choice-btn--selected' : ''}`}
                    onClick={() => set('s1q1', v)}
                  >{v}</button>
                ))}
              </div>
            </div>

            {/* S1Q2 */}
            <div className="survey-q-block">
              <p className="survey-q-label"><T s={S1Q2} /></p>
              <div className="choice-grid">
                {MATERIALS.map(v => (
                  <button key={v} type="button"
                    className={`choice-btn ${answers.s1q2 === v ? 'choice-btn--selected' : ''}`}
                    onClick={() => set('s1q2', v)}
                  >{v}</button>
                ))}
              </div>
            </div>

            {/* S1Q3 */}
            <div className="survey-q-block">
              <p className="survey-q-label"><T s={S1Q3} /></p>
              <div className="yn-btns">
                {(['yes', 'no'] as YesNo[]).map(v => (
                  <button key={v} type="button"
                    className={`yn-btn ${answers.s1q3 === v ? 'yn-btn--selected' : ''}`}
                    onClick={() => set('s1q3', v)}
                  >
                    {v === 'yes' ? <T s={YES} /> : <T s={NO} />}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn-primary" onClick={() => setPage(1)}
              disabled={!page0Done} style={{ opacity: page0Done ? 1 : 0.45, marginTop: 4 }}>
              <T s={NEXT_BTN} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="page1"
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >
            <h2 className="survey-title"><T s={TITLE} /></h2>
            <p className="survey-section-head"><T s={S2_HEAD} /></p>

            <div className="survey-q-block">
              <p className="survey-q-label"><T s={S2Q1} /></p>
              <StarRating value={answers.s2q1} onChange={v => set('s2q1', v)} />
              <div className="star-labels-row">
                <span className="star-label"><T s={S2Q1_LOW} /></span>
                <span className="star-label" style={{ marginLeft: 'auto' }}><T s={S2Q1_HIGH} /></span>
              </div>
            </div>

            <div className="survey-q-block">
              <p className="survey-q-label"><T s={S2Q2} /></p>
              <StarRating value={answers.s2q2} onChange={v => set('s2q2', v)} />
              <div className="star-labels-row">
                <span className="star-label"><T s={S2Q2_LOW} /></span>
                <span className="star-label" style={{ marginLeft: 'auto' }}><T s={S2Q2_HIGH} /></span>
              </div>
            </div>

            <p className="survey-section-head"><T s={S3_HEAD} /></p>

            <div className="survey-q-block">
              <p className="survey-q-label"><T s={S3Q1} /></p>
              <StarRating value={answers.s3q1} onChange={v => set('s3q1', v)} />
              <div className="star-labels-row">
                <span className="star-label"><T s={S3Q1_LOW} /></span>
                <span className="star-label" style={{ marginLeft: 'auto' }}><T s={S3Q1_HIGH} /></span>
              </div>
            </div>

            <div className="survey-q-block">
              <p className="survey-q-label"><T s={S3Q2} /></p>
              <StarRating value={answers.s3q2} onChange={v => set('s3q2', v)} />
              <div className="star-labels-row">
                <span className="star-label"><T s={S3Q2_LOW} /></span>
                <span className="star-label" style={{ marginLeft: 'auto' }}><T s={S3Q2_HIGH} /></span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button className="btn-secondary" onClick={() => setPage(0)}>←</button>
              <button className="btn-primary" onClick={handleSubmit}
                disabled={!page1Done} style={{ opacity: page1Done ? 1 : 0.45 }}>
                <T s={SUBMIT_BTN} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
