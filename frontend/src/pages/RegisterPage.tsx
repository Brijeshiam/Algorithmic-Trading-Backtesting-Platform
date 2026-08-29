import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/auth.service';

export function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Array<{ field: string; message: string }>>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors([]);
    setLoading(true);

    try {
      const data = await authService.register({ name, email, password });
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response?.data?.details) {
        setFieldErrors(err.response.data.details);
      } else {
        const msg = err.response?.data?.error || 'Registration failed. Please try again.';
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (field: string) => {
    return fieldErrors.find((e) => e.field === field)?.message;
  };

  return (
    <div className="auth-layout">
      <div className="auth-card animate-fadeIn">
        <div className="auth-brand">
          <div className="auth-brand-logo">A</div>
          <div className="auth-brand-name">AlgoLab</div>
        </div>

        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Start building and testing trading strategies</p>

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
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              className={`form-input ${getFieldError('name') ? 'error' : ''}`}
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
            {getFieldError('name') && <span className="form-error">{getFieldError('name')}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              className={`form-input ${getFieldError('email') ? 'error' : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {getFieldError('email') && <span className="form-error">{getFieldError('email')}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              className={`form-input ${getFieldError('password') ? 'error' : ''}`}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {getFieldError('password') && <span className="form-error">{getFieldError('password')}</span>}
            <span className="form-hint">At least 8 characters, one uppercase letter, one number</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="spinner spinner-sm" /> Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
