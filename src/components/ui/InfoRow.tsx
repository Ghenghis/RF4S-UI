
import React from 'react';
import { cn } from '@/lib/utils';

interface InfoRowProps {
  label: string;
  value: string | number | React.ReactNode;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  className,
  labelClassName,
  valueClassName
}) => {
  return (
    <div className={cn('flex justify-between items-center py-1', className)}>
      <span className={cn('text-gray-400 text-sm', labelClassName)}>
        {label}:
      </span>
      <span className={cn('text-white text-sm font-medium', valueClassName)}>
        {value}
      </span>
    </div>
  );
};

export default InfoRow;
