
import { ConfiguratorServer } from '../backend/ConfiguratorServer';
import { HTMLConfiguratorServer } from '../backend/HTMLConfiguratorServer';
import { createRichLogger } from '../../rf4s/utils';

export class IntegrationServerManager {
  private logger = createRichLogger('IntegrationServerManager');

  async startServers(): Promise<boolean> {
    try {
      // Start the configurator server
      await ConfiguratorServer.start();
      
      // Start the HTML server
      await HTMLConfiguratorServer.start();
      
      this.logger.info('Integration servers started successfully');
      return true;
    } catch (error) {
      this.logger.error('Failed to start integration servers:', error);
      return false;
    }
  }

  stopServers(): void {
    try {
      ConfiguratorServer.stop();
      HTMLConfiguratorServer.stop();
      this.logger.info('Integration servers stopped successfully');
    } catch (error) {
      this.logger.error('Error stopping integration servers:', error);
    }
  }

  async openConfigurator(): Promise<void> {
    if (!ConfiguratorServer.isServerRunning()) {
      throw new Error('Configurator server is not running');
    }

    const config = ConfiguratorServer.getConfig();
    const url = `http://${config.host}:${config.port}`;
    
    this.logger.info(`Opening configurator at ${url}`);
    window.open(url, '_blank');
  }

  async openHTMLConfigurator(): Promise<void> {
    if (!HTMLConfiguratorServer.isServerRunning()) {
      throw new Error('HTML configurator server is not running');
    }

    HTMLConfiguratorServer.openConfigurator();
  }
}
