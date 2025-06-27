
import { EventManager } from '../core/EventManager';
import { rf4sService } from '../rf4s/services/rf4sService';

interface SessionStatistics {
  fishCaught: number;
  castsTotal: number;
  successRate: number;
  sessionTime: string;
  averageFightTime: number;
  bestFish: string;
  fishPerHour: number;
  efficiency: number;
}

interface FishTypeStats {
  green: number;
  yellow: number;
  blue: number;
  purple: number;
  pink: number;
}

class StatisticsCalculatorImpl {
  private sessionStartTime: Date = new Date();
  private totalFightTime: number = 0;
  private fightCount: number = 0;
  private lastCastTime: Date | null = null;

  calculateSessionStats(): SessionStatistics {
    const results = rf4sService.getSessionResults();
    const sessionDuration = this.getSessionDurationMinutes();
    
    return {
      fishCaught: results.total,
      castsTotal: this.estimateCasts(results.total),
      successRate: this.calculateSuccessRate(results.total),
      sessionTime: this.formatSessionTime(sessionDuration),
      averageFightTime: this.calculateAverageFightTime(),
      bestFish: this.determineBestFish(results),
      fishPerHour: this.calculateFishPerHour(results.total, sessionDuration),
      efficiency: this.calculateEfficiency(results.total, sessionDuration)
    };
  }

  calculateFishTypeStats(): FishTypeStats {
    const results = rf4sService.getSessionResults();
    return {
      green: results.green,
      yellow: results.yellow,
      blue: results.blue,
      purple: results.purple,
      pink: results.pink
    };
  }

  private estimateCasts(fishCaught: number): number {
    // Estimate based on success rate (typically 70-85%)
    const estimatedSuccessRate = 0.75;
    return Math.round(fishCaught / estimatedSuccessRate);
  }

  private calculateSuccessRate(fishCaught: number): number {
    const casts = this.estimateCasts(fishCaught);
    return casts > 0 ? Math.round((fishCaught / casts) * 100) : 0;
  }

  private getSessionDurationMinutes(): number {
    return Math.floor((Date.now() - this.sessionStartTime.getTime()) / 1000 / 60);
  }

  private formatSessionTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  private calculateAverageFightTime(): number {
    return this.fightCount > 0 ? Math.round(this.totalFightTime / this.fightCount * 10) / 10 : 0;
  }

  private determineBestFish(results: any): string {
    const fishTypes = [
      { name: 'Pink Fish', count: results.pink },
      { name: 'Purple Fish', count: results.purple },
      { name: 'Blue Fish', count: results.blue },
      { name: 'Yellow Fish', count: results.yellow },
      { name: 'Green Fish', count: results.green }
    ];
    
    const best = fishTypes.reduce((prev, current) => 
      current.count > prev.count ? current : prev
    );
    
    return best.count > 0 ? best.name : 'None';
  }

  private calculateFishPerHour(fishCaught: number, sessionMinutes: number): number {
    if (sessionMinutes === 0) return 0;
    return Math.round((fishCaught / sessionMinutes) * 60 * 10) / 10;
  }

  private calculateEfficiency(fishCaught: number, sessionMinutes: number): number {
    const fishPerHour = this.calculateFishPerHour(fishCaught, sessionMinutes);
    // Efficiency scale: 0-100 based on fish per hour (20+ fish/hour = 100%)
    return Math.min(100, Math.round((fishPerHour / 20) * 100));
  }

  addFightTime(duration: number): void {
    this.totalFightTime += duration;
    this.fightCount++;
  }

  recordCast(): void {
    this.lastCastTime = new Date();
  }

  resetSession(): void {
    this.sessionStartTime = new Date();
    this.totalFightTime = 0;
    this.fightCount = 0;
    this.lastCastTime = null;
  }

  getDetailedStats(): Record<string, any> {
    const sessionStats = this.calculateSessionStats();
    const fishTypeStats = this.calculateFishTypeStats();
    
    return {
      ...sessionStats,
      fishTypes: fishTypeStats,
      sessionStartTime: this.sessionStartTime,
      lastCastTime: this.lastCastTime,
      totalFights: this.fightCount
    };
  }
}

export const StatisticsCalculator = new StatisticsCalculatorImpl();
