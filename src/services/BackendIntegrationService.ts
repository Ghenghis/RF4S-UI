import { EventManager } from '../core/EventManager';
import { ServiceOrchestrator } from './ServiceOrchestrator';
import { ServiceIntegrationValidator } from './ServiceIntegrationValidator';
import { BackendStatus } from './backend/types';
import { HealthMonitor } from './backend/HealthMonitor';
import { EventHandler } from './backend/EventHandler';
import { UIIntegration } from './backend/UIIntegration';

class BackendIntegrationServiceImpl {
  private integrationStatus: BackendStatus = {
    servicesInitialized: false,
    totalServices: 0,
    runningServices: 0,
    healthyServices: 0,
    lastHealthCheck: new Date(),
    integrationStatus: 'connecting'
  };

  private healthMonitor: HealthMonitor;
  private eventHandler: EventHandler;
  private uiIntegration: UIIntegration;

  constructor() {
    this.healthMonitor = new HealthMonitor(this.integrationStatus);
    this.eventHandler = new EventHandler();
    this.uiIntegration = new UIIntegration();
  }

  async initialize(): Promise<void> {
    console.log('Backend Integration Service initializing...');
    
    try {
      // Initialize the service orchestrator
      await ServiceOrchestrator.initializeAllServices();
      
      // Start the service integration validator
      ServiceIntegrationValidator.start();
      
      // Start health monitoring
      this.healthMonitor.startHealthMonitoring();
      
      // Setup event listeners for backend integration
      this.eventHandler.setupEventListeners();
      
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

  getIntegrationStatus(): BackendStatus {
    return this.healthMonitor.getStatus();
  }

  async shutdown(): Promise<void> {
    this.healthMonitor.stopHealthMonitoring();

    // Stop the service integration validator
    ServiceIntegrationValidator.stop();
    
    await ServiceOrchestrator.shutdownAllServices();
    this.integrationStatus.integrationStatus = 'disconnected';
    
    console.log('Backend Integration Service shutdown complete');
  }

  // Delegate UI integration methods
  requestFishingStats(): void {
    this.uiIntegration.requestFishingStats();
  }

  requestSystemStatus(): void {
    this.uiIntegration.requestSystemStatus();
  }

  requestValidationStatus(): void {
    this.uiIntegration.requestValidationStatus();
  }
}

export const BackendIntegrationService = new BackendIntegrationServiceImpl();
