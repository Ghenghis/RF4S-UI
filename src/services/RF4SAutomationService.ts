
import { EventManager } from '../core/EventManager';
import { rf4sService } from '../rf4s/services/rf4sService';
import { useRF4SStore } from '../stores/rf4sStore';

interface AutomationState {
  isRunning: boolean;
  currentTechnique: 'bottom' | 'spin' | 'float' | 'pirk' | null;
  lastCastTime: Date | null;
  lastActionTime: Date | null;
  castCount: number;
}

class RF4SAutomationServiceImpl {
  private automationState: AutomationState = {
    isRunning: false,
    currentTechnique: null,
    lastCastTime: null,
    lastActionTime: null,
    castCount: 0
  };

  private automationInterval: NodeJS.Timeout | null = null;

  start(): void {
    if (this.automationState.isRunning) return;

    this.automationState.isRunning = true;
    console.log('RF4S Automation Service started');

    // Start automation loop
    this.automationInterval = setInterval(() => {
      this.processAutomation();
    }, 1000);

    // Listen for detection events
    this.setupEventListeners();
  }

  stop(): void {
    if (this.automationInterval) {
      clearInterval(this.automationInterval);
      this.automationInterval = null;
    }
    this.automationState.isRunning = false;
    console.log('RF4S Automation Service stopped');
  }

  private setupEventListeners(): void {
    // Listen for fish bite detection
    EventManager.subscribe('fishing.fish_bite_detected', (data) => {
      this.handleFishBite(data);
    });

    // Listen for spool detection
    EventManager.subscribe('fishing.spool_detected', (data) => {
      this.handleSpoolDetection(data);
    });

    // Listen for snag detection
    EventManager.subscribe('fishing.snag_detected', (data) => {
      this.handleSnagDetection(data);
    });
  }

  private processAutomation(): void {
    const config = rf4sService.getConfig();
    const { automation } = config;

    // Check if we need to cast
    if (this.shouldCast(automation)) {
      this.performCast();
    }

    // Check technique-specific automation
    if (automation.bottomEnabled && this.automationState.currentTechnique === 'bottom') {
      this.processBottomFishing(automation);
    }

    if (automation.spinEnabled && this.automationState.currentTechnique === 'spin') {
      this.processSpinFishing(automation);
    }

    if (automation.pirkEnabled && this.automationState.currentTechnique === 'pirk') {
      this.processPirkFishing(automation);
    }
  }

  private shouldCast(automation: any): boolean {
    if (!this.automationState.lastCastTime) return true;

    const timeSinceLastCast = Date.now() - this.automationState.lastCastTime.getTime();
    const minDelay = automation.castDelayMin * 1000;
    const maxDelay = automation.castDelayMax * 1000;
    const randomDelay = minDelay + Math.random() * (maxDelay - minDelay);

    return timeSinceLastCast > randomDelay;
  }

  private performCast(): void {
    console.log('Performing automated cast');
    
    this.automationState.lastCastTime = new Date();
    this.automationState.lastActionTime = new Date();
    this.automationState.castCount++;

    // Emit cast event
    EventManager.emit('automation.cast_performed', {
      castNumber: this.automationState.castCount,
      technique: this.automationState.currentTechnique,
      timestamp: new Date()
    }, 'RF4SAutomationService');

    // Update fishing stats
    rf4sService.getTimer().updateCastTime();
  }

  private processBottomFishing(automation: any): void {
    if (!this.automationState.lastCastTime) return;

    const timeSinceCast = Date.now() - this.automationState.lastCastTime.getTime();
    const waitTime = automation.bottomWaitTime * 1000;

    if (timeSinceCast > waitTime) {
      console.log('Bottom fishing: Wait time exceeded, checking for fish');
      
      // Simulate fish check
      if (Math.random() < 0.3) { // 30% chance of fish
        this.performHook(automation.bottomHookDelay);
      }
    }
  }

  private processSpinFishing(automation: any): void {
    if (!this.automationState.lastActionTime) return;

    const timeSinceAction = Date.now() - this.automationState.lastActionTime.getTime();
    const twitchInterval = (automation.spinTwitchFrequency * 1000);

    if (timeSinceAction > twitchInterval) {
      console.log('Spin fishing: Performing twitch');
      this.performSpinTwitch(automation);
    }
  }

  private processPirkFishing(automation: any): void {
    if (!this.automationState.lastActionTime) return;

    const timeSinceAction = Date.now() - this.automationState.lastActionTime.getTime();

    if (timeSinceAction > 5000) { // 5 second intervals
      console.log('Pirk fishing: Performing pirk action');
      this.performPirkAction();
    }
  }

  private performHook(delay: number): void {
    setTimeout(() => {
      console.log('Performing hook action');
      
      // Emit hook event
      EventManager.emit('automation.hook_performed', {
        technique: this.automationState.currentTechnique,
        timestamp: new Date()
      }, 'RF4SAutomationService');
      
      this.automationState.lastActionTime = new Date();
    }, delay * 1000);
  }

  private performSpinTwitch(automation: any): void {
    console.log('Performing spin twitch at speed:', automation.spinRetrieveSpeed);
    
    // Emit twitch event
    EventManager.emit('automation.spin_twitch', {
      speed: automation.spinRetrieveSpeed,
      timestamp: new Date()
    }, 'RF4SAutomationService');
    
    this.automationState.lastActionTime = new Date();
  }

  private performPirkAction(): void {
    console.log('Performing pirk action');
    
    // Emit pirk event
    EventManager.emit('automation.pirk_action', {
      timestamp: new Date()
    }, 'RF4SAutomationService');
    
    this.automationState.lastActionTime = new Date();
  }

  private handleFishBite(data: any): void {
    console.log('Automation handling fish bite:', data);
    
    // Quick hook on fish bite
    this.performHook(0.5); // 500ms delay
  }

  private handleSpoolDetection(data: any): void {
    console.log('Automation handling spool detection:', data);
    
    // Stop current automation and wait
    this.automationState.lastActionTime = new Date();
  }

  private handleSnagDetection(data: any): void {
    console.log('Automation handling snag detection:', data);
    
    // Break line or attempt to free
    this.performCast(); // Recast after snag
  }

  setTechnique(technique: 'bottom' | 'spin' | 'float' | 'pirk'): void {
    this.automationState.currentTechnique = technique;
    console.log('Automation technique set to:', technique);
    
    // Emit technique change event
    EventManager.emit('automation.technique_changed', {
      technique,
      timestamp: new Date()
    }, 'RF4SAutomationService');
  }

  getAutomationState(): AutomationState {
    return { ...this.automationState };
  }

  updateAutomationSettings(settings: any): void {
    rf4sService.updateConfig('automation', settings);
    console.log('Automation settings updated:', settings);
  }
}

export const RF4SAutomationService = new RF4SAutomationServiceImpl();
