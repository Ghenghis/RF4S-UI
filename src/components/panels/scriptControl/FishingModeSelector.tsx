
import React from 'react';

interface FishingModeSelectorProps {
  currentMode: 'auto' | 'manual' | 'assistance';
  connected: boolean;
  onModeChange: (mode: 'auto' | 'manual' | 'assistance') => void;
}

const FishingModeSelector: React.FC<FishingModeSelectorProps> = ({
  currentMode,
  connected,
  onModeChange
}) => {
  const modes = [
    { value: 'auto', label: 'Automatic', desc: 'Full automation' },
    { value: 'manual', label: 'Manual', desc: 'User control' },
    { value: 'assistance', label: 'Assisted', desc: 'Smart help' },
  ] as const;

  return (
    <div className="space-y-1">
      <h4 className="text-xs font-medium text-gray-300">Fishing Mode</h4>
      <div className="space-y-1">
        {modes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => onModeChange(mode.value)}
            disabled={!connected}
            className={`w-full text-left p-1 rounded text-xs border transition-colors disabled:opacity-50 ${
              currentMode === mode.value
                ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                : 'border-gray-600 hover:border-gray-500 text-gray-300'
            }`}
          >
            <div className="font-medium">{mode.label}</div>
            <div className="text-gray-500 text-xs">{mode.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FishingModeSelector;
