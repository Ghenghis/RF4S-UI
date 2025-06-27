
import { EventManager } from '../../core/EventManager';

export class AutoSaveManager {
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private interval: number;
  private saveCallback: () => Promise<boolean>;

  constructor(interval: number, saveCallback: () => Promise<boolean>) {
    this.interval = interval;
    this.saveCallback = saveCallback;
  }

  start(): void {
    if (this.autoSaveInterval) {
      return; // Already running
    }

    this.autoSaveInterval = setInterval(async () => {
      try {
        await this.saveCallback();
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, this.interval);

    console.log(`Auto-save started with ${this.interval}ms interval`);
  }

  stop(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      console.log('Auto-save stopped');
    }
  }

  updateInterval(newInterval: number): void {
    this.interval = newInterval;
    if (this.autoSaveInterval) {
      this.stop();
      this.start();
    }
  }

  isRunning(): boolean {
    return this.autoSaveInterval !== null;
  }
}
