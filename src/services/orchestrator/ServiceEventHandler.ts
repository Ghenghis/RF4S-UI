
import { EventManager } from '../../core/EventManager';
import { createRichLogger } from '../../rf4s/utils';
import { ServiceStatusManager } from './ServiceStatusManager';

export class ServiceEventHandler {
  private logger = createRichLogger('ServiceEventHandler');
  private statusManager: ServiceStatusManager;

  constructor(statusManager: ServiceStatusManager) {
    this.statusManager = statusManager;
  }

  setupEventListeners(): void {
    // Listen for service events
    EventManager.subscribe('service.*', (data: any) => {
      this.handleServiceEvent(data);
    });

    // Listen for restart requests from error boundary
    EventManager.subscribe('service.restart.request', async (data: any) => {
      await this.handleServiceRestart(data.serviceName);
    });
  }

  private handleServiceEvent(data: any): void {
    if (!data.serviceName) return;

    const serviceName = data.serviceName;
    
    if (data.eventType === 'started') {
      this.statusManager.updateServiceStatus(serviceName, 'running', 'healthy');
    } else if (data.eventType === 'stopped') {
      this.statusManager.updateServiceStatus(serviceName, 'stopped', 'unknown');
    } else if (data.eventType === 'error') {
      this.statusManager.updateServiceStatus(serviceName, 'error', 'unhealthy');
    }
  }

  private async handleServiceRestart(serviceName: string): Promise<void> {
    try {
      this.logger.info(`Restarting service: ${serviceName}`);
      
      // Update status to restarting
      this.statusManager.updateServiceStatus(serviceName, 'initializing', 'unknown');
      
      // Simulate service restart
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.statusManager.updateServiceStatus(serviceName, 'running', 'healthy');
      
      EventManager.emit('service.restarted', {
        serviceName,
        timestamp: new Date()
      }, 'ServiceOrchestrator');
      
    } catch (error) {
      this.logger.error(`Failed to restart service ${serviceName}:`, error);
      this.statusManager.updateServiceStatus(serviceName, 'error', 'unhealthy');
      
      // Import here to avoid circular dependency
      const { serviceErrorBoundary } = await import('../../core/ServiceErrorBoundary');
      await serviceErrorBoundary.handleServiceError(serviceName, error as Error);
    }
  }
}
