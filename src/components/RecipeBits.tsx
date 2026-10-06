import { Link, useNavigate } from 'react-router-dom';
import type { Recipe } from '../types';
import { Icon } from './Icon';
import { useStore } from '../store';
import { AllergyTag } from './DietTags';
import { allergyLabel } from '../lib/diet';

export function Plate({ recipe, size = 120 }: { recipe: Recipe; size?: number }) {
  return (
    <span
      className="plate"
      style={{ width: size, height: size, background: `linear-gradient(135deg, hsl(${recipe.hue} 90% 85%), hsl(${(recipe.hue + 40) % 360} 90% 80%))` }}
    >
      <img src={recipe.image} alt={`Illustration of ${recipe.name}`} width={size} height={size} loading={size < 120 ? "lazy" : "eager"} decoding="async" />
    </span>
  );
}

const COSTS = ['$', '$$', '$$$', '$$$$'];

export function StatTiles({ recipe }: { recipe: Recipe }) {
  const tiles = [
    { icon: 'flame', label: 'effort', value: `${recipe.effort}/5` },
    { icon: 'clock', label: 'time', value: `${recipe.minutes} min` },
    { icon: 'dollar', label: 'cost', value: COSTS[recipe.cost - 1] },
    { icon: 'sparkle', label: 'excitement', value: `${recipe.excitement}/5` },
  ];
  return (
    <ul className="stat-tiles">
      {tiles.map((t) => (
        <li key={t.label} className="stat-tile">
          <Icon name={t.icon} size={22} />
          <strong>{t.value}</strong>
          <span className="small muted">{t.label}</span>
        </li>
      ))}
    </ul>
  );
}

export function HostButton({ recipe, className = 'pill-black' }: { recipe: Recipe; className?: string }) {
  const nav = useNavigate();
  return (
    <button className={className} onClick={() => nav(`/host?recipe=${recipe.id}`)}>
      host a dinner with this
    </button>
  );
}

export function SaveButton({ recipe }: { recipe: Recipe }) {
  const { saved, toggleSaved } = useStore();
  const on = saved.includes(recipe.id);
  return (
    <button className={`save-btn ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => toggleSaved(recipe.id)}>
      <Icon name="bookmark" size={20} fill={on} />
      <span>{on ? 'saved' : 'save'}</span>
    </button>
  );
}

export function RecipeCard({ recipe, showHost }: { recipe: Recipe; showHost?: boolean }) {
  return (
    <article className="recipe-card">
      <Link to={`/recipe/${recipe.id}`} className="recipe-link">
        <Plate recipe={recipe} size={72} />
        <span className="recipe-info">
          <strong className="recipe-name">{recipe.name}</strong>
          <span className="small muted">{recipe.minutes} min · effort {recipe.effort}/5 · {COSTS[recipe.cost - 1]}</span>
          {recipe.contains.length > 0 && (
            <span className="small muted">contains {recipe.contains.map((a) => (a === 'eggs' ? 'eggs' : a)).join(', ')}</span>
          )}
        </span>
      </Link>
      {showHost && <HostButton recipe={recipe} className="pill-outline" />}
    </article>
  );
}

export function ContainsTags({ recipe }: { recipe: Recipe }) {
  if (!recipe.contains.length) return <p className="small muted">No common allergens listed.</p>;
  return (
    <p className="tags">
      {recipe.contains.map((a) => (
        <AllergyTag key={a} label={`contains ${a === 'eggs' ? 'eggs' : a}`} />
      ))}
      <span className="sr-only">{recipe.contains.map(allergyLabel).join(', ')}</span>
    </p>
  );
}

export function RecipeDetail({ recipe, headline }: { recipe: Recipe; headline?: string }) {
  return (
    <article className="recipe-detail">
      {headline && <p className="caps">{headline}</p>}
      <h1 className="h-display">{recipe.name}</h1>
      <p className="muted">{recipe.tagline}</p>
      <div className="plate-wrap"><Plate recipe={recipe} size={200} /></div>
      <StatTiles recipe={recipe} />
      <div className="row between">
        <SaveButton recipe={recipe} />
        <span className="small muted">serves {recipe.serves}</span>
      </div>
      <ContainsTags recipe={recipe} />
      <section aria-labelledby="ing">
        <h2 id="ing" className="caps">ingredients + items needed</h2>
        <ul className="plain-list">
          {recipe.ingredients.map((i) => <li key={i}>{i}</li>)}
        </ul>
      </section>
      <section aria-labelledby="steps">
        <h2 id="steps" className="caps">steps</h2>
        <ol className="steps">
          {recipe.steps.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
        {recipe.video && (
          <a className="pill-outline" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.name + ' recipe')}`} target="_blank" rel="noreferrer">
            <Icon name="play" size={18} fill /> video guide <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </section>
      <HostButton recipe={recipe} />
    </article>
  );
}
