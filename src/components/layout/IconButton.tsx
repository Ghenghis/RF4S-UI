
import React from 'react';
import { cn } from '@/lib/utils';
import { IconBarItem } from './iconBarConfig';

interface IconButtonProps {
  item: IconBarItem;
  isActive: boolean;
  isPanelVisible: boolean;
  onClick: (itemId: string) => void;
}

const IconButton: React.FC<IconButtonProps> = ({ 
  item, 
  isActive, 
  isPanelVisible, 
  onClick 
}) => {
  const Icon = item.icon;
  
  return (
    <button
      onClick={() => onClick(item.id)}
      className={cn(
        "w-full p-3 border-b border-gray-700/30 hover:bg-gray-700/50 transition-colors group relative flex items-center justify-center",
        isActive && "bg-gray-700/70",
        isPanelVisible && item.category === 'main' && "bg-blue-600/30"
      )}
      title={item.label}
    >
      <Icon className={cn(
        "h-5 w-5",
        isActive ? "text-white" : "text-gray-400 group-hover:text-white",
        isPanelVisible && item.category === 'main' && "text-blue-400"
      )} />
      
      {/* Category indicator */}
      <div className={cn(
        "absolute right-1 top-1 w-2 h-2 rounded-full",
        item.category === 'main' && "bg-green-500",
        item.category === 'settings' && "bg-yellow-500",
        item.category === 'tools' && "bg-blue-500"
      )} />
    </button>
  );
};

export default IconButton;
