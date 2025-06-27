
import { ServiceOrchestrator } from '../ServiceOrchestrator';
import { PerformanceMemory } from './ErrorContext';

export class SystemCapture {
  static async captureSystemState(): Promise<any> {
    try {
      const serviceStatus = await ServiceOrchestrator.getServiceStatus();
      
      // Safely access performance.memory with proper typing
      let memoryInfo = null;
      try {
        const perfWithMemory = performance as Performance & { memory?: PerformanceMemory };
        if (perfWithMemory.memory) {
          memoryInfo = {
            used: perfWithMemory.memory.usedJSHeapSize,
            total: perfWithMemory.memory.totalJSHeapSize,
            limit: perfWithMemory.memory.jsHeapSizeLimit
          };
        }
      } catch (error) {
        // Performance memory API not available in this browser
        console.debug('Performance memory API not available');
      }
      
      return {
        runningServices: serviceStatus.filter(s => s.status === 'running').length,
        totalServices: serviceStatus.length,
        timestamp: new Date(),
        memoryUsage: memoryInfo
      };
    } catch (error) {
      console.error('Failed to capture system state:', error);
      return {
        runningServices: 0,
        totalServices: 0,
        timestamp: new Date(),
        memoryUsage: null
      };
    }
  }
}
