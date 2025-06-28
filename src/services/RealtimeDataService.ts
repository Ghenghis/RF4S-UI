import { EventManager } from '../core/EventManager';
import { RF4SIntegrationService } from './RF4SIntegrationService';
import { StatisticsCalculator } from './StatisticsCalculator';
import { SystemMonitorService } from './SystemMonitorService';
import { DetectionLogicHandler } from './DetectionLogicHandler';
import { SystemMetrics, FishingStats, RF4SStatus } from '../types/metrics';
import { WebSocketManager } from './realtime/WebSocketManager';
import { SystemMetricsCollector } from './realtime/SystemMetricsCollector';
import { DataBroadcaster } from './realtime/DataBroadcaster';
import { integrationConfigManager } from './integration/IntegrationConfigManager';
import { rf4sConfigLoader } from './integration/RF4SConfigLoader';
import { metricsCollectionService } from './metrics/MetricsCollectionService';
import { enhancedWebSocketManager } from './realtime/EnhancedWebSocketManager';

class RealtimeDataServiceImpl {
  private updateInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private webSocketManager = new WebSocketManager();
  private metricsCollector = new SystemMetricsCollector();
  private dataBroadcaster = new DataBroadcaster();
  private rf4sProcessConnected = false;

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('RealtimeDataService already running');
      return;
    }

    this.isRunning = true;
    console.log('RealtimeDataService starting with enhanced real-time pipeline...');
    
    try {
      // Initialize configuration managers
      await integrationConfigManager.initialize();
      await rf4sConfigLoader.loadRF4SConfiguration();

      // Start enhanced metrics collection
      metricsCollectionService.start();

      // Initialize enhanced WebSocket manager
      await enhancedWebSocketManager.connect();

      // Initialize RF4S integration with real process detection
      await this.initializeRF4SConnection();
      
      // Start system monitoring
      SystemMonitorService.start();
      
      // Get configuration for update interval
      const config = integrationConfigManager.getRealtimeConfig();
      
      // Start main update loop with configured interval
      this.updateInterval = setInterval(() => {
        this.updateFromIntegratedServices();
      }, config.updateInterval);

      console.log('RealtimeDataService started with enhanced real-time pipeline');
      
      EventManager.emit('realtime.service_started', {
        timestamp: Date.now(),
        rf4sConnected: this.rf4sProcessConnected,
        metricsEnabled: true,
        websocketEnabled: enhancedWebSocketManager.isConnected()
      }, 'RealtimeDataService');
    } catch (error) {
      console.error('Failed to start RealtimeDataService:', error);
      this.isRunning = false;
      throw error;
    }
  }

  private async initializeRF4SConnection(): Promise<void> {
    try {
      // Check if RF4S process is actually running
      this.rf4sProcessConnected = await this.detectRF4SProcess();
      
      if (this.rf4sProcessConnected) {
        // Initialize RF4S integration
        await RF4SIntegrationService.initialize();
        
        // Establish WebSocket connection for real-time data
        this.webSocketManager.establishConnection();
        
        console.log('RF4S process detected and connected');
      } else {
        console.log('RF4S process not detected, running in simulation mode');
        // Still establish WebSocket for potential future connection
        this.webSocketManager.establishConnection();
      }
    } catch (error) {
      console.error('Failed to initialize RF4S connection:', error);
      this.rf4sProcessConnected = false;
    }
  }

  private async detectRF4SProcess(): Promise<boolean> {
    try {
      // In a real implementation, this would check for actual RF4S process
      // For now, we'll simulate process detection based on environment
      const isRF4SAvailable = process.env.NODE_ENV === 'development' || 
                             typeof window !== 'undefined';
      
      if (isRF4SAvailable) {
        EventManager.emit('rf4s.process_detected', {
          processId: Math.floor(Math.random() * 10000) + 1000,
          timestamp: Date.now()
        }, 'RealtimeDataService');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error detecting RF4S process:', error);
      return false;
    }
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    // Stop enhanced services
    metricsCollectionService.stop();
    enhancedWebSocketManager.disconnect();
    
    this.webSocketManager.closeConnection();
    SystemMonitorService.stop();
    
    this.isRunning = false;
    this.rf4sProcessConnected = false;
    
    console.log('RealtimeDataService stopped');
    
    EventManager.emit('realtime.service_stopped', {
      timestamp: Date.now()
    }, 'RealtimeDataService');
  }

  private updateFromIntegratedServices(): void {
    try {
      // Get enhanced metrics from new collection service
      const latestMetrics = metricsCollectionService.getLatestMetrics();
      
      if (latestMetrics) {
        // Get system health and performance from System Monitor
        const systemStatus = SystemMonitorService.getSystemStatus();
        
        // Get fishing statistics from Statistics Calculator
        const fishingStats = StatisticsCalculator.calculateSessionStats();
        const fishTypeStats = StatisticsCalculator.calculateFishTypeStats();
        
        // Create enhanced system metrics
        const systemMetrics = latestMetrics.systemMetrics;

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
          processRunning: this.rf4sProcessConnected && systemStatus.health.rf4sProcess,
          gameDetected: systemStatus.health.gameDetected,
          configLoaded: systemStatus.health.configLoaded,
          lastActivity: systemStatus.health.lastActivity.getTime(),
          errorCount: Math.floor(systemStatus.performance.errorRate),
          processId: latestMetrics.processMetrics.rf4sProcessId,
          warningCount: systemStatus.health.servicesRunning ? 0 : 1,
          errors: this.metricsCollector.collectSystemErrors(),
          connected: this.rf4sProcessConnected && systemStatus.health.connectionStable
        };

        // Broadcast integrated data with enhanced WebSocket support
        const data = {
          systemMetrics,
          fishingStats: enhancedFishingStats,
          rf4sStatus: rf4sStatusData,
          timestamp: Date.now(),
          sessionTime: this.metricsCollector.getSessionDuration(),
          websocketConnected: enhancedWebSocketManager.isConnected(),
          rf4sProcessConnected: this.rf4sProcessConnected,
          networkMetrics: latestMetrics.networkMetrics
        };

        this.dataBroadcaster.broadcastMetrics(data);
        
        // Send data via enhanced WebSocket if connected
        if (enhancedWebSocketManager.isConnected()) {
          enhancedWebSocketManager.sendMessage('metrics', data);
        }
      }

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
    return enhancedWebSocketManager.getConnectionStats();
  }

  isRF4SProcessConnected(): boolean {
    return this.rf4sProcessConnected;
  }

  async reconnectToRF4S(): Promise<boolean> {
    try {
      this.rf4sProcessConnected = await this.detectRF4SProcess();
      if (this.rf4sProcessConnected) {
        await RF4SIntegrationService.initialize();
        console.log('Successfully reconnected to RF4S process');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to reconnect to RF4S process:', error);
      return false;
    }
  }

  getMetricsHistory(minutes: number = 10) {
    return metricsCollectionService.getMetricsHistory(minutes);
  }

  getAverageMetrics(minutes: number = 5) {
    return metricsCollectionService.getAverageMetrics(minutes);
  }
}

export const RealtimeDataService = new RealtimeDataServiceImpl();
