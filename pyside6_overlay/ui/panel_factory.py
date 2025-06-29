
"""
Panel Factory - Creates different types of panels
"""

from PySide6.QtWidgets import QWidget
from qfluentwidgets import CardWidget

from .panels.core_panels import (
    SessionStatsPanel, RF4SControlPanel, GameStatusPanel
)
from .panels.analytics_panels import (
    FishingStatsPanel, PerformanceMonitorPanel, CatchAnalysisPanel
)
from .panels.tools_panels import (
    SystemMonitorPanel, AutomationToolsPanel, DebugConsolePanel
)
from .panels.settings_panels import (
    DetectionSettingsPanel, AutomationSettingsPanel, UISettingsPanel
)


class PanelFactory:
    """Factory for creating different types of panels"""
    
    def __init__(self):
        # Panel registry
        self.panel_registry = {
            # Core panels
            'session_stats': SessionStatsPanel,
            'rf4s_control': RF4SControlPanel,
            'game_status': GameStatusPanel,
            
            # Analytics panels
            'fishing_stats': FishingStatsPanel,
            'performance_monitor': PerformanceMonitorPanel,
            'catch_analysis': CatchAnalysisPanel,
            
            # Tools panels
            'system_monitor': SystemMonitorPanel,
            'automation_tools': AutomationToolsPanel,
            'debug_console': DebugConsolePanel,
            
            # Settings panels
            'detection_settings': DetectionSettingsPanel,
            'automation_settings': AutomationSettingsPanel,
            'ui_settings': UISettingsPanel
        }
        
    def create_panel(self, panel_id: str) -> QWidget:
        """Create a panel by ID"""
        panel_class = self.panel_registry.get(panel_id)
        
        if panel_class:
            try:
                panel = panel_class()
                
                # Wrap in card for consistent styling
                if not isinstance(panel, CardWidget):
                    card = CardWidget()
                    card.setObjectName(f"{panel_id}_card")
                    return card
                    
                return panel
                
            except Exception as e:
                print(f"Error creating panel {panel_id}: {e}")
                return self.create_placeholder_panel(panel_id)
        else:
            return self.create_placeholder_panel(panel_id)
            
    def create_placeholder_panel(self, panel_id: str) -> QWidget:
        """Create a placeholder panel when panel creation fails"""
        from PySide6.QtWidgets import QLabel, QVBoxLayout
        
        placeholder = CardWidget()
        placeholder.setObjectName(f"{panel_id}_placeholder")
        
        layout = QVBoxLayout(placeholder)
        label = QLabel(f"Panel: {panel_id}")
        label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(label)
        
        return placeholder
        
    def get_available_panels(self, category: str = None) -> list:
        """Get list of available panels, optionally filtered by category"""
        if category:
            category_prefixes = {
                'core': ['session_', 'rf4s_', 'game_'],
                'analytics': ['fishing_', 'performance_', 'catch_'],
                'tools': ['system_', 'automation_', 'debug_'],
                'settings': ['detection_', 'automation_', 'ui_']
            }
            
            prefixes = category_prefixes.get(category, [])
            return [panel_id for panel_id in self.panel_registry.keys() 
                   if any(panel_id.startswith(prefix) for prefix in prefixes)]
        
        return list(self.panel_registry.keys())
        
    def register_panel(self, panel_id: str, panel_class):
        """Register a new panel type"""
        self.panel_registry[panel_id] = panel_class
        
    def unregister_panel(self, panel_id: str):
        """Unregister a panel type"""
        if panel_id in self.panel_registry:
            del self.panel_registry[panel_id]
