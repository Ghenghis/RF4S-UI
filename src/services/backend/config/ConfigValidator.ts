import { RF4SYamlConfig } from '../../../types/config';
import { createRichLogger } from '../../../rf4s/utils';

export interface ConfigValidationResult {
  isValid: boolean;
  missingFields: string[];
  invalidValues: string[];
  warnings: string[];
}

export class ConfigValidator {
  private logger = createRichLogger('ConfigValidator');

  validateConfigData(yamlConfig: RF4SYamlConfig): ConfigValidationResult {
    const missingFields: string[] = [];
    const invalidValues: string[] = [];
    const warnings: string[] = [];

    // Check required top-level sections
    if (!yamlConfig.VERSION) missingFields.push('VERSION');
    if (!yamlConfig.SCRIPT) missingFields.push('SCRIPT');
    if (!yamlConfig.KEY) missingFields.push('KEY');
    if (!yamlConfig.FRICTION_BRAKE) missingFields.push('FRICTION_BRAKE');

    // Validate SCRIPT section
    if (yamlConfig.SCRIPT) {
      if (typeof yamlConfig.SCRIPT.SPOOL_CONFIDENCE !== 'number') {
        missingFields.push('SCRIPT.SPOOL_CONFIDENCE');
      } else if (yamlConfig.SCRIPT.SPOOL_CONFIDENCE < 0.1 || yamlConfig.SCRIPT.SPOOL_CONFIDENCE > 1.0) {
        invalidValues.push('SCRIPT.SPOOL_CONFIDENCE must be between 0.1 and 1.0');
      } else if (yamlConfig.SCRIPT.SPOOL_CONFIDENCE < 0.95) {
        warnings.push('SCRIPT.SPOOL_CONFIDENCE below 0.95 may result in missed detections');
      }

      if (typeof yamlConfig.SCRIPT.RANDOM_CAST_PROBABILITY !== 'number') {
        missingFields.push('SCRIPT.RANDOM_CAST_PROBABILITY');
      } else if (yamlConfig.SCRIPT.RANDOM_CAST_PROBABILITY < 0 || yamlConfig.SCRIPT.RANDOM_CAST_PROBABILITY > 1) {
        invalidValues.push('SCRIPT.RANDOM_CAST_PROBABILITY must be between 0 and 1');
      }
    }

    // Validate FRICTION_BRAKE section
    if (yamlConfig.FRICTION_BRAKE) {
      if (typeof yamlConfig.FRICTION_BRAKE.INITIAL !== 'number') {
        missingFields.push('FRICTION_BRAKE.INITIAL');
      } else if (yamlConfig.FRICTION_BRAKE.INITIAL < 1 || yamlConfig.FRICTION_BRAKE.INITIAL > 100) {
        invalidValues.push('FRICTION_BRAKE.INITIAL must be between 1 and 100');
      }

      if (typeof yamlConfig.FRICTION_BRAKE.MAX !== 'number') {
        missingFields.push('FRICTION_BRAKE.MAX');
      } else if (yamlConfig.FRICTION_BRAKE.MAX < yamlConfig.FRICTION_BRAKE.INITIAL) {
        invalidValues.push('FRICTION_BRAKE.MAX must be greater than or equal to INITIAL');
      }
    }

    // Validate KEEPNET section
    if (yamlConfig.KEEPNET) {
      if (typeof yamlConfig.KEEPNET.CAPACITY !== 'number') {
        missingFields.push('KEEPNET.CAPACITY');
      } else if (yamlConfig.KEEPNET.CAPACITY < 1) {
        invalidValues.push('KEEPNET.CAPACITY must be greater than 0');
      }

      const validActions = ['quit', 'alarm', 'continue'];
      if (!validActions.includes(yamlConfig.KEEPNET.FULL_ACTION)) {
        invalidValues.push(`KEEPNET.FULL_ACTION must be one of: ${validActions.join(', ')}`);
      }
    }

    return {
      isValid: missingFields.length === 0 && invalidValues.length === 0,
      missingFields,
      invalidValues,
      warnings
    };
  }
}
