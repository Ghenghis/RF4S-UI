
"""
Overlay UI Manager - Handles all UI creation and layout with real data connections
"""

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QSlider, 
    QPushButton, QCheckBox, QFrame, QScrollArea, QSizePolicy, QSpacerItem
)
from PySide6.QtCore import Qt, Signal, QObject, QTimer
from PySide6.QtGui import QFont, QPalette, QColor

from qfluentwidgets import (
    SubtitleLabel, BodyLabel, Slider, PushButton,
    CheckBox, ToggleButton, CommandBar, Action,
    setTheme, Theme, setThemeColor,
    CardWidget, HeaderCardWidget, SimpleCardWidget,
    SpinBox, ComboBox, LineEdit
)

from ui.workspace_manager import WorkspaceManager


class OverlayUIManager(QObject):
    """Manages all UI creation and layout for the overlay with real data"""
    
    # UI element signals
    opacity_changed = Signal(int)
    mode_toggled = Signal(bool)
    attachment_toggled = Signal(bool)
    emergency_stop_clicked = Signal()
    reset_position_clicked = Signal()
    
    # Real RF4S control signals
    start_fishing_clicked = Signal()
    stop_fishing_clicked = Signal()
    detection_settings_changed = Signal(dict)
    automation_settings_changed = Signal(dict)
    fishing_mode_changed = Signal(str)
    
    def __init__(self, parent_window, workspace_manager: WorkspaceManager):
        super().__init__()
        self.parent_window = parent_window
        self.workspace_manager = workspace_manager
        
        # UI components
        self.game_status_label = None
        self.rf4s_status_label = None
        self.mode_label = None
        self.opacity_slider = None
        self.mode_toggle = None
        self.attach_toggle = None
        self.emergency_stop_btn = None
        self.reset_position_btn = None
        self.position_label = None
        self.size_label = None
        
        # RF4S control components
        self.start_fishing_btn = None
        self.stop_fishing_btn = None
        self.fishing_mode_combo = None
        self.fish_count_label = None
        self.session_time_label = None
        self.detection_sensitivity_slider = None
        self.automation_enabled_checkbox = None
        
        # Data update timer
        self.ui_update_timer = QTimer()
        self.ui_update_timer.timeout.connect(self.refresh_ui_data)
        self.ui_update_timer.start(1000)  # Update UI every second
        
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
        
        # Create all sections
        self.create_header_section(main_layout)
        self.create_control_panel(main_layout)
        self.create_rf4s_control_panel(main_layout)
        
        # Add workspace
        workspace_widget = self.workspace_manager.create_workspace()
        main_layout.addWidget(workspace_widget, 1)
        
        self.create_status_bar(main_layout)
        
        return main_layout
        
    def create_header_section(self, parent_layout):
        """Create the header section with branding and real status"""
        header_card = HeaderCardWidget(self.parent_window)
        header_card.setTitle("RF4S Game Overlay")
        header_card.setContent("Russian Fishing 4 Bot Control Interface")
        
        # Create a container for the header content
        header_container = QWidget()
        header_layout = QVBoxLayout(header_container)
        
        # Add the header card
        header_layout.addWidget(header_card)
        
        # Status indicators with real data
        status_widget = QWidget()
        status_layout = QHBoxLayout(status_widget)
        
        # Game connection status
        self.game_status_label = BodyLabel("Game: Disconnected")
        self.game_status_label.setStyleSheet("color: #ff4757;")
        status_layout.addWidget(self.game_status_label)
        
        # RF4S service status
        self.rf4s_status_label = BodyLabel("RF4S: Offline")
        self.rf4s_status_label.setStyleSheet("color: #ff4757;")
        status_layout.addWidget(self.rf4s_status_label)
        
        # Mode indicator
        self.mode_label = BodyLabel("Mode: Interactive")
        self.mode_label.setStyleSheet("color: #2ed573;")
        status_layout.addWidget(self.mode_label)
        
        # Session info with real data
        self.session_time_label = BodyLabel("Session: 00:00:00")
        self.session_time_label.setStyleSheet("color: #5352ed;")
        status_layout.addWidget(self.session_time_label)
        
        self.fish_count_label = BodyLabel("Fish: 0")
        self.fish_count_label.setStyleSheet("color: #00d2d3;")
        status_layout.addWidget(self.fish_count_label)
        
        status_layout.addStretch()
        header_layout.addWidget(status_widget)
        
        parent_layout.addWidget(header_container)
        
    def create_control_panel(self, parent_layout):
        """Create the main control panel"""
        control_card = SimpleCardWidget(self.parent_window)
        control_layout = QHBoxLayout(control_card)
        
        # Opacity control
        opacity_group = QVBoxLayout()
        opacity_label = BodyLabel("Opacity")
        self.opacity_slider = Slider(Qt.Orientation.Horizontal)
        self.opacity_slider.setRange(10, 100)
        self.opacity_slider.setValue(90)
        self.opacity_slider.valueChanged.connect(self.opacity_changed.emit)
        
        opacity_group.addWidget(opacity_label)
        opacity_group.addWidget(self.opacity_slider)
        control_layout.addLayout(opacity_group)
        
        # Mode toggle
        mode_group = QVBoxLayout()
        mode_label = BodyLabel("Interaction Mode")
        self.mode_toggle = ToggleButton()
        self.mode_toggle.setText("Interactive")
        self.mode_toggle.setChecked(True)
        self.mode_toggle.toggled.connect(self.mode_toggled.emit)
        
        mode_group.addWidget(mode_label)
        mode_group.addWidget(self.mode_toggle)
        control_layout.addLayout(mode_group)
        
        # Attachment control
        attach_group = QVBoxLayout()
        attach_label = BodyLabel("Window Attachment")
        self.attach_toggle = ToggleButton()
        self.attach_toggle.setText("Auto-Attach")
        self.attach_toggle.setChecked(True)
        self.attach_toggle.toggled.connect(self.attachment_toggled.emit)
        
        attach_group.addWidget(attach_label)
        attach_group.addWidget(self.attach_toggle)
        control_layout.addLayout(attach_group)
        
        # Quick actions
        actions_group = QVBoxLayout()
        actions_label = BodyLabel("Quick Actions")
        
        self.emergency_stop_btn = PushButton("Emergency Stop")
        self.emergency_stop_btn.setStyleSheet("background-color: #ff4757;")
        self.emergency_stop_btn.clicked.connect(self.emergency_stop_clicked.emit)
        
        self.reset_position_btn = PushButton("Reset Position")
        self.reset_position_btn.clicked.connect(self.reset_position_clicked.emit)
        
        actions_group.addWidget(actions_label)
        actions_group.addWidget(self.emergency_stop_btn)
        actions_group.addWidget(self.reset_position_btn)
        control_layout.addLayout(actions_group)
        
        parent_layout.addWidget(control_card)
        
    def create_rf4s_control_panel(self, parent_layout):
        """Create RF4S bot control panel with real functionality"""
        rf4s_card = SimpleCardWidget(self.parent_window)
        rf4s_layout = QHBoxLayout(rf4s_card)
        
        # Bot control
        bot_control_group = QVBoxLayout()
        bot_control_label = BodyLabel("Bot Control")
        
        self.start_fishing_btn = PushButton("Start Fishing")
        self.start_fishing_btn.setStyleSheet("background-color: #2ed573;")
        self.start_fishing_btn.clicked.connect(self.start_fishing_clicked.emit)
        
        self.stop_fishing_btn = PushButton("Stop Fishing")
        self.stop_fishing_btn.setStyleSheet("background-color: #ff4757;")
        self.stop_fishing_btn.clicked.connect(self.stop_fishing_clicked.emit)
        
        bot_control_group.addWidget(bot_control_label)
        bot_control_group.addWidget(self.start_fishing_btn)
        bot_control_group.addWidget(self.stop_fishing_btn)
        rf4s_layout.addLayout(bot_control_group)
        
        # Fishing mode
        mode_group = QVBoxLayout()
        mode_label = BodyLabel("Fishing Mode")
        self.fishing_mode_combo = ComboBox()
        self.fishing_mode_combo.addItems(['Float', 'Bottom', 'Spinning', 'Match'])
        self.fishing_mode_combo.currentTextChanged.connect(self.fishing_mode_changed.emit)
        
        mode_group.addWidget(mode_label)
        mode_group.addWidget(self.fishing_mode_combo)
        rf4s_layout.addLayout(mode_group)
        
        # Detection settings
        detection_group = QVBoxLayout()
        detection_label = BodyLabel("Detection Sensitivity")
        self.detection_sensitivity_slider = Slider(Qt.Orientation.Horizontal)
        self.detection_sensitivity_slider.setRange(1, 100)
        self.detection_sensitivity_slider.setValue(50)
        self.detection_sensitivity_slider.valueChanged.connect(self.on_detection_sensitivity_changed)
        
        detection_group.addWidget(detection_label)
        detection_group.addWidget(self.detection_sensitivity_slider)
        rf4s_layout.addLayout(detection_group)
        
        # Automation settings
        automation_group = QVBoxLayout()
        automation_label = BodyLabel("Automation")
        self.automation_enabled_checkbox = CheckBox("Enable Auto-Fishing")
        self.automation_enabled_checkbox.toggled.connect(self.on_automation_toggled)
        
        automation_group.addWidget(automation_label)
        automation_group.addWidget(self.automation_enabled_checkbox)
        rf4s_layout.addLayout(automation_group)
        
        parent_layout.addWidget(rf4s_card)
        
    def create_status_bar(self, parent_layout):
        """Create the status bar with real data"""
        status_card = SimpleCardWidget(self.parent_window)
        status_layout = QHBoxLayout(status_card)
        
        # Position info
        self.position_label = BodyLabel("Position: (0, 0)")
        status_layout.addWidget(self.position_label)
        
        # Size info
        self.size_label = BodyLabel("Size: 1200x800")
        status_layout.addWidget(self.size_label)
        
        # Hotkey hint
        hotkey_label = BodyLabel("Hotkey: Ctrl+M (Toggle Mode)")
        hotkey_label.setStyleSheet("color: #747d8c;")
        status_layout.addWidget(hotkey_label)
        
        status_layout.addStretch()
        parent_layout.addWidget(status_card)
    
    # Real data event handlers
    def on_detection_sensitivity_changed(self, value: int):
        """Handle detection sensitivity change"""
        settings = {'sensitivity': value}
        self.detection_settings_changed.emit(settings)
        
    def on_automation_toggled(self, checked: bool):
        """Handle automation toggle"""
        settings = {'enabled': checked}
        self.automation_settings_changed.emit(settings)
        
    def refresh_ui_data(self):
        """Refresh UI with real data - called by timer"""
        # This would normally get real data from RF4S service
        # For now, we'll emit signals to request fresh data
        pass
        
    # Status update methods with real data
    def update_game_status(self, connected: bool):
        """Update game connection status"""
        if connected:
            self.game_status_label.setText("Game: Connected")
            self.game_status_label.setStyleSheet("color: #2ed573;")
        else:
            self.game_status_label.setText("Game: Disconnected")
            self.game_status_label.setStyleSheet("color: #ff4757;")
            
    def update_rf4s_status(self, online: bool):
        """Update RF4S service status"""
        if online:
            self.rf4s_status_label.setText("RF4S: Online")
            self.rf4s_status_label.setStyleSheet("color: #2ed573;")
        else:
            self.rf4s_status_label.setText("RF4S: Offline")
            self.rf4s_status_label.setStyleSheet("color: #ff4757;")
            
    def update_mode_status(self, mode: str):
        """Update mode indicator"""
        self.mode_label.setText(f"Mode: {mode.title()}")
        
    def update_position_info(self, x: int, y: int):
        """Update position information"""
        self.position_label.setText(f"Position: ({x}, {y})")
        
    def update_size_info(self, width: int, height: int):
        """Update size information"""
        self.size_label.setText(f"Size: {width}x{height}")
        
    def update_mode_toggle_text(self, mode: str):
        """Update mode toggle button text"""
        if mode == 'interactive':
            self.mode_toggle.setText("Interactive")
        else:
            self.mode_toggle.setText("Click-Through")
            
    def update_attach_toggle_text(self, attached: bool):
        """Update attachment toggle button text"""
        if attached:
            self.attach_toggle.setText("Auto-Attach")
        else:
            self.attach_toggle.setText("Free-Float")
            
    def update_session_stats(self, stats: dict):
        """Update session statistics with real data"""
        if 'session_time' in stats:
            self.session_time_label.setText(f"Session: {stats['session_time']}")
        if 'fish_caught' in stats:
            self.fish_count_label.setText(f"Fish: {stats['fish_caught']}")
            
    def update_bot_status(self, running: bool):
        """Update bot control buttons based on status"""
        self.start_fishing_btn.setEnabled(not running)
        self.stop_fishing_btn.setEnabled(running)
        
    def update_detection_settings(self, settings: dict):
        """Update detection settings display"""
        if 'sensitivity' in settings:
            self.detection_sensitivity_slider.setValue(settings['sensitivity'])
            
    def update_automation_settings(self, settings: dict):
        """Update automation settings display"""
        if 'enabled' in settings:
            self.automation_enabled_checkbox.setChecked(settings['enabled'])
