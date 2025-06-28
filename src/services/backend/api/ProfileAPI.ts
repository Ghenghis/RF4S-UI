
import { EventManager } from '../../../core/EventManager';
import { createRichLogger } from '../../../rf4s/utils';

export interface Profile {
  id: string;
  name: string;
  description?: string;
  settings: {
    detection: any;
    automation: any;
    ui: any;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ProfileAPI {
  private logger = createRichLogger('ProfileAPI');
  private profiles: Map<string, Profile> = new Map();
  private activeProfileId: string | null = null;

  constructor() {
    this.loadDefaultProfiles();
  }

  private loadDefaultProfiles(): void {
    const defaultProfile: Profile = {
      id: 'default',
      name: 'Default Profile',
      description: 'Default configuration profile',
      settings: {
        detection: {
          spoolConfidence: 0.8,
          fishBite: 0.7,
          imageVerification: true
        },
        automation: {
          castDelayMin: 2,
          castDelayMax: 4,
          reelSpeed: 'medium'
        },
        ui: {
          theme: 'dark',
          notifications: true
        }
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.profiles.set(defaultProfile.id, defaultProfile);
    this.activeProfileId = defaultProfile.id;
  }

  async createProfile(profileData: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data?: Profile; errors: string[] }> {
    try {
      const id = `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const profile: Profile = {
        ...profileData,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.profiles.set(id, profile);
      this.logger.info(`Profile created: ${profile.name}`);

      return { success: true, data: profile, errors: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to create profile:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async updateProfile(profileId: string, updates: Partial<Profile>): Promise<{ success: boolean; data?: Profile; errors: string[] }> {
    try {
      const existingProfile = this.profiles.get(profileId);
      if (!existingProfile) {
        return { success: false, errors: ['Profile not found'] };
      }

      const updatedProfile: Profile = {
        ...existingProfile,
        ...updates,
        id: profileId, // Ensure ID doesn't change
        updatedAt: new Date()
      };

      this.profiles.set(profileId, updatedProfile);
      this.logger.info(`Profile updated: ${updatedProfile.name}`);

      return { success: true, data: updatedProfile, errors: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to update profile:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async deleteProfile(profileId: string): Promise<{ success: boolean; errors: string[] }> {
    try {
      if (!this.profiles.has(profileId)) {
        return { success: false, errors: ['Profile not found'] };
      }

      if (profileId === this.activeProfileId) {
        return { success: false, errors: ['Cannot delete active profile'] };
      }

      this.profiles.delete(profileId);
      this.logger.info(`Profile deleted: ${profileId}`);

      return { success: true, errors: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to delete profile:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async activateProfile(profileId: string): Promise<{ success: boolean; errors: string[] }> {
    try {
      if (!this.profiles.has(profileId)) {
        return { success: false, errors: ['Profile not found'] };
      }

      // Deactivate current active profile
      if (this.activeProfileId) {
        const currentActive = this.profiles.get(this.activeProfileId);
        if (currentActive) {
          currentActive.isActive = false;
          this.profiles.set(this.activeProfileId, currentActive);
        }
      }

      // Activate new profile
      const newActive = this.profiles.get(profileId)!;
      newActive.isActive = true;
      this.profiles.set(profileId, newActive);
      this.activeProfileId = profileId;

      this.logger.info(`Profile activated: ${newActive.name}`);
      return { success: true, errors: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to activate profile:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async getProfiles(): Promise<{ success: boolean; data?: Profile[]; errors: string[] }> {
    try {
      const profiles = Array.from(this.profiles.values());
      return { success: true, data: profiles, errors: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to get profiles:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async exportProfile(profileId: string): Promise<{ success: boolean; data?: string; errors: string[] }> {
    try {
      const profile = this.profiles.get(profileId);
      if (!profile) {
        return { success: false, errors: ['Profile not found'] };
      }

      const exportData = JSON.stringify(profile, null, 2);
      return { success: true, data: exportData, errors: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to export profile:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async importProfile(profileData: string): Promise<{ success: boolean; data?: Profile; errors: string[] }> {
    try {
      const parsed = JSON.parse(profileData);
      const id = `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const profile: Profile = {
        ...parsed,
        id,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.profiles.set(id, profile);
      this.logger.info(`Profile imported: ${profile.name}`);

      return { success: true, data: profile, errors: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to import profile:', error);
      return { success: false, errors: [errorMessage] };
    }
  }
}
