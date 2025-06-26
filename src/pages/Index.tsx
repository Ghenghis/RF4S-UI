
import React, { useEffect } from 'react';
import { useRF4SStore } from '../stores/rf4sStore';
import Header from '../components/layout/Header';
import Workspace from '../components/layout/Workspace';

const Index = () => {
  const { setConnectionStatus, setGameDetection } = useRF4SStore();

  useEffect(() => {
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
  }, [setConnectionStatus, setGameDetection]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <Workspace />
      
      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.8);
        }
      `}</style>
    </div>
  );
};

export default Index;
