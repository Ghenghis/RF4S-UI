
import { EventManager } from '../core/EventManager';
import { useRF4SStore } from '../stores/rf4sStore';
import { FishingState } from '../core/StateMachine';

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  fps: number;
  diskUsage: number;
  networkLatency: number;
}

export interface FishingStats {
  sessionTime: string;
  fishCaught: number;
  castsTotal: number;
  successRate: number;
  averageFightTime: number;
  bestFish: string;
}

export interface RF4SStatus {
  processRunning: boolean;
  gameDetected: boolean;
  configLoaded: boolean;
  lastActivity: number;
  errorCount: number;
}

class RealtimeDataServiceImpl {
  private updateInterval: NodeJS.Timeout | null = null;
  private systemMetrics: SystemMetrics = {
    cpuUsage: 0,
    memoryUsage: 0,
    fps: 0,
    diskUsage: 0,
    networkLatency: 0
  };
  
  private fishingStats: FishingStats = {
    sessionTime: '00:00:00',
    fishCaught: 0,
    castsTotal: 0,
    successRate: 0,
    averageFightTime: 0,
    bestFish: 'None'
  };

  private rf4sStatus: RF4SStatus = {
    processRunning: false,
    gameDetected: false,
    configLoaded: false,
    lastActivity: Date.now(),
    errorCount: 0
  };

  private sessionStartTime: number = Date.now();

  start(): void {
    this.sessionStartTime = Date.now();
    this.updateInterval = setInterval(() => {
      this.updateMetrics();
      this.updateStats();
      this.updateStatus();
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
    return { ...this.systemMetrics };
  }

  getFishingStats(): FishingStats {
    return { ...this.fishingStats };
  }

  getRF4SStatus(): RF4SStatus {
    return { ...this.rf4sStatus };
  }

  incrementFishCaught(): void {
    this.fishingStats.fishCaught++;
    this.updateSuccessRate();
    
    EventManager.emit('fishing.fish_caught', {
      count: this.fishingStats.fishCaught,
      successRate: this.fishingStats.successRate
    }, 'RealtimeDataService');
  }

  incrementCasts(): void {
    this.fishingStats.castsTotal++;
    this.updateSuccessRate();
    
    EventManager.emit('fishing.cast_made', {
      total: this.fishingStats.castsTotal,
      successRate: this.fishingStats.successRate
    }, 'RealtimeDataService');
  }

  updateGameDetection(detected: boolean): void {
    if (this.rf4sStatus.gameDetected !== detected) {
      this.rf4sStatus.gameDetected = detected;
      this.rf4sStatus.lastActivity = Date.now();
      
      EventManager.emit('game.detection_changed', {
        detected,
        timestamp: this.rf4sStatus.lastActivity
      }, 'RealtimeDataService');
    }
  }

  updateProcessStatus(running: boolean): void {
    if (this.rf4sStatus.processRunning !== running) {
      this.rf4sStatus.processRunning = running;
      this.rf4sStatus.lastActivity = Date.now();
      
      EventManager.emit('process.status_changed', {
        running,
        timestamp: this.rf4sStatus.lastActivity
      }, 'RealtimeDataService');
    }
  }

  reportError(error: string): void {
    this.rf4sStatus.errorCount++;
    
    EventManager.emit('system.error_reported', {
      error,
      totalErrors: this.rf4sStatus.errorCount,
      timestamp: Date.now()
    }, 'RealtimeDataService');
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
    }, 'RealtimeDataService');
  }

  private updateMetrics(): void {
    // Simulate system metrics - in real implementation, these would come from system APIs
    this.systemMetrics.cpuUsage = Math.random() * 100;
    this.systemMetrics.memoryUsage = 150 + Math.random() * 100;
    this.systemMetrics.fps = 58 + Math.random() * 4;
    this.systemMetrics.diskUsage = 45 + Math.random() * 10;
    this.systemMetrics.networkLatency = 10 + Math.random() * 20;

    // Update store with system metrics
    const { updateConfig } = useRF4SStore.getState();
    updateConfig('system', {
      cpuUsage: Math.round(this.systemMetrics.cpuUsage),
      memoryUsage: Math.round(this.systemMetrics.memoryUsage),
      fps: Math.round(this.systemMetrics.fps)
    });
  }

  private updateStats(): void {
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

  private updateStatus(): void {
    // Check if RF4S process is responding
    const timeSinceActivity = Date.now() - this.rf4sStatus.lastActivity;
    if (timeSinceActivity > 30000) { // 30 seconds
      this.rf4sStatus.processRunning = false;
    }

    // Update connection status in store
    const { setConnectionStatus, setGameDetection } = useRF4SStore.getState();
    setConnectionStatus(this.rf4sStatus.processRunning);
    setGameDetection(this.rf4sStatus.gameDetected);
  }

  private updateSuccessRate(): void {
    if (this.fishingStats.castsTotal > 0) {
      this.fishingStats.successRate = (this.fishingStats.fishCaught / this.fishingStats.castsTotal) * 100;
    } else {
      this.fishingStats.successRate = 0;
    }
  }

  private broadcastUpdates(): void {
    EventManager.emit('realtime.metrics_updated', {
      systemMetrics: this.systemMetrics,
      fishingStats: this.fishingStats,
      rf4sStatus: this.rf4sStatus
    }, 'RealtimeDataService');
  }

  private formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

export const RealtimeDataService = new RealtimeDataServiceImpl();
