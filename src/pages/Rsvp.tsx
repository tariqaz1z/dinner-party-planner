import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Wizard } from '../components/Wizard';
import { Ticket } from '../components/Ticket';
import { Bread } from '../components/Bread';
import { Icon, WarnIcon } from '../components/Icon';
import { Notice, Warning } from '../components/DietTags';
import { useStore } from '../store';
import { ME, type Allergen, type Diet, type GuestEntry, type Pref } from '../types';
import { ALLERGENS, PREFS, allergenName, allergyLabel, groupAllergens, joinList, dishConflicts } from '../lib/diet';
import { longDate, shortDate } from '../lib/dates';

type Screen = 'ticket' | 'decline' | 'respond' | 'bread' | 'done';

export function Rsvp() {
  const { id } = useParams();
  const nav = useNavigate();
  const store = useStore();
  const d = store.dinners.find((x) => x.id === id);

  const isHost = d?.hostId === ME;
  const entry = d?.guests.find((g) => g.personId === ME);
  const mode: 'preview' | 'member' | 'link' = isHost ? 'preview' : entry ? 'member' : 'link';

  const [screen, setScreen] = useState<Screen>('ticket');
  const [declined, setDeclined] = useState(false);
  const [name, setName] = useState('');
  const [votes, setVotes] = useState<string[]>(entry?.votes ?? []);
  const [diet, setDiet] = useState<Diet>(entry?.diet ?? store.me.diet);
  const [dietOk, setDietOk] = useState(false);
  const [dish, setDish] = useState(entry?.bring?.dish ?? '');
  const [contains, setContains] = useState<Allergen[]>(entry?.bring?.contains ?? []);
  const [safeOk, setSafeOk] = useState(false);
  const [note, setNote] = useState('');
  const [taps, setTaps] = useState(0);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    document.getElementById('wiz-title')?.focus({ preventScroll: true });
  }, [screen]);

  if (!d) {
    return (
      <Wizard title="invite not found" onBack={() => nav('/')}>
        <p>This invite could not be found. It may have been removed, or it was shared from a different browser.</p>
        <Link className="pill-black" to="/">back to home</Link>
      </Wizard>
    );
  }

  const host = store.person(d.hostId);
  const hostFirst = host.name.split(' ')[0];
  const confirmed = d.confirmedDate;
  const others = d.guests.filter((g) => g.personId !== ME && g.rsvp !== 'declined');
  const groupDiets = [host.diet, ...others.map((g) => g.diet)];
  const groupA = groupAllergens(groupDiets);
  const bringsDish = d.bringMode === 'potluck' || d.bringMode === 'mystery' || d.bringMode === 'choose';
  const clash = contains.filter((a) => groupA.includes(a));
  const mainClash = dishConflicts(d.dish, [{ ...store.me, diet }], { [ME]: diet }).filter((c) => c.kind === 'allergy');

  const personId = mode === 'link' ? `guest-${name.trim().toLowerCase().replace(/\W+/g, '-')}` : ME;

  const submit = (rsvp: 'accepted' | 'declined') => {
    if (mode === 'preview') return;
    const base: GuestEntry = {
      personId,
      rsvp,
      votes: rsvp === 'accepted' ? (confirmed ? [confirmed] : votes) : [],
      diet,
      bring: rsvp === 'accepted' && dish.trim() ? { dish: dish.trim(), contains } : undefined,
      declineNote: rsvp === 'declined' && note.trim() ? note.trim() : undefined,
    };
    if (mode === 'link') {
      store.addPeople([{ id: personId, name: name.trim(), blurb: 'joined by link', hue: 200, diet, calendar: false, link: true }]);
    }
    store.setGuest(d.id, base);
  };

  const finish = () => {
    submit('accepted');
    setScreen('done');
  };

  const tap = () => {
    const n = Math.min(3, taps + 1);
    setTaps(n);
    if (n === 3) window.setTimeout(finish, 600);
  };

  const preview = mode === 'preview' && (
    <Notice text="Preview: this is what your guests see. Nothing you do here is saved." />
  );

  const toggleA = (a: Allergen) => setDiet({ ...diet, allergies: diet.allergies.includes(a) ? diet.allergies.filter((x) => x !== a) : [...diet.allergies, a] });
  const toggleP = (p: Pref) => setDiet({ ...diet, prefs: diet.prefs.includes(p) ? diet.prefs.filter((x) => x !== p) : [...diet.prefs, p] });

  const leave = () => nav(mode === 'link' ? '/' : `/dinner/${d.id}`);

  // ---------- screens ----------
  if (screen === 'ticket') {
    return (
      <Wizard title="you're invited" onBack={leave} backLabel="Close invite" footer={
        <div className="col">
          <button className="pill-black" onClick={() => setScreen('respond')}>respond</button>
          <button className="pill-outline" onClick={() => setScreen('decline')}>can't make it</button>
        </div>
      }>
        {preview}
        <Ticket name={d.name} host={host} dish={d.dish.name} category={d.category} time={d.time} dates={d.shortlist} note={d.note} location={d.location} confirmedDate={confirmed} />
      </Wizard>
    );
  }

  if (screen === 'decline') {
    return (
      <Wizard title="no worries" onBack={() => setScreen('ticket')} footer={
        <button className="pill-black" onClick={() => { if (mode === 'link' && !name.trim()) { setTried(true); return; } submit('declined'); setDeclined(true); setScreen('done'); }}>send decline</button>
      }>
        {preview}
        <p className="muted">{hostFirst} will be told, and can invite someone else.</p>
        {mode === 'link' && <NameField name={name} setName={setName} error={tried && !name.trim()} />}
        <div className="field">
          <label htmlFor="dn">A kind note to {hostFirst} (optional)</label>
          <textarea id="dn" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </Wizard>
    );
  }

  if (screen === 'respond') {
    const errors = {
      name: mode === 'link' && !name.trim(),
      votes: !confirmed && votes.length === 0,
      diet: !dietOk,
      safe: d.bringMode === 'mystery' && dish.trim() !== '' && (!safeOk || clash.length > 0),
    };
    const canGo = !errors.name && !errors.votes && !errors.diet && !errors.safe;
    return (
      <Wizard title="your response" onBack={() => setScreen('ticket')} footer={
        <button className="pill-black" onClick={() => (canGo ? setScreen('bread') : setTried(true))}>continue</button>
      }>
        {preview}
        <div className="col">
          {mode === 'link' && <NameField name={name} setName={setName} error={tried && errors.name} />}

          <fieldset className="fieldset">
            <legend>{confirmed ? 'Date' : 'Which dates work for you? (pick any)'}</legend>
            {confirmed ? (
              <p>{longDate(confirmed)}, {d.time}</p>
            ) : (
              <div className="choices">
                {d.shortlist.map((date) => {
                  const on = votes.includes(date);
                  return (
                    <label key={date} className={`choice ${on ? 'on' : ''}`}>
                      <input type="checkbox" checked={on} onChange={() => setVotes(on ? votes.filter((v) => v !== date) : [...votes, date])} />
                      {on && <Icon name="check" size={16} />}
                      <span>{shortDate(date)}</span>
                    </label>
                  );
                })}
              </div>
            )}
            {tried && errors.votes && <p className="error" role="alert">Pick at least one date, or go back and choose "can't make it".</p>}
          </fieldset>

          <fieldset className="fieldset">
            <legend>Your allergies + preferences</legend>
            <p className="small muted">{store.me.diet.allergies.length || store.me.diet.prefs.length ? 'Filled in from your profile. ' : ''}Check these for every dinner.</p>
            <div className="choices">
              {ALLERGENS.map((a) => {
                const on = diet.allergies.includes(a);
                return (
                  <label key={a} className={`choice choice-allergy ${on ? 'on' : ''}`}>
                    <input type="checkbox" checked={on} onChange={() => toggleA(a)} />
                    {on && <WarnIcon />}
                    <span>{allergyLabel(a)}</span>
                  </label>
                );
              })}
            </div>
            <div className="choices">
              {PREFS.map((p) => {
                const on = diet.prefs.includes(p);
                return (
                  <label key={p} className={`choice choice-pref ${on ? 'on' : ''}`}>
                    <input type="checkbox" checked={on} onChange={() => toggleP(p)} />
                    {on && <Icon name="check" size={16} />}
                    <span>{p}</span>
                  </label>
                );
              })}
            </div>
            {mainClash.map((c, i) => <Warning key={i} text={c.text.replace(/\. \w+ has/, '. You have')} />)}
            <label className="check">
              <input type="checkbox" checked={dietOk} onChange={(e) => setDietOk(e.target.checked)} />
              <span>I have checked these are right for this dinner.</span>
            </label>
            {tried && errors.diet && <p className="error" role="alert">Please confirm your allergies and preferences. It takes one tap.</p>}
          </fieldset>

          <fieldset className="fieldset">
            <legend>What you bring</legend>
            {d.bringMode === 'host' && <p>{hostFirst} has everything covered. Just bring yourself.</p>}
            {d.bringMode === 'byob' && (
              <div className="field">
                <label htmlFor="drink">What drink are you bringing? (optional)</label>
                <input id="drink" value={dish} onChange={(e) => setDish(e.target.value)} />
              </div>
            )}
            {bringsDish && (
              <>
                {d.bringMode === 'mystery' && <p className="small muted">Mystery potluck: other guests will only see "Mystery dish".</p>}
                <div className="field">
                  <label htmlFor="dish">What are you bringing? (optional)</label>
                  <input id="dish" value={dish} onChange={(e) => { setDish(e.target.value); setSafeOk(false); }} />
                </div>
                {dish.trim() && (
                  <>
                    <p className="small">My dish contains:</p>
                    <div className="choices">
                      {ALLERGENS.map((a) => {
                        const on = contains.includes(a);
                        return (
                          <label key={a} className={`choice choice-allergy ${on ? 'on' : ''}`}>
                            <input type="checkbox" checked={on} onChange={() => { setContains(on ? contains.filter((x) => x !== a) : [...contains, a]); setSafeOk(false); }} />
                            <span>{allergenName(a)}</span>
                          </label>
                        );
                      })}
                    </div>
                    {clash.map((a) => <Warning key={a} text={`Contains ${allergenName(a)}. At least one guest has a ${allergyLabel(a)}. Choose a different dish.`} />)}
                    {d.bringMode === 'mystery' && (
                      <>
                        <label className="check">
                          <input type="checkbox" checked={safeOk} disabled={clash.length > 0} onChange={(e) => setSafeOk(e.target.checked)} />
                          <span>My dish is safe for the group's allergies{groupA.length ? ` (${joinList(groupA.map(allergyLabel))})` : ''}.</span>
                        </label>
                        {tried && errors.safe && clash.length === 0 && <p className="error" role="alert">Confirm your dish is safe before locking it in.</p>}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </fieldset>
        </div>
      </Wizard>
    );
  }

  if (screen === 'bread') {
    return (
      <Wizard title="break bread to say yes" onBack={() => { setTaps(0); setScreen('respond'); }} footer={
        <button className="pill-black" onClick={finish}>accept</button>
      }>
        {preview}
        <div className="bread-stage">
          <button className="bread-btn" onClick={tap} disabled={taps >= 3} aria-label="Tap to break the bread. Three taps accepts the invite.">
            <Bread stage={taps} />
          </button>
          <p className="caps" role="status">{taps === 0 ? 'tap the bread' : taps < 3 ? `${taps} of 3, keep going` : 'broken. see you there.'}</p>
          <p className="small muted">Can't tap three times? The accept button does the same thing.</p>
        </div>
      </Wizard>
    );
  }

  return (
    <Wizard title={declined ? 'sent' : "you're in"} onBack={leave} footer={
      <button className="pill-black" onClick={leave}>{mode === 'link' ? 'done' : 'see the dinner'}</button>
    }>
      {preview}
      <div className="bread-stage">
        {!declined && <Bread stage={3} />}
        <p>{declined ? `${hostFirst} has been notified and can invite someone else. Thanks for letting them know.` : `${hostFirst} has your yes${confirmed ? '' : ' and your date votes'}. See you at ${d.name}.`}</p>
      </div>
    </Wizard>
  );
}

function NameField({ name, setName, error }: { name: string; setName: (s: string) => void; error: boolean }) {
  return (
    <div className="field">
      <label htmlFor="gn">Your name</label>
      <input id="gn" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={error} />
      {error && <p className="error" role="alert">Add your name so the host knows who replied.</p>}
    </div>
  );
}
