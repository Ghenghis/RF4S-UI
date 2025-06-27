
"""
RF4S Connection Manager - Handles connection to RF4S bot
"""

import socket
import threading
import time
from PySide6.QtCore import QObject, Signal
from typing import Dict, Any, Optional


class RF4SConnection(QObject):
    """Manages connection to RF4S bot"""
    
    # Connection signals
    connected = Signal()
    disconnected = Signal()
    connection_error = Signal(str)
    message_received = Signal(str)
    
    def __init__(self, host: str = 'localhost', port: int = 8888):
        super().__init__()
        
        # Connection settings
        self.host = host
        self.port = port
        self.socket = None
        self.is_connected = False
        self.is_running = False
        
        # Communication thread
        self.comm_thread = None
        
    def start(self):
        """Start the connection manager"""
        if self.is_running:
            return
            
        self.is_running = True
        
        # Start communication thread
        self.comm_thread = threading.Thread(target=self._communication_loop, daemon=True)
        self.comm_thread.start()
        
        print("RF4S Connection Manager started")
        
    def stop(self):
        """Stop the connection manager"""
        self.is_running = False
        
        if self.socket:
            try:
                self.socket.close()
            except:
                pass
                
        if self.is_connected:
            self.is_connected = False
            self.disconnected.emit()
            
        print("RF4S Connection Manager stopped")
        
    def _communication_loop(self):
        """Main communication loop"""
        while self.is_running:
            try:
                if not self.is_connected:
                    self._attempt_connection()
                else:
                    self._handle_messages()
                    
            except Exception as e:
                self.connection_error.emit(f"Communication error: {e}")
                self._disconnect()
                
            time.sleep(0.1)
            
    def _attempt_connection(self):
        """Attempt to connect to RF4S bot"""
        try:
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.socket.settimeout(5.0)
            self.socket.connect((self.host, self.port))
            
            self.is_connected = True
            self.connected.emit()
            print(f"Connected to RF4S at {self.host}:{self.port}")
            
            # Send initial handshake
            self.send_message('handshake', {'client': 'RF4S_Overlay', 'version': '1.0'})
            
        except (socket.error, socket.timeout):
            # Connection failed, will retry
            if self.socket:
                self.socket.close()
                self.socket = None
            time.sleep(2)  # Wait before retry
            
    def _handle_messages(self):
        """Handle incoming messages from RF4S"""
        try:
            self.socket.settimeout(1.0)
            data = self.socket.recv(4096)
            
            if data:
                message = data.decode('utf-8')
                self.message_received.emit(message)
            else:
                # Connection closed
                self._disconnect()
                
        except socket.timeout:
            # No data received, continue
            pass
        except socket.error:
            # Connection error
            self._disconnect()
            
    def _disconnect(self):
        """Disconnect from RF4S"""
        if self.socket:
            try:
                self.socket.close()
            except:
                pass
            self.socket = None
            
        if self.is_connected:
            self.is_connected = False
            self.disconnected.emit()
            print("Disconnected from RF4S")
            
    def send_message(self, command: str, data: Dict[str, Any] = None) -> bool:
        """Send message to RF4S bot"""
        if not self.is_connected or not self.socket:
            return False
            
        try:
            import json
            message = {
                'command': command,
                'data': data or {},
                'timestamp': time.time()
            }
            
            json_message = json.dumps(message)
            self.socket.send(json_message.encode('utf-8'))
            return True
            
        except Exception as e:
            self.connection_error.emit(f"Failed to send message: {e}")
            return False
            
    def is_service_connected(self) -> bool:
        """Check if connected to RF4S"""
        return self.is_connected
