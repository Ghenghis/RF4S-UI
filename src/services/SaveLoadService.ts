
import { EventManager } from '../core/EventManager';
import { rf4sService } from '../rf4s/services/rf4sService';
import { useRF4SStore } from '../stores/rf4sStore';

interface SaveData {
  version: string;
  timestamp: Date;
  sessionData: {
    config: any;
    profiles: any[];
    statistics: any;
    achievements: any[];
  };
  gameState: {
    currentSession: any;
    lastSavePoint: Date;
  };
}

interface SaveSlot {
  id: string;
  name: string;
  data: SaveData;
  createdAt: Date;
  lastModified: Date;
}

class SaveLoadServiceImpl {
  private saveSlots: Map<string, SaveSlot> = new Map();
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private readonly MAX_SAVE_SLOTS = 10;
  private readonly AUTO_SAVE_INTERVAL = 300000; // 5 minutes

  initialize(): void {
    console.log('Save/Load Service initialized');
    this.loadFromStorage();
    this.startAutoSave();
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

      const saveData: SaveData = {
        version: '1.0.0',
        timestamp: new Date(),
        sessionData: {
          config,
          profiles: fishingProfiles,
          statistics: rf4sStatus,
          achievements: [] // Will be populated by AchievementService
        },
        gameState: {
          currentSession: rf4sService.getSessionResults(),
          lastSavePoint: new Date()
        }
      };

      const slotId = `save-${Date.now()}`;
      const saveSlot: SaveSlot = {
        id: slotId,
        name: slotName,
        data: saveData,
        createdAt: new Date(),
        lastModified: new Date()
      };

      this.saveSlots.set(slotId, saveSlot);
      this.saveToStorage();

      EventManager.emit('session.saved', { slotId, slotName }, 'SaveLoadService');
      console.log(`Session saved to slot: ${slotName}`);
      return true;
    } catch (error) {
      console.error('Failed to save session:', error);
      EventManager.emit('session.save_failed', { error }, 'SaveLoadService');
      return false;
    }
  }

  async loadSession(slotId: string): Promise<boolean> {
    try {
      const saveSlot = this.saveSlots.get(slotId);
      if (!saveSlot) {
        throw new Error(`Save slot not found: ${slotId}`);
      }

      const { updateConfig, fishingProfiles } = useRF4SStore.getState();
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
    return Array.from(this.saveSlots.values())
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  }

  deleteSaveSlot(slotId: string): boolean {
    if (this.saveSlots.delete(slotId)) {
      this.saveToStorage();
      EventManager.emit('session.save_deleted', { slotId }, 'SaveLoadService');
      return true;
    }
    return false;
  }

  exportSave(slotId: string): string | null {
    const saveSlot = this.saveSlots.get(slotId);
    return saveSlot ? JSON.stringify(saveSlot.data, null, 2) : null;
  }

  importSave(saveDataJson: string, slotName: string): boolean {
    try {
      const saveData = JSON.parse(saveDataJson) as SaveData;
      const slotId = `import-${Date.now()}`;
      
      const saveSlot: SaveSlot = {
        id: slotId,
        name: slotName,
        data: saveData,
        createdAt: new Date(),
        lastModified: new Date()
      };

      this.saveSlots.set(slotId, saveSlot);
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error('Failed to import save:', error);
      return false;
    }
  }

  private startAutoSave(): void {
    this.autoSaveInterval = setInterval(() => {
      this.saveSession('auto-save');
    }, this.AUTO_SAVE_INTERVAL);
  }

  private stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  private saveToStorage(): void {
    try {
      const saveData = Array.from(this.saveSlots.entries());
      localStorage.setItem('rf4s-saves', JSON.stringify(saveData));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('rf4s-saves');
      if (saved) {
        const saveData = JSON.parse(saved) as [string, SaveSlot][];
        this.saveSlots = new Map(saveData);
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  }

  cleanup(): void {
    this.stopAutoSave();
    this.saveSlots.clear();
  }
}

export const SaveLoadService = new SaveLoadServiceImpl();
