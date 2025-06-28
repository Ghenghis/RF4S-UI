
import { useState, useEffect } from 'react';
import { EnhancedServiceCoordinator } from '../services/EnhancedServiceCoordinator';

export const useWorkspaceInitialization = () => {
  const [systemInitialized, setSystemInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    const initializeSystem = async () => {
      if (!systemInitialized) {
        try {
          console.log('Initializing Enhanced Service Coordinator...');
          await EnhancedServiceCoordinator.initializeAllSystems();
          setSystemInitialized(true);
          console.log('Enhanced Service Coordinator initialized successfully');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
          console.error('Failed to initialize Enhanced Service Coordinator:', error);
          setInitializationError(errorMessage);
        }
      }
    };
    
    initializeSystem();
    
    return () => {
      console.log('Workspace cleanup');
    };
  }, []); // Remove dependencies to prevent restart loops

  return {
    systemInitialized,
    initializationError
  };
};
