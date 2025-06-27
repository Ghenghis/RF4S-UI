
"""
RF4S Data Processor - Processes and manages RF4S bot data
"""

from PySide6.QtCore import QObject, Signal, QDateTime
from typing import Dict, Any
import time


class RF4SDataProcessor(QObject):
    """Processes RF4S bot data and maintains state"""
    
    # Data signals
    status_updated = Signal(dict)
    fish_caught = Signal(dict)
    session_data_updated = Signal(dict)
    bot_state_changed = Signal(bool)
    detection_data_updated = Signal(dict)
    automation_status_updated = Signal(dict)
    processing_error = Signal(str)
    
    def __init__(self):
        super().__init__()
        self.session_start_time = time.time()
        self.current_status = self.get_default_status()
        
    def get_default_status(self) -> Dict[str, Any]:
        """Get default status structure"""
        return {
            'bot_active': False,
            'fishing_mode': 'Float',
            'session_time': '00:00:00',
            'fish_caught': 0,
            'casts_made': 0,
            'success_rate': 0.0,
            'last_activity': 'Idle',
            'detection_settings': {
                'sensitivity': 50,
                'confidence_threshold': 0.8
            },
            'automation_settings': {
                'enabled': False,
                'auto_cast': True,
                'auto_reel': True
            },
            'game_connected': False,
            'rf4s_connected': False
        }
        
    def process_message(self, message: Dict[str, Any]):
        """Process incoming RF4S message"""
        try:
            message_type = message.get('type', 'unknown')
            
            if message_type == 'status_update':
                self.handle_status_update(message.get('data', {}))
            elif message_type == 'fish_caught':
                self.handle_fish_caught(message.get('data', {}))
            elif message_type == 'session_data':
                self.handle_session_data(message.get('data', {}))
            elif message_type == 'bot_state':
                self.handle_bot_state(message.get('data', {}))
            elif message_type == 'detection_data':
                self.handle_detection_data(message.get('data', {}))
            elif message_type == 'automation_status':
                self.handle_automation_status(message.get('data', {}))
            else:
                print(f"Unknown message type: {message_type}")
                
        except Exception as e:
            error_msg = f"Error processing RF4S message: {e}"
            print(error_msg)
            self.processing_error.emit(error_msg)
            
    def handle_status_update(self, data: Dict[str, Any]):
        """Handle status update from RF4S"""
        self.current_status.update(data)
        self.current_status['rf4s_connected'] = True
        self.status_updated.emit(self.current_status.copy())
        
    def handle_fish_caught(self, data: Dict[str, Any]):
        """Handle fish caught event"""
        self.current_status['fish_caught'] += 1
        self.current_status['last_activity'] = f"Caught {data.get('fish_type', 'fish')}"
        self.fish_caught.emit(data)
        self.status_updated.emit(self.current_status.copy())
        
    def handle_session_data(self, data: Dict[str, Any]):
        """Handle session data update"""
        self.current_status.update(data)
        self.session_data_updated.emit(data)
        
    def handle_bot_state(self, data: Dict[str, Any]):
        """Handle bot state change"""
        bot_active = data.get('active', False)
        self.current_status['bot_active'] = bot_active
        self.bot_state_changed.emit(bot_active)
        
    def handle_detection_data(self, data: Dict[str, Any]):
        """Handle detection data update"""
        self.current_status['detection_settings'].update(data)
        self.detection_data_updated.emit(data)
        
    def handle_automation_status(self, data: Dict[str, Any]):
        """Handle automation status update"""
        self.current_status['automation_settings'].update(data)
        self.automation_status_updated.emit(data)
        
    def update_session_time(self):
        """Update session time"""
        elapsed = time.time() - self.session_start_time
        hours = int(elapsed // 3600)
        minutes = int((elapsed % 3600) // 60)
        seconds = int(elapsed % 60)
        self.current_status['session_time'] = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        
    def update_status_locally(self, updates: Dict[str, Any]):
        """Update status locally without RF4S communication"""
        self.current_status.update(updates)
        self.status_updated.emit(self.current_status.copy())
        
    def get_current_status(self) -> Dict[str, Any]:
        """Get current status with updated session time"""
        self.update_session_time()
        return self.current_status.copy()
        
    def get_session_stats(self) -> Dict[str, Any]:
        """Get session statistics"""
        self.update_session_time()
        return {
            'session_time': self.current_status['session_time'],
            'fish_caught': self.current_status['fish_caught'],
            'casts_made': self.current_status['casts_made'],
            'success_rate': self.current_status['success_rate'],
            'last_activity': self.current_status['last_activity']
        }
        
    def get_detection_settings(self) -> Dict[str, Any]:
        """Get current detection settings"""
        return self.current_status['detection_settings'].copy()
        
    def get_automation_settings(self) -> Dict[str, Any]:
        """Get current automation settings"""
        return self.current_status['automation_settings'].copy()
