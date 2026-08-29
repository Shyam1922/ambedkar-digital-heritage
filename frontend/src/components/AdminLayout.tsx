import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Landmark, LogOut, LayoutDashboard, Upload, ExternalLink } from 'lucide-react';
import { getAdminMe } from '../api/admin';
import { getAuthToken, removeAuthToken } from '../api/auth';
import { LoadingState } from './UIState';

export function AdminLayout() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState('');

  useEffect(() => {
    let active = true;

    if (!getAuthToken()) {
      navigate('/admin/login', { replace: true });
      return;
    }

    getAdminMe()
      .then((me) => {
        if (!active) return;
        setUsername(me.username);
        setChecking(false);
      })
      .catch(() => {
        removeAuthToken();
        if (active) navigate('/admin/login', { replace: true });
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  const logout = () => {
    removeAuthToken();
    navigate('/admin/login', { replace: true });
  };

  if (checking) {
    return (
      <div className="admin-checking">
        <LoadingState message="Verifying admin session..." />
      </div>
    );
  }

  return (
    <div className="admin-wrapper">
      <header className="admin-header">
        <Link to="/admin" className="admin-brand">
          <div className="admin-brand-icon">
            <Landmark size={20} />
          </div>
          <div className="admin-brand-text">
            <span className="admin-brand-main">Archive Admin</span>
            <span className="admin-brand-sub">Ambedkar Digital Heritage</span>
          </div>
        </Link>

        <nav className="admin-nav">
          <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'active' : '')}>
            <LayoutDashboard size={16} /> Dashboard
          </NavLink>
          <NavLink to="/admin/upload" className={({ isActive }) => (isActive ? 'active' : '')}>
            <Upload size={16} /> Add Document
          </NavLink>
          <a href="/" className="admin-public-link" target="_blank" rel="noopener noreferrer">
            <ExternalLink size={14} /> Public site
          </a>
        </nav>

        <div className="admin-user">
          <span className="admin-username" title="Signed in">{username}</span>
          <button className="button outline small" onClick={logout}>
            <LogOut size={14} /> Log out
          </button>
        </div>
      </header>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
