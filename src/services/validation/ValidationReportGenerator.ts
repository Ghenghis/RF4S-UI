
import { ValidationResult, IntegrationValidationReport } from './types';

export class ValidationReportGenerator {
  generateReport(validationResults: ValidationResult[]): IntegrationValidationReport {
    return {
      timestamp: new Date(),
      totalServices: validationResults.length,
      validServices: validationResults.filter(r => r.errors.length === 0).length,
      invalidServices: validationResults.filter(r => r.errors.length > 0).length,
      serviceResults: validationResults,
      overallStatus: this.determineOverallStatus(validationResults)
    };
  }

  private determineOverallStatus(results: ValidationResult[]): 'healthy' | 'warning' | 'critical' {
    const totalServices = results.length;
    const healthyServices = results.filter(r => r.errors.length === 0).length;
    const healthPercentage = (healthyServices / totalServices) * 100;

    if (healthPercentage >= 90) {
      return 'healthy';
    } else if (healthPercentage >= 70) {
      return 'warning';
    } else {
      return 'critical';
    }
  }
}
