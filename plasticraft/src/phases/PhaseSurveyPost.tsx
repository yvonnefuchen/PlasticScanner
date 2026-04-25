import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../components/T';
import { EmojiRating } from '../components/EmojiRating';
import { PlasticMascot } from '../components/PlasticMascot';
import { savePost, type McChoice } from '../services/survey';
import type { Tri } from '../data/plastics';

interface Props {
  sessionId: string;
  onDone: () => void;
}

type PostAnswers = {
  p1: McChoice | null;
  p2: McChoice | null;
  p3: number;
  p4: number;
  p5: number;
  p6: number;
  p7: number;
};

/* ── Strings ── */
const TITLE: Tri = {
  zh: '🏆 今天的大發現報告書！',
  ja: '🏆 きょうの だいはっけん レポート！',
  en: '🏆 Today\'s Big Discovery Report!',
};
const HEAD_KNOWLEDGE: Tri = {
  zh: '🧠 知識任務',
  ja: '🧠 なにを おぼえた？ ミッション',
  en: '🧠 Knowledge Mission',
};
const HEAD_AI: Tri = {
  zh: '🤖 AI 夥伴任務',
  ja: '🤖 AI（エーアイ）パートナー ミッション',
  en: '🤖 AI Partner Mission',
};
const HEAD_ACTION: Tri = {
  zh: '🌍 行動承諾',
  ja: '🌍 やくそく ミッション',
  en: '🌍 Action Pledge',
};
const NEXT_BTN: Tri = { zh: '下一頁 →', ja: 'つぎへ →', en: 'Next →' };
const BACK_BTN: Tri = { zh: '← 上一頁', ja: '← もどる', en: '← Back' };
const SUBMIT_BTN: Tri = { zh: '送出！🎉', ja: 'そうしん！🎉', en: 'Submit! 🎉' };
const THANKS: Tri = {
  zh: '太棒了！你今天是真正的回收英雄！🦸',
  ja: 'すごい！ きょうは ほんものの リサイクル ヒーロー！🦸',
  en: 'Amazing! You are a real Recycling Hero today! 🦸',
};
const IDEAS_TITLE: Tri = {
  zh: '垃圾可以變成新玩具！💡',
  ja: 'ゴミが あたらしい おもちゃに なれるよ！💡',
  en: 'Trash can become something new! 💡',
};
const IDEAS_INTRO: Tri = {
  zh: '你今天使用的材料，還可以做成更多東西！',
  ja: 'きょう つかった ざいりょうで、もっと たくさんの ものが つくれるよ！',
  en: 'The materials you used today can become so much more!',
};
const FINISH_BTN: Tri = { zh: '完成！', ja: 'かんせい！', en: 'Finish!' };

/* ── Knowledge Q1 ── */
const P1: Tri = {
  zh: '1. 瓶蓋和吸管是用什麼材料做的？',
  ja: '1. キャップや ストローの 材料（ざいりょう）は なに？',
  en: '1. What material are bottle caps and straws made of?',
};
const P1_A: Tri = { zh: 'A) PET（寶特瓶）', ja: 'A) PET（ペット）', en: 'A) PET' };
const P1_B: Tri = { zh: 'B) PP（プラ）✓', ja: 'B) PP（プラ）✓', en: 'B) PP (Plastic) ✓' };

/* ── Knowledge Q2 ── */
const P2: Tri = {
  zh: '2. 把 PET 和 PP 混在一起回收，會發生什麼事？',
  ja: '2. PETと プラ（PP）を まぜて リサイクルすると どうなる？',
  en: '2. What happens if PET and PP are recycled together?',
};
const P2_A: Tri = { zh: 'A) 變得更強！💪', ja: 'A) もっと つよくなる！💪', en: 'A) Becomes super strong! 💪' };
const P2_B: Tri = { zh: 'B) 變脆、容易壞掉 ✓', ja: 'B) ボロボロに こわれる ✓', en: 'B) Breaks apart easily ✓' };

/* ── AI Q3 ── */
const P3: Tri = {
  zh: '3. 看到 AI 把「你的垃圾」變成很酷的圖片，你有沒有更想了解這個材料？',
  ja: '3. AIくんがかっこいい絵にしてくれて、ごみについてもっと知りたくなった？',
  en: '3. After the AI turned YOUR trash into a cool picture, did you want to learn more about the material?',
};
const P3_LOW: Tri = { zh: '完全沒有 😞', ja: 'ぜんぜん 😞', en: 'Not at all 😞' };
const P3_HIGH: Tri = { zh: '超想知道！🤩', ja: 'もっと しりたい！🤩', en: 'Very much! 🤩' };

/* ── AI Q4 ── */
const P4: Tri = {
  zh: '4. 看到 AI 畫的酷圖之後，你有沒有更想選對正確的材料？',
  ja: '4. AIくんの絵はくるまを作る時のよいヒントになった？',
  en: '4. Seeing the AI\'s cool picture, did it make you want to pick the right materials?',
};
const P4_LOW: Tri = { zh: '完全沒有 😞', ja: 'ぜんぜん 😞', en: 'Not at all 😞' };
const P4_HIGH: Tri = { zh: '好想選對！🤩', ja: 'えらびたい！🤩', en: 'Yes, I want to! 🤩' };

/* ── AI Q5 ── */
const P5: Tri = {
  zh: '5. 看到你的垃圾在圖中變成很酷的東西，你有沒有覺得很驕傲？',
  ja: '5. じぶんの ゴミが かっこいい ものに なるのを みて、「やった！」って うれしくなった？',
  en: '5. Seeing your trash become something awesome in the picture — did you feel proud?',
};
const P5_LOW: Tri = { zh: '沒什麼感覺 😞', ja: 'あんまり… 😞', en: 'Not really 😞' };
const P5_HIGH: Tri = { zh: '超驕傲！！🤩', ja: 'すごく うれしい！！🤩', en: 'So proud!! 🤩' };

/* ── Action Q6 ── */
const P6: Tri = {
  zh: '6. 從今天開始，你願意在家找找這些符號、分類丟垃圾嗎？',
  ja: '6. これから おうちで マークを みつけて、ゴミを 分（わ）けてみたい？',
  en: '6. From now on, will you look for the marks and sort your rubbish at home?',
};
const P6_LOW: Tri = { zh: '不太想 😞', ja: 'したくない 😞', en: 'No way 😞' };
const P6_HIGH: Tri = { zh: '一定會！🤩', ja: 'ぜったい やる！🤩', en: 'Definitely! 🤩' };

/* ── Fun Q7 ── */
const P7: Tri = {
  zh: '7. 今天的工作坊好不好玩？',
  ja: '7. きょうの ワークショップは たのしかった？',
  en: '7. How fun was today\'s workshop?',
};
const P7_LOW: Tri = { zh: '不好玩 😞', ja: 'たのしくない 😞', en: 'Not fun 😞' };
const P7_HIGH: Tri = { zh: '超好玩！！🤩', ja: 'さいこう！！🤩', en: 'The BEST!! 🤩' };

/* ── Toy Ideas ── */
interface ToyIdea { emoji: string; material: string; color: string; bg: string; title: Tri; desc: Tri; }
const TOY_IDEAS: ToyIdea[] = [
  {
    emoji: '🌱', material: '🔵 PET', color: '#4FC3F7', bg: 'rgba(79,195,247,0.1)',
    title: { zh: '迷你小花園', ja: 'ちいさな みどりの いえ', en: 'Mini Green House' },
    desc: {
      zh: '把 PET 瓶子切開，填入泥土和小植物，做成桌上小花園！',
      ja: 'PETボトルを きって、つちと ちいさな しょくぶつを いれよう。つくえの うえに かざれる、じぶんだけの みどり！',
      en: 'Cut open a PET bottle, fill with soil and tiny plants — your own little green corner on the desk!',
    },
  },
  {
    emoji: '🎨', material: '🟢 PP', color: '#81C784', bg: 'rgba(129,199,132,0.1)',
    title: { zh: 'PP 瓶蓋馬賽克', ja: 'PPキャップ モザイク アート', en: 'PP Cap Mosaic Art' },
    desc: {
      zh: '收集不同顏色的 PP 瓶蓋，排列貼成圖案，做成牆壁裝飾！',
      ja: 'カラフルな PPキャップを あつめて、もように ならべて はりつけ、かべの かざりに しよう！',
      en: 'Collect colorful PP bottle caps, arrange and glue them into patterns for wall art!',
    },
  },
  {
    emoji: '🏎️', material: '🔴 PS', color: '#EF5350', bg: 'rgba(239,83,80,0.1)',
    title: { zh: 'PS 托盤迷你跑道', ja: 'PSトレイ ミニ レーストラック', en: 'PS Tray Mini Race Track' },
    desc: {
      zh: '把 PS 托盤剪成長條，彎曲成跑道，打造小車車的競速賽道！',
      ja: 'PSトレイを ほそながく きって まげ、おもちゃの くるまの レーストラックを つくろう！',
      en: 'Cut PS trays into strips and curve them into a track for mini car races!',
    },
  },
];

/* ── Sub-components ── */
function TwoChoiceQ({ q, optA, optB, value, onChange }: {
  q: Tri; optA: Tri; optB: Tri; value: McChoice | null; onChange: (v: McChoice) => void;
}) {
  return (
    <div className="survey-q-block">
      <p className="survey-q-label"><T s={q} /></p>
      <div className="choice-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {(['A', 'B'] as McChoice[]).map((val, i) => (
          <button key={val} type="button"
            className={`choice-btn ${value === val ? 'choice-btn--selected' : ''}`}
            onClick={() => onChange(val)}
          >
            <T s={i === 0 ? optA : optB} />
          </button>
        ))}
      </div>
    </div>
  );
}

function EmojiQ({ q, value, onChange, low, high }: { q: Tri; value: number; onChange: (v: number) => void; low: Tri; high: Tri }) {
  return (
    <div className="survey-q-block">
      <p className="survey-q-label"><T s={q} /></p>
      <EmojiRating value={value} onChange={onChange} />
      <div className="star-labels-row">
        <span className="star-label"><T s={low} /></span>
        <span className="star-label" style={{ marginLeft: 'auto' }}><T s={high} /></span>
      </div>
    </div>
  );
}

/* ── Main ── */
export function PhaseSurveyPost({ sessionId, onDone }: Props) {
  const [page, setPage] = useState(0);
  const [answers, setAnswers] = useState<PostAnswers>({ p1: null, p2: null, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 });
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof PostAnswers>(k: K, v: PostAnswers[K]) =>
    setAnswers(a => ({ ...a, [k]: v }));

  const page0Done = answers.p1 !== null && answers.p2 !== null && answers.p3 > 0 && answers.p4 > 0 && answers.p5 > 0;
  const page1Done = answers.p6 > 0 && answers.p7 > 0;

  const handleSubmit = () => {
    if (!page1Done) return;
    savePost(sessionId, {
      p1_cap_material: answers.p1!,
      p2_mix_result: answers.p2!,
      p3_ai_interest: answers.p3,
      p4_ai_clarity: answers.p4,
      p5_ai_achievement: answers.p5,
      p6_sort_intention: answers.p6,
      p7_fun: answers.p7,
    });
    setSubmitted(true);
  };

  return (
    <div className="phase-container phase-survey">
      <AnimatePresence mode="wait">

        {submitted ? (
          <motion.div key="ideas"
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}>
            <PlasticMascot state="excited" size={90} />
            <p className="survey-thanks__text"><T s={THANKS} /></p>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', textAlign: 'center', margin: '4px 0 0' }}>
              <T s={IDEAS_TITLE} />
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', textAlign: 'center', margin: 0 }}>
              <T s={IDEAS_INTRO} />
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 460 }}>
              {TOY_IDEAS.map((idea, i) => (
                <motion.div key={idea.material}
                  style={{ display: 'flex', gap: 14, padding: '14px 16px', border: `2px solid ${idea.color}`, borderRadius: 14, background: idea.bg, alignItems: 'flex-start' }}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.15 }}>
                  <div style={{ fontSize: '2rem', lineHeight: 1, flexShrink: 0 }}>{idea.emoji}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: idea.color }}><T s={idea.title} /></span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: idea.color, border: `1.5px solid ${idea.color}`, borderRadius: 6, padding: '1px 6px', background: idea.bg }}>{idea.material}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text)', margin: 0, lineHeight: 1.5 }}><T s={idea.desc} /></p>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.button className="btn-primary" onClick={onDone}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              style={{ marginTop: 4 }}>
              <T s={FINISH_BTN} />
            </motion.button>
          </motion.div>

        ) : page === 0 ? (
          <motion.div key="page0"
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
            <h2 className="survey-title"><T s={TITLE} /></h2>

            <p className="survey-section-head"><T s={HEAD_KNOWLEDGE} /></p>
            <TwoChoiceQ q={P1} optA={P1_A} optB={P1_B} value={answers.p1} onChange={v => set('p1', v)} />
            <TwoChoiceQ q={P2} optA={P2_A} optB={P2_B} value={answers.p2} onChange={v => set('p2', v)} />

            <p className="survey-section-head"><T s={HEAD_AI} /></p>
            <EmojiQ q={P3} value={answers.p3} onChange={v => set('p3', v)} low={P3_LOW} high={P3_HIGH} />
            <EmojiQ q={P4} value={answers.p4} onChange={v => set('p4', v)} low={P4_LOW} high={P4_HIGH} />
            <EmojiQ q={P5} value={answers.p5} onChange={v => set('p5', v)} low={P5_LOW} high={P5_HIGH} />

            <button className="btn-primary" onClick={() => setPage(1)} disabled={!page0Done}
              style={{ opacity: page0Done ? 1 : 0.45, marginTop: 4 }}>
              <T s={NEXT_BTN} />
            </button>
          </motion.div>

        ) : (
          <motion.div key="page1"
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
            <h2 className="survey-title"><T s={TITLE} /></h2>

            <p className="survey-section-head"><T s={HEAD_ACTION} /></p>
            <EmojiQ q={P6} value={answers.p6} onChange={v => set('p6', v)} low={P6_LOW} high={P6_HIGH} />
            <EmojiQ q={P7} value={answers.p7} onChange={v => set('p7', v)} low={P7_LOW} high={P7_HIGH} />

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button className="btn-secondary" onClick={() => setPage(0)}><T s={BACK_BTN} /></button>
              <button className="btn-primary" onClick={handleSubmit} disabled={!page1Done}
                style={{ opacity: page1Done ? 1 : 0.45 }}>
                <T s={SUBMIT_BTN} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
