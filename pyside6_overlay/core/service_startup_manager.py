
"""
Service Startup Manager - Manages startup sequence of background services
"""

from PySide6.QtCore import QObject, Signal


class ServiceStartupManager(QObject):
    """Manages the startup sequence of background services"""
    
    startup_complete = Signal()
    startup_error = Signal(str)
    
    def __init__(self, overlay_app):
        super().__init__()
        self.overlay_app = overlay_app
        self.managers = overlay_app.get_managers()
        
    def start_all_services(self):
        """Start all background services in proper order"""
        try:
            # Start RF4S service first
            self.managers['rf4s_service'].start()
            
            # Setup hotkeys
            self.managers['event_coordinator'].setup_hotkeys()
            
            print("All background services started successfully")
            self.startup_complete.emit()
            
        except Exception as e:
            error_msg = f"Error starting services: {e}"
            print(error_msg)
            self.startup_error.emit(error_msg)
            
    def stop_all_services(self):
        """Stop all background services"""
        try:
            self.managers['rf4s_service'].stop()
            print("All background services stopped")
        except Exception as e:
            print(f"Error stopping services: {e}")
