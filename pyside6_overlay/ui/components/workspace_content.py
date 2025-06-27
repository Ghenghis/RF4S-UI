
"""
Workspace Content Component - Manages panel content display and layout organization
"""

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QSplitter,
    QStackedWidget, QTabWidget
)
from PySide6.QtCore import Qt, Signal, QObject

from qfluentwidgets import FluentIcon
from ..panel_factory import PanelFactory
from typing import List


class WorkspaceContent(QObject):
    """Manages workspace content display and panel organization"""
    
    def __init__(self, parent_window, panel_factory: PanelFactory):
        super().__init__()
        self.parent_window = parent_window
        self.panel_factory = panel_factory
        self.current_layout = 'single'
        self.active_panels: List[str] = []
        
        # Content widgets
        self.panel_display = None
        self.panel_container = None
        
    def create_content_area(self, parent_widget: QWidget) -> QWidget:
        """Create the content area for panels"""
        self.panel_container = QWidget()
        self.panel_layout = QVBoxLayout(self.panel_container)
        
        # Panel display area
        self.panel_display = QStackedWidget()
        
        return self.panel_container
        
    def setup_single_panel_layout(self, navigation_widget: QWidget):
        """Setup single panel layout with navigation"""
        # Create horizontal layout for navigation + panel
        nav_layout = QHBoxLayout(self.panel_container)
        nav_layout.addWidget(navigation_widget, 0)
        nav_layout.addWidget(self.panel_display, 1)
        
    def setup_dual_panel_layout(self):
        """Setup dual panel layout"""
        # Clear existing layout
        self.clear_panel_container()
        
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
        # Clear existing layout
        self.clear_panel_container()
        
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
        # Clear existing layout
        self.clear_panel_container()
        
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
                    
    def clear_panel_container(self):
        """Clear the panel container"""
        # Remove all widgets from panel container
        while self.panel_layout.count():
            child = self.panel_layout.takeAt(0)
            if child.widget():
                child.widget().deleteLater()
                
        # Clear active panels
        self.active_panels.clear()
        
    def set_layout(self, layout_id: str):
        """Set the current layout"""
        self.current_layout = layout_id
        
    def get_active_panels(self) -> List[str]:
        """Get list of active panel IDs"""
        return self.active_panels.copy()
        
    def add_panel(self, panel_id: str) -> bool:
        """Add panel to current workspace"""
        if panel_id in self.active_panels:
            return False
            
        if self.current_layout == 'single':
            self.show_panel(panel_id)
            return True
            
        return False
        
    def remove_panel(self, panel_id: str) -> bool:
        """Remove panel from workspace"""
        if panel_id in self.active_panels:
            self.active_panels.remove(panel_id)
            return True
            
        return False
