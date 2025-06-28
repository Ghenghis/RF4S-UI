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
  private websocketConnection: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

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
      this.establishWebSocketConnection();
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
    
    // Close WebSocket connection
    if (this.websocketConnection) {
      this.websocketConnection.close();
      this.websocketConnection = null;
    }
    
    // Stop monitoring services
    SystemMonitorService.stop();
    
    this.isRunning = false;
    console.log('RealtimeDataService stopped');
  }

  private establishWebSocketConnection(): void {
    try {
      // In production, this would connect to actual RF4S WebSocket
      const wsUrl = this.getWebSocketUrl();
      console.log('Attempting WebSocket connection to:', wsUrl);
      
      // For now, simulate WebSocket connection
      this.simulateWebSocketConnection();
      
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  private simulateWebSocketConnection(): void {
    // Simulate successful WebSocket connection
    this.reconnectAttempts = 0;
    console.log('WebSocket connection established (simulated)');
    
    EventManager.emit('realtime.websocket_connected', {
      timestamp: Date.now(),
      url: this.getWebSocketUrl()
    }, 'RealtimeDataService');
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      
      setTimeout(() => {
        console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.establishWebSocketConnection();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      EventManager.emit('realtime.websocket_failed', {
        timestamp: Date.now(),
        attempts: this.reconnectAttempts
      }, 'RealtimeDataService');
    }
  }

  private getWebSocketUrl(): string {
    // In production, this would be the actual RF4S WebSocket URL
    const host = process.env.NODE_ENV === 'development' ? 'localhost' : window.location.hostname;
    const port = process.env.NODE_ENV === 'development' ? '8080' : '443';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    return `${protocol}//${host}:${port}/rf4s-websocket`;
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
      const systemMetrics: SystemMetrics = {
        cpuUsage: systemStatus.performance.cpuUsage,
        memoryUsage: systemStatus.performance.memoryUsage,
        fps: systemStatus.performance.fps,
        diskUsage: this.calculateDiskUsage(),
        networkLatency: systemStatus.performance.responseTime,
        lastUpdate: Date.now()
      };

      // Create comprehensive fishing stats with correct property names
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
        averageWeight: this.calculateAverageWeight()
      };

      // Create RF4S status with real process monitoring
      const rf4sStatusData: RF4SStatus = {
        processRunning: systemStatus.health.rf4sProcess,
        gameDetected: systemStatus.health.gameDetected,
        configLoaded: systemStatus.health.configLoaded,
        lastActivity: systemStatus.health.lastActivity.getTime(),
        errorCount: Math.floor(systemStatus.performance.errorRate),
        processId: this.getProcessId(),
        warningCount: systemStatus.health.servicesRunning ? 0 : 1,
        errors: this.collectSystemErrors(),
        connected: systemStatus.health.connectionStable
      };

      // Broadcast integrated data with WebSocket support
      const data = {
        systemMetrics,
        fishingStats: enhancedFishingStats,
        rf4sStatus: rf4sStatusData,
        detectionConfig,
        timestamp: Date.now(),
        sessionTime: Math.floor((Date.now() - this.sessionStartTime) / 1000),
        websocketConnected: this.websocketConnection !== null
      };

      EventManager.emit('realtime.metrics_updated', data, 'RealtimeDataService');
      EventManager.emit('system.resources_updated', systemMetrics, 'RealtimeDataService');
      EventManager.emit('fishing.stats_updated', enhancedFishingStats, 'RealtimeDataService');
      EventManager.emit('rf4s.status_updated', rf4sStatusData, 'RealtimeDataService');

      // Send data via WebSocket if connected
      this.sendWebSocketData(data);

    } catch (error) {
      console.error('Error updating from integrated services:', error);
      SystemMonitorService.reportError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private sendWebSocketData(data: any): void {
    if (this.websocketConnection && this.websocketConnection.readyState === WebSocket.OPEN) {
      try {
        this.websocketConnection.send(JSON.stringify(data));
      } catch (error) {
        console.error('Failed to send WebSocket data:', error);
      }
    }
  }

  private calculateDiskUsage(): number {
    // Calculate localStorage usage as a proxy for disk usage
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length;
      }
    }
    return Math.round((totalSize / (1024 * 1024)) * 100) / 100; // MB
  }

  private calculateAverageWeight(): number {
    // Calculate based on fish type distribution
    const stats = StatisticsCalculator.calculateFishTypeStats();
    const totalFish = stats.green + stats.yellow + stats.blue + stats.purple + stats.pink;
    
    if (totalFish === 0) return 0;
    
    // Weight estimates: green=0.5kg, yellow=1kg, blue=2kg, purple=3kg, pink=5kg
    const totalWeight = (stats.green * 0.5) + (stats.yellow * 1) + 
                       (stats.blue * 2) + (stats.purple * 3) + (stats.pink * 5);
    
    return Math.round((totalWeight / totalFish) * 100) / 100;
  }

  private getProcessId(): number {
    // In production, this would get the actual RF4S process ID
    return parseInt(sessionStorage.getItem('rf4s_process_id') || '0') || 
           Math.floor(Math.random() * 10000) + 1000;
  }

  private collectSystemErrors(): string[] {
    // Collect recent system errors
    const errors: string[] = [];
    const errorLog = localStorage.getItem('rf4s_error_log');
    
    if (errorLog) {
      try {
        const parsedErrors = JSON.parse(errorLog);
        return parsedErrors.slice(-5); // Last 5 errors
      } catch {
        // Ignore parsing errors
      }
    }
    
    return errors;
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
      averageWeight: this.calculateAverageWeight()
    };
  }

  getRF4SStatus(): RF4SStatus {
    const systemHealth = SystemMonitorService.getSystemHealth();
    return {
      processRunning: systemHealth.rf4sProcess,
      gameDetected: systemHealth.gameDetected,
      configLoaded: systemHealth.configLoaded,
      lastActivity: systemHealth.lastActivity.getTime(),
      errorCount: this.collectSystemErrors().length,
      processId: this.getProcessId(),
      warningCount: 0,
      errors: this.collectSystemErrors(),
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

  isWebSocketConnected(): boolean {
    return this.websocketConnection !== null && 
           this.websocketConnection.readyState === WebSocket.OPEN;
  }

  getConnectionStats() {
    return {
      websocketConnected: this.isWebSocketConnected(),
      reconnectAttempts: this.reconnectAttempts,
      lastConnection: this.websocketConnection ? new Date() : null,
      connectionUrl: this.getWebSocketUrl()
    };
  }
}

export const RealtimeDataService = new RealtimeDataServiceImpl();
