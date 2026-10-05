import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Wizard } from '../components/Wizard';
import { Heatmap } from '../components/Heatmap';
import { Avatar } from '../components/Avatar';
import { DietTags, Notice, Warning } from '../components/DietTags';
import { Icon } from '../components/Icon';
import { Ticket } from '../components/Ticket';
import { Plate } from '../components/RecipeBits';
import { useStore } from '../store';
import { RECIPES, SLOTS, recipeById } from '../data';
import { ME, type Allergen, type BringMode, type Category, type Dinner, type Dish, type Person, type Recipe } from '../types';
import { ALLERGENS, allergenName, dishConflicts } from '../lib/diet';

const STEPS = 7;
const CATEGORIES: Category[] = ['breakfast', 'brunch', 'lunch', 'dinner'];
const BRING: { id: BringMode; title: string; desc: string }[] = [
  { id: 'host', title: 'host covers everything', desc: 'guests just show up.' },
  { id: 'byob', title: 'bring your own drinks', desc: 'you cook, guests bring something to sip.' },
  { id: 'potluck', title: 'potluck', desc: 'guests bring dishes and everyone can see who brings what.' },
  { id: 'mystery', title: 'mystery potluck', desc: 'your dish is visible. everything else is a surprise.' },
  { id: 'choose', title: 'let guests choose', desc: 'each guest decides what, if anything, to bring.' },
];

const toDish = (r: Recipe): Dish => ({ id: r.id, name: r.name, contains: r.contains, meat: r.meat, minutes: r.minutes, serves: r.serves });

/** Prep time grows a little for every guest beyond what the recipe serves. */
export const prepEstimate = (dish: Dish, headcount: number) =>
  Math.round((dish.minutes * (1 + Math.max(0, headcount - dish.serves) * 0.1)) / 5) * 5;

export const prepText = (mins: number) => (mins >= 60 ? `${Math.floor(mins / 60)} h${mins % 60 ? ` ${mins % 60} min` : ''}` : `${mins} min`);

export function Host() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { people, me, dinners, addPeople, addDinner } = useStore();

  const fromDinner = dinners.find((d) => d.id === params.get('from'));
  const startRecipe = recipeById(params.get('recipe') ?? '');

  const [step, setStep] = useState(1);
  const [guestIds, setGuestIds] = useState<string[]>(() => fromDinner?.guests.map((g) => g.personId).filter((id) => id !== ME) ?? []);
  const [linkGuests, setLinkGuests] = useState<Person[]>([]);
  const [category, setCategory] = useState<Category>('dinner');
  const [time, setTime] = useState('7:00 pm');
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [dish, setDish] = useState<Dish | null>(startRecipe ? toDish(startRecipe) : null);
  const [bringMode, setBringMode] = useState<BringMode>('host');
  const [name, setName] = useState('');
  const [place, setPlace] = useState('');
  const [note, setNote] = useState('');
  const [tried, setTried] = useState(false);

  useEffect(() => {
    document.getElementById('wiz-title')?.focus({ preventScroll: true });
  }, [step]);

  const guests = useMemo(() => [...people.filter((p) => guestIds.includes(p.id)), ...linkGuests], [people, guestIds, linkGuests]);
  const everyone = useMemo(() => [me, ...guests], [me, guests]);
  const headcount = everyone.length;

  const titles = ["who's coming?", 'what kind of meal?', 'when works?', 'what are we eating?', "what's everyone bringing?", 'the details', 'invite preview'];

  const valid = [
    guests.length > 0,
    !!time,
    shortlist.length >= 2,
    !!dish && dish.name.trim().length > 0,
    true,
    name.trim().length > 0,
    true,
  ];

  const next = () => {
    if (step === 6 && !valid[5]) {
      setTried(true);
      return;
    }
    if (valid[step - 1]) setStep(step + 1);
  };

  const send = async (copy: boolean) => {
    if (!dish) return;
    const id = `d-${Date.now()}`;
    addPeople(linkGuests);
    const dinner: Dinner = {
      id,
      name: name.trim(),
      hostId: ME,
      category,
      time,
      shortlist: [...shortlist].sort(),
      dish,
      prepMinutes: prepEstimate(dish, headcount),
      bringMode,
      location: place.trim(),
      note: note.trim(),
      guests: guests.map((g) => ({ personId: g.id, rsvp: 'pending', votes: [], diet: g.diet })),
      comments: [],
      createdAt: Date.now(),
    };
    addDinner(dinner);
    let copied = false;
    if (copy) {
      try {
        await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#/rsvp/${id}`);
        copied = true;
      } catch {
        /* the dinner page shows the link so it can be copied by hand */
      }
    }
    nav(`/dinner/${id}`, { replace: true, state: { sent: true, copied: copy ? copied : undefined } });
  };

  const footer =
    step === 7 ? (
      <div className="col">
        <button className="pill-black" onClick={() => send(false)}><Icon name="send" size={20} /> send invites in the app</button>
        <button className="pill-outline" onClick={() => send(true)}><Icon name="link" size={20} /> send and copy share link</button>
      </div>
    ) : (
      <div className="foot-row">
        {step === 1 && <p className="foot-count" aria-live="polite">{guests.length} selected</p>}
        {step === 3 && <p className="foot-count" aria-live="polite">{shortlist.length} of 4 picked</p>}
        {step === 4 && dish && <p className="foot-count">{prepText(prepEstimate(dish, headcount))} prep</p>}
        <button className="pill-black grow" onClick={next} disabled={!valid[step - 1] && step !== 6}>
          {step === 3 && shortlist.length < 2 ? 'pick at least 2 dates' : step === 1 && !guests.length ? 'add at least one friend' : 'continue'}
        </button>
      </div>
    );

  return (
    <Wizard title={titles[step - 1]} step={step} of={STEPS} onBack={() => (step === 1 ? nav(-1) : setStep(step - 1))} footer={footer}>
      {step === 1 && (
        <WhoStep
          friends={people.filter((p) => !p.link)}
          guestIds={guestIds}
          linkGuests={linkGuests}
          toggle={(id) => setGuestIds((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]))}
          addLink={(n) => setLinkGuests((l) => [...l, { id: `link-${Date.now()}`, name: n, blurb: 'joins by link', hue: Math.floor(Math.random() * 360), diet: { allergies: [], prefs: [] }, calendar: false, link: true }])}
          removeLink={(id) => setLinkGuests((l) => l.filter((x) => x.id !== id))}
        />
      )}
      {step === 2 && (
        <div className="col">
          <fieldset className="fieldset">
            <legend>Meal</legend>
            <div className="seg">
              {CATEGORIES.map((c) => (
                <label key={c} className={`seg-item ${category === c ? 'on' : ''}`}>
                  <input type="radio" name="category" checked={category === c} onChange={() => { setCategory(c); setTime(SLOTS[c][Math.min(1, SLOTS[c].length - 1)]); setShortlist([]); }} />
                  {category === c && <Icon name="check" size={16} />}
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="fieldset">
            <legend>Start time</legend>
            <div className="choices">
              {SLOTS[category].map((s) => (
                <label key={s} className={`choice ${time === s ? 'on' : ''}`}>
                  <input type="radio" name="time" checked={time === s} onChange={() => setTime(s)} />
                  {time === s && <Icon name="check" size={16} />}
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <p className="small muted">Availability on the next step is checked for {category} times.</p>
        </div>
      )}
      {step === 3 && (
        <Heatmap
          people={everyone}
          category={category}
          meConnected={me.calendar}
          shortlist={shortlist}
          onToggle={(d) => setShortlist((s) => (s.includes(d) ? s.filter((x) => x !== d) : s.length < 4 ? [...s, d] : s))}
        />
      )}
      {step === 4 && <DishStep dish={dish} setDish={setDish} guests={guests} headcount={headcount} />}
      {step === 5 && (
        <fieldset className="fieldset">
          <legend className="sr-only">What guests bring</legend>
          <div className="col">
            {BRING.map((b) => (
              <label key={b.id} className={`option ${bringMode === b.id ? 'on' : ''}`}>
                <input type="radio" name="bring" checked={bringMode === b.id} onChange={() => setBringMode(b.id)} />
                <span className="option-check">{bringMode === b.id && <Icon name="check" size={16} />}</span>
                <span>
                  <strong>{b.title}</strong>
                  <span className="small block opt-desc">{b.desc}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {step === 6 && (
        <div className="col">
          <div className="field">
            <label htmlFor="name">Dinner name (required)</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={tried && !name.trim()} aria-describedby={tried && !name.trim() ? 'name-err' : undefined} placeholder="for example: autumn supper" />
            {tried && !name.trim() && <p id="name-err" className="error" role="alert">Give your dinner a name so guests know what they are saying yes to.</p>}
          </div>
          <div className="field">
            <label htmlFor="loc">Location</label>
            <input id="loc" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="for example: my place, 214 Maple St" />
          </div>
          <div className="field">
            <label htmlFor="note">Note from the host (optional)</label>
            <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="anything guests should know" />
          </div>
        </div>
      )}
      {step === 7 && (
        <div className="col">
          <p className="muted">This is the ticket exactly as your guests will see it.</p>
          <Ticket name={name} host={me} dish={dish?.name ?? ''} category={category} time={time} dates={[...shortlist].sort()} note={note} location={place} />
          <p className="small muted">Sending notifies {guests.map((g) => g.name.split(' ')[0]).join(', ')}. Friends who are not on the app get the share link.</p>
        </div>
      )}
    </Wizard>
  );
}

function WhoStep({ friends, guestIds, linkGuests, toggle, addLink, removeLink }: {
  friends: Person[];
  guestIds: string[];
  linkGuests: Person[];
  toggle: (id: string) => void;
  addLink: (name: string) => void;
  removeLink: (id: string) => void;
}) {
  const [q, setQ] = useState('');
  const [linkName, setLinkName] = useState('');
  const [open, setOpen] = useState(false);
  const shown = friends.filter((f) => f.name.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <div className="col">
      <div className="field">
        <label htmlFor="fq">Search friends on the app</label>
        <input id="fq" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="name" autoComplete="off" />
      </div>
      <ul className="stack-list">
        {shown.map((f) => {
          const on = guestIds.includes(f.id);
          return (
            <li key={f.id} className="person-row">
              <Avatar person={f} size={48} />
              <span className="person-info">
                <strong>{f.name}</strong>
                <span className="small muted">{f.blurb}</span>
                <DietTags diet={f.diet} />
              </span>
              <button className={`plus-btn ${on ? 'on' : ''}`} aria-pressed={on} aria-label={`${on ? 'Remove' : 'Add'} ${f.name}`} onClick={() => toggle(f.id)}>
                <Icon name={on ? 'check' : 'plus'} size={22} />
              </button>
            </li>
          );
        })}
        {linkGuests.map((f) => (
          <li key={f.id} className="person-row">
            <Avatar person={f} size={48} />
            <span className="person-info">
              <strong>{f.name}</strong>
              <span className="small muted">invited by link, calendar unknown</span>
            </span>
            <button className="plus-btn on" aria-label={`Remove ${f.name}`} onClick={() => removeLink(f.id)}><Icon name="check" size={22} /></button>
          </li>
        ))}
        {shown.length === 0 && <li className="muted">No friends on the app match "{q}". Only app users show up in search; use invite by link below.</li>}
      </ul>
      <section className="card">
        <h2 className="caps">not on the app?</h2>
        {open ? (
          <form className="col" onSubmit={(e) => { e.preventDefault(); if (linkName.trim()) { addLink(linkName.trim()); setLinkName(''); setOpen(false); } }}>
            <div className="field">
              <label htmlFor="ln">Friend's name</label>
              <input id="ln" value={linkName} onChange={(e) => setLinkName(e.target.value)} autoFocus />
            </div>
            <button className="pill-black slim" type="submit" disabled={!linkName.trim()}>add them</button>
          </form>
        ) : (
          <button className="pill-outline" onClick={() => setOpen(true)}><Icon name="link" size={20} /> invite by link</button>
        )}
        <p className="small muted">They get a simple web page that mirrors the in-app RSVP.</p>
      </section>
    </div>
  );
}

function DishStep({ dish, setDish, guests, headcount }: { dish: Dish | null; setDish: (d: Dish) => void; guests: Person[]; headcount: number }) {
  const { saved } = useStore();
  const [tab, setTab] = useState<'cookbook' | 'all' | 'own'>(dish && !dish.id ? 'own' : 'cookbook');
  const [q, setQ] = useState('');
  const list = (tab === 'cookbook' ? saved.map(recipeById).filter((r): r is Recipe => !!r) : RECIPES).filter((r) => r.name.toLowerCase().includes(q.trim().toLowerCase()) || (tab === 'all' && r.ingredients.some((i) => i.toLowerCase().includes(q.trim().toLowerCase()))));
  const pinned = dish?.id && !list.some((r) => r.id === dish.id) ? recipeById(dish.id) : undefined;
  const conflicts = dish ? dishConflicts(dish, guests) : [];
  const own = dish && !dish.id ? dish : { name: '', contains: [] as Allergen[], meat: 'none' as const, minutes: 60, serves: 4 };

  return (
    <div className="col">
      <fieldset className="fieldset">
        <legend className="sr-only">Where to pick the dish from</legend>
        <div className="seg">
          {([['cookbook', 'cookbook'], ['all', 'search all'], ['own', 'my own']] as const).map(([id, label]) => (
            <label key={id} className={`seg-item ${tab === id ? 'on' : ''}`}>
              <input type="radio" name="tab" checked={tab === id} onChange={() => setTab(id)} />
              {tab === id && <Icon name="check" size={16} />}
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {tab !== 'own' ? (
        <>
          {tab === 'all' && (
            <div className="field">
              <label htmlFor="rq">Recipe name or ingredient</label>
              <input id="rq" type="search" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          )}
          {list.length === 0 && <p className="muted">{tab === 'cookbook' ? 'Your cookbook is empty. Try search all.' : 'No recipes match.'}</p>}
          <ul className="stack-list">
            {[...(pinned ? [pinned] : []), ...list].map((r) => {
              const on = dish?.id === r.id;
              return (
                <li key={r.id}>
                  <button className={`pick-row ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => setDish(toDish(r))}>
                    <Plate recipe={r} size={56} />
                    <span className="recipe-info">
                      <strong className="recipe-name">{r.name}</strong>
                      <span className="small muted">{r.minutes} min{r.contains.length ? ` · contains ${r.contains.map(allergenName).join(', ')}` : ''}</span>
                    </span>
                    {on && <Icon name="check" size={22} />}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <div className="col">
          <div className="field">
            <label htmlFor="dn">Dish name</label>
            <input id="dn" value={own.name} onChange={(e) => setDish({ ...own, name: e.target.value })} placeholder="for example: grandma's lasagna" />
          </div>
          <fieldset className="fieldset">
            <legend>Contains (so we can check against allergies)</legend>
            <div className="choices">
              {ALLERGENS.map((a) => {
                const on = own.contains.includes(a);
                return (
                  <label key={a} className={`choice choice-allergy ${on ? 'on' : ''}`}>
                    <input type="checkbox" checked={on} onChange={() => setDish({ ...own, contains: on ? own.contains.filter((x) => x !== a) : [...own.contains, a] })} />
                    <span>{allergenName(a)}</span>
                  </label>
                );
              })}
              <label className={`choice ${own.meat === 'meat' ? 'on' : ''}`}>
                <input type="checkbox" checked={own.meat === 'meat'} onChange={() => setDish({ ...own, meat: own.meat === 'meat' ? 'none' : 'meat' })} />
                <span>meat</span>
              </label>
            </div>
          </fieldset>
          <div className="field">
            <label htmlFor="pm">Your prep time without guests scaling (minutes)</label>
            <input id="pm" type="number" min={5} step={5} value={own.minutes} onChange={(e) => setDish({ ...own, minutes: Math.max(5, Number(e.target.value) || 5) })} />
          </div>
        </div>
      )}

      {dish && dish.name.trim() && (
        <section className="card" aria-labelledby="chk">
          <h2 id="chk" className="caps">dish check</h2>
          {conflicts.length === 0 ? (
            <p>No conflicts with the allergies or preferences guests have shared.</p>
          ) : (
            <div className="col">
              {conflicts.filter((c) => c.kind === 'allergy').map((c, i) => <Warning key={i} text={c.text} />)}
              {conflicts.filter((c) => c.kind === 'pref').map((c, i) => <Notice key={i} text={c.text} />)}
            </div>
          )}
          <p><strong>Prep estimate:</strong> about {prepText(prepEstimate(dish, headcount))} for {headcount} {headcount === 1 ? 'person' : 'people'}.</p>
          <p className="small muted">Guests can still update their needs when they RSVP, and you will see those changes on the dinner page.</p>
        </section>
      )}
    </div>
  );
}
