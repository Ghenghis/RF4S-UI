
"""
Tools Panels - Utility and system tools panels
"""

from PySide6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout, QTextEdit, QPushButton
from PySide6.QtCore import Qt

from qfluentwidgets import (
    CardWidget, TitleLabel, StrongBodyLabel, BodyLabel,
    PushButton, TogglePushButton, FluentIcon
)


class SystemMonitorPanel(CardWidget):
    """Panel for monitoring system resources"""
    
    def __init__(self):
        super().__init__()
        self.setObjectName("SystemMonitorPanel")
        self.setup_ui()
        
    def setup_ui(self):
        """Setup the UI components"""
        layout = QVBoxLayout(self)
        
        # Title
        title = TitleLabel("System Monitor")
        layout.addWidget(title)
        
        # System info
        self.cpu_temp_label = BodyLabel("CPU Temp: --°C")
        layout.addWidget(self.cpu_temp_label)
        
        self.gpu_usage_label = BodyLabel("GPU Usage: --%")
        layout.addWidget(self.gpu_usage_label)
        
        self.disk_usage_label = BodyLabel("Disk Usage: --%")
        layout.addWidget(self.disk_usage_label)
        
        self.network_label = BodyLabel("Network: -- KB/s")
        layout.addWidget(self.network_label)
        
        # Process info
        self.process_count_label = BodyLabel("Processes: --")
        layout.addWidget(self.process_count_label)
        
    def update_system_info(self, info: dict):
        """Update system information"""
        self.cpu_temp_label.setText(f"CPU Temp: {info.get('cpu_temp', '--')}°C")
        self.gpu_usage_label.setText(f"GPU Usage: {info.get('gpu_usage', '--')}%")
        self.disk_usage_label.setText(f"Disk Usage: {info.get('disk_usage', '--')}%")
        self.network_label.setText(f"Network: {info.get('network_speed', '--')} KB/s")
        self.process_count_label.setText(f"Processes: {info.get('process_count', '--')}")


class AutomationToolsPanel(CardWidget):
    """Panel for automation tools and controls"""
    
    def __init__(self):
        super().__init__()
        self.setObjectName("AutomationToolsPanel")
        self.setup_ui()
        
    def setup_ui(self):
        """Setup the UI components"""
        layout = QVBoxLayout(self)
        
        # Title
        title = TitleLabel("Automation Tools")
        layout.addWidget(title)
        
        # Automation toggles
        self.auto_cast_toggle = TogglePushButton("Auto Cast")
        layout.addWidget(self.auto_cast_toggle)
        
        self.auto_reel_toggle = TogglePushButton("Auto Reel")
        layout.addWidget(self.auto_reel_toggle)
        
        self.auto_unhook_toggle = TogglePushButton("Auto Unhook")
        layout.addWidget(self.auto_unhook_toggle)
        
        # Timing controls
        self.timing_label = StrongBodyLabel("Timing Controls")
        layout.addWidget(self.timing_label)
        
        self.cast_delay_label = BodyLabel("Cast Delay: 2.0s")
        layout.addWidget(self.cast_delay_label)
        
        self.reel_delay_label = BodyLabel("Reel Delay: 1.0s")
        layout.addWidget(self.reel_delay_label)
        
    def update_automation_settings(self, settings: dict):
        """Update automation settings display"""
        self.auto_cast_toggle.setChecked(settings.get('auto_cast', False))
        self.auto_reel_toggle.setChecked(settings.get('auto_reel', False))
        self.auto_unhook_toggle.setChecked(settings.get('auto_unhook', False))
        self.cast_delay_label.setText(f"Cast Delay: {settings.get('cast_delay', 2.0)}s")
        self.reel_delay_label.setText(f"Reel Delay: {settings.get('reel_delay', 1.0)}s")


class DebugConsolePanel(CardWidget):
    """Panel for debug console and logs"""
    
    def __init__(self):
        super().__init__()
        self.setObjectName("DebugConsolePanel")
        self.setup_ui()
        
    def setup_ui(self):
        """Setup the UI components"""
        layout = QVBoxLayout(self)
        
        # Title
        title = TitleLabel("Debug Console")
        layout.addWidget(title)
        
        # Console text area
        self.console_text = QTextEdit()
        self.console_text.setReadOnly(True)
        self.console_text.setMaximumHeight(200)
        layout.addWidget(self.console_text)
        
        # Control buttons
        button_layout = QHBoxLayout()
        
        self.clear_button = PushButton("Clear")
        self.clear_button.setIcon(FluentIcon.DELETE)
        self.clear_button.clicked.connect(self.clear_console)
        button_layout.addWidget(self.clear_button)
        
        self.export_button = PushButton("Export Logs")
        self.export_button.setIcon(FluentIcon.SAVE)
        button_layout.addWidget(self.export_button)
        
        layout.addLayout(button_layout)
        
        # Add some initial text
        self.add_log_message("Debug console initialized")
        
    def add_log_message(self, message: str):
        """Add a log message to the console"""
        import datetime
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        formatted_message = f"[{timestamp}] {message}"
        self.console_text.append(formatted_message)
        
    def clear_console(self):
        """Clear the console"""
        self.console_text.clear()
        self.add_log_message("Console cleared")
