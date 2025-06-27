
import { EventManager } from '../core/EventManager';
import { useRF4SStore, FishingProfile } from '../stores/rf4sStore';
import { RF4SAutomationService } from './RF4SAutomationService';
import { rf4sService } from '../rf4s/services/rf4sService';

class RF4SFishingProfileServiceImpl {
  private activeProfileId: string | null = null;
  private profileUpdateInterval: NodeJS.Timeout | null = null;

  start(): void {
    console.log('RF4S Fishing Profile Service started');
    
    // Start profile monitoring
    this.profileUpdateInterval = setInterval(() => {
      this.updateActiveProfile();
    }, 5000);

    // Listen for profile changes
    this.setupEventListeners();
  }

  stop(): void {
    if (this.profileUpdateInterval) {
      clearInterval(this.profileUpdateInterval);
      this.profileUpdateInterval = null;
    }
    console.log('RF4S Fishing Profile Service stopped');
  }

  private setupEventListeners(): void {
    // Listen for automation events to update profile stats
    EventManager.subscribe('automation.cast_performed', (data) => {
      this.updateProfileStats('cast', data);
    });

    EventManager.subscribe('fishing.fish_bite_detected', (data) => {
      this.updateProfileStats('fish_caught', data);
    });
  }

  private updateActiveProfile(): void {
    const { fishingProfiles, activeFishingProfile } = useRF4SStore.getState();
    
    if (activeFishingProfile && activeFishingProfile !== this.activeProfileId) {
      this.activeProfileId = activeFishingProfile;
      this.applyProfile(activeFishingProfile);
    }
  }

  private applyProfile(profileId: string): void {
    const { fishingProfiles } = useRF4SStore.getState();
    const profile = fishingProfiles.find(p => p.id === profileId);
    
    if (!profile) {
      console.error('Profile not found:', profileId);
      return;
    }

    console.log('Applying fishing profile:', profile.name);

    // Apply profile settings to RF4S config
    rf4sService.updateConfig('detection', {
      fishBite: profile.settings.sensitivity,
      spoolConfidence: profile.settings.sensitivity + 0.1
    });

    // Set automation technique
    RF4SAutomationService.setTechnique(this.getTechniqueFromProfile(profile));

    // Update automation settings based on profile
    const automationSettings = this.getAutomationSettingsFromProfile(profile);
    rf4sService.updateConfig('automation', automationSettings);

    // Emit profile applied event
    EventManager.emit('profile.applied', {
      profileId,
      profileName: profile.name,
      technique: profile.technique,
      timestamp: new Date()
    }, 'RF4SFishingProfileService');
  }

  private getTechniqueFromProfile(profile: FishingProfile): 'bottom' | 'spin' | 'float' | 'pirk' {
    switch (profile.technique.toLowerCase()) {
      case 'spinning':
        return 'spin';
      case 'float':
        return 'float';
      case 'bottom':
        return 'bottom';
      case 'pirk':
        return 'pirk';
      default:
        return 'bottom';
    }
  }

  private getAutomationSettingsFromProfile(profile: FishingProfile): any {
    const technique = this.getTechniqueFromProfile(profile);
    
    return {
      [`${technique}Enabled`]: true,
      castDelayMin: Math.max(1, profile.settings.castDistance / 20),
      castDelayMax: Math.max(2, profile.settings.castDistance / 15),
      [`${technique}RetrieveSpeed`]: profile.settings.retrieveSpeed,
      [`${technique}Sensitivity`]: profile.settings.sensitivity
    };
  }

  private updateProfileStats(eventType: string, data: any): void {
    if (!this.activeProfileId) return;

    const { updateFishingProfile } = useRF4SStore.getState();
    
    switch (eventType) {
      case 'cast':
        // Update cast count (simulated)
        break;
      case 'fish_caught':
        // Update success rate
        this.updateSuccessRate();
        break;
    }
  }

  private updateSuccessRate(): void {
    if (!this.activeProfileId) return;

    const { fishingProfiles, updateFishingProfile } = useRF4SStore.getState();
    const profile = fishingProfiles.find(p => p.id === this.activeProfileId);
    
    if (profile) {
      // Simulate success rate improvement
      const newSuccessRate = Math.min(100, profile.successRate + Math.random() * 2);
      updateFishingProfile(this.activeProfileId, { successRate: Math.round(newSuccessRate) });
    }
  }

  createProfile(profileData: Partial<FishingProfile>): string {
    const newProfile: FishingProfile = {
      id: `profile-${Date.now()}`,
      name: profileData.name || 'New Profile',
      technique: profileData.technique || 'Bottom',
      rodType: profileData.rodType || 'Feeder Rod',
      baitType: profileData.baitType || 'Worms',
      location: profileData.location || 'Unknown',
      active: false,
      successRate: 0,
      settings: {
        castDistance: 30,
        retrieveSpeed: 3,
        sensitivity: 0.8,
        ...profileData.settings
      }
    };

    // Add to store
    const { fishingProfiles } = useRF4SStore.getState();
    useRF4SStore.setState({
      fishingProfiles: [...fishingProfiles, newProfile]
    });

    console.log('Created new fishing profile:', newProfile.name);
    
    // Emit profile created event
    EventManager.emit('profile.created', {
      profileId: newProfile.id,
      profileName: newProfile.name,
      timestamp: new Date()
    }, 'RF4SFishingProfileService');

    return newProfile.id;
  }

  updateProfile(profileId: string, updates: Partial<FishingProfile>): void {
    const { updateFishingProfile } = useRF4SStore.getState();
    updateFishingProfile(profileId, updates);
    
    // If this is the active profile, reapply settings
    if (profileId === this.activeProfileId) {
      this.applyProfile(profileId);
    }

    console.log('Updated fishing profile:', profileId);
    
    // Emit profile updated event
    EventManager.emit('profile.updated', {
      profileId,
      updates,
      timestamp: new Date()
    }, 'RF4SFishingProfileService');
  }

  deleteProfile(profileId: string): void {
    const { fishingProfiles } = useRF4SStore.getState();
    const updatedProfiles = fishingProfiles.filter(p => p.id !== profileId);
    
    useRF4SStore.setState({
      fishingProfiles: updatedProfiles
    });

    // If this was the active profile, switch to first available
    if (profileId === this.activeProfileId && updatedProfiles.length > 0) {
      const { setActiveFishingProfile } = useRF4SStore.getState();
      setActiveFishingProfile(updatedProfiles[0].id);
    }

    console.log('Deleted fishing profile:', profileId);
    
    // Emit profile deleted event
    EventManager.emit('profile.deleted', {
      profileId,
      timestamp: new Date()
    }, 'RF4SFishingProfileService');
  }

  getActiveProfile(): FishingProfile | null {
    if (!this.activeProfileId) return null;
    
    const { fishingProfiles } = useRF4SStore.getState();
    return fishingProfiles.find(p => p.id === this.activeProfileId) || null;
  }
}

export const RF4SFishingProfileService = new RF4SFishingProfileServiceImpl();
