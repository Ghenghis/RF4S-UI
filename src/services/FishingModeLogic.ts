
import { EventManager } from '../core/EventManager';
import { rf4sService } from '../rf4s/services/rf4sService';
import { ProfileLogicManager } from './ProfileLogicManager';

interface FishingMode {
  id: string;
  name: string;
  technique: 'bottom' | 'spin' | 'float' | 'pirk';
  active: boolean;
  configuration: {
    castBehavior: 'aggressive' | 'balanced' | 'patient';
    hookTiming: 'immediate' | 'delayed' | 'smart';
    retrievalStyle: 'fast' | 'medium' | 'slow' | 'variable';
  };
}

class FishingModeLogicImpl {
  private currentMode: FishingMode | null = null;
  private availableModes: Map<string, FishingMode> = new Map();
  private modeHistory: Array<{ mode: string; timestamp: Date; duration: number }> = [];

  initialize(): void {
    console.log('Fishing Mode Logic initialized');
    this.initializeDefaultModes();
    this.setupEventListeners();
  }

  private initializeDefaultModes(): void {
    const defaultModes: FishingMode[] = [
      {
        id: 'bottom-patient',
        name: 'Bottom Patient',
        technique: 'bottom',
        active: false,
        configuration: {
          castBehavior: 'patient',
          hookTiming: 'delayed',
          retrievalStyle: 'slow'
        }
      },
      {
        id: 'spin-aggressive',
        name: 'Spin Aggressive',
        technique: 'spin',
        active: false,
        configuration: {
          castBehavior: 'aggressive',
          hookTiming: 'immediate',
          retrievalStyle: 'fast'
        }
      },
      {
        id: 'float-balanced',
        name: 'Float Balanced',
        technique: 'float',
        active: false,
        configuration: {
          castBehavior: 'balanced',
          hookTiming: 'smart',
          retrievalStyle: 'medium'
        }
      },
      {
        id: 'pirk-variable',
        name: 'Pirk Variable',
        technique: 'pirk',
        active: false,
        configuration: {
          castBehavior: 'balanced',
          hookTiming: 'smart',
          retrievalStyle: 'variable'
        }
      }
    ];

    defaultModes.forEach(mode => {
      this.availableModes.set(mode.id, mode);
    });
  }

  private setupEventListeners(): void {
    // Listen for profile changes to auto-select mode
    EventManager.subscribe('profile.activated', (data: any) => {
      this.autoSelectModeForTechnique(data.technique);
    });

    // Listen for fishing events to adapt mode
    EventManager.subscribe('fishing.fish_bite_detected', () => {
      this.handleFishingEvent('fish_bite');
    });

    EventManager.subscribe('fishing.cast_performed', () => {
      this.handleFishingEvent('cast');
    });
  }

  private autoSelectModeForTechnique(technique: string): void {
    const compatibleModes = Array.from(this.availableModes.values())
      .filter(mode => mode.technique === technique);

    if (compatibleModes.length > 0) {
      // Select the first compatible mode or a smart default
      const selectedMode = this.selectOptimalMode(compatibleModes);
      this.activateMode(selectedMode.id);
    }
  }

  private selectOptimalMode(modes: FishingMode[]): FishingMode {
    // Smart mode selection based on current conditions
    // For now, select balanced approach
    const balancedMode = modes.find(mode => mode.configuration.castBehavior === 'balanced');
    return balancedMode || modes[0];
  }

  activateMode(modeId: string): void {
    const mode = this.availableModes.get(modeId);
    if (!mode) {
      console.error('Fishing mode not found:', modeId);
      return;
    }

    // Deactivate current mode
    if (this.currentMode) {
      this.deactivateMode(this.currentMode.id);
    }

    // Activate new mode
    this.currentMode = { ...mode, active: true };
    this.availableModes.set(modeId, this.currentMode);
    
    this.applyModeConfiguration(this.currentMode);
    
    console.log('Fishing mode activated:', mode.name);
    
    // Emit mode activation event
    EventManager.emit('fishing.mode_activated', {
      modeId: mode.id,
      modeName: mode.name,
      technique: mode.technique,
      configuration: mode.configuration
    }, 'FishingModeLogic');
  }

  private deactivateMode(modeId: string): void {
    const mode = this.availableModes.get(modeId);
    if (mode) {
      mode.active = false;
      this.availableModes.set(modeId, mode);
      
      // Record mode usage
      this.modeHistory.push({
        mode: modeId,
        timestamp: new Date(),
        duration: 0 // Would calculate actual duration in production
      });
    }
  }

  private applyModeConfiguration(mode: FishingMode): void {
    const config = this.getModeAutomationConfig(mode);
    
    // Apply configuration to RF4S
    rf4sService.updateConfig('automation', config);
    
    console.log('Applied mode configuration:', mode.name, config);
  }

  private getModeAutomationConfig(mode: FishingMode): Record<string, any> {
    const baseConfig: Record<string, any> = {};
    
    // Configure cast behavior
    switch (mode.configuration.castBehavior) {
      case 'aggressive':
        baseConfig.castDelayMin = 1;
        baseConfig.castDelayMax = 3;
        break;
      case 'balanced':
        baseConfig.castDelayMin = 3;
        baseConfig.castDelayMax = 6;
        break;
      case 'patient':
        baseConfig.castDelayMin = 5;
        baseConfig.castDelayMax = 10;
        break;
    }

    // Configure hook timing
    switch (mode.configuration.hookTiming) {
      case 'immediate':
        baseConfig[`${mode.technique}HookDelay`] = 0.1;
        break;
      case 'delayed':
        baseConfig[`${mode.technique}HookDelay`] = 2.0;
        break;
      case 'smart':
        baseConfig[`${mode.technique}HookDelay`] = 1.0;
        break;
    }

    // Configure retrieval style
    switch (mode.configuration.retrievalStyle) {
      case 'fast':
        baseConfig[`${mode.technique}RetrieveSpeed`] = 8;
        break;
      case 'medium':
        baseConfig[`${mode.technique}RetrieveSpeed`] = 5;
        break;
      case 'slow':
        baseConfig[`${mode.technique}RetrieveSpeed`] = 2;
        break;
      case 'variable':
        baseConfig[`${mode.technique}RetrieveSpeed`] = 3 + Math.random() * 4;
        break;
    }

    return baseConfig;
  }

  private handleFishingEvent(eventType: string): void {
    if (!this.currentMode) return;

    // Adapt mode based on fishing events
    switch (eventType) {
      case 'fish_bite':
        // Mode performed well, reinforce current settings
        console.log('Fish bite detected - mode performing well');
        break;
      case 'cast':
        // Track casting frequency
        console.log('Cast performed in mode:', this.currentMode.name);
        break;
    }
  }

  getCurrentMode(): FishingMode | null {
    return this.currentMode;
  }

  getAvailableModes(): FishingMode[] {
    return Array.from(this.availableModes.values());
  }

  getModeHistory(): Array<{ mode: string; timestamp: Date; duration: number }> {
    return [...this.modeHistory];
  }

  createCustomMode(modeData: Partial<FishingMode>): string {
    const customMode: FishingMode = {
      id: `custom-${Date.now()}`,
      name: modeData.name || 'Custom Mode',
      technique: modeData.technique || 'bottom',
      active: false,
      configuration: {
        castBehavior: 'balanced',
        hookTiming: 'smart',
        retrievalStyle: 'medium',
        ...modeData.configuration
      }
    };

    this.availableModes.set(customMode.id, customMode);
    
    console.log('Custom fishing mode created:', customMode.name);
    
    return customMode.id;
  }
}

export const FishingModeLogic = new FishingModeLogicImpl();
