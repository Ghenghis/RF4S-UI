
import { EventManager } from '../../core/EventManager';
import { RF4SBridgeInterface } from '../RF4SBridgeInterface';
import { createRichLogger } from '../../rf4s/utils';

interface ProcessHealth {
  processId: number | null;
  isHealthy: boolean;
  cpuUsage: number;
  memoryUsage: number;
  responseTime: number;
  lastHeartbeat: Date;
  consecutiveFailures: number;
}

export class ProcessHealthMonitor {
  private logger = createRichLogger('ProcessHealthMonitor');
  private processHealth: ProcessHealth = {
    processId: null,
    isHealthy: false,
    cpuUsage: 0,
    memoryUsage: 0,
    responseTime: 0,
    lastHeartbeat: new Date(),
    consecutiveFailures: 0
  };
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;
  private maxConsecutiveFailures = 3;
  private healthCheckInterval = 5000; // 5 seconds

  start(): void {
    if (this.isMonitoring) return;

    this.logger.info('ProcessHealthMonitor: Starting health monitoring...');
    this.isMonitoring = true;

    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.healthCheckInterval);

    EventManager.emit('process_health.monitoring_started', {
      interval: this.healthCheckInterval,
      timestamp: Date.now()
    }, 'ProcessHealthMonitor');
  }

  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    this.logger.info('ProcessHealthMonitor: Stopped');
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Check RF4S bridge connection
      const connection = RF4SBridgeInterface.getConnection();
      const responseTime = Date.now() - startTime;

      if (connection.status === 'connected') {
        // Successful health check
        this.processHealth = {
          processId: connection.processId,
          isHealthy: true,
          cpuUsage: 15 + Math.random() * 30, // Simulated values
          memoryUsage: 120 + Math.random() * 100,
          responseTime,
          lastHeartbeat: new Date(),
          consecutiveFailures: 0
        };

        if (this.processHealth.consecutiveFailures > 0) {
          // Recovery detected
          EventManager.emit('process_health.recovered', {
            processId: this.processHealth.processId,
            downtime: this.processHealth.consecutiveFailures * this.healthCheckInterval,
            timestamp: Date.now()
          }, 'ProcessHealthMonitor');
        }

      } else {
        // Failed health check
        this.processHealth.consecutiveFailures++;
        this.processHealth.isHealthy = false;
        this.processHealth.responseTime = responseTime;

        if (this.processHealth.consecutiveFailures >= this.maxConsecutiveFailures) {
          // Process is considered unhealthy
          this.handleUnhealthyProcess();
        }
      }

      // Emit health status
      EventManager.emit('process_health.status_updated', {
        health: this.processHealth,
        timestamp: Date.now()
      }, 'ProcessHealthMonitor');

    } catch (error) {
      this.logger.error('Health check failed:', error);
      this.processHealth.consecutiveFailures++;
      this.processHealth.isHealthy = false;
    }
  }

  private async handleUnhealthyProcess(): Promise<void> {
    this.logger.warning(`Process unhealthy: ${this.processHealth.consecutiveFailures} consecutive failures`);

    EventManager.emit('process_health.unhealthy_detected', {
      processId: this.processHealth.processId,
      failures: this.processHealth.consecutiveFailures,
      timestamp: Date.now()
    }, 'ProcessHealthMonitor');

    // Attempt automatic reconnection
    await this.attemptReconnection();
  }

  private async attemptReconnection(): Promise<void> {
    this.logger.info('Attempting automatic reconnection...');

    try {
      const reconnected = await RF4SBridgeInterface.connect();
      
      if (reconnected) {
        this.logger.info('Automatic reconnection successful');
        this.processHealth.consecutiveFailures = 0;
        this.processHealth.isHealthy = true;
        
        EventManager.emit('process_health.reconnection_successful', {
          timestamp: Date.now()
        }, 'ProcessHealthMonitor');
      } else {
        this.logger.error('Automatic reconnection failed');
        
        EventManager.emit('process_health.reconnection_failed', {
          attempt: this.processHealth.consecutiveFailures,
          timestamp: Date.now()
        }, 'ProcessHealthMonitor');
      }
    } catch (error) {
      this.logger.error('Reconnection attempt error:', error);
    }
  }

  getProcessHealth(): ProcessHealth {
    return { ...this.processHealth };
  }

  isProcessHealthy(): boolean {
    return this.processHealth.isHealthy && 
           this.processHealth.consecutiveFailures < this.maxConsecutiveFailures;
  }

  getHealthSummary() {
    return {
      healthy: this.processHealth.isHealthy,
      processId: this.processHealth.processId,
      uptime: Date.now() - this.processHealth.lastHeartbeat.getTime(),
      responseTime: this.processHealth.responseTime,
      failureCount: this.processHealth.consecutiveFailures
    };
  }

  // Manual recovery method
  async forceReconnection(): Promise<boolean> {
    this.logger.info('Manual reconnection requested');
    return await this.attemptReconnection();
  }
}

export const processHealthMonitor = new ProcessHealthMonitor();
