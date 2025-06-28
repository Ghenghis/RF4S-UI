
import { ConfiguratorServer } from '../ConfiguratorServer';
import { createRichLogger } from '../../../rf4s/utils';

export class ServerStatusAPI {
  private logger = createRichLogger('ServerStatusAPI');

  async getServerStatus(): Promise<any> {
    try {
      return {
        success: true,
        data: {
          configuratorServer: ConfiguratorServer.isServerRunning(),
          apiEndpoints: [
            'GET /api/config',
            'POST /api/config',
            'GET /api/profiles',
            'POST /api/backup/create',
            'GET /health'
          ],
          htmlServer: {
            running: true,
            port: 3002
          }
        },
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to get server status:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: Date.now()
      };
    }
  }
}
