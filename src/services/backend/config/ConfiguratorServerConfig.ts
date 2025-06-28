
export interface ServerConfig {
  port: number;
  host: string;
  enableCors: boolean;
}

export class ConfiguratorServerConfig {
  private config: ServerConfig = {
    port: 3001,
    host: 'localhost',
    enableCors: true
  };

  getConfig(): ServerConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<ServerConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  getPort(): number {
    return this.config.port;
  }

  getHost(): string {
    return this.config.host;
  }
}
