
import { EventManager } from './EventManager';

export type FishingState = 
  | 'IDLE' 
  | 'CASTING' 
  | 'WAITING' 
  | 'FIGHTING' 
  | 'RETRIEVING' 
  | 'HANDLING_FISH' 
  | 'ERROR' 
  | 'PAUSED';

export interface StateTransition {
  from: FishingState;
  to: FishingState;
  trigger: string;
  condition?: () => boolean;
  action?: () => Promise<void>;
}

export interface StateMachineConfig {
  initialState: FishingState;
  transitions: StateTransition[];
  onStateChange?: (from: FishingState, to: FishingState) => void;
  onError?: (error: Error, state: FishingState) => void;
}

export interface StateHistory {
  state: FishingState;
  timestamp: number;
  trigger?: string;
}

class StateMachineImpl {
  private currentState: FishingState = 'IDLE';
  private config: StateMachineConfig;
  private history: StateHistory[] = [];
  private maxHistorySize = 100;

  constructor(config: StateMachineConfig) {
    this.config = config;
    this.currentState = config.initialState;
    this.addToHistory(this.currentState);
  }

  getCurrentState(): FishingState {
    return this.currentState;
  }

  async transition(trigger: string): Promise<boolean> {
    const validTransitions = this.config.transitions.filter(
      t => t.from === this.currentState && t.trigger === trigger
    );

    if (validTransitions.length === 0) {
      console.warn(`No valid transition from ${this.currentState} with trigger ${trigger}`);
      return false;
    }

    const transition = validTransitions.find(t => !t.condition || t.condition());
    if (!transition) {
      console.warn(`Transition condition not met for ${trigger} from ${this.currentState}`);
      return false;
    }

    const previousState = this.currentState;

    try {
      if (transition.action) {
        await transition.action();
      }

      this.currentState = transition.to;
      this.addToHistory(this.currentState, trigger);

      EventManager.emit('state.changed', {
        from: previousState,
        to: this.currentState,
        trigger
      }, 'StateMachine');

      if (this.config.onStateChange) {
        this.config.onStateChange(previousState, this.currentState);
      }

      return true;
    } catch (error) {
      if (this.config.onError) {
        this.config.onError(error as Error, this.currentState);
      }
      await this.handleError(error as Error);
      return false;
    }
  }

  canTransition(trigger: string): boolean {
    return this.config.transitions.some(
      t => t.from === this.currentState && 
           t.trigger === trigger && 
           (!t.condition || t.condition())
    );
  }

  getValidTransitions(): string[] {
    return this.config.transitions
      .filter(t => t.from === this.currentState && (!t.condition || t.condition()))
      .map(t => t.trigger);
  }

  getHistory(): StateHistory[] {
    return [...this.history];
  }

  async rollback(): Promise<boolean> {
    if (this.history.length < 2) return false;

    const previousState = this.history[this.history.length - 2];
    const currentState = this.currentState;

    this.currentState = previousState.state;
    this.history.pop(); // Remove current state
    
    EventManager.emit('state.rollback', {
      from: currentState,
      to: this.currentState
    }, 'StateMachine');

    return true;
  }

  private async handleError(error: Error): Promise<void> {
    const previousState = this.currentState;
    this.currentState = 'ERROR';
    this.addToHistory(this.currentState, 'error');

    EventManager.emit('state.error', {
      error: error.message,
      previousState,
      currentState: this.currentState
    }, 'StateMachine');
  }

  private addToHistory(state: FishingState, trigger?: string): void {
    this.history.push({
      state,
      timestamp: Date.now(),
      trigger
    });

    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  reset(): void {
    this.currentState = this.config.initialState;
    this.history = [];
    this.addToHistory(this.currentState);
  }
}

export const createStateMachine = (config: StateMachineConfig): StateMachineImpl => {
  return new StateMachineImpl(config);
};

// Default fishing state machine configuration
export const createFishingStateMachine = (): StateMachineImpl => {
  const config: StateMachineConfig = {
    initialState: 'IDLE',
    transitions: [
      { from: 'IDLE', to: 'CASTING', trigger: 'start_cast' },
      { from: 'CASTING', to: 'WAITING', trigger: 'cast_complete' },
      { from: 'CASTING', to: 'ERROR', trigger: 'cast_failed' },
      { from: 'WAITING', to: 'FIGHTING', trigger: 'fish_bite' },
      { from: 'WAITING', to: 'RETRIEVING', trigger: 'timeout' },
      { from: 'FIGHTING', to: 'RETRIEVING', trigger: 'fish_lost' },
      { from: 'FIGHTING', to: 'HANDLING_FISH', trigger: 'fish_caught' },
      { from: 'RETRIEVING', to: 'IDLE', trigger: 'retrieve_complete' },
      { from: 'HANDLING_FISH', to: 'IDLE', trigger: 'fish_handled' },
      { from: 'IDLE', to: 'PAUSED', trigger: 'pause' },
      { from: 'PAUSED', to: 'IDLE', trigger: 'resume' },
      { from: 'ERROR', to: 'IDLE', trigger: 'reset' }
    ]
  };

  return createStateMachine(config);
};
