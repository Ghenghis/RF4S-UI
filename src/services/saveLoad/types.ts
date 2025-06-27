
export interface SaveData {
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

export interface SaveSlot {
  id: string;
  name: string;
  data: SaveData;
  createdAt: Date;
  lastModified: Date;
}

export interface SaveLoadConfig {
  maxSaveSlots: number;
  autoSaveInterval: number;
  storageKey: string;
}
