
"""
Window Manager - Handles window properties and positioning
"""

from PySide6.QtCore import Qt, QObject, Signal
from PySide6.QtWidgets import QMainWindow
import win32gui
import win32con


class WindowManager(QObject):
    """Manages window properties, positioning, and transparency"""
    
    window_moved = Signal(int, int)
    window_resized = Signal(int, int)
    
    def __init__(self, main_window: QMainWindow):
        super().__init__()
        self.main_window = main_window
        
    def setup_window_properties(self):
        """Setup window properties for overlay functionality"""
        # Make window frameless and always on top
        self.main_window.setWindowFlags(
            Qt.WindowType.FramelessWindowHint |
            Qt.WindowType.WindowStaysOnTopHint |
            Qt.WindowType.Tool
        )
        
        # Enable transparency
        self.main_window.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        
        # Set initial position and size
        self.main_window.move(100, 100)
        self.main_window.resize(1200, 800)
        
    def set_window_opacity(self, opacity: float):
        """Set window opacity"""
        self.main_window.setWindowOpacity(opacity)
        
    def enable_click_through(self):
        """Enable click-through mode"""
        hwnd = int(self.main_window.winId())
        
        # Get current window style
        style = win32gui.GetWindowLong(hwnd, win32con.GWL_EXSTYLE)
        
        # Add transparent flag
        style |= win32con.WS_EX_TRANSPARENT | win32con.WS_EX_LAYERED
        
        # Apply new style
        win32gui.SetWindowLong(hwnd, win32con.GWL_EXSTYLE, style)
        print("Click-through mode enabled")
        
    def enable_window_interaction(self):
        """Enable window interaction mode"""
        hwnd = int(self.main_window.winId())
        
        # Get current window style
        style = win32gui.GetWindowLong(hwnd, win32con.GWL_EXSTYLE)
        
        # Remove transparent flag
        style &= ~win32con.WS_EX_TRANSPARENT
        
        # Apply new style
        win32gui.SetWindowLong(hwnd, win32con.GWL_EXSTYLE, style)
        print("Interactive mode enabled")
        
    def set_always_on_top(self, enabled: bool = True):
        """Set window to always stay on top"""
        hwnd = int(self.main_window.winId())
        
        if enabled:
            win32gui.SetWindowPos(
                hwnd, win32con.HWND_TOPMOST,
                0, 0, 0, 0,
                win32con.SWP_NOMOVE | win32con.SWP_NOSIZE
            )
        else:
            win32gui.SetWindowPos(
                hwnd, win32con.HWND_NOTOPMOST,
                0, 0, 0, 0,
                win32con.SWP_NOMOVE | win32con.SWP_NOSIZE
            )
            
    def move_window(self, x: int, y: int):
        """Move window to specific position"""
        self.main_window.move(x, y)
        self.window_moved.emit(x, y)
        
    def resize_window(self, width: int, height: int):
        """Resize window to specific dimensions"""
        self.main_window.resize(width, height)
        self.window_resized.emit(width, height)
        
    def reset_window_position(self):
        """Reset window to default position and size"""
        self.move_window(100, 100)
        self.resize_window(1200, 800)
        
    def get_window_geometry(self):
        """Get current window geometry"""
        geometry = self.main_window.geometry()
        return {
            'x': geometry.x(),
            'y': geometry.y(),
            'width': geometry.width(),
            'height': geometry.height()
        }
