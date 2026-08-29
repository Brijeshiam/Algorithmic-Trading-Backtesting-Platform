import { z } from 'zod';

export const RunMonteCarloSchema = z.object({
  backtestId: z.string().uuid(),
  simulations: z.number().int().min(100).max(10000).default(1000),
});

export type RunMonteCarloDTO = z.infer<typeof RunMonteCarloSchema>;
