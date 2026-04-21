import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlasticMascot } from '../components/PlasticMascot';
import { T } from '../components/T';
import { useLang } from '../context/LangContext';
import type { PlasticId, PlasticType } from '../data/plastics';
import { PLASTICS } from '../data/plastics';
import type { ScanData } from '../services/scanner';

interface Props {
  plastic: PlasticType;
  scanData?: ScanData | null;
  onNext: () => void;
  onOverride?: (id: PlasticId) => void;
}

const TAP_CONTINUE = { zh: '繼續', ja: '続ける', en: 'Continue' };
const CANT_FIND    = { zh: '找不到，繼續吧', ja: 'わからない、続ける', en: "Can't find it — continue" };
const FOUND_LABEL  = { zh: '我看到這個！', ja: 'これを見つけたよ！', en: 'I can see it printed!' };
const FLIP_TIP     = { zh: '翻到底部或側面找找看 👀', ja: '底か横を見てみよう 👀', en: 'Flip it over and look at the bottom or side 👀' };

/* The 3 workshop materials a child might confirm from the printed label */
const LABEL_OPTIONS: Array<{ id: PlasticId; code: string; color: string }> = [
  { id: 'PET', code: 'PET', color: '#4FC3F7' },
  { id: 'PP',  code: 'PP',  color: '#66BB6A' },
  { id: 'PS',  code: 'PS',  color: '#FFAB40' },
];

export function PhaseIdentified({ plastic, scanData, onNext, onOverride }: Props) {
  const { lang } = useLang();
  const [showContinue, setShowContinue]         = useState(false);
  const [showUncertainty, setShowUncertainty]   = useState(false);

  const uncertainty = scanData?.uncertainty_prompt ?? null;
  const obj         = scanData?.detected_objects?.[0] ?? null;

  /* Pick the Claude-generated character message in the current language,
     falling back to the static mascot hint when scanData is unavailable. */
  const characterMessage: string | null = obj
    ? lang === 'zh' ? obj.character_message_zh
    : lang === 'ja' ? obj.character_message_ja
    : obj.character_message_en
    : null;

  const uncertaintyMessage: string | null = uncertainty
    ? lang === 'zh' ? uncertainty.message_zh
    : lang === 'ja' ? uncertainty.message_ja
    : uncertainty.message_en
    : null;

  useEffect(() => {
    if (uncertainty) {
      /* medium/low: show uncertainty section quickly, skip auto-continue */
      const t = setTimeout(() => setShowUncertainty(true), 1800);
      return () => clearTimeout(t);
    } else {
      /* high confidence: standard 4 s then show continue button */
      const t = setTimeout(() => setShowContinue(true), 4000);
      return () => clearTimeout(t);
    }
  }, [uncertainty]);

  const handleConfirm = (id: PlasticId) => {
    if (id !== plastic.id && onOverride) {
      onOverride(id);
    } else {
      onNext();
    }
  };

  return (
    <div className="phase-container" style={{ '--accent': plastic.color } as React.CSSProperties}>
      <PlasticMascot
        state="talking"
        color={plastic.color}
        lightColor={plastic.lightColor}
        resinCode={plastic.resinCode}
        size={180}
      />

      {/* ── Character message speech bubble ── */}
      <motion.div
        className="speech-bubble"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={uncertainty ? undefined : onNext}
        style={{
          cursor: uncertainty ? 'default' : 'pointer',
          maxHeight: '28vh',
          overflowY: 'auto',
          lineHeight: 1.55,
        }}
      >
        {characterMessage ?? <T s={plastic.mascotHint} />}
      </motion.div>

      {/* ── Uncertainty section (medium / low confidence) ── */}
      <AnimatePresence>
        {showUncertainty && uncertaintyMessage && (
          <motion.div
            key="uncertainty"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            {/* Uncertainty prompt bubble — amber tinted */}
            <div style={{
              background: 'rgba(255,171,64,0.12)',
              border: '1.5px solid #FFAB40',
              borderRadius: 14,
              padding: '12px 16px',
              fontSize: '0.92rem',
              lineHeight: 1.55,
              color: 'var(--text)',
            }}>
              <span style={{ fontWeight: 700, color: '#FFAB40' }}>🤔 </span>
              {uncertaintyMessage}
            </div>

            {/* Flip tip */}
            <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-dim)', margin: 0 }}>
              <T s={FLIP_TIP} />
            </p>

            {/* Label confirm buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                <T s={FOUND_LABEL} />
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                {LABEL_OPTIONS.map(opt => (
                  <motion.button
                    key={opt.id}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => handleConfirm(opt.id)}
                    style={{
                      background: `rgba(${hexToRgb(opt.color)}, 0.15)`,
                      border: `2px solid ${opt.color}`,
                      borderRadius: 12,
                      padding: '10px 18px',
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: opt.color,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      minWidth: 72,
                    }}
                  >
                    <span style={{ fontSize: '1.3rem' }}>
                      {opt.id === 'PET' ? '🔵' : opt.id === 'PP' ? '🟢' : '🔴'}
                    </span>
                    <span>{opt.code}</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-dim)' }}>
                      {PLASTICS[opt.id].fullName[lang]}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Can't find it — proceed with AI guess */}
            <button
              className="btn-secondary"
              style={{ fontSize: '0.85rem', alignSelf: 'center' }}
              onClick={onNext}
            >
              <T s={CANT_FIND} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Standard continue button (high confidence only) ── */}
      <AnimatePresence>
        {showContinue && !uncertainty && (
          <motion.button
            className="btn-primary"
            onClick={onNext}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <T s={TAP_CONTINUE} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Utility: convert hex colour to "r, g, b" for rgba() */
function hexToRgb(hex: string): string {
  const n = parseInt(hex.replace('#', ''), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}
