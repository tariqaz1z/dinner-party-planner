import type { ReactNode } from 'react';

const points = (n: number, outer: number, inner: number) =>
  Array.from({ length: n * 2 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / n - Math.PI / 2;
    return `${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');

const PTS = points(14, 49, 41);

/** Pink sticker with black text, used for "best match". */
export function Starburst({ children, size = 84 }: { children: ReactNode; size?: number }) {
  return (
    <span className="starburst" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <polygon points={PTS} fill="#F9A8D4" stroke="#0A0A0A" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
      <span>{children}</span>
    </span>
  );
}

export function MiniStar() {
  return (
    <svg className="ministar" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <polygon points={PTS} fill="#F9A8D4" stroke="#0A0A0A" strokeWidth="6" strokeLinejoin="round" />
    </svg>
  );
}
