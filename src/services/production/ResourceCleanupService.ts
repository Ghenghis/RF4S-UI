
import { EventManager } from '../../core/EventManager';
import { createRichLogger } from '../../rf4s/utils';

interface ResourceTracker {
  id: string;
  type: 'interval' | 'timeout' | 'listener' | 'observer' | 'subscription' | 'connection';
  resource: any;
  createdAt: Date;
  tags: string[];
  cleanup: () => void;
}

export class ResourceCleanupService {
  private logger = createRichLogger('ResourceCleanupService');
  private trackedResources: Map<string, ResourceTracker> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isActive = false;

  start(): void {
    if (this.isActive) return;

    this.logger.info('Starting Resource Cleanup Service...');
    this.isActive = true;

    // Periodic cleanup check every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.performPeriodicCleanup();
    }, 30000);

    this.setupEventListeners();
  }

  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Clean up all tracked resources
    this.cleanupAllResources();
    this.isActive = false;
    this.logger.info('Resource Cleanup Service stopped');
  }

  private setupEventListeners(): void {
    // Clean up on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.cleanupAllResources();
      });

      window.addEventListener('pagehide', () => {
        this.cleanupAllResources();
      });
    }

    // Listen for service shutdown events
    EventManager.subscribe('service.shutdown', (data: any) => {
      this.cleanupResourcesByTag(data.serviceName);
    });

    EventManager.subscribe('application.cleanup_requested', () => {
      this.cleanupAllResources();
    });
  }

  trackInterval(intervalId: NodeJS.Timeout, tags: string[] = []): string {
    const id = this.generateResourceId();
    
    this.trackedResources.set(id, {
      id,
      type: 'interval',
      resource: intervalId,
      createdAt: new Date(),
      tags,
      cleanup: () => clearInterval(intervalId)
    });

    this.logger.info(`Tracking interval: ${id}`);
    return id;
  }

  trackTimeout(timeoutId: NodeJS.Timeout, tags: string[] = []): string {
    const id = this.generateResourceId();
    
    this.trackedResources.set(id, {
      id,
      type: 'timeout',
      resource: timeoutId,
      createdAt: new Date(),
      tags,
      cleanup: () => clearTimeout(timeoutId)
    });

    this.logger.info(`Tracking timeout: ${id}`);
    return id;
  }

  trackEventListener(element: EventTarget, event: string, listener: EventListener, tags: string[] = []): string {
    const id = this.generateResourceId();
    
    this.trackedResources.set(id, {
      id,
      type: 'listener',
      resource: { element, event, listener },
      createdAt: new Date(),
      tags,
      cleanup: () => element.removeEventListener(event, listener)
    });

    this.logger.info(`Tracking event listener: ${id} (${event})`);
    return id;
  }

  trackObserver(observer: any, tags: string[] = []): string {
    const id = this.generateResourceId();
    
    this.trackedResources.set(id, {
      id,
      type: 'observer',
      resource: observer,
      createdAt: new Date(),
      tags,
      cleanup: () => {
        if (observer && typeof observer.disconnect === 'function') {
          observer.disconnect();
        }
      }
    });

    this.logger.info(`Tracking observer: ${id}`);
    return id;
  }

  trackSubscription(unsubscribe: () => void, tags: string[] = []): string {
    const id = this.generateResourceId();
    
    this.trackedResources.set(id, {
      id,
      type: 'subscription',
      resource: unsubscribe,
      createdAt: new Date(),
      tags,
      cleanup: unsubscribe
    });

    this.logger.info(`Tracking subscription: ${id}`);
    return id;
  }

  trackConnection(connection: any, tags: string[] = []): string {
    const id = this.generateResourceId();
    
    this.trackedResources.set(id, {
      id,
      type: 'connection',
      resource: connection,
      createdAt: new Date(),
      tags,
      cleanup: () => {
        if (connection && typeof connection.close === 'function') {
          connection.close();
        } else if (connection && typeof connection.disconnect === 'function') {
          connection.disconnect();
        }
      }
    });

    this.logger.info(`Tracking connection: ${id}`);
    return id;
  }

  private generateResourceId(): string {
    return `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  untrackResource(resourceId: string): boolean {
    const resource = this.trackedResources.get(resourceId);
    if (!resource) return false;

    try {
      resource.cleanup();
      this.trackedResources.delete(resourceId);
      this.logger.info(`Untracked and cleaned up resource: ${resourceId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to cleanup resource ${resourceId}:`, error);
      return false;
    }
  }

  cleanupResourcesByTag(tag: string): number {
    let cleanedCount = 0;
    
    for (const [id, resource] of this.trackedResources.entries()) {
      if (resource.tags.includes(tag)) {
        try {
          resource.cleanup();
          this.trackedResources.delete(id);
          cleanedCount++;
        } catch (error) {
          this.logger.error(`Failed to cleanup resource ${id}:`, error);
        }
      }
    }

    if (cleanedCount > 0) {
      this.logger.info(`Cleaned up ${cleanedCount} resources with tag: ${tag}`);
    }

    return cleanedCount;
  }

  cleanupResourcesByType(type: ResourceTracker['type']): number {
    let cleanedCount = 0;
    
    for (const [id, resource] of this.trackedResources.entries()) {
      if (resource.type === type) {
        try {
          resource.cleanup();
          this.trackedResources.delete(id);
          cleanedCount++;
        } catch (error) {
          this.logger.error(`Failed to cleanup resource ${id}:`, error);
        }
      }
    }

    if (cleanedCount > 0) {
      this.logger.info(`Cleaned up ${cleanedCount} resources of type: ${type}`);
    }

    return cleanedCount;
  }

  private performPeriodicCleanup(): void {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    let cleanedCount = 0;

    // Clean up old timeout resources (they should have executed by now)
    for (const [id, resource] of this.trackedResources.entries()) {
      if (resource.type === 'timeout' && 
          now.getTime() - resource.createdAt.getTime() > maxAge) {
        try {
          this.trackedResources.delete(id);
          cleanedCount++;
        } catch (error) {
          this.logger.error(`Failed to cleanup old timeout ${id}:`, error);
        }
      }
    }

    if (cleanedCount > 0) {
      this.logger.info(`Periodic cleanup: removed ${cleanedCount} old timeout resources`);
    }

    // Emit cleanup stats
    EventManager.emit('resource_cleanup.periodic_completed', {
      totalResources: this.trackedResources.size,
      cleanedResources: cleanedCount,
      timestamp: now
    }, 'ResourceCleanupService');
  }

  cleanupAllResources(): number {
    let cleanedCount = 0;
    
    this.logger.info(`Cleaning up all ${this.trackedResources.size} tracked resources...`);

    for (const [id, resource] of this.trackedResources.entries()) {
      try {
        resource.cleanup();
        cleanedCount++;
      } catch (error) {
        this.logger.error(`Failed to cleanup resource ${id}:`, error);
      }
    }

    this.trackedResources.clear();
    
    this.logger.info(`Cleaned up ${cleanedCount} resources`);
    
    EventManager.emit('resource_cleanup.all_completed', {
      cleanedResources: cleanedCount,
      timestamp: new Date()
    }, 'ResourceCleanupService');

    return cleanedCount;
  }

  getResourceStats(): {
    total: number;
    byType: Record<ResourceTracker['type'], number>;
    byTag: Record<string, number>;
    oldestResource: Date | null;
  } {
    const byType: Record<ResourceTracker['type'], number> = {
      interval: 0,
      timeout: 0,
      listener: 0,
      observer: 0,
      subscription: 0,
      connection: 0
    };

    const byTag: Record<string, number> = {};
    let oldestResource: Date | null = null;

    for (const resource of this.trackedResources.values()) {
      byType[resource.type]++;
      
      for (const tag of resource.tags) {
        byTag[tag] = (byTag[tag] || 0) + 1;
      }
      
      if (!oldestResource || resource.createdAt < oldestResource) {
        oldestResource = resource.createdAt;
      }
    }

    return {
      total: this.trackedResources.size,
      byType,
      byTag,
      oldestResource
    };
  }

  // Helper methods for common resource patterns
  createManagedInterval(callback: () => void, delay: number, tags: string[] = []): string {
    const intervalId = setInterval(callback, delay);
    return this.trackInterval(intervalId, tags);
  }

  createManagedTimeout(callback: () => void, delay: number, tags: string[] = []): string {
    const timeoutId = setTimeout(() => {
      callback();
      // Auto-cleanup timeout after execution
      this.trackedResources.delete(resourceId);
    }, delay);
    
    const resourceId = this.trackTimeout(timeoutId, tags);
    return resourceId;
  }

  addManagedEventListener(element: EventTarget, event: string, listener: EventListener, tags: string[] = []): string {
    element.addEventListener(event, listener);
    return this.trackEventListener(element, event, listener, tags);
  }
}

export const resourceCleanupService = new ResourceCleanupService();
