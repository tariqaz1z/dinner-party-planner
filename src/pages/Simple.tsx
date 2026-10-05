import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { RECIPES, ROTD_ID, recipeById } from '../data';
import { RecipeCard, RecipeDetail } from '../components/RecipeBits';
import { Logo } from '../components/Logo';
import { Icon } from '../components/Icon';
import { DinnerRow } from '../components/DinnerRow';
import { dinnerStatus } from '../store';
import { isPast, timeAgo } from '../lib/dates';

export function Home() {
  const rotd = recipeById(ROTD_ID)!;
  const trending = RECIPES.filter((r) => r.id !== ROTD_ID);
  const rail = useRef<HTMLUListElement>(null);
  const scroll = (dir: number) => rail.current?.scrollBy({ left: dir * 260, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  return (
    <>
      <div className="home-logo"><Logo size={40} /></div>
      <div className="stack-card butter">
        <RecipeDetail recipe={rotd} headline="Recipe of the Day" />
      </div>
      <section aria-labelledby="trend">
        <div className="row between">
          <h2 id="trend" className="caps">trending, low effort</h2>
          <span className="row gap-s">
            <button className="round-btn" onClick={() => scroll(-1)} aria-label="Scroll trending recipes back"><Icon name="back" size={20} /></button>
            <button className="round-btn" onClick={() => scroll(1)} aria-label="Scroll trending recipes forward"><Icon name="next" size={20} /></button>
          </span>
        </div>
        <ul className="rail" ref={rail} tabIndex={0} aria-label="Trending recipes">
          {trending.map((r) => (
            <li key={r.id}><RecipeCard recipe={r} /></li>
          ))}
        </ul>
      </section>
    </>
  );
}

export function RecipePage() {
  const { id } = useParams();
  const r = id ? recipeById(id) : undefined;
  if (!r) return <p>That recipe could not be found. <Link to="/">Back to home</Link></p>;
  return <RecipeDetail recipe={r} />;
}

export function Search() {
  const [q, setQ] = useState('');
  const term = q.trim().toLowerCase();
  const results = term
    ? RECIPES.filter((r) => r.name.toLowerCase().includes(term) || r.ingredients.some((i) => i.toLowerCase().includes(term)))
    : RECIPES;
  return (
    <>
      <h1 className="h-display">search</h1>
      <div className="field">
        <label htmlFor="q">Recipe name or ingredient</label>
        <input id="q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="for example: basil" autoComplete="off" />
      </div>
      <p className="small muted" aria-live="polite">{results.length} {results.length === 1 ? 'recipe' : 'recipes'}{term ? ` for "${q.trim()}"` : ''}</p>
      <ul className="stack-list">
        {results.map((r) => <li key={r.id}><RecipeCard recipe={r} showHost /></li>)}
      </ul>
    </>
  );
}

export function Notifications() {
  const { notices, markAllRead, readNotice } = useStore();
  return (
    <>
      <div className="row between">
        <h1 className="h-display">notifications</h1>
      </div>
      {notices.some((n) => !n.read) && <button className="pill-outline slim" onClick={markAllRead}>mark all as read</button>}
      {notices.length === 0 ? (
        <p className="muted">Nothing yet. RSVPs, date votes and reminders will show up here.</p>
      ) : (
        <ul className="stack-list">
          {notices.map((n) => (
            <li key={n.id}>
              <Link to={n.to ?? '/'} className={`notice-row ${n.read ? '' : 'unread'}`} onClick={() => readNotice(n.id)}>
                <span>
                  {!n.read && <span className="sr-only">Unread. </span>}
                  {n.text}
                  <span className="small muted block">{timeAgo(n.at)}</span>
                </span>
                {!n.read && <span className="dot" aria-hidden="true" />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function CalendarPage() {
  const { dinners } = useStore();
  const upcoming = dinners
    .filter((d) => dinnerStatus(d, isPast) !== 'past')
    .sort((a, b) => (a.confirmedDate ?? a.shortlist[0] ?? '').localeCompare(b.confirmedDate ?? b.shortlist[0] ?? ''));
  return (
    <>
      <h1 className="h-display">calendar</h1>
      <p className="muted">upcoming dinners. tap one to open its plan.</p>
      {upcoming.length === 0 ? (
        <div className="empty">
          <p>No dinners yet. Plan your first one.</p>
          <Link to="/host" className="pill-black">plan a dinner</Link>
        </div>
      ) : (
        <ul className="stack-list">
          {upcoming.map((d) => <li key={d.id}><DinnerRow dinner={d} /></li>)}
        </ul>
      )}
    </>
  );
}

export function Cookbook() {
  const { saved } = useStore();
  const list = saved.map(recipeById).filter((r) => r !== undefined);
  return (
    <>
      <h1 className="h-display">cookbook</h1>
      <p className="muted">recipes you saved. each one can start a dinner.</p>
      {list.length === 0 ? (
        <div className="empty">
          <p>Nothing saved yet. Tap save on any recipe.</p>
          <Link to="/" className="pill-black">browse recipes</Link>
        </div>
      ) : (
        <ul className="stack-list">
          {list.map((r) => <li key={r.id}><RecipeCard recipe={r} showHost /></li>)}
        </ul>
      )}
    </>
  );
}

