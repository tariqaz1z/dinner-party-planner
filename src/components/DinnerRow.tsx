import { Link } from 'react-router-dom';
import type { Dinner } from '../types';
import { ME } from '../types';
import { dinnerStatus } from '../store';
import { isPast, shortDate } from '../lib/dates';

export function DinnerRow({ dinner }: { dinner: Dinner }) {
  const hosting = dinner.hostId === ME;
  const status = dinnerStatus(dinner, isPast);
  const when = dinner.confirmedDate
    ? `${shortDate(dinner.confirmedDate)} · ${dinner.time}`
    : `${dinner.shortlist.length} dates up for a vote`;
  return (
    <Link to={`/dinner/${dinner.id}`} className="dinner-row">
      <span className="dinner-info">
        <strong className="dinner-name">{dinner.name}</strong>
        <span className="small muted">{when}</span>
      </span>
      <span className="row gap-s">
        <span className={`chip-static ${hosting ? 'chip-ink' : 'chip-butter'}`}>{hosting ? 'Hosting' : 'Attending'}</span>
        <span className={`status status-${status}`}>{status === 'confirmed' ? 'Confirmed' : status === 'voting' ? 'Voting' : 'Past'}</span>
      </span>
    </Link>
  );
}
