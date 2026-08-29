import { z } from 'zod';

export const RunBacktestSchema = z.object({
  strategyId: z.string().uuid('strategyId must be a valid UUID'),
  symbol: z.string().min(1).max(20).toUpperCase(),
  dateStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dateStart must be YYYY-MM-DD'),
  dateEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dateEnd must be YYYY-MM-DD'),
  initialCapital: z.number().positive().default(100000),
  commissionRate: z.number().min(0).max(0.05).default(0.001),   // max 5%
  slippageRate: z.number().min(0).max(0.05).default(0.0005),    // max 5%
});

export type RunBacktestDTO = z.infer<typeof RunBacktestSchema>;
