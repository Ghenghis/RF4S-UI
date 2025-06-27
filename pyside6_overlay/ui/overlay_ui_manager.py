
"""
Overlay UI Manager - Coordinates UI components and manages layout
"""

from PySide6.QtWidgets import QWidget, QVBoxLayout
from PySide6.QtCore import QObject, Signal, QTimer

from qfluentwidgets import setTheme, Theme, setThemeColor

from ui.workspace_manager import WorkspaceManager
from .components.header_ui import HeaderUI
from .components.control_panel_ui import ControlPanelUI
from .components.rf4s_control_ui import RF4SControlUI
from .components.status_bar_ui import StatusBarUI


class OverlayUIManager(QObject):
    """Coordinates UI components and manages overall layout"""
    
    # Forward UI component signals
    opacity_changed = Signal(int)
    mode_toggled = Signal(bool)
    attachment_toggled = Signal(bool)
    emergency_stop_clicked = Signal()
    reset_position_clicked = Signal()
    
    # Forward RF4S control signals
    start_fishing_clicked = Signal()
    stop_fishing_clicked = Signal()
    detection_settings_changed = Signal(dict)
    automation_settings_changed = Signal(dict)
    fishing_mode_changed = Signal(str)
    
    def __init__(self, parent_window, workspace_manager: WorkspaceManager):
        super().__init__()
        self.parent_window = parent_window
        self.workspace_manager = workspace_manager
        
        # Initialize UI components
        self.header_ui = HeaderUI(parent_window)
        self.control_panel_ui = ControlPanelUI(parent_window)
        self.rf4s_control_ui = RF4SControlUI(parent_window)
        self.status_bar_ui = StatusBarUI(parent_window)
        
        # Connect component signals
        self.setup_signal_forwarding()
        
        # Data update timer
        self.ui_update_timer = QTimer()
        self.ui_update_timer.timeout.connect(self.refresh_ui_data)
        self.ui_update_timer.start(1000)  # Update UI every second
        
    def setup_signal_forwarding(self):
        """Setup signal forwarding from components"""
        # Control panel signals
        self.control_panel_ui.opacity_changed.connect(self.opacity_changed.emit)
        self.control_panel_ui.mode_toggled.connect(self.mode_toggled.emit)
        self.control_panel_ui.attachment_toggled.connect(self.attachment_toggled.emit)
        self.control_panel_ui.emergency_stop_clicked.connect(self.emergency_stop_clicked.emit)
        self.control_panel_ui.reset_position_clicked.connect(self.reset_position_clicked.emit)
        
        # RF4S control signals
        self.rf4s_control_ui.start_fishing_clicked.connect(self.start_fishing_clicked.emit)
        self.rf4s_control_ui.stop_fishing_clicked.connect(self.stop_fishing_clicked.emit)
        self.rf4s_control_ui.detection_settings_changed.connect(self.detection_settings_changed.emit)
        self.rf4s_control_ui.automation_settings_changed.connect(self.automation_settings_changed.emit)
        self.rf4s_control_ui.fishing_mode_changed.connect(self.fishing_mode_changed.emit)
        
    def setup_theme(self):
        """Setup application theme"""
        try:
            setTheme(Theme.DARK)
            setThemeColor('#0078d4')  # Microsoft Blue color
        except Exception as e:
            print(f"Warning: Could not set theme - {e}")
            
    def create_main_layout(self, central_widget: QWidget) -> QVBoxLayout:
        """Create the main layout structure"""
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(10, 10, 10, 10)
        
        # Create all sections using components
        self.header_ui.create_header_section(main_layout)
        self.control_panel_ui.create_control_panel(main_layout)
        self.rf4s_control_ui.create_rf4s_control_panel(main_layout)
        
        # Add workspace
        workspace_widget = self.workspace_manager.create_workspace()
        main_layout.addWidget(workspace_widget, 1)
        
        self.status_bar_ui.create_status_bar(main_layout)
        
        return main_layout
        
    def refresh_ui_data(self):
        """Refresh UI with real data - called by timer"""
        # This would normally get real data from RF4S service
        # For now, we'll emit signals to request fresh data
        pass
        
    # Status update methods - forward to appropriate components
    def update_game_status(self, connected: bool):
        """Update game connection status"""
        self.header_ui.update_game_status(connected)
            
    def update_rf4s_status(self, online: bool):
        """Update RF4S service status"""
        self.header_ui.update_rf4s_status(online)
            
    def update_mode_status(self, mode: str):
        """Update mode indicator"""
        self.header_ui.update_mode_status(mode)
        
    def update_position_info(self, x: int, y: int):
        """Update position information"""
        self.status_bar_ui.update_position_info(x, y)
        
    def update_size_info(self, width: int, height: int):
        """Update size information"""
        self.status_bar_ui.update_size_info(width, height)
        
    def update_mode_toggle_text(self, mode: str):
        """Update mode toggle button text"""
        self.control_panel_ui.update_mode_toggle_text(mode)
            
    def update_attach_toggle_text(self, attached: bool):
        """Update attachment toggle button text"""
        self.control_panel_ui.update_attach_toggle_text(attached)
            
    def update_session_stats(self, stats: dict):
        """Update session statistics with real data"""
        self.header_ui.update_session_stats(stats)
            
    def update_bot_status(self, running: bool):
        """Update bot control buttons based on status"""
        self.rf4s_control_ui.update_bot_status(running)
        
    def update_detection_settings(self, settings: dict):
        """Update detection settings display"""
        self.rf4s_control_ui.update_detection_settings(settings)
            
    def update_automation_settings(self, settings: dict):
        """Update automation settings display"""
        self.rf4s_control_ui.update_automation_settings(settings)
