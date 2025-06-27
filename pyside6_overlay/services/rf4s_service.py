"""
RF4S Service - Integration with RF4S bot backend
"""

import json
import socket
import threading
import time
from PySide6.QtCore import QObject, QTimer, Signal
from typing import Dict, Any, Optional


class RF4SService(QObject):
    """Service for communicating with RF4S bot"""
    
    # Signals
    connected = Signal()
    disconnected = Signal()
    status_updated = Signal(dict)
    fish_caught = Signal(dict)
    error_occurred = Signal(str)
    
    def __init__(self):
        super().__init__()
        
        # Connection settings
        self.host = 'localhost'
        self.port = 8888
        self.socket = None
        self.is_connected = False
        self.is_running = False
        
        # Status data
        self.current_status = {
            'bot_active': False,
            'fishing_mode': 'idle',
            'fish_caught': 0,
            'session_time': 0,
            'last_activity': 'None'
        }
        
        # Communication thread
        self.comm_thread = None
        self.status_timer = QTimer()
        self.status_timer.timeout.connect(self.update_status)
        
    def start(self):
        """Start the RF4S service"""
        if self.is_running:
            return
            
        self.is_running = True
        
        # Start communication thread
        self.comm_thread = threading.Thread(target=self._communication_loop, daemon=True)
        self.comm_thread.start()
        
        # Start status timer
        self.status_timer.start(1000)  # Update every second
        
        print("RF4S Service started")
        
    def stop(self):
        """Stop the RF4S service"""
        self.is_running = False
        
        if self.socket:
            try:
                self.socket.close()
            except:
                pass
                
        self.status_timer.stop()
        
        if self.is_connected:
            self.is_connected = False
            self.disconnected.emit()
            
        print("RF4S Service stopped")
        
    def _communication_loop(self):
        """Main communication loop"""
        while self.is_running:
            try:
                if not self.is_connected:
                    self._attempt_connection()
                else:
                    self._handle_messages()
                    
            except Exception as e:
                self.error_occurred.emit(f"Communication error: {e}")
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
            data = self.socket.recv(1024)
            
            if data:
                message = data.decode('utf-8')
                self._process_message(message)
            else:
                # Connection closed
                self._disconnect()
                
        except socket.timeout:
            # No data received, continue
            pass
        except socket.error:
            # Connection error
            self._disconnect()
            
    def _process_message(self, message: str):
        """Process message from RF4S"""
        try:
            data = json.loads(message)
            msg_type = data.get('type', '')
            
            if msg_type == 'status':
                self.current_status.update(data.get('data', {}))
                self.status_updated.emit(self.current_status)
                
            elif msg_type == 'fish_caught':
                self.fish_caught.emit(data.get('data', {}))
                
            elif msg_type == 'error':
                self.error_occurred.emit(data.get('message', 'Unknown error'))
                
        except json.JSONDecodeError:
            print(f"Invalid JSON received: {message}")
            
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
            
    def send_command(self, command: str, data: Dict[str, Any] = None) -> bool:
        """Send command to RF4S bot"""
        if not self.is_connected or not self.socket:
            return False
            
        try:
            message = {
                'command': command,
                'data': data or {}
            }
            
            json_message = json.dumps(message)
            self.socket.send(json_message.encode('utf-8'))
            return True
            
        except Exception as e:
            self.error_occurred.emit(f"Failed to send command: {e}")
            return False
            
    def start_fishing(self) -> bool:
        """Start fishing bot"""
        return self.send_command('start_fishing')
        
    def stop_fishing(self) -> bool:
        """Stop fishing bot"""
        return self.send_command('stop_fishing')
        
    def emergency_stop(self) -> bool:
        """Emergency stop all bot activities"""
        return self.send_command('emergency_stop')
        
    def set_fishing_mode(self, mode: str) -> bool:
        """Set fishing mode"""
        return self.send_command('set_mode', {'mode': mode})
        
    def update_settings(self, settings: Dict[str, Any]) -> bool:
        """Update bot settings"""
        return self.send_command('update_settings', settings)
        
    def update_status(self):
        """Update status (called by timer)"""
        if self.is_connected:
            # Request status update
            self.send_command('get_status')
        else:
            # Emit mock status for demonstration
            self.current_status['session_time'] += 1
            self.status_updated.emit(self.current_status)
            
    def get_current_status(self) -> Dict[str, Any]:
        """Get current bot status"""
        return self.current_status.copy()
        
    def is_service_connected(self) -> bool:
        """Check if service is connected"""
        return self.is_connected
