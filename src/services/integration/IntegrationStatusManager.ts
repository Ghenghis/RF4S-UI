
import { RF4SWebServer } from '../backend/RF4SWebServer';
import { ConfiguratorIntegrationService } from '../ConfiguratorIntegrationService';

export interface IntegrationStatus {
  configuratorServer: boolean;
  rf4sWebServer: boolean;
  htmlConfigurator: boolean;
  overallStatus: 'connected' | 'partial' | 'disconnected';
  lastUpdated: Date;
  services: {
    configuratorServer: boolean;
    webServer: boolean;
    htmlServer: boolean;
  };
}

export class IntegrationStatusManager {
  private status: IntegrationStatus = {
    configuratorServer: false,
    rf4sWebServer: false,
    htmlConfigurator: false,
    overallStatus: 'disconnected',
    lastUpdated: new Date(),
    services: {
      configuratorServer: false,
      webServer: false,
      htmlServer: false
    }
  };

  updateStatus(): void {
    this.status.rf4sWebServer = RF4SWebServer.isServerRunning();
    this.status.configuratorServer = true; // Assume running for now
    this.status.htmlConfigurator = true; // Assume running for now
    
    // Update services object to match expected interface
    this.status.services.configuratorServer = this.status.configuratorServer;
    this.status.services.webServer = this.status.rf4sWebServer;
    this.status.services.htmlServer = this.status.htmlConfigurator;
    
    // Calculate overall status
    const activeServices = [
      this.status.configuratorServer,
      this.status.rf4sWebServer,
      this.status.htmlConfigurator
    ].filter(Boolean).length;
    
    if (activeServices === 3) {
      this.status.overallStatus = 'connected';
    } else if (activeServices > 0) {
      this.status.overallStatus = 'partial';
    } else {
      this.status.overallStatus = 'disconnected';
    }
    
    this.status.lastUpdated = new Date();
  }

  getStatus(): IntegrationStatus {
    return { ...this.status };
  }

  isFullyConnected(): boolean {
    return this.status.overallStatus === 'connected';
  }

  getActiveServices(): string[] {
    const active: string[] = [];
    
    if (this.status.configuratorServer) active.push('Configurator Server');
    if (this.status.rf4sWebServer) active.push('RF4S Web Server');
    if (this.status.htmlConfigurator) active.push('HTML Configurator');
    
    return active;
  }
}
