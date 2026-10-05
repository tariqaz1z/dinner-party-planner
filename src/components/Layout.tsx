import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { useStore } from '../store';
import { Intro } from './Intro';

const TABS = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/calendar', label: 'Calendar', icon: 'calendar' },
  { to: '/cookbook', label: 'Cookbook', icon: 'book' },
  { to: '/profile', label: 'Profile', icon: 'user' },
];

export function Layout() {
  const { notices, introSeen } = useStore();
  const unread = notices.filter((n) => !n.read).length;
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);

  // Move focus to the page content on navigation so keyboard and screen reader users start at the top.
  useEffect(() => {
    main.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app">
      <a className="skip" href="#main">Skip to content</a>
      <header className="topbar">
        <Link to="/search" className="search-pill">
          <Icon name="search" size={20} />
          <span>search recipes</span>
        </Link>
        <Link to="/notifications" className="round-btn bell" aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}>
          <Icon name="bell" size={22} />
          {unread > 0 && <span className="badge" aria-hidden="true">{unread}</span>}
        </Link>
      </header>
      <main id="main" ref={main} tabIndex={-1} className="page">
        <Outlet />
      </main>
      <nav className="navwrap" aria-label="Main">
        <div className="navpill">
          {TABS.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.end} className="navitem">
              <Icon name={t.icon} size={24} />
              <span>{t.label}</span>
            </NavLink>
          ))}
        </div>
        <Link to="/host" className="addbtn" aria-label="Add: plan a dinner">
          <Icon name="plus" size={30} />
        </Link>
      </nav>
      {!introSeen && <Intro />}
    </div>
  );
}
