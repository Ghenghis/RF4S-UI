import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FishingState } from '../core/StateMachine';

export interface SystemStatus {
  connected: boolean;
  gameDetected: boolean;
  cpuUsage: number;
  memoryUsage: number;
  fps: number;
  lastUpdate: number;
  runtime: number;
}

export interface SessionStats {
  startTime: number;
  runtime: number;
  fishCaught: number;
  castsTotal: number;
  castsSuccessful: number;
  successRate: number;
  lastFishTime?: number;
}

export interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  panelLayout: string;
  notifications: boolean;
  soundEnabled: boolean;
}

export interface GlobalState {
  // System Status
  systemStatus: SystemStatus;
  
  // Session Statistics
  sessionStats: SessionStats;
  
  // Current Fishing State
  fishingState: FishingState;
  
  // UI State
  uiState: UIState;
  
  // Error State
  lastError?: string;
  errorCount: number;
  
  // Actions
  updateSystemStatus: (status: Partial<SystemStatus>) => void;
  updateSessionStats: (stats: Partial<SessionStats>) => void;
  setFishingState: (state: FishingState) => void;
  updateUIState: (uiState: Partial<UIState>) => void;
  setError: (error: string) => void;
  clearError: () => void;
  resetSession: () => void;
  incrementFishCaught: () => void;
  incrementCastTotal: () => void;
  incrementCastSuccessful: () => void;
}

const initialSystemStatus: SystemStatus = {
  connected: false,
  gameDetected: false,
  cpuUsage: 0,
  memoryUsage: 0,
  fps: 0,
  lastUpdate: Date.now(),
  runtime: 0
};

const initialSessionStats: SessionStats = {
  startTime: Date.now(),
  runtime: 0,
  fishCaught: 0,
  castsTotal: 0,
  castsSuccessful: 0,
  successRate: 0
};

const initialUIState: UIState = {
  theme: 'system',
  sidebarCollapsed: false,
  panelLayout: 'default',
  notifications: true,
  soundEnabled: true
};

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set, get) => ({
      systemStatus: initialSystemStatus,
      sessionStats: initialSessionStats,
      fishingState: 'IDLE',
      uiState: initialUIState,
      errorCount: 0,

      updateSystemStatus: (status) =>
        set((state) => ({
          systemStatus: { ...state.systemStatus, ...status, lastUpdate: Date.now() }
        })),

      updateSessionStats: (stats) =>
        set((state) => {
          const newStats = { ...state.sessionStats, ...stats };
          const successRate = newStats.castsTotal > 0 
            ? (newStats.castsSuccessful / newStats.castsTotal) * 100 
            : 0;
          return {
            sessionStats: { ...newStats, successRate }
          };
        }),

      setFishingState: (fishingState) => set({ fishingState }),

      updateUIState: (uiState) =>
        set((state) => ({
          uiState: { ...state.uiState, ...uiState }
        })),

      setError: (error) =>
        set((state) => ({
          lastError: error,
          errorCount: state.errorCount + 1
        })),

      clearError: () => set({ lastError: undefined }),

      resetSession: () =>
        set({
          sessionStats: { ...initialSessionStats, startTime: Date.now() },
          fishingState: 'IDLE',
          errorCount: 0,
          lastError: undefined
        }),

      incrementFishCaught: () =>
        set((state) => {
          const newStats = {
            ...state.sessionStats,
            fishCaught: state.sessionStats.fishCaught + 1,
            lastFishTime: Date.now()
          };
          return { sessionStats: newStats };
        }),

      incrementCastTotal: () =>
        set((state) => {
          const newStats = {
            ...state.sessionStats,
            castsTotal: state.sessionStats.castsTotal + 1
          };
          const successRate = newStats.castsTotal > 0 
            ? (newStats.castsSuccessful / newStats.castsTotal) * 100 
            : 0;
          return { sessionStats: { ...newStats, successRate } };
        }),

      incrementCastSuccessful: () =>
        set((state) => {
          const newStats = {
            ...state.sessionStats,
            castsSuccessful: state.sessionStats.castsSuccessful + 1
          };
          const successRate = newStats.castsTotal > 0 
            ? (newStats.castsSuccessful / newStats.castsTotal) * 100 
            : 0;
          return { sessionStats: { ...newStats, successRate } };
        })
    }),
    {
      name: 'rf4s-global-store',
      partialize: (state) => ({
        uiState: state.uiState,
        sessionStats: state.sessionStats
      })
    }
  )
);
