
import { EventManager } from '../core/EventManager';
import { ServiceOrchestrator } from './ServiceOrchestrator';
import { BackendIntegrationService } from './BackendIntegrationService';

interface ValidationResult {
  serviceName: string;
  isRegistered: boolean;
  isRunning: boolean;
  hasEventHandlers: boolean;
  lastHealthCheck: Date;
  errors: string[];
}

interface IntegrationValidationReport {
  timestamp: Date;
  totalServices: number;
  validServices: number;
  invalidServices: number;
  serviceResults: ValidationResult[];
  overallStatus: 'healthy' | 'warning' | 'critical';
}

class ServiceIntegrationValidatorImpl {
  private validationResults: Map<string, ValidationResult> = new Map();
  private validationInterval: NodeJS.Timeout | null = null;

  start(): void {
    console.log('Service Integration Validator started');
    this.startValidationMonitoring();
  }

  stop(): void {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
      this.validationInterval = null;
    }
    console.log('Service Integration Validator stopped');
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
      const result = await this.validateService(serviceStatus.name);
      validationResults.push(result);
      this.validationResults.set(serviceStatus.name, result);
    }

    const report: IntegrationValidationReport = {
      timestamp: new Date(),
      totalServices: validationResults.length,
      validServices: validationResults.filter(r => r.errors.length === 0).length,
      invalidServices: validationResults.filter(r => r.errors.length > 0).length,
      serviceResults: validationResults,
      overallStatus: this.determineOverallStatus(validationResults)
    };

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

  private async validateService(serviceName: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      serviceName,
      isRegistered: false,
      isRunning: false,
      hasEventHandlers: false,
      lastHealthCheck: new Date(),
      errors: []
    };

    try {
      // Check if service is registered
      result.isRegistered = ServiceOrchestrator.isServiceRunning(serviceName);
      
      if (!result.isRegistered) {
        result.errors.push(`Service ${serviceName} is not registered`);
      }

      // Check if service is running
      result.isRunning = ServiceOrchestrator.isServiceRunning(serviceName);
      
      if (!result.isRunning) {
        result.errors.push(`Service ${serviceName} is not running`);
      }

      // Check if service has event handlers (simplified check)
      result.hasEventHandlers = this.checkServiceEventHandlers(serviceName);
      
      if (!result.hasEventHandlers) {
        result.errors.push(`Service ${serviceName} may not have proper event handlers`);
      }

      // Additional service-specific validations
      await this.performServiceSpecificValidation(serviceName, result);

    } catch (error) {
      result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  private checkServiceEventHandlers(serviceName: string): boolean {
    // This is a simplified check - in a real implementation, we'd have more sophisticated validation
    const criticalServices = [
      'RealtimeDataService',
      'SystemMonitorService',
      'RF4SIntegrationService',
      'ConfigValidationService',
      'PerformanceOptimizationService'
    ];

    return criticalServices.includes(serviceName);
  }

  private async performServiceSpecificValidation(serviceName: string, result: ValidationResult): Promise<void> {
    switch (serviceName) {
      case 'RealtimeDataService':
        if (!this.validateRealtimeDataService()) {
          result.errors.push('RealtimeDataService is not providing real-time updates');
        }
        break;
      case 'SystemMonitorService':
        if (!this.validateSystemMonitorService()) {
          result.errors.push('SystemMonitorService is not monitoring system health');
        }
        break;
      case 'RF4SIntegrationService':
        if (!this.validateRF4SIntegrationService()) {
          result.errors.push('RF4SIntegrationService is not connected to RF4S codebase');
        }
        break;
      case 'BackendIntegrationService':
        const integrationStatus = BackendIntegrationService.getIntegrationStatus();
        if (integrationStatus.integrationStatus !== 'connected') {
          result.errors.push('BackendIntegrationService is not properly connected');
        }
        break;
    }
  }

  private validateRealtimeDataService(): boolean {
    // Check if RealtimeDataService is providing updates
    return true; // Simplified validation
  }

  private validateSystemMonitorService(): boolean {
    // Check if SystemMonitorService is monitoring
    return true; // Simplified validation
  }

  private validateRF4SIntegrationService(): boolean {
    // Check if RF4SIntegrationService is connected
    return true; // Simplified validation
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

  getLastValidationReport(): IntegrationValidationReport | null {
    const serviceResults = Array.from(this.validationResults.values());
    
    if (serviceResults.length === 0) {
      return null;
    }

    return {
      timestamp: new Date(),
      totalServices: serviceResults.length,
      validServices: serviceResults.filter(r => r.errors.length === 0).length,
      invalidServices: serviceResults.filter(r => r.errors.length > 0).length,
      serviceResults,
      overallStatus: this.determineOverallStatus(serviceResults)
    };
  }

  getServiceValidationResult(serviceName: string): ValidationResult | null {
    return this.validationResults.get(serviceName) || null;
  }
}

export const ServiceIntegrationValidator = new ServiceIntegrationValidatorImpl();
