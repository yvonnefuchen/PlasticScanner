/* Shared SVG components: PET bottle, PP cap, Bin characters */

/* ── PET Bottle ─────────────────────────────────────────────────────────── */
export function PETBottle({
  size = 90,
  showFace = false,
  sad = false,
}: {
  size?: number;
  showFace?: boolean;
  sad?: boolean;
}) {
  const h = 110, w = 64;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={size * w / h} height={size} aria-hidden>
      {/* Neck */}
      <rect x="24" y="6" width="16" height="20" rx="4" fill="rgba(179,229,252,0.9)" stroke="#4FC3F7" strokeWidth="2" />
      {/* Shoulder */}
      <path d="M 10 26 Q 8 33 8 40 L 56 40 Q 56 33 54 26 Z" fill="rgba(179,229,252,0.85)" stroke="#4FC3F7" strokeWidth="2" />
      {/* Body */}
      <rect x="8" y="38" width="48" height="62" rx="10" fill="rgba(179,229,252,0.85)" stroke="#4FC3F7" strokeWidth="2.5" />
      {/* Highlight */}
      <path d="M 14 44 Q 16 68 14 92" stroke="rgba(255,255,255,0.55)" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Label */}
      {!showFace && (
        <>
          <text x="32" y="74" textAnchor="middle" fontSize="13" fontWeight="900" fill="#0277BD">PET</text>
          <text x="32" y="88" textAnchor="middle" fontSize="10" fill="#4FC3F7">①</text>
        </>
      )}
      {/* Face */}
      {showFace && (
        <>
          <circle cx="22" cy="60" r="5" fill="white" opacity="0.9" />
          <circle cx="42" cy="60" r="5" fill="white" opacity="0.9" />
          <circle cx={sad ? 21 : 23} cy={sad ? 61 : 61} r="2.5" fill="#0277BD" />
          <circle cx={sad ? 41 : 43} cy={sad ? 61 : 61} r="2.5" fill="#0277BD" />
          {sad
            ? <path d="M 20 73 Q 32 68 44 73" stroke="#0277BD" strokeWidth="2" fill="none" strokeLinecap="round" />
            : <path d="M 20 71 Q 32 78 44 71" stroke="#0277BD" strokeWidth="2" fill="none" strokeLinecap="round" />}
          {/* PET label below face */}
          <text x="32" y="92" textAnchor="middle" fontSize="9" fontWeight="800" fill="#0277BD" opacity="0.8">PET ①</text>
        </>
      )}
    </svg>
  );
}

/* ── PP Cap ──────────────────────────────────────────────────────────────── */
export function PPCap({
  size = 70,
  showFace = false,
  sad = false,
  melting = false,
  meltProgress = 1,
}: {
  size?: number;
  showFace?: boolean;
  sad?: boolean;
  melting?: boolean;
  meltProgress?: number;
}) {
  const viewH = melting ? 80 : 58;
  return (
    <svg viewBox={`0 0 80 ${viewH}`} width={size} height={size * viewH / 80} aria-hidden>
      {/* Top surface */}
      <ellipse cx="40" cy="14" rx="34" ry="10" fill="#66BB6A" stroke="#388E3C" strokeWidth="2" />
      {/* Side wall */}
      <rect x="6" y="14" width="68" height="24" fill="#4CAF50" />
      <line x1="6" y1="14" x2="6" y2="38" stroke="#388E3C" strokeWidth="2" />
      <line x1="74" y1="14" x2="74" y2="38" stroke="#388E3C" strokeWidth="2" />
      {/* Bottom rim */}
      <ellipse cx="40" cy="38" rx="34" ry="10" fill="#43A047" stroke="#388E3C" strokeWidth="2" />
      {/* Ridges */}
      {[0,1,2,3,4,5,6,7].map(i => {
        const a = (i / 8) * Math.PI * 2;
        const x = 40 + 33 * Math.cos(a);
        const y = 14 + 9 * Math.sin(a);
        return <circle key={i} cx={x} cy={y} r="1.8" fill="#2E7D32" opacity="0.5" />;
      })}
      {/* Label or Face */}
      {!showFace && (
        <text x="40" y="30" textAnchor="middle" fontSize="11" fontWeight="900" fill="white">PP ⑤</text>
      )}
      {showFace && (
        <>
          <circle cx="27" cy="24" r="4" fill="white" opacity="0.9" />
          <circle cx="53" cy="24" r="4" fill="white" opacity="0.9" />
          <circle cx={sad ? 26 : 28} cy={sad ? 25 : 25} r="2" fill="#1B5E20" />
          <circle cx={sad ? 52 : 54} cy={sad ? 25 : 25} r="2" fill="#1B5E20" />
          {sad
            ? <path d="M 26 34 Q 40 30 54 34" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            : <path d="M 26 33 Q 40 39 54 33" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />}
          <text x="40" y="47" textAnchor="middle" fontSize="8" fontWeight="800" fill="white" opacity="0.85">PP ⑤</text>
        </>
      )}
      {/* Melting drips — opacity driven by meltProgress for gradual reveal */}
      {melting && (
        <g style={{ opacity: meltProgress, transition: 'opacity 1.3s ease-in' }}>
          <path d="M 14 46 Q 11 60 9 70" stroke="#66BB6A" strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx="9" cy="71" rx="5" ry="3" fill="#66BB6A" />
          <path d="M 35 46 Q 33 58 32 68" stroke="#66BB6A" strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx="32" cy="69" rx="5" ry="3" fill="#66BB6A" />
          <path d="M 62 46 Q 65 59 67 70" stroke="#66BB6A" strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx="67" cy="71" rx="5" ry="3" fill="#66BB6A" />
        </g>
      )}
    </svg>
  );
}

/* ── Bin Character ───────────────────────────────────────────────────────── */
export function BinCharacter({ type, size = 80 }: { type: 'blue' | 'green' | 'red'; size?: number }) {
  const cfg = {
    blue: {
      body: '#B3E5FC', rim: '#0288D1', lid: '#4FC3F7', dark: '#01579B',
      pupil: '#01579B', icon: '🍶',
      /* wide happy eyes, big smile */
      lx: 20, ly: 40, rx: 40, ry: 40, er: 6,
      mouth: 'M 16 53 Q 30 62 44 53',
      brow: null,
    },
    green: {
      body: '#C8E6C9', rim: '#388E3C', lid: '#66BB6A', dark: '#1B5E20',
      pupil: '#1B5E20', icon: '🧢',
      /* relaxed eyes, warm smile */
      lx: 20, ly: 41, rx: 40, ry: 41, er: 5,
      mouth: 'M 17 52 Q 30 59 43 52',
      brow: null,
    },
    red: {
      body: '#FFCDD2', rim: '#C62828', lid: '#EF5350', dark: '#B71C1C',
      pupil: '#B71C1C', icon: '⭐',
      /* serious — flat brow, thin mouth */
      lx: 20, ly: 41, rx: 40, ry: 41, er: 5,
      mouth: 'M 17 52 L 43 52',
      brow: { lx1: 14, ly1: 34, lx2: 26, ly2: 34, rx1: 34, ry1: 34, rx2: 46, ry2: 34 },
    },
  }[type];

  return (
    <svg viewBox="0 0 60 90" width={size * 60 / 90} height={size} aria-hidden>
      {/* Legs */}
      <rect x="16" y="78" width="9" height="10" rx="3" fill={cfg.rim} />
      <rect x="35" y="78" width="9" height="10" rx="3" fill={cfg.rim} />
      {/* Body */}
      <rect x="6" y="26" width="48" height="54" rx="8" fill={cfg.body} stroke={cfg.rim} strokeWidth="2" />
      {/* Lid */}
      <path d="M 6 26 Q 30 18 54 26 L 54 32 Q 30 24 6 32 Z" fill={cfg.lid} stroke={cfg.rim} strokeWidth="1.5" />
      {/* Handle on lid */}
      <rect x="23" y="12" width="14" height="12" rx="4" fill={cfg.dark} />
      <rect x="21" y="19" width="18" height="6" rx="3" fill={cfg.rim} />
      {/* Recycle symbol */}
      <text x="30" y="68" textAnchor="middle" fontSize="14">♻️</text>
      {/* Eyes */}
      <circle cx={cfg.lx} cy={cfg.ly} r={cfg.er} fill="white" />
      <circle cx={cfg.rx} cy={cfg.ry} r={cfg.er} fill="white" />
      <circle cx={cfg.lx + 1} cy={cfg.ly + 1} r={cfg.er * 0.45} fill={cfg.pupil} />
      <circle cx={cfg.rx + 1} cy={cfg.ry + 1} r={cfg.er * 0.45} fill={cfg.pupil} />
      {/* Eyebrow for red (stern) */}
      {cfg.brow && (
        <>
          <line x1={cfg.brow.lx1} y1={cfg.brow.ly1} x2={cfg.brow.lx2} y2={cfg.brow.ly2} stroke={cfg.dark} strokeWidth="2.5" strokeLinecap="round" />
          <line x1={cfg.brow.rx1} y1={cfg.brow.ry1} x2={cfg.brow.rx2} y2={cfg.brow.ry2} stroke={cfg.dark} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {/* Mouth */}
      <path d={cfg.mouth} stroke={cfg.dark} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Blush for blue + green */}
      {type !== 'red' && (
        <>
          <ellipse cx="13" cy="48" rx="5" ry="3" fill={cfg.rim} opacity="0.25" />
          <ellipse cx="47" cy="48" rx="5" ry="3" fill={cfg.rim} opacity="0.25" />
        </>
      )}
    </svg>
  );
}
