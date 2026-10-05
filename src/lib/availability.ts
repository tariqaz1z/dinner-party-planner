import type { Category, Person } from '../types';
import { iso, parse } from './dates';

export type Status = 'free' | 'busy' | 'unknown';

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 1000;
}

/** Fictional calendar data. Weekday evenings are usually taken by work; Friday and Saturday evenings are open. */
export function statusFor(p: Person, date: string, cat: Category, meConnected: boolean): Status {
  const connected = p.id === 'me' ? meConnected : p.calendar;
  if (!connected) return 'unknown';
  const dow = parse(date).getDay();
  const evening = cat === 'dinner';
  const odds = evening
    ? [0.55, 0.3, 0.28, 0.3, 0.35, 0.82, 0.9][dow]
    : [0.8, 0.2, 0.2, 0.22, 0.25, 0.3, 0.78][dow];
  return hash(`${p.id}|${date}|${cat}`) / 1000 < odds ? 'free' : 'busy';
}

export interface Day {
  date: string;
  free: Person[];
  busy: Person[];
  unknown: Person[];
  total: number;
  /** Share of known calendars that are free; unknown calendars never count against a day. */
  level: number;
  best: boolean;
}

export function summarize(people: Person[], date: string, cat: Category, meConnected: boolean): Day {
  const free: Person[] = [];
  const busy: Person[] = [];
  const unknown: Person[] = [];
  for (const p of people) {
    const s = statusFor(p, date, cat, meConnected);
    (s === 'free' ? free : s === 'busy' ? busy : unknown).push(p);
  }
  const known = free.length + busy.length;
  return { date, free, busy, unknown, total: people.length, level: known ? free.length / known : 0, best: false };
}

export function bestDates(days: Day[]): Set<string> {
  const ranked = days
    .filter((d) => d.free.length >= 2)
    .sort((a, b) => b.free.length - a.free.length || a.busy.length - b.busy.length || a.date.localeCompare(b.date));
  return new Set(ranked.slice(0, 2).map((d) => d.date));
}

export function allDays(from: Date, to: Date): string[] {
  const out: string[] = [];
  for (let d = new Date(from); d <= to; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) out.push(iso(d));
  return out;
}

// ---- color ----
const LIGHT = [0xee, 0xf0, 0xff];
const DARK = [0x3b, 0x2b, 0xd9];

export function shade(level: number): string {
  const c = LIGHT.map((l, i) => Math.round(l + (DARK[i] - l) * level));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

const lum = (rgb: number[]) => {
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Pick white or ink text, whichever has better contrast on this shade. */
export function textOn(level: number): string {
  const c = LIGHT.map((l, i) => l + (DARK[i] - l) * level);
  const L = lum(c);
  const white = 1.05 / (L + 0.05);
  const ink = (L + 0.05) / (lum([10, 10, 10]) + 0.05);
  return white > ink ? '#FFFFFF' : '#0A0A0A';
}
