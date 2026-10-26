import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Archive, Clock3, Globe2, Home, Images, Languages, MessageCircleQuestion, Timer } from 'lucide-react';

const navigation = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/timeline', label: 'Life Journey', icon: Clock3 },
  { to: '/archive', label: 'Archive', icon: Archive },
  { to: '/media', label: 'Media', icon: Images },
  { to: '/research', label: 'Ask', icon: MessageCircleQuestion },
];

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className={`kiosk-shell ${isHome ? 'kiosk-home-shell' : ''}`}>
      <header className="kiosk-header">
        <NavLink to="/" className="kiosk-wordmark" aria-label="Ambedkar Digital Heritage home">
          <Globe2 aria-hidden="true" />
          <span>{isHome ? 'Digital Heritage Archive' : 'Ambedkar Digital Heritage'}</span>
        </NavLink>
        <div className="kiosk-header-tools">
          {!isHome && <span className="session-timer"><strong>90s</strong><Timer aria-hidden="true" /></span>}
          <button className="language-button" type="button" aria-label="Change language">
            <Languages aria-hidden="true" /> ENG / मराठी
          </button>
        </div>
      </header>

      <div className="kiosk-frame">
        {!isHome && (
          <nav className="heritage-rail" aria-label="Museum navigation">
            {navigation.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? 'active' : ''}>
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        )}
        <main className="kiosk-main">{children}</main>
      </div>

      {isHome && (
        <nav className="home-dock" aria-label="Museum navigation">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}>
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
