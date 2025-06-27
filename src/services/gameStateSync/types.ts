
export interface GameState {
  isGameRunning: boolean;
  windowActive: boolean;
  gameVersion: string | null;
  resolution: { width: number; height: number };
  currentLocation: string;
  currentTechnique: string;
  rodInWater: boolean;
  fishOnHook: boolean;
  inventoryState: {
    bait: number;
    lures: string[];
    equipment: string[];
  };
  playerStats: {
    level: number;
    experience: number;
    money: number;
  };
  environmentalConditions: {
    weather: string;
    timeOfDay: string;
    waterTemperature: number;
    visibility: number;
  };
}

export interface SyncMetrics {
  lastSyncTime: Date;
  syncFrequency: number;
  missedSyncs: number;
  latency: number;
}
