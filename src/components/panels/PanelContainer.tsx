
import React, { useState, useRef, useEffect } from 'react';
import { Minimize2, Maximize2, X, Move } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PanelLayout } from '../../types/rf4s';
import { useRF4SStore } from '../../stores/rf4sStore';

interface PanelContainerProps {
  panel: PanelLayout;
  children: React.ReactNode;
}

const PanelContainer: React.FC<PanelContainerProps> = ({ panel, children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  
  const { updatePanelPosition, updatePanelSize, togglePanelMinimized, togglePanelVisibility } = useRF4SStore();

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
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, panel.id, updatePanelPosition]);

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
        'absolute bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl',
        'transition-all duration-200 ease-in-out',
        isDragging && 'shadow-blue-500/20 shadow-2xl',
        'md:relative md:w-full md:h-auto md:max-w-none'
      )}
      style={{
        left: panel.position.x,
        top: panel.position.y,
        width: panel.size.width,
        height: panel.minimized ? 'auto' : panel.size.height,
        zIndex: panel.zIndex,
      }}
    >
      {/* Panel Header */}
      <div
        className="flex items-center justify-between p-3 bg-gray-800/50 border-b border-gray-700 rounded-t-lg cursor-move"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center space-x-2">
          <Move className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-white">{panel.title}</h3>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => togglePanelMinimized(panel.id)}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            <Minimize2 className="w-3 h-3" />
          </button>
          <button
            onClick={() => togglePanelVisibility(panel.id)}
            className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Panel Content */}
      {!panel.minimized && (
        <div className="p-4 h-full overflow-y-auto custom-scrollbar">
          {children}
        </div>
      )}

      {/* Resize Handle */}
      {panel.resizable && !panel.minimized && (
        <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100">
          <div className="w-full h-full bg-gradient-to-br from-transparent to-gray-600 rounded-tl-lg" />
        </div>
      )}
    </div>
  );
};

export default PanelContainer;
