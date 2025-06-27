
import { EventManager } from '../../core/EventManager';
import { ServiceOrchestrator } from '../ServiceOrchestrator';
import { ServiceValidator } from './ServiceValidator';
import { ValidationReportGenerator } from './ValidationReportGenerator';
import { ValidationResult, IntegrationValidationReport } from './types';

export class IntegrationMonitor {
  private validationResults: Map<string, ValidationResult> = new Map();
  private validationInterval: NodeJS.Timeout | null = null;
  private serviceValidator: ServiceValidator;
  private reportGenerator: ValidationReportGenerator;

  constructor() {
    this.serviceValidator = new ServiceValidator();
    this.reportGenerator = new ValidationReportGenerator();
  }

  start(): void {
    console.log('Integration Monitor started');
    this.startValidationMonitoring();
  }

  stop(): void {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
      this.validationInterval = null;
    }
    console.log('Integration Monitor stopped');
  }

  private startValidationMonitoring(): void {
    // Run validation every 30 seconds
    this.validationInterval = setInterval(() => {
      this.performIntegrationValidation();
    }, 30000);

    // Run initial validation
    setTimeout(() => {
      this.performIntegrationValidation();
    }, 5000);
  }

  async performIntegrationValidation(): Promise<IntegrationValidationReport> {
    console.log('Performing service integration validation...');

    const serviceStatuses = ServiceOrchestrator.getServiceStatus();
    const validationResults: ValidationResult[] = [];

    for (const serviceStatus of serviceStatuses) {
      const result = await this.serviceValidator.validateService(serviceStatus.name);
      validationResults.push(result);
      this.validationResults.set(serviceStatus.name, result);
    }

    const report = this.reportGenerator.generateReport(validationResults);

    // Emit validation report
    EventManager.emit('services.validation_report', report, 'ServiceIntegrationValidator');

    console.log('Service integration validation completed:', {
      total: report.totalServices,
      valid: report.validServices,
      invalid: report.invalidServices,
      status: report.overallStatus
    });

    return report;
  }

  getLastValidationReport(): IntegrationValidationReport | null {
    const serviceResults = Array.from(this.validationResults.values());
    
    if (serviceResults.length === 0) {
      return null;
    }

    return this.reportGenerator.generateReport(serviceResults);
  }

  getServiceValidationResult(serviceName: string): ValidationResult | null {
    return this.validationResults.get(serviceName) || null;
  }
}
