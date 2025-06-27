
"""
RF4S Data Processor - Processes data from RF4S bot
"""

import json
import time
from PySide6.QtCore import QObject, Signal
from typing import Dict, Any


class RF4SDataProcessor(QObject):
    """Processes data from RF4S bot"""
    
    # Data processing signals
    status_updated = Signal(dict)
    fish_caught = Signal(dict)
    session_data_updated = Signal(dict)
    bot_state_changed = Signal(bool)
    detection_data_updated = Signal(dict)
    automation_status_updated = Signal(dict)
    processing_error = Signal(str)
    
    def __init__(self):
        super().__init__()
        
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
        
        # Session tracking
        self.session_start_time = time.time()
        
    def process_message(self, message: str):
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
                self.processing_error.emit(data.get('message', 'Unknown error'))
                
        except json.JSONDecodeError:
            print(f"Invalid JSON received: {message}")
            
    def update_status_locally(self, updates: Dict[str, Any]):
        """Update status locally"""
        self.current_status.update(updates)
        self.status_updated.emit(self.current_status)
        
    def update_session_time(self):
        """Update session time even when disconnected"""
        session_time = int(time.time() - self.session_start_time)
        hours = session_time // 3600
        minutes = (session_time % 3600) // 60
        seconds = session_time % 60
        self.current_status['session_time'] = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        
    def get_current_status(self) -> Dict[str, Any]:
        """Get current status with real data"""
        return self.current_status.copy()
        
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
        
    def reset_session(self):
        """Reset session data"""
        self.session_start_time = time.time()
        self.current_status.update({
            'fish_caught': 0,
            'total_casts': 0,
            'successful_catches': 0,
            'session_time': '00:00:00',
            'last_activity': 'None'
        })
