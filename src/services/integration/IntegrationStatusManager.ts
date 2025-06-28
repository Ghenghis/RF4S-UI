
import { ConfiguratorServer } from '../backend/ConfiguratorServer';
import { RF4SWebServer } from '../backend/RF4SWebServer';
import { HTMLConfiguratorServer } from '../backend/HTMLConfiguratorServer';
import { EventManager } from '../../core/EventManager';
import { createRichLogger } from '../../rf4s/utils';

export interface IntegrationStatus {
  isReady: boolean;
  services: {
    configuratorServer: boolean;
    webServer: boolean;
    htmlServer: boolean;
    configBridge: boolean;
  };
  lastUpdate: Date;
}

export class IntegrationStatusManager {
  private logger = createRichLogger('IntegrationStatusManager');
  private status: IntegrationStatus = {
    isReady: false,
    services: {
      configuratorServer: false,
      webServer: false,
      htmlServer: false,
      configBridge: true // Always available
    },
    lastUpdate: new Date()
  };

  updateStatus(): void {
    this.status = {
      isReady: this.checkReadiness(),
      services: {
        configuratorServer: ConfiguratorServer.isServerRunning(),
        webServer: RF4SWebServer.isServerRunning(),
        htmlServer: HTMLConfiguratorServer.isServerRunning(),
        configBridge: true
      },
      lastUpdate: new Date()
    };

    EventManager.emit('configurator.integration.status_updated', this.status, 'IntegrationStatusManager');
  }

  private checkReadiness(): boolean {
    return this.status.services.configuratorServer && 
           this.status.services.webServer && 
           this.status.services.htmlServer &&
           this.status.services.configBridge;
  }

  getStatus(): IntegrationStatus {
    return { ...this.status };
  }
}
