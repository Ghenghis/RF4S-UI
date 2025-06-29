
import { EventManager } from '../../core/EventManager';
import { useRF4SStore } from '../../stores/rf4sStore';
import { SystemMetrics } from '../../types/metrics';

class SystemMetricsServiceImpl {
  private systemMetrics: SystemMetrics = {
    cpuUsage: 0,
    memoryUsage: 0,
    fps: 0,
    diskUsage: 0,
    networkLatency: 0,
    lastUpdate: Date.now()
  };

  updateMetrics(): void {
    // Simulate system metrics - in real implementation, these would come from system APIs
    this.systemMetrics.cpuUsage = Math.random() * 100;
    this.systemMetrics.memoryUsage = 150 + Math.random() * 100;
    this.systemMetrics.fps = 58 + Math.random() * 4;
    this.systemMetrics.diskUsage = 45 + Math.random() * 10;
    this.systemMetrics.networkLatency = 10 + Math.random() * 20;
    this.systemMetrics.lastUpdate = Date.now();

    // Update store with system metrics
    const { updateConfig } = useRF4SStore.getState();
    updateConfig('system', {
      cpuUsage: Math.round(this.systemMetrics.cpuUsage),
      memoryUsage: Math.round(this.systemMetrics.memoryUsage),
      fps: Math.round(this.systemMetrics.fps)
    });
  }

  getSystemMetrics(): SystemMetrics {
    return { ...this.systemMetrics };
  }
}

export const SystemMetricsService = new SystemMetricsServiceImpl();
