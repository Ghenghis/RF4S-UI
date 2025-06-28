
import { useEffect, useRef, useCallback } from 'react';
import { UIEventMappingRegistry } from '../services/UIEventMappingRegistry';

interface EventHandlers {
  [handlerName: string]: (data: any) => void;
}

export const useUIEventSubscriptions = (panelName: string, eventHandlers: EventHandlers) => {
  const subscriptionIdsRef = useRef<string[]>([]);
  const eventHandlersRef = useRef(eventHandlers);

  // Update ref when handlers change
  useEffect(() => {
    eventHandlersRef.current = eventHandlers;
  }, [eventHandlers]);

  useEffect(() => {
    // Register all event handlers for this panel
    const subscriptionIds = UIEventMappingRegistry.registerPanelEventHandlers(panelName, eventHandlersRef.current);
    subscriptionIdsRef.current = subscriptionIds;

    if (process.env.NODE_ENV === 'development') {
      console.log(`Registered ${subscriptionIds.length} event subscriptions for panel: ${panelName}`);
    }

    // Cleanup subscriptions on unmount
    return () => {
      subscriptionIds.forEach(() => {
        // Cleanup logic would go here if EventManager supported unsubscribe by ID
      });
    };
  }, [panelName]); // Remove eventHandlers from dependencies to prevent unnecessary re-registrations

  // Helper function to emit UI actions back to backend
  const emitUIAction = useCallback((actionType: string, data: any) => {
    UIEventMappingRegistry.emitUIAction(panelName, actionType, data);
  }, [panelName]);

  return { emitUIAction };
};
