import api from './api';

export interface RunBacktestDTO {
  strategyId: string;
  symbol: string;
  dateStart: string;
  dateEnd: string;
  initialCapital?: number;
  commissionRate?: number;
  slippageRate?: number;
}

export interface BacktestListItem {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  initial_capital: string;
  created_at: string;
  date_range_start: string;
  date_range_end: string;
  strategy_name: string;
  symbol: string;
  total_return: string | null;
  sharpe_ratio: string | null;
  max_drawdown: string | null;
  trade_count: number | null;
  final_equity: string | null;
}

export interface BacktestTrade {
  id: string;
  backtest_id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: string;
  entry_price: string;
  entry_time: string;
  exit_price: string | null;
  exit_time: string | null;
  gross_pnl: string | null;
  costs: string;
  net_pnl: string | null;
  status: 'OPEN' | 'CLOSED';
}

export interface EquitySnapshot {
  id: string;
  backtest_id: string;
  timestamp: string;
  equity: string;
  cash: string;
  positions_value: string;
}

export interface BacktestDetails extends BacktestListItem {
  strategy_id: string;
  strategy_version_id: string;
  asset_id: string;
  commission_rate: string;
  slippage_rate: string;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  cagr: string | null;
  volatility: string | null;
  sortino_ratio: string | null;
  win_rate: string | null;
  profit_factor: string | null;
  avg_win: string | null;
  avg_loss: string | null;
  largest_win: string | null;
  largest_loss: string | null;
  exposure: string | null;
  avg_holding_days: string | null;
  gross_profit: string | null;
  gross_loss: string | null;
  total_costs: string | null;
  
  trades: BacktestTrade[];
  equitySnapshots: EquitySnapshot[];
}

export const backtestsService = {
  listBacktests: async (): Promise<BacktestListItem[]> => {
    const { data } = await api.get('/backtests');
    return data;
  },

  getBacktest: async (id: string): Promise<BacktestDetails> => {
    const { data } = await api.get(`/backtests/${id}`);
    return data;
  },

  runBacktest: async (payload: RunBacktestDTO): Promise<{ id: string, message: string }> => {
    const { data } = await api.post('/backtests', payload);
    return data;
  },
};
