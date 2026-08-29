import api from './api';

export interface MonteCarloResult {
  id: string;
  backtest_id: string;
  simulation_count: number;
  median_return: number;
  p5_return: number;
  p25_return: number;
  p75_return: number;
  p95_return: number;
  probability_of_profit: number;
  results_json: {
    histogram: {
      rangeStart: number;
      rangeEnd: number;
      count: number;
    }[];
  };
  created_at: string;
}

export const simulationsService = {
  async runMonteCarlo(backtestId: string, simulations: number = 1000): Promise<MonteCarloResult> {
    const res = await api.post('/simulations/monte-carlo', { backtestId, simulations });
    return res.data;
  },

  async getMonteCarlo(backtestId: string): Promise<MonteCarloResult | null> {
    try {
      const res = await api.get(`/simulations/monte-carlo/${backtestId}`);
      return res.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  }
};
