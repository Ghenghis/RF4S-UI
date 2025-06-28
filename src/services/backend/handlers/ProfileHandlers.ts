
import { RF4SWebServer } from '../RF4SWebServer';
import { createRichLogger } from '../../../rf4s/utils';

export class ProfileHandlers {
  private logger = createRichLogger('ProfileHandlers');

  async handleGetProfiles(request: any): Promise<any> {
    return await RF4SWebServer.getProfiles();
  }

  async handleCreateProfile(request: any): Promise<any> {
    const { name, config } = request.body || {};
    if (!name || !config) {
      return {
        success: false,
        errors: ['Profile name and configuration are required'],
        timestamp: Date.now()
      };
    }

    // Store profile in localStorage for now
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
        errors: ['Failed to create profile'],
        timestamp: Date.now()
      };
    }
  }

  async handleDeleteProfile(request: any): Promise<any> {
    const { id } = request.params || {};
    if (!id) {
      return {
        success: false,
        errors: ['Profile ID is required'],
        timestamp: Date.now()
      };
    }

    try {
      const profiles = JSON.parse(localStorage.getItem('rf4s_profiles') || '[]');
      const filteredProfiles = profiles.filter((p: any) => p.id !== id);
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
        errors: ['Failed to delete profile'],
        timestamp: Date.now()
      };
    }
  }
}
