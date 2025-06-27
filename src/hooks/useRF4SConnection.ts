
import { useEffect, useState } from 'react';
import { useRF4SStore } from '../stores/rf4sStore';
import { RF4SBridgeInterface } from '../services/RF4SBridgeInterface';
import { EventManager } from '../core/EventManager';

export const useRF4SConnection = () => {
  const { setConnected, updateConfig } = useRF4SStore();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const connectToRF4S = async () => {
      setIsConnecting(true);
      try {
        const connected = await RF4SBridgeInterface.connect();
        setConnected(connected);
      } catch (error) {
        console.error('Connection failed:', error);
        setConnected(false);
      } finally {
        setIsConnecting(false);
      }
    };

    // Auto-connect on mount
    connectToRF4S();

    // Set up event listeners
    const handleConnected = () => {
      setConnected(true);
      console.log('RF4S Connected');
    };

    const handleDisconnected = () => {
      setConnected(false);
      console.log('RF4S Disconnected');
    };

    const handleStatusUpdate = (status: any) => {
      updateConfig('system', {
        cpuUsage: Math.round(status.performance?.cpuUsage || 0),
        memoryUsage: Math.round(status.performance?.memoryUsage || 0),
        fps: Math.round(status.performance?.fps || 0),
        fishCaught: status.fishCaught || 0,
        sessionTime: Math.floor(status.sessionTime / 60) + 'm'
      });
    };

    // Subscribe to events using EventManager - returns listener IDs
    const connectedListenerId = EventManager.subscribe('rf4s.connected', handleConnected);
    const disconnectedListenerId = EventManager.subscribe('rf4s.disconnected', handleDisconnected);
    const statusListenerId = EventManager.subscribe('rf4s.status_update', handleStatusUpdate);

    return () => {
      // Unsubscribe using the listener IDs
      EventManager.unsubscribe('rf4s.connected', connectedListenerId);
      EventManager.unsubscribe('rf4s.disconnected', disconnectedListenerId);
      EventManager.unsubscribe('rf4s.status_update', statusListenerId);
    };
  }, [setConnected, updateConfig]);

  return { isConnecting };
};
