import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlasticMascot } from '../components/PlasticMascot';
import { T } from '../components/T';
import type { BinCategory, PlasticType, Tri } from '../data/plastics';

interface Props {
  plastic: PlasticType;
  onCorrect: () => void;
}

const QUESTION: Tri = { zh: '這個塑膠該放進哪個桶？', ja: 'このプラスチックはどのゴミ箱に？', en: 'Which bin does this plastic go in?' };
const TRY_AGAIN: Tri = { zh: '再試一次！', ja: 'もう一度試して！', en: 'Try again!' };

interface BinOption {
  category: BinCategory;
  label: Tri;
  sublabel: Tri;
  color: string;
  lightColor: string;
}

const BIN_OPTIONS: BinOption[] = [
  {
    category: 'blue',
    label:    { zh: '🔵 藍色桶', ja: '🔵 青いゴミ箱', en: '🔵 Blue Bin' },
    sublabel: { zh: 'PET 瓶子', ja: 'PETボトル', en: 'PET Bottles' },
    color: '#4FC3F7',
    lightColor: '#E1F5FE',
  },
  {
    category: 'green',
    label:    { zh: '🟢 綠色桶', ja: '🟢 緑のゴミ箱', en: '🟢 Green Bin' },
    sublabel: { zh: 'PP 瓶蓋 & 一般塑膠', ja: 'PPキャップ & 一般プラスチック', en: 'PP Caps & General Plastics' },
    color: '#81C784',
    lightColor: '#E8F5E9',
  },
  {
    category: 'red',
    label:    { zh: '🔴 紅色桶', ja: '🔴 赤いゴミ箱', en: '🔴 Red Bin' },
    sublabel: { zh: '其他（特殊設施）', ja: 'その他（特殊施設）', en: 'Others (Special Facility)' },
    color: '#EF5350',
    lightColor: '#FFEBEE',
  },
];

export function PhaseQuiz({ plastic, onCorrect }: Props) {
  const [wrongAnswer, setWrongAnswer] = useState<BinCategory | null>(null);
  const [shake, setShake] = useState(false);

  const handleChoice = (chosen: BinCategory) => {
    if (chosen === plastic.binCategory) {
      onCorrect();
    } else {
      setWrongAnswer(chosen);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  const hint = wrongAnswer ? plastic.binWrongHints[wrongAnswer] : null;

  return (
    <div className="phase-container phase-quiz">
      {/* Knowledge hint at top */}
      <motion.div
        className="knowledge-hint"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <T s={plastic.knowledgeHint} />
      </motion.div>

      {/* Mascot */}
      <PlasticMascot
        state={wrongAnswer ? 'sad' : 'idle'}
        color={plastic.color}
        lightColor={plastic.lightColor}
        resinCode={plastic.resinCode}
        size={150}
      />

      {/* Wrong answer hint */}
      <AnimatePresence mode="wait">
        {hint && (
          <motion.div
            key={wrongAnswer}
            className="wrong-hint"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <T s={hint} />
          </motion.div>
        )}
        {!hint && (
          <motion.p key="question" className="quiz-question" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <T s={QUESTION} />
          </motion.p>
        )}
      </AnimatePresence>

      {/* 3-bin options */}
      <motion.div
        className="quiz-grid"
        animate={shake ? { x: [-8, 8, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {BIN_OPTIONS.map((bin) => {
          const isWrong = wrongAnswer === bin.category;
          return (
            <button
              key={bin.category}
              className={`quiz-btn quiz-btn--bin ${isWrong ? 'quiz-btn--wrong' : ''}`}
              style={{
                '--btn-color': bin.color,
                '--btn-light': bin.lightColor,
              } as React.CSSProperties}
              onClick={() => handleChoice(bin.category)}
            >
              <span className="quiz-btn__id"><T s={bin.label} /></span>
              <span className="quiz-btn__sublabel"><T s={bin.sublabel} /></span>
              {isWrong && <span className="quiz-btn__x">✕</span>}
            </button>
          );
        })}
      </motion.div>

      {wrongAnswer && (
        <p className="try-again-label">
          <T s={TRY_AGAIN} />
        </p>
      )}
    </div>
  );
}
