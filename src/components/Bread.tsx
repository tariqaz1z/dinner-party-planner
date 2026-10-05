const LOAF = 'M20 112C20 52 68 26 120 26s100 26 100 86c0 18-14 28-30 28H50c-16 0-30-10-30-28z';

function Loaf() {
  return (
    <g>
      <path d={LOAF} fill="url(#crust)" stroke="#7A4210" strokeWidth="5" strokeLinejoin="round" />
      <path d="M44 100c10-34 44-50 76-50" fill="none" stroke="#FFE2A8" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      <path d="M78 52l12 38M114 44l8 46M152 52l-4 38M184 66l-12 28" fill="none" stroke="#9A5518" strokeWidth="5" strokeLinecap="round" />
    </g>
  );
}

const CRUMBS = [
  [110, 146, 5], [96, 150, 3], [130, 150, 4], [84, 146, 3], [146, 148, 3], [120, 152, 3], [104, 143, 2.5], [138, 144, 2.5], [72, 150, 2.5],
];

/** Stage 0 is a whole loaf; each tap breaks it a little further. Motion is CSS only, so reduced motion turns it off. */
export function Bread({ stage }: { stage: number }) {
  const label = stage === 0 ? 'A whole loaf of bread' : stage >= 3 ? 'The bread, broken in two' : 'The bread, starting to break';
  const half = (side: -1 | 1) => ({
    transform: `translate(${side * stage * 15}px, ${stage * 3}px) rotate(${side * stage * 5}deg)`,
    transformOrigin: '120px 130px',
  });
  return (
    <svg className="bread" viewBox="-30 -10 300 190" role="img" aria-label={label}>
      <defs>
        <linearGradient id="crust" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7C46C" />
          <stop offset="1" stopColor="#D08429" />
        </linearGradient>
        <clipPath id="half-l"><rect x="0" y="0" width="120" height="170" /></clipPath>
        <clipPath id="half-r"><rect x="120" y="0" width="120" height="170" /></clipPath>
      </defs>
      <ellipse cx="120" cy="154" rx="96" ry="9" fill="#0A0A0A" opacity="0.12" />
      <g className="bread-half" style={half(-1)}><g clipPath="url(#half-l)"><Loaf /><rect x="113" y="30" width="7" height="108" fill="#FBE7B5" opacity={stage ? 1 : 0} /></g></g>
      <g className="bread-half" style={half(1)}><g clipPath="url(#half-r)"><Loaf /><rect x="120" y="30" width="7" height="108" fill="#FBE7B5" opacity={stage ? 1 : 0} /></g></g>
      {CRUMBS.slice(0, stage * 3).map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#E6A64A" stroke="#7A4210" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

export function BreadIcon({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 240 170" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="crust-i" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7C46C" />
          <stop offset="1" stopColor="#D08429" />
        </linearGradient>
      </defs>
      <path d={LOAF} fill="url(#crust-i)" stroke="#7A4210" strokeWidth="7" strokeLinejoin="round" />
      <path d="M78 52l12 38M114 44l8 46M152 52l-4 38M184 66l-12 28" fill="none" stroke="#9A5518" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}
