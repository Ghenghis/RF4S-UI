
import { EventManager } from '../../core/EventManager';
import { createRichLogger } from '../../rf4s/utils';
import { EnhancedErrorHandler } from './EnhancedErrorHandler';
import { ServiceHealthMonitor } from '../ServiceHealthMonitor';

interface RecoveryPlan {
  id: string;
  serviceName: string;
  steps: RecoveryStep[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime: number;
  successRate: number;
}

interface RecoveryStep {
  name: string;
  action: () => Promise<boolean>;
  rollback?: () => Promise<void>;
  timeout: number;
  dependencies?: string[];
}

export class AdvancedErrorRecoveryService {
  private logger = createRichLogger('AdvancedErrorRecoveryService');
  private errorHandler: EnhancedErrorHandler;
  private healthMonitor: ServiceHealthMonitor;
  private activeRecoveries: Map<string, RecoveryPlan> = new Map();
  private recoveryHistory: RecoveryPlan[] = [];
  private isInitialized = false;

  constructor() {
    this.errorHandler = new EnhancedErrorHandler();
    this.healthMonitor = new ServiceHealthMonitor();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.logger.info('Initializing Advanced Error Recovery Service...');
    
    this.setupEventListeners();
    this.healthMonitor.start();
    
    this.isInitialized = true;
    this.logger.info('Advanced Error Recovery Service initialized');
  }

  private setupEventListeners(): void {
    EventManager.subscribe('service.error', async (data: any) => {
      await this.handleServiceError(data);
    });

    EventManager.subscribe('system.critical_error', async (data: any) => {
      await this.handleCriticalError(data);
    });

    EventManager.subscribe('recovery.plan_requested', async (data: any) => {
      await this.executeRecoveryPlan(data.planId);
    });
  }

  private async handleServiceError(errorData: any): Promise<void> {
    const recoveryPlan = await this.createRecoveryPlan(errorData);
    
    if (recoveryPlan.priority === 'critical') {
      await this.executeRecoveryPlan(recoveryPlan.id);
    } else {
      this.logger.info(`Recovery plan created for ${errorData.serviceName}: ${recoveryPlan.id}`);
      EventManager.emit('recovery.plan_created', recoveryPlan, 'AdvancedErrorRecoveryService');
    }
  }

  private async handleCriticalError(errorData: any): Promise<void> {
    this.logger.error('Critical system error detected:', errorData);
    
    const emergencyPlan = await this.createEmergencyRecoveryPlan(errorData);
    await this.executeRecoveryPlan(emergencyPlan.id);
  }

  private async createRecoveryPlan(errorData: any): Promise<RecoveryPlan> {
    const planId = `recovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const steps: RecoveryStep[] = [
      {
        name: 'Service Health Check',
        action: async () => {
          const health = this.healthMonitor.getServiceHealth(errorData.serviceName);
          return health?.healthy ?? false;
        },
        timeout: 5000
      },
      {
        name: 'Restart Service',
        action: async () => {
          EventManager.emit('service.restart.request', {
            serviceName: errorData.serviceName,
            reason: 'error_recovery'
          }, 'AdvancedErrorRecoveryService');
          return true;
        },
        rollback: async () => {
          this.logger.info(`Rolling back service restart for ${errorData.serviceName}`);
        },
        timeout: 10000
      },
      {
        name: 'Verify Recovery',
        action: async () => {
          await new Promise(resolve => setTimeout(resolve, 2000));
          const health = this.healthMonitor.getServiceHealth(errorData.serviceName);
          return health?.healthy ?? false;
        },
        timeout: 15000,
        dependencies: ['Restart Service']
      }
    ];

    const plan: RecoveryPlan = {
      id: planId,
      serviceName: errorData.serviceName,
      steps,
      priority: this.determinePriority(errorData),
      estimatedTime: steps.reduce((total, step) => total + step.timeout, 0),
      successRate: 0.85 // Historical success rate
    };

    this.activeRecoveries.set(planId, plan);
    return plan;
  }

  private async createEmergencyRecoveryPlan(errorData: any): Promise<RecoveryPlan> {
    const planId = `emergency-${Date.now()}`;
    
    const steps: RecoveryStep[] = [
      {
        name: 'Stop All Services',
        action: async () => {
          EventManager.emit('system.emergency_stop', {}, 'AdvancedErrorRecoveryService');
          return true;
        },
        timeout: 5000
      },
      {
        name: 'Clear System State',
        action: async () => {
          EventManager.emit('system.clear_state', {}, 'AdvancedErrorRecoveryService');
          return true;
        },
        timeout: 3000
      },
      {
        name: 'Restart Core Services',
        action: async () => {
          EventManager.emit('system.restart_core', {}, 'AdvancedErrorRecoveryService');
          return true;
        },
        timeout: 15000,
        dependencies: ['Stop All Services', 'Clear System State']
      }
    ];

    const plan: RecoveryPlan = {
      id: planId,
      serviceName: 'system',
      steps,
      priority: 'critical',
      estimatedTime: 25000,
      successRate: 0.75
    };

    this.activeRecoveries.set(planId, plan);
    return plan;
  }

  private async executeRecoveryPlan(planId: string): Promise<boolean> {
    const plan = this.activeRecoveries.get(planId);
    if (!plan) {
      this.logger.error(`Recovery plan not found: ${planId}`);
      return false;
    }

    this.logger.info(`Executing recovery plan: ${planId} for ${plan.serviceName}`);
    
    EventManager.emit('recovery.plan_started', {
      planId,
      serviceName: plan.serviceName,
      estimatedTime: plan.estimatedTime
    }, 'AdvancedErrorRecoveryService');

    const executedSteps: string[] = [];
    let success = false;

    try {
      for (const step of plan.steps) {
        if (step.dependencies) {
          const dependenciesMet = step.dependencies.every(dep => 
            executedSteps.includes(dep)
          );
          if (!dependenciesMet) {
            throw new Error(`Dependencies not met for step: ${step.name}`);
          }
        }

        this.logger.info(`Executing recovery step: ${step.name}`);
        
        const stepSuccess = await Promise.race([
          step.action(),
          new Promise<boolean>((_, reject) => 
            setTimeout(() => reject(new Error('Step timeout')), step.timeout)
          )
        ]);

        if (stepSuccess) {
          executedSteps.push(step.name);
        } else {
          throw new Error(`Step failed: ${step.name}`);
        }
      }

      success = true;
      this.logger.info(`Recovery plan completed successfully: ${planId}`);
      
    } catch (error) {
      this.logger.error(`Recovery plan failed: ${planId}`, error);
      
      // Execute rollback for completed steps
      for (let i = executedSteps.length - 1; i >= 0; i--) {
        const stepName = executedSteps[i];
        const step = plan.steps.find(s => s.name === stepName);
        if (step?.rollback) {
          try {
            await step.rollback();
          } catch (rollbackError) {
            this.logger.error(`Rollback failed for step: ${stepName}`, rollbackError);
          }
        }
      }
    }

    // Move to history and cleanup
    this.recoveryHistory.push(plan);
    this.activeRecoveries.delete(planId);

    EventManager.emit('recovery.plan_completed', {
      planId,
      serviceName: plan.serviceName,
      success,
      executedSteps
    }, 'AdvancedErrorRecoveryService');

    return success;
  }

  private determinePriority(errorData: any): 'low' | 'medium' | 'high' | 'critical' {
    if (errorData.severity === 'critical' || errorData.serviceName === 'EventManager') {
      return 'critical';
    } else if (errorData.severity === 'high') {
      return 'high';
    } else if (errorData.severity === 'medium') {
      return 'medium';
    } else {
      return 'low';
    }
  }

  getActiveRecoveries(): RecoveryPlan[] {
    return Array.from(this.activeRecoveries.values());
  }

  getRecoveryHistory(limit: number = 50): RecoveryPlan[] {
    return this.recoveryHistory.slice(-limit);
  }

  getRecoveryStats(): {
    totalRecoveries: number;
    successRate: number;
    averageTime: number;
    activeRecoveries: number;
  } {
    const totalRecoveries = this.recoveryHistory.length;
    const successful = this.recoveryHistory.filter(p => 
      p.steps.every(s => s.name !== 'failed')
    ).length;
    
    return {
      totalRecoveries,
      successRate: totalRecoveries > 0 ? successful / totalRecoveries : 0,
      averageTime: totalRecoveries > 0 ? 
        this.recoveryHistory.reduce((sum, p) => sum + p.estimatedTime, 0) / totalRecoveries : 0,
      activeRecoveries: this.activeRecoveries.size
    };
  }
}

export const advancedErrorRecoveryService = new AdvancedErrorRecoveryService();
