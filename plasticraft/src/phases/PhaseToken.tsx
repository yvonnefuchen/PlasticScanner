import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../components/T';

interface Props {
  onNext: () => void;
}

const TITLE = { zh: '太棒了！送你一個 PP 超級英雄代幣（瓶蓋）！', ja: 'すごい！PP スーパーヒーロートークン（キャップ）を プレゼント！', en: 'Amazing! You earn a PP Super Hero Token (bottle cap)!' };
const CLAW_LABEL = { zh: '把你的 PP 瓶蓋投入夾娃娃機…', ja: 'PP キャップを クレーンゲームに いれて…', en: 'Drop your PP cap into the claw machine…' };
const TAP_CLAW = { zh: '點擊投入機台！', ja: 'タップして いれよう！', en: 'Tap to drop it in!' };
const CAPSULE_TITLE = { zh: '🎉 你夾到扭蛋了！', ja: '🎉 カプセルを ゲット！', en: '🎉 You got the capsule!' };
const CAPSULE_DESC = {
  zh: '扭蛋裡的六角形 connector，就是用 PP 做的——跟你的代幣一樣的材質！打開來準備組裝吧！',
  ja: 'カプセルの なかの ろっかくけいコネクターは PPで できてるよ——トークンと おなじ そざいだよ！あけて くみたてる じゅんびを しよう！',
  en: 'The hexagonal connector inside is made from PP — the same material as your token! Open it up and get ready to build!',
};
const CONFIRM_BTN = { zh: '我拿到扭蛋了！開始製作！', ja: 'カプセルを ゲットした！つくろう！', en: "Got my capsule! Let's build!" };
const PP_MAGIC = {
  zh: '你從瓶蓋拿到的代幣，還有你夾到的連接器——都是 PP！同一種材料，可以變成瓶蓋，也可以變成玩具零件。這就是回收的魔法！',
  ja: 'キャップから もらった トークンも、つかんだ コネクタも、どちらも PP！おなじ そざいが、ボトルキャップにも、おもちゃの パーツにも なれる。それが リサイクルの まほう！',
  en: "The token you got from the PP cap, and the connector you grabbed — both made of PP! Same material, can become a bottle cap OR a toy part. That's the magic of recycling!",
};

/* ── PP Bottle Cap Token ── */
function PPToken({ size = 110 }: { size?: number }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} aria-hidden="true">
      <circle cx="80" cy="80" r="72" fill="#FFD54F" stroke="#F9A825" strokeWidth="6" />
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        return (
          <line key={i}
            x1={80 + Math.cos(angle) * 58} y1={80 + Math.sin(angle) * 58}
            x2={80 + Math.cos(angle) * 70} y2={80 + Math.sin(angle) * 70}
            stroke="#F9A825" strokeWidth="4" strokeLinecap="round"
          />
        );
      })}
      <circle cx="80" cy="80" r="45" fill="#FFF9C4" stroke="#F9A825" strokeWidth="3" />
      <text x="80" y="75" textAnchor="middle" fontSize="26" fontWeight="900" fill="#E65100" fontFamily="system-ui">PP</text>
      <text x="80" y="97" textAnchor="middle" fontSize="13" fontWeight="700" fill="#E65100" fontFamily="system-ui">⑤</text>
    </svg>
  );
}

/* ── Hexagonal Connector ── */
function HexConnector({ cx = 50, cy = 50, r = 22, fill = '#FFD54F', stroke = '#F9A825' }: {
  cx?: number; cy?: number; r?: number; fill?: string; stroke?: string;
}) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 - 30) * Math.PI / 180;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(' ');
  return (
    <>
      <polygon points={pts} fill={fill} stroke={stroke} strokeWidth="2.5" />
      <circle cx={cx} cy={cy} r={r * 0.35} fill="white" stroke={stroke} strokeWidth="1.5" />
    </>
  );
}

/* ── Animated Claw Machine ── */
function ClawMachine({ dropped }: { dropped: boolean }) {
  return (
    <svg viewBox="0 0 200 240" width={200} height={240} aria-hidden="true">
      {/* Cabinet */}
      <rect x="10" y="30" width="180" height="200" rx="12" fill="#1c2440" stroke="#6ee7f7" strokeWidth="2" />
      {/* Glass window */}
      <rect x="20" y="50" width="160" height="140" rx="8" fill="#0b1122" stroke="#4FC3F7" strokeWidth="1.5" opacity="0.9" />
      {/* Slot at top */}
      <rect x="75" y="20" width="50" height="16" rx="4" fill="#0b0f1e" stroke="#FFD54F" strokeWidth="2" />
      <text x="100" y="31" textAnchor="middle" fontSize="8" fill="#FFD54F" fontFamily="system-ui">PP SLOT</text>

      {/* Capsules at bottom */}
      <ellipse cx="60" cy="175" rx="18" ry="12" fill="#B3E5FC" stroke="#4FC3F7" strokeWidth="1.5" opacity="0.7" />
      <ellipse cx="100" cy="180" rx="18" ry="12" fill="#CE93D8" stroke="#AB47BC" strokeWidth="1.5" opacity="0.7" />
      <ellipse cx="140" cy="175" rx="18" ry="12" fill="#A5D6A7" stroke="#66BB6A" strokeWidth="1.5" opacity="0.7" />

      {/* Target capsule with hex connector inside */}
      <ellipse cx="100" cy="155" rx="20" ry="13" fill="#FFD54F" stroke="#F9A825" strokeWidth="2" />
      <HexConnector cx={100} cy={155} r={8} fill="#FF8A65" stroke="#E64A19" />

      {/* Claw arm — drops when dropped=true */}
      <motion.g
        animate={{ y: dropped ? 60 : 0 }}
        transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.3 }}
      >
        {/* Arm line */}
        <line x1="100" y1="50" x2="100" y2="105" stroke="#6ee7f7" strokeWidth="3" strokeLinecap="round" />
        {/* Claw prongs */}
        <path d="M 100 105 Q 85 115 82 128" stroke="#6ee7f7" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 100 105 Q 115 115 118 128" stroke="#6ee7f7" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <line x1="100" y1="105" x2="100" y2="128" stroke="#6ee7f7" strokeWidth="2" strokeLinecap="round" />
      </motion.g>

      {/* Token dropping */}
      <AnimatePresence>
        {dropped && (
          <motion.g
            key="token-drop"
            initial={{ y: -60, opacity: 1 }}
            animate={{ y: 0, opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeIn' }}
          >
            <circle cx="100" cy="28" r="10" fill="#FFD54F" stroke="#F9A825" strokeWidth="2" />
            <text x="100" y="33" textAnchor="middle" fontSize="8" fontWeight="900" fill="#E65100" fontFamily="system-ui">PP</text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* Score display */}
      <rect x="20" y="195" width="160" height="26" rx="6" fill="#0b0f1e" stroke="#6ee7f7" strokeWidth="1" opacity="0.8" />
      <text x="100" y="213" textAnchor="middle" fontSize="10" fill="#6ee7f7" fontFamily="monospace">PLASTICRAFT</text>
    </svg>
  );
}

/* ── Capsule Result ── */
function CapsuleResult() {
  return (
    <svg viewBox="0 0 200 130" width={200} height={130} aria-hidden="true">
      {/* Hex connector only — capsule halves removed */}
      <HexConnector cx={100} cy={65} r={32} fill="#FF8A65" stroke="#E64A19" />
      {/* Label */}
      <text x="100" y="112" textAnchor="middle" fontSize="11" fontWeight="700" fill="#FFD54F" fontFamily="system-ui">Universal Connector</text>
      <text x="100" y="126" textAnchor="middle" fontSize="9" fill="rgba(240,244,255,0.5)" fontFamily="system-ui">PP ⑤</text>
    </svg>
  );
}

export function PhaseToken({ onNext }: Props) {
  const [stage, setStage] = useState<'token' | 'machine' | 'capsule'>('token');

  return (
    <div className="phase-container phase-token">
      <AnimatePresence mode="wait">

        {/* Stage 1: Show token, invite to drop */}
        {stage === 'token' && (
          <motion.div key="token"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 8, -8, 0], y: [0, -8, 0] }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
            >
              <PPToken size={130} />
            </motion.div>
            <h2 className="token-title"><T s={TITLE} /></h2>
            <p style={{ color: 'rgba(240,244,255,0.65)', fontSize: '1rem', margin: 0, textAlign: 'center' }}>
              <T s={CLAW_LABEL} />
            </p>
            <motion.button
              className="btn-primary"
              onClick={() => setStage('machine')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <T s={TAP_CLAW} />
            </motion.button>
          </motion.div>
        )}

        {/* Stage 2: Claw machine animation */}
        {stage === 'machine' && (
          <motion.div key="machine"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
          >
            <ClawMachine dropped={true} />
            <p style={{ color: 'var(--primary)', fontSize: '1rem', margin: 0, fontWeight: 600 }}>
              <T s={CLAW_LABEL} />
            </p>
            <motion.button
              className="btn-primary"
              onClick={() => setStage('capsule')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
            >
              <T s={CONFIRM_BTN} />
            </motion.button>
          </motion.div>
        )}

        {/* Stage 3: Capsule reveal */}
        {stage === 'capsule' && (
          <motion.div key="capsule"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.h2
              className="token-title"
              style={{ fontSize: '1.4rem', color: '#FFD54F' }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <T s={CAPSULE_TITLE} />
            </motion.h2>
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 1.2, repeat: 2, ease: 'easeInOut' }}
            >
              <CapsuleResult />
            </motion.div>
            <div className="token-card token-card--highlight" style={{ maxWidth: 480 }}>
              <div className="token-card__icon">🔷</div>
              <p><T s={CAPSULE_DESC} /></p>
            </div>
            <motion.div
              className="token-card"
              style={{ maxWidth: 480 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="token-card__icon">♻️</div>
              <p><T s={PP_MAGIC} /></p>
            </motion.div>
            <motion.button
              className="btn-primary"
              onClick={onNext}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <T s={CONFIRM_BTN} />
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
