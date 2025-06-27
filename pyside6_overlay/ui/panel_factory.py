"""
Panel Factory - Creates and manages all feature panels
"""

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QScrollArea,
    QFrame, QSizePolicy
)
from PySide6.QtCore import Qt, Signal, QObject

from qfluentwidgets import (
    CardWidget, HeaderCardWidget, SimpleCardWidget,
    ExpandGroupSettingCard, PushSettingCard, SwitchSettingCard,
    RangeSettingCard, ComboBoxSettingCard, FluentIcon,
    SubtitleLabel, BodyLabel, CaptionLabel
)

from typing import Dict, List, Any


class PanelFactory(QObject):
    """Factory for creating RF4S feature panels"""
    
    panel_created = Signal(str, QWidget)  # panel_id, widget
    
    def __init__(self):
        super().__init__()
        self.created_panels: Dict[str, QWidget] = {}
        
    def create_panel(self, panel_id: str, config: Dict[str, Any]) -> QWidget:
        """Create a panel based on configuration"""
        if panel_id in self.created_panels:
            return self.created_panels[panel_id]
            
        panel_widget = None
        
        # Main category panels
        if panel_id == 'script-control':
            panel_widget = self.create_script_control_panel()
        elif panel_id == 'fishing-profiles':
            panel_widget = self.create_fishing_profiles_panel()
        elif panel_id == 'system-monitor':
            panel_widget = self.create_system_monitor_panel()
            
        # Settings category panels
        elif panel_id == 'detection-settings':
            panel_widget = self.create_detection_settings_panel()
        elif panel_id == 'automation-settings':
            panel_widget = self.create_automation_settings_panel()
        elif panel_id == 'equipment-setup':
            panel_widget = self.create_equipment_setup_panel()
            
        # Tools category panels
        elif panel_id == 'game-integration':
            panel_widget = self.create_game_integration_panel()
        elif panel_id == 'save-load-manager':
            panel_widget = self.create_save_load_panel()
        elif panel_id == 'performance-stats':
            panel_widget = self.create_performance_stats_panel()
            
        # Smart category panels
        elif panel_id == 'ai-tuning':
            panel_widget = self.create_ai_tuning_panel()
        elif panel_id == 'smart-analytics':
            panel_widget = self.create_smart_analytics_panel()
        elif panel_id == 'fishing-stats':
            panel_widget = self.create_fishing_stats_panel()
            
        # Advanced panels
        elif panel_id == 'friction-brake':
            panel_widget = self.create_friction_brake_panel()
        elif panel_id == 'environmental-effects':
            panel_widget = self.create_environmental_panel()
            
        if panel_widget:
            self.created_panels[panel_id] = panel_widget
            self.panel_created.emit(panel_id, panel_widget)
            
        return panel_widget
        
    def create_script_control_panel(self) -> QWidget:
        """Create script control panel"""
        widget = SimpleCardWidget()
        widget.setTitle("Bot Control")
        
        layout = QVBoxLayout(widget)
        
        # Start/Stop controls
        control_group = ExpandGroupSettingCard(
            FluentIcon.PLAY,
            "Fishing Bot Control",
            "Start, stop, and configure automated fishing"
        )
        
        # Add control buttons
        start_card = PushSettingCard(
            "Start Fishing",
            FluentIcon.PLAY,
            "Begin automated fishing session"
        )
        
        stop_card = PushSettingCard(
            "Stop Fishing", 
            FluentIcon.PAUSE,
            "Stop current fishing session"
        )
        
        emergency_card = PushSettingCard(
            "Emergency Stop",
            FluentIcon.CLOSE,
            "Immediately stop all bot activities"
        )
        
        control_group.addGroupWidget(start_card)
        control_group.addGroupWidget(stop_card)
        control_group.addGroupWidget(emergency_card)
        
        # Speed settings
        speed_group = ExpandGroupSettingCard(
            FluentIcon.SPEED_OFF,
            "Speed & Timing",
            "Configure bot speed and reaction times"
        )
        
        cast_speed = RangeSettingCard(
            FluentIcon.TIMER,
            "Cast Speed",
            "Delay between casts (seconds)",
            0.5, 5.0, 1.5
        )
        
        reaction_time = RangeSettingCard(
            FluentIcon.STOPWATCH,
            "Reaction Time", 
            "Fish bite reaction delay (ms)",
            100, 2000, 500
        )
        
        speed_group.addGroupWidget(cast_speed)
        speed_group.addGroupWidget(reaction_time)
        
        layout.addWidget(control_group)
        layout.addWidget(speed_group)
        layout.addStretch()
        
        return widget
        
    def create_fishing_profiles_panel(self) -> QWidget:
        """Create fishing profiles panel"""
        widget = SimpleCardWidget()
        widget.setTitle("Fishing Profiles")
        
        layout = QVBoxLayout(widget)
        
        # Profile selection
        profile_group = ExpandGroupSettingCard(
            FluentIcon.PEOPLE,
            "Active Profiles",
            "Select and manage fishing techniques"
        )
        
        # Profile selector
        profile_selector = ComboBoxSettingCard(
            FluentIcon.MENU,
            "Current Profile",
            "Select active fishing profile",
            texts=["Float Fishing", "Feeder", "Spinning", "Bottom"]
        )
        
        # Profile settings
        technique_settings = ExpandGroupSettingCard(
            FluentIcon.SETTING,
            "Technique Settings", 
            "Configure selected technique parameters"
        )
        
        # Add technique-specific controls
        sensitivity = RangeSettingCard(
            FluentIcon.MICROPHONE,
            "Bite Sensitivity",
            "Fish bite detection sensitivity",
            0.1, 1.0, 0.7
        )
        
        auto_hook = SwitchSettingCard(
            FluentIcon.LINK,
            "Auto Hook",
            "Automatically hook fish when bite detected"
        )
        
        technique_settings.addGroupWidget(sensitivity)
        technique_settings.addGroupWidget(auto_hook)
        
        profile_group.addGroupWidget(profile_selector)
        profile_group.addGroupWidget(technique_settings)
        
        layout.addWidget(profile_group)
        layout.addStretch()
        
        return widget
        
    def create_detection_settings_panel(self) -> QWidget:
        """Create detection settings panel"""
        widget = SimpleCardWidget()
        widget.setTitle("Detection Settings")
        
        layout = QVBoxLayout(widget)
        
        # Visual detection
        visual_group = ExpandGroupSettingCard(
            FluentIcon.VIEW,
            "Visual Detection",
            "Configure visual fish bite detection"
        )
        
        confidence_slider = RangeSettingCard(
            FluentIcon.CERTIFICATE,
            "Confidence Threshold",
            "Minimum confidence for fish detection",
            0.1, 1.0, 0.8
        )
        
        ai_detection = SwitchSettingCard(
            FluentIcon.ROBOT,
            "AI Detection",
            "Use AI-powered fish detection"
        )
        
        visual_group.addGroupWidget(confidence_slider)
        visual_group.addGroupWidget(ai_detection)
        
        # Audio detection  
        audio_group = ExpandGroupSettingCard(
            FluentIcon.MUSIC,
            "Audio Detection",
            "Configure audio-based bite detection"
        )
        
        audio_enabled = SwitchSettingCard(
            FluentIcon.VOLUME,
            "Audio Detection",
            "Enable audio bite detection"
        )
        
        audio_sensitivity = RangeSettingCard(
            FluentIcon.MICROPHONE,
            "Audio Sensitivity",
            "Audio detection sensitivity level",
            0.1, 1.0, 0.6
        )
        
        audio_group.addGroupWidget(audio_enabled)
        audio_group.addGroupWidget(audio_sensitivity)
        
        layout.addWidget(visual_group)
        layout.addWidget(audio_group)
        layout.addStretch()
        
        return widget
        
    def create_system_monitor_panel(self) -> QWidget:
        """Create system monitor panel"""
        widget = SimpleCardWidget()
        widget.setTitle("System Monitor")
        
        layout = QVBoxLayout(widget)
        
        # Performance metrics
        perf_group = ExpandGroupSettingCard(
            FluentIcon.SPEED_OFF,
            "Performance Metrics",
            "Real-time system performance data"
        )
        
        # Add performance indicators (simplified for now)
        cpu_label = BodyLabel("CPU Usage: 0%")
        memory_label = BodyLabel("Memory Usage: 0 MB")
        fps_label = BodyLabel("Detection FPS: 0")
        
        perf_widget = QWidget()
        perf_layout = QVBoxLayout(perf_widget)
        perf_layout.addWidget(cpu_label)
        perf_layout.addWidget(memory_label)
        perf_layout.addWidget(fps_label)
        
        perf_group.addGroupWidget(perf_widget)
        
        layout.addWidget(perf_group)
        layout.addStretch()
        
        return widget
        
    # Placeholder methods for other panels
    def create_automation_settings_panel(self) -> QWidget:
        return self._create_placeholder_panel("Automation Settings")
        
    def create_equipment_setup_panel(self) -> QWidget:
        return self._create_placeholder_panel("Equipment Setup")
        
    def create_game_integration_panel(self) -> QWidget:
        return self._create_placeholder_panel("Game Integration")
        
    def create_save_load_panel(self) -> QWidget:
        return self._create_placeholder_panel("Save/Load Manager")
        
    def create_performance_stats_panel(self) -> QWidget:
        return self._create_placeholder_panel("Performance Stats")
        
    def create_ai_tuning_panel(self) -> QWidget:
        return self._create_placeholder_panel("AI Tuning")
        
    def create_smart_analytics_panel(self) -> QWidget:
        return self._create_placeholder_panel("Smart Analytics")
        
    def create_fishing_stats_panel(self) -> QWidget:
        return self._create_placeholder_panel("Fishing Statistics")
        
    def create_friction_brake_panel(self) -> QWidget:
        return self._create_placeholder_panel("Friction Brake")
        
    def create_environmental_panel(self) -> QWidget:
        return self._create_placeholder_panel("Environmental Effects")
        
    def _create_placeholder_panel(self, title: str) -> QWidget:
        """Create a placeholder panel"""
        widget = SimpleCardWidget()
        widget.setTitle(title)
        
        layout = QVBoxLayout(widget)
        placeholder_label = BodyLabel(f"{title} panel - Coming soon!")
        placeholder_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        layout.addWidget(placeholder_label)
        layout.addStretch()
        
        return widget
        
    def get_panel(self, panel_id: str) -> QWidget:
        """Get existing panel by ID"""
        return self.created_panels.get(panel_id)
        
    def get_all_panels(self) -> Dict[str, QWidget]:
        """Get all created panels"""
        return self.created_panels.copy()
