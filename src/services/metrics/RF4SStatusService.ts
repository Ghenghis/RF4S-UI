
import { RF4SStatus } from '../../types/metrics';

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

  getRF4SStatus(): RF4SStatus {
    return { ...this.status };
  }

  updateStatus(): void {
    this.status.lastActivity = Date.now();
    
    // Simulate process detection
    if (Math.random() > 0.8) {
      this.status.processRunning = true;
      this.status.processId = Math.floor(Math.random() * 10000) + 1000;
      this.status.connected = true;
    }
  }

  updateGameDetection(detected: boolean): void {
    this.status.gameDetected = detected;
    if (detected && !this.status.processId) {
      this.status.processId = Math.floor(Math.random() * 10000) + 1000;
    }
  }

  updateProcessStatus(running: boolean): void {
    this.status.processRunning = running;
    this.status.connected = running;
    if (!running) {
      this.status.processId = null;
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
  }
}

export const RF4SStatusService = new RF4SStatusServiceImpl();
