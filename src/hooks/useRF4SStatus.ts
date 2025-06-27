
import { useState, useEffect, useCallback } from 'react';
import { RF4SBridgeInterface } from '../services/RF4SBridgeInterface';
import { useRF4SStore } from '../stores/rf4sStore';
import { EventManager } from '../core/EventManager';

export interface RF4SStatusData {
  isRunning: boolean;
  currentMode: string;
  gameDetected: boolean;
  fishCaught: number;
  sessionTime: number;
  lastError: string | null;
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    fps: number;
  };
}

export const useRF4SStatus = () => {
  const { connected, setConnected } = useRF4SStore();
  const [status, setStatus] = useState<RF4SStatusData | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    if (connected || isConnecting) return;
    
    setIsConnecting(true);
    try {
      const success = await RF4SBridgeInterface.connect();
      setConnected(success);
    } catch (error) {
      console.error('Connection failed:', error);
      setConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [connected, isConnecting, setConnected]);

  const disconnect = useCallback(() => {
    RF4SBridgeInterface.disconnect();
    setConnected(false);
    setStatus(null);
  }, [setConnected]);

  const refreshStatus = useCallback(async () => {
    if (!connected) return null;
    
    try {
      const currentStatus = await RF4SBridgeInterface.getStatus();
      setStatus(currentStatus);
      return currentStatus;
    } catch (error) {
      console.error('Failed to get status:', error);
      return null;
    }
  }, [connected]);

  // Set up event listeners
  useEffect(() => {
    const handleConnected = () => {
      setConnected(true);
      setIsConnecting(false);
    };

    const handleDisconnected = () => {
      setConnected(false);
      setStatus(null);
    };

    const handleStatusUpdate = (statusData: RF4SStatusData) => {
      setStatus(statusData);
    };

    const handleConnectionLost = () => {
      setConnected(false);
      setStatus(null);
    };

    EventManager.on('rf4s.connected', handleConnected);
    EventManager.on('rf4s.disconnected', handleDisconnected);
    EventManager.on('rf4s.status_update', handleStatusUpdate);
    EventManager.on('rf4s.connection_lost', handleConnectionLost);

    return () => {
      EventManager.off('rf4s.connected', handleConnected);
      EventManager.off('rf4s.disconnected', handleDisconnected);
      EventManager.off('rf4s.status_update', handleStatusUpdate);
      EventManager.off('rf4s.connection_lost', handleConnectionLost);
    };
  }, [setConnected]);

  // Auto-refresh status when connected
  useEffect(() => {
    if (!connected) return;

    const interval = setInterval(refreshStatus, 3000);
    return () => clearInterval(interval);
  }, [connected, refreshStatus]);

  return {
    connected,
    isConnecting,
    status,
    connect,
    disconnect,
    refreshStatus
  };
};
