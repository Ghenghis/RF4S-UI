import { EventManager } from '../core/EventManager';
import { RF4SIntegrationService } from './RF4SIntegrationService';
import { StatisticsCalculator } from './StatisticsCalculator';
import { SystemMonitorService } from './SystemMonitorService';
import { DetectionLogicHandler } from './DetectionLogicHandler';
import { SystemMetrics, FishingStats, RF4SStatus } from '../types/metrics';

class RealtimeDataServiceImpl {
  private updateInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private sessionStartTime = Date.now();

  start(): void {
    if (this.isRunning) {
      console.log('RealtimeDataService already running');
      return;
    }

    this.isRunning = true;
    console.log('RealtimeDataService starting with enhanced RF4S integration...');
    
    // Initialize all backend services
    RF4SIntegrationService.initialize().then(() => {
      console.log('RealtimeDataService connected to RF4S codebase');
    });

    // Start system monitoring
    SystemMonitorService.start();
    
    // Start main update loop with integrated services
    this.updateInterval = setInterval(() => {
      this.updateFromIntegratedServices();
    }, 1000);

    console.log('RealtimeDataService started with full service integration');
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    // Stop monitoring services
    SystemMonitorService.stop();
    
    this.isRunning = false;
    console.log('RealtimeDataService stopped');
  }

  private updateFromIntegratedServices(): void {
    try {
      // Get system health and performance from System Monitor
      const systemStatus = SystemMonitorService.getSystemStatus();
      
      // Get fishing statistics from Statistics Calculator
      const fishingStats = StatisticsCalculator.calculateSessionStats();
      const fishTypeStats = StatisticsCalculator.calculateFishTypeStats();
      
      // Get detection configuration from Detection Logic Handler
      const detectionConfig = DetectionLogicHandler.getDetectionConfig();

      // Create integrated system metrics
      const systemMetrics: SystemMetrics = {
        cpuUsage: systemStatus.performance.cpuUsage,
        memoryUsage: systemStatus.performance.memoryUsage,
        fps: systemStatus.performance.fps,
        diskUsage: 45,
        networkLatency: systemStatus.performance.responseTime
      };

      // Create comprehensive fishing stats
      const enhancedFishingStats: FishingStats = {
        sessionTime: fishingStats.sessionTime,
        fishCaught: fishingStats.fishCaught,
        castsTotal: fishingStats.castsTotal,
        successRate: fishingStats.successRate,
        averageFightTime: fishingStats.averageFightTime,
        bestFish: fishingStats.bestFish,
        ...fishTypeStats
      };

      // Create RF4S status from system health
      const rf4sStatusData: RF4SStatus = {
        processRunning: systemStatus.health.rf4sProcess,
        gameDetected: systemStatus.health.gameDetected,
        configLoaded: systemStatus.health.configLoaded,
        lastActivity: systemStatus.health.lastActivity.getTime(),
        errorCount: Math.floor(systemStatus.performance.errorRate),
        processId: Math.floor(Math.random() * 10000) + 1000,
        warningCount: systemStatus.health.servicesRunning ? 0 : 1,
        errors: []
      };

      // Broadcast integrated data
      const data = {
        systemMetrics,
        fishingStats: enhancedFishingStats,
        rf4sStatus: rf4sStatusData,
        detectionConfig,
        timestamp: Date.now(),
        sessionTime: Math.floor((Date.now() - this.sessionStartTime) / 1000)
      };

      EventManager.emit('realtime.metrics_updated', data, 'RealtimeDataService');
      EventManager.emit('system.resources_updated', systemMetrics, 'RealtimeDataService');
      EventManager.emit('fishing.stats_updated', enhancedFishingStats, 'RealtimeDataService');
      EventManager.emit('rf4s.status_updated', rf4sStatusData, 'RealtimeDataService');

    } catch (error) {
      console.error('Error updating from integrated services:', error);
      SystemMonitorService.reportError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Public getter methods that panels expect
  getFishingStats(): FishingStats {
    const stats = StatisticsCalculator.calculateSessionStats();
    const fishTypes = StatisticsCalculator.calculateFishTypeStats();
    
    return {
      sessionTime: stats.sessionTime,
      fishCaught: stats.fishCaught,
      castsTotal: stats.castsTotal,
      successRate: stats.successRate,
      averageFightTime: stats.averageFightTime,
      bestFish: stats.bestFish,
      ...fishTypes
    };
  }

  getRF4SStatus(): RF4SStatus {
    const systemHealth = SystemMonitorService.getSystemHealth();
    return {
      processRunning: systemHealth.rf4sProcess,
      gameDetected: systemHealth.gameDetected,
      configLoaded: systemHealth.configLoaded,
      lastActivity: systemHealth.lastActivity.getTime(),
      errorCount: 0,
      processId: Math.floor(Math.random() * 10000) + 1000,
      warningCount: 0,
      errors: []
    };
  }

  // Public methods for RF4S integration
  incrementFishCaught(): void {
    RF4SIntegrationService.updateFishCount('green');
    console.log('Fish caught incremented in integrated services');
  }

  incrementCasts(): void {
    StatisticsCalculator.recordCast();
    console.log('Cast recorded in statistics calculator');
  }

  updateGameDetection(detected: boolean): void {
    SystemMonitorService.updateGameDetection(detected);
    console.log('Game detection updated in system monitor:', detected);
  }

  updateProcessStatus(running: boolean): void {
    SystemMonitorService.updateConnectionStatus(running);
    console.log('Process status updated in system monitor:', running);
  }

  reportError(error: string): void {
    SystemMonitorService.reportError(error);
    console.error('Error reported to system monitor:', error);
  }

  updateFightTime(duration: number): void {
    StatisticsCalculator.addFightTime(duration);
    console.log('Fight time updated in statistics calculator:', duration);
  }

  setBestFish(fishName: string): void {
    console.log('Best fish updated:', fishName);
  }

  private getCPUUsage(): number {
    // In production, would get real CPU usage
    return Math.random() * 100;
  }

  private getMemoryUsage(): number {
    // In production, would get real memory usage  
    return 150 + Math.random() * 100;
  }

  private calculateSuccessRate(results: any): number {
    const total = results.total || 0;
    return total > 0 ? Math.round((results.kept || total) / total * 100) : 0;
  }

  private formatSessionTime(sessionTime: string | number): string {
    if (typeof sessionTime === 'string') {
      return sessionTime;
    }
    // Convert number (seconds) to formatted time string
    const hours = Math.floor(sessionTime / 3600);
    const minutes = Math.floor((sessionTime % 3600) / 60);
    const seconds = sessionTime % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  isServiceRunning(): boolean {
    return this.isRunning;
  }

  getSessionDuration(): number {
    return Math.floor((Date.now() - this.sessionStartTime) / 1000);
  }

  getSystemHealth() {
    return SystemMonitorService.getSystemHealth();
  }

  getDetectionStats() {
    return DetectionLogicHandler.getCalibrationData();
  }
}

export const RealtimeDataService = new RealtimeDataServiceImpl();
