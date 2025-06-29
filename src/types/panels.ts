
export interface PanelConfiguration {
  id: string;
  title: string;
  icon?: string;
  resizable: boolean;
  draggable: boolean;
  closable: boolean;
  minimizable: boolean;
  defaultSize: { width: number; height: number };
  defaultPosition: { x: number; y: number };
  zIndex: number;
}

export interface PanelState {
  visible: boolean;
  minimized: boolean;
  size: { width: number; height: number };
  position: { x: number; y: number };
  zIndex: number;
}

export interface PanelProps {
  id: string;
  title: string;
  visible: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  className?: string;
}

export interface WorkspaceLayout {
  currentLayout: 1 | 2 | 3;
  visiblePanelsCount: number;
  organizedGroups: string[][];
}

export interface WorkspaceStatus {
  connected: boolean;
  isConnecting: boolean;
  systemInitialized: boolean;
  initializationError?: string | null;
}
