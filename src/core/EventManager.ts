
export interface EventListener<T = any> {
  id: string;
  handler: (data: T) => void;
  once?: boolean;
}

export interface EventFilter {
  type?: string;
  source?: string;
  priority?: number;
}

export interface EventData {
  type: string;
  source: string;
  timestamp: number;
  payload: any;
}

class EventManagerImpl {
  private listeners = new Map<string, EventListener[]>();
  private eventHistory: EventData[] = [];
  private maxHistorySize = 1000;

  subscribe<T>(eventType: string, handler: (data: T) => void, options?: { once?: boolean }): string {
    const id = `${eventType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const listener: EventListener<T> = {
      id,
      handler,
      once: options?.once || false
    };

    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    this.listeners.get(eventType)!.push(listener);
    return id;
  }

  unsubscribe(eventType: string, listenerId: string): boolean {
    const eventListeners = this.listeners.get(eventType);
    if (!eventListeners) return false;

    const index = eventListeners.findIndex(l => l.id === listenerId);
    if (index === -1) return false;

    eventListeners.splice(index, 1);
    return true;
  }

  emit<T>(eventType: string, data: T, source = 'unknown'): void {
    const eventData: EventData = {
      type: eventType,
      source,
      timestamp: Date.now(),
      payload: data
    };

    this.addToHistory(eventData);

    const eventListeners = this.listeners.get(eventType);
    if (!eventListeners) return;

    const listenersToRemove: string[] = [];

    eventListeners.forEach(listener => {
      try {
        listener.handler(data);
        if (listener.once) {
          listenersToRemove.push(listener.id);
        }
      } catch (error) {
        console.error(`Error in event listener ${listener.id}:`, error);
      }
    });

    // Remove one-time listeners
    listenersToRemove.forEach(id => {
      this.unsubscribe(eventType, id);
    });
  }

  getEventHistory(filter?: EventFilter): EventData[] {
    let history = this.eventHistory;

    if (filter) {
      history = history.filter(event => {
        if (filter.type && event.type !== filter.type) return false;
        if (filter.source && event.source !== filter.source) return false;
        return true;
      });
    }

    return [...history];
  }

  clear(): void {
    this.listeners.clear();
    this.eventHistory = [];
  }

  private addToHistory(event: EventData): void {
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }
}

export const EventManager = new EventManagerImpl();
