
import { EventManager } from '../core/EventManager';
import { rf4sService } from '../rf4s/services/rf4sService';

interface InputCommand {
  id: string;
  type: 'key' | 'mouse' | 'sequence';
  action: string;
  parameters: Record<string, any>;
  timestamp: Date;
  processed: boolean;
}

interface InputMapping {
  trigger: string;
  action: string;
  context: string;
  priority: number;
}

class InputProcessingServiceImpl {
  private commandQueue: InputCommand[] = [];
  private inputMappings: Map<string, InputMapping> = new Map();
  private processingInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;

  initialize(): void {
    console.log('Input Processing Service initialized');
    this.initializeInputMappings();
    this.startProcessing();
    this.setupEventListeners();
  }

  private initializeInputMappings(): void {
    const defaultMappings: InputMapping[] = [
      {
        trigger: 'cast',
        action: 'perform_cast',
        context: 'fishing',
        priority: 1
      },
      {
        trigger: 'hook',
        action: 'set_hook',
        context: 'fishing',
        priority: 2
      },
      {
        trigger: 'reel',
        action: 'reel_in',
        context: 'fishing',
        priority: 1
      },
      {
        trigger: 'release',
        action: 'release_fish',
        context: 'fishing',
        priority: 1
      },
      {
        trigger: 'pause',
        action: 'pause_automation',
        context: 'system',
        priority: 3
      },
      {
        trigger: 'resume',
        action: 'resume_automation',
        context: 'system',
        priority: 3
      }
    ];

    defaultMappings.forEach(mapping => {
      this.inputMappings.set(mapping.trigger, mapping);
    });
  }

  private setupEventListeners(): void {
    // Listen for fishing events that require input processing
    EventManager.subscribe('fishing.fish_bite_detected', (data: any) => {
      this.queueInputCommand({
        type: 'sequence',
        action: 'handle_fish_bite',
        parameters: { confidence: data.confidence, position: data.position }
      });
    });

    EventManager.subscribe('fishing.spool_detected', (data: any) => {
      this.queueInputCommand({
        type: 'key',
        action: 'emergency_stop',
        parameters: { confidence: data.confidence }
      });
    });

    EventManager.subscribe('automation.cast_performed', (data: any) => {
      this.queueInputCommand({
        type: 'sequence',
        action: 'post_cast_sequence',
        parameters: { technique: data.technique }
      });
    });
  }

  private startProcessing(): void {
    if (this.processingInterval) return;

    this.processingInterval = setInterval(() => {
      this.processCommandQueue();
    }, 50); // Process commands every 50ms
  }

  private processCommandQueue(): void {
    if (this.isProcessing || this.commandQueue.length === 0) return;

    this.isProcessing = true;
    
    // Sort commands by priority
    this.commandQueue.sort((a, b) => {
      const priorityA = this.getCommandPriority(a);
      const priorityB = this.getCommandPriority(b);
      return priorityB - priorityA;
    });

    // Process the highest priority command
    const command = this.commandQueue.shift();
    if (command) {
      this.executeCommand(command);
    }

    this.isProcessing = false;
  }

  private getCommandPriority(command: InputCommand): number {
    const mapping = this.inputMappings.get(command.action);
    return mapping?.priority || 0;
  }

  private executeCommand(command: InputCommand): void {
    console.log('Executing input command:', command.action, command.parameters);

    try {
      switch (command.action) {
        case 'handle_fish_bite':
          this.handleFishBite(command.parameters);
          break;
        case 'emergency_stop':
          this.handleEmergencyStop(command.parameters);
          break;
        case 'post_cast_sequence':
          this.handlePostCastSequence(command.parameters);
          break;
        case 'perform_cast':
          this.handlePerformCast(command.parameters);
          break;
        case 'set_hook':
          this.handleSetHook(command.parameters);
          break;
        case 'reel_in':
          this.handleReelIn(command.parameters);
          break;
        case 'release_fish':
          this.handleReleaseFish(command.parameters);
          break;
        case 'pause_automation':
          this.handlePauseAutomation(command.parameters);
          break;
        case 'resume_automation':
          this.handleResumeAutomation(command.parameters);
          break;
        default:
          console.warn('Unknown command action:', command.action);
      }

      command.processed = true;
      
      // Emit command completion event
      EventManager.emit('input.command_completed', {
        commandId: command.id,
        action: command.action,
        success: true
      }, 'InputProcessingService');

    } catch (error) {
      console.error('Error executing command:', command.action, error);
      
      EventManager.emit('input.command_failed', {
        commandId: command.id,
        action: command.action,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'InputProcessingService');
    }
  }

  private handleFishBite(params: any): void {
    console.log('Processing fish bite input:', params);
    
    // Simulate hooking sequence
    setTimeout(() => {
      this.queueInputCommand({
        type: 'key',
        action: 'set_hook',
        parameters: { delay: 0.5 }
      });
    }, 100);
  }

  private handleEmergencyStop(params: any): void {
    console.log('Processing emergency stop:', params);
    
    // Stop all automation
    EventManager.emit('automation.stop_all', {
      reason: 'emergency_stop',
      confidence: params.confidence
    }, 'InputProcessingService');
  }

  private handlePostCastSequence(params: any): void {
    console.log('Processing post-cast sequence:', params);
    
    // Set up waiting for fish based on technique
    const waitTime = this.getWaitTimeForTechnique(params.technique);
    
    setTimeout(() => {
      EventManager.emit('automation.cast_completed', {
        technique: params.technique,
        waitTime: waitTime
      }, 'InputProcessingService');
    }, waitTime);
  }

  private getWaitTimeForTechnique(technique: string): number {
    switch (technique) {
      case 'bottom': return 30000; // 30 seconds
      case 'spin': return 5000;    // 5 seconds
      case 'float': return 15000;  // 15 seconds
      case 'pirk': return 10000;   // 10 seconds
      default: return 20000;       // 20 seconds
    }
  }

  private handlePerformCast(params: any): void {
    console.log('Processing cast input:', params);
    rf4sService.updateConfig('automation', { lastCastTime: Date.now() });
  }

  private handleSetHook(params: any): void {
    console.log('Processing hook input:', params);
    // Simulate hook setting
  }

  private handleReelIn(params: any): void {
    console.log('Processing reel input:', params);
    // Simulate reeling in
  }

  private handleReleaseFish(params: any): void {
    console.log('Processing fish release:', params);
    // Update fish count
    rf4sService.updateFishCount('green');
  }

  private handlePauseAutomation(params: any): void {
    console.log('Processing pause automation:', params);
    EventManager.emit('automation.paused', {}, 'InputProcessingService');
  }

  private handleResumeAutomation(params: any): void {
    console.log('Processing resume automation:', params);
    EventManager.emit('automation.resumed', {}, 'InputProcessingService');
  }

  queueInputCommand(commandData: Partial<InputCommand>): void {
    const command: InputCommand = {
      id: `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: commandData.type || 'key',
      action: commandData.action || 'unknown',
      parameters: commandData.parameters || {},
      timestamp: new Date(),
      processed: false
    };

    this.commandQueue.push(command);
    console.log('Input command queued:', command.action);
  }

  getQueueStatus(): { pending: number; processing: boolean } {
    return {
      pending: this.commandQueue.length,
      processing: this.isProcessing
    };
  }

  clearQueue(): void {
    this.commandQueue = [];
    console.log('Input command queue cleared');
  }

  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.clearQueue();
    console.log('Input Processing Service stopped');
  }
}

export const InputProcessingService = new InputProcessingServiceImpl();
