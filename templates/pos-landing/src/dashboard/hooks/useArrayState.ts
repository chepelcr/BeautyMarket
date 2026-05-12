import { useState, useCallback } from 'react';

/**
 * Custom hook for managing array state with common CRUD operations
 * Eliminates repetitive add/update/remove/move logic across tabs
 * 
 * @example
 * const { items, add, update, remove, move, set } = useArrayState(initialItems);
 * add(newItem);
 * update(0, { name: 'Updated' });
 * remove(0);
 * move(0, 'down');
 */
export function useArrayState<T>(initialItems: T[] = []) {
  const [items, setItems] = useState<T[]>(initialItems);

  const add = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
  }, []);

  const update = useCallback((index: number, updates: Partial<T>) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], ...updates };
      return newItems;
    });
  }, []);

  const remove = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const move = useCallback((index: number, direction: 'up' | 'down') => {
    setItems(prev => {
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newItems = [...prev];
      [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
      return newItems;
    });
  }, []);

  const set = useCallback((newItems: T[]) => {
    setItems(newItems);
  }, []);

  const replace = useCallback((index: number, item: T) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = item;
      return newItems;
    });
  }, []);

  return {
    items,
    add,
    update,
    remove,
    move,
    set,
    replace,
  };
}
