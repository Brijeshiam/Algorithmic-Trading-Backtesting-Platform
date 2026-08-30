import api from './api';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  exchange: string | null;
  asset_type: string;
  created_at: string;
  data_start?: string;
  data_end?: string;
  candle_count?: number;
  latest_price?: number;
}

export interface OHLCVCandle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketDataResponse {
  symbol: string;
  asset: Asset;
  candles: OHLCVCandle[];
  count: number;
}

export const marketService = {
  getAssets: async (): Promise<Asset[]> => {
    const res = await api.get<Asset[]>('/assets');
    return res.data;
  },

  getAsset: async (symbol: string): Promise<Asset> => {
    const res = await api.get<Asset>(`/assets/${symbol}`);
    return res.data;
  },

  getMarketData: async (
    symbol: string,
    from?: string,
    to?: string,
    limit?: number
  ): Promise<MarketDataResponse> => {
    const res = await api.get<MarketDataResponse>(`/market-data/${symbol}`, {
      params: { from, to, limit },
    });
    return res.data;
  },
};
