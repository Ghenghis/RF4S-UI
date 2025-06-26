
import { EventManager } from './EventManager';

export interface ComponentLifecycle {
  init(): Promise<void>;
  destroy(): Promise<void>;
  update(data?: any): Promise<void>;
}

export interface ComponentState {
  initialized: boolean;
  destroyed: boolean;
  lastUpdate: number;
  error?: string;
}

export interface ComponentMetadata {
  name: string;
  version: string;
  dependencies: string[];
  description?: string;
}

export abstract class BaseComponent implements ComponentLifecycle {
  protected state: ComponentState = {
    initialized: false,
    destroyed: false,
    lastUpdate: 0
  };

  protected eventSubscriptions: string[] = [];

  constructor(protected metadata: ComponentMetadata) {}

  async init(): Promise<void> {
    if (this.state.initialized) {
      throw new Error(`Component ${this.metadata.name} is already initialized`);
    }

    try {
      await this.onInit();
      this.state.initialized = true;
      this.state.lastUpdate = Date.now();
      
      EventManager.emit('component.initialized', {
        name: this.metadata.name,
        timestamp: this.state.lastUpdate
      }, this.metadata.name);
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  async destroy(): Promise<void> {
    if (this.state.destroyed) return;

    try {
      // Unsubscribe from all events
      this.eventSubscriptions.forEach(subId => {
        // Implementation would depend on EventManager unsubscribe method
      });
      this.eventSubscriptions = [];

      await this.onDestroy();
      this.state.destroyed = true;
      
      EventManager.emit('component.destroyed', {
        name: this.metadata.name,
        timestamp: Date.now()
      }, this.metadata.name);
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  async update(data?: any): Promise<void> {
    if (!this.state.initialized || this.state.destroyed) {
      throw new Error(`Component ${this.metadata.name} is not in a valid state for updates`);
    }

    try {
      await this.onUpdate(data);
      this.state.lastUpdate = Date.now();
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  getState(): Readonly<ComponentState> {
    return { ...this.state };
  }

  getMetadata(): Readonly<ComponentMetadata> {
    return { ...this.metadata };
  }

  protected abstract onInit(): Promise<void>;
  protected abstract onDestroy(): Promise<void>;
  protected abstract onUpdate(data?: any): Promise<void>;

  protected subscribeToEvent<T>(eventType: string, handler: (data: T) => void): string {
    const subscriptionId = EventManager.subscribe(eventType, handler);
    this.eventSubscriptions.push(subscriptionId);
    return subscriptionId;
  }

  protected emitEvent<T>(eventType: string, data: T): void {
    EventManager.emit(eventType, data, this.metadata.name);
  }
}
