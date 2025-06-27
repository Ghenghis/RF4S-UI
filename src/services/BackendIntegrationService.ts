import { EventManager } from '../core/EventManager';
import { ServiceOrchestrator } from './ServiceOrchestrator';
import { RealtimeDataService } from './RealtimeDataService';
import { ConfigValidationService } from './ConfigValidationService';
import { PerformanceOptimizationService } from './PerformanceOptimizationService';
import { ServiceIntegrationValidator } from './ServiceIntegrationValidator';

interface BackendStatus {
  servicesInitialized: boolean;
  totalServices: number;
  runningServices: number;
  healthyServices: number;
  lastHealthCheck: Date;
  integrationStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

class BackendIntegrationServiceImpl {
  private integrationStatus: BackendStatus = {
    servicesInitialized: false,
    totalServices: 0,
    runningServices: 0,
    healthyServices: 0,
    lastHealthCheck: new Date(),
    integrationStatus: 'connecting'
  };

  private healthCheckInterval: NodeJS.Timeout | null = null;

  async initialize(): Promise<void> {
    console.log('Backend Integration Service initializing...');
    
    try {
      // Initialize the service orchestrator
      await ServiceOrchestrator.initialize();
      
      // Start the service integration validator
      ServiceIntegrationValidator.start();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      // Setup event listeners for backend integration
      this.setupEventListeners();
      
      this.integrationStatus.servicesInitialized = true;
      this.integrationStatus.integrationStatus = 'connected';
      
      console.log('Backend Integration Service initialized successfully');
      
      // Emit initialization complete event
      EventManager.emit('backend.integration_complete', {
        status: this.integrationStatus,
        timestamp: new Date()
      }, 'BackendIntegrationService');
      
    } catch (error) {
      console.error('Failed to initialize backend integration:', error);
      this.integrationStatus.integrationStatus = 'error';
      
      EventManager.emit('backend.integration_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      }, 'BackendIntegrationService');
    }
  }

  private setupEventListeners(): void {
    // Listen for service health reports
    EventManager.subscribe('services.health_report', (data: any) => {
      this.updateHealthStatus(data);
    });

    // Listen for service errors
    EventManager.subscribe('service.error', (data: any) => {
      this.handleServiceError(data);
    });

    // Listen for configuration changes
    EventManager.subscribe('config.updated', (data: any) => {
      this.handleConfigurationChange(data);
    });

    // Listen for UI panel requests
    EventManager.subscribe('ui.panel_request', (data: any) => {
      this.handlePanelRequest(data);
    });
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 10000); // Every 10 seconds
  }

  private performHealthCheck(): void {
    const serviceStatus = ServiceOrchestrator.getServiceStatus();
    const runningCount = ServiceOrchestrator.getRunningServiceCount();
    
    this.integrationStatus = {
      ...this.integrationStatus,
      totalServices: serviceStatus.length,
      runningServices: runningCount,
      healthyServices: serviceStatus.filter(s => s.running && s.errorCount < 3).length,
      lastHealthCheck: new Date()
    };

    // Determine overall integration status
    if (this.integrationStatus.healthyServices === 0) {
      this.integrationStatus.integrationStatus = 'disconnected';
    } else if (this.integrationStatus.healthyServices < this.integrationStatus.totalServices * 0.8) {
      this.integrationStatus.integrationStatus = 'error';
    } else {
      this.integrationStatus.integrationStatus = 'connected';
    }

    // Emit health update
    EventManager.emit('backend.health_updated', this.integrationStatus, 'BackendIntegrationService');
  }

  private updateHealthStatus(data: any): void {
    this.integrationStatus.totalServices = data.totalServices || 0;
    this.integrationStatus.runningServices = data.healthyServices || 0;
    this.integrationStatus.healthyServices = data.healthyServices || 0;
  }

  private handleServiceError(data: any): void {
    console.error('Service error detected:', data.serviceName, data.error);
    
    // Attempt automatic recovery for critical services
    if (this.isCriticalService(data.serviceName)) {
      this.attemptServiceRecovery(data.serviceName);
    }
  }

  private handleConfigurationChange(data: any): void {
    // Propagate configuration changes to relevant services
    EventManager.emit('backend.config_propagated', {
      section: data.section,
      changes: data.changes,
      timestamp: new Date()
    }, 'BackendIntegrationService');
  }

  private handlePanelRequest(data: any): void {
    // Handle requests from UI panels for backend data
    switch (data.type) {
      case 'fishing_stats':
        const fishingStats = RealtimeDataService.getFishingStats();
        EventManager.emit('backend.fishing_stats_response', fishingStats, 'BackendIntegrationService');
        break;
      case 'system_status':
        EventManager.emit('backend.system_status_response', this.integrationStatus, 'BackendIntegrationService');
        break;
      case 'validation_status':
        const validationSummary = ConfigValidationService.getValidationSummary();
        EventManager.emit('backend.validation_status_response', validationSummary, 'BackendIntegrationService');
        break;
    }
  }

  private isCriticalService(serviceName: string): boolean {
    const criticalServices = [
      'RF4SIntegrationService',
      'RealtimeDataService',
      'SystemMonitorService',
      'ConfigValidationService'
    ];
    return criticalServices.includes(serviceName);
  }

  private async attemptServiceRecovery(serviceName: string): Promise<void> {
    console.log(`Attempting recovery for critical service: ${serviceName}`);
    
    try {
      // Use service orchestrator to restart the service
      await ServiceOrchestrator.restartAllServices();
      console.log(`Recovery attempted for service: ${serviceName}`);
    } catch (error) {
      console.error(`Failed to recover service ${serviceName}:`, error);
    }
  }

  getIntegrationStatus(): BackendStatus {
    return { ...this.integrationStatus };
  }

  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Stop the service integration validator
    ServiceIntegrationValidator.stop();
    
    await ServiceOrchestrator.shutdown();
    this.integrationStatus.integrationStatus = 'disconnected';
    
    console.log('Backend Integration Service shutdown complete');
  }

  // Public methods for UI integration
  requestFishingStats(): void {
    EventManager.emit('ui.panel_request', { type: 'fishing_stats' }, 'UI');
  }

  requestSystemStatus(): void {
    EventManager.emit('ui.panel_request', { type: 'system_status' }, 'UI');
  }

  requestValidationStatus(): void {
    EventManager.emit('ui.panel_request', { type: 'validation_status' }, 'UI');
  }
}

export const BackendIntegrationService = new BackendIntegrationServiceImpl();
