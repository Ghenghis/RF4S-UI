
import React, { useEffect } from 'react';
import { useRF4SStore } from '../stores/rf4sStore';
import Header from '../components/layout/Header';
import EnhancedMainWindow from '../components/layout/EnhancedMainWindow';

const Index = () => {
  const { setConnectionStatus, setGameDetection, initializeRF4S } = useRF4SStore();

  useEffect(() => {
    // Initialize RF4S service integration
    initializeRF4S();

    // Simulate connection status
    const connectionTimer = setTimeout(() => {
      setConnectionStatus(true);
    }, 2000);

    const detectionTimer = setTimeout(() => {
      setGameDetection(true);
    }, 3000);

    return () => {
      clearTimeout(connectionTimer);
      clearTimeout(detectionTimer);
    };
  }, [setConnectionStatus, setGameDetection, initializeRF4S]);

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 min-h-0">
        <EnhancedMainWindow />
      </div>
    </div>
  );
};

export default Index;
