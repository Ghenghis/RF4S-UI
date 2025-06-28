
import { createRichLogger } from '../../rf4s/utils';

interface ServiceVerificationResult {
  serviceName: string;
  status: 'running' | 'stopped' | 'error';
  isHealthy: boolean;
  startTime?: Date;
  errors?: string[];
}

export class ServiceVerifier {
  private static logger = createRichLogger('ServiceVerifier');

  static async verifyAllServices(): Promise<ServiceVerificationResult[]> {
    const services = [
      'EventManager',
      'ServiceRegistry', 
      'BackendIntegrationService',
      'ConfiguratorIntegrationService',
      'RF4SIntegrationService',
      'RealtimeDataService',
      'ServiceHealthMonitor',
      'ValidationService'
    ];

    const results: ServiceVerificationResult[] = [];

    for (const serviceName of services) {
      try {
        const result = await this.verifyService(serviceName);
        results.push(result);
      } catch (error) {
        results.push({
          serviceName,
          status: 'error',
          isHealthy: false,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        });
      }
    }

    return results;
  }

  private static async verifyService(serviceName: string): Promise<ServiceVerificationResult> {
    // Simulate service verification
    const isRunning = Math.random() > 0.1; // 90% success rate
    
    return {
      serviceName,
      status: isRunning ? 'running' : 'stopped',
      isHealthy: isRunning,
      startTime: isRunning ? new Date() : undefined
    };
  }

  static determineOverallStatus(
    runningCount: number, 
    failedCount: number, 
    totalCount: number
  ): 'ready' | 'partial' | 'failed' {
    if (runningCount === totalCount) return 'ready';
    if (runningCount > totalCount / 2) return 'partial';
    return 'failed';
  }
}
