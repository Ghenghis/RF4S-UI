
import { EventManager } from '../core/EventManager';
import { RealtimeDataService } from './RealtimeDataService';
import { SystemMonitorService } from './SystemMonitorService';
import { RF4SIntegrationService } from './RF4SIntegrationService';
import { ConfigValidationService } from './ConfigValidationService';
import { PerformanceOptimizationService } from './PerformanceOptimizationService';
import { ErrorRecoveryService } from './ErrorRecoveryService';
import { StatisticsCalculator } from './StatisticsCalculator';
import { DetectionLogicHandler } from './DetectionLogicHandler';
import { ProfileLogicManager } from './ProfileLogicManager';
import { FishingModeLogic } from './FishingModeLogic';

interface ServiceStatus {
  name: string;
  running: boolean;
  startTime: Date | null;
  lastActivity: Date | null;
  errorCount: number;
}

class ServiceOrchestratorImpl {
  private services: Map<string, any> = new Map();
  private serviceStatuses: Map<string, ServiceStatus> = new Map();
  private orchestrationInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Service Orchestrator already initialized');
      return;
    }

    console.log('Service Orchestrator initializing all backend services...');

    // Register all services
    this.registerServices();

    // Start core services first
    await this.startCoreServices();

    // Start enhancement services
    this.startEnhancementServices();

    // Start orchestration monitoring
    this.startOrchestration();

    this.isInitialized = true;
    console.log('Service Orchestrator: All services initialized and running');

    // Emit initialization complete
    EventManager.emit('services.initialized', {
      totalServices: this.services.size,
      runningServices: this.getRunningServiceCount(),
      timestamp: new Date()
    }, 'ServiceOrchestrator');
  }

  private registerServices(): void {
    // Core services
    this.services.set('RealtimeDataService', RealtimeDataService);
    this.services.set('SystemMonitorService', SystemMonitorService);
    this.services.set('RF4SIntegrationService', RF4SIntegrationService);
    
    // Enhancement services
    this.services.set('ConfigValidationService', ConfigValidationService);
    this.services.set('PerformanceOptimizationService', PerformanceOptimizationService);
    this.services.set('ErrorRecoveryService', ErrorRecoveryService);
    this.services.set('StatisticsCalculator', StatisticsCalculator);
    this.services.set('DetectionLogicHandler', DetectionLogicHandler);
    this.services.set('ProfileLogicManager', ProfileLogicManager);
    this.services.set('FishingModeLogic', FishingModeLogic);

    // Initialize service statuses
    this.services.forEach((service, name) => {
      this.serviceStatuses.set(name, {
        name,
        running: false,
        startTime: null,
        lastActivity: null,
        errorCount: 0
      });
    });
  }

  private async startCoreServices(): Promise<void> {
    console.log('Starting core services...');

    // Start in dependency order
    await this.startService('SystemMonitorService');
    await this.startService('RF4SIntegrationService');
    await this.startService('RealtimeDataService');
  }

  private startEnhancementServices(): void {
    console.log('Starting enhancement services...');

    // Start enhancement services
    this.startService('ConfigValidationService');
    this.startService('PerformanceOptimizationService');
    this.startService('ErrorRecoveryService');
    this.startService('StatisticsCalculator');
    this.startService('DetectionLogicHandler');
    this.startService('ProfileLogicManager');
    this.startService('FishingModeLogic');
  }

  private async startService(serviceName: string): Promise<void> {
    const service = this.services.get(serviceName);
    const status = this.serviceStatuses.get(serviceName);
    
    if (!service || !status) {
      console.error('Service not found:', serviceName);
      return;
    }

    try {
      console.log(`Starting service: ${serviceName}`);
      
      if (service.initialize) {
        await service.initialize();
      } else if (service.start) {
        service.start();
      }

      status.running = true;
      status.startTime = new Date();
      status.lastActivity = new Date();
      
      console.log(`Service started successfully: ${serviceName}`);
      
      // Emit service started event
      EventManager.emit('service.started', {
        serviceName,
        timestamp: new Date()
      }, 'ServiceOrchestrator');

    } catch (error) {
      console.error(`Failed to start service ${serviceName}:`, error);
      status.errorCount++;
      
      // Emit service error event
      EventManager.emit('service.error', {
        serviceName,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      }, 'ServiceOrchestrator');
    }
  }

  private startOrchestration(): void {
    // Monitor services every 30 seconds
    this.orchestrationInterval = setInterval(() => {
      this.monitorServices();
    }, 30000);

    // Setup event listeners for service health
    this.setupServiceMonitoring();
  }

  private setupServiceMonitoring(): void {
    // Listen for service errors
    EventManager.subscribe('service.error', (data) => {
      this.handleServiceError(data.serviceName, data.error);
    });

    // Listen for system errors that might affect services
    EventManager.subscribe('system.error', (data) => {
      this.handleSystemError(data.error);
    });
  }

  private monitorServices(): void {
    let healthyServices = 0;
    let unhealthyServices = 0;

    this.serviceStatuses.forEach((status, serviceName) => {
      if (status.running) {
        healthyServices++;
        status.lastActivity = new Date();
      } else {
        unhealthyServices++;
        console.warn(`Service ${serviceName} is not running`);
      }
    });

    // Emit health report
    EventManager.emit('services.health_report', {
      totalServices: this.services.size,
      healthyServices,
      unhealthyServices,
      timestamp: new Date()
    }, 'ServiceOrchestrator');

    console.log(`Service Health: ${healthyServices}/${this.services.size} services running`);
  }

  private handleServiceError(serviceName: string, error: string): void {
    const status = this.serviceStatuses.get(serviceName);
    if (status) {
      status.errorCount++;
      console.error(`Service error in ${serviceName}:`, error);

      // Attempt service restart if error count is manageable
      if (status.errorCount < 3) {
        console.log(`Attempting to restart service: ${serviceName}`);
        this.restartService(serviceName);
      } else {
        console.error(`Service ${serviceName} has too many errors, stopping restart attempts`);
        status.running = false;
      }
    }
  }

  private handleSystemError(error: string): void {
    console.log('System error detected, checking service health:', error);
    
    // Check if any services need attention
    this.monitorServices();
  }

  private async restartService(serviceName: string): Promise<void> {
    const service = this.services.get(serviceName);
    const status = this.serviceStatuses.get(serviceName);
    
    if (!service || !status) return;

    try {
      // Stop service if it has a stop method
      if (service.stop) {
        service.stop();
      }

      // Wait a bit before restarting
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Restart service
      await this.startService(serviceName);
      
      console.log(`Service restarted successfully: ${serviceName}`);
      
    } catch (error) {
      console.error(`Failed to restart service ${serviceName}:`, error);
      status.running = false;
    }
  }

  async shutdown(): Promise<void> {
    console.log('Service Orchestrator shutting down all services...');

    if (this.orchestrationInterval) {
      clearInterval(this.orchestrationInterval);
      this.orchestrationInterval = null;
    }

    // Stop services in reverse dependency order
    const serviceNames = Array.from(this.services.keys()).reverse();
    
    for (const serviceName of serviceNames) {
      await this.stopService(serviceName);
    }

    this.isInitialized = false;
    console.log('Service Orchestrator: All services shutdown complete');
  }

  private async stopService(serviceName: string): Promise<void> {
    const service = this.services.get(serviceName);
    const status = this.serviceStatuses.get(serviceName);
    
    if (!service || !status || !status.running) return;

    try {
      console.log(`Stopping service: ${serviceName}`);
      
      if (service.stop) {
        service.stop();
      } else if (service.destroy) {
        service.destroy();
      }

      status.running = false;
      status.startTime = null;
      
      console.log(`Service stopped: ${serviceName}`);
      
    } catch (error) {
      console.error(`Error stopping service ${serviceName}:`, error);
    }
  }

  getServiceStatus(): Array<ServiceStatus> {
    return Array.from(this.serviceStatuses.values());
  }

  getRunningServiceCount(): number {
    return Array.from(this.serviceStatuses.values()).filter(s => s.running).length;
  }

  isServiceRunning(serviceName: string): boolean {
    const status = this.serviceStatuses.get(serviceName);
    return status?.running || false;
  }

  async restartAllServices(): Promise<void> {
    console.log('Restarting all services...');
    
    await this.shutdown();
    await this.initialize();
    
    console.log('All services restarted');
  }
}

export const ServiceOrchestrator = new ServiceOrchestratorImpl();
