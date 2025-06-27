
"""
UI Panels Module
Contains panel creation logic organized by category
"""

from .core_panels import CorePanelCreator
from .settings_panels import SettingsPanelCreator
from .tools_panels import ToolsPanelCreator
from .analytics_panels import AnalyticsPanelCreator

__all__ = [
    'CorePanelCreator',
    'SettingsPanelCreator', 
    'ToolsPanelCreator',
    'AnalyticsPanelCreator'
]
