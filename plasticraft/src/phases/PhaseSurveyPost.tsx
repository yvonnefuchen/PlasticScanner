import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../components/T';
import { StarRating } from '../components/StarRating';
import { PlasticMascot } from '../components/PlasticMascot';
import { useLang } from '../context/LangContext';
import { savePost, type McChoice } from '../services/survey';
import type { Tri } from '../data/plastics';

interface Props {
  sessionId: string;
  onDone: () => void;
}

type PostAnswers = {
  s1q1: McChoice | null;
  s1q2: McChoice | null;
  s1q3: McChoice | null;
  s1q4: McChoice | null;
  s2q5: number;
  s2q6: number;
  s2q7: string;
  s3q8: number;
  s3q9: number;
  s4q10: McChoice | null;
  s4q11: number;
  s4q12: string;
};

const MC_VALS: McChoice[] = ['A', 'B', 'C', 'D'];

/* ── Strings ── */
const TITLE: Tri = { zh: '幾個小問題！', ja: 'ちょっとした質問！', en: 'Quick Questions!' };
const S1_HEAD: Tri = { zh: 'Section 1：知識檢測', ja: 'Section 1：知識チェック', en: 'Section 1: Knowledge Check' };
const S2_HEAD: Tri = { zh: 'Section 2：動機與行為', ja: 'Section 2：モチベーションと行動', en: 'Section 2: Motivation & Behaviour' };
const S3_HEAD: Tri = { zh: 'Section 3：AI 掃描體驗', ja: 'Section 3：AIスキャン体験', en: 'Section 3: AI Scanner Experience' };
const S4_HEAD: Tri = { zh: 'Section 4：PP 製作體驗', ja: 'Section 4：PP製作体験', en: 'Section 4: Making Experience' };
const NEXT_BTN: Tri = { zh: '下一頁', ja: '次へ', en: 'Next' };
const SUBMIT_BTN: Tri = { zh: '送出！', ja: '送信！', en: 'Submit!' };
const THANKS: Tri = { zh: '感謝參與！你棒棒的！🎉', ja: 'ご参加ありがとう！すごいね！🎉', en: 'Thank you for participating! You were amazing! 🎉' };
const IDEAS_TITLE: Tri = { zh: '塑膠可以變成新玩具！💡', ja: 'プラスチックが新しいおもちゃに！💡', en: 'Plastic can become something new! 💡' };
const IDEAS_INTRO: Tri = {
  zh: '你今天使用的材料，還可以做成更多東西！',
  ja: '今日使った素材で、もっとたくさんのものが作れるよ！',
  en: 'The materials you used today can become so much more!',
};
const FINISH_BTN: Tri = { zh: '完成！', ja: '完成！', en: 'Finish!' };

/* Section 1 */
const S1Q1: Tri = { zh: '1. PET 瓶身和 PP 瓶蓋分開回收的主要原因是什麼？', ja: '1. PETボトル本体とPPキャップを別々にリサイクルする主な理由は？', en: '1. What is the main reason PET bottle bodies and PP caps must be separated for recycling?' };
const S1Q1_OPTS: Tri[] = [
  { zh: 'A) 顏色不同', ja: 'A) 色が違うから', en: 'A) Different colours' },
  { zh: 'B) 融點不同 — PP 160°C，PET 260°C', ja: 'B) 融点が違う — PP 160°C、PET 260°C', en: 'B) Different melting points — PP 160°C, PET 260°C' },
  { zh: 'C) PET 比較重', ja: 'C) PETの方が重いから', en: 'C) PET is heavier' },
  { zh: 'D) 垃圾桶大小不同', ja: 'D) ゴミ箱のサイズが違うから', en: 'D) Different bin sizes' },
];

const S1Q2: Tri = { zh: '2. 今天工作坊中，瓶蓋是什麼材料做的？', ja: '2. 今日のワークショップで、キャップは何の素材でしたか？', en: "2. In today's workshop, what material were the bottle caps made of?" };
const S1Q2_OPTS: Tri[] = [
  { zh: 'A) PET', ja: 'A) PET', en: 'A) PET' },
  { zh: 'B) PS', ja: 'B) PS', en: 'B) PS' },
  { zh: 'C) PP', ja: 'C) PP', en: 'C) PP' },
  { zh: 'D) PVC', ja: 'D) PVC', en: 'D) PVC' },
];

const S1Q3: Tri = { zh: '3. 如果 PP 和 PET 一起進入同一批工廠熔爐，會發生什麼事？', ja: '3. PPとPETが同じ工場バッチで一緒にリサイクルされたら、どうなる？', en: '3. What happens if PP and PET are recycled together in the same factory batch?' };
const S1Q3_OPTS: Tri[] = [
  { zh: 'A) 可以混合，沒問題', ja: 'A) 問題なく混ざる', en: 'A) They mix fine' },
  { zh: 'B) PP 先融化，污染整批 PET，整批報廢', ja: 'B) PPが先に溶けてPETバッチ全体を汚染し、全部ダメになる', en: 'B) PP melts first and contaminates PET, ruining the batch' },
  { zh: 'C) PET 先融化', ja: 'C) PETが先に溶ける', en: 'C) PET melts first' },
  { zh: 'D) 顏色混在一起，很漂亮', ja: 'D) 色がきれいに混ざる', en: 'D) Colours blend nicely' },
];

const S1Q4: Tri = { zh: '4. 在日本，PP 瓶蓋應該放進哪個垃圾桶？', ja: '4. 日本では、PPキャップはどのゴミ箱に入れるべき？', en: '4. In Japan, which bin should a PP bottle cap go into?' };
const S1Q4_OPTS: Tri[] = [
  { zh: 'A) PETボトル', ja: 'A) PETボトル', en: 'A) PETボトル bin' },
  { zh: 'B) プラスチック', ja: 'B) プラスチック', en: 'B) プラスチック bin' },
  { zh: 'C) 燃えるゴミ', ja: 'C) 燃えるゴミ', en: 'C) 燃えるゴミ bin' },
  { zh: 'D) 哪個都可以', ja: 'D) どのゴミ箱でも', en: 'D) Any bin' },
];

/* Section 2 */
const S2Q5: Tri = { zh: '5. 今天之後，我打算在家回收時把瓶蓋和瓶身分開。', ja: '5. 今日以降、家でリサイクルするときボトルキャップをボトルから外すつもりだ。', en: '5. After today, I plan to separate bottle caps from bottles when recycling at home.' };
const S2Q5_LOW: Tri = { zh: '不同意', ja: '同意しない', en: 'Disagree' };
const S2Q5_HIGH: Tri = { zh: '非常同意', ja: '強く同意する', en: 'Agree' };

const S2Q6: Tri = { zh: '6. 我現在有信心向別人解釋為什麼塑膠必須分類。', ja: '6. 今は、なぜプラスチックを分別しなければならないか、他人に説明できる自信がある。', en: '6. I now feel confident explaining to someone else why plastics must be separated.' };
const S2Q6_LOW: Tri = { zh: '完全沒信心', ja: '全く自信なし', en: 'Not confident' };
const S2Q6_HIGH: Tri = { zh: '非常有信心', ja: 'とても自信あり', en: 'Very confident' };

const S2Q7: Tri = { zh: '7. 請用自己的話解釋，為什麼瓶身和瓶蓋必須放進不同的回收桶？', ja: '7. 自分の言葉で説明して：なぜボトル本体とキャップを別々のゴミ箱に入れなければならない？', en: '7. In your own words, explain why the bottle body and the bottle cap must go into different recycling bins.' };
const S2Q7_PH: Tri = { zh: '在這裡寫下你的解釋…', ja: 'ここに説明を書いてみよう…', en: 'Write your explanation here…' };

/* Section 3 */
const S3Q8: Tri = { zh: '8. AI 掃描儀幫助我理解了單靠眼睛看不出來的東西。', ja: '8. AIスキャナーは、目だけでは見えないものを理解するのに役立った。', en: '8. The AI scanner helped me understand something I could not see with my eyes alone.' };
const S3Q8_LOW: Tri = { zh: '不同意', ja: '同意しない', en: 'Disagree' };
const S3Q8_HIGH: Tri = { zh: '非常同意', ja: '強く同意する', en: 'Agree' };

const S3Q9: Tri = { zh: '9. 在螢幕上看到融點差異讓我理解了為什麼分類很重要。', ja: '9. スクリーンで融点の違いを見て、なぜ分別が重要か理解できた。', en: '9. Seeing the melting point difference on the screen made me understand why separation matters.' };
const S3Q9_LOW: Tri = { zh: '不同意', ja: '同意しない', en: 'Disagree' };
const S3Q9_HIGH: Tri = { zh: '非常同意', ja: '強く同意する', en: 'Agree' };

/* Section 4 */
const S4Q10: Tri = { zh: '10. 當你用熨斗壓 PP 瓶蓋碎片時，你在對材料做什麼？', ja: '10. アイロンをPPキャップの破片に当てたとき、素材に何をしていた？', en: '10. When you pressed the iron onto the PP cap pieces, what were you doing to the material?' };
const S4Q10_OPTS: Tri[] = [
  { zh: 'A) 融化它 — PP 達到 160°C 融點', ja: 'A) 溶かしている — PPが融点160°Cに達する', en: 'A) Melting it — PP reaches its 160°C melting point' },
  { zh: 'B) 燃燒它', ja: 'B) 燃やしている', en: 'B) Burning it' },
  { zh: 'C) 讓它變硬', ja: 'C) 硬くしている', en: 'C) Making it harder' },
  { zh: 'D) 只是改變它的顏色', ja: 'D) 色だけ変えている', en: 'D) Only changing its colour' },
];

const S4Q11: Tri = { zh: '11. 製作 PP 鑰匙圈幫助我記住 PP 的融化溫度比 PET 低。', ja: '11. PPキーホルダーを作ることで、PPの融点がPETより低いことを覚えられた。', en: '11. Making the PP keychain helped me remember that PP melts at a lower temperature than PET.' };
const S4Q11_LOW: Tri = { zh: '不同意', ja: '同意しない', en: 'Disagree' };
const S4Q11_HIGH: Tri = { zh: '非常同意', ja: '強く同意する', en: 'Agree' };

const S4Q12: Tri = { zh: '12. 今天之後，你回收時會有什麼不同的做法？', ja: '12. 今日以降、家でリサイクルするとき、何か違うことをする？', en: '12. What is one thing you will do differently when recycling at home after today?' };
const S4Q12_PH: Tri = { zh: '在這裡寫下你的想法…', ja: 'ここに考えを書いてみよう…', en: 'Write your thoughts here…' };

/* ── Toy Ideas Data ── */
interface ToyIdea {
  emoji: string;
  material: string;
  color: string;
  bg: string;
  title: Tri;
  desc: Tri;
}

const TOY_IDEAS: ToyIdea[] = [
  {
    emoji: '🌱',
    material: '🔵 PET ①',
    color: '#4FC3F7',
    bg: 'rgba(79,195,247,0.1)',
    title: { zh: '迷你溫室', ja: 'ミニ温室', en: 'Mini Terrarium' },
    desc: {
      zh: '把 PET 瓶子切開，填入泥土和小植物。自製一個桌上小溫室！',
      ja: 'PETボトルを切って、土と小さな植物を入れよう。自分だけの卓上温室ができあがり！',
      en: 'Cut open a PET bottle, fill with soil and tiny plants. Make your own desktop greenhouse!',
    },
  },
  {
    emoji: '🎨',
    material: '🟢 PP ⑤',
    color: '#81C784',
    bg: 'rgba(129,199,132,0.1)',
    title: { zh: 'PP 瓶蓋馬賽克畫', ja: 'PPキャップモザイクアート', en: 'PP Cap Mosaic Art' },
    desc: {
      zh: '收集不同顏色的 PP 瓶蓋，排列黏貼成圖案，做成牆壁裝飾！',
      ja: 'カラフルなPPキャップを集めて、模様に並べて貼り付け、壁の飾りを作ろう！',
      en: 'Collect colorful PP bottle caps. Arrange and glue them into patterns to make wall art!',
    },
  },
  {
    emoji: '🏎️',
    material: '🔴 PS ⑥',
    color: '#EF5350',
    bg: 'rgba(239,83,80,0.1)',
    title: { zh: 'PS 托盤迷你跑道', ja: 'PSトレイミニレーストラック', en: 'PS Tray Mini Race Track' },
    desc: {
      zh: '把 PS 托盤剪成長條，彎曲成跑道形狀，打造小車車的競速賽道！',
      ja: 'PSトレイを細長く切って曲げ、おもちゃの車のレーストラックを作ろう！',
      en: 'Cut PS trays into strips, curve them into a track shape to build a mini car race track!',
    },
  },
];

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

function LikertQuestion({ q, value, onChange, low, high }: { q: Tri; value: number; onChange: (v: number) => void; low: Tri; high: Tri }) {
  return (
    <div className="survey-q-block">
      <p className="survey-q-label"><T s={q} /></p>
      <StarRating value={value} onChange={onChange} />
      <div className="star-labels-row">
        <span className="star-label"><T s={low} /></span>
        <span className="star-label" style={{ marginLeft: 'auto' }}><T s={high} /></span>
      </div>
    </div>
  );
}

function OpenQuestion({ q, placeholder, value, onChange }: { q: Tri; placeholder: Tri; value: string; onChange: (v: string) => void }) {
  const { lang } = useLang();
  return (
    <div className="survey-q-block">
      <p className="survey-q-label"><T s={q} /></p>
      <textarea className="survey-open-text" rows={3} value={value} placeholder={placeholder[lang]} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

/* ── Main ── */
export function PhaseSurveyPost({ sessionId, onDone }: Props) {
  const [page, setPage] = useState(0);
  const [answers, setAnswers] = useState<PostAnswers>({
    s1q1: null, s1q2: null, s1q3: null, s1q4: null,
    s2q5: 0, s2q6: 0, s2q7: '',
    s3q8: 0, s3q9: 0,
    s4q10: null, s4q11: 0, s4q12: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof PostAnswers>(k: K, v: PostAnswers[K]) =>
    setAnswers(a => ({ ...a, [k]: v }));

  const page0Done = answers.s1q1 !== null && answers.s1q2 !== null && answers.s1q3 !== null && answers.s1q4 !== null;
  const page1Done = answers.s2q5 > 0 && answers.s2q6 > 0 && answers.s2q7.trim().length > 0;
  const page2Done = answers.s3q8 > 0 && answers.s3q9 > 0 && answers.s4q10 !== null && answers.s4q11 > 0 && answers.s4q12.trim().length > 0;

  const handleSubmit = () => {
    if (!page2Done) return;
    savePost(sessionId, {
      s1q1_main_reason: answers.s1q1!,
      s1q2_cap_material: answers.s1q2!,
      s1q3_contamination: answers.s1q3!,
      s1q4_japan_bin: answers.s1q4!,
      s2q5_plan_separate: answers.s2q5,
      s2q6_confidence: answers.s2q6,
      s2q7_open: answers.s2q7.trim(),
      s3q8_ai_helped: answers.s3q8,
      s3q9_melting_point: answers.s3q9,
      s4q10_ironing: answers.s4q10!,
      s4q11_keychain: answers.s4q11,
      s4q12_open: answers.s4q12.trim(),
    });
    setSubmitted(true);
  };

  return (
    <div className="phase-container phase-survey">
      <AnimatePresence mode="wait">

        {/* ── Thanks + Toy Ideas (after submit) ── */}
        {submitted ? (
          <motion.div
            key="ideas"
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
          >
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
                <motion.div
                  key={idea.material}
                  style={{
                    display: 'flex', gap: 14, padding: '14px 16px',
                    border: `2px solid ${idea.color}`, borderRadius: 14,
                    background: idea.bg, alignItems: 'flex-start',
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                >
                  <div style={{ fontSize: '2rem', lineHeight: 1, flexShrink: 0 }}>{idea.emoji}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: idea.color }}><T s={idea.title} /></span>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 700, color: idea.color,
                        border: `1.5px solid ${idea.color}`, borderRadius: 6,
                        padding: '1px 6px', background: idea.bg,
                      }}>{idea.material}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text)', margin: 0, lineHeight: 1.5 }}><T s={idea.desc} /></p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              className="btn-primary"
              onClick={onDone}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              style={{ marginTop: 4 }}
            >
              <T s={FINISH_BTN} />
            </motion.button>
          </motion.div>

        ) : page === 0 ? (
          <motion.div key="page0" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
            <h2 className="survey-title"><T s={TITLE} /></h2>
            <p className="survey-section-head"><T s={S1_HEAD} /></p>
            <McQuestion q={S1Q1} opts={S1Q1_OPTS} value={answers.s1q1} onChange={v => set('s1q1', v)} />
            <McQuestion q={S1Q2} opts={S1Q2_OPTS} value={answers.s1q2} onChange={v => set('s1q2', v)} />
            <McQuestion q={S1Q3} opts={S1Q3_OPTS} value={answers.s1q3} onChange={v => set('s1q3', v)} />
            <McQuestion q={S1Q4} opts={S1Q4_OPTS} value={answers.s1q4} onChange={v => set('s1q4', v)} />
            <button className="btn-primary" onClick={() => setPage(1)} disabled={!page0Done} style={{ opacity: page0Done ? 1 : 0.45, marginTop: 4 }}>
              <T s={NEXT_BTN} />
            </button>
          </motion.div>

        ) : page === 1 ? (
          <motion.div key="page1" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
            <h2 className="survey-title"><T s={TITLE} /></h2>
            <p className="survey-section-head"><T s={S2_HEAD} /></p>
            <LikertQuestion q={S2Q5} value={answers.s2q5} onChange={v => set('s2q5', v)} low={S2Q5_LOW} high={S2Q5_HIGH} />
            <LikertQuestion q={S2Q6} value={answers.s2q6} onChange={v => set('s2q6', v)} low={S2Q6_LOW} high={S2Q6_HIGH} />
            <OpenQuestion q={S2Q7} placeholder={S2Q7_PH} value={answers.s2q7} onChange={v => set('s2q7', v)} />
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button className="btn-secondary" onClick={() => setPage(0)}>←</button>
              <button className="btn-primary" onClick={() => setPage(2)} disabled={!page1Done} style={{ opacity: page1Done ? 1 : 0.45 }}>
                <T s={NEXT_BTN} />
              </button>
            </div>
          </motion.div>

        ) : (
          <motion.div key="page2" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
            <h2 className="survey-title"><T s={TITLE} /></h2>
            <p className="survey-section-head"><T s={S3_HEAD} /></p>
            <LikertQuestion q={S3Q8} value={answers.s3q8} onChange={v => set('s3q8', v)} low={S3Q8_LOW} high={S3Q8_HIGH} />
            <LikertQuestion q={S3Q9} value={answers.s3q9} onChange={v => set('s3q9', v)} low={S3Q9_LOW} high={S3Q9_HIGH} />
            <p className="survey-section-head"><T s={S4_HEAD} /></p>
            <McQuestion q={S4Q10} opts={S4Q10_OPTS} value={answers.s4q10} onChange={v => set('s4q10', v)} />
            <LikertQuestion q={S4Q11} value={answers.s4q11} onChange={v => set('s4q11', v)} low={S4Q11_LOW} high={S4Q11_HIGH} />
            <OpenQuestion q={S4Q12} placeholder={S4Q12_PH} value={answers.s4q12} onChange={v => set('s4q12', v)} />
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button className="btn-secondary" onClick={() => setPage(1)}>←</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={!page2Done} style={{ opacity: page2Done ? 1 : 0.45 }}>
                <T s={SUBMIT_BTN} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
