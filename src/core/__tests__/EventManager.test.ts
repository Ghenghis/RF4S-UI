
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventManager } from '../EventManager';

describe('EventManager', () => {
  beforeEach(() => {
    // Clear all subscriptions before each test
    EventManager.clearAllSubscriptions();
    vi.clearAllMocks();
  });

  afterEach(() => {
    EventManager.clearAllSubscriptions();
  });

  it('should initialize successfully', () => {
    EventManager.initialize();
    
    // Should not throw any errors
    expect(true).toBe(true);
  });

  it('should subscribe to events', () => {
    const callback = vi.fn();
    
    const subscriptionId = EventManager.subscribe('test.event', callback);
    
    expect(subscriptionId).toMatch(/^sub_\d+$/);
    expect(EventManager.getSubscriptionCount('test.event')).toBe(1);
  });

  it('should emit events to subscribers', () => {
    const callback = vi.fn();
    const testData = { message: 'test' };
    
    EventManager.subscribe('test.event', callback);
    EventManager.emit('test.event', testData, 'TestSource');
    
    expect(callback).toHaveBeenCalledWith(testData);
  });

  it('should handle multiple subscribers for same event', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const testData = { message: 'test' };
    
    EventManager.subscribe('test.event', callback1);
    EventManager.subscribe('test.event', callback2);
    EventManager.emit('test.event', testData);
    
    expect(callback1).toHaveBeenCalledWith(testData);
    expect(callback2).toHaveBeenCalledWith(testData);
    expect(EventManager.getSubscriptionCount('test.event')).toBe(2);
  });

  it('should unsubscribe from events', () => {
    const callback = vi.fn();
    
    const subscriptionId = EventManager.subscribe('test.event', callback);
    const unsubscribed = EventManager.unsubscribe('test.event', subscriptionId);
    
    expect(unsubscribed).toBe(true);
    expect(EventManager.getSubscriptionCount('test.event')).toBe(0);
  });

  it('should return false when unsubscribing non-existent subscription', () => {
    const result = EventManager.unsubscribe('test.event', 'non-existent-id');
    
    expect(result).toBe(false);
  });

  it('should handle emitting to non-existent event', () => {
    // Should not throw error when emitting to event with no subscribers
    expect(() => {
      EventManager.emit('non.existent.event', { test: true });
    }).not.toThrow();
  });

  it('should get subscription count for specific event', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    
    EventManager.subscribe('event1', callback1);
    EventManager.subscribe('event1', callback2);
    EventManager.subscribe('event2', callback1);
    
    expect(EventManager.getSubscriptionCount('event1')).toBe(2);
    expect(EventManager.getSubscriptionCount('event2')).toBe(1);
    expect(EventManager.getSubscriptionCount('non-existent')).toBe(0);
  });

  it('should get total subscription count', () => {
    const callback = vi.fn();
    
    EventManager.subscribe('event1', callback);
    EventManager.subscribe('event2', callback);
    EventManager.subscribe('event3', callback);
    
    expect(EventManager.getSubscriptionCount()).toBe(3);
  });

  it('should get all event types', () => {
    const callback = vi.fn();
    
    EventManager.subscribe('event1', callback);
    EventManager.subscribe('event2', callback);
    EventManager.subscribe('event3', callback);
    
    const eventTypes = EventManager.getEventTypes();
    
    expect(eventTypes).toContain('event1');
    expect(eventTypes).toContain('event2');
    expect(eventTypes).toContain('event3');
    expect(eventTypes.length).toBe(3);
  });

  it('should get subscriptions for specific event', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    
    EventManager.subscribe('test.event', callback1, 'Source1');
    EventManager.subscribe('test.event', callback2, 'Source2');
    
    const subscriptions = EventManager.getSubscriptions('test.event');
    
    expect(subscriptions).toHaveLength(2);
    expect(subscriptions[0]).toHaveProperty('eventType', 'test.event');
    expect(subscriptions[0]).toHaveProperty('source', 'Source1');
    expect(subscriptions[1]).toHaveProperty('source', 'Source2');
  });

  it('should clear all subscriptions', () => {
    const callback = vi.fn();
    
    EventManager.subscribe('event1', callback);
    EventManager.subscribe('event2', callback);
    EventManager.subscribe('event3', callback);
    
    expect(EventManager.getSubscriptionCount()).toBe(3);
    
    EventManager.clearAllSubscriptions();
    
    expect(EventManager.getSubscriptionCount()).toBe(0);
    expect(EventManager.getEventTypes()).toHaveLength(0);
  });

  it('should handle errors in event callbacks gracefully', () => {
    const errorCallback = vi.fn(() => {
      throw new Error('Callback error');
    });
    const normalCallback = vi.fn();
    
    EventManager.subscribe('test.event', errorCallback);
    EventManager.subscribe('test.event', normalCallback);
    
    // Should not throw error even if one callback fails
    expect(() => {
      EventManager.emit('test.event', { test: true });
    }).not.toThrow();
    
    // Normal callback should still be called
    expect(normalCallback).toHaveBeenCalled();
  });

  it('should support subscription with source', () => {
    const callback = vi.fn();
    
    const subscriptionId = EventManager.subscribe('test.event', callback, 'TestSource');
    const subscriptions = EventManager.getSubscriptions('test.event');
    
    expect(subscriptions[0]).toHaveProperty('source', 'TestSource');
    expect(subscriptions[0]).toHaveProperty('id', subscriptionId);
  });

  it('should clean up event type when all subscriptions removed', () => {
    const callback = vi.fn();
    
    const subscriptionId = EventManager.subscribe('test.event', callback);
    expect(EventManager.getEventTypes()).toContain('test.event');
    
    EventManager.unsubscribe('test.event', subscriptionId);
    expect(EventManager.getEventTypes()).not.toContain('test.event');
  });
});
