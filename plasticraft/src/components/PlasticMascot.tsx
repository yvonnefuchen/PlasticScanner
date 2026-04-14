import { motion, type TargetAndTransition } from 'framer-motion';

export type MascotState = 'sleeping' | 'idle' | 'waving' | 'talking' | 'excited' | 'sad';

interface Props {
  state: MascotState;
  color?: string;
  lightColor?: string;
  resinCode?: number;
  size?: number;
}

const floatVariants: Record<MascotState, TargetAndTransition> = {
  sleeping: {
    y: [0, -6, 0],
    transition: { repeat: Infinity, duration: 3.2, ease: 'easeInOut' },
  },
  idle: {
    y: [0, -4, 0],
    transition: { repeat: Infinity, duration: 2.6, ease: 'easeInOut' },
  },
  waving: {
    y: [0, -5, 0],
    transition: { repeat: Infinity, duration: 1.6, ease: 'easeInOut' },
  },
  talking: {
    y: [0, -3, 0],
    transition: { repeat: Infinity, duration: 0.9, ease: 'easeInOut' },
  },
  excited: {
    y: [0, -18, 0],
    transition: { repeat: Infinity, duration: 0.45, ease: 'easeOut' },
  },
  sad: {
    y: [0, -2, 0],
    transition: { repeat: Infinity, duration: 3.5, ease: 'easeInOut' },
  },
};

export function PlasticMascot({
  state,
  color = '#FF8A65',
  lightColor = '#FFCCBC',
  resinCode = 6,
  size = 200,
}: Props) {
  const asleep = state === 'sleeping';
  const excited = state === 'excited';
  const waving = state === 'waving';
  const talking = state === 'talking';
  const sad = state === 'sad';

  const mouthPath = sad
    ? 'M 88 145 Q 120 130 152 145'
    : 'M 88 132 Q 120 156 152 132';

  return (
    <svg
      viewBox="0 0 240 215"
      width={size}
      height={(size * 215) / 240}
      style={{ overflow: 'visible', display: 'block' }}
      aria-hidden="true"
    >
      <motion.g animate={floatVariants[state]}>
        {/* Drop shadow */}
        <ellipse cx="120" cy="208" rx="92" ry="7" fill="rgba(0,0,0,0.18)" />

        {/* Body */}
        <rect x="8" y="18" width="224" height="162" rx="24" fill={color} />

        {/* Inner face area */}
        <rect x="26" y="36" width="188" height="126" rx="15" fill={lightColor} />

        {/* Left arm */}
        <motion.rect
          x="-10" y="68" width="24" height="48" rx="10"
          fill={color}
          style={{ originX: '2px', originY: '92px' }}
          animate={excited ? { rotate: [20, -20, 20] } : { rotate: 0 }}
          transition={{ repeat: Infinity, duration: 0.35 }}
        />

        {/* Right arm */}
        <motion.rect
          x="226" y="68" width="24" height="48" rx="10"
          fill={color}
          style={{ originX: '238px', originY: '92px' }}
          animate={
            waving
              ? { rotate: [0, -42, 0, -42, 0] }
              : excited
              ? { rotate: [-20, 20, -20] }
              : { rotate: 0 }
          }
          transition={{ repeat: Infinity, duration: waving ? 0.9 : 0.35 }}
        />

        {/* ── Eyes ── */}
        {asleep ? (
          /* Closed — upward arcs */
          <>
            <path
              d="M 66 100 Q 88 86 110 100"
              stroke="#2a1a0e" strokeWidth="5.5"
              fill="none" strokeLinecap="round"
            />
            <path
              d="M 130 100 Q 152 86 174 100"
              stroke="#2a1a0e" strokeWidth="5.5"
              fill="none" strokeLinecap="round"
            />
          </>
        ) : excited ? (
          /* Star eyes */
          <>
            <text x="88" y="116" textAnchor="middle" fontSize="32" fill="#FFD700">★</text>
            <text x="152" y="116" textAnchor="middle" fontSize="32" fill="#FFD700">★</text>
          </>
        ) : (
          /* Normal eyes */
          <>
            <circle cx="88" cy="100" r="23" fill="white" />
            <circle cx="152" cy="100" r="23" fill="white" />
            <circle cx="91" cy="103" r="13" fill="#1a1a2e" />
            <circle cx="155" cy="103" r="13" fill="#1a1a2e" />
            {/* Glints */}
            <circle cx="97" cy="97" r="5" fill="white" />
            <circle cx="161" cy="97" r="5" fill="white" />
            {/* Sad droopy inner brows */}
            {sad && (
              <>
                <path d="M 72 82 Q 88 77 104 84" stroke="#c07050" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M 136 84 Q 152 77 168 82" stroke="#c07050" strokeWidth="4" fill="none" strokeLinecap="round" />
              </>
            )}
          </>
        )}

        {/* ── Mouth ── */}
        {talking ? (
          <motion.ellipse
            cx="120" cy="140"
            rx="20" ry="5"
            fill="#1a1a2e"
            animate={{ ry: [5, 15, 5], rx: [20, 22, 20] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          />
        ) : (
          <path
            d={mouthPath}
            stroke="#1a1a2e" strokeWidth="4.5"
            fill="none" strokeLinecap="round"
          />
        )}

        {/* Resin code badge */}
        <circle cx="120" cy="156" r="17" fill="rgba(255,255,255,0.9)" />
        <text
          x="120" y="162"
          textAnchor="middle"
          fontSize="16" fontWeight="900"
          fill={color}
          fontFamily="system-ui, sans-serif"
        >
          {resinCode}
        </text>

        {/* Sleeping Zzz */}
        {asleep && (
          <>
            <motion.text
              x="172" y="28" fontSize="15" fontWeight="bold" fill={color}
              animate={{ y: [28, 8], opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, delay: 0 }}
            >z</motion.text>
            <motion.text
              x="188" y="12" fontSize="19" fontWeight="bold" fill={color}
              animate={{ y: [12, -8], opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, delay: 0.55 }}
            >Z</motion.text>
            <motion.text
              x="202" y="-2" fontSize="23" fontWeight="bold" fill={color}
              animate={{ y: [-2, -22], opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, delay: 1.1 }}
            >Z</motion.text>
          </>
        )}
      </motion.g>
    </svg>
  );
}
