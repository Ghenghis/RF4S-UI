
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
    startupTime: 0,
    startTime: new Date(),
    endTime: new Date(),
    totalDuration: 0,
    phasesCompleted: 0,
    totalPhases: 7,
    servicesInitialized: 0,
    phaseReports: []
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
    this.startupReport.phasesCompleted = this.startupReport.currentPhase.phase;
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
    console.log('Service Startup Verifier: Beginning real startup verification...');
    this.startupStartTime = new Date();
    this.startupReport.startTime = this.startupStartTime;

    try {
      // Start health monitoring immediately
      this.healthMonitor.start();
      
      // Initialize backend integration service (real initialization)
      console.log('Initializing Backend Integration Service...');
      await BackendIntegrationService.initialize();
      
      // Execute real startup sequence
      console.log('Executing startup sequence...');
      await this.startupSequencer.executeStartupSequence();
      
      // Perform comprehensive verification
      console.log('Verifying all services...');
      const serviceVerificationResults = await ServiceVerifier.verifyAllServices();
      
      // Convert verification results to startup status format
      const serviceStatuses = serviceVerificationResults.map(result => ({
        serviceName: result.serviceName,
        status: result.status === 'error' ? 'failed' as const : 
               result.status === 'running' ? 'running' as const : 'stopped' as const,
        startTime: result.startTime || null,
        error: result.errors?.join(', '),
        phase: 'completed',
        healthStatus: result.isHealthy ? 'healthy' as const : 'critical' as const
      }));
      
      const runningCount = serviceStatuses.filter(s => s.status === 'running').length;
      const failedCount = serviceStatuses.filter(s => s.status === 'failed').length;
      
      this.startupReport = {
        ...this.startupReport,
        overallStatus: ServiceVerifier.determineOverallStatus(runningCount, failedCount, serviceStatuses.length),
        totalServices: serviceStatuses.length,
        runningServices: runningCount,
        failedServices: failedCount,
        serviceStatuses,
        servicesInitialized: runningCount,
        startupTime: Date.now() - this.startupStartTime.getTime(),
        endTime: new Date(),
        totalDuration: Date.now() - this.startupStartTime.getTime(),
        phasesCompleted: this.startupReport.totalPhases,
        currentPhase: this.startupSequencer.getCurrentPhase(),
        healthSummary: this.healthMonitor.getHealthSummary()
      };

      console.log('Real Service Startup Verification Complete:', this.startupReport);
      
      // Emit startup complete event
      StartupEventManager.emitStartupComplete(this.startupReport);
      
      return this.startupReport;
      
    } catch (error) {
      console.error('Real system startup verification failed:', error);
      
      this.startupReport.overallStatus = 'failed';
      this.startupReport.endTime = new Date();
      this.startupReport.totalDuration = Date.now() - this.startupStartTime.getTime();
      
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
