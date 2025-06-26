
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

export interface PanelLifecycle {
  onMount(): Promise<void>;
  onUnmount(): Promise<void>;
  onResize(size: { width: number; height: number }): Promise<void>;
  onMove(position: { x: number; y: number }): Promise<void>;
  onShow(): Promise<void>;
  onHide(): Promise<void>;
}

export interface PanelCommunication {
  sendMessage(targetPanel: string, message: any): void;
  receiveMessage(message: any): void;
  broadcast(message: any): void;
}

export interface BasePanel extends PanelLifecycle, PanelCommunication {
  readonly configuration: PanelConfiguration;
  readonly state: PanelState;
  
  updateState(updates: Partial<PanelState>): void;
  validate(): boolean;
  serialize(): string;
  deserialize(data: string): void;
}

export interface PanelValidationRule {
  field: string;
  validator: (value: any) => boolean;
  message: string;
}

export interface PanelValidationResult {
  valid: boolean;
  errors: string[];
}
