
"""
Settings Panels - Configuration and settings panels
"""

from PySide6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout, QSlider, QSpinBox
from PySide6.QtCore import Qt, Signal

from qfluentwidgets import (
    CardWidget, TitleLabel, StrongBodyLabel, BodyLabel,
    Slider, SpinBox, SwitchButton, ComboBox, PushButton
)


class DetectionSettingsPanel(CardWidget):
    """Panel for detection settings configuration"""
    
    # Signals
    settings_changed = Signal(dict)
    
    def __init__(self):
        super().__init__()
        self.setObjectName("DetectionSettingsPanel")
        self.setup_ui()
        
    def setup_ui(self):
        """Setup the UI components"""
        layout = QVBoxLayout(self)
        
        # Title
        title = TitleLabel("Detection Settings")
        layout.addWidget(title)
        
        # Sensitivity slider
        self.sensitivity_label = BodyLabel("Sensitivity: 75%")
        layout.addWidget(self.sensitivity_label)
        
        self.sensitivity_slider = Slider(Qt.Orientation.Horizontal)
        self.sensitivity_slider.setMinimum(10)
        self.sensitivity_slider.setMaximum(100)
        self.sensitivity_slider.setValue(75)
        self.sensitivity_slider.valueChanged.connect(self.on_sensitivity_changed)
        layout.addWidget(self.sensitivity_slider)
        
        # Detection toggles
        self.rod_tip_switch = SwitchButton("Rod Tip Detection")
        self.rod_tip_switch.setChecked(True)
        layout.addWidget(self.rod_tip_switch)
        
        self.float_switch = SwitchButton("Float Detection")  
        self.float_switch.setChecked(True)
        layout.addWidget(self.float_switch)
        
        # Bite threshold
        self.bite_threshold_label = BodyLabel("Bite Threshold: 0.7")
        layout.addWidget(self.bite_threshold_label)
        
        self.bite_threshold_slider = Slider(Qt.Orientation.Horizontal)
        self.bite_threshold_slider.setMinimum(10)
        self.bite_threshold_slider.setMaximum(100)
        self.bite_threshold_slider.setValue(70)
        self.bite_threshold_slider.valueChanged.connect(self.on_bite_threshold_changed)
        layout.addWidget(self.bite_threshold_slider)
        
        # Connect signals
        self.rod_tip_switch.checkedChanged.connect(self.emit_settings_changed)
        self.float_switch.checkedChanged.connect(self.emit_settings_changed)
        
    def on_sensitivity_changed(self, value: int):
        """Handle sensitivity change"""
        self.sensitivity_label.setText(f"Sensitivity: {value}%")
        self.emit_settings_changed()
        
    def on_bite_threshold_changed(self, value: int):
        """Handle bite threshold change"""
        threshold = value / 100.0
        self.bite_threshold_label.setText(f"Bite Threshold: {threshold:.1f}")
        self.emit_settings_changed()
        
    def emit_settings_changed(self):
        """Emit settings changed signal"""
        settings = {
            'sensitivity': self.sensitivity_slider.value(),
            'rod_tip_enabled': self.rod_tip_switch.isChecked(),
            'float_enabled': self.float_switch.isChecked(),
            'bite_threshold': self.bite_threshold_slider.value() / 100.0
        }
        self.settings_changed.emit(settings)
        
    def update_settings(self, settings: dict):
        """Update settings display"""
        if 'sensitivity' in settings:
            self.sensitivity_slider.setValue(settings['sensitivity'])
        if 'rod_tip_enabled' in settings:
            self.rod_tip_switch.setChecked(settings['rod_tip_enabled'])
        if 'float_enabled' in settings:
            self.float_switch.setChecked(settings['float_enabled'])
        if 'bite_threshold' in settings:
            value = int(settings['bite_threshold'] * 100)
            self.bite_threshold_slider.setValue(value)


class AutomationSettingsPanel(CardWidget):
    """Panel for automation settings configuration"""
    
    # Signals
    settings_changed = Signal(dict)
    
    def __init__(self):
        super().__init__()
        self.setObjectName("AutomationSettingsPanel")
        self.setup_ui()
        
    def setup_ui(self):
        """Setup the UI components"""
        layout = QVBoxLayout(self)
        
        # Title
        title = TitleLabel("Automation Settings")
        layout.addWidget(title)
        
        # Automation toggles
        self.auto_cast_switch = SwitchButton("Auto Cast")
        self.auto_cast_switch.setChecked(True)
        self.auto_cast_switch.checkedChanged.connect(self.emit_settings_changed)
        layout.addWidget(self.auto_cast_switch)
        
        self.auto_reel_switch = SwitchButton("Auto Reel")
        self.auto_reel_switch.setChecked(True)
        self.auto_reel_switch.checkedChanged.connect(self.emit_settings_changed)
        layout.addWidget(self.auto_reel_switch)
        
        self.auto_unhook_switch = SwitchButton("Auto Unhook")
        self.auto_unhook_switch.setChecked(True)
        self.auto_unhook_switch.checkedChanged.connect(self.emit_settings_changed)
        layout.addWidget(self.auto_unhook_switch)
        
        # Timing settings
        self.cast_delay_label = BodyLabel("Cast Delay: 2.0s")
        layout.addWidget(self.cast_delay_label)
        
        self.cast_delay_slider = Slider(Qt.Orientation.Horizontal)
        self.cast_delay_slider.setMinimum(5)  # 0.5s
        self.cast_delay_slider.setMaximum(100)  # 10.0s
        self.cast_delay_slider.setValue(20)  # 2.0s
        self.cast_delay_slider.valueChanged.connect(self.on_cast_delay_changed)
        layout.addWidget(self.cast_delay_slider)
        
    def on_cast_delay_changed(self, value: int):
        """Handle cast delay change"""
        delay = value / 10.0
        self.cast_delay_label.setText(f"Cast Delay: {delay:.1f}s")
        self.emit_settings_changed()
        
    def emit_settings_changed(self):
        """Emit settings changed signal"""
        settings = {
            'auto_cast': self.auto_cast_switch.isChecked(),
            'auto_reel': self.auto_reel_switch.isChecked(),
            'auto_unhook': self.auto_unhook_switch.isChecked(),
            'cast_delay': self.cast_delay_slider.value() / 10.0
        }
        self.settings_changed.emit(settings)
        
    def update_settings(self, settings: dict):
        """Update settings display"""
        if 'auto_cast' in settings:
            self.auto_cast_switch.setChecked(settings['auto_cast'])
        if 'auto_reel' in settings:
            self.auto_reel_switch.setChecked(settings['auto_reel'])
        if 'auto_unhook' in settings:
            self.auto_unhook_switch.setChecked(settings['auto_unhook'])
        if 'cast_delay' in settings:
            value = int(settings['cast_delay'] * 10)
            self.cast_delay_slider.setValue(value)


class UISettingsPanel(CardWidget):
    """Panel for UI settings configuration"""
    
    def __init__(self):
        super().__init__()
        self.setObjectName("UISettingsPanel")
        self.setup_ui()
        
    def setup_ui(self):
        """Setup the UI components"""
        layout = QVBoxLayout(self)
        
        # Title
        title = TitleLabel("UI Settings")
        layout.addWidget(title)
        
        # Theme selection
        self.theme_label = BodyLabel("Theme:")
        layout.addWidget(self.theme_label)
        
        self.theme_combo = ComboBox()
        self.theme_combo.addItems(["Dark", "Light"])
        self.theme_combo.setCurrentIndex(0)
        layout.addWidget(self.theme_combo)
        
        # Opacity setting
        self.opacity_label = BodyLabel("Opacity: 90%")
        layout.addWidget(self.opacity_label)
        
        self.opacity_slider = Slider(Qt.Orientation.Horizontal)
        self.opacity_slider.setMinimum(30)
        self.opacity_slider.setMaximum(100)
        self.opacity_slider.setValue(90)
        self.opacity_slider.valueChanged.connect(self.on_opacity_changed)
        layout.addWidget(self.opacity_slider)
        
        # Animation settings
        self.animations_switch = SwitchButton("Enable Animations")
        self.animations_switch.setChecked(True)
        layout.addWidget(self.animations_switch)
        
        # Auto-save settings
        self.auto_save_switch = SwitchButton("Auto Save Settings")
        self.auto_save_switch.setChecked(True)
        layout.addWidget(self.auto_save_switch)
        
    def on_opacity_changed(self, value: int):
        """Handle opacity change"""
        self.opacity_label.setText(f"Opacity: {value}%")
