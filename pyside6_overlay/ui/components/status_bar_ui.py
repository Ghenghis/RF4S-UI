
"""
Status Bar UI Component - Manages status information display
"""

from PySide6.QtWidgets import QWidget, QHBoxLayout
from PySide6.QtCore import QObject

from qfluentwidgets import BodyLabel, SimpleCardWidget


class StatusBarUI(QObject):
    """Manages the status bar with real-time information"""
    
    def __init__(self, parent_window):
        super().__init__()
        self.parent_window = parent_window
        
        # Status components
        self.position_label = None
        self.size_label = None
        
    def create_status_bar(self, parent_layout):
        """Create the status bar with real data"""
        status_card = SimpleCardWidget(self.parent_window)
        status_layout = QHBoxLayout(status_card)
        
        # Position info
        self.position_label = BodyLabel("Position: (0, 0)")
        status_layout.addWidget(self.position_label)
        
        # Size info
        self.size_label = BodyLabel("Size: 1200x800")
        status_layout.addWidget(self.size_label)
        
        # Hotkey hint
        hotkey_label = BodyLabel("Hotkey: Ctrl+M (Toggle Mode)")
        hotkey_label.setStyleSheet("color: #747d8c;")
        status_layout.addWidget(hotkey_label)
        
        status_layout.addStretch()
        parent_layout.addWidget(status_card)
        
    def update_position_info(self, x: int, y: int):
        """Update position information"""
        self.position_label.setText(f"Position: ({x}, {y})")
        
    def update_size_info(self, width: int, height: int):
        """Update size information"""
        self.size_label.setText(f"Size: {width}x{height}")
