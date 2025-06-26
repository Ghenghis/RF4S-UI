
import { EventManager } from '../core/EventManager';
import { useRF4SStore } from '../stores/rf4sStore';

export interface ProcessHealth {
  running: boolean;
  responsive: boolean;
  lastHeartbeat: number;
  errorCount: number;
  restartCount: number;
}

export interface GameDetectionStatus {
  detected: boolean;
  windowFound: boolean;
  processId: number | null;
  lastDetection: number;
  confidence: number;
}

export interface SystemResources {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  fps: number;
  temperature: number;
}

class SystemMonitorServiceImpl {
  private monitorInterval: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private processHealth: ProcessHealth = {
    running: false,
    responsive: false,
    lastHeartbeat: 0,
    errorCount: 0,
    restartCount: 0
  };
  
  private gameStatus: GameDetectionStatus = {
    detected: false,
    windowFound: false,
    processId: null,
    lastDetection: 0,
    confidence: 0
  };

  private systemResources: SystemResources = {
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkLatency: 0,
    fps: 0,
    temperature: 0
  };

  startMonitoring(): void {
    this.monitorInterval = setInterval(() => {
      this.updateSystemResources();
      this.checkGameDetection();
      this.updateStoreStatus();
    }, 2000);

    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 5000);

    console.log('SystemMonitorService started');
  }

  stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    console.log('SystemMonitorService stopped');
  }

  getProcessHealth(): ProcessHealth {
    return { ...this.processHealth };
  }

  getGameDetectionStatus(): GameDetectionStatus {
    return { ...this.gameStatus };
  }

  getSystemResources(): SystemResources {
    return { ...this.systemResources };
  }

  reportProcessError(error: string): void {
    this.processHealth.errorCount++;
    this.processHealth.responsive = false;
    
    EventManager.emit('system.process_error', {
      error,
      errorCount: this.processHealth.errorCount,
      timestamp: Date.now()
    }, 'SystemMonitorService');
  }

  reportProcessRestart(): void {
    this.processHealth.restartCount++;
    this.processHealth.running = true;
    this.processHealth.responsive = true;
    this.processHealth.lastHeartbeat = Date.now();
    
    EventManager.emit('system.process_restarted', {
      restartCount: this.processHealth.restartCount,
      timestamp: Date.now()
    }, 'SystemMonitorService');
  }

  updateGameWindow(found: boolean, processId?: number): void {
    this.gameStatus.windowFound = found;
    if (processId) {
      this.gameStatus.processId = processId;
    }
    
    if (found) {
      this.gameStatus.lastDetection = Date.now();
    }
  }

  updateDetectionConfidence(confidence: number): void {
    this.gameStatus.confidence = confidence;
    this.gameStatus.detected = confidence > 0.8;
    
    if (this.gameStatus.detected) {
      this.gameStatus.lastDetection = Date.now();
    }
  }

  private updateSystemResources(): void {
    // Simulate system metrics with realistic values
    this.systemResources = {
      cpuUsage: Math.max(0, Math.min(100, 40 + (Math.random() - 0.5) * 20)),
      memoryUsage: Math.max(0, 200 + (Math.random() - 0.5) * 100),
      diskUsage: Math.max(0, Math.min(100, 45 + (Math.random() - 0.5) * 10)),
      networkLatency: Math.max(0, 15 + (Math.random() - 0.5) * 10),
      fps: Math.max(0, 60 + (Math.random() - 0.5) * 8),
      temperature: Math.max(0, 65 + (Math.random() - 0.5) * 15)
    };

    EventManager.emit('system.resources_updated', this.systemResources, 'SystemMonitorService');
  }

  private checkGameDetection(): void {
    // Simulate game detection logic
    const detectionProbability = this.gameStatus.detected ? 0.95 : 0.1;
    const shouldDetect = Math.random() < detectionProbability;
    
    if (shouldDetect !== this.gameStatus.detected) {
      this.gameStatus.detected = shouldDetect;
      this.gameStatus.confidence = shouldDetect ? 0.9 + Math.random() * 0.1 : Math.random() * 0.3;
      
      if (shouldDetect) {
        this.gameStatus.lastDetection = Date.now();
        this.gameStatus.windowFound = true;
        this.gameStatus.processId = Math.floor(Math.random() * 10000) + 1000;
      }

      EventManager.emit('system.game_detection_changed', {
        detected: this.gameStatus.detected,
        confidence: this.gameStatus.confidence
      }, 'SystemMonitorService');
    }
  }

  private performHealthCheck(): void {
    const now = Date.now();
    const timeSinceHeartbeat = now - this.processHealth.lastHeartbeat;
    
    // Consider process unresponsive if no heartbeat for 10 seconds
    this.processHealth.responsive = timeSinceHeartbeat < 10000;
    this.processHealth.running = this.processHealth.responsive || timeSinceHeartbeat < 30000;

    // Simulate heartbeat
    if (this.processHealth.running && Math.random() > 0.1) {
      this.processHealth.lastHeartbeat = now;
    }

    EventManager.emit('system.health_check', this.processHealth, 'SystemMonitorService');
  }

  private updateStoreStatus(): void {
    const { setConnectionStatus, setGameDetection, updateConfig } = useRF4SStore.getState();
    
    setConnectionStatus(this.processHealth.running);
    setGameDetection(this.gameStatus.detected);
    
    updateConfig('system', {
      cpuUsage: Math.round(this.systemResources.cpuUsage),
      memoryUsage: Math.round(this.systemResources.memoryUsage),
      fps: Math.round(this.systemResources.fps)
    });
  }
}

export const SystemMonitorService = new SystemMonitorServiceImpl();
