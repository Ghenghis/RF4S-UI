
import { EventManager } from '../core/EventManager';
import { SystemMetricsService } from './metrics/SystemMetricsService';
import { FishingStatsService } from './metrics/FishingStatsService';
import { RF4SStatusService } from './metrics/RF4SStatusService';
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
    console.log('RealtimeDataService starting...');
    
    // Initialize services
    FishingStatsService.start();
    
    // Start main update loop
    this.updateInterval = setInterval(() => {
      this.updateSystemMetrics();
      this.updateFishingStats();
      this.updateRF4SStatus();
      this.broadcastUpdates();
    }, 2000); // Update every 2 seconds

    console.log('RealtimeDataService started successfully');
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
    console.log('RealtimeDataService stopped');
  }

  getSystemMetrics(): SystemMetrics {
    return SystemMetricsService.getSystemMetrics();
  }

  getFishingStats(): FishingStats {
    return FishingStatsService.getFishingStats();
  }

  getRF4SStatus(): RF4SStatus {
    return RF4SStatusService.getRF4SStatus();
  }

  // Public methods for external updates
  incrementFishCaught(): void {
    FishingStatsService.incrementFishCaught();
    console.log('Fish caught incremented');
  }

  incrementCasts(): void {
    FishingStatsService.incrementCasts();
    console.log('Casts incremented');
  }

  updateGameDetection(detected: boolean): void {
    RF4SStatusService.updateGameDetection(detected);
    console.log('Game detection updated:', detected);
  }

  updateProcessStatus(running: boolean): void {
    RF4SStatusService.updateProcessStatus(running);
    console.log('Process status updated:', running);
  }

  reportError(error: string): void {
    RF4SStatusService.reportError(error);
    console.log('Error reported:', error);
  }

  updateFightTime(duration: number): void {
    FishingStatsService.updateFightTime(duration);
  }

  setBestFish(fishName: string): void {
    FishingStatsService.setBestFish(fishName);
  }

  private updateSystemMetrics(): void {
    SystemMetricsService.updateMetrics();
  }

  private updateFishingStats(): void {
    FishingStatsService.updateStats();
  }

  private updateRF4SStatus(): void {
    RF4SStatusService.updateStatus();
  }

  private broadcastUpdates(): void {
    const data = {
      systemMetrics: this.getSystemMetrics(),
      fishingStats: this.getFishingStats(),
      rf4sStatus: this.getRF4SStatus(),
      timestamp: Date.now(),
      sessionTime: Math.floor((Date.now() - this.sessionStartTime) / 1000)
    };

    EventManager.emit('realtime.metrics_updated', data, 'RealtimeDataService');
    
    // Also emit individual metric updates
    EventManager.emit('system.resources_updated', data.systemMetrics, 'RealtimeDataService');
    EventManager.emit('fishing.stats_updated', data.fishingStats, 'RealtimeDataService');
    EventManager.emit('rf4s.status_updated', data.rf4sStatus, 'RealtimeDataService');
  }

  // Get service status
  isServiceRunning(): boolean {
    return this.isRunning;
  }

  getSessionDuration(): number {
    return Math.floor((Date.now() - this.sessionStartTime) / 1000);
  }
}

export const RealtimeDataService = new RealtimeDataServiceImpl();
