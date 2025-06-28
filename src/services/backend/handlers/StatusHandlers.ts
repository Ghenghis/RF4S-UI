
import { ServerStatusAPI } from '../api/ServerStatusAPI';
import { createRichLogger } from '../../../rf4s/utils';

export class StatusHandlers {
  private logger = createRichLogger('StatusHandlers');
  private serverStatusAPI = new ServerStatusAPI();

  async handleGetStatus(request: any, isRunning: boolean, config: any): Promise<any> {
    this.logger.info('Handling get status request');
    const statusResult = await this.serverStatusAPI.getServerStatus();
    
    return {
      ...statusResult,
      data: {
        ...statusResult.data,
        isRunning,
        currentConfig: config
      }
    };
  }

  async handleHealthCheck(request: any): Promise<any> {
    this.logger.info('Handling health check request');
    return this.serverStatusAPI.getServerStatus();
  }
}
