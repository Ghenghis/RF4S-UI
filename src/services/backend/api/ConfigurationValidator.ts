import { RF4SYamlConfig } from '../../../types/config';
import { APIResponse, ValidationResult } from '../types';

export class ConfigurationValidator {
  validate(config: RF4SYamlConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config) {
      errors.push('Configuration is required');
      return { isValid: false, errors, warnings };
    }

    // Validate SCRIPT settings
    if (config.SCRIPT) {
      if (typeof config.SCRIPT.SPOOL_CONFIDENCE !== 'number' || 
          config.SCRIPT.SPOOL_CONFIDENCE < 0 || 
          config.SCRIPT.SPOOL_CONFIDENCE > 1) {
        errors.push('Spool confidence must be a number between 0 and 1');
      }

      if (typeof config.SCRIPT.SPOD_ROD_RECAST_DELAY !== 'number' || config.SCRIPT.SPOD_ROD_RECAST_DELAY < 0) {
        errors.push('Spod rod recast delay must be a positive number');
      }
    }

    // Validate FRICTION_BRAKE settings
    if (config.FRICTION_BRAKE) {
      if (typeof config.FRICTION_BRAKE.INITIAL !== 'number' || config.FRICTION_BRAKE.INITIAL < 0) {
        errors.push('Friction brake initial must be a positive number');
      }
      
      if (typeof config.FRICTION_BRAKE.MAX !== 'number' || config.FRICTION_BRAKE.MAX < 0) {
        errors.push('Friction brake max must be a positive number');
      }
      
      if (config.FRICTION_BRAKE.INITIAL > config.FRICTION_BRAKE.MAX) {
        errors.push('Friction brake initial cannot be greater than maximum');
      }
    }

    // Validate KEEPNET settings
    if (config.KEEPNET) {
      if (typeof config.KEEPNET.CAPACITY !== 'number' || config.KEEPNET.CAPACITY <= 0) {
        errors.push('Keepnet capacity must be a positive number');
      }
    }

    // Validate STAT settings
    if (config.STAT) {
      const thresholds = ['ENERGY_THRESHOLD', 'HUNGER_THRESHOLD', 'COMFORT_THRESHOLD'];
      thresholds.forEach(threshold => {
        const value = (config.STAT as any)[threshold];
        if (typeof value !== 'number' || value < 0 || value > 100) {
          warnings.push(`${threshold} should be between 0 and 100`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateAPIResponse<T>(response: any): APIResponse<T> {
    if (!response || typeof response !== 'object') {
      return {
        success: false,
        error: 'Invalid response format',
        timestamp: Date.now()
      };
    }

    return {
      success: response.success || false,
      data: response.data,
      error: response.error,
      timestamp: Date.now()
    };
  }
}
