
"""
RF4S Game Overlay - Main Application
A frameless, transparent overlay for Russian Fishing 4
"""

import sys
import os
from PySide6.QtWidgets import QApplication, QWidget, QMainWindow
from PySide6.QtCore import Qt

# Import our refactored components
try:
    from core.overlay_manager import OverlayManager
    from core.game_detector import GameDetector
    from core.hotkey_manager import HotkeyManager
    from core.event_coordinator import EventCoordinator
    from core.window_manager import WindowManager
    from ui.panel_factory import PanelFactory
    from ui.workspace_manager import WorkspaceManager
    from ui.overlay_ui_manager import OverlayUIManager
    from services.rf4s_service import RF4SService
except ImportError as e:
    print(f"Import error: {e}")
    print("Please ensure all required modules are available")
    sys.exit(1)


class RF4SOverlay(QMainWindow):
    """Main overlay window class - now focused and clean"""
    
    def __init__(self):
        super().__init__()
        
        # Initialize core components with error handling
        try:
            self.overlay_manager = OverlayManager(self)
            self.game_detector = GameDetector()
            self.hotkey_manager = HotkeyManager()
            self.rf4s_service = RF4SService()
            
            # Initialize managers
            self.window_manager = WindowManager(self)
            self.panel_factory = PanelFactory()
            self.workspace_manager = WorkspaceManager(self)
            self.ui_manager = OverlayUIManager(self, self.workspace_manager)
            
            # Initialize event coordinator (replaces event_handler)
            self.event_coordinator = EventCoordinator(
                self, self.overlay_manager, self.game_detector, 
                self.hotkey_manager, self.rf4s_service
            )
            
            # Initialize application
            self.init_ui()
            self.setup_window()
            self.connect_signals()
            self.start_services()
            
            print("RF4S Overlay initialized successfully")
            
        except Exception as e:
            print(f"Error initializing RF4S Overlay: {e}")
            raise
        
    def init_ui(self):
        """Initialize the user interface"""
        try:
            self.ui_manager.setup_theme()
            self.setWindowTitle("RF4S Overlay")
            self.resize(1200, 800)
            
            # Create main layout
            central_widget = QWidget()
            self.setCentralWidget(central_widget)
            self.ui_manager.create_main_layout(central_widget)
            
        except Exception as e:
            print(f"Error initializing UI: {e}")
            raise
        
    def setup_window(self):
        """Setup window properties"""
        try:
            self.window_manager.setup_window_properties()
            self.window_manager.set_window_opacity(0.9)
            self.overlay_manager.set_always_on_top(True)
            
        except Exception as e:
            print(f"Error setting up window: {e}")
        
    def connect_signals(self):
        """Connect all signals between components for real data flow"""
        try:
            # UI to event coordinator connections
            self.ui_manager.opacity_changed.connect(self.event_coordinator.on_opacity_changed)
            self.ui_manager.mode_toggled.connect(self.event_coordinator.on_mode_toggled)
            self.ui_manager.attachment_toggled.connect(self.event_coordinator.on_attachment_toggled)
            self.ui_manager.emergency_stop_clicked.connect(self.event_coordinator.on_emergency_stop)
            self.ui_manager.reset_position_clicked.connect(self.event_coordinator.on_reset_position)
            
            # RF4S control connections
            self.ui_manager.start_fishing_clicked.connect(self.event_coordinator.on_start_fishing)
            self.ui_manager.stop_fishing_clicked.connect(self.event_coordinator.on_stop_fishing)
            self.ui_manager.detection_settings_changed.connect(self.event_coordinator.on_update_detection_settings)
            self.ui_manager.automation_settings_changed.connect(self.event_coordinator.on_update_automation_settings)
            self.ui_manager.fishing_mode_changed.connect(self.event_coordinator.on_change_fishing_mode)
            
            # Event coordinator to UI connections (real data flow)
            self.event_coordinator.game_status_changed.connect(self.ui_manager.update_game_status)
            self.event_coordinator.rf4s_status_changed.connect(self.ui_manager.update_rf4s_status)
            self.event_coordinator.mode_changed.connect(self.ui_manager.update_mode_status)
            self.event_coordinator.position_changed.connect(self.ui_manager.update_position_info)
            self.event_coordinator.size_changed.connect(self.ui_manager.update_size_info)
            
            # Real RF4S data connections
            self.event_coordinator.session_stats_updated.connect(self.ui_manager.update_session_stats)
            self.event_coordinator.bot_state_changed.connect(self.ui_manager.update_bot_status)
            self.event_coordinator.detection_update_signal.connect(self.ui_manager.update_detection_settings)
            self.event_coordinator.automation_update_signal.connect(self.ui_manager.update_automation_settings)
            
            # Mode change UI updates
            self.event_coordinator.mode_changed.connect(self.ui_manager.update_mode_toggle_text)
            self.event_coordinator.attachment_changed.connect(self.ui_manager.update_attach_toggle_text)
            
            # Overlay manager connections
            self.overlay_manager.position_changed.connect(self.ui_manager.update_position_info)
            self.overlay_manager.size_changed.connect(self.ui_manager.update_size_info)
            self.overlay_manager.mode_changed.connect(self.ui_manager.update_mode_status)
            
            print("All signals connected successfully")
            
        except Exception as e:
            print(f"Error connecting signals: {e}")
        
    def start_services(self):
        """Start background services"""
        try:
            self.rf4s_service.start()
            self.event_coordinator.setup_hotkeys()
            print("Background services started")
            
        except Exception as e:
            print(f"Error starting services: {e}")
    
    # Hotkey handler methods (forwarded to event coordinator)
    def toggle_mode_hotkey(self):
        """Toggle mode via hotkey"""
        try:
            self.event_coordinator.toggle_mode_hotkey()
        except Exception as e:
            print(f"Error toggling mode: {e}")
        
    def cycle_opacity(self):
        """Cycle through opacity levels"""
        try:
            self.event_coordinator.cycle_opacity()
        except Exception as e:
            print(f"Error cycling opacity: {e}")
        
    def toggle_visibility(self):
        """Toggle overlay visibility"""
        try:
            self.event_coordinator.toggle_visibility()
        except Exception as e:
            print(f"Error toggling visibility: {e}")
            
    def on_emergency_stop(self):
        """Handle emergency stop"""
        try:
            self.event_coordinator.on_emergency_stop()
        except Exception as e:
            print(f"Error in emergency stop: {e}")
            
    def on_reset_position(self):
        """Reset window position"""
        try:
            self.event_coordinator.on_reset_position()
        except Exception as e:
            print(f"Error resetting position: {e}")
        
    def closeEvent(self, event):
        """Handle application close"""
        try:
            print("Closing RF4S Overlay...")
            self.event_coordinator.cleanup()
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
