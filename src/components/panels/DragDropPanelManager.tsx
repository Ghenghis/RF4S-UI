
import React, { useState, useRef, useEffect } from 'react';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { useRF4SStore } from '../../stores/rf4sStore';
import { cn } from '@/lib/utils';
import { GripVertical, Plus, Trash2 } from 'lucide-react';

interface DragDropPanelManagerProps {
  children: React.ReactNode;
}

const DragDropPanelManager: React.FC<DragDropPanelManagerProps> = ({ children }) => {
  const { panels, updatePanelPosition, removePanel } = useRF4SStore();
  const { dragState, startDrag, updateDrag, endDrag, cancelDrag } = useDragAndDrop();
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragState.isDragging) {
        setDragPreview({
          x: e.clientX - dragState.dragOffset.x,
          y: e.clientY - dragState.dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      if (dragState.isDragging) {
        const result = endDrag();
        if (result.draggedItem && result.dropTarget) {
          // Handle drop logic here
          console.log('Dropped', result.draggedItem, 'onto', result.dropTarget);
        }
        setDragPreview(null);
      }
    };

    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, endDrag]);

  const handlePanelDragStart = (panelId: string, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    startDrag(panelId, {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {children}
      
      {/* Drag Preview */}
      {dragState.isDragging && dragPreview && (
        <div
          className="fixed pointer-events-none z-50 bg-gray-800 border border-gray-600 rounded p-2 shadow-lg"
          style={{
            left: dragPreview.x,
            top: dragPreview.y,
            transform: 'rotate(5deg)'
          }}
        >
          <div className="text-white text-sm">
            Panel: {dragState.draggedItem}
          </div>
        </div>
      )}

      {/* Drop Zones */}
      <div className="absolute inset-0 pointer-events-none">
        {dragState.isDragging && (
          <>
            <div className="absolute top-4 left-4 right-4 h-16 border-2 border-dashed border-blue-400 rounded bg-blue-400/10" />
            <div className="absolute bottom-4 left-4 right-4 h-16 border-2 border-dashed border-blue-400 rounded bg-blue-400/10" />
            <div className="absolute top-20 left-4 bottom-20 w-16 border-2 border-dashed border-blue-400 rounded bg-blue-400/10" />
            <div className="absolute top-20 right-4 bottom-20 w-16 border-2 border-dashed border-blue-400 rounded bg-blue-400/10" />
          </>
        )}
      </div>
    </div>
  );
};

export default DragDropPanelManager;
