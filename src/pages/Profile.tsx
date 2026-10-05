import { Link } from 'react-router-dom';
import { useStore, dinnerStatus } from '../store';
import { ME, type Allergen, type Pref } from '../types';
import { ALLERGENS, PREFS, allergyLabel } from '../lib/diet';
import { Avatar } from '../components/Avatar';
import { DinnerRow } from '../components/DinnerRow';
import { Icon, WarnIcon } from '../components/Icon';
import { isPast } from '../lib/dates';

export function Profile() {
  const { me, dinners, setMyDiet, setCalendar, reset } = useStore();
  const hosting = dinners.filter((d) => d.hostId === ME && dinnerStatus(d, isPast) !== 'past');
  const past = dinners.filter((d) => dinnerStatus(d, isPast) === 'past');
  const hosted = dinners.filter((d) => d.hostId === ME).length;
  const attended = dinners.filter((d) => d.hostId !== ME && d.guests.some((g) => g.personId === ME && g.rsvp === 'accepted')).length;

  const toggleA = (a: Allergen) =>
    setMyDiet({ ...me.diet, allergies: me.diet.allergies.includes(a) ? me.diet.allergies.filter((x) => x !== a) : [...me.diet.allergies, a] });
  const toggleP = (p: Pref) =>
    setMyDiet({ ...me.diet, prefs: me.diet.prefs.includes(p) ? me.diet.prefs.filter((x) => x !== p) : [...me.diet.prefs, p] });

  return (
    <>
      <header className="profile-head">
        <Avatar person={me} size={84} />
        <div>
          <h1 className="h-display">{me.name.toLowerCase()}</h1>
          <p className="muted">host of {hosted} {hosted === 1 ? 'dinner' : 'dinners'}</p>
        </div>
      </header>
      <ul className="stat-tiles three">
        <li className="stat-tile"><Icon name="calendar" size={22} /><strong>{hosted}</strong><span className="small muted">hosted</span></li>
        <li className="stat-tile"><Icon name="check" size={22} /><strong>{attended}</strong><span className="small muted">attended</span></li>
        <li className="stat-tile"><Icon name="user" size={22} /><strong>{new Set(dinners.flatMap((d) => d.guests.map((g) => g.personId))).size - 1}</strong><span className="small muted">friends</span></li>
      </ul>

      <section aria-labelledby="diet" className="card">
        <h2 id="diet" className="caps">my allergies + preferences</h2>
        <p className="small muted">These pre-fill your RSVPs. You will still check them every time.</p>
        <fieldset className="fieldset">
          <legend>Allergies</legend>
          <div className="choices">
            {ALLERGENS.map((a) => {
              const on = me.diet.allergies.includes(a);
              return (
                <label key={a} className={`choice choice-allergy ${on ? 'on' : ''}`}>
                  <input type="checkbox" checked={on} onChange={() => toggleA(a)} />
                  {on ? <WarnIcon /> : null}
                  <span>{allergyLabel(a)}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <fieldset className="fieldset">
          <legend>Preferences</legend>
          <div className="choices">
            {PREFS.map((p) => {
              const on = me.diet.prefs.includes(p);
              return (
                <label key={p} className={`choice choice-pref ${on ? 'on' : ''}`}>
                  <input type="checkbox" checked={on} onChange={() => toggleP(p)} />
                  {on ? <Icon name="check" size={16} /> : null}
                  <span>{p}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      <section aria-labelledby="cal" className="card">
        <h2 id="cal" className="caps">calendar connection</h2>
        <div className="row between">
          <div>
            <p id="cal-desc"><strong>{me.calendar ? 'Calendar connected' : 'Calendar not connected'}</strong></p>
            <p className="small muted">{me.calendar ? 'Your free and busy times show on the heatmap. Event details are never shared.' : 'You will show as unknown on the heatmap, not busy.'}</p>
          </div>
          <button role="switch" aria-checked={me.calendar} aria-labelledby="cal cal-desc" className={`switch ${me.calendar ? 'on' : ''}`} onClick={() => setCalendar(!me.calendar)}>
            <span className="knob" />
          </button>
        </div>
      </section>

      <section aria-labelledby="hosting">
        <h2 id="hosting" className="caps">hosting</h2>
        {hosting.length ? <ul className="stack-list">{hosting.map((d) => <li key={d.id}><DinnerRow dinner={d} /></li>)}</ul> : <p className="muted">You are not hosting anything right now. <Link to="/host">Plan a dinner</Link></p>}
      </section>

      <section aria-labelledby="past">
        <h2 id="past" className="caps">past dinners</h2>
        {past.length ? <ul className="stack-list">{past.map((d) => <li key={d.id}><DinnerRow dinner={d} /></li>)}</ul> : <p className="muted">Past dinners will show up here.</p>}
      </section>

      <button className="pill-outline slim" onClick={() => { if (confirm('Reset all demo data back to the starting state?')) reset(); }}>reset demo data</button>
    </>
  );
}
