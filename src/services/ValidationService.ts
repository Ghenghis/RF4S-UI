
import { EventManager } from '../core/EventManager';
import { ServiceRegistry } from '../core/ServiceRegistry';
import { createRichLogger } from '../rf4s/utils';

interface ValidationRule {
  name: string;
  check: () => Promise<boolean> | boolean;
  severity: 'error' | 'warning' | 'info';
  description: string;
}

interface ValidationResult {
  ruleName: string;
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  details?: any;
}

interface ValidationReport {
  overallStatus: 'passed' | 'warning' | 'failed';
  totalRules: number;
  passedRules: number;
  failedRules: number;
  warningRules: number;
  results: ValidationResult[];
  generatedAt: Date;
}

class ValidationServiceImpl {
  private logger = createRichLogger('ValidationService');
  private validationRules: ValidationRule[] = [];
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warning('ValidationService already initialized');
      return;
    }

    this.logger.info('ValidationService: Initializing...');
    
    try {
      // Register with ServiceRegistry
      ServiceRegistry.register('ValidationService', this, ['ServiceRegistry'], {
        type: 'validation',
        priority: 'medium'
      });

      // Initialize validation rules
      this.initializeValidationRules();
      
      this.isInitialized = true;
      ServiceRegistry.updateStatus('ValidationService', 'running');
      
      this.logger.info('ValidationService: Successfully initialized');
      
      EventManager.emit('validation.service_initialized', {
        ruleCount: this.validationRules.length,
        timestamp: Date.now()
      }, 'ValidationService');
      
    } catch (error) {
      ServiceRegistry.updateStatus('ValidationService', 'error');
      this.logger.error('ValidationService: Initialization failed:', error);
      throw error;
    }
  }

  private initializeValidationRules(): void {
    this.validationRules = [
      {
        name: 'service_registry_initialized',
        check: () => ServiceRegistry.getServiceCount() > 0,
        severity: 'error',
        description: 'ServiceRegistry should be initialized with registered services'
      },
      {
        name: 'event_manager_available',
        check: () => typeof EventManager.emit === 'function',
        severity: 'error',
        description: 'EventManager should be available and functional'
      },
      {
        name: 'core_services_registered',
        check: () => {
          const coreServices = ['ServiceRegistry', 'BackendIntegrationService', 'ValidationService'];
          return coreServices.every(service => ServiceRegistry.isServiceRegistered(service));
        },
        severity: 'error',
        description: 'All core services should be registered'
      },
      {
        name: 'integration_services_healthy',
        check: async () => {
          const integrationServices = ServiceRegistry.getServicesByStatus('running')
            .filter(service => service.metadata.type === 'integration');
          return integrationServices.length > 0;
        },
        severity: 'warning',
        description: 'At least one integration service should be running'
      },
      {
        name: 'no_service_errors',
        check: () => {
          const services = ServiceRegistry.getAllServices();
          const errorServices = services.filter(service => service.errorCount > 5);
          return errorServices.length === 0;
        },
        severity: 'warning',
        description: 'Services should not have excessive error counts'
      },
      {
        name: 'environment_variables_present',
        check: () => {
          const requiredEnvVars = ['NODE_ENV'];
          return requiredEnvVars.every(envVar => process.env[envVar] !== undefined);
        },
        severity: 'info',
        description: 'Required environment variables should be present'
      }
    ];
  }

  async runValidation(): Promise<ValidationReport> {
    this.logger.info('ValidationService: Running validation checks...');
    
    const results: ValidationResult[] = [];
    
    for (const rule of this.validationRules) {
      try {
        const passed = await rule.check();
        
        results.push({
          ruleName: rule.name,
          passed,
          severity: rule.severity,
          message: passed ? `${rule.description} - PASSED` : `${rule.description} - FAILED`,
          timestamp: new Date()
        });
        
      } catch (error) {
        results.push({
          ruleName: rule.name,
          passed: false,
          severity: 'error',
          message: `${rule.description} - ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
          details: { error }
        });
      }
    }
    
    const report = this.generateValidationReport(results);
    
    EventManager.emit('services.validation_report', report, 'ValidationService');
    
    this.logger.info(`Validation completed: ${report.overallStatus} (${report.passedRules}/${report.totalRules} passed)`);
    
    return report;
  }

  private generateValidationReport(results: ValidationResult[]): ValidationReport {
    const totalRules = results.length;
    const passedRules = results.filter(r => r.passed).length;
    const failedRules = results.filter(r => !r.passed && r.severity === 'error').length;
    const warningRules = results.filter(r => !r.passed && r.severity === 'warning').length;
    
    let overallStatus: 'passed' | 'warning' | 'failed';
    if (failedRules > 0) {
      overallStatus = 'failed';
    } else if (warningRules > 0) {
      overallStatus = 'warning';
    } else {
      overallStatus = 'passed';
    }
    
    return {
      overallStatus,
      totalRules,
      passedRules,
      failedRules,
      warningRules,
      results,
      generatedAt: new Date()
    };
  }

  addValidationRule(rule: ValidationRule): void {
    this.validationRules.push(rule);
    this.logger.info(`Added validation rule: ${rule.name}`);
  }

  removeValidationRule(ruleName: string): boolean {
    const index = this.validationRules.findIndex(rule => rule.name === ruleName);
    if (index !== -1) {
      this.validationRules.splice(index, 1);
      this.logger.info(`Removed validation rule: ${ruleName}`);
      return true;
    }
    return false;
  }

  getValidationRules(): ValidationRule[] {
    return [...this.validationRules];
  }

  isHealthy(): boolean {
    return this.isInitialized;
  }

  destroy(): void {
    this.validationRules = [];
    this.isInitialized = false;
    ServiceRegistry.updateStatus('ValidationService', 'stopped');
    
    this.logger.info('ValidationService: Destroyed');
  }
}

export const ValidationService = new ValidationServiceImpl();
