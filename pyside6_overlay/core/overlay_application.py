
"""
Overlay Application - Main application class for RF4S Overlay
"""

from PySide6.QtWidgets import QMainWindow, QWidget
from PySide6.QtCore import Qt

from .overlay_manager import OverlayManager
from .game_detector import GameDetector
from .hotkey_manager import HotkeyManager
from .event_coordinator import EventCoordinator
from .window_manager import WindowManager
from ..ui.panel_factory import PanelFactory
from ..ui.workspace_manager import WorkspaceManager
from ..ui.overlay_ui_manager import OverlayUIManager
from ..services.rf4s_service import RF4SService


class OverlayApplication(QMainWindow):
    """Core overlay application class"""
    
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
        
        # Initialize event coordinator
        self.event_coordinator = EventCoordinator(
            self, self.overlay_manager, self.game_detector, 
            self.hotkey_manager, self.rf4s_service
        )
        
    def initialize_ui(self):
        """Initialize the user interface"""
        self.ui_manager.setup_theme()
        self.setWindowTitle("RF4S Overlay")
        self.resize(1200, 800)
        
        # Create main layout
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        self.ui_manager.create_main_layout(central_widget)
        
    def setup_window_properties(self):
        """Setup window properties for overlay behavior"""
        self.window_manager.setup_window_properties()
        self.window_manager.set_window_opacity(0.9)
        self.overlay_manager.set_always_on_top(True)
        
    def get_managers(self):
        """Get all manager instances for external access"""
        return {
            'overlay_manager': self.overlay_manager,
            'game_detector': self.game_detector,
            'hotkey_manager': self.hotkey_manager,
            'rf4s_service': self.rf4s_service,
            'window_manager': self.window_manager,
            'panel_factory': self.panel_factory,
            'workspace_manager': self.workspace_manager,
            'ui_manager': self.ui_manager,
            'event_coordinator': self.event_coordinator
        }
        
    def cleanup(self):
        """Cleanup application resources"""
        self.event_coordinator.cleanup()
