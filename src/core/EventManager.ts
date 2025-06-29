
import { createRichLogger } from '../rf4s/utils';

interface EventSubscription {
  id: string;
  eventType: string;
  callback: (data: any) => void;
  source?: string;
}

export class EventManager {
  private static logger = createRichLogger('EventManager');
  private static subscriptions = new Map<string, EventSubscription[]>();
  private static subscriptionCounter = 0;
  private static isInitialized = false;

  static initialize(): void {
    if (this.isInitialized) return;
    
    this.logger.info('EventManager: Initializing...');
    this.isInitialized = true;
  }

  static subscribe(eventType: string, callback: (data: any) => void, source?: string): string {
    const subscriptionId = `sub_${++this.subscriptionCounter}`;
    
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }
    
    const subscription: EventSubscription = {
      id: subscriptionId,
      eventType,
      callback,
      source
    };
    
    this.subscriptions.get(eventType)!.push(subscription);
    
    this.logger.debug(`Subscribed to event: ${eventType} (ID: ${subscriptionId})`);
    
    return subscriptionId;
  }

  static unsubscribe(eventType: string, subscriptionId: string): boolean {
    const subscriptions = this.subscriptions.get(eventType);
    if (!subscriptions) return false;
    
    const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
    if (index === -1) return false;
    
    subscriptions.splice(index, 1);
    
    if (subscriptions.length === 0) {
      this.subscriptions.delete(eventType);
    }
    
    this.logger.debug(`Unsubscribed from event: ${eventType} (ID: ${subscriptionId})`);
    
    return true;
  }

  static emit(eventType: string, data: any, source?: string): void {
    const subscriptions = this.subscriptions.get(eventType);
    if (!subscriptions || subscriptions.length === 0) {
      this.logger.debug(`No subscribers for event: ${eventType}`);
      return;
    }
    
    this.logger.debug(`Emitting event: ${eventType} to ${subscriptions.length} subscribers`);
    
    subscriptions.forEach(subscription => {
      try {
        subscription.callback(data);
      } catch (error) {
        this.logger.error(`Error in event handler for ${eventType}:`, error);
      }
    });
  }

  static getSubscriptionCount(eventType?: string): number {
    if (eventType) {
      return this.subscriptions.get(eventType)?.length || 0;
    }
    
    let total = 0;
    this.subscriptions.forEach(subs => total += subs.length);
    return total;
  }

  static getEventTypes(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  static clearAllSubscriptions(): void {
    this.subscriptions.clear();
    this.logger.info('All event subscriptions cleared');
  }

  static getSubscriptions(eventType: string): EventSubscription[] {
    return this.subscriptions.get(eventType) || [];
  }
}
