import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/auth.service';

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login({ email, password });
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.details?.[0]?.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card animate-fadeIn">
        <div className="auth-brand">
          <div className="auth-brand-logo">A</div>
          <div className="auth-brand-name">AlgoLab</div>
        </div>

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {error && (
          <div style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--color-danger-50)',
            border: '1px solid var(--color-danger-100)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--color-danger-700)',
            fontSize: 'var(--font-size-sm)',
            marginBottom: 'var(--space-6)',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="spinner spinner-sm" /> Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
