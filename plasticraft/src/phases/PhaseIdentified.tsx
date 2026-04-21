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
const RESHAPE_TITLE = { zh: '用它可以做成這些東西：', ja: 'これに生まれ変われるよ：', en: 'This can be reshaped into:' };
const MELT_LABEL   = { zh: '融點', ja: '融点', en: 'Melting point' };

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
  const [showReshape, setShowReshape]           = useState(false);

  const uncertainty = scanData?.uncertainty_prompt ?? null;
  const obj         = scanData?.detected_objects?.[0] ?? null;

  const objectName: string | null = obj
    ? lang === 'zh' ? obj.object_name_zh
    : lang === 'ja' ? obj.object_name_ja
    : obj.object_name_en
    : null;

  const materialFull: string | null = obj
    ? lang === 'zh' ? obj.material_full_zh
    : lang === 'ja' ? obj.material_full_ja
    : obj.material_full_en
    : null;

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
      const t = setTimeout(() => setShowUncertainty(true), 1800);
      return () => clearTimeout(t);
    } else {
      /* high confidence: show reshape after 2s, continue button after 4s */
      const t1 = setTimeout(() => setShowReshape(true), 2000);
      const t2 = setTimeout(() => setShowContinue(true), 4000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
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
        size={150}
      />

      {/* ── Material identification headline ── */}
      {obj && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ textAlign: 'center', width: '100%' }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: `rgba(${hexToRgb(plastic.color)}, 0.15)`,
            border: `2px solid ${plastic.color}`,
            borderRadius: 12,
            padding: '8px 16px',
            fontSize: '1rem',
            fontWeight: 800,
            color: plastic.color,
          }}>
            <span>{objectName}</span>
            <span style={{ opacity: 0.5 }}>→</span>
            <span>{materialFull}</span>
          </div>
          {obj.melting_point_celsius && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 4 }}>
              🌡️ <T s={MELT_LABEL} /> {obj.melting_point_celsius}°C
            </div>
          )}
        </motion.div>
      )}

      {/* ── Character message speech bubble ── */}
      <motion.div
        className="speech-bubble"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={uncertainty ? undefined : onNext}
        style={{
          cursor: uncertainty ? 'default' : 'pointer',
          maxHeight: '22vh',
          overflowY: 'auto',
          lineHeight: 1.55,
        }}
      >
        {characterMessage ?? <T s={plastic.mascotHint} />}
      </motion.div>

      {/* ── Reshape suggestions (high confidence only) ── */}
      <AnimatePresence>
        {showReshape && !uncertainty && obj?.reshape_suggestions?.length && (
          <motion.div
            key="reshape"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%', maxWidth: 480 }}
          >
            <p style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>
              ♻️ <T s={RESHAPE_TITLE} />
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {obj.reshape_suggestions.slice(0, 3).map((s, i) => {
                const label = lang === 'zh' ? s.item_zh : lang === 'ja' ? s.item_ja : s.item_en;
                const imgSrc = `https://source.unsplash.com/160x120/?${encodeURIComponent(s.image_search_query)}`;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.18 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      flex: '1 1 0',
                      minWidth: 0,
                    }}
                  >
                    <ReshapeImage src={imgSrc} alt={label} color={plastic.color} />
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text)',
                      textAlign: 'center',
                      lineHeight: 1.3,
                      padding: '0 4px',
                    }}>
                      {label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

/* Image card for a reshape suggestion — falls back to emoji on error */
function ReshapeImage({ src, alt, color }: { src: string; alt: string; color: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div style={{
      width: '100%',
      aspectRatio: '4/3',
      borderRadius: 10,
      overflow: 'hidden',
      border: `2px solid ${color}`,
      background: `rgba(${hexToRgb(color)}, 0.1)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
    }}>
      {failed
        ? '♻️'
        : <img
            src={src}
            alt={alt}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={() => setFailed(true)}
          />
      }
    </div>
  );
}

/* Utility: convert hex colour to "r, g, b" for rgba() */
function hexToRgb(hex: string): string {
  const n = parseInt(hex.replace('#', ''), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}
