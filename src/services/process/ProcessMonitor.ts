
import { createRichLogger } from '../../rf4s/utils';
import { EventManager } from '../../core/EventManager';
import { ProcessInfo, ProcessMetrics } from './types';

export class ProcessMonitor {
  private logger = createRichLogger('ProcessMonitor');
  private monitoredProcesses: Map<string, ProcessInfo> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(monitoredProcesses: Map<string, ProcessInfo>) {
    this.monitoredProcesses = monitoredProcesses;
  }

  startMonitoring(processName: string): void {
    this.logger.info(`Starting process monitoring: ${processName}`);
    
    // For demo purposes, we'll simulate finding processes
    if (!this.monitoredProcesses.has(processName)) {
      const mockProcess: ProcessInfo = {
        pid: Math.floor(Math.random() * 10000) + 1000,
        name: processName,
        path: processName,
        status: 'running',
        cpuUsage: Math.random() * 50,
        memoryUsage: Math.random() * 500 + 100,
        startTime: new Date()
      };
      this.monitoredProcesses.set(processName, mockProcess);
    }
  }

  stopMonitoring(processName: string): void {
    this.logger.info(`Stopping process monitoring: ${processName}`);
    this.monitoredProcesses.delete(processName);
  }

  getMonitoredProcesses(): ProcessInfo[] {
    return Array.from(this.monitoredProcesses.values());
  }

  getProcessMetrics(processName: string): ProcessMetrics | null {
    const process = this.monitoredProcesses.get(processName);
    if (!process) {
      return null;
    }

    return {
      cpu: process.cpuUsage,
      memory: process.memoryUsage,
      handles: Math.floor(Math.random() * 1000) + 100,
      threads: Math.floor(Math.random() * 50) + 5,
      uptime: Date.now() - process.startTime.getTime()
    };
  }

  async checkProcessHealth(processName: string): Promise<boolean> {
    const process = this.monitoredProcesses.get(processName);
    if (!process) {
      return false;
    }

    const isHealthy = process.status === 'running' && process.cpuUsage < 90 && process.memoryUsage < 1000;
    
    if (!isHealthy) {
      EventManager.emit('process_bridge.health_warning', { 
        processName, 
        process 
      }, 'ProcessMonitor');
    }

    return isHealthy;
  }

  startProcessMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.updateProcessMetrics();
    }, 5000);
  }

  stopProcessMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private updateProcessMetrics(): void {
    this.monitoredProcesses.forEach((process, name) => {
      if (name !== 'RF4') {
        process.cpuUsage = Math.max(0, process.cpuUsage + (Math.random() - 0.5) * 10);
        process.memoryUsage = Math.max(50, process.memoryUsage + (Math.random() - 0.5) * 20);
        this.checkProcessHealth(name);
      }
    });

    if (this.monitoredProcesses.size > 0) {
      EventManager.emit('process_bridge.metrics_updated', {
        processes: Array.from(this.monitoredProcesses.values())
      }, 'ProcessMonitor');
    }
  }
}
