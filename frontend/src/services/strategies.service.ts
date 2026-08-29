import api from './api';

export interface IndicatorRef {
  indicator: 'SMA' | 'EMA' | 'RSI' | 'MACD' | 'BOLLINGER' | 'VOLUME' | 'PRICE';
  period?: number;
  type: 'indicator_ref';
}

export interface Condition {
  indicator: 'SMA' | 'EMA' | 'RSI' | 'MACD' | 'BOLLINGER' | 'VOLUME' | 'PRICE';
  period?: number;
  comparison: '>' | '<' | '>=' | '<=' | '==' | 'CROSSES_ABOVE' | 'CROSSES_BELOW';
  value: number | IndicatorRef;
}

export interface ConditionGroup {
  operator: 'AND' | 'OR';
  conditions: (Condition | ConditionGroup)[];
}

export interface StrategyDefinition {
  entryConditions?: ConditionGroup;
  exitConditions?: ConditionGroup;
  positionSizing?: {
    type: 'PERCENTAGE' | 'FIXED_AMOUNT';
    value: number;
  };
  stopLoss?: { percentage: number };
  takeProfit?: { percentage: number };
}

export interface Strategy {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
  version_count?: number;
  latest_version?: StrategyVersion;
}

export interface StrategyVersion {
  version_id: string;
  version: number;
  definition_json: StrategyDefinition;
  notes?: string;
  created_at: string;
}

export interface LeaderboardEntry {
  strategyId: string;
  strategyName: string;
  status: string;
  symbol: string;
  backtestId: string;
  sharpeRatio: number;
  maxDrawdown: number;
  totalReturn: number;
  winRate: number;
}

export const strategiesService = {
  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const res = await api.get('/strategies/leaderboard');
    return res.data;
  },

  getStrategies: async (limit = 50, offset = 0) => {
    const res = await api.get<Strategy[]>('/strategies', { params: { limit, offset } });
    return res.data;
  },

  getStrategy: async (id: string) => {
    const res = await api.get<Strategy>(`/strategies/${id}`);
    return res.data;
  },

  createStrategy: async (data: { name: string; description?: string; definition_json: StrategyDefinition }) => {
    const res = await api.post<Strategy>('/strategies', data);
    return res.data;
  },

  updateStrategy: async (id: string, data: Partial<{ name: string; description: string; status: string; definition_json: StrategyDefinition }>) => {
    const res = await api.put<Strategy>(`/strategies/${id}`, data);
    return res.data;
  },

  deleteStrategy: async (id: string) => {
    await api.delete(`/strategies/${id}`);
  },

  getStrategyVersions: async (id: string) => {
    const res = await api.get<StrategyVersion[]>(`/strategies/${id}/versions`);
    return res.data;
  }
};
