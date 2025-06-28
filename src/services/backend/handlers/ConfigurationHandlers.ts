
import { ConfigurationAPI } from '../api/ConfigurationAPI';
import { createRichLogger } from '../../../rf4s/utils';

export class ConfigurationHandlers {
  private logger = createRichLogger('ConfigurationHandlers');
  private configurationAPI = new ConfigurationAPI();

  async handleGetConfig(request: any): Promise<any> {
    this.logger.info('Handling get config request');
    return this.configurationAPI.getConfig();
  }

  async handleSaveConfig(request: any): Promise<any> {
    this.logger.info('Handling save config request');
    return this.configurationAPI.saveConfig(request.config);
  }

  async handleValidateConfig(request: any): Promise<any> {
    this.logger.info('Handling validate config request');
    return this.configurationAPI.validateConfig(request.config);
  }

  async handleResetConfig(request: any): Promise<any> {
    this.logger.info('Handling reset config request');
    return this.configurationAPI.resetConfiguration();
  }
}
