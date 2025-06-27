
import { EventManager } from '../core/EventManager';
import { useRF4SStore, FishingProfile } from '../stores/rf4sStore';
import { rf4sService } from '../rf4s/services/rf4sService';

interface ProfileConfiguration {
  profileId: string;
  technique: 'bottom' | 'spin' | 'float' | 'pirk';
  settings: {
    castPower: number;
    sensitivity: number;
    delay: number;
    specialized: Record<string, any>;
  };
}

class ProfileLogicManagerImpl {
  private activeProfile: ProfileConfiguration | null = null;
  private profileConfigurations: Map<string, ProfileConfiguration> = new Map();

  initialize(): void {
    console.log('Profile Logic Manager initialized');
    this.loadProfileConfigurations();
    this.setupEventListeners();
  }

  private loadProfileConfigurations(): void {
    const { fishingProfiles } = useRF4SStore.getState();
    
    fishingProfiles.forEach(profile => {
      const config: ProfileConfiguration = {
        profileId: profile.id,
        technique: this.mapTechnique(profile.technique),
        settings: {
          castPower: profile.settings.castDistance / 10, // Convert to power scale
          sensitivity: profile.settings.sensitivity,
          delay: profile.settings.retrieveSpeed,
          specialized: this.getSpecializedSettings(profile)
        }
      };
      
      this.profileConfigurations.set(profile.id, config);
    });
  }

  private mapTechnique(technique: string): 'bottom' | 'spin' | 'float' | 'pirk' {
    switch (technique.toLowerCase()) {
      case 'spinning': return 'spin';
      case 'float': return 'float';
      case 'bottom': return 'bottom';
      case 'pirk': return 'pirk';
      default: return 'bottom';
    }
  }

  private getSpecializedSettings(profile: FishingProfile): Record<string, any> {
    const technique = this.mapTechnique(profile.technique);
    
    switch (technique) {
      case 'bottom':
        return {
          waitTime: 30,
          hookDelay: 2,
          checkInterval: 5
        };
      case 'spin':
        return {
          retrieveSpeed: profile.settings.retrieveSpeed,
          twitchFrequency: 3,
          pauseInterval: 1
        };
      case 'float':
        return {
          floatSensitivity: profile.settings.sensitivity,
          driftTimeout: 15,
          pullDelay: 0.5
        };
      case 'pirk':
        return {
          pirkDuration: 10,
          sinkTimeout: 5,
          cycleDelay: 2
        };
      default:
        return {};
    }
  }

  private setupEventListeners(): void {
    // Listen for profile changes
    EventManager.subscribe('profile.changed', (profileId: string) => {
      this.activateProfile(profileId);
    });

    // Listen for profile updates
    EventManager.subscribe('profile.updated', (data: any) => {
      this.updateProfileConfiguration(data.profileId, data.updates);
    });
  }

  activateProfile(profileId: string): void {
    const config = this.profileConfigurations.get(profileId);
    if (!config) {
      console.error('Profile configuration not found:', profileId);
      return;
    }

    this.activeProfile = config;
    this.applyProfileToRF4S(config);
    
    console.log('Profile activated:', config.profileId, config.technique);
    
    // Emit profile activation event
    EventManager.emit('profile.activated', {
      profileId: config.profileId,
      technique: config.technique,
      settings: config.settings
    }, 'ProfileLogicManager');
  }

  private applyProfileToRF4S(config: ProfileConfiguration): void {
    // Update RF4S configuration based on profile
    rf4sService.updateConfig('detection', {
      fishBite: config.settings.sensitivity,
      spoolConfidence: config.settings.sensitivity + 0.1
    });

    // Update automation settings
    rf4sService.updateConfig('automation', {
      [`${config.technique}Enabled`]: true,
      castDelayMin: config.settings.delay,
      castDelayMax: config.settings.delay + 2,
      ...config.settings.specialized
    });
  }

  updateProfileConfiguration(profileId: string, updates: Partial<FishingProfile>): void {
    const config = this.profileConfigurations.get(profileId);
    if (!config) return;

    // Update configuration based on profile changes
    if (updates.settings) {
      config.settings = {
        ...config.settings,
        castPower: updates.settings.castDistance ? updates.settings.castDistance / 10 : config.settings.castPower,
        sensitivity: updates.settings.sensitivity || config.settings.sensitivity,
        delay: updates.settings.retrieveSpeed || config.settings.delay
      };
    }

    this.profileConfigurations.set(profileId, config);
    
    // If this is the active profile, reapply settings
    if (this.activeProfile?.profileId === profileId) {
      this.applyProfileToRF4S(config);
    }
  }

  getActiveProfile(): ProfileConfiguration | null {
    return this.activeProfile;
  }

  getProfileConfiguration(profileId: string): ProfileConfiguration | null {
    return this.profileConfigurations.get(profileId) || null;
  }

  getAllProfileConfigurations(): ProfileConfiguration[] {
    return Array.from(this.profileConfigurations.values());
  }

  optimizeProfileSettings(profileId: string, performanceData: any): void {
    const config = this.profileConfigurations.get(profileId);
    if (!config) return;

    // Optimize settings based on performance data
    if (performanceData.successRate < 70) {
      // Increase sensitivity if success rate is low
      config.settings.sensitivity = Math.min(1.0, config.settings.sensitivity + 0.05);
    } else if (performanceData.successRate > 90) {
      // Decrease sensitivity if success rate is too high (might be false positives)
      config.settings.sensitivity = Math.max(0.3, config.settings.sensitivity - 0.02);
    }

    // Optimize cast timing based on fish per hour
    if (performanceData.fishPerHour < 15) {
      config.settings.delay = Math.max(1, config.settings.delay - 0.5);
    }

    this.profileConfigurations.set(profileId, config);
    console.log('Profile optimized:', profileId, config.settings);
  }
}

export const ProfileLogicManager = new ProfileLogicManagerImpl();
