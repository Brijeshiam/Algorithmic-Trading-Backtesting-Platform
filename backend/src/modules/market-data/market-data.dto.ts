import { z } from 'zod';

export const MarketDataQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 1000),
});

export type MarketDataQueryDTO = z.infer<typeof MarketDataQuerySchema>;
