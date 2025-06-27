
"""
Core Panel Creator - Creates main application panels
"""

from PySide6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout
from PySide6.QtCore import Qt, QObject

from qfluentwidgets import (
    SubtitleLabel, BodyLabel, SimpleCardWidget,
    PushButton, CheckBox, Slider, ComboBox,
    ProgressBar
)

from typing import Optional


class CorePanelCreator(QObject):
    """Creates core application panels"""
    
    def __init__(self):
        super().__init__()
        
    def create_script_control_panel(self) -> QWidget:
        """Create bot control panel"""
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        
        # Title
        title = SubtitleLabel("Bot Control")
        layout.addWidget(title)
        
        # Control buttons
        start_btn = PushButton("Start Fishing")
        start_btn.setStyleSheet("background-color: #2ed573; color: white;")
        layout.addWidget(start_btn)
        
        stop_btn = PushButton("Stop Fishing")  
        stop_btn.setStyleSheet("background-color: #ff4757; color: white;")
        layout.addWidget(stop_btn)
        
        emergency_btn = PushButton("Emergency Stop")
        emergency_btn.setStyleSheet("background-color: #ff3742; color: white;")
        layout.addWidget(emergency_btn)
        
        # Status display
        status_label = BodyLabel("Status: Idle")
        layout.addWidget(status_label)
        
        layout.addStretch()
        return panel
        
    def create_fishing_profiles_panel(self) -> QWidget:
        """Create fishing profiles panel"""
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        
        title = SubtitleLabel("Fishing Profiles")
        layout.addWidget(title)
        
        # Profile selector
        profile_combo = ComboBox()
        profile_combo.addItems(['Float Fishing', 'Bottom Fishing', 'Spinning', 'Match Rod'])
        layout.addWidget(profile_combo)
        
        # Profile actions
        load_btn = PushButton("Load Profile")
        save_btn = PushButton("Save Profile")
        
        button_layout = QHBoxLayout()
        button_layout.addWidget(load_btn)
        button_layout.addWidget(save_btn)
        layout.addLayout(button_layout)
        
        layout.addStretch()
        return panel
        
    def create_system_monitor_panel(self) -> QWidget:
        """Create system monitor panel"""
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        
        title = SubtitleLabel("System Monitor")
        layout.addWidget(title)
        
        # CPU usage
        cpu_label = BodyLabel("CPU Usage:")
        cpu_progress = ProgressBar()
        cpu_progress.setValue(45)
        layout.addWidget(cpu_label)
        layout.addWidget(cpu_progress)
        
        # Memory usage
        memory_label = BodyLabel("Memory Usage:")
        memory_progress = ProgressBar()
        memory_progress.setValue(60)
        layout.addWidget(memory_label)
        layout.addWidget(memory_progress)
        
        # Game FPS
        fps_label = BodyLabel("Game FPS: 60")
        layout.addWidget(fps_label)
        
        layout.addStretch()
        return panel
        
    def create_detection_settings_panel(self) -> QWidget:
        """Create detection settings panel"""
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        
        title = SubtitleLabel("Detection Settings")
        layout.addWidget(title)
        
        # Sensitivity slider
        sensitivity_label = BodyLabel("Detection Sensitivity:")
        sensitivity_slider = Slider(Qt.Orientation.Horizontal)
        sensitivity_slider.setRange(1, 100)
        sensitivity_slider.setValue(75)
        layout.addWidget(sensitivity_label)
        layout.addWidget(sensitivity_slider)
        
        # Detection types
        rod_tip_check = CheckBox("Rod Tip Detection")
        rod_tip_check.setChecked(True)
        float_check = CheckBox("Float Detection")
        float_check.setChecked(True)
        
        layout.addWidget(rod_tip_check)
        layout.addWidget(float_check)
        
        layout.addStretch()
        return panel
