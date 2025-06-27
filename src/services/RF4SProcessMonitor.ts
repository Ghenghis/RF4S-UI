
import { EventManager } from '../core/EventManager';
import { ProcessBridge } from './ProcessBridge';
import { createRichLogger } from '../rf4s/utils';

interface RF4ProcessStatus {
  isRunning: boolean;
  processId: number | null;
  memoryUsage: number;
  cpuUsage: number;
  gameVersion: string | null;
  windowHandle: string | null;
  lastActivity: Date;
}

class RF4SProcessMonitorImpl {
  private logger = createRichLogger('RF4SProcessMonitor');
  private processStatus: RF4ProcessStatus = {
    isRunning: false,
    processId: null,
    memoryUsage: 0,
    cpuUsage: 0,
    gameVersion: null,
    windowHandle: null,
    lastActivity: new Date()
  };
  private monitoringInterval: NodeJS.Timeout | null = null;

  start(): void {
    this.logger.info('Starting RF4S Process Monitor...');
    
    // Check for RF4 process immediately
    this.checkRF4Process();
    
    // Set up monitoring interval
    this.monitoringInterval = setInterval(() => {
      this.checkRF4Process();
      this.updateProcessMetrics();
    }, 3000); // Check every 3 seconds

    // Listen for process bridge events
    EventManager.subscribe('process_bridge.rf4_detected', (data: any) => {
      this.handleRF4Detected(data.process);
    });

    EventManager.subscribe('process_bridge.rf4_metrics_updated', (data: any) => {
      this.handleRF4MetricsUpdate(data.process);
    });

    console.log('RF4S Process Monitor started');
  }

  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('RF4S Process Monitor stopped');
  }

  private checkRF4Process(): void {
    const rf4Process = ProcessBridge.getRF4ProcessInfo();
    
    if (rf4Process && !this.processStatus.isRunning) {
      // RF4 just started
      this.handleRF4Detected(rf4Process);
    } else if (!rf4Process && this.processStatus.isRunning) {
      // RF4 just stopped
      this.handleRF4Stopped();
    }
  }

  private handleRF4Detected(processInfo: any): void {
    this.logger.info(`RF4 Game Process Detected - PID: ${processInfo.pid}`);
    
    this.processStatus = {
      isRunning: true,
      processId: processInfo.pid,
      memoryUsage: processInfo.memoryUsage,
      cpuUsage: processInfo.cpuUsage,
      gameVersion: 'RF4 x64', // Could be detected from process info
      windowHandle: `RF4_${processInfo.pid}`,
      lastActivity: new Date()
    };

    // Emit events for other services
    EventManager.emit('rf4s.game_detected', {
      processId: processInfo.pid,
      memoryUsage: processInfo.memoryUsage,
      timestamp: new Date()
    }, 'RF4SProcessMonitor');

    EventManager.emit('system.game_connection_established', {
      game: 'Russian Fishing 4',
      processId: processInfo.pid,
      status: 'connected'
    }, 'RF4SProcessMonitor');
  }

  private handleRF4Stopped(): void {
    this.logger.info('RF4 Game Process Stopped');
    
    this.processStatus.isRunning = false;
    this.processStatus.processId = null;

    EventManager.emit('rf4s.game_disconnected', {
      reason: 'process_stopped',
      timestamp: new Date()
    }, 'RF4SProcessMonitor');

    EventManager.emit('system.game_connection_lost', {
      game: 'Russian Fishing 4',
      reason: 'Process terminated'
    }, 'RF4SProcessMonitor');
  }

  private handleRF4MetricsUpdate(processInfo: any): void {
    if (this.processStatus.isRunning) {
      this.processStatus.memoryUsage = processInfo.memoryUsage;
      this.processStatus.cpuUsage = processInfo.cpuUsage;
      this.processStatus.lastActivity = new Date();

      // Emit performance update
      EventManager.emit('rf4s.performance_update', {
        cpuUsage: processInfo.cpuUsage,
        memoryUsage: processInfo.memoryUsage,
        fps: 60, // Would be detected from game
        timestamp: new Date()
      }, 'RF4SProcessMonitor');
    }
  }

  private updateProcessMetrics(): void {
    if (this.processStatus.isRunning) {
      // Check if process is still healthy
      const isHealthy = ProcessBridge.checkRF4Health();
      
      if (!isHealthy) {
        this.logger.warn('RF4 process health issues detected');
        EventManager.emit('rf4s.performance_warning', {
          processId: this.processStatus.processId,
          memoryUsage: this.processStatus.memoryUsage,
          cpuUsage: this.processStatus.cpuUsage,
          issue: 'High resource usage detected'
        }, 'RF4SProcessMonitor');
      }
    }
  }

  getProcessStatus(): RF4ProcessStatus {
    return { ...this.processStatus };
  }

  isGameRunning(): boolean {
    return this.processStatus.isRunning;
  }

  getGameProcessId(): number | null {
    return this.processStatus.processId;
  }

  getGameMemoryUsage(): number {
    return this.processStatus.memoryUsage;
  }

  // Method to interact with RF4 process (for future expansion)
  async sendCommandToGame(command: string, data?: any): Promise<boolean> {
    if (!this.processStatus.isRunning) {
      this.logger.error('Cannot send command: RF4 process not running');
      return false;
    }

    this.logger.info(`Sending command to RF4: ${command}`);
    
    // In production, this would use actual IPC or memory injection
    // For now, we'll simulate the command
    EventManager.emit('rf4s.command_sent', {
      command,
      data,
      processId: this.processStatus.processId,
      success: true
    }, 'RF4SProcessMonitor');

    return true;
  }
}

export const RF4SProcessMonitor = new RF4SProcessMonitorImpl();
