import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { StrategiesPage } from './pages/StrategiesPage';
import { StrategyDetailPage } from './pages/StrategyDetailPage';
import { StrategyBuilderPage } from './pages/StrategyBuilderPage';
import { ComparePage } from './pages/ComparePage';
import { MonteCarloPage } from './pages/MonteCarloPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { PaperTradingPage } from './pages/PaperTradingPage';
import { ProfilePage } from './pages/ProfilePage';
import { MarketDataPage } from './pages/MarketDataPage';
import { BacktestListPage } from './pages/BacktestListPage';
import { BacktestSetupPage } from './pages/BacktestSetupPage';
import { BacktestDetailPage } from './pages/BacktestDetailPage';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
    },
  },
});

// Placeholder pages for future phases
function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{description}</p>
      </div>
      <div className="empty-state">
        <div className="empty-state-icon">🚧</div>
        <h3 className="empty-state-title">Coming Soon</h3>
        <p className="empty-state-description">This feature is part of an upcoming phase.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes (with sidebar layout) */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/strategies" element={<StrategiesPage />} />
            <Route path="/strategies/new" element={<StrategyBuilderPage />} />
            <Route path="/strategies/:id" element={<StrategyDetailPage />} />
            <Route path="/strategies/:id/edit" element={<StrategyBuilderPage />} />
            <Route path="/market-data" element={<MarketDataPage />} />
            <Route path="/backtests" element={<BacktestListPage />} />
            <Route path="/backtests/new" element={<BacktestSetupPage />} />
            <Route path="/backtests/:id" element={<BacktestDetailPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/monte-carlo" element={<MonteCarloPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/paper-trading" element={<PaperTradingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
