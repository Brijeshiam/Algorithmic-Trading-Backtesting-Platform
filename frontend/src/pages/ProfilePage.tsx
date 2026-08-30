import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { usersService } from '../services/users.service';
import { dashboardService } from '../services/dashboard.service';
import { useAuthStore } from '../store/auth.store';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function ProfilePage() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const data = await usersService.getProfile();
      setFormData({ name: data.name, email: data.email });
      return data;
    },
  });

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard_summary'],
    queryFn: dashboardService.getSummary,
  });

  const updateMutation = useMutation({
    mutationFn: usersService.updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['profile'], updatedUser);
      updateUser({ name: updatedUser.name, email: updatedUser.email });
      setIsEditing(false);
      setSuccessMsg('Your profile has been updated successfully.');
      setErrorMsg('');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || 'Failed to update profile. Please try again.');
      setSuccessMsg('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isProfileLoading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg" />
        <span>Loading profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h3 className="empty-state-title">Failed to load profile</h3>
        <p className="empty-state-description">Please try refreshing the page.</p>
      </div>
    );
  }

  const initials = profile.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const stats = [
    {
      label: 'Strategies',
      value: dashboard?.totalStrategies ?? 0,
      icon: '🧩',
      color: '#2563eb',
      bg: '#eff6ff',
      link: '/strategies',
    },
    {
      label: 'Backtests',
      value: dashboard?.totalBacktests ?? 0,
      icon: '⚡',
      color: '#059669',
      bg: '#ecfdf5',
      link: '/backtests',
    },
    {
      label: 'Best Sharpe',
      value: dashboard?.bestSharpe ? dashboard.bestSharpe.value.toFixed(2) : '—',
      icon: '📈',
      color: '#d97706',
      bg: '#fffbeb',
      link: '/leaderboard',
    },
    {
      label: 'Avg Return',
      value: dashboard?.avgReturn != null
        ? `${(dashboard.avgReturn * 100).toFixed(1)}%`
        : '—',
      icon: '💹',
      color: '#7c3aed',
      bg: '#f5f3ff',
      link: '/compare',
    },
  ];

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Account Profile</h1>
          <p className="page-subtitle">Manage your account information and review your trading activity.</p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          background: 'var(--color-success-50)',
          color: 'var(--color-success-700)',
          border: '1px solid var(--color-success-100)',
          borderLeft: '4px solid var(--color-success-500)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-6)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-medium)',
        }}>
          <span style={{ fontSize: '1.1rem' }}>✅</span> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          background: 'var(--color-danger-50)',
          color: 'var(--color-danger-700)',
          border: '1px solid var(--color-danger-100)',
          borderLeft: '4px solid var(--color-danger-500)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-6)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-medium)',
        }}>
          <span style={{ fontSize: '1.1rem' }}>❌</span> {errorMsg}
        </div>
      )}

      {/* Hero Card — Avatar Banner */}
      <div className="card" style={{
        marginBottom: 'var(--space-6)',
        overflow: 'hidden',
        padding: 0,
      }}>
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 60%, #1e40af 100%)',
          height: '100px',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)',
          }} />
        </div>

        {/* Profile row */}
        <div style={{
          padding: 'var(--space-6)',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 'var(--space-5)',
          flexWrap: 'wrap',
          marginTop: '-52px',
        }}>
          {/* Avatar */}
          <div style={{
            width: '88px',
            height: '88px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'var(--font-weight-extrabold)',
            color: '#fff',
            border: '4px solid var(--color-white)',
            boxShadow: 'var(--shadow-lg)',
            flexShrink: 0,
          }}>
            {initials}
          </div>

          {/* Name / email / role row */}
          <div style={{ paddingBottom: 'var(--space-1)', flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <h2 style={{
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-gray-900)',
                margin: 0,
              }}>
                {profile.name}
              </h2>
              <span className="badge badge-neutral"
                style={{
                  background: profile.role === 'ADMIN' ? '#fef3c7' : 'var(--color-primary-50)',
                  color: profile.role === 'ADMIN' ? '#92400e' : 'var(--color-primary-700)',
                  border: `1px solid ${profile.role === 'ADMIN' ? '#fde68a' : 'var(--color-primary-200)'}`,
                  fontWeight: 'var(--font-weight-semibold)',
                }}
              >
                {profile.role === 'ADMIN' ? '👑 Admin' : '👤 Member'}
              </span>
            </div>
            <p style={{
              color: 'var(--color-gray-500)',
              fontSize: 'var(--font-size-sm)',
              marginTop: 'var(--space-1)',
            }}>
              {profile.email}
            </p>
          </div>

          {/* Metadata */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-6)',
            paddingBottom: 'var(--space-1)',
            flexShrink: 0,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-1)' }}>Joined</div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-gray-700)' }}>
                {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-1)' }}>Last Updated</div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-gray-700)' }}>
                {new Date(profile.updatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main two-column body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Left: Account Details */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <div className="card-header" style={{ marginBottom: 'var(--space-5)' }}>
            <h3 className="card-title">Account Details</h3>
            {!isEditing && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { setIsEditing(true); setErrorMsg(''); }}
              >
                ✏️ Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  type="text"
                  required
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)', paddingTop: 'var(--space-2)' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateMutation.isPending}
                  style={{ flex: 1 }}
                >
                  {updateMutation.isPending ? (
                    <>
                      <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                      Saving...
                    </>
                  ) : '✅ Save Changes'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => { setIsEditing(false); setErrorMsg(''); setFormData({ name: profile.name, email: profile.email }); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              {[
                { label: 'Full Name', value: profile.name, icon: '👤' },
                { label: 'Email Address', value: profile.email, icon: '📧' },
                { label: 'Account Role', value: profile.role, icon: '🔑' },
                { label: 'Member Since', value: new Date(profile.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }), icon: '📅' },
              ].map((field) => (
                <div key={field.label} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-4)',
                  background: 'var(--color-gray-50)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-gray-100)',
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    background: 'var(--color-white)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    boxShadow: 'var(--shadow-xs)',
                    flexShrink: 0,
                  }}>
                    {field.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                      {field.label}
                    </div>
                    <div style={{
                      fontSize: 'var(--font-size-base)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-gray-800)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {field.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Platform Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <div className="card-header" style={{ marginBottom: 'var(--space-5)' }}>
              <h3 className="card-title">Platform Activity</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              {stats.map((stat) => (
                <Link
                  key={stat.label}
                  to={stat.link}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    background: stat.bg,
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-5)',
                    border: `1px solid ${stat.color}20`,
                    transition: 'all var(--transition-base)',
                    cursor: 'pointer',
                  }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>{stat.icon}</div>
                    <div style={{
                      fontSize: 'var(--font-size-2xl)',
                      fontWeight: 'var(--font-weight-extrabold)',
                      color: stat.color,
                      lineHeight: 1,
                      marginBottom: 'var(--space-2)',
                    }}>
                      {stat.value}
                    </div>
                    <div style={{
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: stat.color,
                      opacity: 0.75,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {stat.label}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
