
import { EventManager } from '../../core/EventManager';

export class WebSocketManager {
  private websocketConnection: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  establishConnection(): void {
    try {
      const wsUrl = this.getWebSocketUrl();
      console.log('Attempting WebSocket connection to:', wsUrl);
      
      // For now, simulate WebSocket connection
      this.simulateWebSocketConnection();
      
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  closeConnection(): void {
    if (this.websocketConnection) {
      this.websocketConnection.close();
      this.websocketConnection = null;
    }
  }

  sendData(data: any): void {
    if (this.websocketConnection && this.websocketConnection.readyState === WebSocket.OPEN) {
      try {
        this.websocketConnection.send(JSON.stringify(data));
      } catch (error) {
        console.error('Failed to send WebSocket data:', error);
      }
    }
  }

  isConnected(): boolean {
    return this.websocketConnection !== null && 
           this.websocketConnection.readyState === WebSocket.OPEN;
  }

  getConnectionStats() {
    return {
      websocketConnected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      lastConnection: this.websocketConnection ? new Date() : null,
      connectionUrl: this.getWebSocketUrl()
    };
  }

  private simulateWebSocketConnection(): void {
    this.reconnectAttempts = 0;
    console.log('WebSocket connection established (simulated)');
    
    EventManager.emit('realtime.websocket_connected', {
      timestamp: Date.now(),
      url: this.getWebSocketUrl()
    }, 'WebSocketManager');
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      
      setTimeout(() => {
        console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.establishConnection();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      EventManager.emit('realtime.websocket_failed', {
        timestamp: Date.now(),
        attempts: this.reconnectAttempts
      }, 'WebSocketManager');
    }
  }

  private getWebSocketUrl(): string {
    const host = process.env.NODE_ENV === 'development' ? 'localhost' : window.location.hostname;
    const port = process.env.NODE_ENV === 'development' ? '8080' : '443';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    return `${protocol}//${host}:${port}/rf4s-websocket`;
  }
}
