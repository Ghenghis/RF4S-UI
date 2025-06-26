
import React, { useEffect } from 'react';
import { useRF4SStore } from '../stores/rf4sStore';
import Header from '../components/layout/Header';
import Workspace from '../components/layout/Workspace';

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
    <div className="min-h-screen bg-gray-800 p-4 flex items-center justify-center">
      {/* Main Application Window Container */}
      <div className="w-full max-w-sm bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
        <Header />
        <Workspace />
      </div>
      
      {/* Ultra Compact Scrollbar Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.2);
          border-radius: 2px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.4);
          border-radius: 2px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.6);
        }
      `}} />
    </div>
  );
};

export default Index;
