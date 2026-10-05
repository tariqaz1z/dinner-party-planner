import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { dinnerStatus, useStore } from '../store';
import { ME, type Dinner, type GuestEntry } from '../types';
import { Avatar } from '../components/Avatar';
import { DietTags, AllergyTag, Notice, Warning } from '../components/DietTags';
import { Icon } from '../components/Icon';
import { allergyLabel, dishConflicts, groupSummary, groupAllergens } from '../lib/diet';
import { isPast, longDate, shortDate, timeAgo } from '../lib/dates';
import { prepText } from './Host';

const RSVP_LABEL = { accepted: 'Accepted', declined: "Can't make it", pending: 'No reply yet' } as const;
const BRING_LABEL = {
  host: 'Host covers everything',
  byob: 'Bring your own drinks',
  potluck: 'Potluck',
  mystery: 'Mystery potluck: the host dish is visible, everything else is a surprise',
  choose: 'Guests choose what to bring',
} as const;

export function DinnerPage() {
  const { id } = useParams();
  const loc = useLocation();
  const sent = (loc.state as { sent?: boolean; copied?: boolean } | null) ?? null;
  const store = useStore();
  const d = store.dinners.find((x) => x.id === id);
  const [panel, setPanel] = useState<'' | 'invite' | 'edit'>('');
  if (!d) return <p>That dinner could not be found. <Link to="/calendar">Back to calendar</Link></p>;

  const isHost = d.hostId === ME;
  const host = store.person(d.hostId);
  const status = dinnerStatus(d, isPast);
  const mine = d.guests.find((g) => g.personId === ME);
  const active = d.guests.filter((g) => g.rsvp !== 'declined');
  const diets = [host.diet, ...active.map((g) => g.diet)];
  const conflicts = dishConflicts(d.dish, active.map((g) => store.person(g.personId)), Object.fromEntries(active.map((g) => [g.personId, g.diet])));
  const responded = d.guests.filter((g) => g.rsvp !== 'pending').length;

  return (
    <>
      {sent && (
        <div className="notice" role="status">
          <strong>Invites sent.</strong> {sent.copied === true && 'Share link copied. '}
          {sent.copied === false && 'Could not copy the link automatically. '}
          {sent.copied !== undefined && (
            <>
              <label className="small block" htmlFor="sharelink">Share link</label>
              <input id="sharelink" readOnly value={`${window.location.origin}${window.location.pathname}#/rsvp/${d.id}`} onFocus={(e) => e.currentTarget.select()} />
            </>
          )}
        </div>
      )}

      <header className="dinner-head">
        <div className="row gap-s wrap">
          <span className={`chip-static ${isHost ? 'chip-ink' : 'chip-butter'}`}>{isHost ? 'Hosting' : 'Attending'}</span>
          <span className={`status status-${status}`}>{status === 'confirmed' ? 'Confirmed' : status === 'voting' ? 'Voting' : 'Past'}</span>
        </div>
        <h1 className="h-display">{d.name}</h1>
        <p className="muted row gap-s"><Avatar person={host} size={28} /> hosted by {isHost ? 'you' : host.name}</p>
      </header>

      {!isHost && (!mine || mine.rsvp === 'pending') && (
        <section className="stack-card butter" aria-labelledby="inv">
          <h2 id="inv" className="h-sub">you're invited</h2>
          <p>{host.name.split(' ')[0]} is waiting on your reply.</p>
          <Link className="pill-black" to={`/rsvp/${d.id}`}>respond</Link>
        </section>
      )}
      {!isHost && mine && mine.rsvp !== 'pending' && status !== 'past' && (
        <p className="small">Your reply: <strong>{RSVP_LABEL[mine.rsvp]}</strong>. <Link to={`/rsvp/${d.id}`}>Change my response</Link></p>
      )}

      <section className="card" aria-labelledby="when">
        <h2 id="when" className="caps">date, time + place</h2>
        {d.confirmedDate ? (
          <p className="big-date">{longDate(d.confirmedDate)}</p>
        ) : (
          <p className="muted">Date not confirmed yet. {d.shortlist.length} dates are up for a vote.</p>
        )}
        <p className="row gap-s"><Icon name="clock" size={18} /> {d.category} · {d.time}</p>
        <p className="row gap-s"><Icon name="pin" size={18} /> {d.location || 'Location to be shared'}</p>
        {d.note && <blockquote className="ticket-note">{d.note}</blockquote>}
      </section>

      {!d.confirmedDate && (
        <section className="card" aria-labelledby="votes">
          <h2 id="votes" className="caps">date votes</h2>
          <p className="small muted">{responded} of {d.guests.length} have replied.</p>
          <ul className="stack-list">
            {d.shortlist.map((date) => {
              const n = d.guests.filter((g) => g.votes.includes(date)).length;
              return (
                <li key={date} className="vote-row">
                  <span><strong>{shortDate(date)}</strong><span className="small muted block">{n} {n === 1 ? 'vote' : 'votes'}</span></span>
                  {isHost && (
                    <button className="pill-black slim" onClick={() => store.confirmDate(d.id, date)} aria-label={`Confirm ${longDate(date)}`}>confirm this date</button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="card" aria-labelledby="guests">
        <h2 id="guests" className="caps">guest list ({d.guests.length})</h2>
        <ul className="stack-list">
          {d.guests.map((g) => (
            <GuestRow key={g.personId} g={g} d={d} isHost={isHost} onReplace={() => setPanel('invite')} />
          ))}
        </ul>
        {isHost && status !== 'past' && (
          <div className="row gap-s wrap">
            <button className="pill-outline slim" onClick={() => setPanel(panel === 'invite' ? '' : 'invite')} aria-expanded={panel === 'invite'}><Icon name="plus" size={18} /> invite more people</button>
            <button className="pill-outline slim" onClick={() => setPanel(panel === 'edit' ? '' : 'edit')} aria-expanded={panel === 'edit'}>edit details</button>
          </div>
        )}
        {panel === 'invite' && isHost && <InvitePanel d={d} />}
        {panel === 'edit' && isHost && <EditPanel d={d} onDone={() => setPanel('')} />}
      </section>

      <section className="card" aria-labelledby="diet">
        <h2 id="diet" className="caps">dietary summary</h2>
        {isHost ? (
          <>
            {conflicts.filter((c) => c.kind === 'allergy').map((c, i) => <Warning key={i} text={c.text} />)}
            {conflicts.filter((c) => c.kind === 'pref').map((c, i) => <Notice key={i} text={c.text} />)}
            {conflicts.length === 0 && <p>No conflicts with {d.dish.name}.</p>}
            <p className="small muted">You can see each person's details in the guest list. Guests only see a group summary.</p>
          </>
        ) : (
          <>
            <p>{groupSummary(diets)}</p>
            <p className="tags">
              {groupAllergens(diets).map((a) => <AllergyTag key={a} label={allergyLabel(a)} />)}
            </p>
            <p className="small muted">Shown as a group summary to protect privacy.</p>
          </>
        )}
      </section>

      <section className="card" aria-labelledby="menu">
        <h2 id="menu" className="caps">menu + who brings what</h2>
        <p><strong>{d.dish.name}</strong> <span className="muted">by {isHost ? 'you' : host.name.split(' ')[0]}</span></p>
        {d.dish.contains.length > 0 && <p className="tags">{d.dish.contains.map((a) => <AllergyTag key={a} label={`contains ${a}`} />)}</p>}
        <p className="small muted">about {prepText(d.prepMinutes)} prep · {BRING_LABEL[d.bringMode]}</p>
        {d.bringMode !== 'host' && (
          <ul className="plain-list">
            {d.guests.filter((g) => g.bring?.dish).map((g) => (
              <li key={g.personId}>
                <strong>{g.personId === ME ? 'You' : store.person(g.personId).name.split(' ')[0]}:</strong>{' '}
                {d.bringMode === 'mystery' ? (g.personId === ME ? `Mystery dish (yours: ${g.bring?.dish})` : 'Mystery dish') : g.bring?.dish}
              </li>
            ))}
            {d.guests.every((g) => !g.bring?.dish) && <li className="muted">Nobody has picked yet.</li>}
          </ul>
        )}
      </section>

      <section className="card" aria-labelledby="comments">
        <h2 id="comments" className="caps">comments</h2>
        <Comments d={d} />
      </section>

      {status === 'past' && isHost && (
        <section className="stack-card butter" aria-labelledby="next">
          <h2 id="next" className="h-sub">plan the next one with this group?</h2>
          <p>The second dinner is easier than the first. Everyone from this one is already added.</p>
          <Link className="pill-black" to={`/host?from=${d.id}`}>plan the next one</Link>
        </section>
      )}
    </>
  );
}

function GuestRow({ g, d, isHost, onReplace }: { g: GuestEntry; d: Dinner; isHost: boolean; onReplace: () => void }) {
  const { person } = useStore();
  const p = person(g.personId);
  return (
    <li className="person-row">
      <Avatar person={p} size={44} />
      <span className="person-info">
        <strong>{g.personId === ME ? 'You' : p.name}</strong>
        <span className={`rsvp rsvp-${g.rsvp}`}>{RSVP_LABEL[g.rsvp]}</span>
        {isHost && <DietTags diet={g.diet} />}
        {isHost && g.declineNote && <span className="small muted">"{g.declineNote}"</span>}
        {isHost && g.rsvp !== 'accepted' && !isPast(d.confirmedDate ?? '9999-01-01') && (
          <button className="link-btn" onClick={onReplace}>{g.rsvp === 'declined' ? 'invite someone else' : 'no reply? invite someone else'}</button>
        )}
      </span>
    </li>
  );
}

function InvitePanel({ d }: { d: Dinner }) {
  const { people, addGuests } = useStore();
  const options = people.filter((p) => !p.link && !d.guests.some((g) => g.personId === p.id));
  return (
    <div className="panel">
      <h3 className="caps">invite someone</h3>
      {options.length === 0 ? <p className="muted">Everyone you know is already invited.</p> : (
        <ul className="stack-list">
          {options.map((p) => (
            <li key={p.id} className="person-row">
              <Avatar person={p} size={40} />
              <span className="person-info"><strong>{p.name}</strong><DietTags diet={p.diet} /></span>
              <button className="plus-btn" aria-label={`Invite ${p.name}`} onClick={() => addGuests(d.id, [p.id])}><Icon name="plus" size={22} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EditPanel({ d, onDone }: { d: Dinner; onDone: () => void }) {
  const { updateDinner } = useStore();
  const [name, setName] = useState(d.name);
  const [loc, setLoc] = useState(d.location);
  const [note, setNote] = useState(d.note);
  return (
    <form className="panel col" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { updateDinner(d.id, { name: name.trim(), location: loc.trim(), note: note.trim() }); onDone(); } }}>
      <div className="field"><label htmlFor="en">Dinner name</label><input id="en" value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="field"><label htmlFor="el">Location</label><input id="el" value={loc} onChange={(e) => setLoc(e.target.value)} /></div>
      <div className="field"><label htmlFor="eno">Note from the host</label><textarea id="eno" rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></div>
      <button className="pill-black slim" type="submit" disabled={!name.trim()}>save details</button>
    </form>
  );
}

function Comments({ d }: { d: Dinner }) {
  const { person, addComment } = useStore();
  const [text, setText] = useState('');
  return (
    <>
      {d.comments.length === 0 ? <p className="muted">No comments yet. Start the conversation.</p> : (
        <ul className="stack-list comments">
          {d.comments.map((c) => (
            <li key={c.id} className="comment">
              <Avatar person={person(c.personId)} size={32} />
              <span>
                <strong>{c.personId === ME ? 'You' : person(c.personId).name.split(' ')[0]}</strong> <span className="small muted">{timeAgo(c.at)}</span>
                <span className="block">{c.text}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <form className="col" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { addComment(d.id, text.trim()); setText(''); } }}>
        <div className="field"><label htmlFor="cm">Add a comment</label><textarea id="cm" rows={2} value={text} onChange={(e) => setText(e.target.value)} /></div>
        <button className="pill-black slim" type="submit" disabled={!text.trim()}>post</button>
      </form>
    </>
  );
}
