import { useState, useCallback } from 'react';

/**
 * Custom hook for drag-and-drop reordering of items
 * Provides consistent drag handlers across all tabs
 * 
 * @example
 * const { draggedIndex, handleDragStart, handleDragOver, handleDragEnd } = useDragReorder(items, setItems);
 * 
 * <div
 *   draggable
 *   onDragStart={() => handleDragStart(index)}
 *   onDragOver={(e) => handleDragOver(e, index)}
 *   onDragEnd={handleDragEnd}
 *   className={draggedIndex === index ? 'opacity-50' : ''}
 * >
 */
export function useDragReorder<T>(items: T[], onChange: (items: T[]) => void) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    
    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    
    // Remove from old position
    newItems.splice(draggedIndex, 1);
    
    // Insert at new position
    newItems.splice(targetIndex, 0, draggedItem);
    
    onChange(newItems);
    setDraggedIndex(targetIndex);
  }, [draggedIndex, items, onChange]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  return {
    draggedIndex,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    isDragging: draggedIndex !== null,
  };
}
