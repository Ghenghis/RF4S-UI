
import { create } from 'zustand';
import { RF4SConfig } from './types';
import { PanelLayout } from '../types/rf4s';
import { defaultConfig } from './defaultConfig';

interface RF4SStore {
  // Config state
  config: RF4SConfig;
  updateConfig: (section: keyof RF4SConfig, updates: Partial<any>) => void;
  
  // Connection state
  connected: boolean;
  setConnected: (connected: boolean) => void;
  setConnectionStatus: (connected: boolean) => void;
  
  // Game detection state
  gameDetectionActive: boolean;
  setGameDetectionActive: (active: boolean) => void;
  setGameDetection: (active: boolean) => void;
  
  // Panel state
  panels: PanelLayout[];
  
  // Panel actions
  addPanel: (panel: PanelLayout) => void;
  updatePanel: (id: string, updates: Partial<PanelLayout>) => void;
  removePanel: (id: string) => void;
  togglePanelVisibility: (id: string) => void;
  updatePanelPosition: (id: string, position: { x: number; y: number }) => void;
  togglePanelMinimized: (id: string) => void;
  
  // Session state
  sessionStats: {
    fishCaught: number;
    sessionTime: number;
    isRunning: boolean;
    lastError: string | null;
  };
  updateSessionStats: (stats: Partial<typeof defaultSessionStats>) => void;
  
  // Initialization
  initializeRF4S: () => void;
}

const defaultSessionStats = {
  fishCaught: 0,
  sessionTime: 0,
  isRunning: false,
  lastError: null
};

export const useRF4SStore = create<RF4SStore>((set, get) => ({
  // Config state
  config: defaultConfig,
  updateConfig: (section, updates) =>
    set((state) => ({
      config: {
        ...state.config,
        [section]: {
          ...state.config[section],
          ...updates,
        },
      },
    })),
  
  connected: false,
  setConnected: (connected) => set({ connected }),
  setConnectionStatus: (connected) => set({ connected }),
  
  gameDetectionActive: false,
  setGameDetectionActive: (gameDetectionActive) => set({ gameDetectionActive }),
  setGameDetection: (gameDetectionActive) => set({ gameDetectionActive }),
  
  // Panel state
  panels: [],
  
  // Panel actions
  addPanel: (panel) => set((state) => ({ 
    panels: [...state.panels, panel] 
  })),
  
  updatePanel: (id, updates) =>
    set((state) => ({
      panels: state.panels.map((panel) =>
        panel.id === id ? { ...panel, ...updates } : panel
      ),
    })),
  
  removePanel: (id) =>
    set((state) => ({ 
      panels: state.panels.filter((panel) => panel.id !== id) 
    })),
  
  togglePanelVisibility: (id) =>
    set((state) => {
      console.log(`Toggling panel visibility for: ${id}`);
      const existingPanel = state.panels.find((panel) => panel.id === id);
      
      if (existingPanel) {
        console.log(`Panel ${id} exists, toggling visibility from ${existingPanel.visible} to ${!existingPanel.visible}`);
        return {
          panels: state.panels.map((panel) =>
            panel.id === id ? { ...panel, visible: !panel.visible } : panel
          )
        };
      } else {
        console.log(`Panel ${id} does not exist, creating new panel`);
        const newPanel: PanelLayout = {
          id,
          title: id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
          size: { width: 400, height: 300 },
          visible: true,
          minimized: false,
          zIndex: Math.max(1, ...state.panels.map((p) => p.zIndex)) + 1,
          resizable: true,
          draggable: true,
        };
        return { 
          panels: [...state.panels, newPanel] 
        };
      }
    }),
  
  updatePanelPosition: (id, position) =>
    set((state) => ({
      panels: state.panels.map((panel) =>
        panel.id === id ? { ...panel, position } : panel
      ),
    })),
  
  togglePanelMinimized: (id) =>
    set((state) => ({
      panels: state.panels.map((panel) =>
        panel.id === id ? { ...panel, minimized: !panel.minimized } : panel
      ),
    })),
  
  // Session state
  sessionStats: defaultSessionStats,
  updateSessionStats: (stats) =>
    set((state) => ({
      sessionStats: { ...state.sessionStats, ...stats }
    })),
  
  // Initialization
  initializeRF4S: () => {
    console.log('RF4S initialized');
    // Don't initialize with default panels - let user add them
  },
}));
