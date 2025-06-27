
import { create } from 'zustand';
import { RF4SConfig, PanelLayout } from './types';
import { defaultConfig } from './defaultConfig';
import { createPanelActions, PanelActions } from './panelActions';

interface RF4SStore {
  // Config state
  config: RF4SConfig;
  updateConfig: (section: keyof RF4SConfig, updates: Partial<any>) => void;
  
  // Connection state
  connected: boolean;
  setConnected: (connected: boolean) => void;
  
  // Game detection state
  gameDetectionActive: boolean;
  setGameDetectionActive: (active: boolean) => void;
  
  // Panel state
  panels: PanelLayout[];
  
  // Panel actions (from panelActions.ts)
  addPanel: PanelActions['addPanel'];
  updatePanel: PanelActions['updatePanel'];
  removePanel: PanelActions['removePanel'];
  togglePanelVisibility: PanelActions['togglePanelVisibility'];
  updatePanelPosition: PanelActions['updatePanelPosition'];
  togglePanelMinimized: PanelActions['togglePanelMinimized'];
}

export const useRF4SStore = create<RF4SStore>((set, get) => {
  const panelActions = createPanelActions(set, get);
  
  return {
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
    
    // Connection state
    connected: false,
    setConnected: (connected) => set({ connected }),
    
    // Game detection state
    gameDetectionActive: false,
    setGameDetectionActive: (gameDetectionActive) => set({ gameDetectionActive }),
    
    // Panel state
    panels: [],
    
    // Panel actions
    ...panelActions,
  };
});
