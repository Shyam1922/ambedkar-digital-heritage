import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, LogIn, Lock, User } from 'lucide-react';
import { adminLogin } from '../api/admin';
import { getAuthToken, setAuthToken } from '../api/auth';

export function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getAuthToken()) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await adminLogin(username.trim(), password);
      setAuthToken(res.access_token);
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Login failed. Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-head">
          <div className="admin-brand-icon large">
            <Landmark size={26} />
          </div>
          <h1>Archive Administration</h1>
          <p>Sign in to manage archival documents, metadata and ingestion.</p>
        </div>

        <form className="admin-login-form" onSubmit={submit}>
          <label className="field">
            <span className="field-label">Username</span>
            <div className="field-input-wrap">
              <User size={16} className="field-icon" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                required
                autoFocus
              />
            </div>
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <div className="field-input-wrap">
              <Lock size={16} className="field-icon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
          </label>

          {error && <div className="notice error compact">{error}</div>}

          <button type="submit" className="button primary full" disabled={loading}>
            <LogIn size={16} /> {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="admin-login-foot">
          Protected area. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
