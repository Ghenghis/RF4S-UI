import { EventManager } from '../../core/EventManager';
import { createRichLogger } from '../../rf4s/utils';

interface MemorySnapshot {
  timestamp: Date;
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  arrayBuffers: number;
}

interface MemoryThresholds {
  warning: number;
  critical: number;
  cleanup: number;
}

export class MemoryManagementService {
  private logger = createRichLogger('MemoryManagementService');
  private snapshots: MemorySnapshot[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;
  
  private thresholds: MemoryThresholds = {
    warning: 100 * 1024 * 1024,   // 100MB
    critical: 200 * 1024 * 1024,  // 200MB
    cleanup: 150 * 1024 * 1024    // 150MB
  };

  private registeredCleanupTasks: Map<string, () => Promise<void>> = new Map();

  start(): void {
    if (this.isMonitoring) return;

    this.logger.info('Starting Memory Management Service...');
    this.isMonitoring = true;

    // Monitor memory usage every 10 seconds
    this.monitoringInterval = setInterval(() => {
      this.captureMemorySnapshot();
    }, 10000);

    // Run cleanup tasks every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.performCleanupTasks();
    }, 30000);

    this.setupEventListeners();
  }

  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.isMonitoring = false;
    this.logger.info('Memory Management Service stopped');
  }

  private setupEventListeners(): void {
    EventManager.subscribe('system.memory_pressure', async () => {
      await this.handleMemoryPressure();
    });

    EventManager.subscribe('application.beforeunload', async () => {
      await this.performEmergencyCleanup();
    });
  }

  private captureMemorySnapshot(): void {
    try {
      // Simulate memory usage (in production, would use actual memory APIs)
      const snapshot: MemorySnapshot = {
        timestamp: new Date(),
        heapUsed: this.getSimulatedMemoryUsage(),
        heapTotal: 256 * 1024 * 1024, // 256MB
        external: 10 * 1024 * 1024,   // 10MB
        rss: this.getSimulatedMemoryUsage() + 50 * 1024 * 1024,
        arrayBuffers: 2 * 1024 * 1024  // 2MB
      };

      this.snapshots.push(snapshot);
      
      // Keep only last 100 snapshots
      if (this.snapshots.length > 100) {
        this.snapshots = this.snapshots.slice(-100);
      }

      this.checkMemoryThresholds(snapshot);

      EventManager.emit('memory.snapshot_captured', {
        snapshot,
        trend: this.calculateMemoryTrend()
      }, 'MemoryManagementService');

    } catch (error) {
      this.logger.error('Failed to capture memory snapshot:', error);
    }
  }

  private getSimulatedMemoryUsage(): number {
    // Simulate memory usage that grows over time with some cleanup cycles
    const baseUsage = 80 * 1024 * 1024; // 80MB base
    const variableUsage = Math.random() * 100 * 1024 * 1024; // Up to 100MB variable
    return baseUsage + variableUsage;
  }

  private checkMemoryThresholds(snapshot: MemorySnapshot): void {
    if (snapshot.heapUsed >= this.thresholds.critical) {
      this.logger.error(`Critical memory usage: ${(snapshot.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      
      EventManager.emit('memory.critical_threshold_exceeded', {
        usage: snapshot.heapUsed,
        threshold: this.thresholds.critical,
        timestamp: snapshot.timestamp
      }, 'MemoryManagementService');

      this.handleMemoryPressure();

    } else if (snapshot.heapUsed >= this.thresholds.warning) {
      this.logger.warning(`High memory usage: ${(snapshot.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      
      EventManager.emit('memory.warning_threshold_exceeded', {
        usage: snapshot.heapUsed,
        threshold: this.thresholds.warning,
        timestamp: snapshot.timestamp
      }, 'MemoryManagementService');
    }
  }

  private calculateMemoryTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.snapshots.length < 5) return 'stable';

    const recent = this.snapshots.slice(-5);
    const older = this.snapshots.slice(-10, -5);

    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, s) => sum + s.heapUsed, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.heapUsed, 0) / older.length;

    const threshold = 5 * 1024 * 1024; // 5MB threshold

    if (recentAvg > olderAvg + threshold) return 'increasing';
    if (recentAvg < olderAvg - threshold) return 'decreasing';
    return 'stable';
  }

  private async handleMemoryPressure(): Promise<void> {
    this.logger.warning('Handling memory pressure - performing aggressive cleanup');

    try {
      // Run all cleanup tasks
      await this.performCleanupTasks();

      // Clear old snapshots more aggressively
      this.snapshots = this.snapshots.slice(-20);

      // Request garbage collection if available
      if (typeof window !== 'undefined' && 'gc' in window) {
        (window as any).gc();
      }

      EventManager.emit('memory.pressure_handled', {
        timestamp: new Date(),
        cleanupTasks: this.registeredCleanupTasks.size
      }, 'MemoryManagementService');

    } catch (error) {
      this.logger.error('Failed to handle memory pressure:', error);
    }
  }

  private async performCleanupTasks(): Promise<void> {
    for (const [taskName, cleanupTask] of this.registeredCleanupTasks.entries()) {
      try {
        await cleanupTask();
        this.logger.info(`Cleanup task completed: ${taskName}`);
      } catch (error) {
        this.logger.error(`Cleanup task failed: ${taskName}`, error);
      }
    }
  }

  private async performEmergencyCleanup(): Promise<void> {
    this.logger.info('Performing emergency cleanup before application close');
    
    await this.performCleanupTasks();
    
    // Clear all data structures
    this.snapshots = [];
    this.registeredCleanupTasks.clear();
  }

  registerCleanupTask(name: string, task: () => Promise<void>): void {
    this.registeredCleanupTasks.set(name, task);
    this.logger.info(`Cleanup task registered: ${name}`);
  }

  unregisterCleanupTask(name: string): void {
    this.registeredCleanupTasks.delete(name);
    this.logger.info(`Cleanup task unregistered: ${name}`);
  }

  getMemoryStats(): {
    current: MemorySnapshot | null;
    trend: 'increasing' | 'decreasing' | 'stable';
    averageUsage: number;
    peakUsage: number;
    registeredCleanupTasks: number;
  } {
    const current = this.snapshots.length > 0 ? this.snapshots[this.snapshots.length - 1] : null;
    const trend = this.calculateMemoryTrend();
    
    let averageUsage = 0;
    let peakUsage = 0;

    if (this.snapshots.length > 0) {
      averageUsage = this.snapshots.reduce((sum, s) => sum + s.heapUsed, 0) / this.snapshots.length;
      peakUsage = Math.max(...this.snapshots.map(s => s.heapUsed));
    }

    return {
      current,
      trend,
      averageUsage,
      peakUsage,
      registeredCleanupTasks: this.registeredCleanupTasks.size
    };
  }

  forceGarbageCollection(): void {
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
      this.logger.info('Forced garbage collection executed');
    } else {
      this.logger.warning('Garbage collection not available');
    }
  }
}

export const memoryManagementService = new MemoryManagementService();
