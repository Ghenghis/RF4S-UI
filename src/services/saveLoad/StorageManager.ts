
import { SaveSlot } from './types';

export class StorageManager {
  private readonly storageKey: string;

  constructor(storageKey: string = 'rf4s-saves') {
    this.storageKey = storageKey;
  }

  saveToStorage(saveSlots: Map<string, SaveSlot>): boolean {
    try {
      const saveData = Array.from(saveSlots.entries());
      localStorage.setItem(this.storageKey, JSON.stringify(saveData));
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }

  loadFromStorage(): Map<string, SaveSlot> {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const saveData = JSON.parse(saved) as [string, SaveSlot][];
        return new Map(saveData);
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    return new Map();
  }

  clearStorage(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
}
