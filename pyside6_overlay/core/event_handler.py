
"""
Event Handler - Manages all overlay events and interactions
"""

from PySide6.QtCore import QObject, Signal, QTimer
from PySide6.QtWidgets import QMainWindow
from typing import Optional
import win32gui
import win32con

from core.overlay_manager import OverlayManager
from core.game_detector import GameDetector
from core.hotkey_manager import HotkeyManager
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
    
    # RF4S data signals
    session_stats_updated = Signal(dict)
    fish_caught_signal = Signal(dict)
    config_changed_signal = Signal(dict)
    bot_state_changed = Signal(bool)
    detection_update_signal = Signal(dict)
    automation_update_signal = Signal(dict)
    
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
        self.rf4s_data_timer = QTimer()
        
        self.setup_connections()
        self.setup_timers()
        
    def setup_connections(self):
        """Setup all signal connections"""
        # Timer connections
        self.game_detection_timer.timeout.connect(self.detect_game_window)
        self.position_sync_timer.timeout.connect(self.sync_with_game_window)
        self.rf4s_data_timer.timeout.connect(self.update_rf4s_data)
        
        # RF4S service connections
        self.rf4s_service.connected.connect(lambda: self.rf4s_status_changed.emit(True))
        self.rf4s_service.disconnected.connect(lambda: self.rf4s_status_changed.emit(False))
        self.rf4s_service.status_updated.connect(self.on_rf4s_status_update)
        self.rf4s_service.fish_caught.connect(self.on_fish_caught)
        self.rf4s_service.error_occurred.connect(self.on_rf4s_error)
        
        # Game detector connections
        self.game_detector.game_found.connect(self.on_game_found)
        self.game_detector.game_lost.connect(self.on_game_lost)
        self.game_detector.game_moved.connect(self.on_game_moved)
        
        # Internal signal connections
        self.mode_changed.connect(self._on_mode_change_internal)
        self.attachment_changed.connect(self._on_attachment_change_internal)
        
    def setup_timers(self):
        """Setup and start timers"""
        self.game_detection_timer.start(1000)  # Check every second
        self.position_sync_timer.start(100)    # Sync every 100ms when attached
        self.rf4s_data_timer.start(500)        # Update RF4S data every 500ms
        
    def setup_hotkeys(self):
        """Setup global hotkeys"""
        self.hotkey_manager.setup_default_hotkeys(self)
        
    def update_rf4s_data(self):
        """Update real RF4S data from service"""
        if self.rf4s_service.is_service_connected():
            # Get real data from RF4S service
            status = self.rf4s_service.get_current_status()
            self.session_stats_updated.emit(status)
            
            # Request fresh data from RF4S bot
            self.rf4s_service.send_command('get_status')
            self.rf4s_service.send_command('get_session_data')
            self.rf4s_service.send_command('get_detection_data')
            self.rf4s_service.send_command('get_automation_status')
        
    def on_rf4s_status_update(self, status_data: dict):
        """Handle RF4S status updates with real data"""
        self.session_stats_updated.emit(status_data)
        
        # Emit specific updates based on data type
        if 'detection' in status_data:
            self.detection_update_signal.emit(status_data['detection'])
        if 'automation' in status_data:
            self.automation_update_signal.emit(status_data['automation'])
        if 'bot_active' in status_data:
            self.bot_state_changed.emit(status_data['bot_active'])
            
    def on_fish_caught(self, fish_data: dict):
        """Handle fish caught event with real data"""
        self.fish_caught_signal.emit(fish_data)
        
    def on_rf4s_error(self, error_message: str):
        """Handle RF4S errors"""
        print(f"RF4S Error: {error_message}")
        
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
    
    # UI Event Handlers
    def on_opacity_changed(self, value: int):
        """Handle opacity slider change"""
        self.current_opacity = value / 100.0
        self.main_window.setWindowOpacity(self.current_opacity)
        
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
            
        self.attachment_changed.emit(checked)
        
    def on_emergency_stop(self):
        """Handle emergency stop"""
        self.rf4s_service.emergency_stop()
        
    def on_reset_position(self):
        """Reset window position"""
        self.main_window.move(100, 100)
        self.main_window.resize(1200, 800)
        self.position_changed.emit(100, 100)
        self.size_changed.emit(1200, 800)
    
    # RF4S Control Event Handlers
    def on_start_fishing(self):
        """Start fishing bot"""
        return self.rf4s_service.start_fishing()
        
    def on_stop_fishing(self):
        """Stop fishing bot"""
        return self.rf4s_service.stop_fishing()
        
    def on_update_detection_settings(self, settings: dict):
        """Update detection settings"""
        return self.rf4s_service.update_settings({'detection': settings})
        
    def on_update_automation_settings(self, settings: dict):
        """Update automation settings"""
        return self.rf4s_service.update_settings({'automation': settings})
        
    def on_change_fishing_mode(self, mode: str):
        """Change fishing mode"""
        return self.rf4s_service.set_fishing_mode(mode)
    
    # Hotkey handlers
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
        self.rf4s_data_timer.stop()
        self.rf4s_service.stop()
        
        # Unregister hotkeys
        try:
            self.hotkey_manager.unregister_all()
        except Exception as e:
            print(f"Error cleaning up hotkeys: {e}")
