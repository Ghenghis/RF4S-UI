
import { useState, useEffect } from 'react';
import { MasterServiceOrchestrator } from '../services/MasterServiceOrchestrator';
import { EventManager } from '../core/EventManager';

interface SystemInitializationState {
  isInitializing: boolean;
  isReady: boolean;
  progress: number;
  currentPhase: string;
  errors: string[];
  retryCount: number;
}

export const useSystemInitialization = () => {
  const [state, setState] = useState<SystemInitializationState>({
    isInitializing: false,
    isReady: false,
    progress: 0,
    currentPhase: 'Idle',
    errors: [],
    retryCount: 0
  });

  useEffect(() => {
    initializeSystem();

    // Listen for initialization events
    const subscriptionId = EventManager.subscribe('system.initialization_complete', (data) => {
      setState(prev => ({
        ...prev,
        isInitializing: false,
        isReady: true,
        progress: 100,
        currentPhase: 'Ready'
      }));
    });

    return () => {
      // Cleanup subscription if supported
    };
  }, []);

  const initializeSystem = async () => {
    setState(prev => ({
      ...prev,
      isInitializing: true,
      isReady: false,
      progress: 0,
      currentPhase: 'Starting system...',
      errors: []
    }));

    try {
      await MasterServiceOrchestrator.initializeSystem();
    } catch (error) {
      setState(prev => ({
        ...prev,
        isInitializing: false,
        errors: [...prev.errors, error instanceof Error ? error.message : 'Unknown error'],
        retryCount: prev.retryCount + 1
      }));
    }
  };

  const retryInitialization = async () => {
    await initializeSystem();
  };

  const getSystemStatus = () => {
    return MasterServiceOrchestrator.getStatus();
  };

  const getSystemHealth = () => {
    return MasterServiceOrchestrator.getSystemHealth();
  };

  return {
    ...state,
    retryInitialization,
    getSystemStatus,
    getSystemHealth,
    isSystemReady: MasterServiceOrchestrator.isSystemReady()
  };
};
