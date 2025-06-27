
"""
Workspace Manager - Manages workspace layouts and panel organization
"""

from PySide6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout, QGridLayout, QSplitter
from PySide6.QtCore import Qt, Signal

from .panel_factory import PanelFactory


class WorkspaceManager:
    """Manages workspace layouts and panel configurations"""
    
    # Signals
    layout_changed = Signal(str)
    workspace_updated = Signal()
    
    def __init__(self, main_window):
        self.main_window = main_window
        self.panel_factory = PanelFactory()
        self.current_layout = 'dual'
        self.active_panels = {}
        self.workspace_widget = None
        
    def create_workspace(self) -> QWidget:
        """Create workspace with current layout"""
        self.workspace_widget = QWidget()
        self.workspace_widget.setObjectName("workspace")
        
        # Create default layout
        self.update_layout(self.current_layout)
        
        return self.workspace_widget
        
    def update_layout(self, layout_name: str):
        """Update workspace layout"""
        if not self.workspace_widget:
            return
            
        self.current_layout = layout_name
        
        # Clear existing layout
        if self.workspace_widget.layout():
            self.clear_layout(self.workspace_widget.layout())
            
        # Create new layout based on type
        if layout_name == 'single':
            self.create_single_panel_layout()
        elif layout_name == 'dual':
            self.create_dual_panel_layout()
        elif layout_name == 'triple':
            self.create_triple_panel_layout()
        elif layout_name == 'quad':
            self.create_quad_panel_layout()
        else:
            self.create_dual_panel_layout()  # Default
            
        self.layout_changed.emit(layout_name)
        self.workspace_updated.emit()
        
    def create_single_panel_layout(self):
        """Create single panel layout"""
        layout = QVBoxLayout(self.workspace_widget)
        
        # Create main panel
        main_panel = self.panel_factory.create_panel('session_stats')
        self.active_panels['main'] = main_panel
        layout.addWidget(main_panel)
        
    def create_dual_panel_layout(self):
        """Create dual panel layout"""
        layout = QHBoxLayout(self.workspace_widget)
        
        # Create splitter for resizable panels
        splitter = QSplitter(Qt.Orientation.Horizontal)
        
        # Left panel
        left_panel = self.panel_factory.create_panel('rf4s_control')
        self.active_panels['left'] = left_panel
        splitter.addWidget(left_panel)
        
        # Right panel
        right_panel = self.panel_factory.create_panel('session_stats')
        self.active_panels['right'] = right_panel
        splitter.addWidget(right_panel)
        
        # Set equal sizes
        splitter.setSizes([300, 300])
        
        layout.addWidget(splitter)
        
    def create_triple_panel_layout(self):
        """Create triple panel layout"""
        layout = QHBoxLayout(self.workspace_widget)
        
        # Create main splitter
        main_splitter = QSplitter(Qt.Orientation.Horizontal)
        
        # Left panel
        left_panel = self.panel_factory.create_panel('rf4s_control')
        self.active_panels['left'] = left_panel
        main_splitter.addWidget(left_panel)
        
        # Right side with vertical split
        right_splitter = QSplitter(Qt.Orientation.Vertical)
        
        top_right_panel = self.panel_factory.create_panel('session_stats')
        self.active_panels['top_right'] = top_right_panel
        right_splitter.addWidget(top_right_panel)
        
        bottom_right_panel = self.panel_factory.create_panel('game_status')
        self.active_panels['bottom_right'] = bottom_right_panel
        right_splitter.addWidget(bottom_right_panel)
        
        main_splitter.addWidget(right_splitter)
        main_splitter.setSizes([250, 350])
        
        layout.addWidget(main_splitter)
        
    def create_quad_panel_layout(self):
        """Create quad panel layout"""
        layout = QGridLayout(self.workspace_widget)
        
        # Create four panels in grid
        panels = [
            ('rf4s_control', 0, 0),
            ('session_stats', 0, 1),
            ('game_status', 1, 0),
            ('fishing_stats', 1, 1)
        ]
        
        for panel_id, row, col in panels:
            panel = self.panel_factory.create_panel(panel_id)
            self.active_panels[f'panel_{row}_{col}'] = panel
            layout.addWidget(panel, row, col)
            
    def update_panel_data(self, panel_type: str, data: dict):
        """Update panel with new data"""
        # Find panels that need updating
        for panel_key, panel in self.active_panels.items():
            if hasattr(panel, 'update_stats') and panel_type in ['session_stats']:
                panel.update_stats(data)
            elif hasattr(panel, 'update_bot_status') and panel_type in ['rf4s_control']:
                panel.update_bot_status(data.get('running', False))
            elif hasattr(panel, 'update_connection_status') and panel_type in ['game_status']:
                panel.update_connection_status(data.get('connected', False))
                
    def get_active_panel_count(self) -> int:
        """Get number of active panels"""
        return len(self.active_panels)
        
    def clear_layout(self, layout):
        """Clear all widgets from layout"""
        while layout.count():
            child = layout.takeAt(0)
            if child.widget():
                child.widget().deleteLater()
