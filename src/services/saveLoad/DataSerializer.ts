
import { SaveData, SaveSlot } from './types';

export class DataSerializer {
  static createSaveData(sessionData: any, gameState: any): SaveData {
    return {
      version: '1.0.0',
      timestamp: new Date(),
      sessionData,
      gameState: {
        ...gameState,
        lastSavePoint: new Date()
      }
    };
  }

  static createSaveSlot(slotName: string, saveData: SaveData): SaveSlot {
    const slotId = `save-${Date.now()}`;
    return {
      id: slotId,
      name: slotName,
      data: saveData,
      createdAt: new Date(),
      lastModified: new Date()
    };
  }

  static exportSaveSlot(saveSlot: SaveSlot): string {
    return JSON.stringify(saveSlot.data, null, 2);
  }

  static importSaveData(saveDataJson: string, slotName: string): SaveSlot | null {
    try {
      const saveData = JSON.parse(saveDataJson) as SaveData;
      const slotId = `import-${Date.now()}`;
      
      return {
        id: slotId,
        name: slotName,
        data: saveData,
        createdAt: new Date(),
        lastModified: new Date()
      };
    } catch (error) {
      console.error('Failed to parse import data:', error);
      return null;
    }
  }
}
