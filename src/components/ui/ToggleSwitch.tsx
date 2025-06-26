
import React from 'react';
import { cn } from '@/lib/utils';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  size = 'sm',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-3',
    md: 'w-8 h-4',
    lg: 'w-10 h-5',
  };

  const thumbSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const translateClasses = {
    sm: checked ? 'translate-x-3' : 'translate-x-0',
    md: checked ? 'translate-x-4' : 'translate-x-0',
    lg: checked ? 'translate-x-5' : 'translate-x-0',
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-blue-500',
          sizeClasses[size],
          checked ? 'bg-blue-600' : 'bg-gray-600'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            thumbSizeClasses[size],
            translateClasses[size]
          )}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-xs font-medium text-gray-300 leading-tight">{label}</span>}
          {description && <span className="text-xs text-gray-500 leading-tight">{description}</span>}
        </div>
      )}
    </div>
  );
};

export default ToggleSwitch;
