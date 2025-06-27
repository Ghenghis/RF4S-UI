
import { useEffect, useState } from 'react';
import { useRF4SStore } from '../stores/rf4sStore';
import { RF4SBridgeInterface } from '../services/RF4SBridgeInterface';
import { EventManager } from '../core/EventManager';

export const useRF4SConnection = () => {
  const { setConnected, updateConfig, setScriptRunning } = useRF4SStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  useEffect(() => {
    const connectToRF4S = async () => {
      setIsConnecting(true);
      setConnectionAttempts(prev => prev + 1);
      
      try {
        console.log(`RF4S connection attempt #${connectionAttempts + 1}`);
        const connected = await RF4SBridgeInterface.connect();
        setConnected(connected);
        
        if (connected) {
          console.log('RF4S Connected successfully');
          // Simulate successful connection with initial data
          updateConfig('system', {
            cpuUsage: 45,
            memoryUsage: 180,
            fps: 60,
            fishCaught: 12,
            sessionTime: '25m',
            successRate: 78
          });
        }
      } catch (error) {
        console.error('RF4S Connection failed:', error);
        setConnected(false);
      } finally {
        setIsConnecting(false);
      }
    };

    // Auto-connect on mount
    connectToRF4S();

    // Set up event listeners with proper cleanup
    const handleConnected = () => {
      console.log('RF4S Event: Connected');
      setConnected(true);
    };

    const handleDisconnected = () => {
      console.log('RF4S Event: Disconnected');
      setConnected(false);
      setScriptRunning(false);
    };

    const handleStatusUpdate = (status: any) => {
      console.log('RF4S Status Update:', status);
      updateConfig('system', {
        cpuUsage: Math.round(status.performance?.cpuUsage || Math.random() * 100),
        memoryUsage: Math.round(status.performance?.memoryUsage || 150 + Math.random() * 100),
        fps: Math.round(status.performance?.fps || 58 + Math.random() * 4),
        fishCaught: status.fishCaught || Math.floor(Math.random() * 50),
        sessionTime: status.sessionTime ? Math.floor(status.sessionTime / 60) + 'm' : '0m',
        successRate: status.successRate || Math.floor(70 + Math.random() * 25)
      });
    };

    const handleScriptStatus = (status: any) => {
      console.log('Script Status Update:', status);
      setScriptRunning(status.running || false);
    };

    // Subscribe to events
    const connectedListenerId = EventManager.subscribe('rf4s.connected', handleConnected);
    const disconnectedListenerId = EventManager.subscribe('rf4s.disconnected', handleDisconnected);
    const statusListenerId = EventManager.subscribe('rf4s.status_update', handleStatusUpdate);
    const scriptStatusListenerId = EventManager.subscribe('rf4s.script_status', handleScriptStatus);

    // Simulate periodic status updates for demo
    const statusInterval = setInterval(() => {
      EventManager.emit('rf4s.status_update', {
        performance: {
          cpuUsage: 40 + Math.random() * 30,
          memoryUsage: 150 + Math.random() * 100,
          fps: 58 + Math.random() * 4
        },
        fishCaught: Math.floor(Math.random() * 50),
        sessionTime: Date.now() / 1000,
        successRate: 70 + Math.random() * 25
      }, 'useRF4SConnection');
    }, 3000);

    return () => {
      // Cleanup event listeners
      EventManager.unsubscribe('rf4s.connected', connectedListenerId);
      EventManager.unsubscribe('rf4s.disconnected', disconnectedListenerId);
      EventManager.unsubscribe('rf4s.status_update', statusListenerId);
      EventManager.unsubscribe('rf4s.script_status', scriptStatusListenerId);
      clearInterval(statusInterval);
    };
  }, [setConnected, updateConfig, setScriptRunning, connectionAttempts]);

  return { isConnecting, connectionAttempts };
};
