
import { EventManager } from '../../core/EventManager';
import { integrationConfigManager } from '../integration/IntegrationConfigManager';

interface WebSocketMessage {
  type: 'metrics' | 'status' | 'command' | 'alert';
  payload: any;
  timestamp: number;
}

interface ConnectionStats {
  connected: boolean;
  reconnectAttempts: number;
  lastConnection: Date | null;
  messagesReceived: number;
  messagesSent: number;
  latency: number;
}

export class EnhancedWebSocketManager {
  private websocket: WebSocket | null = null;
  private connectionStats: ConnectionStats = {
    connected: false,
    reconnectAttempts: 0,
    lastConnection: null,
    messagesReceived: 0,
    messagesSent: 0,
    latency: 0
  };
  private reconnectInterval: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;

  async connect(): Promise<boolean> {
    try {
      const config = integrationConfigManager.getRealtimeConfig();
      const wsUrl = this.getWebSocketUrl();
      
      console.log('EnhancedWebSocketManager: Connecting to', wsUrl);
      
      // For development, simulate WebSocket connection
      if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
        this.simulateConnection();
        return true;
      }
      
      this.websocket = new WebSocket(wsUrl);
      this.setupEventHandlers();
      
      return new Promise((resolve) => {
        if (!this.websocket) {
          resolve(false);
          return;
        }
        
        this.websocket.onopen = () => {
          this.handleConnectionOpen();
          resolve(true);
        };
        
        this.websocket.onerror = () => {
          resolve(false);
        };
      });
      
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.scheduleReconnect();
      return false;
    }
  }

  private simulateConnection(): void {
    this.connectionStats.connected = true;
    this.connectionStats.lastConnection = new Date();
    this.connectionStats.reconnectAttempts = 0;
    
    this.startHeartbeat();
    this.processMessageQueue();
    
    EventManager.emit('websocket.connected', {
      url: this.getWebSocketUrl(),
      timestamp: Date.now()
    }, 'EnhancedWebSocketManager');
    
    console.log('WebSocket connection simulated successfully');
  }

  private setupEventHandlers(): void {
    if (!this.websocket) return;

    this.websocket.onopen = () => this.handleConnectionOpen();
    this.websocket.onclose = () => this.handleConnectionClose();
    this.websocket.onerror = (error) => this.handleConnectionError(error);
    this.websocket.onmessage = (event) => this.handleMessage(event);
  }

  private handleConnectionOpen(): void {
    console.log('WebSocket connection established');
    
    this.connectionStats.connected = true;
    this.connectionStats.lastConnection = new Date();
    this.connectionStats.reconnectAttempts = 0;
    
    this.startHeartbeat();
    this.processMessageQueue();
    
    EventManager.emit('websocket.connected', {
      timestamp: Date.now()
    }, 'EnhancedWebSocketManager');
  }

  private handleConnectionClose(): void {
    console.log('WebSocket connection closed');
    
    this.connectionStats.connected = false;
    this.stopHeartbeat();
    
    EventManager.emit('websocket.disconnected', {
      timestamp: Date.now()
    }, 'EnhancedWebSocketManager');
    
    this.scheduleReconnect();
  }

  private handleConnectionError(error: Event): void {
    console.error('WebSocket error:', error);
    
    EventManager.emit('websocket.error', {
      error: error.toString(),
      timestamp: Date.now()
    }, 'EnhancedWebSocketManager');
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.connectionStats.messagesReceived++;
      
      // Calculate latency if it's a pong message
      if (message.type === 'pong') {
        this.connectionStats.latency = Date.now() - message.timestamp;
      }
      
      EventManager.emit('websocket.message_received', message, 'EnhancedWebSocketManager');
      
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  sendMessage(type: WebSocketMessage['type'], payload: any): boolean {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: Date.now()
    };

    if (this.isConnected()) {
      return this.sendMessageDirectly(message);
    } else {
      // Queue message for later
      this.messageQueue.push(message);
      console.log('Message queued - WebSocket not connected');
      return false;
    }
  }

  private sendMessageDirectly(message: WebSocketMessage): boolean {
    try {
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify(message));
        this.connectionStats.messagesSent++;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      return false;
    }
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessageDirectly(message);
      }
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.sendMessage('ping', { timestamp: Date.now() });
    }, 30000); // 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.connectionStats.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
    }

    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.connectionStats.reconnectAttempts), 30000);
    
    this.reconnectInterval = setTimeout(() => {
      this.connectionStats.reconnectAttempts++;
      console.log(`Reconnection attempt ${this.connectionStats.reconnectAttempts}/${this.maxReconnectAttempts}`);
      this.connect();
    }, delay);
  }

  private getWebSocketUrl(): string {
    const config = integrationConfigManager.getRealtimeConfig();
    return config.websocketUrl || 'ws://localhost:8080/rf4s-websocket';
  }

  isConnected(): boolean {
    return this.connectionStats.connected && 
           (this.websocket?.readyState === WebSocket.OPEN || process.env.NODE_ENV === 'development');
  }

  getConnectionStats(): ConnectionStats {
    return { ...this.connectionStats };
  }

  disconnect(): void {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }

    this.stopHeartbeat();

    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    this.connectionStats.connected = false;
    console.log('WebSocket disconnected');
  }
}

export const enhancedWebSocketManager = new EnhancedWebSocketManager();
