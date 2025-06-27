import { EventManager } from '../core/EventManager';
import { RF4SBridgeInterface } from './RF4SBridgeInterface';
import { RF4SDetectionService } from './RF4SDetectionService';

interface SystemHealth {
  rf4sProcess: boolean;
  gameDetected: boolean;
  configLoaded: boolean;
  servicesRunning: boolean;
  connectionStable: boolean;
  lastActivity: Date;
}

interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  fps: number;
  responseTime: number;
  errorRate: number;
}

class SystemMonitorServiceImpl {
  private monitorInterval: NodeJS.Timeout | null = null;
  private healthChecks: SystemHealth = {
    rf4sProcess: false,
    gameDetected: false,
    configLoaded: false,
    servicesRunning: false,
    connectionStable: false,
    lastActivity: new Date()
  };
  private performanceMetrics: PerformanceMetrics = {
    cpuUsage: 0,
    memoryUsage: 0,
    fps: 0,
    responseTime: 0,
    errorRate: 0
  };
  private errorCount: number = 0;
  private totalRequests: number = 0;

  start(): void {
    console.log('System Monitor Service started');
    
    this.monitorInterval = setInterval(() => {
      this.performHealthCheck();
      this.updatePerformanceMetrics();
    }, 2000);

    this.setupEventListeners();
  }

  stop(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    console.log('System Monitor Service stopped');
  }

  startMonitoring(): void {
    this.start();
  }

  stopMonitoring(): void {
    this.stop();
  }

  private setupEventListeners(): void {
    // Monitor RF4S connection status
    EventManager.subscribe('rf4s.connected', () => {
      this.updateHealthStatus('rf4sProcess', true);
      this.updateHealthStatus('connectionStable', true);
    });

    EventManager.subscribe('rf4s.disconnected', () => {
      this.updateHealthStatus('rf4sProcess', false);
      this.updateHealthStatus('connectionStable', false);
    });

    // Monitor game detection
    EventManager.subscribe('game.detected', () => {
      this.updateHealthStatus('gameDetected', true);
    });

    // Monitor detection activity
    EventManager.subscribe('rf4s.detection_result', () => {
      this.healthChecks.lastActivity = new Date();
    });

    // Monitor errors
    EventManager.subscribe('system.error', () => {
      this.errorCount++;
    });
  }

  private performHealthCheck(): void {
    // Check RF4S bridge connection
    const connection = RF4SBridgeInterface.getConnection();
    this.updateHealthStatus('rf4sProcess', connection.status === 'connected');
    this.updateHealthStatus('connectionStable', connection.lastPing !== null);

    // Check game detection service
    const gameDetected = RF4SDetectionService.isGameDetected();
    this.updateHealthStatus('gameDetected', gameDetected);

    // Check services running
    this.updateHealthStatus('servicesRunning', this.areServicesHealthy());

    // Check config loaded
    this.updateHealthStatus('configLoaded', true); // Always true if we got this far

    // Emit health status
    EventManager.emit('system.health_updated', this.healthChecks, 'SystemMonitorService');
  }

  private updatePerformanceMetrics(): void {
    // Simulate performance metrics (in production, would get real values)
    this.performanceMetrics = {
      cpuUsage: this.getCPUUsage(),
      memoryUsage: this.getMemoryUsage(),
      fps: this.getFPS(),
      responseTime: this.getResponseTime(),
      errorRate: this.calculateErrorRate()
    };

    EventManager.emit('system.performance_updated', this.performanceMetrics, 'SystemMonitorService');
  }

  private areServicesHealthy(): boolean {
    // Check if critical services are running
    return this.healthChecks.rf4sProcess && this.healthChecks.configLoaded;
  }

  private getCPUUsage(): number {
    // Simulate CPU usage based on activity
    const baseUsage = 15 + Math.random() * 10;
    const activityBonus = this.healthChecks.rf4sProcess ? 20 : 0;
    return Math.min(100, Math.round(baseUsage + activityBonus + Math.random() * 15));
  }

  private getMemoryUsage(): number {
    // Simulate memory usage
    const baseMemory = 120;
    const serviceMemory = this.healthChecks.servicesRunning ? 80 : 20;
    return Math.round(baseMemory + serviceMemory + Math.random() * 50);
  }

  private getFPS(): number {
    // Simulate FPS based on system health
    if (!this.healthChecks.gameDetected) return 0;
    return this.healthChecks.connectionStable ? 58 + Math.random() * 4 : 30 + Math.random() * 20;
  }

  private getResponseTime(): number {
    // Simulate response time
    const baseTime = this.healthChecks.connectionStable ? 5 : 50;
    return Math.round(baseTime + Math.random() * 20);
  }

  private calculateErrorRate(): number {
    this.totalRequests++;
    return this.totalRequests > 0 ? Math.round((this.errorCount / this.totalRequests) * 100) : 0;
  }

  private updateHealthStatus(key: keyof SystemHealth, value: boolean | Date): void {
    if (key === 'lastActivity' && value instanceof Date) {
      this.healthChecks[key] = value;
    } else if (typeof value === 'boolean') {
      (this.healthChecks as any)[key] = value;
    }
  }

  getSystemHealth(): SystemHealth {
    return { ...this.healthChecks };
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  getSystemStatus(): { health: SystemHealth; performance: PerformanceMetrics } {
    return {
      health: this.getSystemHealth(),
      performance: this.getPerformanceMetrics()
    };
  }

  reportError(error: string): void {
    this.errorCount++;
    console.error('System Monitor - Error reported:', error);
    EventManager.emit('system.error', { error, timestamp: new Date() }, 'SystemMonitorService');
  }

  updateConnectionStatus(connected: boolean): void {
    this.updateHealthStatus('connectionStable', connected);
    this.updateHealthStatus('rf4sProcess', connected);
  }

  updateGameDetection(detected: boolean): void {
    this.updateHealthStatus('gameDetected', detected);
  }
}

export const SystemMonitorService = new SystemMonitorServiceImpl();
