
"""
Game Event Handler - Manages game window detection and positioning
"""

from PySide6.QtCore import QObject, Signal, QTimer, QRect
import win32gui


class GameEventHandler(QObject):
    """Handles game window detection and positioning events"""
    
    # Game status signals
    game_status_changed = Signal(bool)
    position_changed = Signal(int, int)
    size_changed = Signal(int, int)
    
    def __init__(self, main_window, game_detector):
        super().__init__()
        self.main_window = main_window
        self.game_detector = game_detector
        self.game_window_handle = None
        self.last_game_rect = None
        self.is_attached = True
        
        # Timers
        self.game_detection_timer = QTimer()
        self.position_sync_timer = QTimer()
        
        self.setup_timers()
        self.setup_game_connections()
        
    def setup_timers(self):
        """Setup and start timers"""
        self.game_detection_timer.timeout.connect(self.detect_game_window)
        self.position_sync_timer.timeout.connect(self.sync_with_game_window)
        
        self.game_detection_timer.start(1000)  # Check every second
        self.position_sync_timer.start(100)    # Sync every 100ms when attached
        
    def setup_game_connections(self):
        """Setup game detector connections"""
        self.game_detector.game_found.connect(self.on_game_found)
        self.game_detector.game_lost.connect(self.on_game_lost)
        self.game_detector.game_moved.connect(self.on_game_moved)
        
    def on_game_found(self, handle: int):
        """Handle game window found"""
        self.game_window_handle = handle
        self.game_status_changed.emit(True)
        
    def on_game_lost(self):
        """Handle game window lost"""
        self.game_window_handle = None
        self.game_status_changed.emit(False)
        
    def on_game_moved(self, x: int, y: int, width: int, height: int):
        """Handle game window movement"""
        if self.is_attached:
            self.main_window.setGeometry(x, y, width, height)
            self.position_changed.emit(x, y)
            self.size_changed.emit(width, height)
            
    def detect_game_window(self):
        """Detect Russian Fishing 4 game window"""
        game_handle = self.game_detector.find_rf4_window()
        
        if game_handle and game_handle != self.game_window_handle:
            self.game_window_handle = game_handle
            self.game_status_changed.emit(True)
            
        elif not game_handle and self.game_window_handle:
            self.game_window_handle = None
            self.game_status_changed.emit(False)
            
    def sync_with_game_window(self):
        """Sync overlay position with game window"""
        if not self.game_window_handle or not self.is_attached:
            return
            
        try:
            rect = win32gui.GetWindowRect(self.game_window_handle)
            game_rect = QRect(rect[0], rect[1], rect[2] - rect[0], rect[3] - rect[1])
            
            # Only update if position changed significantly
            if self.last_game_rect != game_rect:
                self.main_window.setGeometry(game_rect)
                self.last_game_rect = game_rect
                
                # Emit position and size changes
                self.position_changed.emit(game_rect.x(), game_rect.y())
                self.size_changed.emit(game_rect.width(), game_rect.height())
                
        except Exception as e:
            print(f"Error syncing with game window: {e}")
            
    def set_attachment(self, attached: bool):
        """Set attachment state"""
        self.is_attached = attached
        
        if attached:
            self.position_sync_timer.start(100)
        else:
            self.position_sync_timer.stop()
            
    def cleanup(self):
        """Cleanup timers"""
        self.game_detection_timer.stop()
        self.position_sync_timer.stop()
