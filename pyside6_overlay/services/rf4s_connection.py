
"""
RF4S Connection Handler - Manages connection to RF4S bot
"""

from PySide6.QtCore import QObject, QTimer, Signal
from PySide6.QtNetwork import QTcpSocket, QHostAddress
import json
from typing import Dict, Any, Optional


class RF4SConnection(QObject):
    """Handles connection to RF4S bot service"""
    
    # Connection signals
    connected = Signal()
    disconnected = Signal()
    connection_error = Signal(str)
    message_received = Signal(dict)
    
    def __init__(self):
        super().__init__()
        self.socket = QTcpSocket()
        self.connection_timer = QTimer()
        self.is_connected = False
        self.host = "127.0.0.1"
        self.port = 12345  # RF4S bot communication port
        
        # Setup socket connections
        self.socket.connected.connect(self.on_connected)
        self.socket.disconnected.connect(self.on_disconnected)
        self.socket.readyRead.connect(self.on_message_received)
        self.socket.errorOccurred.connect(self.on_connection_error)
        
        # Auto-reconnect timer
        self.connection_timer.timeout.connect(self.attempt_connection)
        
    def start(self):
        """Start connection attempts"""
        print("Starting RF4S connection service...")
        self.connection_timer.start(5000)  # Try every 5 seconds
        self.attempt_connection()
        
    def stop(self):
        """Stop connection service"""
        print("Stopping RF4S connection service...")
        self.connection_timer.stop()
        if self.socket.state() == QTcpSocket.SocketState.ConnectedState:
            self.socket.disconnectFromHost()
            
    def attempt_connection(self):
        """Attempt to connect to RF4S bot"""
        if self.socket.state() == QTcpSocket.SocketState.ConnectedState:
            return
            
        try:
            self.socket.connectToHost(QHostAddress(self.host), self.port)
        except Exception as e:
            print(f"Connection attempt failed: {e}")
            
    def on_connected(self):
        """Handle successful connection"""
        self.is_connected = True
        print("Connected to RF4S bot successfully")
        self.connected.emit()
        
    def on_disconnected(self):
        """Handle disconnection"""
        self.is_connected = False
        print("Disconnected from RF4S bot")
        self.disconnected.emit()
        
    def on_connection_error(self, error):
        """Handle connection errors"""
        error_msg = f"RF4S connection error: {error}"
        print(error_msg)
        self.connection_error.emit(error_msg)
        
    def on_message_received(self):
        """Handle incoming messages"""
        try:
            data = self.socket.readAll().data().decode('utf-8')
            for line in data.strip().split('\n'):
                if line:
                    message = json.loads(line)
                    self.message_received.emit(message)
        except Exception as e:
            print(f"Error parsing message: {e}")
            
    def send_message(self, command: str, data: Dict[str, Any] = None) -> bool:
        """Send message to RF4S bot"""
        if not self.is_connected:
            return False
            
        try:
            message = {
                'command': command,
                'data': data or {}
            }
            json_data = json.dumps(message) + '\n'
            bytes_written = self.socket.write(json_data.encode('utf-8'))
            return bytes_written > 0
        except Exception as e:
            print(f"Error sending message: {e}")
            return False
            
    def is_service_connected(self) -> bool:
        """Check if connected to RF4S service"""
        return self.is_connected and self.socket.state() == QTcpSocket.SocketState.ConnectedState
