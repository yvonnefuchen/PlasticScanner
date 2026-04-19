import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../components/T';
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
    en: 'This is WHY bottle and cap must be separated! Your eyes can\'t see it, but AI can!',
  },
];

const NEXT_BTN: Tri = { zh: '下一步 →', ja: '次へ →', en: 'Next →' };
const START_BTN: Tri = { zh: '開始掃描！', ja: 'スキャン開始！', en: 'Start Scanning!' };

/* ── Scene 0: AI Scan Visual ─────────────────────────────────────────────── */
function SceneScan() {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 120 200" width={120} height={200} aria-hidden="true">
        {/* Bottle body (PET) */}
        <rect x="35" y="60" width="50" height="120" rx="14" fill="#B3E5FC" stroke="#4FC3F7" strokeWidth="2.5" />
        <text x="60" y="125" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0277BD">PET ①</text>
        {/* Bottle cap (PP) */}
        <rect x="42" y="38" width="36" height="26" rx="8" fill="#FFD54F" stroke="#F9A825" strokeWidth="2.5" />
        <text x="60" y="56" textAnchor="middle" fontSize="9" fontWeight="700" fill="#E65100">PP ⑤</text>
        {/* Neck */}
        <rect x="47" y="56" width="26" height="8" rx="3" fill="#90CAF9" stroke="#4FC3F7" strokeWidth="1.5" />
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
      {/* AI scan label */}
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

/* ── Scene 1: Characters ─────────────────────────────────────────────────── */
function SceneChars() {
  return (
    <div className="char-pair">
      {/* PET character */}
      <div className="char-block">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 80 90" width={80} height={90} aria-hidden="true">
            <circle cx="40" cy="38" r="32" fill="#4FC3F7" stroke="#0288D1" strokeWidth="2.5" />
            <circle cx="29" cy="32" r="5" fill="white" />
            <circle cx="51" cy="32" r="5" fill="white" />
            <circle cx="30" cy="33" r="2.5" fill="#01579B" />
            <circle cx="52" cy="33" r="2.5" fill="#01579B" />
            <path d="M 28 48 Q 40 56 52 48" stroke="#01579B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <text x="40" y="80" textAnchor="middle" fontSize="11" fontWeight="800" fill="#0277BD">PET ①</text>
            <text x="40" y="92" textAnchor="middle" fontSize="9" fill="#4FC3F7">260°C</text>
          </svg>
        </motion.div>
        <div className="char-bubble-mini">
          {'I\'m PET!\nI melt at\n260°C 🔵'.split('\n').map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
      {/* PP character */}
      <div className="char-block">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          <svg viewBox="0 0 80 90" width={80} height={90} aria-hidden="true">
            <circle cx="40" cy="38" r="32" fill="#FFD54F" stroke="#F9A825" strokeWidth="2.5" />
            <circle cx="29" cy="32" r="5" fill="white" />
            <circle cx="51" cy="32" r="5" fill="white" />
            <circle cx="30" cy="33" r="2.5" fill="#E65100" />
            <circle cx="52" cy="33" r="2.5" fill="#E65100" />
            <path d="M 28 48 Q 40 56 52 48" stroke="#E65100" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <text x="40" y="80" textAnchor="middle" fontSize="11" fontWeight="800" fill="#E65100">PP ⑤</text>
            <text x="40" y="92" textAnchor="middle" fontSize="9" fill="#F9A825">160°C</text>
          </svg>
        </motion.div>
        <div className="char-bubble-mini">
          {'I\'m PP!\nI melt at\n160°C 🟡'.split('\n').map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    </div>
  );
}

/* ── Scene 2: Temperature Bar ─────────────────────────────────────────────── */
function SceneTempBar() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%' }}>
      {/* Bottle icon */}
      <svg viewBox="0 0 120 60" width={120} height={60} aria-hidden="true">
        <rect x="20" y="20" width="32" height="32" rx="6" fill="#B3E5FC" stroke="#4FC3F7" strokeWidth="1.5" />
        <text x="36" y="40" textAnchor="middle" fontSize="8" fill="#0277BD" fontWeight="700">PET</text>
        <rect x="68" y="20" width="32" height="32" rx="6" fill="#FFD54F" stroke="#F9A825" strokeWidth="1.5" />
        <text x="84" y="40" textAnchor="middle" fontSize="8" fill="#E65100" fontWeight="700">PP</text>
        <text x="60" y="42" textAnchor="middle" fontSize="16" fill="#aaa">+</text>
        <text x="60" y="14" textAnchor="middle" fontSize="9" fill="var(--text-dim)">→ factory furnace</text>
      </svg>

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
          <span style={{ color: '#FFD54F' }}>← PP cap is inside too</span>
        </div>
      </div>
    </div>
  );
}

/* ── Scene 3: Contamination ───────────────────────────────────────────────── */
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textAlign: 'center' }}>
        🌡️ Temperature reaches 160°C…
      </div>
      <motion.div
        animate={shaking ? { x: [-8, 8, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="batch-container">
          {/* PET batch background */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4FC3F7' }}>PET Batch</span>
          </div>
          {/* Contamination overlay */}
          <motion.div
            style={{
              position: 'absolute', top: 0, left: 0, height: '100%',
              background: 'rgba(239,83,80,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            initial={{ width: '0%' }}
            animate={{ width: contaminated ? '100%' : '100%' }}
            onAnimationComplete={!contaminated ? handleContamComplete : undefined}
            transition={{ duration: 2, ease: 'easeIn' }}
          >
            {contaminated && <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'white' }}>PP contaminated!</span>}
          </motion.div>
        </div>
      </motion.div>
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

/* ── Scene 4: Resolution — separate bins ─────────────────────────────────── */
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
        <div style={{ fontSize: '2rem' }}>🔵</div>
        <div style={{ fontSize: '0.95rem', color: '#4FC3F7' }}>PET ①</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Bottle body</div>
        <div className="bin-card__check">✓</div>
      </motion.div>
      <motion.div
        className="bin-card"
        style={{ borderColor: '#81C784' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div style={{ fontSize: '2rem' }}>🟢</div>
        <div style={{ fontSize: '0.95rem', color: '#81C784' }}>PP ⑤</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Bottle cap</div>
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
    if (scene < 4) {
      setScene(s => s + 1);
    } else {
      onNext();
    }
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

      <button className="btn-primary" onClick={advance}>
        <T s={scene < 4 ? NEXT_BTN : START_BTN} />
      </button>
    </div>
  );
}
