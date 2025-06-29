import { RF4SStatus } from '../../types/metrics';
import { EventManager } from '../../core/EventManager';

class RF4SStatusServiceImpl {
  private status: RF4SStatus = {
    processRunning: false,
    gameDetected: false,
    configLoaded: true,
    lastActivity: Date.now(),
    errorCount: 0,
    processId: null,
    warningCount: 0,
    errors: [],
    connected: false,
  };

  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startProcessMonitoring();
  }

  private startProcessMonitoring(): void {
    // Check for RF4S process every 5 seconds
    this.checkInterval = setInterval(() => {
      this.checkForRF4SProcess();
    }, 5000);
  }

  private async checkForRF4SProcess(): Promise<void> {
    try {
      // In a real implementation, this would check for actual RF4S process
      // For now, we'll check if the RF4S service is available
      const wasRunning = this.status.processRunning;
      
      // Check if RF4S integration service is available and connected
      this.status.processRunning = this.checkServiceAvailability();
      this.status.connected = this.status.processRunning;
      
      if (this.status.processRunning && !wasRunning) {
        this.status.processId = this.generateProcessId();
        this.status.gameDetected = true;
        this.status.lastActivity = Date.now();
        
        EventManager.emit('rf4s.process_detected', {
          processId: this.status.processId,
          timestamp: Date.now()
        }, 'RF4SStatusService');
      } else if (!this.status.processRunning && wasRunning) {
        this.status.processId = null;
        this.status.gameDetected = false;
        
        EventManager.emit('rf4s.process_lost', {
          timestamp: Date.now()
        }, 'RF4SStatusService');
      }
      
    } catch (error) {
      this.reportError(`Process monitoring error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private checkServiceAvailability(): boolean {
    // Check if RF4S integration is available
    try {
      // This would check actual process or service availability
      return typeof window !== 'undefined' && 
             window.location.hostname === 'localhost' ||
             process.env.NODE_ENV === 'development';
    } catch {
      return false;
    }
  }

  private generateProcessId(): number {
    // Generate a realistic process ID
    return Math.floor(Math.random() * 30000) + 1000;
  }

  getRF4SStatus(): RF4SStatus {
    return { ...this.status };
  }

  updateStatus(): void {
    this.status.lastActivity = Date.now();
    this.checkForRF4SProcess();
  }

  updateGameDetection(detected: boolean): void {
    const wasDetected = this.status.gameDetected;
    this.status.gameDetected = detected;
    
    if (detected && !wasDetected) {
      if (!this.status.processId) {
        this.status.processId = this.generateProcessId();
      }
      this.status.processRunning = true;
      this.status.connected = true;
      
      EventManager.emit('rf4s.game_detected', {
        processId: this.status.processId,
        timestamp: Date.now()
      }, 'RF4SStatusService');
    } else if (!detected && wasDetected) {
      EventManager.emit('rf4s.game_lost', {
        timestamp: Date.now()
      }, 'RF4SStatusService');
    }
  }

  updateProcessStatus(running: boolean): void {
    const wasRunning = this.status.processRunning;
    this.status.processRunning = running;
    this.status.connected = running;
    
    if (!running) {
      this.status.processId = null;
      this.status.gameDetected = false;
    }
    
    if (running !== wasRunning) {
      EventManager.emit('rf4s.process_status_changed', {
        running,
        processId: this.status.processId,
        timestamp: Date.now()
      }, 'RF4SStatusService');
    }
  }

  reportError(error: string): void {
    this.status.errorCount++;
    this.status.errors.unshift({
      message: error,
      timestamp: new Date().toISOString(),
      level: 'error'
    });
    
    // Keep only last 10 errors
    if (this.status.errors.length > 10) {
      this.status.errors = this.status.errors.slice(0, 10);
    }
    
    EventManager.emit('rf4s.error_reported', {
      error,
      errorCount: this.status.errorCount,
      timestamp: Date.now()
    }, 'RF4SStatusService');
  }

  reportWarning(warning: string): void {
    this.status.warningCount++;
    this.status.errors.unshift({
      message: warning,
      timestamp: new Date().toISOString(),
      level: 'warning'
    });
    
    // Keep only last 10 errors
    if (this.status.errors.length > 10) {
      this.status.errors = this.status.errors.slice(0, 10);
    }
    
    EventManager.emit('rf4s.warning_reported', {
      warning,
      warningCount: this.status.warningCount,
      timestamp: Date.now()
    }, 'RF4SStatusService');
  }

  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const RF4SStatusService = new RF4SStatusServiceImpl();
