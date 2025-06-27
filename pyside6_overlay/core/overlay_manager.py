
"""
Overlay Manager - Handles window positioning, transparency, and overlay behavior
"""

import ctypes
from ctypes import wintypes
from PySide6.QtCore import QObject, QTimer, pyqtSignal
from PySide6.QtWidgets import QMainWindow
import win32gui
import win32con


class OverlayManager(QObject):
    """Manages overlay window behavior and properties"""
    
    position_changed = pyqtSignal(int, int)
    size_changed = pyqtSignal(int, int)
    
    def __init__(self, main_window: QMainWindow):
        super().__init__()
        self.main_window = main_window
        self.is_click_through = False
        self.current_opacity = 0.9
        
        # Windows API constants
        self.GWL_EXSTYLE = -20
        self.WS_EX_TRANSPARENT = 0x00000020
        self.WS_EX_LAYERED = 0x00080000
        self.WS_EX_TOPMOST = 0x00000008
        
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
            
    def set_click_through(self, enabled: bool):
        """Enable or disable click-through mode"""
        hwnd = int(self.main_window.winId())
        
        # Get current extended window style
        ex_style = win32gui.GetWindowLong(hwnd, self.GWL_EXSTYLE)
        
        if enabled:
            # Add transparent and layered flags
            ex_style |= self.WS_EX_TRANSPARENT | self.WS_EX_LAYERED
            self.is_click_through = True
        else:
            # Remove transparent flag but keep layered for opacity
            ex_style &= ~self.WS_EX_TRANSPARENT
            ex_style |= self.WS_EX_LAYERED
            self.is_click_through = False
            
        # Apply the new style
        win32gui.SetWindowLong(hwnd, self.GWL_EXSTYLE, ex_style)
        
    def set_opacity(self, opacity: float):
        """Set window opacity (0.0 to 1.0)"""
        self.current_opacity = max(0.0, min(1.0, opacity))
        self.main_window.setWindowOpacity(self.current_opacity)
        
    def snap_to_window(self, target_hwnd):
        """Snap overlay to target window"""
        try:
            # Get target window rectangle
            rect = win32gui.GetWindowRect(target_hwnd)
            x, y, right, bottom = rect
            width = right - x
            height = bottom - y
            
            # Clamp coordinates to prevent off-screen positioning
            x = max(0, x)
            y = max(0, y)
            
            # Set overlay position and size
            self.main_window.setGeometry(x, y, width, height)
            
            # Emit signals
            self.position_changed.emit(x, y)
            self.size_changed.emit(width, height)
            
        except Exception as e:
            print(f"Error snapping to window: {e}")
            
    def make_frameless(self):
        """Remove window frame and title bar"""
        self.main_window.setWindowFlags(
            self.main_window.windowFlags() | 
            self.main_window.Qt.WindowType.FramelessWindowHint
        )
        
    def enable_transparency(self):
        """Enable window transparency"""
        self.main_window.setAttribute(
            self.main_window.Qt.WidgetAttribute.WA_TranslucentBackground
        )
        
    def get_window_info(self) -> dict:
        """Get current window information"""
        geometry = self.main_window.geometry()
        return {
            'x': geometry.x(),
            'y': geometry.y(),
            'width': geometry.width(),
            'height': geometry.height(),
            'opacity': self.current_opacity,
            'click_through': self.is_click_through
        }
