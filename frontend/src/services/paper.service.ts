import api from './api';

export interface Position {
  symbol: string;
  quantity: number;
  average_entry: number;
}

export interface PaperAccount {
  id: string;
  name: string;
  initial_capital: number;
  cash: number;
  status: string;
  positions: Position[];
}

export interface PaperOrder {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  order_type: string;
  status: string;
  created_at: string;
}

export const paperService = {
  async getAccount(): Promise<PaperAccount | null> {
    try {
      const res = await api.get('/paper/account');
      return res.data;
    } catch (error: any) {
      if (error.response?.status === 404 || !error.response?.data) return null;
      throw error;
    }
  },

  async initAccount(name: string, initialCapital: number): Promise<PaperAccount> {
    const res = await api.post('/paper/account', { name, initialCapital });
    return res.data;
  },

  async placeOrder(symbol: string, side: 'BUY' | 'SELL', quantity: number, price: number): Promise<PaperOrder> {
    const res = await api.post('/paper/orders', { symbol, side, quantity, price });
    return res.data;
  },

  async getOrders(): Promise<PaperOrder[]> {
    const res = await api.get('/paper/orders');
    return res.data;
  }
};
