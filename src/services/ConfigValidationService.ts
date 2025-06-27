
import { EventManager } from '../core/EventManager';
import { rf4sService } from '../rf4s/services/rf4sService';

interface ValidationRule {
  field: string;
  type: 'range' | 'required' | 'custom';
  min?: number;
  max?: number;
  validator?: (value: any) => boolean;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  warnings: Array<{
    field: string;
    message: string;
  }>;
}

class ConfigValidationServiceImpl {
  private validationRules: ValidationRule[] = [
    {
      field: 'SCRIPT.SPOOL_CONFIDENCE',
      type: 'range',
      min: 0.1,
      max: 1.0,
      message: 'Spool confidence must be between 0.1 and 1.0'
    },
    {
      field: 'SCRIPT.RANDOM_CAST_PROBABILITY',
      type: 'range',
      min: 0,
      max: 1.0,
      message: 'Random cast probability must be between 0 and 1.0'
    },
    {
      field: 'FRICTION_BRAKE.INITIAL',
      type: 'range',
      min: 0,
      max: 50,
      message: 'Initial friction brake must be between 0 and 50'
    },
    {
      field: 'FRICTION_BRAKE.MAX',
      type: 'range',
      min: 0,
      max: 50,
      message: 'Max friction brake must be between 0 and 50'
    },
    {
      field: 'KEEPNET.CAPACITY',
      type: 'range',
      min: 50,
      max: 200,
      message: 'Keepnet capacity must be between 50 and 200'
    }
  ];

  private validationInterval: NodeJS.Timeout | null = null;

  start(): void {
    console.log('Config Validation Service started');
    
    // Start periodic validation
    this.validationInterval = setInterval(() => {
      this.validateCurrentConfig();
    }, 10000); // Validate every 10 seconds

    this.setupEventListeners();
  }

  stop(): void {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
      this.validationInterval = null;
    }
    console.log('Config Validation Service stopped');
  }

  private setupEventListeners(): void {
    // Listen for config changes
    EventManager.subscribe('config.updated', (data) => {
      this.validateConfig(data.config);
    });
  }

  private validateCurrentConfig(): void {
    const config = rf4sService.getConfig();
    const result = this.validateConfig(config);
    
    if (!result.isValid) {
      EventManager.emit('config.validation_failed', result, 'ConfigValidationService');
    }
  }

  validateConfig(config: any): ValidationResult {
    const errors: Array<{ field: string; message: string; severity: 'error' | 'warning' }> = [];
    const warnings: Array<{ field: string; message: string }> = [];

    this.validationRules.forEach(rule => {
      const value = this.getNestedValue(config, rule.field);
      
      if (!this.validateField(value, rule)) {
        if (rule.type === 'required') {
          errors.push({
            field: rule.field,
            message: rule.message,
            severity: 'error'
          });
        } else {
          warnings.push({
            field: rule.field,
            message: rule.message
          });
        }
      }
    });

    // Cross-field validation
    this.performCrossFieldValidation(config, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validateField(value: any, rule: ValidationRule): boolean {
    switch (rule.type) {
      case 'required':
        return value !== null && value !== undefined && value !== '';
      case 'range':
        return value >= (rule.min || 0) && value <= (rule.max || Infinity);
      case 'custom':
        return rule.validator ? rule.validator(value) : true;
      default:
        return true;
    }
  }

  private performCrossFieldValidation(
    config: any, 
    errors: Array<{ field: string; message: string; severity: 'error' | 'warning' }>,
    warnings: Array<{ field: string; message: string }>
  ): void {
    // Validate friction brake settings
    const initialBrake = this.getNestedValue(config, 'FRICTION_BRAKE.INITIAL');
    const maxBrake = this.getNestedValue(config, 'FRICTION_BRAKE.MAX');
    
    if (initialBrake > maxBrake) {
      errors.push({
        field: 'FRICTION_BRAKE',
        message: 'Initial brake cannot be greater than max brake',
        severity: 'error'
      });
    }

    // Validate profile cast power levels
    if (config.PROFILE) {
      Object.entries(config.PROFILE).forEach(([profileName, profile]: [string, any]) => {
        if (profile.CAST_POWER_LEVEL > 10) {
          warnings.push({
            field: `PROFILE.${profileName}.CAST_POWER_LEVEL`,
            message: `${profileName} cast power level is very high`
          });
        }
      });
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  addCustomRule(rule: ValidationRule): void {
    this.validationRules.push(rule);
    console.log('Added custom validation rule:', rule.field);
  }

  getValidationSummary(): { totalRules: number; lastValidation: Date | null } {
    return {
      totalRules: this.validationRules.length,
      lastValidation: new Date()
    };
  }
}

export const ConfigValidationService = new ConfigValidationServiceImpl();
