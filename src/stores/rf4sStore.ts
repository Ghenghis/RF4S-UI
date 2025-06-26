import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PanelLayout } from '../types/rf4s';
import { RF4SYamlConfig } from '../types/config';

export interface ScriptSettings {
  enabled: boolean;
  mode: 'auto' | 'manual' | 'assistance';
  sensitivity: number;
  delay: number;
  randomCast: boolean;
  randomCastProbability: number;
  screenshotTags: string[];
  alarmSound: string;
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
  floatEnabled: boolean;
  floatSensitivity: number;
  floatCheckDelay: number;
  floatPullDelay: number;
  floatDriftTimeout: number;
  pirkEnabled: boolean;
  pirkDuration: number;
  pirkDelay: number;
  pirkSinkTimeout: number;
  castDelayMin: number;
  castDelayMax: number;
  randomCastProbability: number;
}

export interface SystemSettings {
  cpuUsage: number;
  memoryUsage: number;
  fps: number;
  sessionTime: string;
  fishCaught: number;
  successRate: number;
}

export interface RF4SConfig {
  script: ScriptSettings;
  profiles: FishingProfiles;
  equipment: EquipmentSetup;
  detection: DetectionSettings;
  automation: AutomationSettings;
  system: SystemSettings;
}

interface RF4SState {
  panels: PanelLayout[];
  config: RF4SConfig;
  addPanel: (panel: PanelLayout) => void;
  updatePanel: (id: string, updates: Partial<PanelLayout>) => void;
  removePanel: (id: string) => void;
  setConfig: (config: RF4SConfig) => void;
  updateConfig: <T extends keyof RF4SConfig>(key: T, value: Partial<RF4SConfig[T]>) => void;
}

const defaultConfig: RF4SConfig = {
  script: {
    enabled: false,
    mode: 'auto',
    sensitivity: 0.8,
    delay: 1.0,
    randomCast: false,
    randomCastProbability: 0.1,
    screenshotTags: ['green', 'yellow', 'blue', 'purple', 'pink'],
    alarmSound: './static/sound/bell_1.wav',
  },
  profiles: {
    active: 'default',
    profiles: {
      default: {
        name: 'Default Profile',
        technique: 'spin',
        enabled: true,
        autoSwitch: false,
        settings: {},
      },
    },
  },
  equipment: {
    mainRod: 'Generic Rod',
    spodRod: 'Generic Spod Rod',
    rodType: 'Spinning',
    reelDrag: 5.0,
    lineTest: 10.0,
    hookSize: 6,
    leaderLength: 100,
    sinkerWeight: 20,
    floatSize: 15,
  },
  detection: {
    spoolConfidence: 0.98,
    fishBite: 0.85,
    rodTip: 0.7,
    ocrConfidence: 0.8,
    snagDetection: true,
    imageVerification: true,
  },
  automation: {
    bottomEnabled: true,
    bottomWaitTime: 300,
    bottomHookDelay: 0.5,
    spinEnabled: false,
    spinRetrieveSpeed: 50,
    spinTwitchFrequency: 3.0,
    floatEnabled: false,
    floatSensitivity: 0.68,
    floatCheckDelay: 1.0,
    floatPullDelay: 0.5,
    floatDriftTimeout: 16.0,
    pirkEnabled: false,
    pirkDuration: 0.5,
    pirkDelay: 2.0,
    pirkSinkTimeout: 60.0,
    castDelayMin: 2.0,
    castDelayMax: 5.0,
    randomCastProbability: 0.25,
  },
  system: {
    cpuUsage: 0,
    memoryUsage: 0,
    fps: 0,
    sessionTime: '00:00:00',
    fishCaught: 0,
    successRate: 0,
  },
};

export const useRF4SStore = create<RF4SState>()(
  persist(
    (set, get) => ({
      panels: [],
      config: defaultConfig,
      addPanel: (panel) => set((state) => ({ panels: [...state.panels, panel] })),
      updatePanel: (id, updates) =>
        set((state) => ({
          panels: state.panels.map((panel) =>
            panel.id === id ? { ...panel, ...updates } : panel
          ),
        })),
      removePanel: (id) =>
        set((state) => ({ panels: state.panels.filter((panel) => panel.id !== id) })),
      setConfig: (config) => set({ config }),
      updateConfig: (key, value) =>
        set((state) => ({
          config: {
            ...state.config,
            [key]: { ...state.config[key], ...value },
          },
        })),
    }),
    {
      name: 'rf4s-storage',
    }
  )
);
