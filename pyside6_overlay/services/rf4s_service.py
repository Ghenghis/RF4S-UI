
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
    
    # Signals for real data updates
    connected = Signal()
    disconnected = Signal()
    status_updated = Signal(dict)
    fish_caught = Signal(dict)
    error_occurred = Signal(str)
    session_data_updated = Signal(dict)
    bot_state_changed = Signal(bool)
    detection_data_updated = Signal(dict)
    automation_status_updated = Signal(dict)
    
    def __init__(self):
        super().__init__()
        
        # Connection settings
        self.host = 'localhost'
        self.port = 8888
        self.socket = None
        self.is_connected = False
        self.is_running = False
        
        # Real status data from RF4S
        self.current_status = {
            'bot_active': False,
            'fishing_mode': 'idle',
            'fish_caught': 0,
            'session_time': '00:00:00',
            'last_activity': 'None',
            'detection_confidence': 0.75,
            'automation_enabled': False,
            'current_bait': 'Unknown',
            'current_location': 'Unknown',
            'total_casts': 0,
            'successful_catches': 0,
            'detection_settings': {
                'sensitivity': 75,
                'rod_tip_enabled': True,
                'float_enabled': True,
                'bite_threshold': 0.7
            },
            'automation_settings': {
                'auto_cast': True,
                'auto_reel': True,
                'auto_unhook': True,
                'cast_delay': 2.0
            }
        }
        
        # Communication thread
        self.comm_thread = None
        self.status_timer = QTimer()
        self.status_timer.timeout.connect(self.request_status_update)
        
        # Session tracking
        self.session_start_time = time.time()
        
    def start(self):
        """Start the RF4S service"""
        if self.is_running:
            return
            
        self.is_running = True
        self.session_start_time = time.time()
        
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
        """Main communication loop for real RF4S data"""
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
            
            # Send initial handshake
            self.send_command('handshake', {'client': 'RF4S_Overlay', 'version': '1.0'})
            
        except (socket.error, socket.timeout):
            # Connection failed, will retry
            if self.socket:
                self.socket.close()
                self.socket = None
            time.sleep(2)  # Wait before retry
            
    def _handle_messages(self):
        """Handle incoming messages from RF4S with real data"""
        try:
            self.socket.settimeout(1.0)
            data = self.socket.recv(4096)  # Increased buffer for larger data
            
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
        """Process message from RF4S with real data handling"""
        try:
            data = json.loads(message)
            msg_type = data.get('type', '')
            
            if msg_type == 'status_update':
                # Real status data from RF4S bot
                status_data = data.get('data', {})
                self.current_status.update(status_data)
                self.status_updated.emit(self.current_status)
                
            elif msg_type == 'fish_caught':
                # Real fish caught data
                fish_data = data.get('data', {})
                self.current_status['fish_caught'] += 1
                self.current_status['successful_catches'] += 1
                self.fish_caught.emit(fish_data)
                
            elif msg_type == 'session_data':
                # Real session statistics
                session_data = data.get('data', {})
                self.session_data_updated.emit(session_data)
                
            elif msg_type == 'bot_state':
                # Real bot state change
                bot_active = data.get('active', False)
                self.current_status['bot_active'] = bot_active
                self.bot_state_changed.emit(bot_active)
                
            elif msg_type == 'detection_data':
                # Real detection data
                detection_data = data.get('data', {})
                self.current_status['detection_settings'].update(detection_data)
                self.detection_data_updated.emit(detection_data)
                
            elif msg_type == 'automation_status':
                # Real automation status
                automation_data = data.get('data', {})
                self.current_status['automation_settings'].update(automation_data)
                self.automation_status_updated.emit(automation_data)
                
            elif msg_type == 'cast_performed':
                # Real cast tracking
                self.current_status['total_casts'] += 1
                self.current_status['last_activity'] = 'Cast performed'
                
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
                'data': data or {},
                'timestamp': time.time()
            }
            
            json_message = json.dumps(message)
            self.socket.send(json_message.encode('utf-8'))
            return True
            
        except Exception as e:
            self.error_occurred.emit(f"Failed to send command: {e}")
            return False
            
    def start_fishing(self) -> bool:
        """Start fishing bot"""
        success = self.send_command('start_fishing')
        if success:
            self.current_status['bot_active'] = True
            self.current_status['last_activity'] = 'Fishing started'
        return success
        
    def stop_fishing(self) -> bool:
        """Stop fishing bot"""
        success = self.send_command('stop_fishing')
        if success:
            self.current_status['bot_active'] = False
            self.current_status['last_activity'] = 'Fishing stopped'
        return success
        
    def emergency_stop(self) -> bool:
        """Emergency stop all bot activities"""
        success = self.send_command('emergency_stop')
        if success:
            self.current_status['bot_active'] = False
            self.current_status['last_activity'] = 'Emergency stop'
        return success
        
    def set_fishing_mode(self, mode: str) -> bool:
        """Set fishing mode"""
        success = self.send_command('set_fishing_mode', {'mode': mode})
        if success:
            self.current_status['fishing_mode'] = mode
        return success
        
    def update_settings(self, settings: Dict[str, Any]) -> bool:
        """Update bot settings"""
        success = self.send_command('update_settings', settings)
        if success:
            # Update local settings
            if 'detection' in settings:
                self.current_status['detection_settings'].update(settings['detection'])
            if 'automation' in settings:
                self.current_status['automation_settings'].update(settings['automation'])
        return success
        
    def request_status_update(self):
        """Request status update from RF4S (called by timer)"""
        if self.is_connected:
            # Request fresh data from RF4S bot
            self.send_command('get_status')
            self.send_command('get_session_data')
            self.send_command('get_detection_settings')
            self.send_command('get_automation_status')
        else:
            # Update session time even when disconnected
            session_time = int(time.time() - self.session_start_time)
            hours = session_time // 3600
            minutes = (session_time % 3600) // 60
            seconds = session_time % 60
            self.current_status['session_time'] = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            
            # Emit current status
            self.status_updated.emit(self.current_status)
            
    def get_current_status(self) -> Dict[str, Any]:
        """Get current bot status with real data"""
        return self.current_status.copy()
        
    def is_service_connected(self) -> bool:
        """Check if service is connected to RF4S"""
        return self.is_connected
        
    def get_session_stats(self) -> Dict[str, Any]:
        """Get real session statistics"""
        session_time = int(time.time() - self.session_start_time)
        catch_rate = 0
        if self.current_status['total_casts'] > 0:
            catch_rate = (self.current_status['successful_catches'] / self.current_status['total_casts']) * 100
            
        return {
            'session_time': self.current_status['session_time'],
            'fish_caught': self.current_status['fish_caught'],
            'total_casts': self.current_status['total_casts'],
            'successful_catches': self.current_status['successful_catches'],
            'catch_rate': f"{catch_rate:.1f}%",
            'current_mode': self.current_status['fishing_mode'],
            'bot_active': self.current_status['bot_active']
        }
        
    def get_detection_settings(self) -> Dict[str, Any]:
        """Get current detection settings"""
        return self.current_status['detection_settings'].copy()
        
    def get_automation_settings(self) -> Dict[str, Any]:
        """Get current automation settings"""
        return self.current_status['automation_settings'].copy()
