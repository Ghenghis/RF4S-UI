
import { EventManager } from '../core/EventManager';
import { rf4sService } from '../rf4s/services/rf4sService';
import { useRF4SStore } from '../stores/rf4sStore';

interface DetectionResult {
  type: 'spool' | 'fish_bite' | 'rod_tip' | 'snag';
  confidence: number;
  timestamp: Date;
  position?: { x: number; y: number };
  metadata?: any;
}

interface GameState {
  detected: boolean;
  windowHandle: number | null;
  resolution: { width: number; height: number };
  lastActivity: Date;
}

class RF4SDetectionServiceImpl {
  private isRunning = false;
  private detectionInterval: NodeJS.Timeout | null = null;
  private gameState: GameState = {
    detected: false,
    windowHandle: null,
    resolution: { width: 1920, height: 1080 },
    lastActivity: new Date()
  };

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('RF4S Detection Service started');
    
    // Start detection loop
    this.detectionInterval = setInterval(() => {
      this.performDetection();
    }, 100); // 10 FPS detection rate
    
    // Initialize game detection
    this.detectGame();
  }

  stop(): void {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
    this.isRunning = false;
    console.log('RF4S Detection Service stopped');
  }

  private async performDetection(): Promise<void> {
    if (!this.gameState.detected) return;
    
    const { detection } = rf4sService.getConfig();
    
    // Simulate spool detection
    if (Math.random() < 0.001) { // Very rare event
      const result: DetectionResult = {
        type: 'spool',
        confidence: detection.spoolConfidence,
        timestamp: new Date(),
        position: { x: 960, y: 540 }
      };
      
      this.handleDetectionResult(result);
    }
    
    // Simulate fish bite detection
    if (Math.random() < 0.005) { // Rare event
      const result: DetectionResult = {
        type: 'fish_bite',
        confidence: detection.fishBite,
        timestamp: new Date(),
        position: { x: 960 + Math.random() * 100 - 50, y: 540 + Math.random() * 100 - 50 }
      };
      
      this.handleDetectionResult(result);
    }
    
    // Simulate rod tip detection
    if (Math.random() < 0.01) {
      const result: DetectionResult = {
        type: 'rod_tip',
        confidence: detection.rodTip,
        timestamp: new Date(),
        position: { x: 800 + Math.random() * 200, y: 400 + Math.random() * 200 }
      };
      
      this.handleDetectionResult(result);
    }
  }

  private handleDetectionResult(result: DetectionResult): void {
    console.log('Detection result:', result);
    
    // Update store with detection confidence
    const { updateConfig } = useRF4SStore.getState();
    updateConfig('detection', {
      [`${result.type}Confidence`]: result.confidence
    });
    
    // Emit detection events
    EventManager.emit('rf4s.detection_result', result, 'RF4SDetectionService');
    
    // Handle specific detection types
    switch (result.type) {
      case 'fish_bite':
        this.handleFishBite(result);
        break;
      case 'spool':
        this.handleSpoolDetection(result);
        break;
      case 'rod_tip':
        this.handleRodTipMovement(result);
        break;
      case 'snag':
        this.handleSnagDetection(result);
        break;
    }
  }

  private handleFishBite(result: DetectionResult): void {
    console.log('Fish bite detected!', result);
    
    // Trigger fish caught in RF4S service
    rf4sService.updateFishCount('green'); // Default to green
    
    // Emit fish bite event
    EventManager.emit('fishing.fish_bite_detected', {
      confidence: result.confidence,
      position: result.position,
      timestamp: result.timestamp
    }, 'RF4SDetectionService');
  }

  private handleSpoolDetection(result: DetectionResult): void {
    console.log('Spool detected!', result);
    
    // Emit spool event
    EventManager.emit('fishing.spool_detected', {
      confidence: result.confidence,
      timestamp: result.timestamp
    }, 'RF4SDetectionService');
  }

  private handleRodTipMovement(result: DetectionResult): void {
    console.log('Rod tip movement detected!', result);
    
    // Emit rod tip event
    EventManager.emit('fishing.rod_tip_movement', {
      confidence: result.confidence,
      position: result.position,
      timestamp: result.timestamp
    }, 'RF4SDetectionService');
  }

  private handleSnagDetection(result: DetectionResult): void {
    console.log('Snag detected!', result);
    
    // Emit snag event
    EventManager.emit('fishing.snag_detected', {
      confidence: result.confidence,
      timestamp: result.timestamp
    }, 'RF4SDetectionService');
  }

  private detectGame(): void {
    // Simulate game detection
    setTimeout(() => {
      this.gameState.detected = true;
      this.gameState.windowHandle = Math.floor(Math.random() * 100000);
      this.gameState.lastActivity = new Date();
      
      console.log('Game detected!', this.gameState);
      
      // Update store
      const { setGameDetectionActive } = useRF4SStore.getState();
      setGameDetectionActive(true);
      
      // Emit game detection event
      EventManager.emit('game.detected', this.gameState, 'RF4SDetectionService');
    }, 2000);
  }

  getGameState(): GameState {
    return { ...this.gameState };
  }

  isGameDetected(): boolean {
    return this.gameState.detected;
  }

  updateDetectionSettings(settings: any): void {
    rf4sService.updateConfig('detection', settings);
    console.log('Detection settings updated:', settings);
  }
}

export const RF4SDetectionService = new RF4SDetectionServiceImpl();
