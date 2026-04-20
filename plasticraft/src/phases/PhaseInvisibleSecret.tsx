import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../components/T';
import { PETBottle, PPCap, BinCharacter } from '../components/PlasticShapes';
import type { Tri } from '../data/plastics';

interface Props {
  onNext: () => void;
}

/* ── Scene text ─────────────────────────────────────────────────────────── */

const SCENE_TITLES: Tri[] = [
  { zh: 'AI 正在掃描你的塑膠…', ja: 'AIがプラスチックをスキャン中…', en: 'AI is scanning your plastic…' },
  { zh: '嗨！我們來自介紹！', ja: 'こんにちは！自己紹介させて！', en: 'Hi! Allow us to introduce ourselves!' },
  { zh: '進入工廠！溫度上升中…', ja: 'さあ工場へ！温度が上がってる…', en: 'Entering the factory! Temperature rising…' },
  { zh: '糟糕！PP 融化了！', ja: 'やばい！PPが溶けた！', en: 'Uh oh! PP melted!' },
  { zh: '分開就都能重生！', ja: '分ければ、どちらも生まれ変われる！', en: 'Separate them — both get a second life!' },
];

const SCENE_BODIES: Tri[] = [
  {
    zh: '你的眼睛看到的是一整個瓶子。但 AI 能看到更多……',
    ja: '目に見えるのは1本のボトル。でもAIにはもっと見えている……',
    en: 'Your eyes see one bottle. But AI can see more…',
  },
  {
    zh: '我是 PET！我在 260°C 才會融化。\n我是 PP！我在 160°C 就融化了。\n我們看起來一樣，但其實完全不同！',
    ja: '僕はPET！260°Cで溶けるよ。\n僕はPP！160°Cで溶けちゃう。\n見た目は同じだけど、全然違うんだ！',
    en: "I'm PET! I melt at 260°C.\nI'm PP! I melt at 160°C.\nWe look the same — but we're totally different!",
  },
  {
    zh: '兩個放在一起進入工廠熔爐……溫度爬升到 160°C！',
    ja: '一緒に工場の炉に入ると……温度が160°Cまで上がる！',
    en: 'Both go into the factory furnace together… temperature climbs to 160°C!',
  },
  {
    zh: 'PP 在 160°C 融化，污染了整批 PET！整批報廢。\n如果分開放，兩個都能被回收再生！',
    ja: 'PPが160°Cで溶け、PETのバッチ全体を汚染！全部ダメになった。\n分けていれば、どちらもリサイクルできたのに！',
    en: 'PP melts at 160°C and contaminates the entire PET batch! Whole batch fails.\nIf separated, both could have been recycled!',
  },
  {
    zh: '這就是為什麼瓶身和瓶蓋必須分開！你的眼睛看不出來，但 AI 可以！',
    ja: 'だからボトルとキャップを分ける必要があるんだ！目には見えないけど、AIにはわかる！',
    en: "This is WHY bottle and cap must be separated! Your eyes can't see it, but AI can!",
  },
];

const BACK_BTN: Tri = { zh: '← 返回', ja: '← 戻る', en: '← Back' };
const NEXT_BTN: Tri = { zh: '下一步 →', ja: '次へ →', en: 'Next →' };
const START_BTN: Tri = { zh: '開始掃描！', ja: 'スキャン開始！', en: 'Start Scanning!' };
const SCAN_HINT: Tri = {
  zh: '現在，讓我們看看你從家裡帶來的東西。你的眼睛可能無法分辨，但 AI 可以！',
  ja: '今、あなたが家から持ってきたものを見てみよう。目では判断できないかもしれないけど、AIにはわかる！',
  en: "Now, let's take a look at what you brought from home. Your eyes may not be able to tell, but AI can!",
};

/* ── Scene 0: AI Scan Visual ─────────────────────────────────────────────── */
function SceneScan() {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 120 200" width={120} height={200} aria-hidden="true">
        {/* Bottle body (PET) — clear light blue */}
        <rect x="24" y="6" width="16" height="20" rx="4" fill="rgba(179,229,252,0.9)" stroke="#4FC3F7" strokeWidth="2" />
        <path d="M 10 26 Q 8 33 8 40 L 56 40 Q 56 33 54 26 Z" fill="rgba(179,229,252,0.85)" stroke="#4FC3F7" strokeWidth="2" />
        <rect x="8" y="38" width="48" height="62" rx="10" fill="rgba(179,229,252,0.85)" stroke="#4FC3F7" strokeWidth="2.5" />
        <path d="M 14 44 Q 16 68 14 92" stroke="rgba(255,255,255,0.55)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <text x="32" y="74" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0277BD">PET ①</text>
        {/* Cap (PP) — solid green */}
        <ellipse cx="32" cy="114" rx="22" ry="7" fill="#66BB6A" stroke="#388E3C" strokeWidth="2" />
        <rect x="10" y="114" width="44" height="16" fill="#4CAF50" />
        <line x1="10" y1="114" x2="10" y2="130" stroke="#388E3C" strokeWidth="2" />
        <line x1="54" y1="114" x2="54" y2="130" stroke="#388E3C" strokeWidth="2" />
        <ellipse cx="32" cy="130" rx="22" ry="7" fill="#43A047" stroke="#388E3C" strokeWidth="2" />
        <text x="32" y="126" textAnchor="middle" fontSize="9" fontWeight="700" fill="white">PP ⑤</text>
      </svg>
      {/* Animated scan beam */}
      <motion.div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(to right, transparent, #6ee7f7, transparent)',
          borderRadius: 2,
          boxShadow: '0 0 8px #6ee7f7',
        }}
        animate={{ y: [-80, 80] }}
        transition={{ duration: 1.8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
      />
      <div style={{
        position: 'absolute',
        bottom: -28,
        fontSize: '0.75rem',
        color: '#6ee7f7',
        fontWeight: 700,
        letterSpacing: '0.05em',
      }}>
        ◈ AI SCAN
      </div>
    </div>
  );
}

/* ── Scene 1: Characters with bottle/cap shapes ──────────────────────────── */
function SceneChars() {
  return (
    <div className="char-pair">
      {/* PET bottle character */}
      <div className="char-block">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <PETBottle showFace size={90} />
        </motion.div>
        <div className="char-bubble-mini">
          {"I'm PET!\nI melt at\n260°C 🔵".split('\n').map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
      {/* PP cap character */}
      <div className="char-block">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          <PPCap showFace size={80} />
        </motion.div>
        <div className="char-bubble-mini">
          {"I'm PP!\nI melt at\n160°C 🟢".split('\n').map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    </div>
  );
}

/* ── Scene 2: Temperature Bar with bottle + cap visuals ─────────────────── */
function SceneTempBar() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%' }}>
      {/* PET bottle + PP cap going into furnace */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <PETBottle size={70} />
          <span style={{ fontSize: '0.72rem', color: '#4FC3F7', fontWeight: 700 }}>PET</span>
        </div>
        <span style={{ fontSize: '1.4rem', color: 'var(--text-dim)', paddingBottom: 12 }}>+</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <PPCap size={55} />
          <span style={{ fontSize: '0.72rem', color: '#66BB6A', fontWeight: 700 }}>PP</span>
        </div>
        <span style={{ fontSize: '1.2rem', color: 'var(--text-dim)', paddingBottom: 12 }}>→ 🔥</span>
      </div>

      {/* Temperature bar */}
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          <span>0°C</span>
          <span style={{ color: '#FF5252', fontWeight: 700 }}>260°C PET</span>
        </div>
        <div className="temp-bar-container">
          <motion.div
            className="temp-bar-fill"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 3, ease: 'linear' }}
          />
          <div className="temp-bar-marker" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.78rem' }}>
          <span />
          <span style={{ color: '#66BB6A' }}>← PP cap is inside too</span>
        </div>
      </div>
    </div>
  );
}

/* ── Scene 3: Contamination with melting PP cap + sad PET bottle ─────────── */
function SceneContaminate() {
  const [contaminated, setContaminated] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleContamComplete = () => {
    setContaminated(true);
    setShaking(true);
    setTimeout(() => { setShaking(false); setFailed(true); }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ fontSize: '0.85rem', color: '#FF5252', textAlign: 'center', fontWeight: 700 }}>
        🌡️ Temperature reaches 160°C…
      </div>

      {/* PP melting + PET sad */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, justifyContent: 'center' }}>
        <motion.div
          animate={shaking ? { x: [-8, 8, -6, 6, 0] } : { x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
        >
          <PPCap melting size={65} />
          <span style={{ fontSize: '0.7rem', color: '#66BB6A', fontWeight: 700 }}>PP melting! 💧</span>
        </motion.div>

        <motion.div
          animate={shaking ? { x: [-8, 8, -6, 6, 0] } : { x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
        >
          <PETBottle sad showFace size={80} />
          <span style={{ fontSize: '0.7rem', color: '#4FC3F7', fontWeight: 700 }}>PET contaminated!</span>
        </motion.div>
      </div>

      {/* Batch contamination bar */}
      <div style={{ position: 'relative', width: 200, height: 36, overflow: 'hidden', borderRadius: 10, border: '2px solid #4FC3F7', background: 'rgba(79,195,247,0.1)' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4FC3F7' }}>PET Batch</span>
        </div>
        <motion.div
          style={{
            position: 'absolute', top: 0, left: 0, height: '100%',
            background: 'rgba(239,83,80,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          onAnimationComplete={!contaminated ? handleContamComplete : undefined}
          transition={{ duration: 2, ease: 'easeIn' }}
        >
          {contaminated && <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'white' }}>PP contaminated!</span>}
        </motion.div>
      </div>

      <AnimatePresence>
        {failed && (
          <motion.p
            className="batch-fail-label"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            BATCH FAILED ✕
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Scene 4: Resolution — separate bins with characters ─────────────────── */
function SceneResolve() {
  return (
    <div className="bin-pair">
      <motion.div
        className="bin-card"
        style={{ borderColor: '#4FC3F7' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <BinCharacter type="blue" size={70} />
        <div style={{ fontSize: '0.95rem', color: '#4FC3F7', fontWeight: 700 }}>PET ①</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Bottle body</div>
        <div className="bin-card__check">✓</div>
      </motion.div>
      <motion.div
        className="bin-card"
        style={{ borderColor: '#81C784' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <BinCharacter type="green" size={70} />
        <div style={{ fontSize: '0.95rem', color: '#81C784', fontWeight: 700 }}>PP ⑤</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Bottle cap</div>
        <div className="bin-card__check">✓</div>
      </motion.div>
    </div>
  );
}

const SCENE_VISUALS = [SceneScan, SceneChars, SceneTempBar, SceneContaminate, SceneResolve];

/* ── Main Component ──────────────────────────────────────────────────────── */
export function PhaseInvisibleSecret({ onNext }: Props) {
  const [scene, setScene] = useState(0);

  const advance = () => {
    if (scene < 4) setScene(s => s + 1);
    else onNext();
  };

  const goBack = () => {
    if (scene > 0) setScene(s => s - 1);
  };

  const Visual = SCENE_VISUALS[scene];

  return (
    <div className="phase-container phase-invisible">
      <AnimatePresence mode="wait">
        <motion.div
          key={scene}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%' }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.3 }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', margin: 0, textAlign: 'center' }}>
            <T s={SCENE_TITLES[scene]} />
          </h2>

          <div className="scene-visual">
            <Visual />
          </div>

          <p style={{ fontSize: '1rem', color: 'var(--text)', textAlign: 'center', whiteSpace: 'pre-line', margin: 0, lineHeight: 1.6 }}>
            <T s={SCENE_BODIES[scene]} />
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="progress-dots">
        {[0, 1, 2, 3, 4].map(i => (
          <span key={i} className={`dot ${scene === i ? 'dot--active' : ''}`} />
        ))}
      </div>

      {/* Scan hint before Start Scanning button */}
      {scene === 4 && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ fontSize: '0.9rem', color: 'var(--primary)', textAlign: 'center', margin: 0, fontWeight: 600, maxWidth: 380 }}
        >
          <T s={SCAN_HINT} />
        </motion.p>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        {scene > 0 && (
          <button className="btn-secondary" onClick={goBack}>
            <T s={BACK_BTN} />
          </button>
        )}
        <button className="btn-primary" onClick={advance}>
          <T s={scene < 4 ? NEXT_BTN : START_BTN} />
        </button>
      </div>
    </div>
  );
}
