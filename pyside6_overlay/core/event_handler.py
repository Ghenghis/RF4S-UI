
"""
Event Handler - Manages all overlay events and interactions
"""

from PySide6.QtCore import QObject, Signal, QTimer
from PySide6.QtWidgets import QMainWindow
from typing import Optional

from .overlay_manager import OverlayManager
from .game_detector import GameDetector
from .hotkey_manager import HotkeyManager
from services.rf4s_service import RF4SService


class OverlayEventHandler(QObject):
    """Handles all overlay events and user interactions"""
    
    # Status change signals
    game_status_changed = Signal(bool)  # Connected/Disconnected
    rf4s_status_changed = Signal(bool)  # Online/Offline
    mode_changed = Signal(str)  # 'interactive' or 'passthrough'
    position_changed = Signal(int, int)  # x, y
    size_changed = Signal(int, int)  # width, height
    attachment_changed = Signal(bool)  # attached/detached
    
    def __init__(self, main_window: QMainWindow, overlay_manager: OverlayManager, 
                 game_detector: GameDetector, hotkey_manager: HotkeyManager, 
                 rf4s_service: RF4SService):
        super().__init__()
        
        self.main_window = main_window
        self.overlay_manager = overlay_manager
        self.game_detector = game_detector
        self.hotkey_manager = hotkey_manager
        self.rf4s_service = rf4s_service
        
        # State variables
        self.current_mode = 'interactive'
        self.current_opacity = 0.9
        self.is_attached = True
        self.game_window_handle = None
        self.last_game_rect = None
        
        # Timers
        self.game_detection_timer = QTimer()
        self.position_sync_timer = QTimer()
        
        self.setup_connections()
        self.setup_timers()
        
    def setup_connections(self):
        """Setup all signal connections"""
        # Timer connections
        self.game_detection_timer.timeout.connect(self.detect_game_window)
        self.position_sync_timer.timeout.connect(self.sync_with_game_window)
        
        # Internal signal connections
        self.mode_changed.connect(self._on_mode_change_internal)
        self.attachment_changed.connect(self._on_attachment_change_internal)
        
    def setup_timers(self):
        """Setup and start timers"""
        self.game_detection_timer.start(1000)  # Check every second
        self.position_sync_timer.start(100)    # Sync every 100ms when attached
        
    def setup_hotkeys(self):
        """Setup global hotkeys"""
        self.hotkey_manager.setup_default_hotkeys(self)
        
    def on_opacity_changed(self, value: int):
        """Handle opacity slider change"""
        self.current_opacity = value / 100.0
        self.main_window.setWindowOpacity(self.current_opacity)
        print(f"Opacity changed to: {self.current_opacity:.2f}")
        
    def on_mode_toggled(self, checked: bool):
        """Handle mode toggle"""
        if checked:
            self.current_mode = 'interactive'
            self.overlay_manager.set_click_through(False)
        else:
            self.current_mode = 'passthrough'
            self.overlay_manager.set_click_through(True)
            
        self.mode_changed.emit(self.current_mode)
        
    def on_attachment_toggled(self, checked: bool):
        """Handle attachment toggle"""
        self.is_attached = checked
        
        if checked:
            self.position_sync_timer.start(100)
        else:
            self.position_sync_timer.stop()
            # Change to solid background when detached
            self.main_window.setStyleSheet("background-color: rgba(0, 0, 0, 200);")
            
        self.attachment_changed.emit(checked)
        
    def on_emergency_stop(self):
        """Handle emergency stop"""
        self.rf4s_service.emergency_stop()
        print("Emergency stop activated!")
        
    def on_reset_position(self):
        """Reset window position"""
        self.main_window.move(100, 100)
        self.main_window.resize(1200, 800)
        self.position_changed.emit(100, 100)
        self.size_changed.emit(1200, 800)
        
    def toggle_mode_hotkey(self):
        """Toggle mode via hotkey"""
        new_mode = 'passthrough' if self.current_mode == 'interactive' else 'interactive'
        self.current_mode = new_mode
        
        if new_mode == 'interactive':
            self.overlay_manager.set_click_through(False)
        else:
            self.overlay_manager.set_click_through(True)
            
        self.mode_changed.emit(self.current_mode)
        
    def cycle_opacity(self):
        """Cycle through opacity levels"""
        if self.current_opacity >= 0.9:
            self.current_opacity = 0.3
        elif self.current_opacity >= 0.6:
            self.current_opacity = 0.9
        else:
            self.current_opacity = 0.6
            
        self.main_window.setWindowOpacity(self.current_opacity)
        
    def toggle_visibility(self):
        """Toggle overlay visibility"""
        self.main_window.setVisible(not self.main_window.isVisible())
        
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
            import win32gui
            from PySide6.QtCore import QRect
            
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
            
    def _on_mode_change_internal(self, mode: str):
        """Handle internal mode change"""
        print(f"Mode changed to: {mode}")
        
    def _on_attachment_change_internal(self, attached: bool):
        """Handle internal attachment change"""
        if attached:
            # Transparent background when attached
            self.main_window.setStyleSheet("background-color: rgba(0, 0, 0, 50);")
        else:
            # Solid background when detached
            self.main_window.setStyleSheet("background-color: rgba(0, 0, 0, 200);")
            
    def cleanup(self):
        """Cleanup resources"""
        self.game_detection_timer.stop()
        self.position_sync_timer.stop()
        self.rf4s_service.stop()
        
        # Unregister hotkeys
        try:
            import keyboard
            keyboard.unhook_all()
        except:
            pass
