
import { RF4SYamlConfig } from '../../../types/config';
import { createRichLogger } from '../../../rf4s/utils';
import { APIResponse, ValidationResult } from '../types';

export class ConfigurationValidator {
  private logger = createRichLogger('ConfigurationValidator');

  async validateConfig(config: RF4SYamlConfig): Promise<APIResponse<ValidationResult>> {
    try {
      const validation = this.validateConfigData(config);
      
      return {
        success: true,
        data: validation,
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to validate config:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }

  private validateConfigData(config: RF4SYamlConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!config.VERSION) {
      errors.push('VERSION is required');
    }

    if (!config.SCRIPT) {
      errors.push('SCRIPT section is required');
    } else {
      if (config.SCRIPT.SPOOL_CONFIDENCE < 0.1 || config.SCRIPT.SPOOL_CONFIDENCE > 1.0) {
        errors.push('SPOOL_CONFIDENCE must be between 0.1 and 1.0');
      }
      if (config.SCRIPT.SPOOL_CONFIDENCE < 0.95) {
        warnings.push('SPOOL_CONFIDENCE below 0.95 may result in missed detections');
      }
    }

    if (!config.KEY) {
      errors.push('KEY section is required');
    }

    if (!config.FRICTION_BRAKE) {
      errors.push('FRICTION_BRAKE section is required');
    } else {
      if (config.FRICTION_BRAKE.INITIAL < 1 || config.FRICTION_BRAKE.INITIAL > 100) {
        errors.push('FRICTION_BRAKE.INITIAL must be between 1 and 100');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
