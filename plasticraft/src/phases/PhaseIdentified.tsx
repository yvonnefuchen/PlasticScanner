import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PlasticMascot } from '../components/PlasticMascot';
import { T } from '../components/T';
import { useLang } from '../context/LangContext';
import type { PlasticId, PlasticType } from '../data/plastics';
import { PLASTICS } from '../data/plastics';
import type { ScanData } from '../services/scanner';
import { resizeImage } from '../services/scanner';
import { saveReshapeImage } from '../services/survey';

interface Props {
  plastic: PlasticType;
  scanData?: ScanData | null;
  scanError?: string | null;
  capturedImage?: string | null;
  sessionId?: string | null;
  onNext: () => void;
  onRetry?: () => void;
  onOverride?: (id: PlasticId) => void;
}

const MELT_LABEL    = { zh: '融點', ja: 'とける おんど', en: 'Melting point' };
const RETRY_LABEL   = { zh: '重新拍照試試', ja: 'もういちど とってみよう', en: 'Try capturing again' };
const SCAN_FAIL_MSG = { zh: '掃描失敗了，請再試一次！', ja: 'スキャンが うまく いかなかったよ。もういちど ためしてね！', en: 'Scan failed — please try again!' };
const AI_REASONING  = { zh: 'AI 判斷依據', ja: 'AI が そう おもった りゆう', en: 'AI reasoning' };
const RESHAPE_TITLE = { zh: '用它可以做成這些東西：', ja: 'これから こんな ものに なれるよ：', en: 'This can be reshaped into:' };
const TAP_CONTINUE  = { zh: '繼續', ja: 'つづける', en: 'Continue' };
const CANT_FIND     = { zh: '找不到，繼續吧', ja: 'わからない、つづける', en: "Can't find it — continue" };
const CONFIRMED_MSG = { zh: '太棒了！你找到了！現在看看它可以變成什麼！', ja: 'やったね！みつけた！さあ、なにに なるか みてみよう！', en: "Great find! Now let's see what it can become!" };

/* Uncertainty prompt text — wraps the AI message with a child-friendly framing */
const NOT_SURE_PREFIX = {
  zh: '🤔 我不太確定⋯⋯但我覺得這可能是',
  ja: '🤔 じしんは ないけど⋯⋯たぶん これは',
  en: "🤔 I'm not sure... but I think this might be",
};
const FIND_HINT = {
  zh: '！\n你能幫我嗎？翻到底部或側面，看看有沒有以下任何標籤印在上面：',
  ja: '！\nてつだって くれる？したや よこを みて、こんな ラベルが ないか さがしてみて：',
  en: '!\nCan you help me? Look at the bottom or side of the item — is there any of these labels printed on it?',
};

/* The 3 workshop materials a child might confirm from the printed label */
const LABEL_OPTIONS: Array<{ id: PlasticId; code: string; color: string; emoji: string }> = [
  { id: 'PET', code: 'PET', color: '#4FC3F7', emoji: '🔵' },
  { id: 'PP',  code: 'PP',  color: '#66BB6A', emoji: '🟢' },
  { id: 'PS',  code: 'PS',  color: '#FFAB40', emoji: '🟠' },
];

export function PhaseIdentified({ plastic, scanData, scanError, capturedImage, sessionId, onNext, onRetry, onOverride }: Props) {
  const { lang } = useLang();
  const [showDebug, setShowDebug] = useState(false);
  const aiImageSavedRef = useRef(false);

  const uncertainty = scanData?.uncertainty_prompt ?? null;
  const obj         = scanData?.detected_objects?.[0] ?? null;

  // Debug: log what the identify API returned
  useEffect(() => {
    console.log('[PhaseIdentified] scanData:', scanData);
    console.log('[PhaseIdentified] obj:', obj);
    console.log('[PhaseIdentified] reshape_suggestions:', obj?.reshape_suggestions);
  }, [scanData, obj]);

  const pick = <T,>(zh: T, ja: T, en: T) =>
    lang === 'zh' ? zh : lang === 'ja' ? ja : en;

  const imgStyle = (localStorage.getItem('plasticraft_img_style') as 'auto' | 'vehicle') ?? 'auto';

  const reshapeRequests = !obj?.reshape_suggestions?.length ? [] :
    imgStyle === 'vehicle'
      ? [{ reshapeTarget: 'futuristic exploration craft', emoji: '🚀',
           label: pick('未來探索器', 'みらいの たんさき', 'Futuristic Craft') }]
      : obj.reshape_suggestions.slice(0, 3).map(s => ({
          reshapeTarget: s.image_search_query,
          emoji: s.emoji ?? '♻️',
          label: pick(s.item_zh, s.item_ja, s.item_en),
        }));

  const objectName   = obj ? pick(obj.object_name_zh,   obj.object_name_ja,   obj.object_name_en)   : null;
  const materialFull = obj ? pick(obj.material_full_zh,  obj.material_full_ja,  obj.material_full_en)  : null;
  const charMessage  = obj ? pick(obj.character_message_zh, obj.character_message_ja, obj.character_message_en) : null;
  const reasoning    = obj ? pick(obj.reasoning_zh, obj.reasoning_ja, obj.reasoning_en) : null;

  const [confirmedId, setConfirmedId] = useState<PlasticId | null>(null);

  const handleConfirm = (id: PlasticId) => {
    if (id !== plastic.id && onOverride) onOverride(id);
    else onNext();
  };

  /* ── Scan error: only show error banner + retry ── */
  if (scanError) {
    return (
      <div className="phase-container" style={{ '--accent': plastic.color } as React.CSSProperties}>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            width: '100%', maxWidth: 480,
            background: 'rgba(239,83,80,0.12)',
            border: '1.5px solid #EF5350',
            borderRadius: 12,
            padding: '16px',
            fontSize: '0.85rem',
            color: 'var(--text)',
            lineHeight: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ fontWeight: 700, color: '#EF5350' }}>⚠️ <T s={SCAN_FAIL_MSG} /></div>
          <button
            onClick={() => setShowDebug(v => !v)}
            style={{ fontSize: '0.72rem', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', alignSelf: 'flex-start' }}
          >
            {showDebug ? 'hide debug' : 'debug'}
          </button>
          {showDebug && (
            <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-dim)', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
              {scanError}
            </div>
          )}
          {onRetry && (
            <button className="btn-secondary" style={{ fontSize: '0.85rem' }} onClick={onRetry}>
              📷 <T s={RETRY_LABEL} />
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  /* ── PATH A: High confidence — show result + reshape images ── */
  if (!uncertainty) {
    return (
      <div className="phase-container phase-container--scroll" style={{ '--accent': plastic.color } as React.CSSProperties}>
        <PlasticMascot state="talking" color={plastic.color} lightColor={plastic.lightColor} resinCode={plastic.resinCode} size={130} />

        {/* Captured photo thumbnail */}
        {capturedImage && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }} style={{
            width: 110, height: 110, borderRadius: 16,
            border: `3px solid ${plastic.color}`,
            overflow: 'hidden', flexShrink: 0,
            boxShadow: `0 0 0 4px rgba(${hexToRgb(plastic.color)}, 0.2)`,
          }}>
            <img src={capturedImage} alt="captured" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </motion.div>
        )}

        {/* Material headline */}
        {obj && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ textAlign: 'center', width: '100%' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: `rgba(${hexToRgb(plastic.color)}, 0.15)`,
              border: `2px solid ${plastic.color}`,
              borderRadius: 12, padding: '8px 16px',
              fontSize: '1rem', fontWeight: 800, color: plastic.color,
            }}>
              <span>{objectName}</span>
              <span style={{ opacity: 0.5 }}>→</span>
              <span>{materialFull}</span>
            </div>
            {obj.melting_point_celsius > 0 && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 4 }}>
                🌡️ <T s={MELT_LABEL} /> {obj.melting_point_celsius}°C
              </div>
            )}
            {reasoning && (
              <div style={{
                marginTop: 6, display: 'inline-block',
                background: 'rgba(110,231,247,0.08)', border: '1px solid rgba(110,231,247,0.25)',
                borderRadius: 8, padding: '5px 10px',
                fontSize: '0.72rem', color: 'var(--text-dim)', fontStyle: 'italic',
                maxWidth: 440, lineHeight: 1.4,
              }}>
                🔍 <strong style={{ fontStyle: 'normal' }}><T s={AI_REASONING} />:</strong>{' '}{reasoning}
              </div>
            )}
          </motion.div>
        )}

        {/* Character speech bubble */}
        <motion.div
          className="speech-bubble"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{ fontSize: '0.88rem', lineHeight: 1.5 }}
        >
          {charMessage ?? <T s={plastic.mascotHint} />}
        </motion.div>

        {/* Reshape ideas + images */}
        {reshapeRequests.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ width: '100%', maxWidth: 480 }}>
            <p style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 10px' }}>
              ♻️ <T s={RESHAPE_TITLE} />
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {reshapeRequests.map((r, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.15 }} style={{ flex: '1 1 0', minWidth: 0 }}>
                  <ReshapeCard sourceImage={capturedImage ?? null} objectName={obj!.object_name_en} reshape={r.reshapeTarget} emoji={r.emoji} label={r.label} color={plastic.color} lang={lang} sessionId={sessionId} onImageSaved={() => { aiImageSavedRef.current = true; }} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.button
          className="btn-primary"
          onClick={onNext}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <T s={TAP_CONTINUE} />
        </motion.button>
      </div>
    );
  }

  /* ── PATH B confirmed — label found, show reshape cards then continue ── */
  if (confirmedId) {
    const confirmed = PLASTICS[confirmedId];
    return (
      <div className="phase-container phase-container--scroll" style={{ '--accent': confirmed.color } as React.CSSProperties}>
        <PlasticMascot state="talking" color={confirmed.color} lightColor={confirmed.lightColor} resinCode={confirmed.resinCode} size={130} />

        {capturedImage && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{
            width: 110, height: 110, borderRadius: 16,
            border: `3px solid ${confirmed.color}`,
            overflow: 'hidden', flexShrink: 0,
            boxShadow: `0 0 0 4px rgba(${hexToRgb(confirmed.color)}, 0.2)`,
          }}>
            <img src={capturedImage} alt="captured" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </motion.div>
        )}

        {/* Confirmed material badge */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: `rgba(${hexToRgb(confirmed.color)}, 0.15)`,
            border: `2px solid ${confirmed.color}`,
            borderRadius: 12, padding: '8px 16px',
            fontSize: '1rem', fontWeight: 800, color: confirmed.color,
          }}>
            <span>✓</span>
            <span>{PLASTICS[confirmedId].fullName[lang]}</span>
            <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>({confirmedId})</span>
          </div>
        </motion.div>

        {/* Celebratory message */}
        <motion.div className="speech-bubble" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
          <T s={CONFIRMED_MSG} />
        </motion.div>

        {/* Reshape suggestions using scan data */}
        {reshapeRequests.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ width: '100%', maxWidth: 480 }}>
            <p style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 10px' }}>
              ♻️ <T s={RESHAPE_TITLE} />
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {reshapeRequests.map((r, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.15 }} style={{ flex: '1 1 0', minWidth: 0 }}>
                  <ReshapeCard sourceImage={capturedImage ?? null} objectName={obj!.object_name_en} reshape={r.reshapeTarget} emoji={r.emoji} label={r.label} color={confirmed.color} lang={lang} sessionId={sessionId} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.button className="btn-primary" onClick={() => handleConfirm(confirmedId)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <T s={TAP_CONTINUE} />
        </motion.button>
      </div>
    );
  }

  /* ── PATH B: Uncertain — ask child to find the label ── */
  return (
    <div className="phase-container phase-container--scroll" style={{ '--accent': plastic.color } as React.CSSProperties}>
      <PlasticMascot state="talking" color={plastic.color} lightColor={plastic.lightColor} resinCode={plastic.resinCode} size={130} />

      {/* Captured photo thumbnail */}
      {capturedImage && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }} style={{
          width: 110, height: 110, borderRadius: 16,
          border: '3px solid #FFAB40',
          overflow: 'hidden', flexShrink: 0,
          boxShadow: '0 0 0 4px rgba(255,171,64,0.2)',
        }}>
          <img src={capturedImage} alt="captured" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </motion.div>
      )}

      {/* "I'm not sure... but I think..." message */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          width: '100%', maxWidth: 480,
          background: 'rgba(255,171,64,0.12)',
          border: '1.5px solid #FFAB40',
          borderRadius: 16, padding: '16px 18px',
          fontSize: '0.95rem', lineHeight: 1.65,
          color: 'var(--text)', whiteSpace: 'pre-line',
        }}
      >
        <span style={{ fontWeight: 700 }}>{pick(NOT_SURE_PREFIX.zh, NOT_SURE_PREFIX.ja, NOT_SURE_PREFIX.en)}</span>
        {materialFull && <span style={{ fontWeight: 800, color: plastic.color }}> {materialFull}</span>}
        <span>{pick(FIND_HINT.zh, FIND_HINT.ja, FIND_HINT.en)}</span>
      </motion.div>

      {/* PET / PP / PS label boxes */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ display: 'flex', gap: 12, justifyContent: 'center', width: '100%', maxWidth: 480 }}
      >
        {LABEL_OPTIONS.map((opt, i) => (
          <motion.button
            key={opt.id}
            whileTap={{ scale: 0.92 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.12 }}
            onClick={() => setConfirmedId(opt.id)}
            style={{
              flex: 1,
              background: `rgba(${hexToRgb(opt.color)}, 0.12)`,
              border: `2.5px solid ${opt.color}`,
              borderRadius: 14,
              padding: '14px 8px',
              fontWeight: 800,
              color: opt.color,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <span style={{ fontSize: '1.6rem' }}>{opt.emoji}</span>
            <span style={{ fontSize: '1.1rem', letterSpacing: 1 }}>{opt.code}</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.3 }}>
              {PLASTICS[opt.id].fullName[lang]}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Can't find it — proceed anyway */}
      <motion.button
        className="btn-secondary"
        onClick={onNext}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        style={{ fontSize: '0.85rem' }}
      >
        <T s={CANT_FIND} />
      </motion.button>
    </div>
  );
}

/* Image card — sends original photo + reshape target to /api/reshape-image; silently falls back to emoji on failure */
function ReshapeCard({ sourceImage, objectName, reshape, emoji, label, color, lang, sessionId, onImageSaved }: {
  sourceImage: string | null;
  objectName: string;
  reshape: string;
  emoji: string;
  label: string;
  color: string;
  lang: string;
  sessionId?: string | null;
  onImageSaved?: (label: string) => void;
}) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [debugMsg, setDebugMsg] = useState<string>('');
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let pollId: ReturnType<typeof setInterval> | null = null;

    const startTimer = setTimeout(async () => {
      /* 1. Start the job — function returns jobId immediately */
      let jobId: string;
      try {
        const smallImage = sourceImage ? await resizeImage(sourceImage, 400) : null;
        const res = await fetch('/api/reshape-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageDataUrl: smallImage,
            objectName,
            reshapeTarget: reshape,
            promptStyle: localStorage.getItem('plasticraft_img_style') ?? 'auto',
            lang,
          }),
        });
        const data = await res.json() as { jobId?: string; error?: string };
        if (cancelled) return;
        if (!data.jobId) { setDebugMsg(data.error ?? 'no jobId'); setLoading(false); return; }
        jobId = data.jobId;
      } catch (e) { if (!cancelled) { setDebugMsg(String(e).slice(0, 100)); setLoading(false); } return; }

      /* 2. Poll every 4s for up to 3 minutes */
      let elapsed = 0;
      pollId = setInterval(async () => {
        elapsed += 4;
        if (elapsed > 180) { clearInterval(pollId!); if (!cancelled) setLoading(false); return; }
        try {
          const res = await fetch(`/api/reshape-image?jobId=${jobId}`);
          const data = await res.json() as { status: string; url?: string; error?: string };
          if (data.status === 'done' || data.status === 'error') {
            clearInterval(pollId!);
            if (!cancelled) setLoading(false);
            if (data.url) {
              if (!cancelled) setImgUrl(data.url);
              // Save even if user already navigated away — localStorage + API
              if (sessionId) { saveReshapeImage(sessionId, label, data.url); onImageSaved?.(label); }
            }
            else if (data.error && !cancelled) setDebugMsg(data.error);
          }
        } catch { /* keep polling */ }
      }, 4000);
    }, 800);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      // Intentionally do NOT clear pollId here — an in-flight generation should still
      // save to localStorage even after the user has navigated away. The interval
      // self-terminates when the job finishes or after 180s.
    };
  }, [objectName, reshape, lang]);

  const showEmoji = !imgUrl || imgFailed;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: '1 1 0', minWidth: 0 }}>
      <div style={{
        width: '100%', aspectRatio: '4/3', borderRadius: 12,
        border: `2px solid ${loading ? 'rgba(110,231,247,0.3)' : color}`,
        background: loading ? 'rgba(110,231,247,0.05)' : `rgba(${hexToRgb(color)}, 0.1)`,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 8,
        fontSize: '2.4rem', position: 'relative',
      }}>
        {imgUrl && !imgFailed ? (
          <img src={imgUrl} alt={label} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} onError={() => setImgFailed(true)} />
        ) : loading ? (
          <>
            <motion.div
              style={{
                width: 28, height: 28,
                border: '3px solid rgba(110,231,247,0.15)',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            />
            <motion.span
              style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.05em' }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              generating…
            </motion.span>
          </>
        ) : (
          <span style={{ fontSize: '3.5rem', lineHeight: 1 }}>{emoji || '♻️'}</span>
        )}
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', textAlign: 'center', lineHeight: 1.3, padding: '0 4px' }}>
        {label}
      </span>
      {/* Debug toggle — only shown when there's something to report */}
      {!loading && showEmoji && debugMsg && (
        <button
          onClick={() => setShowDebug(v => !v)}
          style={{ fontSize: '0.55rem', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
        >
          debug
        </button>
      )}
      {showDebug && (
        <span style={{ fontSize: '0.6rem', color: '#FFAB40', textAlign: 'center', lineHeight: 1.2, wordBreak: 'break-all', padding: '0 2px', maxWidth: '100%' }}>
          {debugMsg}
        </span>
      )}
    </div>
  );
}

function hexToRgb(hex: string): string {
  const n = parseInt(hex.replace('#', ''), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}
