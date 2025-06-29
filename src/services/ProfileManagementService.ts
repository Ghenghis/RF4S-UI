
import { EventManager } from '../core/EventManager';
import { ServiceRegistry } from '../core/ServiceRegistry';
import { createRichLogger } from '../rf4s/utils';
import { ProfileAPI, Profile } from './backend/api/ProfileAPI';

export interface ProfileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class ProfileManagementService {
  private logger = createRichLogger('ProfileManagementService');
  private profileAPI = new ProfileAPI();
  private isInitialized = false;
  private activeProfile: Profile | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.logger.info('ProfileManagementService: Initializing...');

    try {
      // Register with ServiceRegistry
      ServiceRegistry.register('ProfileManagementService', this, ['ConfigurationManagementService'], {
        type: 'profile',
        priority: 'medium'
      });

      // Load active profile
      await this.loadActiveProfile();

      this.isInitialized = true;
      ServiceRegistry.updateStatus('ProfileManagementService', 'running');

      this.logger.info('ProfileManagementService: Successfully initialized');

      EventManager.emit('profile.service_initialized', {
        activeProfile: this.activeProfile,
        timestamp: Date.now()
      }, 'ProfileManagementService');

    } catch (error) {
      ServiceRegistry.updateStatus('ProfileManagementService', 'error');
      this.logger.error('ProfileManagementService: Initialization failed:', error);
      throw error;
    }
  }

  async createProfile(profileData: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data?: Profile; errors: string[] }> {
    try {
      const validation = this.validateProfileData(profileData);
      if (!validation.valid) {
        return { success: false, errors: validation.errors };
      }

      const result = await this.profileAPI.createProfile(profileData);
      
      if (result.success && result.data) {
        EventManager.emit('profile.created', {
          profile: result.data,
          timestamp: Date.now()
        }, 'ProfileManagementService');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to create profile:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async updateProfile(profileId: string, updates: Partial<Profile>): Promise<{ success: boolean; data?: Profile; errors: string[] }> {
    try {
      const result = await this.profileAPI.updateProfile(profileId, updates);
      
      if (result.success && result.data) {
        // Update active profile if it's the one being updated
        if (this.activeProfile && this.activeProfile.id === profileId) {
          this.activeProfile = result.data;
        }

        EventManager.emit('profile.updated', {
          profile: result.data,
          timestamp: Date.now()
        }, 'ProfileManagementService');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to update profile:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async deleteProfile(profileId: string): Promise<{ success: boolean; errors: string[] }> {
    try {
      // Prevent deletion of active profile
      if (this.activeProfile && this.activeProfile.id === profileId) {
        return { success: false, errors: ['Cannot delete active profile'] };
      }

      const result = await this.profileAPI.deleteProfile(profileId);
      
      if (result.success) {
        EventManager.emit('profile.deleted', {
          profileId,
          timestamp: Date.now()
        }, 'ProfileManagementService');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to delete profile:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async activateProfile(profileId: string): Promise<{ success: boolean; errors: string[] }> {
    try {
      const result = await this.profileAPI.activateProfile(profileId);
      
      if (result.success) {
        await this.loadActiveProfile();
        
        EventManager.emit('profile.activated', {
          profile: this.activeProfile,
          timestamp: Date.now()
        }, 'ProfileManagementService');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to activate profile:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async getProfiles(): Promise<{ success: boolean; data?: Profile[]; errors: string[] }> {
    return this.profileAPI.getProfiles();
  }

  getActiveProfile(): Profile | null {
    return this.activeProfile;
  }

  async exportProfile(profileId: string): Promise<{ success: boolean; data?: string; errors: string[] }> {
    return this.profileAPI.exportProfile(profileId);
  }

  async importProfile(profileData: string): Promise<{ success: boolean; data?: Profile; errors: string[] }> {
    try {
      const result = await this.profileAPI.importProfile(profileData);
      
      if (result.success && result.data) {
        EventManager.emit('profile.imported', {
          profile: result.data,
          timestamp: Date.now()
        }, 'ProfileManagementService');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to import profile:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  private async loadActiveProfile(): Promise<void> {
    try {
      const result = await this.profileAPI.getProfiles();
      if (result.success && result.data) {
        this.activeProfile = result.data.find(p => p.isActive) || null;
      }
    } catch (error) {
      this.logger.error('Failed to load active profile:', error);
    }
  }

  private validateProfileData(profileData: any): ProfileValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!profileData.name || typeof profileData.name !== 'string') {
      errors.push('Profile name is required and must be a string');
    }

    if (profileData.name && profileData.name.length < 3) {
      errors.push('Profile name must be at least 3 characters long');
    }

    if (!profileData.settings || typeof profileData.settings !== 'object') {
      errors.push('Profile settings are required and must be an object');
    }

    if (!profileData.description) {
      warnings.push('Profile description is recommended');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  isHealthy(): boolean {
    return this.isInitialized;
  }

  destroy(): void {
    this.isInitialized = false;
    this.activeProfile = null;
    ServiceRegistry.updateStatus('ProfileManagementService', 'stopped');
    this.logger.info('ProfileManagementService: Destroyed');
  }
}

export const profileManagementService = new ProfileManagementService();
