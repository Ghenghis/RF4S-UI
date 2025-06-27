
import { SaveSlot, SaveLoadConfig } from './types';
import { StorageManager } from './StorageManager';
import { EventManager } from '../../core/EventManager';

export class SaveSlotManager {
  private saveSlots: Map<string, SaveSlot> = new Map();
  private storageManager: StorageManager;
  private config: SaveLoadConfig;

  constructor(config: SaveLoadConfig, storageManager: StorageManager) {
    this.config = config;
    this.storageManager = storageManager;
    this.loadSlots();
  }

  private loadSlots(): void {
    this.saveSlots = this.storageManager.loadFromStorage();
  }

  addSaveSlot(saveSlot: SaveSlot): boolean {
    this.saveSlots.set(saveSlot.id, saveSlot);
    this.enforceSlotLimit();
    
    const success = this.storageManager.saveToStorage(this.saveSlots);
    if (success) {
      EventManager.emit('session.saved', { 
        slotId: saveSlot.id, 
        slotName: saveSlot.name 
      }, 'SaveLoadService');
    }
    return success;
  }

  getSaveSlot(slotId: string): SaveSlot | undefined {
    return this.saveSlots.get(slotId);
  }

  getAllSaveSlots(): SaveSlot[] {
    return Array.from(this.saveSlots.values())
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  }

  deleteSaveSlot(slotId: string): boolean {
    if (this.saveSlots.delete(slotId)) {
      this.storageManager.saveToStorage(this.saveSlots);
      EventManager.emit('session.save_deleted', { slotId }, 'SaveLoadService');
      return true;
    }
    return false;
  }

  private enforceSlotLimit(): void {
    const slots = this.getAllSaveSlots();
    if (slots.length > this.config.maxSaveSlots) {
      const slotsToRemove = slots.slice(this.config.maxSaveSlots);
      slotsToRemove.forEach(slot => {
        this.saveSlots.delete(slot.id);
      });
    }
  }

  clear(): void {
    this.saveSlots.clear();
    this.storageManager.clearStorage();
  }
}
