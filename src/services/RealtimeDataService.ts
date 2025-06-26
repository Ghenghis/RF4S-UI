
import { EventManager } from '../core/EventManager';
import { SystemMetricsService } from './metrics/SystemMetricsService';
import { FishingStatsService } from './metrics/FishingStatsService';
import { RF4SStatusService } from './metrics/RF4SStatusService';
import { SystemMetrics, FishingStats, RF4SStatus } from '../types/metrics';

class RealtimeDataServiceImpl {
  private updateInterval: NodeJS.Timeout | null = null;

  start(): void {
    FishingStatsService.start();
    
    this.updateInterval = setInterval(() => {
      SystemMetricsService.updateMetrics();
      FishingStatsService.updateStats();
      RF4SStatusService.updateStatus();
      this.broadcastUpdates();
    }, 1000);

    console.log('RealtimeDataService started');
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
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

  incrementFishCaught(): void {
    FishingStatsService.incrementFishCaught();
  }

  incrementCasts(): void {
    FishingStatsService.incrementCasts();
  }

  updateGameDetection(detected: boolean): void {
    RF4SStatusService.updateGameDetection(detected);
  }

  updateProcessStatus(running: boolean): void {
    RF4SStatusService.updateProcessStatus(running);
  }

  reportError(error: string): void {
    RF4SStatusService.reportError(error);
  }

  updateFightTime(duration: number): void {
    FishingStatsService.updateFightTime(duration);
  }

  setBestFish(fishName: string): void {
    FishingStatsService.setBestFish(fishName);
  }

  private broadcastUpdates(): void {
    EventManager.emit('realtime.metrics_updated', {
      systemMetrics: this.getSystemMetrics(),
      fishingStats: this.getFishingStats(),
      rf4sStatus: this.getRF4SStatus()
    }, 'RealtimeDataService');
  }
}

export const RealtimeDataService = new RealtimeDataServiceImpl();
