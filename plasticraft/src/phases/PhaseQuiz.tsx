import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlasticMascot } from '../components/PlasticMascot';
import { T } from '../components/T';
import { PLASTICS, type PlasticId, type PlasticType } from '../data/plastics';

interface Props {
  plastic: PlasticType;
  onCorrect: () => void;
}

const QUESTION = { zh: '你覺得我是哪一種塑膠？', ja: '僕はどんなプラスチックだと思う？', en: 'What type of plastic am I?' };
const TRY_AGAIN = { zh: '再試一次！', ja: 'もう一度試して！', en: 'Try again!' };

const OPTIONS: PlasticId[] = ['PET', 'HDPE', 'PP', 'PS', 'PVC'];

export function PhaseQuiz({ plastic, onCorrect }: Props) {
  const [wrongAnswer, setWrongAnswer] = useState<PlasticId | null>(null);
  const [shake, setShake] = useState(false);

  const handleChoice = (chosen: PlasticId) => {
    if (chosen === plastic.id) {
      onCorrect();
    } else {
      setWrongAnswer(chosen);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  const hint = wrongAnswer ? plastic.wrongHints[wrongAnswer] : null;

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

      {/* Options */}
      <motion.div
        className="quiz-grid"
        animate={shake ? { x: [-8, 8, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {OPTIONS.map((id) => {
          const p = PLASTICS[id];
          const isWrong = wrongAnswer === id;
          return (
            <button
              key={id}
              className={`quiz-btn ${isWrong ? 'quiz-btn--wrong' : ''}`}
              style={{
                '--btn-color': p.color,
                '--btn-light': p.lightColor,
              } as React.CSSProperties}
              onClick={() => handleChoice(id)}
            >
              <span className="quiz-btn__code">{p.resinCode}</span>
              <span className="quiz-btn__id">{p.id}</span>
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
