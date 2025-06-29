
import { createRichLogger } from '../../rf4s/utils';
import { ServiceRegistry } from '../../core/ServiceRegistry';

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
    const services = ServiceRegistry.getAllServices();
    const results: ServiceVerificationResult[] = [];

    for (const service of services) {
      try {
        const result = await this.verifyService(service.name, service.instance);
        results.push(result);
      } catch (error) {
        results.push({
          serviceName: service.name,
          status: 'error',
          isHealthy: false,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        });
      }
    }

    return results;
  }

  private static async verifyService(serviceName: string, serviceInstance: any): Promise<ServiceVerificationResult> {
    try {
      const serviceDefinition = ServiceRegistry.getServiceDefinition(serviceName);
      
      if (!serviceDefinition) {
        return {
          serviceName,
          status: 'error',
          isHealthy: false,
          errors: ['Service not found in registry']
        };
      }

      // Check if service has health check method
      let isHealthy = false;
      if (serviceInstance && typeof serviceInstance.isHealthy === 'function') {
        isHealthy = await serviceInstance.isHealthy();
      } else {
        // Fall back to status-based health check
        isHealthy = serviceDefinition.status === 'running' || serviceDefinition.status === 'initialized';
      }

      const status = serviceDefinition.status === 'running' ? 'running' : 
                    serviceDefinition.status === 'error' ? 'error' : 'stopped';

      return {
        serviceName,
        status,
        isHealthy,
        startTime: serviceDefinition.lastHealthCheck
      };
      
    } catch (error) {
      return {
        serviceName,
        status: 'error',
        isHealthy: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
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
