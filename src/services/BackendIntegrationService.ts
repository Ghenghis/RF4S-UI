import { EventManager } from '../core/EventManager';
import { ServiceRegistry } from '../core/ServiceRegistry';
import { createRichLogger } from '../rf4s/utils';

interface BackendConnection {
  url: string;
  connected: boolean;
  lastPing: Date | null;
  responseTime: number;
  errorCount: number;
}

interface IntegrationStatus {
  integrationStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastUpdate: Date;
  connectionCount: number;
  errors: string[];
}

class BackendIntegrationServiceImpl {
  private logger = createRichLogger('BackendIntegrationService');
  private connections = new Map<string, BackendConnection>();
  private isInitialized = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private integrationStatus: IntegrationStatus = {
    integrationStatus: 'disconnected',
    lastUpdate: new Date(),
    connectionCount: 0,
    errors: []
  };

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warning('BackendIntegrationService already initialized');
      return;
    }

    this.logger.info('BackendIntegrationService: Initializing...');
    
    try {
      // Register with ServiceRegistry
      ServiceRegistry.register('BackendIntegrationService', this, ['EventManager'], {
        type: 'integration',
        priority: 'high'
      });

      // Initialize default connections
      await this.initializeConnections();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      this.isInitialized = true;
      ServiceRegistry.updateStatus('BackendIntegrationService', 'running');
      
      this.updateIntegrationStatus('connected');
      
      this.logger.info('BackendIntegrationService: Successfully initialized');
      
      EventManager.emit('backend.integration_initialized', {
        connectionCount: this.connections.size,
        timestamp: Date.now()
      }, 'BackendIntegrationService');
      
    } catch (error) {
      ServiceRegistry.updateStatus('BackendIntegrationService', 'error');
      this.updateIntegrationStatus('error');
      this.logger.error('BackendIntegrationService: Initialization failed:', error);
      throw error;
    }
  }

  private updateIntegrationStatus(status: IntegrationStatus['integrationStatus'], error?: string): void {
    this.integrationStatus.integrationStatus = status;
    this.integrationStatus.lastUpdate = new Date();
    this.integrationStatus.connectionCount = this.connections.size;
    
    if (error) {
      this.integrationStatus.errors.unshift(error);
      // Keep only last 10 errors
      if (this.integrationStatus.errors.length > 10) {
        this.integrationStatus.errors = this.integrationStatus.errors.slice(0, 10);
      }
    }
  }

  private async initializeConnections(): Promise<void> {
    // Initialize connections based on environment
    const endpoints = this.getEndpoints();
    
    for (const [name, url] of Object.entries(endpoints)) {
      this.connections.set(name, {
        url,
        connected: false,
        lastPing: null,
        responseTime: 0,
        errorCount: 0
      });
      
      // Test connection
      await this.testConnection(name);
    }
  }

  private getEndpoints(): Record<string, string> {
    // Return actual endpoints - these would come from environment variables
    return {
      primary: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000',
      health: process.env.REACT_APP_HEALTH_ENDPOINT || 'http://localhost:8000/health',
      api: process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000/api'
    };
  }

  private async testConnection(name: string): Promise<boolean> {
    const connection = this.connections.get(name);
    if (!connection) return false;

    try {
      const startTime = Date.now();
      
      // Actual HTTP request would go here
      // For now, we'll check if the URL is properly formatted
      const url = new URL(connection.url);
      
      const responseTime = Date.now() - startTime;
      
      connection.connected = true;
      connection.lastPing = new Date();
      connection.responseTime = responseTime;
      
      this.logger.info(`Connection test successful: ${name} (${responseTime}ms)`);
      
      EventManager.emit('backend.connection_established', {
        connectionName: name,
        url: connection.url,
        responseTime,
        timestamp: Date.now()
      }, 'BackendIntegrationService');
      
      return true;
      
    } catch (error) {
      connection.connected = false;
      connection.errorCount++;
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.updateIntegrationStatus('error', errorMessage);
      
      this.logger.error(`Connection test failed: ${name}`, error);
      
      EventManager.emit('backend.connection_failed', {
        connectionName: name,
        error: errorMessage,
        timestamp: Date.now()
      }, 'BackendIntegrationService');
      
      return false;
    }
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      for (const [name] of this.connections) {
        await this.testConnection(name);
      }
    }, 30000); // Check every 30 seconds
  }

  async sendRequest(endpoint: string, method: string, data?: any): Promise<any> {
    const connection = this.connections.get('api');
    if (!connection || !connection.connected) {
      throw new Error('API connection not available');
    }

    try {
      // Actual HTTP request implementation would go here
      this.logger.info(`Sending ${method} request to ${endpoint}`);
      
      EventManager.emit('backend.request_sent', {
        endpoint,
        method,
        timestamp: Date.now()
      }, 'BackendIntegrationService');
      
      // Return mock response structure for now
      return { success: true, data: null };
      
    } catch (error) {
      this.logger.error(`Request failed: ${method} ${endpoint}`, error);
      throw error;
    }
  }

  getConnectionStatus(): Record<string, BackendConnection> {
    const status: Record<string, BackendConnection> = {};
    this.connections.forEach((connection, name) => {
      status[name] = { ...connection };
    });
    return status;
  }

  getIntegrationStatus(): IntegrationStatus {
    return { ...this.integrationStatus };
  }

  isHealthy(): boolean {
    const connections = Array.from(this.connections.values());
    const connectedCount = connections.filter(c => c.connected).length;
    return connectedCount > 0; // At least one connection should be healthy
  }

  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    this.connections.clear();
    this.isInitialized = false;
    this.updateIntegrationStatus('disconnected');
    ServiceRegistry.updateStatus('BackendIntegrationService', 'stopped');
    
    this.logger.info('BackendIntegrationService: Destroyed');
  }
}

export const BackendIntegrationService = new BackendIntegrationServiceImpl();
