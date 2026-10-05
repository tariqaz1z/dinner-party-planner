import type { Allergen, Diet, Dish, Meat, Person, Pref } from '../types';

export const ALLERGENS: Allergen[] = ['nuts', 'dairy', 'gluten', 'shellfish', 'eggs', 'soy'];
export const PREFS: Pref[] = ['vegetarian', 'vegan', 'halal', 'pescatarian'];

export const allergyLabel = (a: Allergen) => (a === 'nuts' ? 'nut allergy' : a === 'eggs' ? 'egg allergy' : `${a} allergy`);
/** Noun form used inside sentences, e.g. "a nut allergy". */
export const allergyNoun = allergyLabel;
export const allergenName = (a: Allergen) => (a === 'eggs' ? 'eggs' : a);

export const emptyDiet = (): Diet => ({ allergies: [], prefs: [] });

export function joinList(items: string[]) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export interface Conflict {
  kind: 'allergy' | 'pref';
  text: string;
}

const firstName = (p: Person) => p.name.split(' ')[0];

/** Plain-spoken conflicts between a dish and the guests. Allergy conflicts come first. */
export function dishConflicts(dish: Pick<Dish, 'contains' | 'meat'>, people: Person[], diets?: Record<string, Diet>): Conflict[] {
  const out: Conflict[] = [];
  for (const a of dish.contains) {
    for (const p of people) {
      const d = diets?.[p.id] ?? p.diet;
      if (d.allergies.includes(a)) {
        out.push({ kind: 'allergy', text: `Contains ${allergenName(a)}. ${firstName(p)} has ${prefixA(allergyNoun(a))}.` });
      }
    }
  }
  for (const p of people) {
    const d = diets?.[p.id] ?? p.diet;
    const bad = prefConflict(d.prefs, dish);
    if (bad) out.push({ kind: 'pref', text: `${bad.what}. ${firstName(p)} prefers ${bad.pref}.` });
  }
  return out;
}

const prefixA = (s: string) => `a ${s}`;

function prefConflict(prefs: Pref[], dish: Pick<Dish, 'contains' | 'meat'>): { what: string; pref: Pref } | null {
  const meat: Meat = dish.meat;
  if (prefs.includes('vegan') && (meat !== 'none' || dish.contains.includes('dairy') || dish.contains.includes('eggs')))
    return { what: 'This dish is not vegan', pref: 'vegan' };
  if (prefs.includes('vegetarian') && meat !== 'none') return { what: `Contains ${meat === 'fish' ? 'fish' : 'meat'}`, pref: 'vegetarian' };
  if (prefs.includes('pescatarian') && meat === 'meat') return { what: 'Contains meat', pref: 'pescatarian' };
  return null;
}

/** Group summary for guests: counts only, never names. */
export function groupSummary(diets: Diet[]): string {
  const counts = new Map<string, number>();
  for (const d of diets) {
    for (const a of d.allergies) counts.set(allergyLabel(a), (counts.get(allergyLabel(a)) ?? 0) + 1);
  }
  for (const d of diets) {
    for (const p of d.prefs) counts.set(p, (counts.get(p) ?? 0) + 1);
  }
  if (counts.size === 0) return 'No dietary needs shared yet.';
  return joinList([...counts.entries()].map(([k, n]) => `${n} ${k}`)) + '.';
}

export const groupAllergens = (diets: Diet[]): Allergen[] => ALLERGENS.filter((a) => diets.some((d) => d.allergies.includes(a)));
