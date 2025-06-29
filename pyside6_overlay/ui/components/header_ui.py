
"""
Header UI Component - Manages header section with status indicators
"""

from PySide6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout
from PySide6.QtCore import QObject, Signal

from qfluentwidgets import (
    SubtitleLabel, BodyLabel, HeaderCardWidget
)


class HeaderUI(QObject):
    """Manages the header section with real-time status indicators"""
    
    def __init__(self, parent_window):
        super().__init__()
        self.parent_window = parent_window
        
        # Status labels
        self.game_status_label = None
        self.rf4s_status_label = None
        self.mode_label = None
        self.session_time_label = None
        self.fish_count_label = None
        
    def create_header_section(self, parent_layout):
        """Create the header section with branding and real status"""
        header_card = HeaderCardWidget(self.parent_window)
        header_card.setTitle("RF4S Game Overlay")
        header_card.setContent("Russian Fishing 4 Bot Control Interface")
        
        # Create a container for the header content
        header_container = QWidget()
        header_layout = QVBoxLayout(header_container)
        
        # Add the header card
        header_layout.addWidget(header_card)
        
        # Status indicators with real data
        status_widget = QWidget()
        status_layout = QHBoxLayout(status_widget)
        
        # Game connection status
        self.game_status_label = BodyLabel("Game: Disconnected")
        self.game_status_label.setStyleSheet("color: #ff4757;")
        status_layout.addWidget(self.game_status_label)
        
        # RF4S service status
        self.rf4s_status_label = BodyLabel("RF4S: Offline")
        self.rf4s_status_label.setStyleSheet("color: #ff4757;")
        status_layout.addWidget(self.rf4s_status_label)
        
        # Mode indicator
        self.mode_label = BodyLabel("Mode: Interactive")
        self.mode_label.setStyleSheet("color: #2ed573;")
        status_layout.addWidget(self.mode_label)
        
        # Session info with real data
        self.session_time_label = BodyLabel("Session: 00:00:00")
        self.session_time_label.setStyleSheet("color: #5352ed;")
        status_layout.addWidget(self.session_time_label)
        
        self.fish_count_label = BodyLabel("Fish: 0")
        self.fish_count_label.setStyleSheet("color: #00d2d3;")
        status_layout.addWidget(self.fish_count_label)
        
        status_layout.addStretch()
        header_layout.addWidget(status_widget)
        
        parent_layout.addWidget(header_container)
        
    def update_game_status(self, connected: bool):
        """Update game connection status"""
        if connected:
            self.game_status_label.setText("Game: Connected")
            self.game_status_label.setStyleSheet("color: #2ed573;")
        else:
            self.game_status_label.setText("Game: Disconnected")
            self.game_status_label.setStyleSheet("color: #ff4757;")
            
    def update_rf4s_status(self, online: bool):
        """Update RF4S service status"""
        if online:
            self.rf4s_status_label.setText("RF4S: Online")
            self.rf4s_status_label.setStyleSheet("color: #2ed573;")
        else:
            self.rf4s_status_label.setText("RF4S: Offline")
            self.rf4s_status_label.setStyleSheet("color: #ff4757;")
            
    def update_mode_status(self, mode: str):
        """Update mode indicator"""
        self.mode_label.setText(f"Mode: {mode.title()}")
        
    def update_session_stats(self, stats: dict):
        """Update session statistics with real data"""
        if 'session_time' in stats:
            self.session_time_label.setText(f"Session: {stats['session_time']}")
        if 'fish_caught' in stats:
            self.fish_count_label.setText(f"Fish: {stats['fish_caught']}")
