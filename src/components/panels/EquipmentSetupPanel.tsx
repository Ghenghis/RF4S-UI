
import React from 'react';
import { useRF4SStore } from '../../stores/rf4sStore';
import CustomSlider from '../ui/CustomSlider';
import { Wrench, Target, Waves } from 'lucide-react';

const EquipmentSetupPanel: React.FC = () => {
  const { config, updateConfig } = useRF4SStore();
  const { equipment } = config;

  const rodTypes = ['Telescopic', 'Spinning', 'Feeder', 'Float', 'Bottom'];
  const rodSlots = ['Rod Slot 1', 'Rod Slot 2', 'Rod Slot 3', 'Rod Slot 4'];

  return (
    <div className="space-y-4">
      {/* Rod Configuration */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-blue-400" />
          <h4 className="text-sm font-semibold text-white">Rod Setup</h4>
        </div>
        
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-300 block mb-1">Main Rod</label>
            <select
              value={equipment.mainRod}
              onChange={(e) => updateConfig('equipment', { mainRod: e.target.value })}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white"
            >
              {rodSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-300 block mb-1">Spod Rod</label>
            <select
              value={equipment.spodRod}
              onChange={(e) => updateConfig('equipment', { spodRod: e.target.value })}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white"
            >
              {rodSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-300 block mb-1">Rod Type</label>
            <select
              value={equipment.rodType}
              onChange={(e) => updateConfig('equipment', { rodType: e.target.value })}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white"
            >
              {rodTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reel & Line Configuration */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Waves className="h-4 w-4 text-green-400" />
          <h4 className="text-sm font-semibold text-white">Reel & Line</h4>
        </div>

        <div className="space-y-2">
          <CustomSlider
            label="Reel Drag"
            value={equipment.reelDrag}
            onChange={(value) => updateConfig('equipment', { reelDrag: value })}
            min={5}
            max={50}
            step={1}
            unit="kg"
          />

          <CustomSlider
            label="Line Test"
            value={equipment.lineTest}
            onChange={(value) => updateConfig('equipment', { lineTest: value })}
            min={5}
            max={30}
            step={1}
            unit="kg"
          />

          <CustomSlider
            label="Leader Length"
            value={equipment.leaderLength}
            onChange={(value) => updateConfig('equipment', { leaderLength: value })}
            min={10}
            max={100}
            step={5}
            unit="cm"
          />
        </div>
      </div>

      {/* Terminal Tackle */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Wrench className="h-4 w-4 text-orange-400" />
          <h4 className="text-sm font-semibold text-white">Terminal Tackle</h4>
        </div>

        <div className="space-y-2">
          <CustomSlider
            label="Hook Size"
            value={equipment.hookSize}
            onChange={(value) => updateConfig('equipment', { hookSize: value })}
            min={2}
            max={20}
            step={1}
          />

          <CustomSlider
            label="Sinker Weight"
            value={equipment.sinkerWeight}
            onChange={(value) => updateConfig('equipment', { sinkerWeight: value })}
            min={5}
            max={100}
            step={5}
            unit="g"
          />

          <CustomSlider
            label="Float Size"
            value={equipment.floatSize}
            onChange={(value) => updateConfig('equipment', { floatSize: value })}
            min={1}
            max={10}
            step={0.5}
            unit="g"
          />
        </div>
      </div>

      {/* Quick Presets */}
      <div className="space-y-2">
        <h5 className="text-xs font-medium text-gray-300">Equipment Presets</h5>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              updateConfig('equipment', {
                hookSize: 8,
                sinkerWeight: 20,
                reelDrag: 15,
                lineTest: 10
              });
            }}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs"
          >
            Bottom Setup
          </button>
          <button
            onClick={() => {
              updateConfig('equipment', {
                hookSize: 6,
                sinkerWeight: 10,
                reelDrag: 12,
                lineTest: 8
              });
            }}
            className="p-2 bg-green-600 hover:bg-green-700 rounded text-white text-xs"
          >
            Spin Setup
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentSetupPanel;
