import { StrategyDefinition, StrategyDefinitionSchema } from './strategies.dto.js';

export class StrategyValidator {
  /**
   * Validates a strategy definition JSON string or object
   * Throws an error if invalid, returns the typed object if valid
   */
  static validateDefinition(definition: any): StrategyDefinition {
    try {
      const parsed = typeof definition === 'string' ? JSON.parse(definition) : definition;
      return StrategyDefinitionSchema.parse(parsed);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        throw new Error(`Invalid strategy definition: ${error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
      }
      throw new Error(`Failed to parse strategy definition: ${error.message}`);
    }
  }
}
