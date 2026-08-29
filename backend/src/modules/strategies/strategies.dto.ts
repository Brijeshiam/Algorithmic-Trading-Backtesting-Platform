import { z } from 'zod';

export const IndicatorRefSchema = z.object({
  indicator: z.enum(['SMA', 'EMA', 'RSI', 'MACD', 'BOLLINGER', 'VOLUME', 'PRICE']),
  period: z.number().int().positive().optional(),
  type: z.literal('indicator_ref')
});

export const ConditionSchema = z.object({
  indicator: z.enum(['SMA', 'EMA', 'RSI', 'MACD', 'BOLLINGER', 'VOLUME', 'PRICE']),
  period: z.number().int().positive().optional(),
  comparison: z.enum(['>', '<', '>=', '<=', '==', 'CROSSES_ABOVE', 'CROSSES_BELOW']),
  value: z.union([z.number(), z.lazy(() => IndicatorRefSchema)]),
});

export type Condition = z.infer<typeof ConditionSchema>;

// Need to define ConditionGroupSchema recursively
export const ConditionGroupSchema: z.ZodType<any> = z.lazy(() => z.object({
  operator: z.enum(['AND', 'OR']),
  conditions: z.array(z.union([ConditionSchema, ConditionGroupSchema])),
}));

export type ConditionGroup = {
  operator: 'AND' | 'OR';
  conditions: (Condition | ConditionGroup)[];
};

export const StrategyDefinitionSchema = z.object({
  entryConditions: ConditionGroupSchema.optional(),
  exitConditions: ConditionGroupSchema.optional(),
  positionSizing: z.object({
    type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
    value: z.number().positive()
  }).optional(),
  stopLoss: z.object({
    percentage: z.number().positive()
  }).optional(),
  takeProfit: z.object({
    percentage: z.number().positive()
  }).optional()
});

export type StrategyDefinition = z.infer<typeof StrategyDefinitionSchema>;

export const CreateStrategySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  definition_json: StrategyDefinitionSchema
});

export type CreateStrategyDTO = z.infer<typeof CreateStrategySchema>;

export const UpdateStrategySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
  definition_json: StrategyDefinitionSchema.optional()
});

export type UpdateStrategyDTO = z.infer<typeof UpdateStrategySchema>;
