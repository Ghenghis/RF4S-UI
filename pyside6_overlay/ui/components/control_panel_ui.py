
"""
Control Panel UI Component - Manages main overlay controls
"""

from PySide6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout
from PySide6.QtCore import Qt, QObject, Signal

from qfluentwidgets import (
    BodyLabel, Slider, PushButton, ToggleButton, SimpleCardWidget
)


class ControlPanelUI(QObject):
    """Manages the main control panel UI"""
    
    # UI element signals
    opacity_changed = Signal(int)
    mode_toggled = Signal(bool)
    attachment_toggled = Signal(bool)
    emergency_stop_clicked = Signal()
    reset_position_clicked = Signal()
    
    def __init__(self, parent_window):
        super().__init__()
        self.parent_window = parent_window
        
        # UI components
        self.opacity_slider = None
        self.mode_toggle = None
        self.attach_toggle = None
        self.emergency_stop_btn = None
        self.reset_position_btn = None
        
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
