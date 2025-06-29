
import { useState, useEffect, useCallback } from 'react';
import { EventManager } from '../core/EventManager';
import { UIEventMappingRegistry } from '../services/UIEventMappingRegistry';

interface PanelEventConfig {
  panelId: string;
  eventHandlers: Record<string, (data: any) => void>;
}

export const usePanelEvents = (config: PanelEventConfig) => {
  const [isConnected, setIsConnected] = useState(false);
  const [subscriptionIds, setSubscriptionIds] = useState<string[]>([]);

  useEffect(() => {
    const ids: string[] = [];

    // Subscribe to panel-specific events
    Object.entries(config.eventHandlers).forEach(([eventType, handler]) => {
      const subscriptionId = EventManager.subscribe(
        `panel.${config.panelId}.${eventType}`,
        handler
      );
      ids.push(subscriptionId);
    });

    // Subscribe to global events that this panel should receive
    const globalEventId = EventManager.subscribe('system.global_update', (data) => {
      // Handle global updates that affect all panels
      if (config.eventHandlers.handleGlobalUpdate) {
        config.eventHandlers.handleGlobalUpdate(data);
      }
    });
    ids.push(globalEventId);

    setSubscriptionIds(ids);
    setIsConnected(true);

    // Register panel with the coordinator
    UIEventMappingRegistry.registerPanelEventHandlers(config.panelId, config.eventHandlers);

    // Cleanup on unmount
    return () => {
      ids.forEach(id => {
        // EventManager unsubscription would go here if supported
      });
      setIsConnected(false);
    };
  }, [config.panelId]);

  const emitPanelAction = useCallback((actionType: string, data: any) => {
    EventManager.emit('ui.action_requested', {
      type: actionType,
      panelId: config.panelId,
      data,
      timestamp: Date.now()
    }, `Panel-${config.panelId}`);
  }, [config.panelId]);

  const emitPanelEvent = useCallback((eventType: string, data: any) => {
    EventManager.emit(`panel.${config.panelId}.${eventType}`, data, `Panel-${config.panelId}`);
  }, [config.panelId]);

  return {
    isConnected,
    emitPanelAction,
    emitPanelEvent,
    subscriptionCount: subscriptionIds.length
  };
};
