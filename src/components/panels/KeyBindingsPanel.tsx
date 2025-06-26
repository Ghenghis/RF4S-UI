
import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useConfigManager } from '../../hooks/useConfigManager';
import { Save, RefreshCw, Keyboard } from 'lucide-react';

const KeyBindingsPanel: React.FC = () => {
  const { config, updateConfig, saveVersion } = useConfigManager();
  const [keyBindings, setKeyBindings] = useState({
    TEA: config.KEY.TEA,
    CARROT: config.KEY.CARROT,
    BOTTOM_RODS: config.KEY.BOTTOM_RODS,
    COFFEE: config.KEY.COFFEE,
    DIGGING_TOOL: config.KEY.DIGGING_TOOL,
    ALCOHOL: config.KEY.ALCOHOL,
    MAIN_ROD: config.KEY.MAIN_ROD,
    SPOD_ROD: config.KEY.SPOD_ROD,
    QUIT: config.KEY.QUIT
  });

  const [isListening, setIsListening] = useState<string | null>(null);

  const handleKeyCapture = (keyName: string, event: React.KeyboardEvent) => {
    if (isListening === keyName) {
      event.preventDefault();
      let keyValue;
      
      if (event.key === 'Escape') {
        setIsListening(null);
        return;
      }

      // Handle special keys
      if (event.ctrlKey && event.key !== 'Control') {
        keyValue = `CTRL-${event.key.toUpperCase()}`;
      } else if (event.shiftKey && event.key !== 'Shift') {
        keyValue = `SHIFT-${event.key.toUpperCase()}`;
      } else if (event.altKey && event.key !== 'Alt') {
        keyValue = `ALT-${event.key.toUpperCase()}`;
      } else {
        // For number keys and regular keys
        keyValue = event.key === ' ' ? 'SPACE' : event.key.toLowerCase();
        
        // Convert to number if it's a digit
        if (/^\d$/.test(keyValue)) {
          keyValue = parseInt(keyValue);
        }
      }

      setKeyBindings(prev => ({
        ...prev,
        [keyName]: keyValue
      }));

      setIsListening(null);
    }
  };

  const handleBottomRodChange = (index: number, value: string) => {
    const newRods = [...keyBindings.BOTTOM_RODS];
    newRods[index] = parseInt(value) || 1;
    setKeyBindings(prev => ({
      ...prev,
      BOTTOM_RODS: newRods
    }));
  };

  const handleSave = () => {
    updateConfig('KEY', keyBindings);
    saveVersion('Updated key bindings configuration');
    console.log('Key bindings saved:', keyBindings);
  };

  const handleReset = () => {
    const defaultKeys = {
      TEA: -1,
      CARROT: -1,
      BOTTOM_RODS: [1, 2, 3],
      COFFEE: 4,
      DIGGING_TOOL: 5,
      ALCOHOL: 6,
      MAIN_ROD: 1,
      SPOD_ROD: 7,
      QUIT: "CTRL-C"
    };
    setKeyBindings(defaultKeys);
  };

  const renderKeyInput = (keyName: string, value: any, label: string) => {
    const isListeningToThis = isListening === keyName;
    
    return (
      <div className="flex items-center space-x-3">
        <Label className="w-24 text-sm">{label}</Label>
        <div className="flex-1 flex items-center space-x-2">
          <Input
            value={isListeningToThis ? 'Press key...' : value.toString()}
            readOnly
            className={`bg-gray-700 border-gray-600 text-center ${
              isListeningToThis ? 'bg-blue-600 animate-pulse' : ''
            }`}
            onKeyDown={(e) => handleKeyCapture(keyName, e)}
            onClick={() => setIsListening(keyName)}
          />
          <Button
            size="sm"
            variant={isListeningToThis ? "default" : "outline"}
            onClick={() => setIsListening(isListeningToThis ? null : keyName)}
          >
            <Keyboard className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-gray-900 text-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Key Bindings</h2>
        <div className="flex space-x-2">
          <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button onClick={handleReset} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="p-4 bg-gray-800 border-gray-700">
          <h3 className="font-semibold mb-4">Consumables & Tools</h3>
          <div className="space-y-3">
            {renderKeyInput('TEA', keyBindings.TEA, 'Tea')}
            {renderKeyInput('CARROT', keyBindings.CARROT, 'Carrot')}
            {renderKeyInput('COFFEE', keyBindings.COFFEE, 'Coffee')}
            {renderKeyInput('ALCOHOL', keyBindings.ALCOHOL, 'Alcohol')}
            {renderKeyInput('DIGGING_TOOL', keyBindings.DIGGING_TOOL, 'Digging Tool')}
          </div>
        </Card>

        <Card className="p-4 bg-gray-800 border-gray-700">
          <h3 className="font-semibold mb-4">Fishing Rods</h3>
          <div className="space-y-3">
            {renderKeyInput('MAIN_ROD', keyBindings.MAIN_ROD, 'Main Rod')}
            {renderKeyInput('SPOD_ROD', keyBindings.SPOD_ROD, 'Spod Rod')}
            
            <div className="space-y-2">
              <Label className="text-sm">Bottom Rods</Label>
              <div className="grid grid-cols-3 gap-2">
                {keyBindings.BOTTOM_RODS.map((rod, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Label className="text-xs w-12">Rod {index + 1}</Label>
                    <Input
                      type="number"
                      value={rod}
                      onChange={(e) => handleBottomRodChange(index, e.target.value)}
                      className="bg-gray-700 border-gray-600 text-center"
                      min="1"
                      max="9"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gray-800 border-gray-700">
          <h3 className="font-semibold mb-4">System Controls</h3>
          <div className="space-y-3">
            {renderKeyInput('QUIT', keyBindings.QUIT, 'Quit')}
          </div>
        </Card>

        <Card className="p-4 bg-gray-800 border-gray-700">
          <h3 className="font-semibold mb-4">Instructions</h3>
          <div className="text-sm text-gray-400 space-y-2">
            <p>• Click on an input field or keyboard icon to capture a key</p>
            <p>• Press the desired key combination (Ctrl+C, Shift+A, etc.)</p>
            <p>• Use -1 to disable a key binding</p>
            <p>• Press Escape to cancel key capture</p>
            <p>• Number keys are automatically converted to numeric values</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default KeyBindingsPanel;
