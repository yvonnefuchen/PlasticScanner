interface Props {
  value: number;
  onChange: (v: number) => void;
  lowLabel?: string;
  highLabel?: string;
}

export function StarRating({ value, onChange, lowLabel, highLabel }: Props) {
  return (
    <div className="star-rating">
      {lowLabel && <span className="star-label">{lowLabel}</span>}
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`star-btn ${n <= value ? 'star-btn--on' : ''}`}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n !== 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
      {highLabel && <span className="star-label">{highLabel}</span>}
    </div>
  );
}
