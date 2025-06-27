
import { createRichLogger } from '../../rf4s/utils';
import { ServiceRegistry } from '../../core/ServiceRegistry';

export interface ServiceVerificationResult {
  serviceName: string;
  isHealthy: boolean;
  status: 'running' | 'stopped' | 'error';
  lastCheck: Date;
  errors?: string[];
  startTime?: Date | null;
}

class ServiceVerifierImpl {
  private logger = createRichLogger('ServiceVerifier');
  private verificationResults: Map<string, ServiceVerificationResult> = new Map();

  async verifyAllServices(): Promise<ServiceVerificationResult[]> {
    this.logger.info('Starting service verification...');
    
    try {
      const registeredServices = ServiceRegistry.getAllServices();
      const verificationPromises = registeredServices.map(serviceName => 
        this.verifyService(serviceName)
      );
      
      const results = await Promise.all(verificationPromises);
      
      // Cache results
      results.forEach(result => {
        this.verificationResults.set(result.serviceName, result);
      });
      
      this.logger.info(`Service verification completed. ${results.length} services checked.`);
      return results;
    } catch (error) {
      this.logger.error('Error during service verification:', error);
      return [];
    }
  }

  private async verifyService(serviceName: string): Promise<ServiceVerificationResult> {
    try {
      const service = ServiceRegistry.getService(serviceName);
      
      if (!service) {
        return {
          serviceName,
          isHealthy: false,
          status: 'error',
          lastCheck: new Date(),
          errors: [`Service not found: ${serviceName}`],
          startTime: null
        };
      }

      // Check if service has a health check method
      if (typeof service.isHealthy === 'function') {
        const isHealthy = await service.isHealthy();
        return {
          serviceName,
          isHealthy,
          status: isHealthy ? 'running' : 'error',
          lastCheck: new Date(),
          startTime: new Date()
        };
      }

      // Check if service has a status method
      if (typeof service.getStatus === 'function') {
        const status = await service.getStatus();
        return {
          serviceName,
          isHealthy: status === 'running',
          status: status || 'stopped',
          lastCheck: new Date(),
          startTime: new Date()
        };
      }

      // Default check - service exists
      return {
        serviceName,
        isHealthy: true,
        status: 'running',
        lastCheck: new Date(),
        startTime: new Date()
      };
    } catch (error) {
      this.logger.error(`Error verifying service ${serviceName}:`, error);
      return {
        serviceName,
        isHealthy: false,
        status: 'error',
        lastCheck: new Date(),
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        startTime: null
      };
    }
  }

  determineOverallStatus(runningCount: number, failedCount: number, totalCount: number, healthMonitor?: any): 'ready' | 'partial' | 'failed' | 'initializing' {
    if (totalCount === 0) return 'initializing';
    if (failedCount === 0) return 'ready';
    if (runningCount > 0) return 'partial';
    return 'failed';
  }

  getVerificationResult(serviceName: string): ServiceVerificationResult | undefined {
    return this.verificationResults.get(serviceName);
  }

  getAllVerificationResults(): ServiceVerificationResult[] {
    return Array.from(this.verificationResults.values());
  }
}

export const ServiceVerifier = new ServiceVerifierImpl();
