export interface PanelLayout {
  id: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  visible: boolean;
  minimized: boolean;
  zIndex: number;
  resizable: boolean;
  draggable: boolean;
  closable: boolean;
  minimizable: boolean;
  defaultSize: { width: number; height: number };
  defaultPosition: { x: number; y: number };
}

export interface RF4SConfig {
  script: ScriptSettings;
  profiles: FishingProfiles;
  equipment: EquipmentSetup;
  detection: DetectionSettings;
  automation: AutomationSettings;
  system: SystemSettings;
}

export interface ScriptSettings {
  enabled: boolean;
  mode: 'auto' | 'manual' | 'assistance';
  sensitivity: number;
  delay: number;
}

export interface FishingProfiles {
  active: string;
  profiles: {
    [key: string]: {
      name: string;
      technique: 'spin' | 'float' | 'bottom' | 'pirk' | 'telescopic';
      enabled: boolean;
      autoSwitch: boolean;
      settings: any;
    };
  };
}

export interface EquipmentSetup {
  mainRod: string;
  spodRod: string;
  rodType: string;
  reelDrag: number;
  lineTest: number;
  hookSize: number;
  leaderLength: number;
  sinkerWeight: number;
  floatSize: number;
}

export interface DetectionSettings {
  spoolConfidence: number;
  fishBite: number;
  rodTip: number;
  ocrConfidence: number;
  snagDetection: boolean;
  imageVerification: boolean;
}

export interface AutomationSettings {
  bottomEnabled: boolean;
  bottomWaitTime: number;
  bottomHookDelay: number;
  spinEnabled: boolean;
  spinRetrieveSpeed: number;
  spinTwitchFrequency: number;
  pirkEnabled: boolean;
  castDelayMin: number;
  castDelayMax: number;
}

export interface SystemSettings {
  cpuUsage: number;
  memoryUsage: number;
  fps: number;
  sessionTime: string;
  fishCaught: number;
  successRate: number;
}
