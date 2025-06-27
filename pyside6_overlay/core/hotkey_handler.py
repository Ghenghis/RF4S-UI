
"""
Hotkey Handler - Handles global hotkey events for the overlay
"""

from PySide6.QtCore import QObject


class HotkeyHandler(QObject):
    """Handles hotkey events for the overlay"""
    
    def __init__(self, overlay_app):
        super().__init__()
        self.overlay_app = overlay_app
        self.managers = overlay_app.get_managers()
        
    def toggle_mode_hotkey(self):
        """Toggle mode via hotkey"""
        try:
            self.managers['event_coordinator'].toggle_mode_hotkey()
        except Exception as e:
            print(f"Error toggling mode: {e}")
            
    def cycle_opacity(self):
        """Cycle through opacity levels"""
        try:
            self.managers['event_coordinator'].cycle_opacity()
        except Exception as e:
            print(f"Error cycling opacity: {e}")
            
    def toggle_visibility(self):
        """Toggle overlay visibility"""
        try:
            self.managers['event_coordinator'].toggle_visibility()
        except Exception as e:
            print(f"Error toggling visibility: {e}")
            
    def emergency_stop(self):
        """Handle emergency stop"""
        try:
            self.managers['event_coordinator'].on_emergency_stop()
        except Exception as e:
            print(f"Error in emergency stop: {e}")
            
    def reset_position(self):
        """Reset window position"""
        try:
            self.managers['event_coordinator'].on_reset_position()
        except Exception as e:
            print(f"Error resetting position: {e}")
