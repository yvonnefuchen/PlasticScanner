import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { PlasticMascot } from '../components/PlasticMascot';
import { T } from '../components/T';
import type { PlasticType } from '../data/plastics';

interface Props {
  plastic: PlasticType;
  onNext: () => void;
}

const BRAVO = { zh: '太棒了！答對了！', ja: 'すごい！せいかい！', en: 'Amazing! Correct!' };
const NEXT_BTN = { zh: '領取獎勵 →', ja: 'ごほうびを もらう →', en: 'Claim Reward →' };

function launchFireworks(color: string) {
  const end = Date.now() + 3000;
  const colors = [color, '#ffffff', '#FFD700'];

  (function frame() {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors,
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export function PhaseCorrect({ plastic, onNext }: Props) {
  const [showNext, setShowNext] = useState(false);

  useEffect(() => {
    launchFireworks(plastic.color);
    const t = setTimeout(() => setShowNext(true), 3200);
    return () => clearTimeout(t);
  }, [plastic.color]);

  return (
    <div className="phase-container phase-correct">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <PlasticMascot
          state="excited"
          color={plastic.color}
          lightColor={plastic.lightColor}
          resinCode={plastic.resinCode}
          size={220}
        />
      </motion.div>

      <motion.h2
        className="bravo-text"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <T s={BRAVO} />
      </motion.h2>

      {showNext && (
        <motion.button
          className="btn-primary"
          onClick={onNext}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <T s={NEXT_BTN} />
        </motion.button>
      )}
    </div>
  );
}
