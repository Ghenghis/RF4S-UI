
import { EventManager } from '../../core/EventManager';
import { ServiceDependencyManager } from './ServiceDependencyManager';
import { StartupPhaseManager } from './StartupPhaseManager';
import { PhaseExecutor } from './PhaseExecutor';

export class ServiceStartupSequencer {
  private dependencyManager: ServiceDependencyManager;
  private phaseManager: StartupPhaseManager;
  private phaseExecutor: PhaseExecutor;

  constructor() {
    this.dependencyManager = new ServiceDependencyManager();
    this.phaseManager = new StartupPhaseManager();
    this.phaseExecutor = new PhaseExecutor(this.dependencyManager);
  }

  async executeStartupSequence(): Promise<void> {
    console.log('ServiceStartupSequencer: Beginning phased startup sequence...');
    
    const phases = this.phaseManager.getPhases();
    
    for (let i = 0; i < phases.length; i++) {
      this.phaseManager.setCurrentPhaseIndex(i);
      const phase = phases[i];
      
      await this.phaseExecutor.executePhase(phase);
    }
    
    console.log('ServiceStartupSequencer: All phases completed successfully');
    EventManager.emit('startup.sequence_complete', {
      totalPhases: this.phaseManager.getTotalPhases(),
      completedAt: new Date()
    }, 'ServiceStartupSequencer');
  }

  getCurrentPhase(): { phase: number; total: number; name: string } {
    return this.phaseManager.getCurrentPhase();
  }
}
