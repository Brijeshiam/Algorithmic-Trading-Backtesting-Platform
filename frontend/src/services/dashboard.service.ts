import api from './api';

export interface DashboardSummary {
  totalStrategies: number;
  totalBacktests: number;
  bestSharpe: { value: number; strategyName: string } | null;
  worstDrawdown: { value: number; strategyName: string } | null;
  avgReturn: number | null;
  recentBacktests: Array<{
    id: string;
    strategyName: string;
    symbol: string;
    status: string;
    initialCapital: number;
    totalReturn: number | null;
    sharpeRatio: number | null;
    createdAt: string;
  }>;
}

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const res = await api.get('/dashboard/summary');
    return res.data;
  },
};
