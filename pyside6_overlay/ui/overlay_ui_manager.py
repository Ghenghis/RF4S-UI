
"""
Overlay UI Manager - Manages UI updates and coordination
"""

from PySide6.QtCore import QObject, Signal
from PySide6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout, QPushButton, QLabel, QSlider
from PySide6.QtCore import Qt

from qfluentwidgets import (
    CardWidget, PushButton, Slider, TogglePushButton, 
    BodyLabel, StrongBodyLabel, setTheme, Theme
)


class OverlayUIManager(QObject):
    """Manages UI updates and coordination"""
    
    # UI interaction signals
    opacity_changed = Signal(int)
    mode_toggled = Signal(bool)
    attachment_toggled = Signal(bool)
    emergency_stop_clicked = Signal()
    reset_position_clicked = Signal()
    start_fishing_clicked = Signal()
    stop_fishing_clicked = Signal()
    detection_settings_changed = Signal(dict)
    automation_settings_changed = Signal(dict)
    fishing_mode_changed = Signal(str)
    
    def __init__(self, main_window, workspace_manager):
        super().__init__()
        self.main_window = main_window
        self.workspace_manager = workspace_manager
        self.current_theme = "dark"
        
    def setup_theme(self):
        """Setup application theme"""
        setTheme(Theme.DARK)
        
    def create_main_layout(self, central_widget: QWidget):
        """Create the main layout"""
        layout = QVBoxLayout(central_widget)
        layout.setContentsMargins(10, 10, 10, 10)
        
        # Create header
        header_widget = self.create_header_widget()
        layout.addWidget(header_widget)
        
        # Add workspace
        workspace_widget = self.workspace_manager.create_workspace()
        layout.addWidget(workspace_widget)
        
        # Create footer
        footer_widget = self.create_footer_widget()
        layout.addWidget(footer_widget)
        
    def create_header_widget(self) -> QWidget:
        """Create header widget with controls"""
        header = CardWidget()
        layout = QHBoxLayout(header)
        
        # Title
        title = StrongBodyLabel("RF4S Control Panel")
        layout.addWidget(title)
        
        layout.addStretch()
        
        # Opacity control
        opacity_label = BodyLabel("Opacity:")
        layout.addWidget(opacity_label)
        
        self.opacity_slider = Slider(Qt.Orientation.Horizontal)
        self.opacity_slider.setMinimum(30)
        self.opacity_slider.setMaximum(100)
        self.opacity_slider.setValue(90)
        self.opacity_slider.setFixedWidth(100)
        self.opacity_slider.valueChanged.connect(self.opacity_changed.emit)
        layout.addWidget(self.opacity_slider)
        
        # Mode toggle
        self.mode_toggle = TogglePushButton("Interactive")
        self.mode_toggle.setChecked(True)
        self.mode_toggle.toggled.connect(self.mode_toggled.emit)
        layout.addWidget(self.mode_toggle)
        
        # Attachment toggle
        self.attachment_toggle = TogglePushButton("Attached")
        self.attachment_toggle.setChecked(True)
        self.attachment_toggle.toggled.connect(self.attachment_toggled.emit)
        layout.addWidget(self.attachment_toggle)
        
        return header
        
    def create_footer_widget(self) -> QWidget:
        """Create footer widget with status"""
        footer = CardWidget()
        layout = QHBoxLayout(footer)
        
        # Status labels
        self.game_status_label = BodyLabel("Game: Disconnected")
        layout.addWidget(self.game_status_label)
        
        self.rf4s_status_label = BodyLabel("RF4S: Disconnected")
        layout.addWidget(self.rf4s_status_label)
        
        layout.addStretch()
        
        # Control buttons
        emergency_button = PushButton("Emergency Stop")
        emergency_button.clicked.connect(self.emergency_stop_clicked.emit)
        layout.addWidget(emergency_button)
        
        reset_button = PushButton("Reset Position")
        reset_button.clicked.connect(self.reset_position_clicked.emit)
        layout.addWidget(reset_button)
        
        return footer
        
    # Update methods for real-time data
    def update_game_status(self, connected: bool):
        """Update game connection status"""
        status = "Connected" if connected else "Disconnected"
        self.game_status_label.setText(f"Game: {status}")
        
    def update_rf4s_status(self, connected: bool):
        """Update RF4S connection status"""
        status = "Connected" if connected else "Disconnected"
        self.rf4s_status_label.setText(f"RF4S: {status}")
        
    def update_mode_status(self, mode: str):
        """Update mode status"""
        self.mode_toggle.setText(mode.title())
        
    def update_position_info(self, x: int, y: int):
        """Update position information"""
        pass  # Could update a position display if needed
        
    def update_size_info(self, width: int, height: int):
        """Update size information"""
        pass  # Could update a size display if needed
        
    def update_mode_toggle_text(self, mode: str):
        """Update mode toggle text"""
        self.mode_toggle.setText(mode.title())
        
    def update_attach_toggle_text(self, attached: bool):
        """Update attachment toggle text"""
        text = "Attached" if attached else "Detached"
        self.attachment_toggle.setText(text)
        
    # Panel-specific update methods
    def update_session_stats(self, stats: dict):
        """Update session statistics in panels"""
        # Forward to workspace manager to update relevant panels
        self.workspace_manager.update_panel_data('session_stats', stats)
        
    def update_bot_status(self, running: bool):
        """Update bot status in panels"""
        self.workspace_manager.update_panel_data('rf4s_control', {'running': running})
        
    def update_detection_settings(self, settings: dict):
        """Update detection settings in panels"""
        self.workspace_manager.update_panel_data('detection_settings', settings)
        
    def update_automation_settings(self, settings: dict):
        """Update automation settings in panels"""
        self.workspace_manager.update_panel_data('automation_settings', settings)
