
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
  className,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('w-full space-y-2', className)}>
      {label && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-300">{label}</span>
          <span className="text-blue-400 font-mono">
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
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="slider-custom w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #2196f3 0%, #2196f3 ${percentage}%, #374151 ${percentage}%, #374151 100%)`,
          }}
        />
        <style jsx>{`
          .slider-custom::-webkit-slider-thumb {
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #2196f3;
            border: 2px solid #ffffff;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          }
          
          .slider-custom::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #2196f3;
            border: 2px solid #ffffff;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          }
        `}</style>
      </div>
    </div>
  );
};

export default CustomSlider;
