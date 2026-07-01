/* Official Japanese plastic identification marks (JIS) */

export function PlaMark({ size = 60 }: { size?: number }) {
    return (
          <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
            <path d="M58,14 L72,14 A14,14 0 0 1 86,28 L86,72 A14,14 0 0 1 72,86 L58,86"
              fill="none" stroke="#000" strokeWidth="7.5" strokeLinecap="butt" />
            <path d="M42,86 L28,86 A14,14 0 0 1 14,72 L14,28 A14,14 0 0 1 28,14 L42,14"
              fill="none" stroke="#000" strokeWidth="7.5" strokeLinecap="butt" />
            <polygon points="58,80 58,93 44,86.5" fill="#000" />
            <polygon points="42,20 42,7 56,13.5" fill="#000" />
            <text x="50" y="58" textAnchor="middle" fontSize="26" fontWeight={900} fill="#000">プラ</text>
          </svg>
        );
  }

export function PetMark({ size = 60 }: { size?: number }) {
    return (
          <svg viewBox="0 0 100 110" width={size} height={size * 1.1} aria-hidden>
            <line x1="55.4" y1="19.75" x2="80.6" y2="65.25" stroke="#000" strokeWidth="7" strokeLinecap="butt" />
            <line x1="75.2" y1="75" x2="24.8" y2="75" stroke="#000" strokeWidth="7" strokeLinecap="butt" />
            <line x1="19.4" y1="65.25" x2="44.6" y2="19.75" stroke="#000" strokeWidth="7" strokeLinecap="butt" />
            <polygon points="87.38,77.5 74.48,68.64 86.72,61.86" fill="#000" />
            <polygon points="10.8,75 24.8,68 24.8,82" fill="#000" />
            <polygon points="51.38,7.5 50.72,23.14 38.48,16.36" fill="#000" />
            <text x="50" y="58" textAnchor="middle" fontSize="26" fontWeight={900} fill="#000">1</text>
            <text x="50" y="102" textAnchor="middle" fontSize="19" fontWeight={900} letterSpacing={1} fill="#000">PET</text>
          </svg>
        );
  }
