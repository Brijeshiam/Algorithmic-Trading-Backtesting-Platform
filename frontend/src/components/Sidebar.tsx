import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/auth.service';

const navSections = [
  {
    title: 'Overview',
    links: [
      { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    ],
  },
  {
    title: 'Trading',
    links: [
      { to: '/strategies', icon: '🧩', label: 'Strategies' },
      { to: '/backtests', icon: '⚡', label: 'Backtests' },
      { to: '/market-data', icon: '📈', label: 'Market Data' },
      { to: '/compare', icon: '⚖️', label: 'Compare' },
    ],
  },
  {
    title: 'Analysis',
    links: [
      { to: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
      { to: '/monte-carlo', icon: '🎲', label: 'Monte Carlo' },
      { to: '/paper-trading', icon: '📝', label: 'Paper Trading' },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Logout even if API call fails
    }
    logout();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-logo">A</div>
        <div className="sidebar-brand-text">AlgoLab</div>
      </div>

      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div key={section.title} className="sidebar-section">
            <div className="sidebar-section-title">{section.title}</div>
            {section.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <span className="sidebar-link-icon">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/profile" className="sidebar-link">
          <span className="sidebar-link-icon">👤</span>
          <span>{user?.name || 'Profile'}</span>
        </NavLink>
        <button
          className="sidebar-link"
          onClick={handleLogout}
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
        >
          <span className="sidebar-link-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
