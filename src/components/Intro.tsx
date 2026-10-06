import { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { Logo } from './Logo';
import { foodImages } from '../lib/images';

const OBJECTS = [
  { image: foodImages['bread'], x: 8, y: 14, s: 64, d: 0 },
  { image: foodImages['wine'], x: 76, y: 10, s: 56, d: 1.2 },
  { image: foodImages['apple-galette'], x: 78, y: 80, s: 60, d: 0.6 },
  { image: foodImages['candle'], x: 6, y: 80, s: 52, d: 1.8 },
  { image: foodImages['halloumi-tabbouleh'], x: 42, y: 88, s: 58, d: 0.9 },
];

export function Intro() {
  const { finishIntro } = useStore();
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => btn.current?.focus(), []);
  return (
    <div className="intro" role="dialog" aria-modal="true" aria-labelledby="intro-title">
      {OBJECTS.map((o) => (
        <span key={o.image} className="float-obj" aria-hidden="true" style={{ left: `${o.x}%`, top: `${o.y}%`, width: o.s, height: o.s, animationDelay: `${o.d}s` }}>
          <img src={o.image} alt="" width={o.s} height={o.s} />
        </span>
      ))}
      <div className="intro-card">
        <Logo size={72} />
        <h1 id="intro-title" className="intro-title">from "we should get dinner" to a date on the calendar.</h1>
        <p className="muted">one dinner party at a time. pick a date, collect rsvps, keep every allergy front and center.</p>
        <button ref={btn} className="pill-black" onClick={finishIntro}>let's eat</button>
      </div>
    </div>
  );
}
