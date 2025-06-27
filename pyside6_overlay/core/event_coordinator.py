
"""
Event Coordinator - Coordinates between different event handlers
"""

from PySide6.QtCore import QObject, Signal, QTimer
from PySide6.QtWidgets import QMainWindow
from typing import Optional

from core.overlay_manager import OverlayManager
from core.game_detector import GameDetector
from core.hotkey_manager import HotkeyManager
from services.rf4s_service import RF4SService
from .handlers.ui_event_handler import UIEventHandler
from .handlers.rf4s_event_handler import RF4SEventHandler
from .handlers.game_event_handler import GameEventHandler


class EventCoordinator(QObject):
    """Coordinates all overlay events and interactions"""
    
    # Consolidated signals for UI updates
    game_status_changed = Signal(bool)
    rf4s_status_changed = Signal(bool)
    mode_changed = Signal(str)
    position_changed = Signal(int, int)
    size_changed = Signal(int, int)
    attachment_changed = Signal(bool)
    
    # RF4S data signals
    session_stats_updated = Signal(dict)
    fish_caught_signal = Signal(dict)
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
        
        # Initialize specialized event handlers
        self.ui_handler = UIEventHandler(overlay_manager)
        self.rf4s_handler = RF4SEventHandler(rf4s_service)
        self.game_handler = GameEventHandler(main_window, game_detector)
        
        # RF4S data update timer
        self.rf4s_data_timer = QTimer()
        self.rf4s_data_timer.timeout.connect(self.rf4s_handler.update_rf4s_data)
        
        self.setup_connections()
        self.setup_service_connections()
        self.start_timers()
        
    def setup_connections(self):
        """Setup connections between handlers"""
        # UI handler signals
        self.ui_handler.mode_changed.connect(self.mode_changed.emit)
        self.ui_handler.attachment_changed.connect(self.attachment_changed.emit)
        self.ui_handler.attachment_changed.connect(self.game_handler.set_attachment)
        
        # RF4S handler signals
        self.rf4s_handler.session_stats_updated.connect(self.session_stats_updated.emit)
        self.rf4s_handler.fish_caught_signal.connect(self.fish_caught_signal.emit)
        self.rf4s_handler.bot_state_changed.connect(self.bot_state_changed.emit)
        self.rf4s_handler.detection_update_signal.connect(self.detection_update_signal.emit)
        self.rf4s_handler.automation_update_signal.connect(self.automation_update_signal.emit)
        
        # Game handler signals
        self.game_handler.game_status_changed.connect(self.game_status_changed.emit)
        self.game_handler.position_changed.connect(self.position_changed.emit)
        self.game_handler.size_changed.connect(self.size_changed.emit)
        
    def setup_service_connections(self):
        """Setup RF4S service connections"""
        self.rf4s_service.connected.connect(lambda: self.rf4s_status_changed.emit(True))
        self.rf4s_service.disconnected.connect(lambda: self.rf4s_status_changed.emit(False))
        
    def start_timers(self):
        """Start background timers"""
        self.rf4s_data_timer.start(500)  # Update RF4S data every 500ms
        
    def setup_hotkeys(self):
        """Setup global hotkeys"""
        self.hotkey_manager.setup_default_hotkeys(self)
        
    # UI Event forwarding methods
    def on_opacity_changed(self, value: int):
        """Forward to UI handler"""
        self.ui_handler.on_opacity_changed(value)
        
    def on_mode_toggled(self, checked: bool):
        """Forward to UI handler"""
        self.ui_handler.on_mode_toggled(checked)
        
    def on_attachment_toggled(self, checked: bool):
        """Forward to UI handler"""
        self.ui_handler.on_attachment_toggled(checked)
        
    def on_emergency_stop(self):
        """Forward to RF4S handler"""
        self.rf4s_handler.on_emergency_stop()
        
    def on_reset_position(self):
        """Forward to UI handler"""
        self.ui_handler.on_reset_position()
        
    # RF4S Event forwarding methods
    def on_start_fishing(self):
        """Forward to RF4S handler"""
        return self.rf4s_handler.on_start_fishing()
        
    def on_stop_fishing(self):
        """Forward to RF4S handler"""
        return self.rf4s_handler.on_stop_fishing()
        
    def on_update_detection_settings(self, settings: dict):
        """Forward to RF4S handler"""
        return self.rf4s_handler.on_update_detection_settings(settings)
        
    def on_update_automation_settings(self, settings: dict):
        """Forward to RF4S handler"""
        return self.rf4s_handler.on_update_automation_settings(settings)
        
    def on_change_fishing_mode(self, mode: str):
        """Forward to RF4S handler"""
        return self.rf4s_handler.on_change_fishing_mode(mode)
    
    # Hotkey handler methods (forwarded to appropriate handlers)
    def toggle_mode_hotkey(self):
        """Forward to UI handler"""
        self.ui_handler.toggle_mode_hotkey()
        
    def cycle_opacity(self):
        """Forward to UI handler"""
        self.ui_handler.cycle_opacity()
        
    def toggle_visibility(self):
        """Forward to UI handler"""
        self.ui_handler.toggle_visibility()
        
    def cleanup(self):
        """Cleanup all handlers and timers"""
        self.rf4s_data_timer.stop()
        self.game_handler.cleanup()
        self.rf4s_service.stop()
        
        # Unregister hotkeys
        try:
            self.hotkey_manager.unregister_all()
        except Exception as e:
            print(f"Error cleaning up hotkeys: {e}")
