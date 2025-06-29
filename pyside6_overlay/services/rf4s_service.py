
"""
RF4S Service - Integration with RF4S bot backend
"""

from PySide6.QtCore import QObject, QTimer, Signal
from typing import Dict, Any

from .rf4s_connection import RF4SConnection
from .rf4s_commands import RF4SCommands
from .rf4s_data_processor import RF4SDataProcessor


class RF4SService(QObject):
    """Service for communicating with RF4S bot"""
    
    # Forward signals from components
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
        
        # Initialize components
        self.connection = RF4SConnection()
        self.commands = RF4SCommands(self.connection)
        self.data_processor = RF4SDataProcessor()
        
        # Setup component connections
        self._setup_connections()
        
        # Status update timer
        self.status_timer = QTimer()
        self.status_timer.timeout.connect(self._handle_status_update)
        
    def _setup_connections(self):
        """Setup connections between components"""
        # Connection signals
        self.connection.connected.connect(self.connected.emit)
        self.connection.disconnected.connect(self.disconnected.emit)
        self.connection.connection_error.connect(self.error_occurred.emit)
        self.connection.message_received.connect(self.data_processor.process_message)
        
        # Data processor signals
        self.data_processor.status_updated.connect(self.status_updated.emit)
        self.data_processor.fish_caught.connect(self.fish_caught.emit)
        self.data_processor.session_data_updated.connect(self.session_data_updated.emit)
        self.data_processor.bot_state_changed.connect(self.bot_state_changed.emit)
        self.data_processor.detection_data_updated.connect(self.detection_data_updated.emit)
        self.data_processor.automation_status_updated.connect(self.automation_status_updated.emit)
        self.data_processor.processing_error.connect(self.error_occurred.emit)
        
    def start(self):
        """Start the RF4S service"""
        self.connection.start()
        self.status_timer.start(1000)  # Update every second
        print("RF4S Service started")
        
    def stop(self):
        """Stop the RF4S service"""
        self.connection.stop()
        self.status_timer.stop()
        print("RF4S Service stopped")
        
    def _handle_status_update(self):
        """Handle status update timer"""
        if self.connection.is_service_connected():
            # Request fresh data from RF4S bot
            self.commands.request_status_update()
        else:
            # Update session time even when disconnected
            self.data_processor.update_session_time()
            # Emit current status
            self.status_updated.emit(self.data_processor.get_current_status())
            
    # Command delegation methods
    def start_fishing(self) -> bool:
        """Start fishing bot"""
        success = self.commands.start_fishing()
        if success:
            self.data_processor.update_status_locally({
                'bot_active': True,
                'last_activity': 'Fishing started'
            })
        return success
        
    def stop_fishing(self) -> bool:
        """Stop fishing bot"""
        success = self.commands.stop_fishing()
        if success:
            self.data_processor.update_status_locally({
                'bot_active': False,
                'last_activity': 'Fishing stopped'
            })
        return success
        
    def emergency_stop(self) -> bool:
        """Emergency stop all bot activities"""
        success = self.commands.emergency_stop()
        if success:
            self.data_processor.update_status_locally({
                'bot_active': False,
                'last_activity': 'Emergency stop'
            })
        return success
        
    def set_fishing_mode(self, mode: str) -> bool:
        """Set fishing mode"""
        success = self.commands.set_fishing_mode(mode)
        if success:
            self.data_processor.update_status_locally({'fishing_mode': mode})
        return success
        
    def update_settings(self, settings: Dict[str, Any]) -> bool:
        """Update bot settings"""
        success = self.commands.update_settings(settings)
        if success:
            # Update local settings
            current_status = self.data_processor.get_current_status()
            if 'detection' in settings:
                current_status['detection_settings'].update(settings['detection'])
            if 'automation' in settings:
                current_status['automation_settings'].update(settings['automation'])
            self.data_processor.update_status_locally(current_status)
        return success
        
    def send_command(self, command: str, data: Dict[str, Any] = None) -> bool:
        """Send command to RF4S bot"""
        return self.connection.send_message(command, data)
        
    # Data access methods
    def get_current_status(self) -> Dict[str, Any]:
        """Get current bot status with real data"""
        return self.data_processor.get_current_status()
        
    def is_service_connected(self) -> bool:
        """Check if service is connected to RF4S"""
        return self.connection.is_service_connected()
        
    def get_session_stats(self) -> Dict[str, Any]:
        """Get real session statistics"""
        return self.data_processor.get_session_stats()
        
    def get_detection_settings(self) -> Dict[str, Any]:
        """Get current detection settings"""
        return self.data_processor.get_detection_settings()
        
    def get_automation_settings(self) -> Dict[str, Any]:
        """Get current automation settings"""
        return self.data_processor.get_automation_settings()
