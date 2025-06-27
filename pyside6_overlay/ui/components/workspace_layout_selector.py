
"""
Workspace Layout Selector Component - Manages layout selection and switching
"""

from PySide6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout
from PySide6.QtCore import Qt, Signal, QObject

from qfluentwidgets import SegmentedWidget


class WorkspaceLayoutSelector(QObject):
    """Manages workspace layout selection and switching"""
    
    layout_changed = Signal(str)  # Layout name
    
    def __init__(self, parent_window):
        super().__init__()
        self.parent_window = parent_window
        
        # Layout options
        self.layouts = {
            'single': "Single Panel",
            'dual': "Dual Panel", 
            'triple': "Triple Panel",
            'tabs': "Tabbed View"
        }
        
        self.current_layout = 'single'
        self.layout_selector = None
        
    def create_layout_selector(self) -> SegmentedWidget:
        """Create the layout selector widget"""
        self.layout_selector = SegmentedWidget()
        
        for layout_id, layout_name in self.layouts.items():
            self.layout_selector.addItem(layout_id, layout_name)
            
        self.layout_selector.setCurrentItem('single')
        self.layout_selector.currentItemChanged.connect(self.on_layout_changed)
        
        return self.layout_selector
        
    def on_layout_changed(self, layout_id: str):
        """Handle layout change"""
        if layout_id == self.current_layout:
            return
            
        self.current_layout = layout_id
        self.layout_changed.emit(layout_id)
        
    def get_current_layout(self) -> str:
        """Get current layout name"""
        return self.current_layout
        
    def get_layouts(self) -> dict:
        """Get available layouts"""
        return self.layouts.copy()
