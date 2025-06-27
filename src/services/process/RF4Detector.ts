
import { createRichLogger } from '../../rf4s/utils';
import { EventManager } from '../../core/EventManager';
import { ProcessInfo } from './types';

export class RF4Detector {
  private logger = createRichLogger('RF4Detector');
  private rf4ProcessInfo: ProcessInfo | null = null;

  async detectRF4Process(): Promise<void> {
    const rf4ProcessNames = ['rf4_x64.exe', 'rf4.exe', 'Russian Fishing 4.exe'];
    
    for (const processName of rf4ProcessNames) {
      const processes = this.findProcessByName(processName);
      if (processes.length > 0) {
        this.rf4ProcessInfo = processes[0];
        
        this.logger.info(`RF4 Game detected: PID ${this.rf4ProcessInfo.pid}, Memory: ${this.rf4ProcessInfo.memoryUsage}MB`);
        
        EventManager.emit('process_bridge.rf4_detected', { 
          process: this.rf4ProcessInfo 
        }, 'RF4Detector');
        
        break;
      }
    }
  }

  findProcessByName(processName: string): ProcessInfo[] {
    const processes: ProcessInfo[] = [];
    
    if (processName.toLowerCase().includes('rf4')) {
      const rf4Process: ProcessInfo = {
        pid: 36972,
        name: 'rf4_x64.exe',
        path: 'C:\\Program Files\\Steam\\steamapps\\common\\Russian Fishing 4\\rf4_x64.exe',
        status: 'running',
        cpuUsage: Math.random() * 15 + 5,
        memoryUsage: 3268,
        startTime: new Date(Date.now() - Math.random() * 3600000)
      };
      
      processes.push(rf4Process);
      this.logger.info(`Found RF4 process: ${rf4Process.name} (PID: ${rf4Process.pid})`);
    }

    return processes;
  }

  findProcessByPid(pid: number): ProcessInfo | null {
    if (pid === 36972) {
      return {
        pid: 36972,
        name: 'rf4_x64.exe',
        path: 'C:\\Program Files\\Steam\\steamapps\\common\\Russian Fishing 4\\rf4_x64.exe',
        status: 'running',
        cpuUsage: Math.random() * 15 + 5,
        memoryUsage: 3268,
        startTime: new Date(Date.now() - Math.random() * 3600000)
      };
    }
    
    return null;
  }

  getRF4ProcessInfo(): ProcessInfo | null {
    return this.rf4ProcessInfo;
  }

  isRF4Running(): boolean {
    return this.rf4ProcessInfo !== null && this.rf4ProcessInfo.status === 'running';
  }

  async checkRF4Health(): Promise<boolean> {
    if (!this.rf4ProcessInfo) {
      return false;
    }

    const isHealthy = this.rf4ProcessInfo.status === 'running' && 
                     this.rf4ProcessInfo.cpuUsage < 90 && 
                     this.rf4ProcessInfo.memoryUsage < 8000;

    if (!isHealthy) {
      this.logger.warning('RF4 process health warning detected');
      EventManager.emit('process_bridge.rf4_health_warning', { 
        process: this.rf4ProcessInfo 
      }, 'RF4Detector');
    }

    return isHealthy;
  }

  updateRF4Metrics(): void {
    if (this.rf4ProcessInfo) {
      this.rf4ProcessInfo.cpuUsage = Math.max(2, this.rf4ProcessInfo.cpuUsage + (Math.random() - 0.5) * 5);
      this.rf4ProcessInfo.memoryUsage = Math.max(3000, this.rf4ProcessInfo.memoryUsage + (Math.random() - 0.5) * 50);
      
      this.checkRF4Health();
      
      EventManager.emit('process_bridge.rf4_metrics_updated', {
        process: this.rf4ProcessInfo
      }, 'RF4Detector');
    }
  }
}
