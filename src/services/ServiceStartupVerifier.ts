
import { BackendIntegrationService } from './BackendIntegrationService';
import { ServiceStartupSequencer } from './startup/ServiceStartupSequencer';
import { ServiceHealthMonitor } from './health/ServiceHealthMonitor';
import { EnhancedErrorHandler } from './recovery/EnhancedErrorHandler';
import { ServiceVerifier } from './startup/ServiceVerifier';
import { StartupEventManager } from './startup/StartupEventManager';
import { SystemStartupReport } from './startup/types';

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
    StartupEventManager.setupEventListeners(
      (phaseData: any) => this.updateStartupPhase(phaseData),
      (healthData: any) => this.updateHealthStatus(healthData)
    );
  }

  private updateStartupPhase(phaseData: any): void {
    this.startupReport.currentPhase = this.startupSequencer.getCurrentPhase();
    StartupEventManager.emitPhaseUpdate(this.startupReport.currentPhase, phaseData.services);
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
      const serviceStatuses = await ServiceVerifier.verifyAllServices(this.healthMonitor);
      
      const runningCount = serviceStatuses.filter(s => s.status === 'running').length;
      const failedCount = serviceStatuses.filter(s => s.status === 'failed').length;
      
      this.startupReport = {
        overallStatus: ServiceVerifier.determineOverallStatus(runningCount, failedCount, serviceStatuses.length, this.healthMonitor),
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
      StartupEventManager.emitStartupComplete(this.startupReport);
      
      return this.startupReport;
      
    } catch (error) {
      console.error('Enhanced system startup verification failed:', error);
      
      this.startupReport.overallStatus = 'failed';
      StartupEventManager.emitStartupFailed(error, Date.now() - this.startupStartTime.getTime());
      
      return this.startupReport;
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
