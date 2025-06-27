
"""
Panels Module - Contains all panel implementations
"""

from .core_panels import SessionStatsPanel, RF4SControlPanel, GameStatusPanel
from .analytics_panels import FishingStatsPanel, PerformanceMonitorPanel, CatchAnalysisPanel  
from .tools_panels import SystemMonitorPanel, AutomationToolsPanel, DebugConsolePanel
from .settings_panels import DetectionSettingsPanel, AutomationSettingsPanel, UISettingsPanel

__all__ = [
    # Core panels
    'SessionStatsPanel',
    'RF4SControlPanel', 
    'GameStatusPanel',
    
    # Analytics panels
    'FishingStatsPanel',
    'PerformanceMonitorPanel',
    'CatchAnalysisPanel',
    
    # Tools panels
    'SystemMonitorPanel',
    'AutomationToolsPanel',
    'DebugConsolePanel',
    
    # Settings panels
    'DetectionSettingsPanel',
    'AutomationSettingsPanel',
    'UISettingsPanel'
]
