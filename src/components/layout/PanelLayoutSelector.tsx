
import React from 'react';
import { Button } from '../ui/button';
import { useRF4SStore } from '../../stores/rf4sStore';

interface PanelLayoutSelectorProps {
  onLayoutChange: (layout: 1 | 2 | 3) => void;
  currentLayout: 1 | 2 | 3;
}

const PanelLayoutSelector: React.FC<PanelLayoutSelectorProps> = ({ 
  onLayoutChange, 
  currentLayout 
}) => {
  return (
    <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-800 rounded-lg">
      <span className="text-sm text-gray-300 mr-2">Panel Layout:</span>
      {[1, 2, 3].map((num) => (
        <Button
          key={num}
          onClick={() => onLayoutChange(num as 1 | 2 | 3)}
          variant={currentLayout === num ? "default" : "outline"}
          size="sm"
          className={`px-3 py-1 ${
            currentLayout === num 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
        >
          {num} Panel{num > 1 ? 's' : ''}
        </Button>
      ))}
    </div>
  );
};

export default PanelLayoutSelector;
