
import { useEffect, useRef } from 'react';
import { UIEventMappingRegistry } from '../services/UIEventMappingRegistry';

interface EventHandlers {
  [handlerName: string]: (data: any) => void;
}

export const useUIEventSubscriptions = (panelName: string, eventHandlers: EventHandlers) => {
  const subscriptionIdsRef = useRef<string[]>([]);

  useEffect(() => {
    // Register all event handlers for this panel
    const subscriptionIds = UIEventMappingRegistry.registerPanelEventHandlers(panelName, eventHandlers);
    subscriptionIdsRef.current = subscriptionIds;

    console.log(`Registered ${subscriptionIds.length} event subscriptions for panel: ${panelName}`);

    // Cleanup subscriptions on unmount
    return () => {
      subscriptionIds.forEach(id => {
        const mappings = UIEventMappingRegistry.getEventMappings();
        mappings.forEach(mapping => {
          if (mapping.uiPanels.includes(panelName) || mapping.uiPanels.includes('all')) {
            // Note: EventManager.unsubscribe would need the event type, not just the ID
            // This is a limitation we should address in EventManager
          }
        });
      });
    };
  }, [panelName]); // Only re-run if panelName changes

  // Helper function to emit UI actions back to backend
  const emitUIAction = (actionType: string, data: any) => {
    UIEventMappingRegistry.emitUIAction(panelName, actionType, data);
  };

  return { emitUIAction };
};
