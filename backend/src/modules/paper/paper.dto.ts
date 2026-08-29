import { z } from 'zod';

export const InitAccountSchema = z.object({
  name: z.string().min(1).max(100).default('Main Paper Account'),
  initialCapital: z.number().positive().default(100000),
});

export const PlaceOrderSchema = z.object({
  symbol: z.string().min(1).max(20),
  side: z.enum(['BUY', 'SELL']),
  quantity: z.number().positive(),
  // Real paper trading would fetch current market price if not provided,
  // but for our simple simulator, we can accept a mock price from the client.
  price: z.number().positive(), 
  orderType: z.enum(['MARKET', 'LIMIT', 'STOP_LOSS', 'TAKE_PROFIT']).default('MARKET'),
});

export type InitAccountDTO = z.infer<typeof InitAccountSchema>;
export type PlaceOrderDTO = z.infer<typeof PlaceOrderSchema>;
