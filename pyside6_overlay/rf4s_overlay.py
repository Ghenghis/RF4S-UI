
"""
RF4S Game Overlay - Main Application
A frameless, transparent overlay for Russian Fishing 4
"""

import sys
import os
from PySide6.QtWidgets import QApplication, QWidget
from PySide6.QtCore import Qt

from qfluentwidgets import FluentWindow

# Import our refactored components
from core.overlay_manager import OverlayManager
from core.game_detector import GameDetector
from core.hotkey_manager import HotkeyManager
from core.event_handler import OverlayEventHandler
from core.window_manager import WindowManager
from ui.panel_factory import PanelFactory
from ui.workspace_manager import WorkspaceManager
from ui.overlay_ui_manager import OverlayUIManager
from services.rf4s_service import RF4SService


class RF4SOverlay(FluentWindow):
    """Main overlay window class - now focused and clean"""
    
    def __init__(self):
        super().__init__()
        
        # Initialize core components
        self.overlay_manager = OverlayManager(self)
        self.game_detector = GameDetector()
        self.hotkey_manager = HotkeyManager()
        self.rf4s_service = RF4SService()
        
        # Initialize managers
        self.window_manager = WindowManager(self)
        self.panel_factory = PanelFactory()
        self.workspace_manager = WorkspaceManager(self)
        self.ui_manager = OverlayUIManager(self, self.workspace_manager)
        
        # Initialize event handler
        self.event_handler = OverlayEventHandler(
            self, self.overlay_manager, self.game_detector, 
            self.hotkey_manager, self.rf4s_service
        )
        
        # Initialize application
        self.init_ui()
        self.setup_window()
        self.connect_signals()
        self.start_services()
        
    def init_ui(self):
        """Initialize the user interface"""
        self.ui_manager.setup_theme()
        self.setWindowTitle("RF4S Overlay")
        self.resize(1200, 800)
        
        # Create main layout
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        self.ui_manager.create_main_layout(central_widget)
        
    def setup_window(self):
        """Setup window properties"""
        self.window_manager.setup_window_properties()
        self.window_manager.set_window_opacity(0.9)
        
    def connect_signals(self):
        """Connect all signals between components"""
        # UI to event handler connections
        self.ui_manager.opacity_changed.connect(self.event_handler.on_opacity_changed)
        self.ui_manager.mode_toggled.connect(self.event_handler.on_mode_toggled)
        self.ui_manager.attachment_toggled.connect(self.event_handler.on_attachment_toggled)
        self.ui_manager.emergency_stop_clicked.connect(self.event_handler.on_emergency_stop)
        self.ui_manager.reset_position_clicked.connect(self.event_handler.on_reset_position)
        
        # Event handler to UI connections
        self.event_handler.game_status_changed.connect(self.ui_manager.update_game_status)
        self.event_handler.rf4s_status_changed.connect(self.ui_manager.update_rf4s_status)
        self.event_handler.mode_changed.connect(self.ui_manager.update_mode_status)
        self.event_handler.position_changed.connect(self.ui_manager.update_position_info)
        self.event_handler.size_changed.connect(self.ui_manager.update_size_info)
        
        # Mode change UI updates
        self.event_handler.mode_changed.connect(self.ui_manager.update_mode_toggle_text)
        self.event_handler.attachment_changed.connect(self.ui_manager.update_attach_toggle_text)
        
    def start_services(self):
        """Start background services"""
        self.rf4s_service.start()
        self.event_handler.setup_hotkeys()
        
    def closeEvent(self, event):
        """Handle application close"""
        self.event_handler.cleanup()
        event.accept()


def main():
    """Main application entry point"""
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
    
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
