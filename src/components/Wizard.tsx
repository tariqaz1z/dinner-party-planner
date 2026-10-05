import type { ReactNode } from 'react';
import { Icon } from './Icon';

interface Props {
  title: string;
  step?: number;
  of?: number;
  onBack: () => void;
  backLabel?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Full-screen frame used by the host flow and guest RSVP: back button, title, scrolling content, one sticky action. */
export function Wizard({ title, step, of, onBack, backLabel = 'Back', children, footer }: Props) {
  return (
    <div className="app wizard">
      <header className="wiz-head">
        <button className="round-btn" onClick={onBack} aria-label={backLabel}>
          <Icon name="back" size={22} />
        </button>
        {step !== undefined && of !== undefined && (
          <p className="caps" aria-label={`Step ${step} of ${of}`}>step {step} of {of}</p>
        )}
      </header>
      <h1 className="wiz-title" tabIndex={-1} id="wiz-title">{title}</h1>
      <main className="wiz-body">{children}</main>
      {footer && <footer className="wiz-foot">{footer}</footer>}
    </div>
  );
}
