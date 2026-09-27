// Ikony wyeksportowane z Figmy jako SVG (komponenty arrow-*, play, arrow-up-from-dot).
type P = { className?: string; color?: string };

export function ArrowDown({ className = "size-5", color = "currentColor" }: P) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M10 4.167v11.666M4.167 10 10 15.833 15.833 10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowRight({ className = "size-5", color = "currentColor" }: P) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M4.167 10h11.666M10 15.833 15.833 10 10 4.167"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowUpRight({ className = "size-[34px]", color = "currentColor" }: P) {
  return (
    <svg viewBox="0 0 35 35" fill="none" className={className} aria-hidden>
      <path
        d="M24.792 23.839 23.838 10.209 10.208 11.162M23.838 10.209 11.161 24.792"
        stroke={color}
        strokeWidth="2.05"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Play({ className = "size-5" }: P) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M4.167 4.167a1.667 1.667 0 0 1 2.507-1.44l9.997 5.832a1.667 1.667 0 0 1 .002 2.881l-10 5.833a1.667 1.667 0 0 1-2.506-1.44V4.167Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowFromDot({ className = "size-6" }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M19 15l-7 7-7-7M12 22V8M13 3a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Okrągły przycisk-strzałka (Figma „Frame 29”). */
export function RoundArrow({
  className = "",
  style,
  label,
  onClick,
}: {
  className?: string;
  style?: React.CSSProperties;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex size-[60px] items-center justify-center rounded-full bg-brand text-white transition-transform hover:scale-105 ${className}`}
      style={style}
    >
      <ArrowRight />
    </button>
  );
}
