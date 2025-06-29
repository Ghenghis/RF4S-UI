
"""
RF4S Event Handler - Manages RF4S bot events and commands
"""

from PySide6.QtCore import QObject, Signal


class RF4SEventHandler(QObject):
    """Handles RF4S bot events and commands"""
    
    # RF4S data signals
    session_stats_updated = Signal(dict)
    fish_caught_signal = Signal(dict)
    bot_state_changed = Signal(bool)
    detection_update_signal = Signal(dict)
    automation_update_signal = Signal(dict)
    
    def __init__(self, rf4s_service):
        super().__init__()
        self.rf4s_service = rf4s_service
        self.setup_rf4s_connections()
        
    def setup_rf4s_connections(self):
        """Setup RF4S service connections"""
        self.rf4s_service.status_updated.connect(self.on_rf4s_status_update)
        self.rf4s_service.fish_caught.connect(self.on_fish_caught)
        self.rf4s_service.error_occurred.connect(self.on_rf4s_error)
        
    def on_rf4s_status_update(self, status_data: dict):
        """Handle RF4S status updates with real data"""
        self.session_stats_updated.emit(status_data)
        
        # Emit specific updates based on data type
        if 'detection' in status_data:
            self.detection_update_signal.emit(status_data['detection'])
        if 'automation' in status_data:
            self.automation_update_signal.emit(status_data['automation'])
        if 'bot_active' in status_data:
            self.bot_state_changed.emit(status_data['bot_active'])
            
    def on_fish_caught(self, fish_data: dict):
        """Handle fish caught event with real data"""
        self.fish_caught_signal.emit(fish_data)
        
    def on_rf4s_error(self, error_message: str):
        """Handle RF4S errors"""
        print(f"RF4S Error: {error_message}")
        
    def on_start_fishing(self):
        """Start fishing bot"""
        return self.rf4s_service.start_fishing()
        
    def on_stop_fishing(self):
        """Stop fishing bot"""
        return self.rf4s_service.stop_fishing()
        
    def on_emergency_stop(self):
        """Handle emergency stop"""
        self.rf4s_service.emergency_stop()
        
    def on_update_detection_settings(self, settings: dict):
        """Update detection settings"""
        return self.rf4s_service.update_settings({'detection': settings})
        
    def on_update_automation_settings(self, settings: dict):
        """Update automation settings"""
        return self.rf4s_service.update_settings({'automation': settings})
        
    def on_change_fishing_mode(self, mode: str):
        """Change fishing mode"""
        return self.rf4s_service.set_fishing_mode(mode)
        
    def update_rf4s_data(self):
        """Update real RF4S data from service"""
        if self.rf4s_service.is_service_connected():
            # Get real data from RF4S service
            status = self.rf4s_service.get_current_status()
            self.session_stats_updated.emit(status)
            
            # Request fresh data from RF4S bot
            self.rf4s_service.send_command('get_status')
            self.rf4s_service.send_command('get_session_data')
            self.rf4s_service.send_command('get_detection_data')
            self.rf4s_service.send_command('get_automation_status')
