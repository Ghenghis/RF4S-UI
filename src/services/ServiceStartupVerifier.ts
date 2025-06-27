import { EventManager } from '../core/EventManager';
import { ServiceOrchestrator } from './ServiceOrchestrator';
import { BackendIntegrationService } from './BackendIntegrationService';
import { ServiceStartupSequencer } from './startup/ServiceStartupSequencer';
import { ServiceHealthMonitor } from './health/ServiceHealthMonitor';
import { EnhancedErrorHandler } from './recovery/EnhancedErrorHandler';

interface ServiceStartupStatus {
  serviceName: string;
  status: 'initializing' | 'running' | 'failed' | 'stopped';
  startTime: Date | null;
  error?: string;
  phase?: string;
  healthStatus?: 'healthy' | 'warning' | 'critical' | 'unknown';
}

interface SystemStartupReport {
  overallStatus: 'initializing' | 'ready' | 'partial' | 'failed';
  totalServices: number;
  runningServices: number;
  failedServices: number;
  serviceStatuses: ServiceStartupStatus[];
  startupTime: number;
  currentPhase?: { phase: number; total: number; name: string };
  healthSummary?: any;
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
  private startupSequencer: ServiceStartupSequencer;
  private healthMonitor: ServiceHealthMonitor;
  private errorHandler: EnhancedErrorHandler;

  constructor() {
    this.startupSequencer = new ServiceStartupSequencer();
    this.healthMonitor = new ServiceHealthMonitor();
    this.errorHandler = new EnhancedErrorHandler();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen for phase updates
    EventManager.subscribe('startup.phase_started', (data: any) => {
      this.updateStartupPhase(data);
    });

    EventManager.subscribe('startup.phase_completed', (data: any) => {
      console.log(`Phase completed: ${data.phaseName} in ${data.duration}ms`);
    });

    EventManager.subscribe('startup.phase_failed', (data: any) => {
      console.error(`Phase failed: ${data.phaseName} - ${data.error}`);
    });

    // Listen for health updates
    EventManager.subscribe('health.check_completed', (data: any) => {
      this.updateHealthStatus(data);
    });

    EventManager.subscribe('health.critical_alert', (data: any) => {
      console.warn('Critical health alert:', data);
    });

    // Listen for error recovery
    EventManager.subscribe('error.recovered', (data: any) => {
      console.log('Error recovered:', data.recoveryStrategy);
    });

    EventManager.subscribe('error.escalated', (data: any) => {
      console.error('Error escalated:', data.errorContext);
    });
  }

  private updateStartupPhase(phaseData: any): void {
    this.startupReport.currentPhase = this.startupSequencer.getCurrentPhase();
    
    EventManager.emit('system.startup_phase_updated', {
      phase: this.startupReport.currentPhase,
      services: phaseData.services
    }, 'ServiceStartupVerifier');
  }

  private updateHealthStatus(healthData: any): void {
    this.startupReport.healthSummary = healthData.summary;
    
    // Update service health status
    this.startupReport.serviceStatuses.forEach(service => {
      const healthResult = healthData.serviceResults.find(
        (r: any) => r.serviceName === service.serviceName
      );
      if (healthResult) {
        service.healthStatus = healthResult.status;
      }
    });
  }

  async verifySystemStartup(): Promise<SystemStartupReport> {
    console.log('Service Startup Verifier: Beginning enhanced startup verification...');
    this.startupStartTime = new Date();

    try {
      // Start health monitoring
      this.healthMonitor.start();
      
      // Initialize backend integration service
      await BackendIntegrationService.initialize();
      
      // Execute phased startup sequence
      await this.startupSequencer.executeStartupSequence();
      
      // Wait a moment for services to stabilize
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Perform comprehensive verification
      const serviceStatuses = await this.verifyAllServices();
      
      const runningCount = serviceStatuses.filter(s => s.status === 'running').length;
      const failedCount = serviceStatuses.filter(s => s.status === 'failed').length;
      
      this.startupReport = {
        overallStatus: this.determineOverallStatus(runningCount, failedCount, serviceStatuses.length),
        totalServices: serviceStatuses.length,
        runningServices: runningCount,
        failedServices: failedCount,
        serviceStatuses,
        startupTime: Date.now() - this.startupStartTime.getTime(),
        currentPhase: this.startupSequencer.getCurrentPhase(),
        healthSummary: this.healthMonitor.getHealthSummary()
      };

      console.log('Enhanced Service Startup Verification Complete:', this.startupReport);
      
      // Emit startup complete event with enhanced data
      EventManager.emit('system.startup_complete', this.startupReport, 'ServiceStartupVerifier');
      
      return this.startupReport;
      
    } catch (error) {
      console.error('Enhanced system startup verification failed:', error);
      
      this.startupReport.overallStatus = 'failed';
      EventManager.emit('system.startup_failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        startupTime: Date.now() - this.startupStartTime.getTime()
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
      const healthResult = this.healthMonitor.getServiceHealth(serviceName);
      
      const status: ServiceStartupStatus = {
        serviceName,
        status: orchestratorStatus?.running ? 'running' : 'failed',
        startTime: orchestratorStatus?.startTime || null,
        error: orchestratorStatus?.running ? undefined : 'Service not running',
        healthStatus: healthResult?.status || 'unknown'
      };

      serviceStatuses.push(status);
    }

    return serviceStatuses;
  }

  private determineOverallStatus(running: number, failed: number, total: number): 'ready' | 'partial' | 'failed' {
    const healthSummary = this.healthMonitor.getHealthSummary();
    
    // Consider health status in overall determination
    if (failed === 0 && running === total && (!healthSummary || healthSummary.critical === 0)) {
      return 'ready';
    } else if (running > 0 && running >= total * 0.8 && (!healthSummary || healthSummary.critical <= 1)) {
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

  getHealthMonitor(): ServiceHealthMonitor {
    return this.healthMonitor;
  }

  getErrorHandler(): EnhancedErrorHandler {
    return this.errorHandler;
  }
}

export const ServiceStartupVerifier = new ServiceStartupVerifierImpl();
