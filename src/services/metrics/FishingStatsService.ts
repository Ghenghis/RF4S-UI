
import { FishingStats } from '../../types/metrics';

class FishingStatsServiceImpl {
  private stats: FishingStats = {
    sessionTime: 0,
    fishCaught: 0,
    castsTotal: 0,
    successRate: 0,
    averageFightTime: 0,
    bestFish: 'None',
    greenFish: 0,
    yellowFish: 0,
    blueFish: 0,
    purpleFish: 0,
    pinkFish: 0,
    totalCasts: 0,
    successfulCasts: 0,
    averageWeight: 0,
  };

  private startTime: number = Date.now();
  private fightTimes: number[] = [];

  start(): void {
    this.startTime = Date.now();
    console.log('FishingStatsService started');
  }

  getFishingStats(): FishingStats {
    return { ...this.stats };
  }

  updateStats(): void {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    this.stats.sessionTime = elapsed;
    
    if (this.stats.castsTotal > 0) {
      this.stats.successRate = (this.stats.fishCaught / this.stats.castsTotal) * 100;
    }

    if (this.fightTimes.length > 0) {
      this.stats.averageFightTime = this.fightTimes.reduce((a, b) => a + b, 0) / this.fightTimes.length;
    }
  }

  incrementFishCaught(): void {
    this.stats.fishCaught++;
    
    // Simulate fish color distribution with proper typing
    const colors = ['green', 'yellow', 'blue', 'purple', 'pink'] as const;
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    switch (randomColor) {
      case 'green':
        this.stats.greenFish++;
        break;
      case 'yellow':
        this.stats.yellowFish++;
        break;
      case 'blue':
        this.stats.blueFish++;
        break;
      case 'purple':
        this.stats.purpleFish++;
        break;
      case 'pink':
        this.stats.pinkFish++;
        break;
    }
  }

  incrementCasts(): void {
    this.stats.castsTotal++;
    this.stats.totalCasts++;
  }

  updateFightTime(duration: number): void {
    this.fightTimes.push(duration);
    if (this.fightTimes.length > 100) {
      this.fightTimes.shift();
    }
  }

  setBestFish(fishName: string): void {
    this.stats.bestFish = fishName;
  }
}

export const FishingStatsService = new FishingStatsServiceImpl();
