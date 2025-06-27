
"""
Workspace Navigation Component - Manages navigation interface and panel selection
"""

from PySide6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout, QStackedWidget
from PySide6.QtCore import Qt, Signal, QObject

from qfluentwidgets import (
    NavigationInterface, NavigationItemPosition, FluentIcon
)


class WorkspaceNavigation(QObject):
    """Manages workspace navigation interface"""
    
    panel_selected = Signal(str)  # Panel ID
    
    def __init__(self, parent_window):
        super().__init__()
        self.parent_window = parent_window
        self.navigation = None
        
    def create_navigation_interface(self, parent_widget: QWidget) -> NavigationInterface:
        """Create the navigation interface with all panels"""
        self.navigation = NavigationInterface(parent_widget)
        
        # Main category panels
        self.navigation.addItem(
            'script-control',
            FluentIcon.PLAY,
            'Bot Control',
            lambda: self.panel_selected.emit('script-control')
        )
        
        self.navigation.addItem(
            'fishing-profiles', 
            FluentIcon.PEOPLE,
            'Profiles',
            lambda: self.panel_selected.emit('fishing-profiles')
        )
        
        self.navigation.addItem(
            'system-monitor',
            FluentIcon.SPEED_OFF,  
            'Monitor',
            lambda: self.panel_selected.emit('system-monitor')
        )
        
        # Add separator
        self.navigation.addSeparator()
        
        # Settings panels
        self.navigation.addItem(
            'detection-settings',
            FluentIcon.VIEW,
            'Detection',
            lambda: self.panel_selected.emit('detection-settings')
        )
        
        self.navigation.addItem(
            'automation-settings',
            FluentIcon.ROBOT,
            'Automation', 
            lambda: self.panel_selected.emit('automation-settings')
        )
        
        self.navigation.addItem(
            'equipment-setup',
            FluentIcon.SETTING,
            'Equipment',
            lambda: self.panel_selected.emit('equipment-setup')
        )
        
        self.navigation.addItem(
            'config-dashboard',
            FluentIcon.DATABASE,
            'Config Editor',
            lambda: self.panel_selected.emit('config-dashboard')
        )
        
        self.navigation.addItem(
            'key-bindings',
            FluentIcon.KEYBOARD,
            'Key Bindings',
            lambda: self.panel_selected.emit('key-bindings')
        )
        
        self.navigation.addItem(
            'stat-management',
            FluentIcon.HEART,
            'Player Stats',
            lambda: self.panel_selected.emit('stat-management')
        )
        
        self.navigation.addItem(
            'friction-brake',
            FluentIcon.STOP,
            'Friction Brake',
            lambda: self.panel_selected.emit('friction-brake')
        )
        
        self.navigation.addItem(
            'keepnet-settings',
            FluentIcon.ARCHIVE,
            'Keepnet',
            lambda: self.panel_selected.emit('keepnet-settings')
        )
        
        self.navigation.addItem(
            'notification-settings',
            FluentIcon.MAIL,
            'Notifications',
            lambda: self.panel_selected.emit('notification-settings')
        )
        
        self.navigation.addItem(
            'pause-settings',
            FluentIcon.PAUSE,
            'Auto Pause',
            lambda: self.panel_selected.emit('pause-settings')
        )
        
        self.navigation.addItem(
            'advanced-settings',
            FluentIcon.DEVELOPER_TOOLS,
            'Advanced',
            lambda: self.panel_selected.emit('advanced-settings')
        )
        
        # Add another separator
        self.navigation.addSeparator()
        
        # Tools panels
        self.navigation.addItem(
            'cli-terminal',
            FluentIcon.COMMAND_PROMPT,
            'Console',
            lambda: self.panel_selected.emit('cli-terminal')
        )
        
        self.navigation.addItem(
            'ui-customization',
            FluentIcon.PALETTE,
            'UI Theme',
            lambda: self.panel_selected.emit('ui-customization')
        )
        
        self.navigation.addItem(
            'screenshot-sharing',
            FluentIcon.CAMERA,
            'Screenshots',
            lambda: self.panel_selected.emit('screenshot-sharing')
        )
        
        self.navigation.addItem(
            'game-integration',
            FluentIcon.GAME,
            'Game Link',
            lambda: self.panel_selected.emit('game-integration')
        )
        
        self.navigation.addItem(
            'network-status',
            FluentIcon.WIFI,
            'Network',
            lambda: self.panel_selected.emit('network-status')
        )
        
        self.navigation.addItem(
            'error-diagnostics',
            FluentIcon.FLAG,
            'Diagnostics',
            lambda: self.panel_selected.emit('error-diagnostics')
        )
        
        self.navigation.addItem(
            'save-load-manager',
            FluentIcon.SAVE,
            'Save/Load',
            lambda: self.panel_selected.emit('save-load-manager')
        )
        
        self.navigation.addItem(
            'performance-stats',
            FluentIcon.SPEED_OFF,
            'Performance',
            lambda: self.panel_selected.emit('performance-stats')
        )
        
        # Add final separator
        self.navigation.addSeparator()
        
        # Smart/AI panels
        self.navigation.addItem(
            'ai-tuning',
            FluentIcon.ROBOT,
            'AI Tuning',
            lambda: self.panel_selected.emit('ai-tuning')
        )
        
        self.navigation.addItem(
            'smart-analytics',
            FluentIcon.CHART,
            'Analytics',
            lambda: self.panel_selected.emit('smart-analytics')
        )
        
        self.navigation.addItem(
            'session-analytics',
            FluentIcon.HISTORY,
            'Sessions',
            lambda: self.panel_selected.emit('session-analytics')
        )
        
        self.navigation.addItem(
            'achievement-tracker',
            FluentIcon.TROPHY,
            'Achievements',
            lambda: self.panel_selected.emit('achievement-tracker')
        )
        
        self.navigation.addItem(
            'fishing-stats',
            FluentIcon.FISH,
            'Fishing Stats',
            lambda: self.panel_selected.emit('fishing-stats')
        )
        
        self.navigation.addItem(
            'environmental-effects',
            FluentIcon.CLOUD,
            'Environment',
            lambda: self.panel_selected.emit('environmental-effects')
        )
        
        return self.navigation
