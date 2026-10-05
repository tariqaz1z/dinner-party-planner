import type { Category, Person } from '../types';
import { Avatar } from './Avatar';
import { BreadIcon } from './Bread';
import { shortDate } from '../lib/dates';

interface Props {
  name: string;
  host: Person;
  dish: string;
  category: Category;
  time: string;
  dates: string[];
  note: string;
  location?: string;
  confirmedDate?: string;
}

/** The invite, exactly as guests see it: a tilted zine card with a bread sticker. */
export function Ticket({ name, host, dish, category, time, dates, note, location, confirmedDate }: Props) {
  return (
    <article className="ticket" aria-label={`Invitation: ${name}`}>
      <div className="ticket-sticker"><BreadIcon size={60} /></div>
      <p className="scrawl" aria-hidden="true">come hungry ✦</p>
      <p className="caps">you're invited to</p>
      <h2 className="ticket-title">{name || 'your dinner'}</h2>
      <p className="ticket-host">
        <Avatar person={host} size={36} />
        <span>hosted by <strong>{host.id === 'me' ? 'you' : host.name}</strong></span>
      </p>
      <dl className="ticket-facts">
        <div><dt>on the menu</dt><dd>{dish || 'still deciding'}</dd></div>
        <div><dt>{category}</dt><dd>{time}</dd></div>
        <div>
          <dt>{confirmedDate ? 'date' : 'dates to vote on'}</dt>
          <dd>{confirmedDate ? shortDate(confirmedDate) : dates.length ? dates.map(shortDate).join(' · ') : 'to be picked'}</dd>
        </div>
        {location && <div><dt>where</dt><dd>{location}</dd></div>}
      </dl>
      {note && <blockquote className="ticket-note">{note}</blockquote>}
    </article>
  );
}
