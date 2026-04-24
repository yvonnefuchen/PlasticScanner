interface Props {
  value: number;
  onChange: (v: number) => void;
}

const EMOJIS = ['😞', '😕', '😐', '😊', '🤩'];

export function EmojiRating({ value, onChange }: Props) {
  return (
    <div className="emoji-rating">
      {EMOJIS.map((e, i) => {
        const n = i + 1;
        return (
          <button
            key={n}
            type="button"
            className={`emoji-btn ${n === value ? 'emoji-btn--on' : ''}`}
            onClick={() => onChange(n)}
            aria-label={`${n}`}
          >
            {e}
          </button>
        );
      })}
    </div>
  );
}
