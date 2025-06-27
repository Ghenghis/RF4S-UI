
"""
Workspace Manager - Manages workspace layouts and panel organization
"""

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QSplitter, 
    QTabWidget, QStackedWidget, QFrame
)
from PySide6.QtCore import Qt, QObject, Signal

from qfluentwidgets import (
    NavigationInterface, NavigationItemPosition, FluentIcon,
    Pivot, PivotItem, CardWidget
)

from .panel_factory import PanelFactory
from ..components.panel_manager import PanelManager


class WorkspaceManager(QObject):
    """Manages workspace layouts and panel organization"""
    
    # Signals
    layout_changed = Signal(str)
    panel_activated = Signal(str)
    workspace_updated = Signal()
    
    def __init__(self, parent_window):
        super().__init__()
        self.parent_window = parent_window
        self.panel_manager = PanelManager()
        self.panel_factory = PanelFactory()
        
        # Workspace widgets
        self.main_workspace = None
        self.navigation_widget = None
        self.content_widget = None
        self.splitter = None
        
        # Active panels
        self.active_panels = {}
        self.current_layout = 'dual'
        
        # Connect panel manager signals
        self.panel_manager.layout_changed.connect(self.on_layout_changed)
        self.panel_manager.panel_added.connect(self.on_panel_added)
        self.panel_manager.panel_removed.connect(self.on_panel_removed)
        
    def create_workspace(self) -> QWidget:
        """Create the main workspace widget"""
        self.main_workspace = QWidget()
        layout = QHBoxLayout(self.main_workspace)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        
        # Create main splitter
        self.splitter = QSplitter(Qt.Orientation.Horizontal)
        layout.addWidget(self.splitter)
        
        # Create navigation area
        self.create_navigation_area()
        
        # Create content area
        self.create_content_area()
        
        # Setup initial layout
        self.setup_initial_layout()
        
        return self.main_workspace
        
    def create_navigation_area(self):
        """Create navigation area with panel switcher"""
        nav_widget = QFrame()
        nav_widget.setFixedWidth(200)
        nav_widget.setFrameStyle(QFrame.Shape.StyledPanel)
        
        nav_layout = QVBoxLayout(nav_widget)
        nav_layout.setContentsMargins(5, 5, 5, 5)
        
        # Navigation interface
        self.navigation_widget = NavigationInterface(nav_widget)
        nav_layout.addWidget(self.navigation_widget)
        
        # Add to splitter
        self.splitter.addWidget(nav_widget)
        
        # Setup navigation items
        self.setup_navigation_items()
        
    def create_content_area(self):
        """Create content area for panels"""
        self.content_widget = QStackedWidget()
        self.splitter.addWidget(self.content_widget)
        
        # Set splitter proportions
        self.splitter.setStretchFactor(0, 0)  # Navigation fixed
        self.splitter.setStretchFactor(1, 1)  # Content expandable
        
    def setup_navigation_items(self):
        """Setup navigation items for different panel categories"""
        # Core panels
        self.navigation_widget.addItem(
            routeKey='core',
            icon=FluentIcon.HOME,
            text='Core',
            onClick=lambda: self.switch_to_category('core'),
            position=NavigationItemPosition.TOP
        )
        
        # Analytics panels
        self.navigation_widget.addItem(
            routeKey='analytics',
            icon=FluentIcon.CHART,
            text='Analytics',
            onClick=lambda: self.switch_to_category('analytics'),
            position=NavigationItemPosition.TOP
        )
        
        # Tools panels
        self.navigation_widget.addItem(
            routeKey='tools',
            icon=FluentIcon.SETTING,
            text='Tools',
            onClick=lambda: self.switch_to_category('tools'),
            position=NavigationItemPosition.TOP
        )
        
        # Settings
        self.navigation_widget.addItem(
            routeKey='settings',
            icon=FluentIcon.SETTING,
            text='Settings',
            onClick=lambda: self.switch_to_category('settings'),
            position=NavigationItemPosition.BOTTOM
        )
        
    def setup_initial_layout(self):
        """Setup initial workspace layout"""
        # Create initial panels based on current layout
        layout_info = self.panel_manager.get_layout_info()
        panel_count = layout_info.get('panels', 2)
        
        # Add default panels
        if panel_count >= 1:
            self.add_panel('session_stats', 'core')
        if panel_count >= 2:
            self.add_panel('rf4s_control', 'core')
        if panel_count >= 3:
            self.add_panel('fishing_stats', 'analytics')
        if panel_count >= 4:
            self.add_panel('system_monitor', 'tools')
            
    def switch_to_category(self, category: str):
        """Switch to a panel category"""
        # Create category workspace if not exists
        if category not in self.active_panels:
            self.create_category_workspace(category)
            
        # Find and activate the category widget
        for i in range(self.content_widget.count()):
            widget = self.content_widget.widget(i)
            if hasattr(widget, 'category') and widget.category == category:
                self.content_widget.setCurrentWidget(widget)
                break
                
        self.panel_activated.emit(category)
        
    def create_category_workspace(self, category: str):
        """Create workspace for a specific category"""
        # Create category widget
        category_widget = QWidget()
        category_widget.category = category
        
        layout = QVBoxLayout(category_widget)
        layout.setContentsMargins(10, 10, 10, 10)
        
        # Create panel container based on current layout
        panel_container = self.create_panel_container()
        layout.addWidget(panel_container)
        
        # Add category-specific panels
        self.populate_category_panels(panel_container, category)
        
        # Add to content widget
        self.content_widget.addWidget(category_widget)
        self.active_panels[category] = category_widget
        
    def create_panel_container(self) -> QWidget:
        """Create panel container based on current layout"""
        layout_info = self.panel_manager.get_layout_info()
        orientation = layout_info.get('orientation', 'horizontal')
        panel_count = layout_info.get('panels', 2)
        
        if panel_count == 1:
            return QWidget()
        elif panel_count == 2:
            splitter = QSplitter(Qt.Orientation.Horizontal if orientation == 'horizontal' else Qt.Orientation.Vertical)
            return splitter
        elif panel_count == 3:
            # Create mixed layout
            main_splitter = QSplitter(Qt.Orientation.Horizontal)
            side_splitter = QSplitter(Qt.Orientation.Vertical)
            main_splitter.addWidget(side_splitter)
            return main_splitter
        else:  # quad
            # Create grid-like layout
            main_splitter = QSplitter(Qt.Orientation.Horizontal)
            left_splitter = QSplitter(Qt.Orientation.Vertical)
            right_splitter = QSplitter(Qt.Orientation.Vertical)
            main_splitter.addWidget(left_splitter)
            main_splitter.addWidget(right_splitter)
            return main_splitter
            
    def populate_category_panels(self, container: QWidget, category: str):
        """Populate container with category-specific panels"""
        panels = self.get_category_panels(category)
        
        if isinstance(container, QSplitter):
            for panel_id in panels:
                panel_widget = self.panel_factory.create_panel(panel_id)
                container.addWidget(panel_widget)
        else:
            # Single panel layout
            if panels:
                panel_widget = self.panel_factory.create_panel(panels[0])
                layout = QVBoxLayout(container)
                layout.addWidget(panel_widget)
                
    def get_category_panels(self, category: str) -> list:
        """Get panels for a specific category"""
        category_panels = {
            'core': ['session_stats', 'rf4s_control', 'game_status'],
            'analytics': ['fishing_stats', 'performance_monitor', 'catch_analysis'],
            'tools': ['system_monitor', 'automation_tools', 'debug_console'],
            'settings': ['detection_settings', 'automation_settings', 'ui_settings']
        }
        
        return category_panels.get(category, [])
        
    def add_panel(self, panel_id: str, category: str = 'core'):
        """Add a panel to the workspace"""
        self.panel_manager.add_panel(panel_id, {'category': category})
        
        # Refresh category workspace if it exists
        if category in self.active_panels:
            self.refresh_category_workspace(category)
            
    def remove_panel(self, panel_id: str):
        """Remove a panel from the workspace"""
        self.panel_manager.remove_panel(panel_id)
        self.workspace_updated.emit()
        
    def refresh_category_workspace(self, category: str):
        """Refresh a category workspace with updated panels"""
        if category in self.active_panels:
            # Remove old widget
            old_widget = self.active_panels[category]
            self.content_widget.removeWidget(old_widget)
            old_widget.deleteLater()
            
            # Create new workspace
            del self.active_panels[category]
            self.create_category_workspace(category)
            
    def update_layout(self, layout_name: str):
        """Update workspace layout"""
        self.current_layout = layout_name
        self.panel_manager.set_layout(layout_name)
        
        # Refresh all category workspaces
        for category in list(self.active_panels.keys()):
            self.refresh_category_workspace(category)
            
        self.layout_changed.emit(layout_name)
        
    def get_active_panel_count(self) -> int:
        """Get number of active panels"""
        return len(self.panel_manager.get_active_panels())
        
    def on_layout_changed(self, layout_name: str):
        """Handle layout change from panel manager"""
        self.update_layout(layout_name)
        
    def on_panel_added(self, panel_id: str):
        """Handle panel added event"""
        self.workspace_updated.emit()
        
    def on_panel_removed(self, panel_id: str):
        """Handle panel removed event"""
        self.workspace_updated.emit()
