
import React, { useState, useRef, useEffect } from 'react';
import { Minimize2, X, Move, Maximize2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PanelLayout } from '../../types/rf4s';
import { useRF4SStore } from '../../stores/rf4sStore';

interface EnhancedPanelContainerProps {
  panel: PanelLayout;
  children: React.ReactNode;
  onResize?: (size: { width: number; height: number }) => void;
  onMove?: (position: { x: number; y: number }) => void;
}

const EnhancedPanelContainer: React.FC<EnhancedPanelContainerProps> = ({ 
  panel, 
  children, 
  onResize, 
  onMove 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [previousState, setPreviousState] = useState({ 
    size: panel.size, 
    position: panel.position 
  });
  
  const panelRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  
  const { updatePanelPosition, updatePanelSize, togglePanelMinimized, togglePanelVisibility } = useRF4SStore();

  // Drag functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        const position = { x: Math.max(0, newX), y: Math.max(0, newY) };
        updatePanelPosition(panel.id, position);
        onMove?.(position);
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
  }, [isDragging, isResizing, dragOffset, panel.id, updatePanelPosition, onMove, isMaximized]);

  const handleDragStart = (e: React.MouseEvent) => {
    if (panel.draggable && !isMaximized) {
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

  const handleMaximize = () => {
    if (!isMaximized) {
      setPreviousState({ size: panel.size, position: panel.position });
      setIsMaximized(true);
    } else {
      updatePanelSize(panel.id, previousState.size);
      updatePanelPosition(panel.id, previousState.position);
      setIsMaximized(false);
    }
  };

  const handleRestore = () => {
    updatePanelSize(panel.id, panel.defaultSize);
    updatePanelPosition(panel.id, panel.defaultPosition);
    setIsMaximized(false);
  };

  if (!panel.visible) return null;

  const panelStyle = isMaximized ? {
    left: 0,
    top: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 9999,
  } : {
    left: panel.position.x,
    top: panel.position.y,
    width: panel.size.width,
    height: panel.minimized ? 'auto' : panel.size.height,
    zIndex: panel.zIndex,
  };

  return (
    <div
      ref={panelRef}
      className={cn(
        'absolute bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl',
        'transition-all duration-200 ease-in-out',
        isDragging && 'shadow-blue-500/30 shadow-2xl',
        isMaximized && 'rounded-none'
      )}
      style={panelStyle}
    >
      {/* Enhanced Panel Header */}
      <div
        className={cn(
          'flex items-center justify-between p-2 bg-gray-800/80 border-b border-gray-700/50',
          isMaximized ? 'rounded-none' : 'rounded-t-lg',
          panel.draggable && !isMaximized && 'cursor-move'
        )}
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center space-x-2">
          <Move className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-white truncate">{panel.title}</h3>
        </div>
        
        <div className="flex items-center space-x-1">
          {panel.minimizable && (
            <button
              onClick={() => togglePanelMinimized(panel.id)}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-3 h-3" />
            </button>
          )}
          
          <button
            onClick={handleMaximize}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            <Maximize2 className="w-3 h-3" />
          </button>
          
          <button
            onClick={handleRestore}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Restore Default"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
          
          {panel.closable && (
            <button
              onClick={() => togglePanelVisibility(panel.id)}
              className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
              title="Close"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Panel Content */}
      {!panel.minimized && (
        <div className="flex-1 overflow-auto custom-scrollbar">
          {children}
        </div>
      )}

      {/* Resize Handle */}
      {panel.resizable && !panel.minimized && !isMaximized && (
        <div
          ref={resizeHandleRef}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={() => setIsResizing(true)}
        >
          <div className="absolute bottom-1 right-1 w-0 h-0 border-l-2 border-b-2 border-gray-500" />
        </div>
      )}
    </div>
  );
};

export default EnhancedPanelContainer;
