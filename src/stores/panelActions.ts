
import { PanelLayout } from '../types/rf4s';

export interface PanelActions {
  addPanel: (panel: PanelLayout) => void;
  updatePanel: (id: string, updates: Partial<PanelLayout>) => void;
  removePanel: (id: string) => void;
  togglePanelVisibility: (id: string) => void;
  updatePanelPosition: (id: string, position: { x: number; y: number }) => void;
  togglePanelMinimized: (id: string) => void;
}

export const createPanelActions = (
  set: any,
  get: any
): PanelActions => ({
  addPanel: (panel) => set((state: any) => ({ panels: [...state.panels, panel] })),
  
  updatePanel: (id, updates) =>
    set((state: any) => ({
      panels: state.panels.map((panel: PanelLayout) =>
        panel.id === id ? { ...panel, ...updates } : panel
      ),
    })),
  
  removePanel: (id) =>
    set((state: any) => ({ panels: state.panels.filter((panel: PanelLayout) => panel.id !== id) })),
  
  togglePanelVisibility: (id) =>
    set((state: any) => {
      const existingPanel = state.panels.find((panel: PanelLayout) => panel.id === id);
      if (existingPanel) {
        return {
          panels: state.panels.map((panel: PanelLayout) =>
            panel.id === id ? { ...panel, visible: !panel.visible } : panel
          )
        };
      } else {
        const newPanel: PanelLayout = {
          id,
          title: id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
          visible: true,
          minimized: false,
          zIndex: 1,
          resizable: true,
          draggable: true,
        };
        return { panels: [...state.panels, newPanel] };
      }
    }),
  
  updatePanelPosition: (id, position) =>
    set((state: any) => ({
      panels: state.panels.map((panel: PanelLayout) =>
        panel.id === id ? { ...panel, position } : panel
      ),
    })),
  
  togglePanelMinimized: (id) =>
    set((state: any) => ({
      panels: state.panels.map((panel: PanelLayout) =>
        panel.id === id ? { ...panel, minimized: !panel.minimized } : panel
      ),
    })),
});
