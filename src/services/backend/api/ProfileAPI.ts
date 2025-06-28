
import { createRichLogger } from '../../../rf4s/utils';

export class ProfileAPI {
  private logger = createRichLogger('ProfileAPI');

  async getProfiles(): Promise<any> {
    try {
      const profiles = JSON.parse(localStorage.getItem('rf4s_profiles') || '[]');
      return {
        success: true,
        data: profiles,
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to get profiles:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: Date.now()
      };
    }
  }

  async createProfile(name: string, config: any): Promise<any> {
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
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: Date.now()
      };
    }
  }

  async deleteProfile(profileId: string): Promise<any> {
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
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: Date.now()
      };
    }
  }
}
