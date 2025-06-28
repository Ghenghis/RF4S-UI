import { EventManager } from '../core/EventManager';
import { RF4SIntegrationService } from './RF4SIntegrationService';
import { StatisticsCalculator } from './StatisticsCalculator';
import { SystemMonitorService } from './SystemMonitorService';
import { DetectionLogicHandler } from './DetectionLogicHandler';
import { SystemMetrics, FishingStats, RF4SStatus } from '../types/metrics';
import { WebSocketManager } from './realtime/WebSocketManager';
import { SystemMetricsCollector } from './realtime/SystemMetricsCollector';
import { DataBroadcaster } from './realtime/DataBroadcaster';

class RealtimeDataServiceImpl {
  private updateInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private webSocketManager = new WebSocketManager();
  private metricsCollector = new SystemMetricsCollector();
  private dataBroadcaster = new DataBroadcaster();

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
      this.webSocketManager.establishConnection();
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
    
    this.webSocketManager.closeConnection();
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

      // Create integrated system metrics with performance data collection
      const systemMetrics = this.metricsCollector.createSystemMetrics(systemStatus);

      // Create comprehensive fishing stats
      const enhancedFishingStats: FishingStats = {
        sessionTime: typeof fishingStats.sessionTime === 'string' ? 0 : fishingStats.sessionTime,
        fishCaught: fishingStats.fishCaught,
        castsTotal: fishingStats.castsTotal || 0,
        successRate: fishingStats.successRate,
        averageFightTime: fishingStats.averageFightTime,
        bestFish: fishingStats.bestFish,
        greenFish: fishTypeStats.green,
        yellowFish: fishTypeStats.yellow,
        blueFish: fishTypeStats.blue,
        purpleFish: fishTypeStats.purple,
        pinkFish: fishTypeStats.pink,
        totalCasts: fishingStats.castsTotal || 0,
        successfulCasts: fishingStats.fishCaught,
        averageWeight: this.metricsCollector.calculateAverageWeight()
      };

      // Create RF4S status with real process monitoring
      const rf4sStatusData: RF4SStatus = {
        processRunning: systemStatus.health.rf4sProcess,
        gameDetected: systemStatus.health.gameDetected,
        configLoaded: systemStatus.health.configLoaded,
        lastActivity: systemStatus.health.lastActivity.getTime(),
        errorCount: Math.floor(systemStatus.performance.errorRate),
        processId: this.metricsCollector.getProcessId(),
        warningCount: systemStatus.health.servicesRunning ? 0 : 1,
        errors: this.metricsCollector.collectSystemErrors(),
        connected: systemStatus.health.connectionStable
      };

      // Broadcast integrated data with WebSocket support
      const data = {
        systemMetrics,
        fishingStats: enhancedFishingStats,
        rf4sStatus: rf4sStatusData,
        detectionConfig,
        timestamp: Date.now(),
        sessionTime: this.metricsCollector.getSessionDuration(),
        websocketConnected: this.webSocketManager.isConnected()
      };

      this.dataBroadcaster.broadcastMetrics(data);
      this.webSocketManager.sendData(data);

    } catch (error) {
      console.error('Error updating from integrated services:', error);
      SystemMonitorService.reportError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  getFishingStats(): FishingStats {
    const stats = StatisticsCalculator.calculateSessionStats();
    const fishTypes = StatisticsCalculator.calculateFishTypeStats();
    
    return {
      sessionTime: typeof stats.sessionTime === 'string' ? 0 : stats.sessionTime,
      fishCaught: stats.fishCaught,
      castsTotal: stats.castsTotal || 0,
      successRate: stats.successRate,
      averageFightTime: stats.averageFightTime,
      bestFish: stats.bestFish,
      greenFish: fishTypes.green,
      yellowFish: fishTypes.yellow,
      blueFish: fishTypes.blue,
      purpleFish: fishTypes.purple,
      pinkFish: fishTypes.pink,
      totalCasts: stats.castsTotal || 0,
      successfulCasts: stats.fishCaught,
      averageWeight: this.metricsCollector.calculateAverageWeight()
    };
  }

  getRF4SStatus(): RF4SStatus {
    const systemHealth = SystemMonitorService.getSystemHealth();
    return {
      processRunning: systemHealth.rf4sProcess,
      gameDetected: systemHealth.gameDetected,
      configLoaded: systemHealth.configLoaded,
      lastActivity: systemHealth.lastActivity.getTime(),
      errorCount: this.metricsCollector.collectSystemErrors().length,
      processId: this.metricsCollector.getProcessId(),
      warningCount: 0,
      errors: this.metricsCollector.collectSystemErrors(),
      connected: systemHealth.connectionStable
    };
  }

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

  isServiceRunning(): boolean {
    return this.isRunning;
  }

  getSessionDuration(): number {
    return this.metricsCollector.getSessionDuration();
  }

  getSystemHealth() {
    return SystemMonitorService.getSystemHealth();
  }

  getDetectionStats() {
    return DetectionLogicHandler.getCalibrationData();
  }

  isWebSocketConnected(): boolean {
    return this.webSocketManager.isConnected();
  }

  getConnectionStats() {
    return this.webSocketManager.getConnectionStats();
  }
}

export const RealtimeDataService = new RealtimeDataServiceImpl();
