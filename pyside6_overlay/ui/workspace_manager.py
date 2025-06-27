
"""
Workspace Manager - Manages panel layout and workspace organization
"""

from PySide6.QtWidgets import QWidget, QVBoxLayout
from PySide6.QtCore import Signal, QObject

from .panel_factory import PanelFactory
from .components.workspace_layout_selector import WorkspaceLayoutSelector
from .components.workspace_navigation import WorkspaceNavigation
from .components.workspace_content import WorkspaceContent
from typing import List


class WorkspaceManager(QObject):
    """Manages workspace layouts and panel organization"""
    
    layout_changed = Signal(str)  # Layout name
    panel_added = Signal(str)    # Panel ID
    panel_removed = Signal(str)  # Panel ID
    
    def __init__(self, parent_window):
        super().__init__()
        self.parent_window = parent_window
        self.panel_factory = PanelFactory()
        
        # Initialize components
        self.layout_selector = WorkspaceLayoutSelector(parent_window)
        self.navigation = WorkspaceNavigation(parent_window)
        self.content = WorkspaceContent(parent_window, self.panel_factory)
        
        self.workspace_widget = None
        self.setup_connections()
        
    def setup_connections(self):
        """Setup signal connections between components"""
        # Layout selector signals
        self.layout_selector.layout_changed.connect(self.on_layout_changed)
        
        # Navigation signals
        self.navigation.panel_selected.connect(self.on_panel_selected)
        
        # Forward layout changes
        self.layout_selector.layout_changed.connect(self.layout_changed.emit)
        
    def create_workspace(self) -> QWidget:
        """Create the main workspace widget"""
        self.workspace_widget = QWidget()
        main_layout = QVBoxLayout(self.workspace_widget)
        main_layout.setContentsMargins(5, 5, 5, 5)
        
        # Layout selector
        layout_selector_widget = self.layout_selector.create_layout_selector()
        main_layout.addWidget(layout_selector_widget)
        
        # Content area
        content_widget = self.content.create_content_area(self.workspace_widget)
        main_layout.addWidget(content_widget, 1)
        
        # Initialize with single panel layout
        self.setup_single_panel_layout()
        
        return self.workspace_widget
        
    def on_layout_changed(self, layout_id: str):
        """Handle layout change"""
        self.content.set_layout(layout_id)
        
        # Setup new layout
        if layout_id == 'single':
            self.setup_single_panel_layout()
        elif layout_id == 'dual':
            self.content.setup_dual_panel_layout()
        elif layout_id == 'triple':
            self.content.setup_triple_panel_layout()
        elif layout_id == 'tabs':
            self.content.setup_tabbed_layout()
            
    def on_panel_selected(self, panel_id: str):
        """Handle panel selection from navigation"""
        self.content.show_panel(panel_id)
        
        if panel_id not in self.content.get_active_panels():
            self.panel_added.emit(panel_id)
            
    def setup_single_panel_layout(self):
        """Setup single panel layout"""
        # Create navigation interface
        navigation_widget = self.navigation.create_navigation_interface(self.content.panel_container)
        
        # Setup layout with navigation
        self.content.setup_single_panel_layout(navigation_widget)
        
        # Show default panel
        self.content.show_panel('script-control')
        
    def get_current_layout(self) -> str:
        """Get current layout name"""
        return self.layout_selector.get_current_layout()
        
    def get_active_panels(self) -> List[str]:
        """Get list of active panel IDs"""
        return self.content.get_active_panels()
        
    def add_panel(self, panel_id: str) -> bool:
        """Add panel to current workspace"""
        success = self.content.add_panel(panel_id)
        if success:
            self.panel_added.emit(panel_id)
        return success
        
    def remove_panel(self, panel_id: str) -> bool:
        """Remove panel from workspace"""
        success = self.content.remove_panel(panel_id)
        if success:
            self.panel_removed.emit(panel_id)
        return success
