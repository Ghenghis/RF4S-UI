
import { useState, useEffect } from 'react';
import { EnhancedServiceCoordinator } from '../services/EnhancedServiceCoordinator';

export const useWorkspaceInitialization = () => {
  const [systemInitialized, setSystemInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const initializeSystem = async () => {
      if (systemInitialized) return;
      
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('Initializing Enhanced Service Coordinator...');
        }
        await EnhancedServiceCoordinator.initializeAllSystems();
        
        if (isMounted) {
          setSystemInitialized(true);
          if (process.env.NODE_ENV === 'development') {
            console.log('Enhanced Service Coordinator initialized successfully');
          }
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
          console.error('Failed to initialize Enhanced Service Coordinator:', error);
          setInitializationError(errorMessage);
        }
      }
    };
    
    initializeSystem();
    
    return () => {
      isMounted = false;
    };
  }, [systemInitialized]); // Add systemInitialized to dependencies to prevent re-initialization

  return {
    systemInitialized,
    initializationError
  };
};
