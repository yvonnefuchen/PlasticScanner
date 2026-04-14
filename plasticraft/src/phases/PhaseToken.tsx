import { motion } from 'framer-motion';
import { T } from '../components/T';

interface Props {
  onNext: () => void;
}

const TITLE = { zh: '太棒了！送你一個 PP 超級英雄代幣（瓶蓋）！', ja: 'すごい！PP スーパーヒーロートークン（キャップ）をプレゼント！', en: 'Amazing! You earn a PP Super Hero Token (bottle cap)!' };
const CLAW_DESC = {
  zh: '將 PP 瓶蓋投入夾娃娃機，夾取裝有 PP 連接件的扭蛋殼！',
  ja: 'PP キャップをクレーンゲームに入れて、PP コネクターが入ったカプセルをゲットしよう！',
  en: 'Drop your PP cap into the claw machine to grab a capsule with a PP connector inside!',
};
const CAPSULE_DESC = {
  zh: '你用 PP token 夾到你需要的工具了嗎？扭蛋殼裡的 connector，就是用你的 PP 代幣做的唷！',
  ja: 'PP トークンで必要な道具をゲットできた？カプセルの中のコネクターは、あなたの PP トークンと同じ素材だよ！',
  en: 'Did you grab the tool you need? The connector inside the capsule is made from the same PP material as your token!',
};
const CONFIRM_BTN = { zh: '我拿到扭蛋了！', ja: 'カプセルをゲットしたよ！', en: "Got my capsule! Let's build!" };

// PP bottle cap SVG token
function PPToken() {
  return (
    <svg viewBox="0 0 160 160" width={140} height={140} aria-hidden="true">
      {/* Cap base */}
      <circle cx="80" cy="80" r="72" fill="#FFD54F" stroke="#F9A825" strokeWidth="6" />
      {/* Cap ridges */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const x1 = 80 + Math.cos(angle) * 58;
        const y1 = 80 + Math.sin(angle) * 58;
        const x2 = 80 + Math.cos(angle) * 70;
        const y2 = 80 + Math.sin(angle) * 70;
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#F9A825" strokeWidth="4" strokeLinecap="round"
          />
        );
      })}
      {/* Inner circle */}
      <circle cx="80" cy="80" r="45" fill="#FFF9C4" stroke="#F9A825" strokeWidth="3" />
      {/* PP text */}
      <text x="80" y="75" textAnchor="middle" fontSize="26" fontWeight="900" fill="#E65100" fontFamily="system-ui">PP</text>
      <text x="80" y="97" textAnchor="middle" fontSize="13" fontWeight="700" fill="#E65100" fontFamily="system-ui">⑤</text>
    </svg>
  );
}

export function PhaseToken({ onNext }: Props) {
  return (
    <div className="phase-container phase-token">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 160, damping: 12 }}
      >
        <PPToken />
      </motion.div>

      <motion.h2
        className="token-title"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <T s={TITLE} />
      </motion.h2>

      <motion.div
        className="token-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="token-card__icon">🎰</div>
        <p><T s={CLAW_DESC} /></p>
      </motion.div>

      <motion.div
        className="token-card token-card--highlight"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <div className="token-card__icon">🥚</div>
        <p><T s={CAPSULE_DESC} /></p>
      </motion.div>

      <motion.button
        className="btn-primary"
        onClick={onNext}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        <T s={CONFIRM_BTN} />
      </motion.button>
    </div>
  );
}
