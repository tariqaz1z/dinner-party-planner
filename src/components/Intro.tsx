import { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { Logo } from './Logo';

const OBJECTS = [
  { e: '🍞', x: 8, y: 14, s: 64, d: 0 },
  { e: '🍷', x: 76, y: 10, s: 56, d: 1.2 },
  { e: '🥧', x: 78, y: 80, s: 60, d: 0.6 },
  { e: '🕯️', x: 6, y: 80, s: 52, d: 1.8 },
  { e: '🥗', x: 42, y: 88, s: 58, d: 0.9 },
];

export function Intro() {
  const { finishIntro } = useStore();
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => btn.current?.focus(), []);
  return (
    <div className="intro" role="dialog" aria-modal="true" aria-labelledby="intro-title">
      {OBJECTS.map((o) => (
        <span key={o.e} className="float-obj" aria-hidden="true" style={{ left: `${o.x}%`, top: `${o.y}%`, fontSize: o.s, animationDelay: `${o.d}s` }}>
          {o.e}
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
