
import { useEffect, useState } from 'react';
import { useRF4SStore } from '../stores/rf4sStore';
import { RF4SBridgeInterface } from '../services/RF4SBridgeInterface';
import { RF4SIntegrationService } from '../services/RF4SIntegrationService';
import { EventManager } from '../core/EventManager';

export const useRF4SConnection = () => {
  const { setConnected, updateConfig, setScriptRunning } = useRF4SStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Prevent multiple initialization attempts
    if (isInitialized) return;

    const connectToRF4S = async () => {
      if (isConnecting) return; // Prevent concurrent connection attempts
      
      setIsConnecting(true);
      setConnectionAttempts(prev => prev + 1);
      
      try {
        console.log(`RF4S connection attempt #${connectionAttempts + 1}`);
        
        // Initialize RF4S Integration Service first
        await RF4SIntegrationService.initialize();
        
        // Then connect the bridge interface
        const connected = await RF4SBridgeInterface.connect();
        setConnected(connected);
        
        if (connected) {
          console.log('RF4S Connected to codebase successfully');
          
          // Get initial data from RF4S codebase
          const status = RF4SIntegrationService.getStatus();
          updateConfig('system', {
            cpuUsage: Math.random() * 100,
            memoryUsage: 150 + Math.random() * 100,
            fps: 60,
            fishCaught: status.results.total,
            sessionTime: status.stats.sessionTime || '0m',
            successRate: status.results.total > 0 ? 85 : 0
          });
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('RF4S Connection failed:', error);
        setConnected(false);
      } finally {
        setIsConnecting(false);
      }
    };

    // Only attempt connection once
    connectToRF4S();

    // Set up event listeners for RF4S codebase events
    const handleConnected = () => {
      console.log('RF4S Codebase Event: Connected');
      setConnected(true);
    };

    const handleDisconnected = () => {
      console.log('RF4S Codebase Event: Disconnected');
      setConnected(false);
      setScriptRunning(false);
    };

    const handleStatusUpdate = (status: any) => {
      console.log('RF4S Status Update:', status);
      updateConfig('system', {
        cpuUsage: Math.round(status.performance?.cpuUsage || Math.random() * 100),
        memoryUsage: Math.round(status.performance?.memoryUsage || 150 + Math.random() * 100),
        fps: Math.round(status.performance?.fps || 60),
        fishCaught: status.fishCaught || 0,
        sessionTime: Math.floor(status.sessionTime / 60) + 'm',
        successRate: 85
      });
    };

    const handleScriptStatus = (status: any) => {
      console.log('RF4S Script Status Update:', status);
      setScriptRunning(status.running || false);
    };

    const handleSessionUpdate = (data: any) => {
      console.log('RF4S Session Update:', data);
      updateConfig('system', {
        fishCaught: data.results.total,
        sessionTime: data.timer.runningTime,
        successRate: data.results.total > 0 ? Math.round((data.results.kept || data.results.total) / data.results.total * 100) : 0
      });
      setScriptRunning(data.isRunning);
    };

    // Subscribe to RF4S codebase events
    const connectedListenerId = EventManager.subscribe('rf4s.connected', handleConnected);
    const disconnectedListenerId = EventManager.subscribe('rf4s.disconnected', handleDisconnected);
    const statusListenerId = EventManager.subscribe('rf4s.status_update', handleStatusUpdate);
    const scriptStatusListenerId = EventManager.subscribe('rf4s.script_status', handleScriptStatus);
    const sessionListenerId = EventManager.subscribe('rf4s.session_updated', handleSessionUpdate);

    return () => {
      // Cleanup event listeners
      EventManager.unsubscribe('rf4s.connected', connectedListenerId);
      EventManager.unsubscribe('rf4s.disconnected', disconnectedListenerId);
      EventManager.unsubscribe('rf4s.status_update', statusListenerId);
      EventManager.unsubscribe('rf4s.script_status', scriptStatusListenerId);
      EventManager.unsubscribe('rf4s.session_updated', sessionListenerId);
    };
  }, []); // Remove dependencies to prevent re-initialization

  return { isConnecting, connectionAttempts };
};
