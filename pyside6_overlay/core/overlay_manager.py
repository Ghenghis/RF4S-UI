
"""
Overlay Manager - Handles window positioning, transparency, and overlay behavior
"""

import ctypes
from ctypes import wintypes
from PySide6.QtCore import QObject, QTimer, Signal
from PySide6.QtWidgets import QMainWindow
from PySide6.QtGui import QScreen
import win32gui
import win32con


class OverlayManager(QObject):
    """Manages overlay window behavior and properties"""
    
    position_changed = Signal(int, int)
    size_changed = Signal(int, int)
    opacity_changed = Signal(float)
    mode_changed = Signal(str)
    
    def __init__(self, main_window: QMainWindow):
        super().__init__()
        self.main_window = main_window
        self.is_click_through = False
        self.current_opacity = 0.9
        self.current_mode = 'interactive'
        
        # Windows API constants
        self.GWL_EXSTYLE = -20
        self.WS_EX_TRANSPARENT = 0x00000020
        self.WS_EX_LAYERED = 0x00080000
        self.WS_EX_TOPMOST = 0x00000008
        
        # Initialize window properties
        self.setup_initial_properties()
        
    def setup_initial_properties(self):
        """Setup initial window properties for overlay"""
        try:
            # Make window frameless and always on top
            from PySide6.QtCore import Qt
            self.main_window.setWindowFlags(
                Qt.WindowType.FramelessWindowHint |
                Qt.WindowType.WindowStaysOnTopHint |
                Qt.WindowType.Tool
            )
            
            # Enable transparency
            self.main_window.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
            
            # Set initial opacity
            self.main_window.setWindowOpacity(self.current_opacity)
            
        except Exception as e:
            print(f"Error setting up overlay properties: {e}")
        
    def set_always_on_top(self, enabled: bool = True):
        """Set window to always stay on top"""
        try:
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
        except Exception as e:
            print(f"Error setting always on top: {e}")
            
    def set_click_through(self, enabled: bool):
        """Enable or disable click-through mode"""
        try:
            hwnd = int(self.main_window.winId())
            
            # Get current extended window style
            ex_style = win32gui.GetWindowLong(hwnd, self.GWL_EXSTYLE)
            
            if enabled:
                # Add transparent and layered flags
                ex_style |= self.WS_EX_TRANSPARENT | self.WS_EX_LAYERED
                self.is_click_through = True
                self.current_mode = 'passthrough'
                print("Click-through mode enabled")
            else:
                # Remove transparent flag but keep layered for opacity
                ex_style &= ~self.WS_EX_TRANSPARENT
                ex_style |= self.WS_EX_LAYERED
                self.is_click_through = False
                self.current_mode = 'interactive'
                print("Interactive mode enabled")
                
            # Apply the new style
            win32gui.SetWindowLong(hwnd, self.GWL_EXSTYLE, ex_style)
            self.mode_changed.emit(self.current_mode)
            
        except Exception as e:
            print(f"Error setting click-through mode: {e}")
        
    def set_opacity(self, opacity: float):
        """Set window opacity (0.0 to 1.0)"""
        try:
            self.current_opacity = max(0.0, min(1.0, opacity))
            self.main_window.setWindowOpacity(self.current_opacity)
            self.opacity_changed.emit(self.current_opacity)
        except Exception as e:
            print(f"Error setting opacity: {e}")
        
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
            
    def center_on_screen(self):
        """Center overlay on primary screen"""
        try:
            from PySide6.QtGui import QGuiApplication
            screen = QGuiApplication.primaryScreen()
            if screen:
                screen_geometry = screen.geometry()
                x = (screen_geometry.width() - 1200) // 2
                y = (screen_geometry.height() - 800) // 2
                
                self.main_window.move(x, y)
                self.position_changed.emit(x, y)
        except Exception as e:
            print(f"Error centering on screen: {e}")
            
    def make_frameless(self):
        """Remove window frame and title bar"""
        try:
            from PySide6.QtCore import Qt
            self.main_window.setWindowFlags(
                self.main_window.windowFlags() | 
                Qt.WindowType.FramelessWindowHint
            )
        except Exception as e:
            print(f"Error making frameless: {e}")
        
    def enable_transparency(self):
        """Enable window transparency"""
        try:
            from PySide6.QtCore import Qt
            self.main_window.setAttribute(
                Qt.WidgetAttribute.WA_TranslucentBackground
            )
        except Exception as e:
            print(f"Error enabling transparency: {e}")
        
    def get_window_info(self) -> dict:
        """Get current window information"""
        try:
            geometry = self.main_window.geometry()
            return {
                'x': geometry.x(),
                'y': geometry.y(),
                'width': geometry.width(),
                'height': geometry.height(),
                'opacity': self.current_opacity,
                'click_through': self.is_click_through,
                'mode': self.current_mode
            }
        except Exception as e:
            print(f"Error getting window info: {e}")
            return {}
            
    def toggle_mode(self):
        """Toggle between interactive and click-through modes"""
        self.set_click_through(not self.is_click_through)
        
    def cycle_opacity(self):
        """Cycle through common opacity levels"""
        opacity_levels = [0.3, 0.6, 0.9, 1.0]
        current_index = 0
        
        # Find current opacity level
        for i, level in enumerate(opacity_levels):
            if abs(self.current_opacity - level) < 0.1:
                current_index = i
                break
                
        # Move to next level
        next_index = (current_index + 1) % len(opacity_levels)
        self.set_opacity(opacity_levels[next_index])
