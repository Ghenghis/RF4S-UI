
import React from 'react';
import ToggleSwitch from '../../ui/ToggleSwitch';
import CustomSlider from '../../ui/CustomSlider';

interface ScriptSettingsProps {
  sensitivity: number;
  delay: number;
  randomCast: boolean;
  onSensitivityChange: (value: number) => void;
  onDelayChange: (value: number) => void;
  onRandomCastChange: (checked: boolean) => void;
}

const ScriptSettings: React.FC<ScriptSettingsProps> = ({
  sensitivity,
  delay,
  randomCast,
  onSensitivityChange,
  onDelayChange,
  onRandomCastChange
}) => {
  return (
    <div className="space-y-2">
      <CustomSlider
        label="Sensitivity"
        value={sensitivity}
        onChange={onSensitivityChange}
        min={0.1}
        max={1.0}
        step={0.1}
      />
      
      <CustomSlider
        label="Reaction Delay"
        value={delay}
        onChange={onDelayChange}
        min={0.5}
        max={5.0}
        step={0.1}
        unit="s"
      />

      <ToggleSwitch
        checked={randomCast}
        onChange={onRandomCastChange}
        label="Random Cast"
        size="sm"
      />
    </div>
  );
};

export default ScriptSettings;
