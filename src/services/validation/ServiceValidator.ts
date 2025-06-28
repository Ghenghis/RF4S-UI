
import { ServiceOrchestrator } from '../ServiceOrchestrator';
import { BackendIntegrationService } from '../BackendIntegrationService';
import { ValidationResult } from './types';

export class ServiceValidator {
  async validateService(serviceName: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      serviceName,
      status: 'unknown',
      isRunning: false,
      lastCheck: new Date(),
      responseTime: 0,
      errorRate: 0,
      isRegistered: false,
      hasEventHandlers: false,
      errors: []
    };

    try {
      // Check if service is registered and running
      result.isRunning = ServiceOrchestrator.isServiceRunning(serviceName);
      result.isRegistered = result.isRunning; // If running, it must be registered
      result.status = result.isRunning ? 'healthy' : 'critical';
      
      if (!result.isRegistered) {
        result.errors.push(`Service ${serviceName} is not registered`);
      }

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
      result.status = 'critical';
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
}
