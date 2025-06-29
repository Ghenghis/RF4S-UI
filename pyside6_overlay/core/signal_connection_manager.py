
"""
Signal Connection Manager - Manages all signal connections between components
"""

from PySide6.QtCore import QObject


class SignalConnectionManager(QObject):
    """Manages signal connections between overlay components"""
    
    def __init__(self, overlay_app):
        super().__init__()
        self.overlay_app = overlay_app
        self.managers = overlay_app.get_managers()
        
    def connect_all_signals(self):
        """Connect all signals between components"""
        self.connect_ui_to_coordinator_signals()
        self.connect_coordinator_to_ui_signals()
        self.connect_overlay_manager_signals()
        
    def connect_ui_to_coordinator_signals(self):
        """Connect UI manager signals to event coordinator"""
        ui_manager = self.managers['ui_manager']
        coordinator = self.managers['event_coordinator']
        
        # UI control signals
        ui_manager.opacity_changed.connect(coordinator.on_opacity_changed)
        ui_manager.mode_toggled.connect(coordinator.on_mode_toggled)
        ui_manager.attachment_toggled.connect(coordinator.on_attachment_toggled)
        ui_manager.emergency_stop_clicked.connect(coordinator.on_emergency_stop)
        ui_manager.reset_position_clicked.connect(coordinator.on_reset_position)
        
        # RF4S control signals
        ui_manager.start_fishing_clicked.connect(coordinator.on_start_fishing)
        ui_manager.stop_fishing_clicked.connect(coordinator.on_stop_fishing)
        ui_manager.detection_settings_changed.connect(coordinator.on_update_detection_settings)
        ui_manager.automation_settings_changed.connect(coordinator.on_update_automation_settings)
        ui_manager.fishing_mode_changed.connect(coordinator.on_change_fishing_mode)
        
    def connect_coordinator_to_ui_signals(self):
        """Connect event coordinator signals to UI manager"""
        ui_manager = self.managers['ui_manager']
        coordinator = self.managers['event_coordinator']
        
        # Status update signals
        coordinator.game_status_changed.connect(ui_manager.update_game_status)
        coordinator.rf4s_status_changed.connect(ui_manager.update_rf4s_status)
        coordinator.mode_changed.connect(ui_manager.update_mode_status)
        coordinator.position_changed.connect(ui_manager.update_position_info)
        coordinator.size_changed.connect(ui_manager.update_size_info)
        
        # Real RF4S data signals
        coordinator.session_stats_updated.connect(ui_manager.update_session_stats)
        coordinator.bot_state_changed.connect(ui_manager.update_bot_status)
        coordinator.detection_update_signal.connect(ui_manager.update_detection_settings)
        coordinator.automation_update_signal.connect(ui_manager.update_automation_settings)
        
        # Mode change UI update signals
        coordinator.mode_changed.connect(ui_manager.update_mode_toggle_text)
        coordinator.attachment_changed.connect(ui_manager.update_attach_toggle_text)
        
    def connect_overlay_manager_signals(self):
        """Connect overlay manager signals"""
        overlay_manager = self.managers['overlay_manager']
        ui_manager = self.managers['ui_manager']
        
        # Overlay manager to UI signals
        overlay_manager.position_changed.connect(ui_manager.update_position_info)
        overlay_manager.size_changed.connect(ui_manager.update_size_info)
        overlay_manager.mode_changed.connect(ui_manager.update_mode_status)
