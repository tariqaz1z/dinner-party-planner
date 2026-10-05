import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Diet, Dinner, GuestEntry, Notice, Person } from './types';
import { ME } from './types';
import { FRIENDS, MY_PROFILE, seedDinners, seedNotices } from './data';

interface State {
  me: Person;
  people: Person[];
  dinners: Dinner[];
  notices: Notice[];
  saved: string[];
  introSeen: boolean;
}

interface Store extends State {
  everyone: Person[];
  person: (id: string) => Person;
  setMyDiet: (d: Diet) => void;
  setCalendar: (on: boolean) => void;
  toggleSaved: (recipeId: string) => void;
  addPeople: (p: Person[]) => void;
  addDinner: (d: Dinner) => void;
  updateDinner: (id: string, patch: Partial<Dinner>) => void;
  setGuest: (dinnerId: string, entry: GuestEntry) => void;
  addGuests: (dinnerId: string, ids: string[]) => void;
  confirmDate: (dinnerId: string, date: string) => void;
  addComment: (dinnerId: string, text: string) => void;
  notify: (text: string, to?: string) => void;
  markAllRead: () => void;
  readNotice: (id: string) => void;
  finishIntro: () => void;
  reset: () => void;
}

const KEY = 'crumb-v1';

const fresh = (): State => ({
  me: MY_PROFILE,
  people: FRIENDS,
  dinners: seedDinners(),
  notices: seedNotices(),
  saved: ['tomato-soup-loaf', 'mushroom-risotto', 'apple-galette'],
  introSeen: false,
});

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...fresh(), ...(JSON.parse(raw) as State) };
  } catch {
    /* storage unavailable: start fresh */
  }
  return fresh();
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* ignore */
    }
  }, [s]);

  const everyone = useMemo(() => [s.me, ...s.people], [s.me, s.people]);

  const person = useCallback(
    (id: string): Person => everyone.find((p) => p.id === id) ?? { id, name: 'Guest', blurb: '', hue: 0, diet: { allergies: [], prefs: [] }, calendar: false },
    [everyone],
  );

  const patchDinner = (id: string, fn: (d: Dinner) => Dinner) =>
    setS((x) => ({ ...x, dinners: x.dinners.map((d) => (d.id === id ? fn(d) : d)) }));

  const notifyIn = (x: State, text: string, to?: string): State => ({
    ...x,
    notices: [{ id: `n${Date.now()}${Math.random().toString(36).slice(2, 5)}`, text, at: Date.now(), read: false, to }, ...x.notices],
  });

  const store: Store = {
    ...s,
    everyone,
    person,
    setMyDiet: (diet) => setS((x) => ({ ...x, me: { ...x.me, diet } })),
    setCalendar: (calendar) => setS((x) => ({ ...x, me: { ...x.me, calendar } })),
    toggleSaved: (id) => setS((x) => ({ ...x, saved: x.saved.includes(id) ? x.saved.filter((r) => r !== id) : [...x.saved, id] })),
    addPeople: (p) => setS((x) => ({ ...x, people: [...x.people, ...p.filter((n) => !x.people.some((o) => o.id === n.id))] })),
    addDinner: (d) => setS((x) => ({ ...x, dinners: [d, ...x.dinners] })),
    updateDinner: (id, patch) => patchDinner(id, (d) => ({ ...d, ...patch })),
    setGuest: (dinnerId, entry) =>
      setS((x) => {
        const d = x.dinners.find((v) => v.id === dinnerId);
        if (!d) return x;
        const exists = d.guests.some((g) => g.personId === entry.personId);
        const guests = exists ? d.guests.map((g) => (g.personId === entry.personId ? entry : g)) : [...d.guests, entry];
        const who = x.people.find((p) => p.id === entry.personId)?.name ?? (entry.personId === ME ? 'You' : 'A guest');
        const first = who.split(' ')[0];
        const text =
          entry.rsvp === 'declined'
            ? `${first} can't make ${d.name}. You can invite someone else.`
            : entry.rsvp === 'accepted'
              ? `${first} said yes to ${d.name}.`
              : `${first} voted on ${d.name} dates.`;
        const next = { ...x, dinners: x.dinners.map((v) => (v.id === dinnerId ? { ...v, guests } : v)) };
        return d.hostId === ME && entry.personId !== ME ? notifyIn(next, text, `/dinner/${dinnerId}`) : next;
      }),
    addGuests: (dinnerId, ids) =>
      patchDinner(dinnerId, (d) => ({
        ...d,
        guests: [
          ...d.guests,
          ...ids
            .filter((id) => !d.guests.some((g) => g.personId === id))
            .map((id): GuestEntry => ({ personId: id, rsvp: 'pending', votes: [], diet: everyone.find((p) => p.id === id)?.diet ?? { allergies: [], prefs: [] } })),
        ],
      })),
    confirmDate: (dinnerId, date) => {
      patchDinner(dinnerId, (d) => ({ ...d, confirmedDate: date }));
      setS((x) => {
        const d = x.dinners.find((v) => v.id === dinnerId);
        return d ? notifyIn(x, `${d.name} is confirmed. Guests have been notified.`, `/dinner/${dinnerId}`) : x;
      });
    },
    addComment: (dinnerId, text) =>
      patchDinner(dinnerId, (d) => ({ ...d, comments: [...d.comments, { id: `c${Date.now()}`, personId: ME, text, at: Date.now() }] })),
    notify: (text, to) => setS((x) => notifyIn(x, text, to)),
    markAllRead: () => setS((x) => ({ ...x, notices: x.notices.map((n) => ({ ...n, read: true })) })),
    readNotice: (id) => setS((x) => ({ ...x, notices: x.notices.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
    finishIntro: () => setS((x) => ({ ...x, introSeen: true })),
    reset: () => setS({ ...fresh(), introSeen: true }),
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error('StoreProvider missing');
  return c;
}

export const dinnerStatus = (d: Dinner, isPastFn: (s: string) => boolean): 'voting' | 'confirmed' | 'past' =>
  d.confirmedDate ? (isPastFn(d.confirmedDate) ? 'past' : 'confirmed') : 'voting';
