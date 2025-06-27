
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

interface ConfigUpdateEvent {
  config: any;
  timestamp: Date;
}

class ConfigValidationServiceImpl {
  private validationRules: ValidationRule[] = [
    {
      field: 'script.sensitivity',
      type: 'range',
      min: 0.1,
      max: 1.0,
      message: 'Script sensitivity must be between 0.1 and 1.0'
    },
    {
      field: 'script.randomCastProbability',
      type: 'range',
      min: 0,
      max: 1.0,
      message: 'Random cast probability must be between 0 and 1.0'
    },
    {
      field: 'detection.spoolConfidence',
      type: 'range',
      min: 0.1,
      max: 1.0,
      message: 'Spool confidence must be between 0.1 and 1.0'
    },
    {
      field: 'frictionBrake.initial',
      type: 'range',
      min: 0,
      max: 50,
      message: 'Initial friction brake must be between 0 and 50'
    },
    {
      field: 'keepnet.capacity',
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
    EventManager.subscribe('config.updated', (data: ConfigUpdateEvent) => {
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
    const initialBrake = this.getNestedValue(config, 'frictionBrake.initial');
    const maxBrake = 50; // Default max from config
    
    if (initialBrake > maxBrake) {
      errors.push({
        field: 'frictionBrake',
        message: 'Initial brake cannot be greater than max brake',
        severity: 'error'
      });
    }

    // Additional validation can be added here
    if (config.automation) {
      if (config.automation.castDelayMin > config.automation.castDelayMax) {
        errors.push({
          field: 'automation.castDelay',
          message: 'Cast delay minimum cannot be greater than maximum',
          severity: 'error'
        });
      }
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
