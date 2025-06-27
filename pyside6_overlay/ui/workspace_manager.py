
"""
Workspace Manager - Manages panel layout and workspace organization
"""

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QSplitter,
    QScrollArea, QFrame, QTabWidget, QStackedWidget
)
from PySide6.QtCore import Qt, Signal, QObject

from qfluentwidgets import (
    SegmentedWidget, CardWidget, FluentIcon,
    NavigationInterface, NavigationItemPosition,
    SubtitleLabel, BodyLabel
)

from .panel_factory import PanelFactory
from typing import List, Dict, Optional


class WorkspaceManager(QObject):
    """Manages workspace layouts and panel organization"""
    
    layout_changed = Signal(str)  # Layout name
    panel_added = Signal(str)    # Panel ID
    panel_removed = Signal(str)  # Panel ID
    
    def __init__(self, parent_window):
        super().__init__()
        self.parent_window = parent_window
        self.panel_factory = PanelFactory()
        
        # Layout options
        self.layouts = {
            'single': "Single Panel",
            'dual': "Dual Panel", 
            'triple': "Triple Panel",
            'tabs': "Tabbed View"
        }
        
        self.current_layout = 'single'
        self.active_panels: List[str] = []
        self.workspace_widget = None
        
    def create_workspace(self) -> QWidget:
        """Create the main workspace widget"""
        self.workspace_widget = QWidget()
        main_layout = QVBoxLayout(self.workspace_widget)
        main_layout.setContentsMargins(5, 5, 5, 5)
        
        # Layout selector
        self.layout_selector = SegmentedWidget()
        for layout_id, layout_name in self.layouts.items():
            self.layout_selector.addItem(layout_id, layout_name)
            
        self.layout_selector.setCurrentItem('single')
        self.layout_selector.currentItemChanged.connect(self.on_layout_changed)
        
        main_layout.addWidget(self.layout_selector)
        
        # Panel container
        self.panel_container = QWidget()
        self.panel_layout = QVBoxLayout(self.panel_container)
        
        main_layout.addWidget(self.panel_container, 1)
        
        # Initialize with single panel layout
        self.setup_single_panel_layout()
        
        return self.workspace_widget
        
    def on_layout_changed(self, layout_id: str):
        """Handle layout change"""
        if layout_id == self.current_layout:
            return
            
        self.current_layout = layout_id
        
        # Clear current layout
        self.clear_panel_container()
        
        # Setup new layout
        if layout_id == 'single':
            self.setup_single_panel_layout()
        elif layout_id == 'dual':
            self.setup_dual_panel_layout()
        elif layout_id == 'triple':
            self.setup_triple_panel_layout()
        elif layout_id == 'tabs':
            self.setup_tabbed_layout()
            
        self.layout_changed.emit(layout_id)
        
    def setup_single_panel_layout(self):
        """Setup single panel layout"""
        # Create navigation for panel selection
        self.navigation = NavigationInterface(self.panel_container)
        
        # Main category panels
        self.navigation.addItem(
            'script-control',
            FluentIcon.PLAY,
            'Bot Control',
            lambda: self.show_panel('script-control')
        )
        
        self.navigation.addItem(
            'fishing-profiles', 
            FluentIcon.PEOPLE,
            'Profiles',
            lambda: self.show_panel('fishing-profiles')
        )
        
        self.navigation.addItem(
            'system-monitor',
            FluentIcon.SPEED_OFF,  
            'Monitor',
            lambda: self.show_panel('system-monitor')
        )
        
        # Add separator
        self.navigation.addSeparator()
        
        # Settings panels
        self.navigation.addItem(
            'detection-settings',
            FluentIcon.VIEW,
            'Detection',
            lambda: self.show_panel('detection-settings')
        )
        
        self.navigation.addItem(
            'automation-settings',
            FluentIcon.ROBOT,
            'Automation', 
            lambda: self.show_panel('automation-settings')
        )
        
        self.navigation.addItem(
            'equipment-setup',
            FluentIcon.SETTING,
            'Equipment',
            lambda: self.show_panel('equipment-setup')
        )
        
        self.navigation.addItem(
            'config-dashboard',
            FluentIcon.DATABASE,
            'Config Editor',
            lambda: self.show_panel('config-dashboard')
        )
        
        self.navigation.addItem(
            'key-bindings',
            FluentIcon.KEYBOARD,
            'Key Bindings',
            lambda: self.show_panel('key-bindings')
        )
        
        self.navigation.addItem(
            'stat-management',
            FluentIcon.HEART,
            'Player Stats',
            lambda: self.show_panel('stat-management')
        )
        
        self.navigation.addItem(
            'friction-brake',
            FluentIcon.STOP,
            'Friction Brake',
            lambda: self.show_panel('friction-brake')
        )
        
        self.navigation.addItem(
            'keepnet-settings',
            FluentIcon.ARCHIVE,
            'Keepnet',
            lambda: self.show_panel('keepnet-settings')
        )
        
        self.navigation.addItem(
            'notification-settings',
            FluentIcon.MAIL,
            'Notifications',
            lambda: self.show_panel('notification-settings')
        )
        
        self.navigation.addItem(
            'pause-settings',
            FluentIcon.PAUSE,
            'Auto Pause',
            lambda: self.show_panel('pause-settings')
        )
        
        self.navigation.addItem(
            'advanced-settings',
            FluentIcon.DEVELOPER_TOOLS,
            'Advanced',
            lambda: self.show_panel('advanced-settings')
        )
        
        # Add another separator
        self.navigation.addSeparator()
        
        # Tools panels
        self.navigation.addItem(
            'cli-terminal',
            FluentIcon.COMMAND_PROMPT,
            'Console',
            lambda: self.show_panel('cli-terminal')
        )
        
        self.navigation.addItem(
            'ui-customization',
            FluentIcon.PALETTE,
            'UI Theme',
            lambda: self.show_panel('ui-customization')
        )
        
        self.navigation.addItem(
            'screenshot-sharing',
            FluentIcon.CAMERA,
            'Screenshots',
            lambda: self.show_panel('screenshot-sharing')
        )
        
        self.navigation.addItem(
            'game-integration',
            FluentIcon.GAME,
            'Game Link',
            lambda: self.show_panel('game-integration')
        )
        
        self.navigation.addItem(
            'network-status',
            FluentIcon.WIFI,
            'Network',
            lambda: self.show_panel('network-status')
        )
        
        self.navigation.addItem(
            'error-diagnostics',
            FluentIcon.FLAG,
            'Diagnostics',
            lambda: self.show_panel('error-diagnostics')
        )
        
        self.navigation.addItem(
            'save-load-manager',
            FluentIcon.SAVE,
            'Save/Load',
            lambda: self.show_panel('save-load-manager')
        )
        
        self.navigation.addItem(
            'performance-stats',
            FluentIcon.SPEED_OFF,
            'Performance',
            lambda: self.show_panel('performance-stats')
        )
        
        # Add final separator
        self.navigation.addSeparator()
        
        # Smart/AI panels
        self.navigation.addItem(
            'ai-tuning',
            FluentIcon.ROBOT,
            'AI Tuning',
            lambda: self.show_panel('ai-tuning')
        )
        
        self.navigation.addItem(
            'smart-analytics',
            FluentIcon.CHART,
            'Analytics',
            lambda: self.show_panel('smart-analytics')
        )
        
        self.navigation.addItem(
            'session-analytics',
            FluentIcon.HISTORY,
            'Sessions',
            lambda: self.show_panel('session-analytics')
        )
        
        self.navigation.addItem(
            'achievement-tracker',
            FluentIcon.TROPHY,
            'Achievements',
            lambda: self.show_panel('achievement-tracker')
        )
        
        self.navigation.addItem(
            'fishing-stats',
            FluentIcon.FISH,
            'Fishing Stats',
            lambda: self.show_panel('fishing-stats')
        )
        
        self.navigation.addItem(
            'environmental-effects',
            FluentIcon.CLOUD,
            'Environment',
            lambda: self.show_panel('environmental-effects')
        )
        
        # Panel display area
        self.panel_display = QStackedWidget()
        
        # Create horizontal layout for navigation + panel
        nav_layout = QHBoxLayout(self.panel_container)
        nav_layout.addWidget(self.navigation, 0)
        nav_layout.addWidget(self.panel_display, 1)
        
        # Show default panel
        self.show_panel('script-control')

    # ... keep existing code (setup_dual_panel_layout, setup_triple_panel_layout, setup_tabbed_layout, show_panel, clear_panel_container, other methods)

    def setup_dual_panel_layout(self):
        """Setup dual panel layout"""
        splitter = QSplitter(Qt.Orientation.Horizontal)
        
        # Left panel
        left_panel = self.panel_factory.create_panel('script-control', {})
        if left_panel:
            splitter.addWidget(left_panel)
            
        # Right panel  
        right_panel = self.panel_factory.create_panel('detection-settings', {})
        if right_panel:
            splitter.addWidget(right_panel)
            
        # Set equal sizes
        splitter.setSizes([600, 600])
        
        layout = QHBoxLayout(self.panel_container)
        layout.addWidget(splitter)
        
    def setup_triple_panel_layout(self):
        """Setup triple panel layout"""
        # Main horizontal splitter
        main_splitter = QSplitter(Qt.Orientation.Horizontal)
        
        # Left panel
        left_panel = self.panel_factory.create_panel('script-control', {})
        if left_panel:
            main_splitter.addWidget(left_panel)
            
        # Right side vertical splitter
        right_splitter = QSplitter(Qt.Orientation.Vertical)
        
        # Top right panel
        top_right_panel = self.panel_factory.create_panel('fishing-profiles', {})
        if top_right_panel:
            right_splitter.addWidget(top_right_panel)
            
        # Bottom right panel
        bottom_right_panel = self.panel_factory.create_panel('system-monitor', {})
        if bottom_right_panel:
            right_splitter.addWidget(bottom_right_panel)
            
        right_splitter.setSizes([400, 400])
        main_splitter.addWidget(right_splitter)
        
        # Set main splitter sizes
        main_splitter.setSizes([600, 600])
        
        layout = QHBoxLayout(self.panel_container)
        layout.addWidget(main_splitter)
        
    def setup_tabbed_layout(self):
        """Setup tabbed panel layout"""
        tab_widget = QTabWidget()
        
        # Add main panels as tabs
        main_panels = [
            ('script-control', 'Bot Control', FluentIcon.PLAY),
            ('fishing-profiles', 'Profiles', FluentIcon.PEOPLE),
            ('detection-settings', 'Detection', FluentIcon.VIEW),
            ('system-monitor', 'Monitor', FluentIcon.SPEED_OFF),
            ('cli-terminal', 'Console', FluentIcon.COMMAND_PROMPT),
            ('session-analytics', 'Analytics', FluentIcon.CHART),
        ]
        
        for panel_id, title, icon in main_panels:
            panel = self.panel_factory.create_panel(panel_id, {})
            if panel:
                tab_widget.addTab(panel, title)
                
        layout = QVBoxLayout(self.panel_container)
        layout.addWidget(tab_widget)
        
    def show_panel(self, panel_id: str):
        """Show specific panel in current layout"""
        if self.current_layout == 'single':
            panel = self.panel_factory.create_panel(panel_id, {})
            if panel:
                # Clear and add panel
                while self.panel_display.count() > 0:
                    widget = self.panel_display.widget(0)
                    self.panel_display.removeWidget(widget)
                    
                self.panel_display.addWidget(panel)
                self.panel_display.setCurrentWidget(panel)
                
                if panel_id not in self.active_panels:
                    self.active_panels.append(panel_id)
                    self.panel_added.emit(panel_id)
                    
    def clear_panel_container(self):
        """Clear the panel container"""
        # Remove all widgets from panel container
        while self.panel_layout.count():
            child = self.panel_layout.takeAt(0)
            if child.widget():
                child.widget().deleteLater()
                
        # Clear active panels
        self.active_panels.clear()
        
    def get_current_layout(self) -> str:
        """Get current layout name"""
        return self.current_layout
        
    def get_active_panels(self) -> List[str]:
        """Get list of active panel IDs"""
        return self.active_panels.copy()
        
    def add_panel(self, panel_id: str) -> bool:
        """Add panel to current workspace"""
        if panel_id in self.active_panels:
            return False
            
        panel = self.panel_factory.create_panel(panel_id, {})
        if panel and self.current_layout == 'single':
            self.show_panel(panel_id)
            return True
            
        return False
        
    def remove_panel(self, panel_id: str) -> bool:
        """Remove panel from workspace"""
        if panel_id in self.active_panels:
            self.active_panels.remove(panel_id)
            self.panel_removed.emit(panel_id)
            return True
            
        return False
