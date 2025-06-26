
import React, { useState } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);
  const Icon = item.icon;
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'main': return 'bg-green-400';
      case 'settings': return 'bg-yellow-400';
      case 'tools': return 'bg-blue-400';
      case 'smart': return 'bg-purple-400';
      case 'ai': return 'bg-pink-400';
      default: return 'bg-gray-400';
    }
  };

  const getHoverEffect = (category: string) => {
    switch (category) {
      case 'main': return 'hover:bg-green-600/20 hover:border-green-400/50';
      case 'settings': return 'hover:bg-yellow-600/20 hover:border-yellow-400/50';
      case 'tools': return 'hover:bg-blue-600/20 hover:border-blue-400/50';
      case 'smart': return 'hover:bg-purple-600/20 hover:border-purple-400/50';
      case 'ai': return 'hover:bg-pink-600/20 hover:border-pink-400/50';
      default: return 'hover:bg-gray-600/20';
    }
  };
  
  return (
    <button
      onClick={() => onClick(item.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "w-full h-full p-2 border-b border-gray-700/30 transition-all duration-200 group relative flex flex-col items-center justify-center gap-1 cursor-pointer",
        "transform hover:scale-105 active:scale-95",
        getHoverEffect(item.category),
        isActive && "bg-gray-700/70 scale-105",
        isPanelVisible && item.category === 'main' && "bg-blue-600/30",
        isHovered && "shadow-lg"
      )}
      title={`${item.label}${item.description ? ` - ${item.description}` : ''}`}
    >
      {/* Glow effect on hover */}
      {isHovered && (
        <div className={cn(
          "absolute inset-0 rounded opacity-20 blur-sm",
          item.category === 'main' && "bg-green-400",
          item.category === 'settings' && "bg-yellow-400",
          item.category === 'tools' && "bg-blue-400",
          item.category === 'smart' && "bg-purple-400",
          item.category === 'ai' && "bg-pink-400"
        )} />
      )}

      <Icon className={cn(
        "h-4 w-4 flex-shrink-0 transition-all duration-200",
        isActive ? "text-white scale-110" : "text-gray-400 group-hover:text-white",
        isPanelVisible && item.category === 'main' && "text-blue-400",
        isHovered && "drop-shadow-lg"
      )} />
      
      {/* Label text */}
      <span className={cn(
        "text-[9px] font-medium leading-tight text-center px-1 line-clamp-2 transition-all duration-200",
        isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300",
        isPanelVisible && item.category === 'main' && "text-blue-300",
        isHovered && "font-semibold"
      )}>
        {item.label}
      </span>
      
      {/* Enhanced category indicator with pulse animation */}
      <div className={cn(
        "absolute right-1 top-1 w-1.5 h-1.5 rounded-full transition-all duration-200",
        getCategoryColor(item.category),
        isHovered && "w-2 h-2 animate-pulse"
      )} />

      {/* Smart feature badge for AI/Smart categories */}
      {(item.category === 'ai' || item.category === 'smart') && (
        <div className={cn(
          "absolute left-1 top-1 w-1 h-1 rounded-full bg-gradient-to-r transition-all duration-200",
          item.category === 'ai' ? "from-pink-400 to-purple-400" : "from-purple-400 to-blue-400",
          isHovered && "w-1.5 h-1.5 animate-pulse"
        )} />
      )}
    </button>
  );
};

export default IconButton;
