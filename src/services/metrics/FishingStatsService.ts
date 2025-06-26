
import { EventManager } from '../../core/EventManager';
import { useRF4SStore } from '../../stores/rf4sStore';
import { FishingStats } from '../../types/metrics';

class FishingStatsServiceImpl {
  private fishingStats: FishingStats = {
    sessionTime: '00:00:00',
    fishCaught: 0,
    castsTotal: 0,
    successRate: 0,
    averageFightTime: 0,
    bestFish: 'None'
  };

  private sessionStartTime: number = Date.now();

  start(): void {
    this.sessionStartTime = Date.now();
  }

  updateStats(): void {
    const sessionDuration = Date.now() - this.sessionStartTime;
    this.fishingStats.sessionTime = this.formatDuration(sessionDuration);

    // Update store with fishing stats
    const { updateConfig } = useRF4SStore.getState();
    updateConfig('system', {
      sessionTime: this.fishingStats.sessionTime,
      fishCaught: this.fishingStats.fishCaught,
      successRate: Math.round(this.fishingStats.successRate * 100) / 100
    });
  }

  incrementFishCaught(): void {
    this.fishingStats.fishCaught++;
    this.updateSuccessRate();
    
    EventManager.emit('fishing.fish_caught', {
      count: this.fishingStats.fishCaught,
      successRate: this.fishingStats.successRate
    }, 'FishingStatsService');
  }

  incrementCasts(): void {
    this.fishingStats.castsTotal++;
    this.updateSuccessRate();
    
    EventManager.emit('fishing.cast_made', {
      total: this.fishingStats.castsTotal,
      successRate: this.fishingStats.successRate
    }, 'FishingStatsService');
  }

  updateFightTime(duration: number): void {
    const currentAvg = this.fishingStats.averageFightTime;
    const fishCount = this.fishingStats.fishCaught;
    
    if (fishCount > 0) {
      this.fishingStats.averageFightTime = (currentAvg * (fishCount - 1) + duration) / fishCount;
    } else {
      this.fishingStats.averageFightTime = duration;
    }
  }

  setBestFish(fishName: string): void {
    this.fishingStats.bestFish = fishName;
    
    EventManager.emit('fishing.best_fish_updated', {
      fishName,
      timestamp: Date.now()
    }, 'FishingStatsService');
  }

  getFishingStats(): FishingStats {
    return { ...this.fishingStats };
  }

  private updateSuccessRate(): void {
    if (this.fishingStats.castsTotal > 0) {
      this.fishingStats.successRate = (this.fishingStats.fishCaught / this.fishingStats.castsTotal) * 100;
    } else {
      this.fishingStats.successRate = 0;
    }
  }

  private formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

export const FishingStatsService = new FishingStatsServiceImpl();
