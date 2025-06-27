
import React from 'react';
import { cn } from '@/lib/utils';

interface CustomSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
  disabled?: boolean;
  className?: string;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  unit = '',
  disabled = false,
  className,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('w-full space-y-1', className)}>
      {label && (
        <div className="flex justify-between items-center text-xs">
          <span className={cn('text-gray-300 text-xs leading-tight', disabled && 'text-gray-500')}>{label}</span>
          <span className={cn('text-blue-400 font-mono text-xs', disabled && 'text-gray-500')}>
            {value}
            {unit}
          </span>
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={cn(
            "slider-custom w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer",
            disabled && "cursor-not-allowed opacity-50"
          )}
          style={{
            background: disabled 
              ? '#374151'
              : `linear-gradient(to right, #2196f3 0%, #2196f3 ${percentage}%, #374151 ${percentage}%, #374151 100%)`,
          }}
        />
        <style dangerouslySetInnerHTML={{
          __html: `
          .slider-custom::-webkit-slider-thumb {
            appearance: none;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: ${disabled ? '#6b7280' : '#2196f3'};
            border: 1px solid #ffffff;
            cursor: ${disabled ? 'not-allowed' : 'pointer'};
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          }
          
          .slider-custom::-moz-range-thumb {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: ${disabled ? '#6b7280' : '#2196f3'};
            border: 1px solid #ffffff;
            cursor: ${disabled ? 'not-allowed' : 'pointer'};
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          }
        `}} />
      </div>
    </div>
  );
};

export default CustomSlider;
