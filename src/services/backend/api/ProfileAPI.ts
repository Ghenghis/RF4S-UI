
import { createRichLogger } from '../../../rf4s/utils';

export interface Profile {
  id: string;
  name: string;
  description: string;
  settings: any;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export class ProfileAPI {
  private logger = createRichLogger('ProfileAPI');
  private profiles: Profile[] = [
    {
      id: 'default',
      name: 'Default Profile',
      description: 'Default fishing configuration',
      settings: {
        detection: { spoolConfidence: 0.8 },
        automation: { castDelayMin: 2, castDelayMax: 4 }
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    }
  ];

  async getProfiles(): Promise<{ success: boolean; data?: Profile[]; errors: string[] }> {
    this.logger.info('ProfileAPI: Getting profiles...');
    
    try {
      // Load profiles from localStorage (real file I/O simulation)
      const savedProfiles = localStorage.getItem('rf4s_profiles');
      if (savedProfiles) {
        const parsedProfiles = JSON.parse(savedProfiles).map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        }));
        this.profiles = parsedProfiles;
      }
      
      return { success: true, data: [...this.profiles], errors: [] };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to get profiles:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async createProfile(profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data?: Profile; errors: string[] }> {
    this.logger.info('ProfileAPI: Creating profile...');
    
    try {
      const newProfile: Profile = {
        ...profile,
        id: `profile_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Load existing profiles
      await this.getProfiles();
      
      // Add new profile
      this.profiles.push(newProfile);
      
      // Save to localStorage (real file I/O simulation)
      localStorage.setItem('rf4s_profiles', JSON.stringify(this.profiles));
      
      this.logger.info(`Profile created: ${newProfile.name}`);
      return { success: true, data: newProfile, errors: [] };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to create profile:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async updateProfile(profileId: string, updates: Partial<Profile>): Promise<{ success: boolean; data?: Profile; errors: string[] }> {
    this.logger.info(`ProfileAPI: Updating profile ${profileId}...`);
    
    try {
      // Load existing profiles
      await this.getProfiles();
      
      const profileIndex = this.profiles.findIndex(p => p.id === profileId);
      
      if (profileIndex === -1) {
        return { success: false, errors: ['Profile not found'] };
      }
      
      this.profiles[profileIndex] = {
        ...this.profiles[profileIndex],
        ...updates,
        updatedAt: new Date()
      };
      
      // Save to localStorage
      localStorage.setItem('rf4s_profiles', JSON.stringify(this.profiles));
      
      this.logger.info(`Profile updated: ${this.profiles[profileIndex].name}`);
      return { success: true, data: this.profiles[profileIndex], errors: [] };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to update profile:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async deleteProfile(profileId: string): Promise<{ success: boolean; errors: string[] }> {
    this.logger.info(`ProfileAPI: Deleting profile ${profileId}...`);
    
    try {
      // Load existing profiles
      await this.getProfiles();
      
      const profileIndex = this.profiles.findIndex(p => p.id === profileId);
      
      if (profileIndex === -1) {
        return { success: false, errors: ['Profile not found'] };
      }
      
      const deletedProfile = this.profiles[profileIndex];
      this.profiles.splice(profileIndex, 1);
      
      // Save to localStorage
      localStorage.setItem('rf4s_profiles', JSON.stringify(this.profiles));
      
      this.logger.info(`Profile deleted: ${deletedProfile.name}`);
      return { success: true, errors: [] };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to delete profile:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async activateProfile(profileId: string): Promise<{ success: boolean; errors: string[] }> {
    this.logger.info(`ProfileAPI: Activating profile ${profileId}...`);
    
    try {
      // Load existing profiles
      await this.getProfiles();
      
      // Deactivate all profiles
      this.profiles.forEach(p => p.isActive = false);
      
      // Activate the specified profile
      const profile = this.profiles.find(p => p.id === profileId);
      if (!profile) {
        return { success: false, errors: ['Profile not found'] };
      }
      
      profile.isActive = true;
      profile.updatedAt = new Date();
      
      // Save to localStorage
      localStorage.setItem('rf4s_profiles', JSON.stringify(this.profiles));
      
      this.logger.info(`Profile activated: ${profile.name}`);
      return { success: true, errors: [] };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to activate profile:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async exportProfile(profileId: string): Promise<{ success: boolean; data?: string; errors: string[] }> {
    try {
      await this.getProfiles();
      const profile = this.profiles.find(p => p.id === profileId);
      
      if (!profile) {
        return { success: false, errors: ['Profile not found'] };
      }
      
      const exportData = JSON.stringify(profile, null, 2);
      this.logger.info(`Profile exported: ${profile.name}`);
      
      return { success: true, data: exportData, errors: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to export profile:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async importProfile(profileData: string): Promise<{ success: boolean; data?: Profile; errors: string[] }> {
    try {
      const parsedProfile = JSON.parse(profileData);
      
      // Generate new ID and timestamps
      const importedProfile: Profile = {
        ...parsedProfile,
        id: `profile_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: false
      };
      
      const result = await this.createProfile(importedProfile);
      
      if (result.success) {
        this.logger.info(`Profile imported: ${importedProfile.name}`);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid profile data';
      this.logger.error('Failed to import profile:', error);
      return { success: false, errors: [errorMessage] };
    }
  }
}
