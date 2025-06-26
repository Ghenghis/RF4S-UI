
import { EventManager } from '../../core/EventManager';
import { useRF4SStore } from '../../stores/rf4sStore';
import { RF4SStatus } from '../../types/metrics';

class RF4SStatusServiceImpl {
  private rf4sStatus: RF4SStatus = {
    processRunning: false,
    gameDetected: false,
    configLoaded: false,
    lastActivity: Date.now(),
    errorCount: 0
  };

  updateStatus(): void {
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

  updateGameDetection(detected: boolean): void {
    if (this.rf4sStatus.gameDetected !== detected) {
      this.rf4sStatus.gameDetected = detected;
      this.rf4sStatus.lastActivity = Date.now();
      
      EventManager.emit('game.detection_changed', {
        detected,
        timestamp: this.rf4sStatus.lastActivity
      }, 'RF4SStatusService');
    }
  }

  updateProcessStatus(running: boolean): void {
    if (this.rf4sStatus.processRunning !== running) {
      this.rf4sStatus.processRunning = running;
      this.rf4sStatus.lastActivity = Date.now();
      
      EventManager.emit('process.status_changed', {
        running,
        timestamp: this.rf4sStatus.lastActivity
      }, 'RF4SStatusService');
    }
  }

  reportError(error: string): void {
    this.rf4sStatus.errorCount++;
    
    EventManager.emit('system.error_reported', {
      error,
      totalErrors: this.rf4sStatus.errorCount,
      timestamp: Date.now()
    }, 'RF4SStatusService');
  }

  getRF4SStatus(): RF4SStatus {
    return { ...this.rf4sStatus };
  }
}

export const RF4SStatusService = new RF4SStatusServiceImpl();
