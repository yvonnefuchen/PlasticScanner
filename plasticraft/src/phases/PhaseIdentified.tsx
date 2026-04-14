import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PlasticMascot } from '../components/PlasticMascot';
import { T } from '../components/T';
import type { PlasticType } from '../data/plastics';

interface Props {
  plastic: PlasticType;
  onNext: () => void;
}

const TAP_CONTINUE = { zh: '繼續', ja: '続ける', en: 'Continue' };

export function PhaseIdentified({ plastic, onNext }: Props) {
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowContinue(true), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="phase-container" style={{ '--accent': plastic.color } as React.CSSProperties}>
      <PlasticMascot
        state="talking"
        color={plastic.color}
        lightColor={plastic.lightColor}
        resinCode={plastic.resinCode}
        size={200}
      />

      <motion.div
        className="speech-bubble"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={onNext}
        style={{ cursor: 'pointer' }}
      >
        <T s={plastic.mascotHint} />
      </motion.div>

      {showContinue && (
        <motion.button
          className="btn-primary"
          onClick={onNext}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <T s={TAP_CONTINUE} />
        </motion.button>
      )}
    </div>
  );
}
