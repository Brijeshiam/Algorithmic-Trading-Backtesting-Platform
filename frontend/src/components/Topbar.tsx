import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/strategies': 'Strategies',
  '/strategies/new': 'New Strategy',
  '/backtests': 'Backtests',
  '/market': 'Market Data',
  '/compare': 'Compare Strategies',
  '/monte-carlo': 'Monte Carlo',
  '/paper-trading': 'Paper Trading',
  '/profile': 'Profile',
};

export function Topbar() {
  const location = useLocation();
  const { user } = useAuthStore();

  const title = pageTitles[location.pathname] || 'AlgoLab';
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-actions">
        <div className="topbar-avatar" title={user?.name || 'User'}>
          {initials}
        </div>
      </div>
    </header>
  );
}
