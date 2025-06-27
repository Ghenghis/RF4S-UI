
import { IntegrationMonitor } from './validation/IntegrationMonitor';
import { IntegrationValidationReport, ValidationResult } from './validation/types';

class ServiceIntegrationValidatorImpl {
  private integrationMonitor: IntegrationMonitor;

  constructor() {
    this.integrationMonitor = new IntegrationMonitor();
  }

  start(): void {
    this.integrationMonitor.start();
  }

  stop(): void {
    this.integrationMonitor.stop();
  }

  async performIntegrationValidation(): Promise<IntegrationValidationReport> {
    return this.integrationMonitor.performIntegrationValidation();
  }

  getLastValidationReport(): IntegrationValidationReport | null {
    return this.integrationMonitor.getLastValidationReport();
  }

  getServiceValidationResult(serviceName: string): ValidationResult | null {
    return this.integrationMonitor.getServiceValidationResult(serviceName);
  }
}

export const ServiceIntegrationValidator = new ServiceIntegrationValidatorImpl();
