
import { SyncMetrics } from './types';

export class SyncMetricsManager {
  private metrics: SyncMetrics;
  private readonly defaultFrequency = 1000; // 1 second

  constructor() {
    this.metrics = {
      lastSyncTime: new Date(),
      syncFrequency: this.defaultFrequency,
      missedSyncs: 0,
      latency: 0
    };
  }

  updateSyncTime(): void {
    this.metrics.lastSyncTime = new Date();
  }

  updateLatency(startTime: number): void {
    this.metrics.latency = Date.now() - startTime;
  }

  incrementMissedSyncs(): void {
    this.metrics.missedSyncs++;
  }

  updateFrequency(frequency: number): void {
    this.metrics.syncFrequency = Math.max(100, frequency); // Minimum 100ms
  }

  getMetrics(): SyncMetrics {
    return { ...this.metrics };
  }

  isHealthy(): boolean {
    const timeSinceLastSync = Date.now() - this.metrics.lastSyncTime.getTime();
    return timeSinceLastSync < this.metrics.syncFrequency * 2 && 
           this.metrics.missedSyncs < 5;
  }

  getSyncFrequency(): number {
    return this.metrics.syncFrequency;
  }
}
