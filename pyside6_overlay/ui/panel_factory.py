
"""
Panel Factory - Creates and manages UI panels
"""

from PySide6.QtWidgets import QWidget, QVBoxLayout
from PySide6.QtCore import QObject

from qfluentwidgets import (
    SubtitleLabel, BodyLabel, SimpleCardWidget
)

from .panels.core_panels import CorePanelCreator
from .panels.settings_panels import SettingsPanelCreator
from .panels.tools_panels import ToolsPanelCreator  
from .panels.analytics_panels import AnalyticsPanelCreator

from typing import Dict, Any, Optional


class PanelFactory(QObject):
    """Factory for creating UI panels"""
    
    def __init__(self):
        super().__init__()
        self.panel_cache = {}
        
        # Initialize panel creators
        self.core_creator = CorePanelCreator()
        self.settings_creator = SettingsPanelCreator()
        self.tools_creator = ToolsPanelCreator()
        self.analytics_creator = AnalyticsPanelCreator()
        
    def create_panel(self, panel_id: str, config: Dict[str, Any]) -> Optional[QWidget]:
        """Create a panel by ID"""
        try:
            # Use cached panel if available
            if panel_id in self.panel_cache:
                return self.panel_cache[panel_id]
                
            panel = None
            
            # Core panels
            if panel_id == 'script-control':
                panel = self.core_creator.create_script_control_panel()
            elif panel_id == 'fishing-profiles':
                panel = self.core_creator.create_fishing_profiles_panel()
            elif panel_id == 'system-monitor':
                panel = self.core_creator.create_system_monitor_panel()
            elif panel_id == 'detection-settings':
                panel = self.core_creator.create_detection_settings_panel()
                
            # Settings panels
            elif panel_id == 'automation-settings':
                panel = self.settings_creator.create_automation_settings_panel()
            elif panel_id == 'equipment-setup':
                panel = self.settings_creator.create_equipment_setup_panel()
            elif panel_id == 'config-dashboard':
                panel = self.settings_creator.create_config_dashboard_panel()
            elif panel_id == 'key-bindings':
                panel = self.settings_creator.create_key_bindings_panel()
            elif panel_id == 'stat-management':
                panel = self.settings_creator.create_stat_management_panel()
            elif panel_id == 'friction-brake':
                panel = self.settings_creator.create_friction_brake_panel()
            elif panel_id == 'keepnet-settings':
                panel = self.settings_creator.create_keepnet_settings_panel()
            elif panel_id == 'notification-settings':
                panel = self.settings_creator.create_notification_settings_panel()
            elif panel_id == 'pause-settings':
                panel = self.settings_creator.create_pause_settings_panel()
            elif panel_id == 'advanced-settings':
                panel = self.settings_creator.create_advanced_settings_panel()
                
            # Tools panels
            elif panel_id == 'cli-terminal':
                panel = self.tools_creator.create_cli_terminal_panel()
            elif panel_id == 'ui-customization':
                panel = self.tools_creator.create_ui_customization_panel()
            elif panel_id == 'screenshot-sharing':
                panel = self.tools_creator.create_screenshot_sharing_panel()
            elif panel_id == 'game-integration':
                panel = self.tools_creator.create_game_integration_panel()
            elif panel_id == 'network-status':
                panel = self.tools_creator.create_network_status_panel()
            elif panel_id == 'error-diagnostics':
                panel = self.tools_creator.create_error_diagnostics_panel()
            elif panel_id == 'save-load-manager':
                panel = self.tools_creator.create_save_load_manager_panel()
            elif panel_id == 'performance-stats':
                panel = self.tools_creator.create_performance_stats_panel()
                
            # Analytics panels
            elif panel_id == 'ai-tuning':
                panel = self.analytics_creator.create_ai_tuning_panel()
            elif panel_id == 'smart-analytics':
                panel = self.analytics_creator.create_smart_analytics_panel()
            elif panel_id == 'session-analytics':
                panel = self.analytics_creator.create_session_analytics_panel()
            elif panel_id == 'achievement-tracker':
                panel = self.analytics_creator.create_achievement_tracker_panel()
            elif panel_id == 'fishing-stats':
                panel = self.analytics_creator.create_fishing_stats_panel()
            elif panel_id == 'environmental-effects':
                panel = self.analytics_creator.create_environmental_effects_panel()
            else:
                panel = self._create_default_panel(panel_id)
                
            if panel:
                self.panel_cache[panel_id] = panel
                
            return panel
            
        except Exception as e:
            print(f"Error creating panel {panel_id}: {e}")
            return self._create_error_panel(panel_id, str(e))
            
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
        
    def clear_cache(self):
        """Clear the panel cache"""
        self.panel_cache.clear()
        
    def get_cached_panels(self) -> list:
        """Get list of cached panel IDs"""
        return list(self.panel_cache.keys())
