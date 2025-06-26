
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PanelLayout, RF4SConfig } from '../types/rf4s';
import { rf4sService } from '../rf4s/services/rf4sService';

interface RF4SStore {
  // Panel Management
  panels: PanelLayout[];
  updatePanelPosition: (id: string, position: { x: number; y: number }) => void;
  updatePanelSize: (id: string, size: { width: number; height: number }) => void;
  togglePanelVisibility: (id: string) => void;
  togglePanelMinimized: (id: string) => void;
  resetPanelLayout: () => void;
  
  // Configuration - now integrated with RF4S service
  config: RF4SConfig;
  updateConfig: (section: keyof RF4SConfig, data: any) => void;
  
  // System State
  connected: boolean;
  gameDetectionActive: boolean;
  setConnectionStatus: (status: boolean) => void;
  setGameDetection: (active: boolean) => void;
  
  // Session Management
  sessionRunning: boolean;
  sessionStats: Record<string, string | number>;
  startSession: () => void;
  stopSession: () => void;
  
  // RF4S Integration
  initializeRF4S: () => void;
}

const defaultPanels: PanelLayout[] = [
  {
    id: 'script-control',
    title: 'Script Control',
    position: { x: 20, y: 80 },
    size: { width: 320, height: 400 },
    visible: true,
    minimized: false,
    zIndex: 1,
    resizable: true,
    draggable: true,
  },
  {
    id: 'fishing-profiles',
    title: 'Fishing Profiles',
    position: { x: 360, y: 80 },
    size: { width: 320, height: 400 },
    visible: true,
    minimized: false,
    zIndex: 1,
    resizable: true,
    draggable: true,
  },
  {
    id: 'detection-settings',
    title: 'Detection Settings',
    position: { x: 700, y: 80 },
    size: { width: 320, height: 400 },
    visible: true,
    minimized: false,
    zIndex: 1,
    resizable: true,
    draggable: true,
  },
  {
    id: 'system-monitor',
    title: 'System Monitor',
    position: { x: 20, y: 500 },
    size: { width: 320, height: 300 },
    visible: true,
    minimized: false,
    zIndex: 1,
    resizable: true,
    draggable: true,
  },
  {
    id: 'equipment-setup',
    title: 'Equipment Setup',
    position: { x: 360, y: 500 },
    size: { width: 320, height: 300 },
    visible: true,
    minimized: false,
    zIndex: 1,
    resizable: true,
    draggable: true,
  },
  {
    id: 'automation-settings',
    title: 'Automation',
    position: { x: 700, y: 500 },
    size: { width: 320, height: 300 },
    visible: true,
    minimized: false,
    zIndex: 1,
    resizable: true,
    draggable: true,
  },
];

const defaultConfig: RF4SConfig = {
  script: {
    enabled: false,
    mode: 'auto',
    sensitivity: 0.8,
    delay: 1.0,
  },
  profiles: {
    active: 'bottom',
    profiles: {
      bottom: {
        name: 'Bottom Fishing',
        technique: 'bottom',
        enabled: true,
        autoSwitch: false,
        settings: {},
      },
      spin: {
        name: 'Spin Fishing',
        technique: 'spin',
        enabled: true,
        autoSwitch: false,
        settings: {},
      },
    },
  },
  equipment: {
    mainRod: 'Telescopic',
    spodRod: 'Rod Slot 2',
    rodType: 'Telescopic',
    reelDrag: 15,
    lineTest: 10,
    hookSize: 8,
    leaderLength: 30,
    sinkerWeight: 20,
    floatSize: 2,
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
    pirkEnabled: false,
    castDelayMin: 2.0,
    castDelayMax: 5.0,
  },
  system: {
    cpuUsage: 45,
    memoryUsage: 238,
    fps: 60,
    sessionTime: '00:00:00',
    fishCaught: 0,
    successRate: 0,
  },
};

export const useRF4SStore = create<RF4SStore>()(
  persist(
    (set, get) => ({
      panels: defaultPanels,
      config: defaultConfig,
      connected: false,
      gameDetectionActive: false,
      sessionRunning: false,
      sessionStats: {},

      updatePanelPosition: (id, position) =>
        set((state) => ({
          panels: state.panels.map((panel) =>
            panel.id === id ? { ...panel, position } : panel
          ),
        })),

      updatePanelSize: (id, size) =>
        set((state) => ({
          panels: state.panels.map((panel) =>
            panel.id === id ? { ...panel, size } : panel
          ),
        })),

      togglePanelVisibility: (id) =>
        set((state) => ({
          panels: state.panels.map((panel) =>
            panel.id === id ? { ...panel, visible: !panel.visible } : panel
          ),
        })),

      togglePanelMinimized: (id) =>
        set((state) => ({
          panels: state.panels.map((panel) =>
            panel.id === id ? { ...panel, minimized: !panel.minimized } : panel
          ),
        })),

      resetPanelLayout: () =>
        set(() => ({
          panels: defaultPanels,
        })),

      updateConfig: (section, data) => {
        // Update RF4S service configuration
        rf4sService.updateConfig(section as any, data);
        
        set((state) => ({
          config: {
            ...state.config,
            [section]: { ...state.config[section], ...data },
          },
        }));
      },

      setConnectionStatus: (status) => set({ connected: status }),
      setGameDetection: (active) => set({ gameDetectionActive: active }),

      startSession: () => {
        rf4sService.startSession();
        set({ sessionRunning: true });
      },

      stopSession: () => {
        rf4sService.stopSession();
        set({ sessionRunning: false });
      },

      initializeRF4S: () => {
        // Set up RF4S service callbacks
        rf4sService.onSessionUpdate((data) => {
          set({
            sessionRunning: data.isRunning,
            sessionStats: data.stats,
            config: {
              ...get().config,
              system: {
                ...get().config.system,
                sessionTime: data.timer.runningTime,
                fishCaught: data.results.total,
                successRate: data.results.total > 0 ? Math.round((data.results.kept / data.results.total) * 100) : 0,
              },
            },
          });
        });

        // Initialize with current RF4S config
        const rf4sConfig = rf4sService.getConfig();
        set((state) => ({
          config: {
            ...state.config,
            detection: {
              spoolConfidence: rf4sConfig.detection.spoolConfidence,
              fishBite: rf4sConfig.detection.fishBite,
              rodTip: rf4sConfig.detection.rodTip,
              ocrConfidence: rf4sConfig.detection.ocrConfidence,
              snagDetection: rf4sConfig.detection.snagDetection,
              imageVerification: rf4sConfig.detection.imageVerification,
            },
            automation: {
              bottomEnabled: rf4sConfig.automation.bottomEnabled,
              bottomWaitTime: rf4sConfig.automation.bottomWaitTime,
              bottomHookDelay: rf4sConfig.automation.bottomHookDelay,
              spinEnabled: rf4sConfig.automation.spinEnabled,
              spinRetrieveSpeed: rf4sConfig.automation.spinRetrieveSpeed,
              spinTwitchFrequency: rf4sConfig.automation.spinTwitchFrequency,
              pirkEnabled: rf4sConfig.automation.pirkEnabled,
              castDelayMin: rf4sConfig.automation.castDelayMin,
              castDelayMax: rf4sConfig.automation.castDelayMax,
            },
          },
        }));
      },
    }),
    {
      name: 'rf4s-storage',
    }
  )
);
