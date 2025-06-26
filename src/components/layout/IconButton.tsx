
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
        "w-full h-full p-2 border-b border-gray-700/30 hover:bg-gray-700/50 transition-colors group relative flex flex-col items-center justify-center gap-1",
        isActive && "bg-gray-700/70",
        isPanelVisible && item.category === 'main' && "bg-blue-600/30"
      )}
      title={`${item.label}${item.description ? ` - ${item.description}` : ''}`}
    >
      <Icon className={cn(
        "h-4 w-4 flex-shrink-0",
        isActive ? "text-white" : "text-gray-400 group-hover:text-white",
        isPanelVisible && item.category === 'main' && "text-blue-400"
      )} />
      
      {/* Label text */}
      <span className={cn(
        "text-[9px] font-medium leading-tight text-center px-1 line-clamp-2",
        isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300",
        isPanelVisible && item.category === 'main' && "text-blue-300"
      )}>
        {item.label}
      </span>
      
      {/* Category indicator */}
      <div className={cn(
        "absolute right-1 top-1 w-1.5 h-1.5 rounded-full",
        item.category === 'main' && "bg-green-400",
        item.category === 'settings' && "bg-yellow-400", 
        item.category === 'tools' && "bg-blue-400"
      )} />
    </button>
  );
};

export default IconButton;
