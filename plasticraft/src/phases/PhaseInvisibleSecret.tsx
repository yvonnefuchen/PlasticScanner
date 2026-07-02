import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../components/T';
import { PETBottle, PPCap, BinCharacter } from '../components/PlasticShapes';
import type { Tri } from '../data/plastics';

interface Props {
  onNext: () => void;
}

/* ── Scene text ─────────────────────────────────────────────────────────── */

const SCENE_TITLES: Tri[] = [
  { zh: 'AI 正在掃描你的塑膠…', ja: 'AIが プラスチックを スキャンしてるよ…', en: 'AI is scanning your plastic…' },
  { zh: '嗨！我們來自介紹！', ja: 'こんにちは！じこしょうかい させて！', en: 'Hi! Allow us to introduce ourselves!' },
  { zh: '進入工廠！溫度上升中…', ja: 'さあ こうじょうへ！おんどが あがってるよ…', en: 'Entering the factory! Temperature rising…' },
  { zh: '糟糕！PP 融化了！', ja: 'やばい！PPが とけた！', en: 'Uh oh! PP melted!' },
  { zh: '分開就都能重生！', ja: 'わければ、どちらも うまれかわれる！', en: 'Separate them — both get a second life!' },
];

const SCENE_BODIES: Tri[] = [
  {
    zh: '你的眼睛看到的是一整個瓶子。但 AI 能看到更多……',
    ja: 'めに みえるのは 1本の ボトル。でも AIには もっと みえているんだ……',
    en: 'Your eyes see one bottle. But AI can see more…',
  },
  {
    zh: '我是 PET！我在 260°C 才會融化。\n我是 PP！我在 160°C 就融化了。\n我們看起來一樣，但其實完全不同！',
    ja: 'ぼくは PET！260°Cで とけるよ。\nぼくは PP！160°Cで とけちゃう。\nみため は おなじだけど、ぜんぜん ちがうんだ！',
    en: "I'm PET! I melt at 260°C.\nI'm PP! I melt at 160°C.\nWe look the same — but we're totally different!",
  },
  {
    zh: '兩個放在一起進入工廠熔爐……溫度爬升到 160°C！',
    ja: 'いっしょに こうじょうの ろに いれると……おんどが 160°Cまで あがる！',
    en: 'Both go into the factory furnace together… temperature climbs to 160°C!',
  },
  {
    zh: 'PP 在 160°C 融化，污染了整批 PET！整批報廢。\n如果分開放，兩個都能被回收再生！',
    ja: 'PPが 160°Cで とけて、PETの バッチ ぜんぶを よごしちゃった！ぜんぶ ダメに なった。\nわけていれば、どちらも リサイクルできたのに！',
    en: 'PP melts at 160°C and contaminates the entire PET batch! Whole batch fails.\nIf separated, both could have been recycled!',
  },
  {
    zh: '這就是為什麼瓶身和瓶蓋必須分開！你的眼睛看不出來，但 AI 可以！',
    ja: 'だから ボトルと キャップを わける ひつようが あるんだ！めには みえないけど、AIには わかる！',
    en: "This is WHY bottle and cap must be separated! Your eyes can't see it, but AI can!",
  },
];

const BACK_BTN: Tri = { zh: '← 返回', ja: '← もどる', en: '← Back' };
const NEXT_BTN: Tri = { zh: '下一步 →', ja: 'つぎへ →', en: 'Next →' };
const START_BTN: Tri = { zh: '開始掃描！', ja: 'スキャンを はじめる！', en: 'Start Scanning!' };
const SCAN_HINT: Tri = {
  zh: '現在，讓我們看看你從家裡帶來的東西。你的眼睛可能無法分辨，但 AI 可以！',
  ja: 'いま、あなたが いえから もってきた ものを みてみよう。めでは わからないかもしれないけど、AIには わかる！',
  en: "Now, let's take a look at what you brought from home. Your eyes may not be able to tell, but AI can!",
};

/* ── Scene 0: AI X-ray Scan — cap on bottle, reveal two materials ─────────── */
function SceneScan() {
  const [scanned, setScanned] = useState(false);

  /* animate from grey → material colour */
  const cap = {
    top:    scanned ? '#66BB6A' : '#b8b8b8',
    side:   scanned ? '#4CAF50' : '#a8a8a8',
    bot:    scanned ? '#43A047' : '#999999',
    stroke: scanned ? '#388E3C' : '#777777',
  };
  const pet = {
    fill:   scanned ? 'rgba(179,229,252,0.88)' : 'rgba(170,170,170,0.45)',
    stroke: scanned ? '#4FC3F7'                : '#888888',
  };
  const t = { duration: 0.65 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      {/* X-ray frame */}
      <div style={{ position: 'relative', width: 280, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Bottle + cap as one object */}
        <svg viewBox="0 0 100 148" width={110} height={163} aria-hidden="true">
          {/* PP Cap */}
          <motion.ellipse cx="50" cy="10" rx="24" ry="8"
            animate={{ fill: cap.top, stroke: cap.stroke }} transition={t} strokeWidth="2" />
          <motion.rect x="26" y="10" width="48" height="18"
            animate={{ fill: cap.side }} transition={t} />
          <motion.line x1="26" y1="10" x2="26" y2="28"
            animate={{ stroke: cap.stroke }} transition={t} strokeWidth="2" />
          <motion.line x1="74" y1="10" x2="74" y2="28"
            animate={{ stroke: cap.stroke }} transition={t} strokeWidth="2" />
          <motion.ellipse cx="50" cy="28" rx="24" ry="8"
            animate={{ fill: cap.bot, stroke: cap.stroke }} transition={t} strokeWidth="2" />

          {/* PET Neck */}
          <motion.rect x="38" y="26" width="24" height="14" rx="3"
            animate={{ fill: pet.fill, stroke: pet.stroke }} transition={t} strokeWidth="1.5" />

          {/* PET Shoulder */}
          <motion.path d="M 14 41 Q 12 49 12 55 L 88 55 Q 88 49 86 41 Z"
            animate={{ fill: pet.fill, stroke: pet.stroke }} transition={t} strokeWidth="1.5" />

          {/* PET Body */}
          <motion.rect x="12" y="53" width="76" height="88" rx="12"
            animate={{ fill: pet.fill, stroke: pet.stroke }} transition={t} strokeWidth="2.5" />

          {/* Highlight line (PET only, after reveal) */}
          {scanned && (
            <motion.path d="M 19 60 Q 21 92 19 132"
              stroke="rgba(255,255,255,0.5)" strokeWidth="3" fill="none" strokeLinecap="round"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} />
          )}
        </svg>

        {/* PP label — top right */}
        <AnimatePresence>
          {scanned && (
            <motion.div
              initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}
              style={{
                position: 'absolute', right: 4, top: 16,
                background: 'rgba(76,175,80,0.18)', border: '1.5px solid #66BB6A',
                borderRadius: 8, padding: '5px 10px', textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#66BB6A' }}>PP ⑤</div>
              <div style={{ fontSize: '0.7rem', color: '#A5D6A7' }}>melt 160°C</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PET label — bottom left */}
        <AnimatePresence>
          {scanned && (
            <motion.div
              initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.18 }}
              style={{
                position: 'absolute', left: 4, top: 102,
                background: 'rgba(79,195,247,0.18)', border: '1.5px solid #4FC3F7',
                borderRadius: 8, padding: '5px 10px', textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4FC3F7' }}>PET ①</div>
              <div style={{ fontSize: '0.7rem', color: '#81D4FA' }}>melt 260°C</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scan beam (sweeps twice, then stops) */}
        {!scanned && (
          <>
            <motion.div
              style={{
                position: 'absolute', left: 0, right: 0, height: 3,
                background: 'linear-gradient(to right, transparent, #6ee7f7, transparent)',
                borderRadius: 2, boxShadow: '0 0 10px 3px rgba(110,231,247,0.7)',
              }}
              animate={{ y: [-82, 82] }}
              transition={{ duration: 1.8, repeat: 1, repeatType: 'loop', ease: 'easeInOut' }}
              onAnimationComplete={() => setScanned(true)}
            />
            <motion.div
              style={{
                position: 'absolute', left: 0, right: 0, height: 50, pointerEvents: 'none',
                background: 'radial-gradient(ellipse at 50% 50%, rgba(110,231,247,0.10) 0%, transparent 70%)',
              }}
              animate={{ y: [-82, 82] }}
              transition={{ duration: 1.8, repeat: 1, repeatType: 'loop', ease: 'easeInOut' }}
            />
          </>
        )}
      </div>

      {/* Status bar */}
      <motion.div
        animate={{ color: scanned ? '#6ef7a0' : '#6ee7f7' }}
        transition={{ duration: 0.5 }}
        style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textAlign: 'center' }}
      >
        {scanned ? '◈ SCAN COMPLETE — 2 MATERIALS DETECTED' : '◈ AI SCANNING…'}
      </motion.div>
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

/* ── Scene 2: Temperature Bar — PP melts at 160°C, PET distressed at 260°C ── */
function SceneTempBar() {
  const [meltProgress, setMeltProgress] = useState(0);
  const [petDistressed, setPetDistressed] = useState(false);
  const [meltWarning, setMeltWarning] = useState(false);

  useEffect(() => {
    // 61.5% of 3 s ≈ 1 845 ms → PP starts melting
    const t1 = setTimeout(() => { setMeltProgress(1); setMeltWarning(true); }, 1850);
    // end of bar ≈ 3 100 ms → PET distressed
    const t2 = setTimeout(() => setPetDistressed(true), 3150);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%' }}>

      {/* Characters above the bar */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, justifyContent: 'center' }}>

        {/* PET bottle — normal → sad shake when temp hits 260°C */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <AnimatePresence mode="wait">
            {petDistressed ? (
              <motion.div key="pet-sad"
                initial={{ opacity: 0 }} animate={{ opacity: 1, x: [0, -5, 5, -4, 4, -2, 0] }}
                transition={{ opacity: { duration: 0.2 }, x: { duration: 0.55, ease: 'easeInOut' } }}
              >
                <PETBottle showFace sad size={70} />
              </motion.div>
            ) : (
              <motion.div key="pet-normal" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <PETBottle size={70} />
              </motion.div>
            )}
          </AnimatePresence>
          <span style={{ fontSize: '0.72rem', color: petDistressed ? '#FF5252' : '#4FC3F7', fontWeight: 700, transition: 'color 0.4s' }}>
            {petDistressed ? '😱 PET contaminated!' : 'PET 260°C'}
          </span>
        </div>

        <span style={{ fontSize: '1.3rem', color: 'var(--text-dim)', paddingBottom: 22 }}>+</span>

        {/* PP cap — always melting=true; meltProgress drives drip opacity */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <PPCap melting meltProgress={meltProgress} size={58} />
          <span style={{ fontSize: '0.72rem', color: meltWarning ? '#FF5252' : '#66BB6A', fontWeight: 700, transition: 'color 0.4s' }}>
            {meltWarning ? '🔥 PP melting!' : 'PP 160°C'}
          </span>
        </div>

        <span style={{ fontSize: '1.2rem', color: 'var(--text-dim)', paddingBottom: 22 }}>→ 🔥</span>
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6, fontSize: '0.78rem' }}>
          <motion.span
            animate={{ color: meltWarning ? '#FF5252' : '#66BB6A' }}
            transition={{ duration: 0.4 }}
            style={{ fontWeight: 700 }}
          >
            {meltWarning ? '⚠ PP already melted here!' : '← PP cap is in here too'}
          </motion.span>
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
