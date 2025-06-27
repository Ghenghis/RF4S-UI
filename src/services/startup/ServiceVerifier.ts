
import { ServiceOrchestrator } from '../ServiceOrchestrator';
import { ServiceHealthMonitor } from '../health/ServiceHealthMonitor';
import { ServiceStartupStatus } from './types';

export class ServiceVerifier {
  static async verifyAllServices(healthMonitor: ServiceHealthMonitor): Promise<ServiceStartupStatus[]> {
    const expectedServices = [
      'RealtimeDataService',
      'SystemMonitorService', 
      'RF4SIntegrationService',
      'ConfigValidationService',
      'PerformanceOptimizationService',
      'ErrorRecoveryService',
      'StatisticsCalculator',
      'DetectionLogicHandler',
      'ProfileLogicManager',
      'FishingModeLogic',
      'UserPreferenceService',
      'SessionStateService',
      'PanelEventCoordinator'
    ];

    const serviceStatuses: ServiceStartupStatus[] = [];
    const orchestratorStatuses = ServiceOrchestrator.getServiceStatus();

    for (const serviceName of expectedServices) {
      const orchestratorStatus = orchestratorStatuses.find(s => s.name === serviceName);
      const healthResult = healthMonitor.getServiceHealth(serviceName);
      
      const status: ServiceStartupStatus = {
        serviceName,
        status: orchestratorStatus?.running ? 'running' : 'failed',
        startTime: orchestratorStatus?.startTime || null,
        error: orchestratorStatus?.running ? undefined : 'Service not running',
        healthStatus: healthResult?.currentStatus.status || 'unknown'
      };

      serviceStatuses.push(status);
    }

    return serviceStatuses;
  }

  static determineOverallStatus(
    running: number, 
    failed: number, 
    total: number, 
    healthMonitor: ServiceHealthMonitor
  ): 'ready' | 'partial' | 'failed' {
    const healthSummary = healthMonitor.getHealthSummary();
    
    // Consider health status in overall determination
    if (failed === 0 && running === total && (!healthSummary || healthSummary.critical === 0)) {
      return 'ready';
    } else if (running > 0 && running >= total * 0.8 && (!healthSummary || healthSummary.critical <= 1)) {
      return 'partial';
    } else {
      return 'failed';
    }
  }
}
