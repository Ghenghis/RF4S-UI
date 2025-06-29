
"""
RF4S Game Overlay - Main Application Entry Point
A frameless, transparent overlay for Russian Fishing 4
"""

import sys
from PySide6.QtWidgets import QApplication
from PySide6.QtCore import Qt

from core.overlay_application import OverlayApplication
from core.signal_connection_manager import SignalConnectionManager
from core.service_startup_manager import ServiceStartupManager
from core.hotkey_handler import HotkeyHandler


class RF4SOverlay(OverlayApplication):
    """Main overlay window class - streamlined and focused"""
    
    def __init__(self):
        super().__init__()
        
        try:
            # Initialize helper managers
            self.signal_manager = SignalConnectionManager(self)
            self.service_manager = ServiceStartupManager(self)
            self.hotkey_handler = HotkeyHandler(self)
            
            # Initialize application
            self.initialize_ui()
            self.setup_window_properties()
            self.signal_manager.connect_all_signals()
            self.service_manager.start_all_services()
            
            print("RF4S Overlay initialized successfully")
            
        except Exception as e:
            print(f"Error initializing RF4S Overlay: {e}")
            raise
            
    # Hotkey handler methods (delegated to HotkeyHandler)
    def toggle_mode_hotkey(self):
        """Toggle mode via hotkey"""
        self.hotkey_handler.toggle_mode_hotkey()
        
    def cycle_opacity(self):
        """Cycle through opacity levels"""
        self.hotkey_handler.cycle_opacity()
        
    def toggle_visibility(self):
        """Toggle overlay visibility"""
        self.hotkey_handler.toggle_visibility()
            
    def on_emergency_stop(self):
        """Handle emergency stop"""
        self.hotkey_handler.emergency_stop()
            
    def on_reset_position(self):
        """Reset window position"""
        self.hotkey_handler.reset_position()
        
    def closeEvent(self, event):
        """Handle application close"""
        try:
            print("Closing RF4S Overlay...")
            self.service_manager.stop_all_services()
            self.cleanup()
            event.accept()
        except Exception as e:
            print(f"Error during cleanup: {e}")
            event.accept()


def main():
    """Main application entry point"""
    try:
        # Enable high DPI scaling
        QApplication.setHighDpiScaleFactorRoundingPolicy(
            Qt.HighDpiScaleFactorRoundingPolicy.PassThrough
        )
        
        app = QApplication(sys.argv)
        
        # Create and show overlay
        overlay = RF4SOverlay()
        overlay.show()
        
        print("RF4S Overlay started successfully!")
        print("Use Ctrl+M to toggle between interactive and click-through modes")
        print("Use Ctrl+O to cycle opacity levels")
        print("Use Ctrl+H to show/hide overlay")
        
        sys.exit(app.exec())
        
    except Exception as e:
        print(f"Critical error in main: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
