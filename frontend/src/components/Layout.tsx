import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Landmark, Menu, X, BookOpen, Clock, Sparkles, Home as HomeIcon, Lock } from 'lucide-react';
import type { ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="site-wrapper">
      <header className="site-header">
        <Link className="brand" to="/" onClick={closeMenu}>
          <div className="brand-icon-wrapper">
            <Landmark size={22} />
          </div>
          <div className="brand-text">
            <span className="brand-main">Ambedkar</span>
            <span className="brand-sub">Digital Heritage Archive</span>
          </div>
        </Link>

        <nav className="desktop-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Home
          </NavLink>
          <NavLink to="/archive" className={({ isActive }) => (isActive ? 'active' : '')}>
            Explore Archive
          </NavLink>
          <NavLink to="/timeline" className={({ isActive }) => (isActive ? 'active' : '')}>
            Timeline
          </NavLink>
          <NavLink to="/research" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="sparkle-nav"><Sparkles size={14} /> Ask the Archive</span>
          </NavLink>
        </nav>

        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <NavLink to="/" end onClick={closeMenu} className={location.pathname === '/' ? 'active' : ''}>
              <HomeIcon size={18} /> Home
            </NavLink>
            <NavLink to="/archive" onClick={closeMenu} className={location.pathname.startsWith('/archive') ? 'active' : ''}>
              <BookOpen size={18} /> Explore Archive
            </NavLink>
            <NavLink to="/timeline" onClick={closeMenu} className={location.pathname.startsWith('/timeline') ? 'active' : ''}>
              <Clock size={18} /> Historical Timeline
            </NavLink>
            <NavLink to="/research" onClick={closeMenu} className={location.pathname.startsWith('/research') ? 'active' : ''}>
              <Sparkles size={18} /> Ask the Archive (AI)
            </NavLink>
          </div>
        )}
      </header>

      <main className="site-main">{children}</main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="brand">
              <Landmark size={20} />
              <span>Ambedkar Digital Heritage Archive</span>
            </div>
            <p className="footer-tagline">
              A curated preservation platform dedicated to the writings, speeches, and constitutional legacy of Dr. B. R. Ambedkar.
            </p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Navigation</h4>
              <Link to="/">Home</Link>
              <Link to="/archive">Archive Explorer</Link>
              <Link to="/timeline">Chronology</Link>
              <Link to="/research">AI Research Assistant</Link>
            </div>
            <div className="footer-col">
              <h4>Principles</h4>
              <span>100% Grounded Sources</span>
              <span>Direct Page Citation</span>
              <span>Open Heritage Preservation</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Ambedkar Digital Heritage Archive · Public Access Edition</p>
          <Link to="/admin/login" className="footer-admin-link">
            <Lock size={11} /> Admin Portal
          </Link>
        </div>
      </footer>
    </div>
  );
}
