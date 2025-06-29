
"""
Window Manager - Manages window properties and operations
"""

from PySide6.QtCore import QObject, Qt
from PySide6.QtWidgets import QMainWindow


class WindowManager(QObject):
    """Manages window properties and operations"""
    
    def __init__(self, main_window: QMainWindow):
        super().__init__()
        self.main_window = main_window
        self.current_opacity = 0.9
        
    def setup_window_properties(self):
        """Setup initial window properties"""
        # Set window flags for overlay behavior
        self.main_window.setWindowFlags(
            Qt.WindowType.FramelessWindowHint |
            Qt.WindowType.WindowStaysOnTopHint |
            Qt.WindowType.Tool
        )
        
        # Set window attributes
        self.main_window.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.main_window.setAttribute(Qt.WidgetAttribute.WA_NoSystemBackground)
        
    def set_window_opacity(self, opacity: float):
        """Set window opacity"""
        self.current_opacity = opacity
        self.main_window.setWindowOpacity(opacity)
        
    def get_window_opacity(self) -> float:
        """Get current window opacity"""
        return self.current_opacity
        
    def set_always_on_top(self, on_top: bool):
        """Set always on top behavior"""
        flags = self.main_window.windowFlags()
        
        if on_top:
            flags |= Qt.WindowType.WindowStaysOnTopHint
        else:
            flags &= ~Qt.WindowType.WindowStaysOnTopHint
            
        self.main_window.setWindowFlags(flags)
        self.main_window.show()
        
    def set_click_through(self, click_through: bool):
        """Set click-through behavior"""
        if click_through:
            self.main_window.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)
        else:
            self.main_window.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, False)
            
    def minimize_window(self):
        """Minimize the window"""
        self.main_window.showMinimized()
        
    def restore_window(self):
        """Restore the window"""
        self.main_window.showNormal()
        
    def close_window(self):
        """Close the window"""
        self.main_window.close()
