
import { EventManager } from '../core/EventManager';
import { ServiceOrchestrator } from './ServiceOrchestrator';
import { BackendIntegrationService } from './BackendIntegrationService';

interface ServiceStartupStatus {
  serviceName: string;
  status: 'initializing' | 'running' | 'failed' | 'stopped';
  startTime: Date | null;
  error?: string;
}

interface SystemStartupReport {
  overallStatus: 'initializing' | 'ready' | 'partial' | 'failed';
  totalServices: number;
  runningServices: number;
  failedServices: number;
  serviceStatuses: ServiceStartupStatus[];
  startupTime: number;
}

class ServiceStartupVerifierImpl {
  private startupReport: SystemStartupReport = {
    overallStatus: 'initializing',
    totalServices: 0,
    runningServices: 0,
    failedServices: 0,
    serviceStatuses: [],
    startupTime: 0
  };
  private startupStartTime: Date = new Date();

  async verifySystemStartup(): Promise<SystemStartupReport> {
    console.log('Service Startup Verifier: Beginning system startup verification...');
    this.startupStartTime = new Date();

    try {
      // Initialize backend integration service
      await BackendIntegrationService.initialize();
      
      // Wait a moment for services to fully initialize
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verify all services
      const serviceStatuses = await this.verifyAllServices();
      
      const runningCount = serviceStatuses.filter(s => s.status === 'running').length;
      const failedCount = serviceStatuses.filter(s => s.status === 'failed').length;
      
      this.startupReport = {
        overallStatus: this.determineOverallStatus(runningCount, failedCount, serviceStatuses.length),
        totalServices: serviceStatuses.length,
        runningServices: runningCount,
        failedServices: failedCount,
        serviceStatuses,
        startupTime: Date.now() - this.startupStartTime.getTime()
      };

      console.log('Service Startup Verification Complete:', this.startupReport);
      
      // Emit startup complete event
      EventManager.emit('system.startup_complete', this.startupReport, 'ServiceStartupVerifier');
      
      return this.startupReport;
      
    } catch (error) {
      console.error('System startup verification failed:', error);
      
      this.startupReport.overallStatus = 'failed';
      EventManager.emit('system.startup_failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      }, 'ServiceStartupVerifier');
      
      return this.startupReport;
    }
  }

  private async verifyAllServices(): Promise<ServiceStartupStatus[]> {
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
      
      const status: ServiceStartupStatus = {
        serviceName,
        status: orchestratorStatus?.running ? 'running' : 'failed',
        startTime: orchestratorStatus?.startTime || null,
        error: orchestratorStatus?.running ? undefined : 'Service not running'
      };

      serviceStatuses.push(status);
    }

    return serviceStatuses;
  }

  private determineOverallStatus(running: number, failed: number, total: number): 'ready' | 'partial' | 'failed' {
    if (failed === 0 && running === total) {
      return 'ready';
    } else if (running > 0 && running >= total * 0.8) {
      return 'partial';
    } else {
      return 'failed';
    }
  }

  getLastStartupReport(): SystemStartupReport {
    return { ...this.startupReport };
  }

  isSystemReady(): boolean {
    return this.startupReport.overallStatus === 'ready' || this.startupReport.overallStatus === 'partial';
  }
}

export const ServiceStartupVerifier = new ServiceStartupVerifierImpl();
