
import React from 'react';
import { useRF4SStore } from '../../stores/rf4sStore';
import ToggleSwitch from '../ui/ToggleSwitch';
import CustomSlider from '../ui/CustomSlider';
import { Zap, Timer, Fish } from 'lucide-react';

const AutomationSettingsPanel: React.FC = () => {
  const { config, updateConfig } = useRF4SStore();
  const { automation } = config;

  return (
    <div className="space-y-4">
      {/* Bottom Fishing Automation */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Fish className="h-4 w-4 text-brown-400" />
          <h4 className="text-sm font-semibold text-white">Bottom Fishing</h4>
        </div>
        
        <ToggleSwitch
          checked={automation.bottomEnabled}
          onChange={(checked) => updateConfig('automation', { bottomEnabled: checked })}
          label="Enable Bottom Automation"
          size="sm"
        />

        {automation.bottomEnabled && (
          <div className="space-y-2 pl-4 border-l-2 border-brown-400">
            <CustomSlider
              label="Wait Time"
              value={automation.bottomWaitTime}
              onChange={(value) => updateConfig('automation', { bottomWaitTime: value })}
              min={60}
              max={600}
              step={30}
              unit="s"
            />
            
            <CustomSlider
              label="Hook Delay"
              value={automation.bottomHookDelay}
              onChange={(value) => updateConfig('automation', { bottomHookDelay: value })}
              min={0.1}
              max={3.0}
              step={0.1}
              unit="s"
            />
          </div>
        )}
      </div>

      {/* Spin Fishing Automation */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-blue-400" />
          <h4 className="text-sm font-semibold text-white">Spin Fishing</h4>
        </div>
        
        <ToggleSwitch
          checked={automation.spinEnabled}
          onChange={(checked) => updateConfig('automation', { spinEnabled: checked })}
          label="Enable Spin Automation"
          size="sm"
        />

        {automation.spinEnabled && (
          <div className="space-y-2 pl-4 border-l-2 border-blue-400">
            <CustomSlider
              label="Retrieve Speed"
              value={automation.spinRetrieveSpeed}
              onChange={(value) => updateConfig('automation', { spinRetrieveSpeed: value })}
              min={10}
              max={100}
              step={5}
              unit="%"
            />
            
            <CustomSlider
              label="Twitch Frequency"
              value={automation.spinTwitchFrequency}
              onChange={(value) => updateConfig('automation', { spinTwitchFrequency: value })}
              min={0.5}
              max={10.0}
              step={0.5}
              unit="s"
            />
          </div>
        )}
      </div>

      {/* Pirk Fishing Automation */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Timer className="h-4 w-4 text-purple-400" />
          <h4 className="text-sm font-semibold text-white">Pirk Fishing</h4>
        </div>
        
        <ToggleSwitch
          checked={automation.pirkEnabled}
          onChange={(checked) => updateConfig('automation', { pirkEnabled: checked })}
          label="Enable Pirk Automation"
          size="sm"
        />
      </div>

      {/* General Automation Settings */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white">General Settings</h4>
        
        <div className="space-y-2">
          <div className="text-xs text-gray-300">Cast Delay Range</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400">Min</label>
              <CustomSlider
                label=""
                value={automation.castDelayMin}
                onChange={(value) => updateConfig('automation', { castDelayMin: value })}
                min={0.5}
                max={10.0}
                step={0.5}
                unit="s"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Max</label>
              <CustomSlider
                label=""
                value={automation.castDelayMax}
                onChange={(value) => updateConfig('automation', { castDelayMax: value })}
                min={1.0}
                max={20.0}
                step={0.5}
                unit="s"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Automation Status */}
      <div className="p-3 bg-gray-800 rounded border">
        <h5 className="text-xs font-medium text-gray-300 mb-2">Active Automations</h5>
        <div className="space-y-1 text-xs">
          <div className={`flex justify-between ${automation.bottomEnabled ? 'text-green-400' : 'text-gray-500'}`}>
            <span>Bottom Fishing</span>
            <span>{automation.bottomEnabled ? 'ON' : 'OFF'}</span>
          </div>
          <div className={`flex justify-between ${automation.spinEnabled ? 'text-green-400' : 'text-gray-500'}`}>
            <span>Spin Fishing</span>
            <span>{automation.spinEnabled ? 'ON' : 'OFF'}</span>
          </div>
          <div className={`flex justify-between ${automation.pirkEnabled ? 'text-green-400' : 'text-gray-500'}`}>
            <span>Pirk Fishing</span>
            <span>{automation.pirkEnabled ? 'ON' : 'OFF'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationSettingsPanel;
