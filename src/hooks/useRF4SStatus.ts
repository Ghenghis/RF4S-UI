
import { useState, useEffect } from 'react';
import { EventManager } from '../core/EventManager';

export interface RF4SStatusData {
  isRunning: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  lastActivity: number;
  fishCaught: number;
  sessionTime: number;
  errorCount: number;
}

export const useRF4SStatus = () => {
  const [status, setStatus] = useState<RF4SStatusData>({
    isRunning: false,
    connectionStatus: 'disconnected',
    lastActivity: Date.now(),
    fishCaught: 0,
    sessionTime: 0,
    errorCount: 0,
  });

  useEffect(() => {
    // Subscribe to RF4S events
    const statusSubscription = EventManager.subscribe('rf4s:status', (data: Partial<RF4SStatusData>) => {
      setStatus(prev => ({ ...prev, ...data }));
    });

    const connectionSubscription = EventManager.subscribe('rf4s:connection', (connectionStatus: string) => {
      setStatus(prev => ({ 
        ...prev, 
        connectionStatus: connectionStatus as RF4SStatusData['connectionStatus']
      }));
    });

    const activitySubscription = EventManager.subscribe('rf4s:activity', () => {
      setStatus(prev => ({ ...prev, lastActivity: Date.now() }));
    });

    const errorSubscription = EventManager.subscribe('rf4s:error', () => {
      setStatus(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
    });

    // Cleanup subscriptions
    return () => {
      EventManager.unsubscribe('rf4s:status', statusSubscription);
      EventManager.unsubscribe('rf4s:connection', connectionSubscription);
      EventManager.unsubscribe('rf4s:activity', activitySubscription);
      EventManager.unsubscribe('rf4s:error', errorSubscription);
    };
  }, []);

  return status;
};
