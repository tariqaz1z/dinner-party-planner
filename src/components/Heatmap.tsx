import { useEffect, useMemo, useRef, useState } from 'react';
import type { Category, Person } from '../types';
import { addDays, lastPlannable, longDate, monthLabel, parse, shortDate, today } from '../lib/dates';
import { allDays, bestDates, shade, summarize, textOn, type Day } from '../lib/availability';
import { Icon } from './Icon';
import { Avatar } from './Avatar';
import { MiniStar, Starburst } from './Starburst';

const MAX = 4;
const WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface Props {
  people: Person[];
  category: Category;
  meConnected: boolean;
  shortlist: string[];
  onToggle: (date: string) => void;
}

const label = (d: Day, picked: boolean) =>
  `${longDate(d.date)}. ${d.free.length} of ${d.total} free${d.unknown.length ? `, ${d.unknown.length} unknown` : ''}.${d.best ? ' Best match.' : ''}${picked ? ' On the shortlist.' : ''}`;

/** Month calendar on top, day sheet below. Each day is shaded by how many people are free and also carries a count. */
export function Heatmap({ people, category, meConnected, shortlist, onToggle }: Props) {
  const t = today();
  const first = addDays(t, 1);
  const last = lastPlannable();
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const touchX = useRef<number | null>(null);

  const days = useMemo(() => {
    const list = allDays(first, last).map((d) => summarize(people, d, category, meConnected));
    const best = bestDates(list);
    return new Map(list.map((d) => [d.date, { ...d, best: best.has(d.date) }]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [people, category, meConnected]);

  const monthStart = new Date(t.getFullYear(), t.getMonth() + offset, 1);
  const maxOffset = (last.getFullYear() - t.getFullYear()) * 12 + last.getMonth() - t.getMonth();
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: monthStart.getDay() + daysInMonth }, (_, i) => {
    if (i < monthStart.getDay()) return null;
    const d = new Date(monthStart.getFullYear(), monthStart.getMonth(), i - monthStart.getDay() + 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { key, n: d.getDate(), day: days.get(key) };
  });

  const bests = [...days.values()].filter((d) => d.best);
  const sel = selected ? days.get(selected) : undefined;
  const picked = sel ? shortlist.includes(sel.date) : false;
  useEffect(() => {
    if (selected) document.querySelector('.day.sel')?.scrollIntoView({ block: 'nearest', behavior: 'auto' });
  }, [selected, offset]);
  const go = (n: number) => setOffset((o) => Math.min(maxOffset, Math.max(0, o + n)));
  const jump = (date: string) => {
    const d = parse(date);
    setOffset((d.getFullYear() - t.getFullYear()) * 12 + d.getMonth() - t.getMonth());
    setSelected(date);
  };

  return (
    <div className={`heat ${sel ? 'has-sheet' : ''}`}>
      <div
        className="heat-cal"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {bests.length > 0 && (
          <div className="bests">
            <Starburst size={76}>best match</Starburst>
            <ul>
              {bests.map((b) => (
                <li key={b.date}>
                  <button className="chip" onClick={() => jump(b.date)}>
                    {shortDate(b.date)} · {b.free.length}/{b.total} free
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="month-nav">
          <button className="round-btn" onClick={() => go(-1)} disabled={offset === 0} aria-label="Previous month">
            <Icon name="back" size={20} />
          </button>
          <h2 className="month-title" aria-live="polite">{monthLabel(monthStart)}</h2>
          <button className="round-btn" onClick={() => go(1)} disabled={offset >= maxOffset} aria-label="Next month">
            <Icon name="next" size={20} />
          </button>
        </div>
        <ul className="week" aria-hidden="true">
          {WEEK.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
        <ul className="grid" aria-label={`${monthLabel(monthStart)}. Swipe or use the arrows to change month.`}>
          {cells.map((c, i) =>
            c === null ? (
              <li key={`b${i}`} aria-hidden="true" />
            ) : !c.day ? (
              <li key={c.key}>
                <span className="day off" aria-hidden="true">{c.n}</span>
              </li>
            ) : (
              <li key={c.key}>
                <button
                  className={`day ${selected === c.key ? 'sel' : ''} ${shortlist.includes(c.key) ? 'picked' : ''}`}
                  style={c.day.level || c.day.free.length ? { background: shade(c.day.level), color: textOn(c.day.level) } : undefined}
                  aria-label={label(c.day, shortlist.includes(c.key))}
                  aria-pressed={selected === c.key}
                  onClick={() => setSelected(selected === c.key ? null : c.key)}
                >
                  <span className="day-n">{c.n}</span>
                  <span className="day-count">{c.day.free.length}/{c.day.total}</span>
                  {c.day.best && <MiniStar />}
                  {shortlist.includes(c.key) && <span className="day-check"><Icon name="check" size={12} /></span>}
                </button>
              </li>
            ),
          )}
        </ul>
        <p className="small muted legend">
          Darker means more people free. Numbers show free out of everyone invited. Unknown calendars are never counted as busy.
        </p>
      </div>

      {sel && (
        <section className="sheet" aria-label={`Details for ${longDate(sel.date)}`}>
          <div className="sheet-grab" aria-hidden="true" />
          <div className="sheet-head">
            <div>
              <h3 className="sheet-title" aria-live="polite">{longDate(sel.date)}</h3>
              <p className="small muted">
                {sel.free.length} free{sel.unknown.length ? `, ${sel.unknown.length} unknown` : ''}{sel.busy.length ? `, ${sel.busy.length} busy` : ''}
              </p>
            </div>
            {sel.best && <Starburst size={70}>best match</Starburst>}
            <button className="round-btn" onClick={() => setSelected(null)} aria-label="Close day details">
              <Icon name="close" size={20} />
            </button>
          </div>
          <button
            className={picked ? 'pill-outline' : 'pill-black'}
            disabled={!picked && shortlist.length >= MAX}
            onClick={() => onToggle(sel.date)}
          >
            {picked ? 'remove from shortlist' : shortlist.length >= MAX ? `shortlist is full (${MAX} of ${MAX})` : 'add to shortlist'}
          </button>
          <div className="groups">
            <Group title="Free" people={sel.free} />
            <Group title="Busy" people={sel.busy} />
            <Group title="Unknown" people={sel.unknown} hint="No shared calendar" />
          </div>
        </section>
      )}
    </div>
  );
}

function Group({ title, people, hint }: { title: string; people: Person[]; hint?: string }) {
  return (
    <div className="group">
      <h4 className="caps">{title} ({people.length})</h4>
      {people.length === 0 ? (
        <p className="small muted">nobody</p>
      ) : (
        <ul className="avatars">
          {people.map((p) => (
            <li key={p.id} title={hint}>
              <Avatar person={p} size={28} />
              <span className="small">{p.id === 'me' ? 'You' : p.name.split(' ')[0]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
