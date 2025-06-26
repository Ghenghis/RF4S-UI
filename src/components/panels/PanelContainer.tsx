import React, { useState, useRef, useEffect } from 'react';
import { Minimize2, X, Move } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PanelLayout } from '../../types/rf4s';
import { useRF4SStore } from '../../stores/rf4sStore';

interface PanelContainerProps {
  panel: PanelLayout;
  children: React.ReactNode;
}

const PanelContainer: React.FC<PanelContainerProps> = ({ panel, children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  
  const { updatePanelPosition, togglePanelMinimized, togglePanelVisibility } = useRF4SStore();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        updatePanelPosition(panel.id, { x: Math.max(0, newX), y: Math.max(0, newY) });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, panel.id, updatePanelPosition]);

  const handleDragStart = (e: React.MouseEvent) => {
    if (panel.draggable) {
      const rect = panelRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
        setIsDragging(true);
      }
    }
  };

  if (!panel.visible) return null;

  return (
    <div
      ref={panelRef}
      className={cn(
        'absolute bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded shadow-lg',
        'transition-all duration-200 ease-in-out',
        isDragging && 'shadow-blue-500/20 shadow-lg',
        'w-full max-w-xs'
      )}
      style={{
        left: panel.position.x,
        top: panel.position.y,
        width: Math.min(panel.size.width, 280),
        height: panel.minimized ? 'auto' : Math.min(panel.size.height, 200),
        zIndex: panel.zIndex,
      }}
    >
      {/* Ultra Compact Panel Header */}
      <div
        className="flex items-center justify-between p-1 bg-gray-800/50 border-b border-gray-700/50 rounded-t cursor-move"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center space-x-1">
          <Move className="w-3 h-3 text-gray-400" />
          <h3 className="text-xs font-semibold text-white leading-tight">{panel.title}</h3>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => togglePanelMinimized(panel.id)}
            className="p-0.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            <Minimize2 className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={() => togglePanelVisibility(panel.id)}
            className="p-0.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Ultra Compact Panel Content */}
      {!panel.minimized && (
        <div className="p-2 h-full overflow-y-auto custom-scrollbar text-xs">
          {children}
        </div>
      )}
    </div>
  );
};

export default PanelContainer;
