
# Specific Panel Implementations Guide

## Custom Widgets for Panels

### Custom Slider Widget

```python
# ui/components/widgets/custom_slider.py
from PySide6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout, QLabel, QSlider
from PySide6.QtCore import Qt, pyqtSignal
from PySide6.QtGui import QPainter, QColor, QLinearGradient

class CustomSlider(QWidget):
    valueChanged = pyqtSignal(float)
    
    def __init__(self, label="", min_val=0.0, max_val=1.0, step=0.01, value=0.5, unit=""):
        super().__init__()
        self.min_val = min_val
        self.max_val = max_val
        self.step = step
        self.current_value = value
        self.unit = unit
        self.setup_ui(label)
    
    def setup_ui(self, label):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(4)
        
        # Header with label and value
        if label:
            header_layout = QHBoxLayout()
            
            # Label
            label_widget = QLabel(label)
            label_widget.setStyleSheet("color: #D1D5DB; font-size: 11px;")
            header_layout.addWidget(label_widget)
            
            # Value display
            self.value_label = QLabel(f"{self.current_value}{self.unit}")
            self.value_label.setStyleSheet("""
                QLabel {
                    color: #3B82F6;
                    font-family: monospace;
                    font-size: 11px;
                    font-weight: bold;
                }
            """)
            header_layout.addWidget(self.value_label)
            header_layout.addStretch()
            
            layout.addLayout(header_layout)
        
        # Slider
        self.slider = QSlider(Qt.Horizontal)
        self.slider.setMinimum(0)
        self.slider.setMaximum(int((self.max_val - self.min_val) / self.step))
        self.slider.setValue(int((self.current_value - self.min_val) / self.step))
        
        self.slider.setStyleSheet("""
            QSlider::groove:horizontal {
                border: none;
                height: 4px;
                background: #374151;
                border-radius: 2px;
            }
            QSlider::handle:horizontal {
                background: #3B82F6;
                border: 2px solid #FFFFFF;
                width: 16px;
                height: 16px;
                border-radius: 8px;
                margin: -6px 0;
            }
            QSlider::handle:horizontal:hover {
                background: #2563EB;
            }
            QSlider::sub-page:horizontal {
                background: #3B82F6;
                border-radius: 2px;
            }
        """)
        
        self.slider.valueChanged.connect(self.on_slider_changed)
        layout.addWidget(self.slider)
    
    def on_slider_changed(self, value):
        self.current_value = self.min_val + (value * self.step)
        if hasattr(self, 'value_label'):
            self.value_label.setText(f"{self.current_value:.2f}{self.unit}")
        self.valueChanged.emit(self.current_value)
    
    def set_value(self, value):
        self.current_value = value
        self.slider.setValue(int((value - self.min_val) / self.step))
        if hasattr(self, 'value_label'):
            self.value_label.setText(f"{value:.2f}{self.unit}")

class ToggleSwitch(QWidget):
    toggled = pyqtSignal(bool)
    
    def __init__(self, label="", description="", checked=False):
        super().__init__()
        self.checked = checked
        self.setup_ui(label, description)
    
    def setup_ui(self, label, description):
        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        
        # Switch
        self.switch = QPushButton()
        self.switch.setFixedSize(32, 18)
        self.switch.setCheckable(True)
        self.switch.setChecked(self.checked)
        self.switch.clicked.connect(self.on_toggle)
        
        self.update_switch_style()
        layout.addWidget(self.switch)
        
        # Labels
        if label or description:
            label_layout = QVBoxLayout()
            label_layout.setSpacing(2)
            
            if label:
                label_widget = QLabel(label)
                label_widget.setStyleSheet("color: #D1D5DB; font-size: 11px; font-weight: 500;")
                label_layout.addWidget(label_widget)
            
            if description:
                desc_widget = QLabel(description)
                desc_widget.setStyleSheet("color: #6B7280; font-size: 10px;")
                label_layout.addWidget(desc_widget)
            
            layout.addLayout(label_layout)
        
        layout.addStretch()
    
    def update_switch_style(self):
        if self.switch.isChecked():
            self.switch.setStyleSheet("""
                QPushButton {
                    background-color: #3B82F6;
                    border: none;
                    border-radius: 9px;
                }
                QPushButton::indicator {
                    width: 14px;
                    height: 14px;
                    border-radius: 7px;
                    background-color: white;
                    margin: 2px;
                    margin-left: 16px;
                }
            """)
        else:
            self.switch.setStyleSheet("""
                QPushButton {
                    background-color: #6B7280;
                    border: none;
                    border-radius: 9px;
                }
                QPushButton::indicator {
                    width: 14px;
                    height: 14px;
                    border-radius: 7px;
                    background-color: white;
                    margin: 2px;
                }
            """)
    
    def on_toggle(self, checked):
        self.checked = checked
        self.update_switch_style()
        self.toggled.emit(checked)
    
    def set_checked(self, checked):
        self.checked = checked
        self.switch.setChecked(checked)
        self.update_switch_style()
```

## Panel Implementations

### Script Control Panel

```python
# ui/components/panels/script_control_panel.py
from PySide6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel, 
                               QPushButton, QProgressBar, QTextEdit)
from PySide6.QtCore import Qt, QTimer
from PySide6.QtGui import QFont
from qfluentwidgets import CardWidget, PushButton, ProgressBar
from .base_panel import BasePanel
from ..widgets.custom_slider import ToggleSwitch

class ScriptControlPanel(BasePanel):
    def __init__(self, state_manager):
        super().__init__("Script Control", state_manager, "play")
        self.script_running = False
        self.setup_timer()
    
    def setup_content(self):
        # Control buttons section
        control_card = self.create_control_section()
        self.add_section("Controls", control_card)
        
        self.add_separator()
        
        # Status section
        status_card = self.create_status_section()
        self.add_section("Status", status_card)
        
        self.add_separator()
        
        # Settings section
        settings_card = self.create_settings_section()
        self.add_section("Settings", settings_card)
        
        self.content_layout.addStretch()
    
    def create_control_section(self):
        card = CardWidget()
        card.setStyleSheet("""
            CardWidget {
                background-color: #1F2937;
                border: 1px solid #374151;
                border-radius: 8px;
                padding: 12px;
            }
        """)
        
        layout = QVBoxLayout(card)
        
        # Main control buttons
        button_layout = QHBoxLayout()
        
        self.start_button = PushButton("Start Script")
        self.start_button.setStyleSheet("""
            QPushButton {
                background-color: #10B981;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 8px 16px;
                font-weight: 600;
            }
            QPushButton:hover {
                background-color: #059669;
            }
            QPushButton:pressed {
                background-color: #047857;
            }
        """)
        self.start_button.clicked.connect(self.toggle_script)
        
        self.stop_button = PushButton("Stop Script")
        self.stop_button.setStyleSheet("""
            QPushButton {
                background-color: #EF4444;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 8px 16px;
                font-weight: 600;
            }
            QPushButton:hover {
                background-color: #DC2626;
            }
            QPushButton:pressed {
                background-color: #B91C1C;
            }
        """)
        self.stop_button.clicked.connect(self.stop_script)
        self.stop_button.setEnabled(False)
        
        button_layout.addWidget(self.start_button)
        button_layout.addWidget(self.stop_button)
        button_layout.addStretch()
        
        layout.addLayout(button_layout)
        
        # Progress bar
        self.progress_bar = ProgressBar()
        self.progress_bar.setStyleSheet("""
            QProgressBar {
                border: none;
                border-radius: 4px;
                background-color: #374151;
                text-align: center;
                color: white;
                font-size: 10px;
            }
            QProgressBar::chunk {
                background-color: #3B82F6;
                border-radius: 4px;
            }
        """)
        self.progress_bar.setVisible(False)
        layout.addWidget(self.progress_bar)
        
        return card
    
    def create_status_section(self):
        card = CardWidget()
        card.setStyleSheet("""
            CardWidget {
                background-color: #1F2937;
                border: 1px solid #374151;
                border-radius: 8px;
                padding: 12px;
            }
        """)
        
        layout = QVBoxLayout(card)
        
        # Status indicators
        status_layout = QVBoxLayout()
        
        self.status_items = {}
        status_data = [
            ("Script Status", "Stopped", "#6B7280"),
            ("Runtime", "00:00:00", "#3B82F6"),
            ("Actions Executed", "0", "#10B981"),
            ("Success Rate", "0%", "#F59E0B")
        ]
        
        for label, value, color in status_data:
            item = self.create_status_item(label, value, color)
            self.status_items[label] = item
            status_layout.addWidget(item)
        
        layout.addLayout(status_layout)
        return card
    
    def create_status_item(self, label, value, color):
        widget = QWidget()
        layout = QHBoxLayout(widget)
        layout.setContentsMargins(0, 0, 0, 0)
        
        label_widget = QLabel(label)
        label_widget.setStyleSheet("color: #D1D5DB; font-size: 11px;")
        
        value_widget = QLabel(value)
        value_widget.setStyleSheet(f"color: {color}; font-size: 11px; font-weight: 600;")
        
        layout.addWidget(label_widget)
        layout.addStretch()
        layout.addWidget(value_widget)
        
        widget.value_widget = value_widget
        return widget
    
    def create_settings_section(self):
        card = CardWidget()
        card.setStyleSheet("""
            CardWidget {
                background-color: #1F2937;
                border: 1px solid #374151;
                border-radius: 8px;
                padding: 12px;
            }
        """)
        
        layout = QVBoxLayout(card)
        
        # Auto-start toggle
        auto_start = ToggleSwitch("Auto-start on launch", "Automatically start script when application opens")
        layout.addWidget(auto_start)
        
        # Auto-restart toggle
        auto_restart = ToggleSwitch("Auto-restart on error", "Restart script automatically if it encounters an error")
        layout.addWidget(auto_restart)
        
        # Logging toggle
        logging_toggle = ToggleSwitch("Enable detailed logging", "Log all script actions for debugging")
        layout.addWidget(logging_toggle)
        
        return card
    
    def setup_timer(self):
        self.timer = QTimer()
        self.timer.timeout.connect(self.update_status)
        self.runtime_seconds = 0
    
    def toggle_script(self):
        if not self.script_running:
            self.start_script()
        else:
            self.stop_script()
    
    def start_script(self):
        self.script_running = True
        self.start_button.setText("Pause Script")
        self.stop_button.setEnabled(True)
        self.progress_bar.setVisible(True)
        
        # Update status
        self.status_items["Script Status"].value_widget.setText("Running")
        self.status_items["Script Status"].value_widget.setStyleSheet("color: #10B981; font-size: 11px; font-weight: 600;")
        
        # Start timer
        self.timer.start(1000)
        self.runtime_seconds = 0
    
    def stop_script(self):
        self.script_running = False
        self.start_button.setText("Start Script")
        self.stop_button.setEnabled(False)
        self.progress_bar.setVisible(False)
        
        # Update status
        self.status_items["Script Status"].value_widget.setText("Stopped")
        self.status_items["Script Status"].value_widget.setStyleSheet("color: #6B7280; font-size: 11px; font-weight: 600;")
        
        # Stop timer
        self.timer.stop()
    
    def update_status(self):
        if self.script_running:
            self.runtime_seconds += 1
            
            # Update runtime
            hours = self.runtime_seconds // 3600
            minutes = (self.runtime_seconds % 3600) // 60
            seconds = self.runtime_seconds % 60
            runtime_str = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            self.status_items["Runtime"].value_widget.setText(runtime_str)
```

### Detection Settings Panel

```python
# ui/components/panels/detection_settings_panel.py
from PySide6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout, QLabel
from qfluentwidgets import CardWidget
from .base_panel import BasePanel
from ..widgets.custom_slider import CustomSlider, ToggleSwitch

class DetectionSettingsPanel(BasePanel):
    def __init__(self, state_manager):
        super().__init__("Detection Settings", state_manager, "eye")
    
    def setup_content(self):
        # Confidence settings
        confidence_card = self.create_confidence_section()
        self.add_section("AI Confidence Thresholds", confidence_card)
        
        self.add_separator()
        
        # Feature toggles
        features_card = self.create_features_section()
        self.add_section("Detection Features", features_card)
        
        self.content_layout.addStretch()
    
    def create_confidence_section(self):
        card = CardWidget()
        card.setStyleSheet("""
            CardWidget {
                background-color: #1F2937;
                border: 1px solid #374151;
                border-radius: 8px;
                padding: 12px;
            }
        """)
        
        layout = QVBoxLayout(card)
        layout.setSpacing(8)
        
        # Confidence sliders
        sliders_data = [
            ("Spool", 0.1, 1.0, 0.01, 0.85),
            ("Bite", 0.1, 1.0, 0.01, 0.75),
            ("Rod Tip", 0.1, 1.0, 0.01, 0.80),
            ("OCR", 0.1, 1.0, 0.01, 0.70),
        ]
        
        for label, min_val, max_val, step, default in sliders_data:
            slider = CustomSlider(label, min_val, max_val, step, default)
            slider.valueChanged.connect(lambda val, l=label: self.on_confidence_changed(l, val))
            layout.addWidget(slider)
        
        return card
    
    def create_features_section(self):
        card = CardWidget()
        card.setStyleSheet("""
            CardWidget {
                background-color: #1F2937;
                border: 1px solid #374151;
                border-radius: 8px;
                padding: 12px;
            }
        """)
        
        layout = QVBoxLayout(card)
        layout.setSpacing(8)
        
        # Feature toggles
        snag_detection = ToggleSwitch("Snag Detection", "Detect when line is snagged", True)
        snag_detection.toggled.connect(lambda checked: self.on_feature_toggled("snag_detection", checked))
        layout.addWidget(snag_detection)
        
        image_verify = ToggleSwitch("Image Verification", "Verify catches with image analysis", False)
        image_verify.toggled.connect(lambda checked: self.on_feature_toggled("image_verification", checked))
        layout.addWidget(image_verify)
        
        auto_adjust = ToggleSwitch("Auto-adjust Confidence", "Automatically adjust confidence based on success rate", False)
        auto_adjust.toggled.connect(lambda checked: self.on_feature_toggled("auto_adjust", checked))
        layout.addWidget(auto_adjust)
        
        return card
    
    def on_confidence_changed(self, setting, value):
        print(f"Detection {setting} changed to {value}")
        # Update state manager
        config_key = f"detection_{setting.lower()}_confidence"
        self.state_manager.update_config(config_key, value)
    
    def on_feature_toggled(self, feature, enabled):
        print(f"Feature {feature} {'enabled' if enabled else 'disabled'}")
        # Update state manager
        self.state_manager.update_config(feature, enabled)
```

### Fishing Stats Panel

```python
# ui/components/panels/fishing_stats_panel.py
from PySide6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout, QLabel
from PySide6.QtCore import QTimer
from qfluentwidgets import CardWidget
from .base_panel import BasePanel
import qtawesome as qta
import random

class StatItem(QWidget):
    def __init__(self, icon_name, label, value, color):
        super().__init__()
        self.setup_ui(icon_name, label, value, color)
    
    def setup_ui(self, icon_name, label, value, color):
        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        
        # Icon
        icon = qta.icon(f'fa5s.{icon_name}', color=color)
        icon_label = QLabel()
        icon_label.setPixmap(icon.pixmap(16, 16))
        layout.addWidget(icon_label)
        
        # Label
        label_widget = QLabel(label)
        label_widget.setStyleSheet("color: #D1D5DB; font-size: 11px;")
        layout.addWidget(label_widget)
        
        layout.addStretch()
        
        # Value
        self.value_widget = QLabel(str(value))
        self.value_widget.setStyleSheet(f"color: {color}; font-size: 11px; font-weight: 600;")
        layout.addWidget(self.value_widget)
    
    def update_value(self, value):
        self.value_widget.setText(str(value))

class FishingStatsPanel(BasePanel):
    def __init__(self, state_manager):
        super().__init__("Fishing Statistics", state_manager, "bar-chart")
        self.stats = {
            'total_fish': 0,
            'success_rate': 0.0,
            'session_time': 0,
            'average_time': 0.0
        }
        self.setup_timer()
    
    def setup_content(self):
        # Statistics card
        stats_card = self.create_stats_section()
        self.add_section(None, stats_card)
        
        self.content_layout.addStretch()
    
    def create_stats_section(self):
        card = CardWidget()
        card.setStyleSheet("""
            CardWidget {
                background-color: #1F2937;
                border: 1px solid #374151;
                border-radius: 8px;
                padding: 12px;
            }
        """)
        
        layout = QVBoxLayout(card)
        layout.setSpacing(12)
        
        # Stats items
        self.stat_items = {}
        
        # Total fish
        total_fish = StatItem("fish", "Total Fish Caught", self.stats['total_fish'], "#10B981")
        self.stat_items['total_fish'] = total_fish
        layout.addWidget(total_fish)
        
        # Success rate
        success_rate = StatItem("bullseye", "Success Rate", f"{self.stats['success_rate']:.1f}%", "#3B82F6")
        self.stat_items['success_rate'] = success_rate
        layout.addWidget(success_rate)
        
        # Session time
        session_time = StatItem("clock", "Session Time", self.format_time(self.stats['session_time']), "#8B5CF6")
        self.stat_items['session_time'] = session_time
        layout.addWidget(session_time)
        
        # Average time per fish
        avg_time = StatItem("tachometer-alt", "Avg Time/Fish", f"{self.stats['average_time']:.0f}s", "#F59E0B")
        self.stat_items['average_time'] = avg_time
        layout.addWidget(avg_time)
        
        return card
    
    def setup_timer(self):
        self.timer = QTimer()
        self.timer.timeout.connect(self.update_stats)
        self.timer.start(5000)  # Update every 5 seconds
    
    def update_stats(self):
        # Simulate stat updates
        self.stats['total_fish'] += random.randint(0, 2)
        self.stats['success_rate'] = 65 + random.random() * 30
        self.stats['session_time'] += 5
        self.stats['average_time'] = 30 + random.random() * 60
        
        # Update UI
        self.stat_items['total_fish'].update_value(self.stats['total_fish'])
        self.stat_items['success_rate'].update_value(f"{self.stats['success_rate']:.1f}%")
        self.stat_items['session_time'].update_value(self.format_time(self.stats['session_time']))
        self.stat_items['average_time'].update_value(f"{self.stats['average_time']:.0f}s")
    
    def format_time(self, seconds):
        mins = seconds // 60
        secs = seconds % 60
        return f"{mins}:{secs:02d}"
```

### System Status Panel

```python
# ui/components/panels/system_status_panel.py
from PySide6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel, 
                               QPushButton, QProgressBar)
from PySide6.QtCore import QTimer
from qfluentwidgets import CardWidget, PushButton, ProgressBar
from .base_panel import BasePanel
import qtawesome as qta

class ServiceStatusItem(QWidget):
    def __init__(self, service_name, status=False):
        super().__init__()
        self.service_name = service_name
        self.status = status
        self.setup_ui()
    
    def setup_ui(self):
        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        
        # Service name
        name_label = QLabel(self.service_name)
        name_label.setStyleSheet("color: #D1D5DB; font-size: 11px;")
        layout.addWidget(name_label)
        
        layout.addStretch()
        
        # Status indicator
        self.status_icon = QLabel()
        self.status_badge = QLabel()
        self.update_status_display()
        
        layout.addWidget(self.status_icon)
        layout.addWidget(self.status_badge)
    
    def update_status_display(self):
        if self.status:
            icon = qta.icon('fa5s.check-circle', color='#10B981')
            self.status_icon.setPixmap(icon.pixmap(16, 16))
            self.status_badge.setText("Active")
            self.status_badge.setStyleSheet("""
                QLabel {
                    background-color: #10B981;
                    color: white;
                    border-radius: 8px;
                    padding: 2px 8px;
                    font-size: 9px;
                    font-weight: 600;
                }
            """)
        else:
            icon = qta.icon('fa5s.times-circle', color='#EF4444')
            self.status_icon.setPixmap(icon.pixmap(16, 16))
            self.status_badge.setText("Inactive")
            self.status_badge.setStyleSheet("""
                QLabel {
                    background-color: #EF4444;
                    color: white;
                    border-radius: 8px;
                    padding: 2px 8px;
                    font-size: 9px;
                    font-weight: 600;
                }
            """)
    
    def set_status(self, status):
        if self.status != status:
            self.status = status
            self.update_status_display()

class SystemStatusPanel(BasePanel):
    def __init__(self, state_manager):
        super().__init__("System Status", state_manager, "server")
        self.coordinator_status = {
            'phase': 'ready',
            'progress': 100,
            'current_task': 'All systems operational',
            'services': {
                'orchestrator': True,
                'configurator': True,
                'realtime_data': True,
                'verification': True
            }
        }
        self.setup_timer()
    
    def setup_content(self):
        # System coordinator section
        coordinator_card = self.create_coordinator_section()
        self.add_section("System Coordinator", coordinator_card)
        
        self.add_separator()
        
        # Core services section
        services_card = self.create_services_section()
        self.add_section("Core Services", services_card)
        
        self.add_separator()
        
        # Control buttons
        controls_card = self.create_controls_section()
        self.add_section("System Controls", controls_card)
        
        self.content_layout.addStretch()
    
    def create_coordinator_section(self):
        card = CardWidget()
        card.setStyleSheet("""
            CardWidget {
                background-color: #1F2937;
                border: 1px solid #374151;
                border-radius: 8px;
                padding: 12px;
            }
        """)
        
        layout = QVBoxLayout(card)
        
        # Status header
        header_layout = QHBoxLayout()
        
        # Phase icon
        self.phase_icon = QLabel()
        phase_icon = qta.icon('fa5s.check-circle', color='#10B981')
        self.phase_icon.setPixmap(phase_icon.pixmap(20, 20))
        header_layout.addWidget(self.phase_icon)
        
        # Phase label
        self.phase_label = QLabel("READY")
        self.phase_label.setStyleSheet("""
            QLabel {
                color: white;
                font-size: 12px;
                font-weight: 600;
                background-color: #10B981;
                border-radius: 4px;
                padding: 2px 8px;
            }
        """)
        header_layout.addWidget(self.phase_label)
        header_layout.addStretch()
        
        layout.addLayout(header_layout)
        
        # Progress bar
        self.progress_bar = ProgressBar()
        self.progress_bar.setValue(self.coordinator_status['progress'])
        self.progress_bar.setStyleSheet("""
            QProgressBar {
                border: none;
                border-radius: 4px;
                background-color: #374151;
                text-align: center;
                color: white;
                font-size: 10px;
            }
            QProgressBar::chunk {
                background-color: #10B981;
                border-radius: 4px;
            }
        """)
        layout.addWidget(self.progress_bar)
        
        # Current task
        self.task_label = QLabel(self.coordinator_status['current_task'])
        self.task_label.setStyleSheet("color: #9CA3AF; font-size: 10px;")
        layout.addWidget(self.task_label)
        
        return card
    
    def create_services_section(self):
        card = CardWidget()
        card.setStyleSheet("""
            CardWidget {
                background-color: #1F2937;
                border: 1px solid #374151;
                border-radius: 8px;
                padding: 12px;
            }
        """)
        
        layout = QVBoxLayout(card)
        layout.setSpacing(8)
        
        # Service items
        self.service_items = {}
        services = [
            ("Service Orchestrator", self.coordinator_status['services']['orchestrator']),
            ("Configurator Integration", self.coordinator_status['services']['configurator']),
            ("Realtime Data Service", self.coordinator_status['services']['realtime_data']),
            ("System Verification", self.coordinator_status['services']['verification']),
        ]
        
        for service_name, status in services:
            item = ServiceStatusItem(service_name, status)
            self.service_items[service_name] = item
            layout.addWidget(item)
        
        return card
    
    def create_controls_section(self):
        card = CardWidget()
        card.setStyleSheet("""
            CardWidget {
                background-color: #1F2937;
                border: 1px solid #374151;
                border-radius: 8px;
                padding: 12px;
            }
        """)
        
        layout = QHBoxLayout(card)
        
        # Initialize button
        init_button = PushButton("Initialize System")
        init_button.setStyleSheet("""
            QPushButton {
                background-color: #10B981;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 8px 16px;
                font-weight: 600;
            }
            QPushButton:hover {
                background-color: #059669;
            }
        """)
        init_button.clicked.connect(self.initialize_system)
        layout.addWidget(init_button)
        
        # Restart button
        restart_button = PushButton("Restart System")
        restart_button.setStyleSheet("""
            QPushButton {
                background-color: #6B7280;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 8px 16px;
                font-weight: 600;
            }
            QPushButton:hover {
                background-color: #4B5563;
            }
        """)
        restart_button.clicked.connect(self.restart_system)
        layout.addWidget(restart_button)
        
        layout.addStretch()
        
        return card
    
    def setup_timer(self):
        self.timer = QTimer()
        self.timer.timeout.connect(self.update_system_status)
        self.timer.start(2000)  # Update every 2 seconds
    
    def initialize_system(self):
        print("Initializing system...")
        # Simulate initialization process
        self.coordinator_status['phase'] = 'initializing'
        self.coordinator_status['progress'] = 0
        self.coordinator_status['current_task'] = 'Starting initialization...'
        self.update_coordinator_display()
    
    def restart_system(self):
        print("Restarting system...")
        # Simulate restart process
        self.coordinator_status['phase'] = 'restarting'
        self.coordinator_status['progress'] = 0
        self.coordinator_status['current_task'] = 'Restarting all services...'
        self.update_coordinator_display()
    
    def update_system_status(self):
        # Simulate status updates
        if self.coordinator_status['phase'] in ['initializing', 'restarting']:
            self.coordinator_status['progress'] = min(100, self.coordinator_status['progress'] + 10)
            if self.coordinator_status['progress'] >= 100:
                self.coordinator_status['phase'] = 'ready'
                self.coordinator_status['current_task'] = 'All systems operational'
            self.update_coordinator_display()
    
    def update_coordinator_display(self):
        # Update phase display
        phase = self.coordinator_status['phase']
        if phase == 'ready':
            icon = qta.icon('fa5s.check-circle', color='#10B981')
            self.phase_label.setText("READY")
            self.phase_label.setStyleSheet("""
                QLabel {
                    color: white;
                    font-size: 12px;
                    font-weight: 600;
                    background-color: #10B981;
                    border-radius: 4px;
                    padding: 2px 8px;
                }
            """)
        elif phase in ['initializing', 'restarting']:
            icon = qta.icon('fa5s.sync-alt', color='#3B82F6')
            self.phase_label.setText(phase.upper())
            self.phase_label.setStyleSheet("""
                QLabel {
                    color: white;
                    font-size: 12px;
                    font-weight: 600;
                    background-color: #3B82F6;
                    border-radius: 4px;
                    padding: 2px 8px;
                }
            """)
        
        self.phase_icon.setPixmap(icon.pixmap(20, 20))
        self.progress_bar.setValue(self.coordinator_status['progress'])
        self.task_label.setText(self.coordinator_status['current_task'])
```

This completes the specific panel implementations. Each panel demonstrates different UI patterns and integrates with the state management system. The next section will cover the service coordination layer and final integration steps.
