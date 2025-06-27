
"""
Game Detector - Detects and monitors Russian Fishing 4 game window
"""

import win32gui
import win32process
import psutil
from PySide6.QtCore import QObject, QTimer, pyqtSignal
from typing import Optional, List, Tuple


class GameDetector(QObject):
    """Detects and monitors game windows"""
    
    game_found = pyqtSignal(int)  # Window handle
    game_lost = pyqtSignal()
    game_moved = pyqtSignal(int, int, int, int)  # x, y, width, height
    
    def __init__(self):
        super().__init__()
        
        # Game window identifiers
        self.rf4_window_classes = [
            "UnityWndClass",  # Unity engine
            "Russian Fishing 4",
            "RF4",
            "Unity",
        ]
        
        self.rf4_window_titles = [
            "Russian Fishing 4",
            "RF4",
            "Русская Рыбалка 4",
        ]
        
        self.rf4_process_names = [
            "RF4.exe",
            "RussianFishing4.exe", 
            "russian_fishing_4.exe",
            "rf4.exe"
        ]
        
        self.current_game_handle = None
        self.last_game_rect = None
        
    def find_rf4_window(self) -> Optional[int]:
        """Find Russian Fishing 4 window handle"""
        found_windows = []
        
        def enum_windows_callback(hwnd, windows):
            if win32gui.IsWindowVisible(hwnd):
                window_title = win32gui.GetWindowText(hwnd)
                class_name = win32gui.GetClassName(hwnd)
                
                # Check by window title
                for title in self.rf4_window_titles:
                    if title.lower() in window_title.lower():
                        windows.append((hwnd, f"Title: {window_title}"))
                        return True
                        
                # Check by class name
                for class_name_check in self.rf4_window_classes:
                    if class_name == class_name_check:
                        # Additional validation by process name
                        if self.validate_process(hwnd):
                            windows.append((hwnd, f"Class: {class_name}"))
                            return True
                            
            return True
            
        win32gui.EnumWindows(enum_windows_callback, found_windows)
        
        # Return the first valid window found
        if found_windows:
            handle = found_windows[0][0]
            if handle != self.current_game_handle:
                self.current_game_handle = handle
                self.game_found.emit(handle)
            return handle
            
        # Game window lost
        if self.current_game_handle:
            self.current_game_handle = None
            self.game_lost.emit()
            
        return None
        
    def validate_process(self, hwnd: int) -> bool:
        """Validate if window belongs to RF4 process"""
        try:
            _, process_id = win32process.GetWindowThreadProcessId(hwnd)
            process = psutil.Process(process_id)
            process_name = process.name().lower()
            
            for rf4_name in self.rf4_process_names:
                if rf4_name.lower() in process_name:
                    return True
                    
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
            
        return False
        
    def get_window_rect(self, hwnd: int) -> Optional[Tuple[int, int, int, int]]:
        """Get window rectangle (x, y, width, height)"""
        try:
            rect = win32gui.GetWindowRect(hwnd)
            x, y, right, bottom = rect
            width = right - x
            height = bottom - y
            
            # Check if window moved
            current_rect = (x, y, width, height)
            if current_rect != self.last_game_rect:
                self.last_game_rect = current_rect
                self.game_moved.emit(x, y, width, height)
                
            return current_rect
            
        except Exception as e:
            print(f"Error getting window rect: {e}")
            return None
            
    def is_window_minimized(self, hwnd: int) -> bool:
        """Check if window is minimized"""
        try:
            placement = win32gui.GetWindowPlacement(hwnd)
            return placement[1] == win32con.SW_SHOWMINIMIZED
        except:
            return False
            
    def get_all_game_windows(self) -> List[Tuple[int, str]]:
        """Get all potential game windows for debugging"""
        all_windows = []
        
        def enum_callback(hwnd, windows):
            if win32gui.IsWindowVisible(hwnd):
                try:
                    title = win32gui.GetWindowText(hwnd)
                    class_name = win32gui.GetClassName(hwnd)
                    
                    if title and (
                        any(name.lower() in title.lower() for name in self.rf4_window_titles) or
                        any(name.lower() in class_name.lower() for name in self.rf4_window_classes)
                    ):
                        windows.append((hwnd, f"{title} [{class_name}]"))
                        
                except Exception:
                    pass
                    
            return True
            
        win32gui.EnumWindows(enum_callback, all_windows)
        return all_windows
