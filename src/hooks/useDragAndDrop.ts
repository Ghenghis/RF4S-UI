
import { useState, useCallback } from 'react';

interface DragState {
  isDragging: boolean;
  draggedItem: any;
  dragOffset: { x: number; y: number };
  dropTarget: string | null;
}

export const useDragAndDrop = () => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItem: null,
    dragOffset: { x: 0, y: 0 },
    dropTarget: null
  });

  const startDrag = useCallback((item: any, offset: { x: number; y: number }) => {
    setDragState({
      isDragging: true,
      draggedItem: item,
      dragOffset: offset,
      dropTarget: null
    });
  }, []);

  const updateDrag = useCallback((dropTarget: string | null) => {
    setDragState(prev => ({
      ...prev,
      dropTarget
    }));
  }, []);

  const endDrag = useCallback(() => {
    const result = {
      draggedItem: dragState.draggedItem,
      dropTarget: dragState.dropTarget
    };
    
    setDragState({
      isDragging: false,
      draggedItem: null,
      dragOffset: { x: 0, y: 0 },
      dropTarget: null
    });
    
    return result;
  }, [dragState]);

  const cancelDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedItem: null,
      dragOffset: { x: 0, y: 0 },
      dropTarget: null
    });
  }, []);

  return {
    dragState,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag
  };
};
