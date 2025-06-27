
"""
Core Panels - Essential panels for RF4S operation
"""

from PySide6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton
from PySide6.QtCore import Qt, Signal

from qfluentwidgets import (
    CardWidget, TitleLabel, StrongBodyLabel, BodyLabel,
    PrimaryPushButton, PushButton, ProgressBar, FluentIcon
)


class SessionStatsPanel(CardWidget):
    """Panel showing current session statistics"""
    
    def __init__(self):
        super().__init__()
        self.setObjectName("SessionStatsPanel")
        self.setup_ui()
        
    def setup_ui(self):
        """Setup the UI components"""
        layout = QVBoxLayout(self)
        
        # Title
        title = TitleLabel("Session Statistics")
        layout.addWidget(title)
        
        # Stats grid
        stats_layout = QVBoxLayout()
        
        # Session time
        self.session_time_label = StrongBodyLabel("Session Time: 00:00:00")
        stats_layout.addWidget(self.session_time_label)
        
        # Fish caught
        self.fish_caught_label = StrongBodyLabel("Fish Caught: 0")
        stats_layout.addWidget(self.fish_caught_label)
        
        # Success rate
        self.success_rate_label = StrongBodyLabel("Success Rate: 0%")
        stats_layout.addWidget(self.success_rate_label)
        
        # Current mode
        self.current_mode_label = BodyLabel("Mode: Idle")
        stats_layout.addWidget(self.current_mode_label)
        
        layout.addLayout(stats_layout)
        
    def update_stats(self, stats: dict):
        """Update panel with new statistics"""
        if 'session_time' in stats:
            self.session_time_label.setText(f"Session Time: {stats['session_time']}")
        if 'fish_caught' in stats:
            self.fish_caught_label.setText(f"Fish Caught: {stats['fish_caught']}")
        if 'success_rate' in stats:
            self.success_rate_label.setText(f"Success Rate: {stats['success_rate']}%")
        if 'current_mode' in stats:
            self.current_mode_label.setText(f"Mode: {stats['current_mode']}")


class RF4SControlPanel(CardWidget):
    """Panel for controlling RF4S bot"""
    
    # Signals
    start_fishing = Signal()
    stop_fishing = Signal()
    emergency_stop = Signal()
    
    def __init__(self):
        super().__init__()
        self.setObjectName("RF4SControlPanel")
        self.bot_running = False
        self.setup_ui()
        
    def setup_ui(self):
        """Setup the UI components"""
        layout = QVBoxLayout(self)
        
        # Title
        title = TitleLabel("RF4S Control")
        layout.addWidget(title)
        
        # Status
        self.status_label = StrongBodyLabel("Status: Disconnected")
        layout.addWidget(self.status_label)
        
        # Control buttons
        button_layout = QHBoxLayout()
        
        self.start_button = PrimaryPushButton("Start Fishing")
        self.start_button.setIcon(FluentIcon.PLAY)
        self.start_button.clicked.connect(self.on_start_clicked)
        button_layout.addWidget(self.start_button)
        
        self.stop_button = PushButton("Stop")
        self.stop_button.setIcon(FluentIcon.PAUSE)
        self.stop_button.clicked.connect(self.on_stop_clicked)
        self.stop_button.setEnabled(False)
        button_layout.addWidget(self.stop_button)
        
        self.emergency_button = PushButton("Emergency Stop")
        self.emergency_button.setIcon(FluentIcon.CANCEL)
        self.emergency_button.clicked.connect(self.on_emergency_clicked)
        button_layout.addWidget(self.emergency_button)
        
        layout.addLayout(button_layout)
        
    def on_start_clicked(self):
        """Handle start button click"""
        self.start_fishing.emit()
        
    def on_stop_clicked(self):
        """Handle stop button click"""
        self.stop_fishing.emit()
        
    def on_emergency_clicked(self):
        """Handle emergency stop button click"""
        self.emergency_stop.emit()
        
    def update_bot_status(self, running: bool):
        """Update bot status and button states"""
        self.bot_running = running
        
        if running:
            self.status_label.setText("Status: Running")
            self.start_button.setEnabled(False)
            self.stop_button.setEnabled(True)
        else:
            self.status_label.setText("Status: Stopped")
            self.start_button.setEnabled(True)
            self.stop_button.setEnabled(False)


class GameStatusPanel(CardWidget):
    """Panel showing game connection status"""
    
    def __init__(self):
        super().__init__()
        self.setObjectName("GameStatusPanel")
        self.setup_ui()
        
    def setup_ui(self):
        """Setup the UI components"""
        layout = QVBoxLayout(self)
        
        # Title
        title = TitleLabel("Game Status")
        layout.addWidget(title)
        
        # Connection status
        self.connection_label = StrongBodyLabel("Connection: Disconnected")
        layout.addWidget(self.connection_label)
        
        # Game info
        self.game_info_label = BodyLabel("Game: Not detected")
        layout.addWidget(self.game_info_label)
        
        # Performance info
        self.fps_label = BodyLabel("FPS: --")
        layout.addWidget(self.fps_label)
        
    def update_connection_status(self, connected: bool):
        """Update connection status"""
        if connected:
            self.connection_label.setText("Connection: Connected")
            self.game_info_label.setText("Game: Russian Fishing 4")
        else:
            self.connection_label.setText("Connection: Disconnected")
            self.game_info_label.setText("Game: Not detected")
            
    def update_performance(self, fps: int):
        """Update performance information"""
        self.fps_label.setText(f"FPS: {fps}")
