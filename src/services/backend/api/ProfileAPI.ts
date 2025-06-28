
import { rf4sService } from '../../../rf4s/services/rf4sService';
import { createRichLogger } from '../../../rf4s/utils';
import { APIResponse } from '../types';

export class ProfileAPI {
  private logger = createRichLogger('ProfileAPI');

  async getProfiles(): Promise<APIResponse<any[]>> {
    try {
      const config = rf4sService.getConfig();
      const profiles = Object.keys(config).filter(key => key.startsWith('profile_')).map(key => ({
        id: key,
        name: key.replace('profile_', ''),
        data: config[key as keyof typeof config]
      }));

      return {
        success: true,
        data: profiles,
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to get profiles:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }

  async createProfile(name: string, config: any): Promise<APIResponse> {
    try {
      const profiles = JSON.parse(localStorage.getItem('rf4s_profiles') || '[]');
      const newProfile = {
        id: `profile_${Date.now()}`,
        name,
        config,
        createdAt: new Date().toISOString()
      };
      profiles.push(newProfile);
      localStorage.setItem('rf4s_profiles', JSON.stringify(profiles));

      return {
        success: true,
        data: newProfile,
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to create profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }

  async deleteProfile(profileId: string): Promise<APIResponse> {
    try {
      const profiles = JSON.parse(localStorage.getItem('rf4s_profiles') || '[]');
      const filteredProfiles = profiles.filter((p: any) => p.id !== profileId);
      localStorage.setItem('rf4s_profiles', JSON.stringify(filteredProfiles));

      return {
        success: true,
        data: { message: 'Profile deleted successfully' },
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to delete profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }
}
