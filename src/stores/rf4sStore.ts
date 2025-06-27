
import { create } from 'zustand';
import { RF4SConfig } from './types';
import { PanelLayout } from '../types/rf4s';
import { defaultConfig } from './defaultConfig';
import { createPanelActions, PanelActions } from './panelActions';

export interface FishingProfile {
  id: string;
  name: string;
  technique: string;
  rodType: string;
  baitType: string;
  location: string;
  active: boolean;
  successRate: number;
  settings: {
    castDistance: number;
    retrieveSpeed: number;
    sensitivity: number;
  };
}

interface RF4SStore {
  // Config state
  config: RF4SConfig;
  updateConfig: (section: keyof RF4SConfig, updates: Partial<any>) => void;
  
  // Connection state
  connected: boolean;
  setConnected: (connected: boolean) => void;
  setConnectionStatus: (connected: boolean) => void; // Alias for compatibility
  
  // Game detection state
  gameDetectionActive: boolean;
  setGameDetectionActive: (active: boolean) => void;
  setGameDetection: (active: boolean) => void; // Alias for compatibility
  
  // Script state
  scriptRunning: boolean;
  setScriptRunning: (running: boolean) => void;
  
  // Fishing profiles state
  fishingProfiles: FishingProfile[];
  activeFishingProfile: string | null;
  setActiveFishingProfile: (profileId: string) => void;
  updateFishingProfile: (profileId: string, updates: Partial<FishingProfile>) => void;
  
  // Initialization
  initializeRF4S: () => void;
  
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
    setConnectionStatus: (connected) => set({ connected }), // Alias
    
    // Game detection state
    gameDetectionActive: false,
    setGameDetectionActive: (gameDetectionActive) => set({ gameDetectionActive }),
    setGameDetection: (gameDetectionActive) => set({ gameDetectionActive }), // Alias
    
    // Script state
    scriptRunning: false,
    setScriptRunning: (scriptRunning) => {
      set({ scriptRunning });
      // Update config to match script state
      const { updateConfig } = get();
      updateConfig('script', { enabled: scriptRunning });
    },
    
    // Fishing profiles state
    fishingProfiles: [
      {
        id: 'float-fishing',
        name: 'Float Fishing',
        technique: 'Float',
        rodType: 'Match Rod',
        baitType: 'Worms',
        location: 'Belaya River',
        active: true,
        successRate: 85,
        settings: {
          castDistance: 25,
          retrieveSpeed: 3,
          sensitivity: 0.7
        }
      },
      {
        id: 'bottom-fishing',
        name: 'Bottom Fishing',
        technique: 'Bottom',
        rodType: 'Feeder Rod',
        baitType: 'Pellets',
        location: 'Volkhov River',
        active: false,
        successRate: 72,
        settings: {
          castDistance: 45,
          retrieveSpeed: 1,
          sensitivity: 0.9
        }
      },
      {
        id: 'spinning',
        name: 'Spinning',
        technique: 'Spinning',
        rodType: 'Spinning Rod',
        baitType: 'Lures',
        location: 'Ladoga Lake',
        active: false,
        successRate: 68,
        settings: {
          castDistance: 35,
          retrieveSpeed: 5,
          sensitivity: 0.6
        }
      }
    ],
    activeFishingProfile: 'float-fishing',
    setActiveFishingProfile: (profileId) => {
      set((state) => ({
        activeFishingProfile: profileId,
        fishingProfiles: state.fishingProfiles.map(profile => ({
          ...profile,
          active: profile.id === profileId
        }))
      }));
    },
    updateFishingProfile: (profileId, updates) => {
      set((state) => ({
        fishingProfiles: state.fishingProfiles.map(profile =>
          profile.id === profileId ? { ...profile, ...updates } : profile
        )
      }));
    },
    
    // Initialization
    initializeRF4S: () => {
      console.log('RF4S initialized');
      // Initialize with default panels for better UX
      const defaultPanels: PanelLayout[] = [
        {
          id: 'script-control',
          title: 'Script Control',
          position: { x: 100, y: 100 },
          size: { width: 300, height: 200 },
          visible: false,
          minimized: false,
          zIndex: 1,
          resizable: true,
          draggable: true,
        }
      ];
      set({ panels: defaultPanels });
    },
    
    // Panel state
    panels: [],
    
    // Panel actions
    ...panelActions,
  };
});
