
import { ProfileAPI } from '../api/ProfileAPI';
import { createRichLogger } from '../../../rf4s/utils';

export class ProfileHandlers {
  private logger = createRichLogger('ProfileHandlers');
  private profileAPI = new ProfileAPI();

  async handleGetProfiles(request: any): Promise<any> {
    this.logger.info('Handling get profiles request');
    return this.profileAPI.getProfiles();
  }

  async handleCreateProfile(request: any): Promise<any> {
    this.logger.info('Handling create profile request');
    return this.profileAPI.createProfile(request.profileData);
  }

  async handleDeleteProfile(request: any): Promise<any> {
    this.logger.info('Handling delete profile request');
    return this.profileAPI.deleteProfile(request.profileId);
  }
}
