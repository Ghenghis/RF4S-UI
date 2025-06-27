
"""
RF4S Control UI Component - Manages RF4S bot control interface
"""

from PySide6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout
from PySide6.QtCore import Qt, QObject, Signal

from qfluentwidgets import (
    BodyLabel, Slider, PushButton, CheckBox, ComboBox, SimpleCardWidget
)


class RF4SControlUI(QObject):
    """Manages RF4S bot control interface"""
    
    # Real RF4S control signals
    start_fishing_clicked = Signal()
    stop_fishing_clicked = Signal()
    detection_settings_changed = Signal(dict)
    automation_settings_changed = Signal(dict)
    fishing_mode_changed = Signal(str)
    
    def __init__(self, parent_window):
        super().__init__()
        self.parent_window = parent_window
        
        # RF4S control components
        self.start_fishing_btn = None
        self.stop_fishing_btn = None
        self.fishing_mode_combo = None
        self.detection_sensitivity_slider = None
        self.automation_enabled_checkbox = None
        
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
        
    def on_detection_sensitivity_changed(self, value: int):
        """Handle detection sensitivity change"""
        settings = {'sensitivity': value}
        self.detection_settings_changed.emit(settings)
        
    def on_automation_toggled(self, checked: bool):
        """Handle automation toggle"""
        settings = {'enabled': checked}
        self.automation_settings_changed.emit(settings)
        
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
