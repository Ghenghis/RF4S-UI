
import React from 'react';
import { useRF4SStore } from '../../stores/rf4sStore';

const Header: React.FC = () => {
  const { connected, gameDetectionActive, config } = useRF4SStore();

  return (
    <header className="bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 px-3 py-2 flex-shrink-0">
      <div className="flex flex-col space-y-2">
        {/* Brand Section */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">RF4S</span>
          </div>
          <div className="flex-1">
            <h1 className="text-white font-bold text-sm leading-tight">RF4S Automation</h1>
          </div>
        </div>

        {/* Status Indicators Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between p-1 bg-gray-700/30 rounded text-xs">
            <span className="text-gray-300">RF4S</span>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
          </div>
          
          <div className="flex items-center justify-between p-1 bg-gray-700/30 rounded text-xs">
            <span className="text-gray-300">Game</span>
            <div className={`w-2 h-2 rounded-full ${gameDetectionActive ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
          </div>
          
          <div className="flex items-center justify-between p-1 bg-gray-700/30 rounded text-xs">
            <span className="text-gray-300">Script</span>
            <div className={`w-2 h-2 rounded-full ${config.script.enabled ? 'bg-green-500' : 'bg-gray-500'}`} />
          </div>
          
          <div className="flex items-center justify-between p-1 bg-gray-700/30 rounded text-xs">
            <span className="text-gray-300">Time</span>
            <span className="text-white font-mono text-xs">{config.system.sessionTime}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
