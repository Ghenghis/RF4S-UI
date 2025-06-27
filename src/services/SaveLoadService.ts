
import { EventManager } from '../core/EventManager';
import { rf4sService } from '../rf4s/services/rf4sService';
import { useRF4SStore } from '../stores/rf4sStore';
import { SaveData, SaveSlot, SaveLoadConfig } from './saveLoad/types';
import { StorageManager } from './saveLoad/StorageManager';
import { DataSerializer } from './saveLoad/DataSerializer';
import { SaveSlotManager } from './saveLoad/SaveSlotManager';
import { AutoSaveManager } from './saveLoad/AutoSaveManager';

class SaveLoadServiceImpl {
  private config: SaveLoadConfig;
  private storageManager: StorageManager;
  private saveSlotManager: SaveSlotManager;
  private autoSaveManager: AutoSaveManager;

  constructor() {
    this.config = {
      maxSaveSlots: 10,
      autoSaveInterval: 300000, // 5 minutes
      storageKey: 'rf4s-saves'
    };

    this.storageManager = new StorageManager(this.config.storageKey);
    this.saveSlotManager = new SaveSlotManager(this.config, this.storageManager);
    this.autoSaveManager = new AutoSaveManager(
      this.config.autoSaveInterval,
      () => this.saveSession('auto-save')
    );
  }

  initialize(): void {
    console.log('Save/Load Service initialized');
    this.autoSaveManager.start();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    EventManager.subscribe('session.save_requested', (data: any) => {
      this.saveSession(data.slotName || 'auto-save');
    });

    EventManager.subscribe('session.load_requested', (data: any) => {
      this.loadSession(data.slotId);
    });
  }

  async saveSession(slotName: string = 'manual-save'): Promise<boolean> {
    try {
      const { config, fishingProfiles } = useRF4SStore.getState();
      const rf4sStatus = rf4sService.getSessionStats();

      const sessionData = {
        config,
        profiles: fishingProfiles,
        statistics: rf4sStatus,
        achievements: [] // Will be populated by AchievementService
      };

      const gameState = {
        currentSession: rf4sService.getSessionResults(),
        lastSavePoint: new Date()
      };

      const saveData = DataSerializer.createSaveData(sessionData, gameState);
      const saveSlot = DataSerializer.createSaveSlot(slotName, saveData);

      return this.saveSlotManager.addSaveSlot(saveSlot);
    } catch (error) {
      console.error('Failed to save session:', error);
      EventManager.emit('session.save_failed', { error }, 'SaveLoadService');
      return false;
    }
  }

  async loadSession(slotId: string): Promise<boolean> {
    try {
      const saveSlot = this.saveSlotManager.getSaveSlot(slotId);
      if (!saveSlot) {
        throw new Error(`Save slot not found: ${slotId}`);
      }

      const { updateConfig } = useRF4SStore.getState();
      const saveData = saveSlot.data;

      // Restore configuration
      Object.keys(saveData.sessionData.config).forEach(section => {
        updateConfig(section as any, saveData.sessionData.config[section]);
      });

      // Restore RF4S service state
      rf4sService.importConfig(JSON.stringify(saveData.sessionData.config));

      EventManager.emit('session.loaded', { 
        slotId, 
        data: saveData 
      }, 'SaveLoadService');
      
      console.log(`Session loaded from slot: ${saveSlot.name}`);
      return true;
    } catch (error) {
      console.error('Failed to load session:', error);
      EventManager.emit('session.load_failed', { slotId, error }, 'SaveLoadService');
      return false;
    }
  }

  getSaveSlots(): SaveSlot[] {
    return this.saveSlotManager.getAllSaveSlots();
  }

  deleteSaveSlot(slotId: string): boolean {
    return this.saveSlotManager.deleteSaveSlot(slotId);
  }

  exportSave(slotId: string): string | null {
    const saveSlot = this.saveSlotManager.getSaveSlot(slotId);
    return saveSlot ? DataSerializer.exportSaveSlot(saveSlot) : null;
  }

  importSave(saveDataJson: string, slotName: string): boolean {
    const saveSlot = DataSerializer.importSaveData(saveDataJson, slotName);
    return saveSlot ? this.saveSlotManager.addSaveSlot(saveSlot) : false;
  }

  cleanup(): void {
    this.autoSaveManager.stop();
    this.saveSlotManager.clear();
  }
}

export const SaveLoadService = new SaveLoadServiceImpl();
