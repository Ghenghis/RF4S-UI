
import { EventManager } from '../core/EventManager';
import { useRF4SStore } from '../stores/rf4sStore';

export interface SessionStatistics {
  fishCaught: number;
  castsTotal: number;
  successRate: number;
  sessionTime: string;
  fishPerHour: number;
  bestStreak: number;
  currentStreak: number;
}

export interface FishTypeStats {
  green: number;
  yellow: number;
  blue: number;
  purple: number;
  pink: number;
  total: number;
}

export interface PerformanceMetrics {
  averageCastTime: number;
  averageFightTime: number;
  longestFight: number;
  shortestFight: number;
  efficiency: number;
}

class StatisticsCalculatorImpl {
  private sessionStart: number = Date.now();
  private fishStats: FishTypeStats = {
    green: 0,
    yellow: 0,
    blue: 0,
    purple: 0,
    pink: 0,
    total: 0
  };
  private casts: number = 0;
  private currentStreak: number = 0;
  private bestStreak: number = 0;
  private fightTimes: number[] = [];

  startSession(): void {
    this.sessionStart = Date.now();
    this.resetStats();
    
    EventManager.emit('statistics.session_started', {
      timestamp: this.sessionStart
    }, 'StatisticsCalculator');
  }

  recordFishCaught(type: keyof FishTypeStats = 'total', fightTime?: number): void {
    if (type !== 'total') {
      this.fishStats[type]++;
    }
    this.fishStats.total++;
    this.currentStreak++;
    
    if (this.currentStreak > this.bestStreak) {
      this.bestStreak = this.currentStreak;
    }

    if (fightTime) {
      this.fightTimes.push(fightTime);
    }

    this.updateStoreStats();
    
    EventManager.emit('statistics.fish_caught', {
      type,
      total: this.fishStats.total,
      streak: this.currentStreak
    }, 'StatisticsCalculator');
  }

  recordCast(): void {
    this.casts++;
    this.updateStoreStats();
    
    EventManager.emit('statistics.cast_recorded', {
      total: this.casts,
      successRate: this.getSuccessRate()
    }, 'StatisticsCalculator');
  }

  recordMissedFish(): void {
    this.currentStreak = 0;
    this.updateStoreStats();
  }

  getSessionStatistics(): SessionStatistics {
    const sessionDuration = Date.now() - this.sessionStart;
    const hoursElapsed = sessionDuration / (1000 * 60 * 60);
    
    return {
      fishCaught: this.fishStats.total,
      castsTotal: this.casts,
      successRate: this.getSuccessRate(),
      sessionTime: this.formatDuration(sessionDuration),
      fishPerHour: hoursElapsed > 0 ? this.fishStats.total / hoursElapsed : 0,
      bestStreak: this.bestStreak,
      currentStreak: this.currentStreak
    };
  }

  getFishTypeStatistics(): FishTypeStats {
    return { ...this.fishStats };
  }

  getPerformanceMetrics(): PerformanceMetrics {
    const avgFightTime = this.fightTimes.length > 0 
      ? this.fightTimes.reduce((a, b) => a + b, 0) / this.fightTimes.length 
      : 0;

    return {
      averageCastTime: this.calculateAverageCastTime(),
      averageFightTime: avgFightTime,
      longestFight: Math.max(...this.fightTimes, 0),
      shortestFight: Math.min(...this.fightTimes, 0),
      efficiency: this.calculateEfficiency()
    };
  }

  resetStats(): void {
    this.fishStats = { green: 0, yellow: 0, blue: 0, purple: 0, pink: 0, total: 0 };
    this.casts = 0;
    this.currentStreak = 0;
    this.bestStreak = 0;
    this.fightTimes = [];
    this.updateStoreStats();
  }

  private getSuccessRate(): number {
    return this.casts > 0 ? (this.fishStats.total / this.casts) * 100 : 0;
  }

  private calculateAverageCastTime(): number {
    // Placeholder - would need actual cast timing data
    return 45; // seconds
  }

  private calculateEfficiency(): number {
    const sessionHours = (Date.now() - this.sessionStart) / (1000 * 60 * 60);
    return sessionHours > 0 ? (this.fishStats.total / sessionHours) * 10 : 0;
  }

  private updateStoreStats(): void {
    const { updateConfig } = useRF4SStore.getState();
    const stats = this.getSessionStatistics();
    
    updateConfig('system', {
      fishCaught: stats.fishCaught,
      successRate: Math.round(stats.successRate * 100) / 100,
      sessionTime: stats.sessionTime
    });
  }

  private formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

export const StatisticsCalculator = new StatisticsCalculatorImpl();
