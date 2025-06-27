"""
Panel Factory - Creates and manages UI panels
"""

from PySide6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout, QLabel, QScrollArea
from PySide6.QtCore import Qt, QObject

from qfluentwidgets import (
    SubtitleLabel, BodyLabel, CardWidget, SimpleCardWidget,
    PushButton, CheckBox, Slider, ComboBox, LineEdit,
    SpinBox, ProgressBar, TextEdit
)

from typing import Dict, Any, Optional


class PanelFactory(QObject):
    """Factory for creating UI panels"""
    
    def __init__(self):
        super().__init__()
        self.panel_cache = {}
        
    def create_panel(self, panel_id: str, config: Dict[str, Any]) -> Optional[QWidget]:
        """Create a panel by ID"""
        try:
            # Use cached panel if available
            if panel_id in self.panel_cache:
                return self.panel_cache[panel_id]
                
            panel = None
            
            if panel_id == 'script-control':
                panel = self._create_script_control_panel()
            elif panel_id == 'fishing-profiles':
                panel = self._create_fishing_profiles_panel()
            elif panel_id == 'system-monitor':
                panel = self._create_system_monitor_panel()
            elif panel_id == 'detection-settings':
                panel = self._create_detection_settings_panel()
            elif panel_id == 'automation-settings':
                panel = self._create_automation_settings_panel()
            elif panel_id == 'equipment-setup':
                panel = self._create_equipment_setup_panel()
            elif panel_id == 'config-dashboard':
                panel = self._create_config_dashboard_panel()
            elif panel_id == 'key-bindings':
                panel = self._create_key_bindings_panel()
            elif panel_id == 'stat-management':
                panel = self._create_stat_management_panel()
            elif panel_id == 'friction-brake':
                panel = self._create_friction_brake_panel()
            elif panel_id == 'keepnet-settings':
                panel = self._create_keepnet_settings_panel()
            elif panel_id == 'notification-settings':
                panel = self._create_notification_settings_panel()
            elif panel_id == 'pause-settings':
                panel = self._create_pause_settings_panel()
            elif panel_id == 'advanced-settings':
                panel = self._create_advanced_settings_panel()
            elif panel_id == 'cli-terminal':
                panel = self._create_cli_terminal_panel()
            elif panel_id == 'ui-customization':
                panel = self._create_ui_customization_panel()
            elif panel_id == 'screenshot-sharing':
                panel = self._create_screenshot_sharing_panel()
            elif panel_id == 'game-integration':
                panel = self._create_game_integration_panel()
            elif panel_id == 'network-status':
                panel = self._create_network_status_panel()
            elif panel_id == 'error-diagnostics':
                panel = self._create_error_diagnostics_panel()
            elif panel_id == 'save-load-manager':
                panel = self._create_save_load_manager_panel()
            elif panel_id == 'performance-stats':
                panel = self._create_performance_stats_panel()
            elif panel_id == 'ai-tuning':
                panel = self._create_ai_tuning_panel()
            elif panel_id == 'smart-analytics':
                panel = self._create_smart_analytics_panel()
            elif panel_id == 'session-analytics':
                panel = self._create_session_analytics_panel()
            elif panel_id == 'achievement-tracker':
                panel = self._create_achievement_tracker_panel()
            elif panel_id == 'fishing-stats':
                panel = self._create_fishing_stats_panel()
            elif panel_id == 'environmental-effects':
                panel = self._create_environmental_effects_panel()
            else:
                panel = self._create_default_panel(panel_id)
                
            if panel:
                self.panel_cache[panel_id] = panel
                
            return panel
            
        except Exception as e:
            print(f"Error creating panel {panel_id}: {e}")
            return self._create_error_panel(panel_id, str(e))
            
    def _create_script_control_panel(self) -> QWidget:
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
        
    def _create_fishing_profiles_panel(self) -> QWidget:
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
        
    def _create_system_monitor_panel(self) -> QWidget:
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
        
    def _create_detection_settings_panel(self) -> QWidget:
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
        
    def _create_default_panel(self, panel_id: str) -> QWidget:
        """Create a default panel for unknown panel IDs"""
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        
        title = SubtitleLabel(f"{panel_id.replace('-', ' ').title()}")
        layout.addWidget(title)
        
        content_label = BodyLabel(f"This is the {panel_id} panel. Content will be implemented here.")
        layout.addWidget(content_label)
        
        layout.addStretch()
        return panel
        
    def _create_error_panel(self, panel_id: str, error_msg: str) -> QWidget:
        """Create an error panel when panel creation fails"""
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        
        title = SubtitleLabel(f"Error: {panel_id}")
        title.setStyleSheet("color: #ff4757;")
        layout.addWidget(title)
        
        error_label = BodyLabel(f"Failed to create panel: {error_msg}")
        error_label.setStyleSheet("color: #ff4757;")
        layout.addWidget(error_label)
        
        layout.addStretch()
        return panel

    
    def _create_automation_settings_panel(self) -> QWidget:
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        title = SubtitleLabel("Automation Settings")
        layout.addWidget(title)
        
        auto_cast_check = CheckBox("Auto Cast")
        auto_reel_check = CheckBox("Auto Reel")
        layout.addWidget(auto_cast_check)
        layout.addWidget(auto_reel_check)
        
        layout.addStretch()
        return panel
        
    def _create_equipment_setup_panel(self) -> QWidget:
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        title = SubtitleLabel("Equipment Setup")
        layout.addWidget(title)
        layout.addStretch()
        return panel
        
    def _create_config_dashboard_panel(self) -> QWidget:
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        title = SubtitleLabel("Config Dashboard")
        layout.addWidget(title)
        layout.addStretch()
        return panel
        
    def _create_key_bindings_panel(self) -> QWidget:
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        title = SubtitleLabel("Key Bindings")
        layout.addWidget(title)
        layout.addStretch()
        return panel
        
    def _create_stat_management_panel(self) -> QWidget:
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        title = SubtitleLabel("Player Stats")
        layout.addWidget(title)
        layout.addStretch()
        return panel
        
    def _create_friction_brake_panel(self) -> QWidget:
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        title = SubtitleLabel("Friction Brake")
        layout.addWidget(title)
        layout.addStretch()
        return panel
        
    def _create_keepnet_settings_panel(self) -> QWidget:
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        title = SubtitleLabel("Keepnet Settings")
        layout.addWidget(title)
        layout.addStretch()
        return panel
        
    def _create_notification_settings_panel(self) -> QWidget:
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        title = SubtitleLabel("Notifications")
        layout.addWidget(title)
        layout.addStretch()
        return panel
        
    def _create_pause_settings_panel(self) -> QWidget:
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        title = SubtitleLabel("Auto Pause")
        layout.addWidget(title)
        layout.addStretch()
        return panel
        
    def _create_advanced_settings_panel(self) -> QWidget:
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        title = SubtitleLabel("Advanced Settings")
        layout.addWidget(title)
        layout.addStretch()
        return panel
        
    def _create_cli_terminal_panel(self) -> QWidget:
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        title = SubtitleLabel("Console Terminal")
        layout.addWidget(title)
        
        terminal = TextEdit()
        terminal.setPlainText("RF4S Console Ready...\n")
        layout.addWidget(terminal)
        
        return panel
        
    def _create_ui_customization_panel(self) -> QWidget:
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        title = SubtitleLabel("UI Customization")
        layout.addWidget(title)
        layout.addStretch()
        return panel
        
    def _create_screenshot_sharing_panel(self) -> QWidget:
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        title = SubtitleLabel("Screenshots")
        layout.addWidget(title)
        layout.addStretch()
        return panel
        
    def _create_game_integration_panel(self) -> QWidget:
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        title = SubtitleLabel("Game Integration")
        layout.addWidget(title)
        layout.addStretch()
        return panel
        
    def _create_network_status_panel(self) -> QWidget:
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        title = SubtitleLabel("Network Status")
        layout.addWidget(title)
        layout.addStretch()
        return panel
        
    def _create_error_diagnostics_panel(self) -> QWidget:
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        title = SubtitleLabel("Error Diagnostics")
        layout.addWidget(title)
        layout.addStretch()
        return panel
        
    def _create_save_load_manager_panel(self) -> QWidget:
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        title = SubtitleLabel("Save/Load Manager")
        layout.addWidget(title)
        layout.addStretch()
        return panel
        
    def _create_performance_stats_panel(self) -> QWidget:
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        title = SubtitleLabel("Performance Stats")
        layout.addWidget(title)
        layout.addStretch()
        return panel
        
    def _create_ai_tuning_panel(self) -> QWidget:
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        title = SubtitleLabel("AI Tuning")
        layout.addWidget(title)
        layout.addStretch()
        return panel
        
    def _create_smart_analytics_panel(self) -> QWidget:
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        title = SubtitleLabel("Smart Analytics")
        layout.addWidget(title)
        layout.addStretch()
        return panel
        
    def _create_session_analytics_panel(self) -> QWidget:
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        title = SubtitleLabel("Session Analytics")
        layout.addWidget(title)
        layout.addStretch()
        return panel
        
    def _create_achievement_tracker_panel(self) -> QWidget:
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        title = SubtitleLabel("Achievement Tracker")
        layout.addWidget(title)
        layout.addStretch()
        return panel
        
    def _create_fishing_stats_panel(self) -> QWidget:
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        title = SubtitleLabel("Fishing Statistics")
        layout.addWidget(title)
        layout.addStretch()
        return panel
        
    def _create_environmental_effects_panel(self) -> QWidget:
        panel = SimpleCardWidget()
        layout = QVBoxLayout(panel)
        title = SubtitleLabel("Environmental Effects")
        layout.addWidget(title)
        layout.addStretch()
        return panel
        
    def clear_cache(self):
        """Clear the panel cache"""
        self.panel_cache.clear()
        
    def get_cached_panels(self) -> list:
        """Get list of cached panel IDs"""
        return list(self.panel_cache.keys())
