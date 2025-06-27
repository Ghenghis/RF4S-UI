
"""
Game Event Handler - Manages game detection and window events
"""

from PySide6.QtCore import QObject, Signal, QTimer
from PySide6.QtWidgets import QMainWindow


class GameEventHandler(QObject):
    """Handles game detection and window management events"""
    
    # Game state signals
    game_status_changed = Signal(bool)
    position_changed = Signal(int, int)
    size_changed = Signal(int, int)
    
    def __init__(self, main_window: QMainWindow, game_detector):
        super().__init__()
        self.main_window = main_window
        self.game_detector = game_detector
        self.is_attached = True
        
        # Game detection timer
        self.detection_timer = QTimer()
        self.detection_timer.timeout.connect(self.check_game_status)
        self.detection_timer.start(1000)  # Check every second
        
        # Window tracking
        self.last_position = None
        self.last_size = None
        
        # Position update timer
        self.position_timer = QTimer()
        self.position_timer.timeout.connect(self.update_position_tracking)
        self.position_timer.start(100)  # Update every 100ms
        
    def check_game_status(self):
        """Check if RF4 game is running"""
        try:
            game_running = self.game_detector.is_game_running()
            self.game_status_changed.emit(game_running)
            
            if game_running and self.is_attached:
                self.sync_with_game_window()
                
        except Exception as e:
            print(f"Error checking game status: {e}")
            
    def sync_with_game_window(self):
        """Synchronize overlay with game window"""
        try:
            game_rect = self.game_detector.get_game_window_rect()
            if game_rect:
                # Position overlay relative to game window
                overlay_x = game_rect.x() + 50
                overlay_y = game_rect.y() + 50
                
                if self.last_position != (overlay_x, overlay_y):
                    self.main_window.move(overlay_x, overlay_y)
                    self.last_position = (overlay_x, overlay_y)
                    self.position_changed.emit(overlay_x, overlay_y)
                    
        except Exception as e:
            print(f"Error syncing with game window: {e}")
            
    def update_position_tracking(self):
        """Update position and size tracking"""
        try:
            current_pos = (self.main_window.x(), self.main_window.y())
            current_size = (self.main_window.width(), self.main_window.height())
            
            if self.last_position != current_pos:
                self.last_position = current_pos
                self.position_changed.emit(current_pos[0], current_pos[1])
                
            if self.last_size != current_size:
                self.last_size = current_size
                self.size_changed.emit(current_size[0], current_size[1])
                
        except Exception as e:
            print(f"Error updating position tracking: {e}")
            
    def set_attachment(self, attached: bool):
        """Set attachment mode"""
        self.is_attached = attached
        
    def cleanup(self):
        """Clean up timers and resources"""
        self.detection_timer.stop()
        self.position_timer.stop()
