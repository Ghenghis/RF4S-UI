
"""
RF4S Command Handler - Handles RF4S bot commands
"""

from PySide6.QtCore import QObject
from typing import Dict, Any


class RF4SCommands(QObject):
    """Handles RF4S bot commands"""
    
    def __init__(self, connection):
        super().__init__()
        self.connection = connection
        
    def start_fishing(self) -> bool:
        """Start fishing bot"""
        return self.connection.send_message('start_fishing')
        
    def stop_fishing(self) -> bool:
        """Stop fishing bot"""
        return self.connection.send_message('stop_fishing')
        
    def emergency_stop(self) -> bool:
        """Emergency stop all bot activities"""
        return self.connection.send_message('emergency_stop')
        
    def set_fishing_mode(self, mode: str) -> bool:
        """Set fishing mode"""
        return self.connection.send_message('set_fishing_mode', {'mode': mode})
        
    def update_settings(self, settings: Dict[str, Any]) -> bool:
        """Update bot settings"""
        return self.connection.send_message('update_settings', settings)
        
    def request_status_update(self) -> bool:
        """Request status update from RF4S"""
        if not self.connection.is_service_connected():
            return False
            
        # Request fresh data from RF4S bot
        success = True
        success &= self.connection.send_message('get_status')
        success &= self.connection.send_message('get_session_data')
        success &= self.connection.send_message('get_detection_settings')
        success &= self.connection.send_message('get_automation_status')
        
        return success
