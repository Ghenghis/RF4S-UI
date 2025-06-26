
import React from 'react';
import { useRF4SStore } from '../../stores/rf4sStore';

const Header: React.FC = () => {
  const { connected, gameDetectionActive, config } = useRF4SStore();

  return (
    <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RF4S</span>
            </div>
            <div>
              <h1 className="text-white font-bold">RF4S Intelligent Multi-Panel System v4.0</h1>
              <p className="text-xs text-gray-400">Russian Fishing 4 Automation Suite</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* Status Indicators */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span className="text-xs text-gray-400">RF4S Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${gameDetectionActive ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
              <span className="text-xs text-gray-400">Game Detection Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${config.script.enabled ? 'bg-green-500' : 'bg-gray-500'}`} />
              <span className="text-xs text-gray-400">
                Script {config.script.enabled ? 'Running' : 'Stopped'}
              </span>
            </div>
          </div>

          {/* Session Timer */}
          <div className="text-right">
            <div className="text-sm font-mono text-white">{config.system.sessionTime}</div>
            <div className="text-xs text-gray-400">Session Time</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
