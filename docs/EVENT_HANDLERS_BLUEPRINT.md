
# Event Handlers Blueprint - RF4S Bot Control

## Overview
This document provides a comprehensive blueprint of all event handlers, signals, slots, and app logic for the RF4S Bot Control application. Each component's event handling is mapped to PySide6 equivalents.

## Event System Architecture

### Core Event Management

```python
# core/event_manager.py
from PySide6.QtCore import QObject, pyqtSignal, QTimer
from typing import Dict, List, Callable, Any
from dataclasses import dataclass
from datetime import datetime

@dataclass
class EventData:
    event_type: str
    source: str
    timestamp: datetime
    payload: Any

class EventManager(QObject):
    # Global signals
    system_event = pyqtSignal(str, dict)
    ui_event = pyqtSignal(str, dict)
    service_event = pyqtSignal(str, dict)
    
    def __init__(self):
        super().__init__()
        self.listeners: Dict[str, List[Callable]] = {}
        self.event_history: List[EventData] = []
        
    def subscribe(self, event_type: str, handler: Callable):
        if event_type not in self.listeners:
            self.listeners[event_type] = []
        self.listeners[event_type].append(handler)
        
    def emit_event(self, event_type: str, data: dict, source: str = "unknown"):
        event_data = EventData(event_type, source, datetime.now(), data)
        self.event_history.append(event_data)
        
        if event_type in self.listeners:
            for handler in self.listeners[event_type]:
                try:
                    handler(data)
                except Exception as e:
                    print(f"Error in event handler: {e}")
```

## Component Event Handlers

### 1. Main Window Event Handlers

```python
# ui/main_window.py - Event Handlers
class MainWindow(FluentWindow):
    def setup_event_handlers(self):
        # Window events
        self.closeEvent = self.on_window_close
        self.resizeEvent = self.on_window_resize
        self.moveEvent = self.on_window_move
        
        # System events
        self.state_manager.connection_changed.connect(self.on_connection_changed)
        self.state_manager.game_detection_changed.connect(self.on_game_detection_changed)
        self.state_manager.panel_visibility_changed.connect(self.on_panel_visibility_changed)
        self.state_manager.config_updated.connect(self.on_config_updated)
        
        # Service events
        self.service_coordinator.system_ready.connect(self.on_system_ready)
        self.service_coordinator.system_error.connect(self.on_system_error)
        self.service_coordinator.service_status_changed.connect(self.on_service_status_changed)
        
    def on_window_close(self, event):
        """Handle application shutdown"""
        self.save_window_state()
        self.shutdown_services()
        event.accept()
        
    def on_window_resize(self, event):
        """Handle window resize"""
        self.state_manager.update_window_size(event.size())
        super().resizeEvent(event)
        
    def on_connection_changed(self, connected: bool):
        """Handle RF4S connection status change"""
        self.header.update_connection_status(connected)
        self.show_connection_notification(connected)
        
    def on_game_detection_changed(self, detected: bool):
        """Handle game detection status change"""
        self.header.update_game_status(detected)
        if detected:
            self.auto_configure_for_game()
            
    def on_system_ready(self):
        """Handle system initialization complete"""
        self.show_system_ready_notification()
        self.enable_all_features()
```

### 2. Icon Bar Event Handlers

```python
# ui/components/icon_bar.py - Event Handlers
class IconBarWidget(QWidget):
    # Signals
    panel_toggled = pyqtSignal(str)
    category_expanded = pyqtSignal(str)
    tooltip_requested = pyqtSignal(str, QPoint)
    
    def setup_event_handlers(self):
        # Mouse events for each icon button
        for panel_id, button in self.icon_buttons.items():
            button.clicked.connect(lambda checked, p_id=panel_id: self.on_panel_button_clicked(p_id))
            button.enterEvent = lambda event, p_id=panel_id: self.on_button_hover_enter(p_id, event)
            button.leaveEvent = lambda event, p_id=panel_id: self.on_button_hover_leave(p_id, event)
            button.contextMenuEvent = lambda event, p_id=panel_id: self.on_button_context_menu(p_id, event)
            
        # Category events
        self.setup_category_event_handlers()
        
    def on_panel_button_clicked(self, panel_id: str):
        """Handle panel toggle button click"""
        panel_config = self.state_manager.get_panel_config(panel_id)
        
        # Animate button press
        self.animate_button_press(panel_id)
        
        # Toggle panel visibility
        self.panel_toggled.emit(panel_id)
        
        # Update button state
        self.update_button_state(panel_id, not panel_config.visible)
        
        # Show feedback
        self.show_panel_toggle_feedback(panel_id, not panel_config.visible)
        
    def on_button_hover_enter(self, panel_id: str, event):
        """Handle button hover enter"""
        self.animate_button_hover_enter(panel_id)
        self.show_tooltip(panel_id, event.globalPos())
        
    def on_button_hover_leave(self, panel_id: str, event):
        """Handle button hover leave"""
        self.animate_button_hover_leave(panel_id)
        self.hide_tooltip()
        
    def on_button_context_menu(self, panel_id: str, event):
        """Handle right-click context menu"""
        menu = self.create_panel_context_menu(panel_id)
        menu.exec_(event.globalPos())
```

### 3. Workspace Event Handlers

```python
# ui/components/workspace.py - Event Handlers
class WorkspaceWidget(QWidget):
    # Signals
    layout_changed = pyqtSignal(int)
    panel_moved = pyqtSignal(str, int)
    panel_resized = pyqtSignal(str, QSize)
    empty_space_clicked = pyqtSignal(QPoint)
    
    def setup_event_handlers(self):
        # Layout selector events
        self.header.layout_selector.layout_changed.connect(self.on_layout_changed)
        
        # Panel splitter events
        self.panel_splitter.splitterMoved.connect(self.on_splitter_moved)
        
        # Drag and drop events
        self.setAcceptDrops(True)
        self.dragEnterEvent = self.on_drag_enter
        self.dropEvent = self.on_drop
        
        # Mouse events
        self.mousePressEvent = self.on_mouse_press
        self.mouseDoubleClickEvent = self.on_mouse_double_click
        
        # State manager events
        self.state_manager.panel_visibility_changed.connect(self.on_panel_visibility_changed)
        self.state_manager.panel_order_changed.connect(self.on_panel_order_changed)
        
    def on_layout_changed(self, layout_num: int):
        """Handle layout change (1, 2, or 3 panels)"""
        self.current_layout = layout_num
        self.reorganize_panels()
        self.animate_layout_transition()
        self.state_manager.save_layout_preference(layout_num)
        
    def on_panel_visibility_changed(self, panel_id: str, visible: bool):
        """Handle panel show/hide"""
        if visible:
            self.show_panel_with_animation(panel_id)
        else:
            self.hide_panel_with_animation(panel_id)
            
        self.update_workspace_state()
        
    def on_splitter_moved(self, pos: int, index: int):
        """Handle panel resize via splitter"""
        self.save_splitter_state()
        self.emit_panel_resize_events()
        
    def on_drag_enter(self, event):
        """Handle drag enter for panel reordering"""
        if self.is_valid_panel_drag(event):
            event.acceptProposedAction()
            
    def on_drop(self, event):
        """Handle panel drop for reordering"""
        panel_id = self.extract_panel_id_from_drop(event)
        drop_position = self.calculate_drop_position(event.pos())
        self.reorder_panel(panel_id, drop_position)
```

### 4. Panel Event Handlers

```python
# ui/components/panels/base_panel.py - Event Handlers
class BasePanel(QWidget):
    # Signals
    panel_action_requested = pyqtSignal(str, dict)
    panel_error_occurred = pyqtSignal(str, str)
    panel_data_changed = pyqtSignal(str, dict)
    panel_focus_requested = pyqtSignal(str)
    
    def setup_event_handlers(self):
        # Focus events
        self.focusInEvent = self.on_focus_in
        self.focusOutEvent = self.on_focus_out
        
        # Paint events for custom styling
        self.paintEvent = self.on_paint
        
        # Key events
        self.keyPressEvent = self.on_key_press
        
        # Timer events for periodic updates
        self.update_timer = QTimer()
        self.update_timer.timeout.connect(self.on_periodic_update)
        
    def on_focus_in(self, event):
        """Handle panel gaining focus"""
        self.setStyleSheet(self.get_focused_style())
        self.panel_focus_requested.emit(self.panel_id)
        super().focusInEvent(event)
        
    def on_periodic_update(self):
        """Handle periodic panel updates"""
        self.refresh_panel_data()
        self.update_display()
```

## Service Event Handlers

### 1. RF4S Integration Service Events

```python
# services/rf4s_integration_service.py - Event Handlers
class RF4SIntegrationService(QObject):
    # Signals
    connection_established = pyqtSignal(dict)
    connection_lost = pyqtSignal(str)
    data_received = pyqtSignal(str, dict)
    error_occurred = pyqtSignal(str, str)
    
    def setup_event_handlers(self):
        # Network events
        self.network_manager.finished.connect(self.on_network_request_finished)
        self.network_manager.networkAccessibleChanged.connect(self.on_network_accessibility_changed)
        
        # Timer events
        self.connection_timer.timeout.connect(self.on_connection_check)
        self.data_timer.timeout.connect(self.on_data_request)
        
        # RF4S process events
        if hasattr(self, 'rf4s_process'):
            self.rf4s_process.started.connect(self.on_rf4s_started)
            self.rf4s_process.finished.connect(self.on_rf4s_finished)
            self.rf4s_process.errorOccurred.connect(self.on_rf4s_error)
            
    def on_network_request_finished(self, reply):
        """Handle network request completion"""
        if reply.error() == QNetworkReply.NoError:
            data = self.parse_rf4s_response(reply.readAll())
            self.data_received.emit('status_update', data)
        else:
            self.error_occurred.emit('network', reply.errorString())
            
    def on_connection_check(self):
        """Periodic connection health check"""
        if not self.is_connected():
            self.attempt_reconnection()
        else:
            self.request_status_update()
```

### 2. System Monitor Service Events

```python
# services/system_monitor_service.py - Event Handlers
class SystemMonitorService(QObject):
    # Signals
    system_stats_updated = pyqtSignal(dict)
    performance_alert = pyqtSignal(str, dict)
    resource_threshold_exceeded = pyqtSignal(str, float)
    
    def setup_event_handlers(self):
        # Monitoring timer
        self.monitor_timer.timeout.connect(self.on_monitor_update)
        
        # System events (platform specific)
        self.setup_platform_events()
        
    def on_monitor_update(self):
        """Handle periodic system monitoring"""
        stats = self.collect_system_stats()
        self.check_performance_thresholds(stats)
        self.system_stats_updated.emit(stats)
        
    def check_performance_thresholds(self, stats: dict):
        """Check for performance issues"""
        if stats['cpu_usage'] > 90:
            self.performance_alert.emit('high_cpu', stats)
        if stats['memory_usage'] > 85:
            self.performance_alert.emit('high_memory', stats)
```

## Panel-Specific Event Handlers

### 1. Script Control Panel Events

```python
# panels/script_control_panel.py - Event Handlers
class ScriptControlPanel(BasePanel):
    # Signals
    script_start_requested = pyqtSignal()
    script_stop_requested = pyqtSignal()
    script_pause_requested = pyqtSignal()
    emergency_stop_requested = pyqtSignal()
    
    def setup_control_events(self):
        # Button events
        self.start_button.clicked.connect(self.on_start_clicked)
        self.stop_button.clicked.connect(self.on_stop_clicked)
        self.pause_button.clicked.connect(self.on_pause_clicked)
        self.emergency_button.clicked.connect(self.on_emergency_stop)
        
        # Slider events
        self.speed_slider.valueChanged.connect(self.on_speed_changed)
        self.delay_slider.valueChanged.connect(self.on_delay_changed)
        
        # Checkbox events
        self.auto_mode_checkbox.toggled.connect(self.on_auto_mode_toggled)
        
    def on_start_clicked(self):
        """Handle start button click"""
        if self.validate_start_conditions():
            self.animate_start_sequence()
            self.script_start_requested.emit()
            self.update_ui_for_running_state()
        else:
            self.show_validation_errors()
            
    def on_emergency_stop(self):
        """Handle emergency stop"""
        self.emergency_stop_requested.emit()
        self.show_emergency_stop_feedback()
        self.reset_ui_to_stopped_state()
```

### 2. Fishing Profiles Panel Events

```python
# panels/fishing_profiles_panel.py - Event Handlers
class FishingProfilesPanel(BasePanel):
    # Signals
    profile_selected = pyqtSignal(str)
    profile_created = pyqtSignal(dict)
    profile_modified = pyqtSignal(str, dict)
    profile_deleted = pyqtSignal(str)
    
    def setup_profile_events(self):
        # Profile list events
        self.profile_list.itemClicked.connect(self.on_profile_selected)
        self.profile_list.itemDoubleClicked.connect(self.on_profile_edit)
        self.profile_list.customContextMenuRequested.connect(self.on_profile_context_menu)
        
        # Button events
        self.new_profile_button.clicked.connect(self.on_new_profile)
        self.edit_profile_button.clicked.connect(self.on_edit_profile)
        self.delete_profile_button.clicked.connect(self.on_delete_profile)
        self.duplicate_profile_button.clicked.connect(self.on_duplicate_profile)
        
        # Profile settings events
        self.technique_combo.currentTextChanged.connect(self.on_technique_changed)
        self.location_combo.currentTextChanged.connect(self.on_location_changed)
        self.bait_combo.currentTextChanged.connect(self.on_bait_changed)
        
    def on_profile_selected(self, item):
        """Handle profile selection"""
        profile_id = item.data(Qt.UserRole)
        profile = self.state_manager.get_fishing_profile(profile_id)
        
        self.load_profile_settings(profile)
        self.profile_selected.emit(profile_id)
        self.update_ui_for_selection(profile)
        
    def on_new_profile(self):
        """Handle new profile creation"""
        dialog = ProfileCreationDialog(self)
        if dialog.exec_() == QDialog.Accepted:
            profile_data = dialog.get_profile_data()
            self.profile_created.emit(profile_data)
            self.refresh_profile_list()
```

### 3. Detection Settings Panel Events

```python
# panels/detection_settings_panel.py - Event Handlers
class DetectionSettingsPanel(BasePanel):
    # Signals
    confidence_changed = pyqtSignal(str, float)
    detection_enabled_changed = pyqtSignal(str, bool)
    calibration_requested = pyqtSignal(str)
    
    def setup_detection_events(self):
        # Slider events for confidence levels
        self.fish_bite_slider.valueChanged.connect(
            lambda val: self.on_confidence_changed('fish_bite', val)
        )
        self.spool_slider.valueChanged.connect(
            lambda val: self.on_confidence_changed('spool', val)
        )
        self.cast_slider.valueChanged.connect(
            lambda val: self.on_confidence_changed('cast', val)
        )
        
        # Toggle events for detection features
        self.auto_detect_toggle.toggled.connect(
            lambda checked: self.on_detection_toggled('auto_detect', checked)
        )
        
        # Calibration button events
        self.calibrate_fish_button.clicked.connect(
            lambda: self.on_calibration_requested('fish_bite')
        )
        self.calibrate_spool_button.clicked.connect(
            lambda: self.on_calibration_requested('spool')
        )
        
    def on_confidence_changed(self, detection_type: str, value: float):
        """Handle confidence level change"""
        normalized_value = value / 100.0
        self.confidence_changed.emit(detection_type, normalized_value)
        self.update_confidence_display(detection_type, normalized_value)
        self.save_detection_settings()
        
    def on_calibration_requested(self, detection_type: str):
        """Handle calibration request"""
        self.calibration_requested.emit(detection_type)
        self.start_calibration_sequence(detection_type)
```

## Configuration and Settings Event Handlers

### 1. Configuration Management Events

```python
# core/config_manager.py - Event Handlers
class ConfigManager(QObject):
    # Signals
    config_loaded = pyqtSignal(dict)
    config_saved = pyqtSignal(str)
    config_validation_failed = pyqtSignal(list)
    config_changed = pyqtSignal(str, dict)
    
    def setup_config_events(self):
        # File watcher for external config changes
        self.file_watcher.fileChanged.connect(self.on_config_file_changed)
        
        # Auto-save timer
        self.auto_save_timer.timeout.connect(self.on_auto_save)
        
    def on_config_file_changed(self, file_path: str):
        """Handle external config file changes"""
        self.reload_config_from_file(file_path)
        self.config_loaded.emit(self.current_config)
        
    def on_auto_save(self):
        """Handle auto-save timer"""
        if self.has_unsaved_changes():
            self.save_config()
```

### 2. User Preferences Event Handlers

```python
# core/preferences_manager.py - Event Handlers
class PreferencesManager(QObject):
    # Signals
    theme_changed = pyqtSignal(str)
    language_changed = pyqtSignal(str)
    layout_preference_changed = pyqtSignal(dict)
    
    def setup_preference_events(self):
        # Settings change monitoring
        self.settings.valueChanged.connect(self.on_setting_changed)
        
    def on_setting_changed(self, key: str, value):
        """Handle preference changes"""
        if key.startswith('theme'):
            self.theme_changed.emit(value)
        elif key.startswith('language'):
            self.language_changed.emit(value)
        elif key.startswith('layout'):
            self.layout_preference_changed.emit({key: value})
```

## Error Handling and Recovery Events

### 1. Error Management System

```python
# core/error_manager.py - Event Handlers
class ErrorManager(QObject):
    # Signals
    error_occurred = pyqtSignal(str, str, dict)
    recovery_attempted = pyqtSignal(str)
    recovery_successful = pyqtSignal(str)
    recovery_failed = pyqtSignal(str, str)
    
    def setup_error_events(self):
        # Global exception handler
        sys.excepthook = self.handle_uncaught_exception
        
        # Service error subscriptions
        self.subscribe_to_service_errors()
        
    def handle_uncaught_exception(self, exc_type, exc_value, exc_traceback):
        """Handle uncaught exceptions"""
        error_info = {
            'type': str(exc_type.__name__),
            'message': str(exc_value),
            'traceback': traceback.format_tb(exc_traceback)
        }
        
        self.error_occurred.emit('uncaught_exception', 'system', error_info)
        self.attempt_error_recovery('uncaught_exception')
```

## Animation and Visual Effects Event Handlers

### 1. Animation Controller

```python
# ui/animations/animation_controller.py - Event Handlers
class AnimationController(QObject):
    # Signals
    animation_started = pyqtSignal(str)
    animation_finished = pyqtSignal(str)
    animation_state_changed = pyqtSignal(str, str)
    
    def setup_animation_events(self):
        # Animation group events
        for name, animation in self.animations.items():
            animation.started.connect(
                lambda n=name: self.animation_started.emit(n)
            )
            animation.finished.connect(
                lambda n=name: self.animation_finished.emit(n)
            )
            animation.stateChanged.connect(
                lambda state, n=name: self.animation_state_changed.emit(n, state)
            )
```

## Complete Event Handler Registry

### Event Handler Registry System

```python
# core/event_registry.py
class EventHandlerRegistry:
    def __init__(self):
        self.handlers = {
            # Main Window Events
            'window.close': ['save_state', 'shutdown_services'],
            'window.resize': ['update_layout', 'save_geometry'],
            'window.minimize': ['pause_non_essential_services'],
            'window.restore': ['resume_services'],
            
            # Connection Events
            'rf4s.connected': ['update_ui_status', 'enable_features', 'start_monitoring'],
            'rf4s.disconnected': ['update_ui_status', 'disable_features', 'attempt_reconnect'],
            'rf4s.data_received': ['update_panels', 'log_data', 'trigger_notifications'],
            
            # Script Events
            'script.started': ['update_controls', 'start_monitoring', 'log_session'],
            'script.stopped': ['update_controls', 'stop_monitoring', 'save_session'],
            'script.paused': ['update_controls', 'pause_monitoring'],
            'script.error': ['handle_script_error', 'show_error_dialog'],
            
            # Panel Events
            'panel.added': ['update_layout', 'register_handlers', 'save_layout'],
            'panel.removed': ['update_layout', 'cleanup_handlers', 'save_layout'],
            'panel.moved': ['update_layout', 'save_layout'],
            'panel.resized': ['save_panel_size'],
            
            # Configuration Events
            'config.changed': ['validate_config', 'update_services', 'save_config'],
            'config.loaded': ['apply_config', 'update_ui'],
            'config.validation_failed': ['show_validation_errors', 'revert_changes'],
            
            # System Events
            'system.low_memory': ['free_memory', 'pause_non_essential'],
            'system.high_cpu': ['reduce_monitoring_frequency'],
            'system.disk_full': ['cleanup_logs', 'show_warning'],
            
            # User Interface Events
            'ui.theme_changed': ['apply_theme', 'update_all_widgets'],
            'ui.language_changed': ['reload_translations', 'update_text'],
            'ui.font_changed': ['apply_font_changes'],
            
            # Service Events
            'service.started': ['register_service', 'update_status'],
            'service.stopped': ['unregister_service', 'update_status'],
            'service.error': ['handle_service_error', 'attempt_recovery'],
            
            # Animation Events
            'animation.completed': ['cleanup_animation', 'trigger_next'],
            'animation.interrupted': ['reset_state', 'log_interruption'],
            
            # Fishing Events
            'fishing.fish_caught': ['update_stats', 'play_sound', 'log_catch'],
            'fishing.cast_performed': ['update_ui', 'start_timer'],
            'fishing.bite_detected': ['alert_user', 'prepare_reel_in'],
            
            # Profile Events
            'profile.selected': ['load_profile', 'update_ui', 'validate_settings'],
            'profile.created': ['save_profile', 'refresh_list', 'select_new'],
            'profile.deleted': ['remove_profile', 'refresh_list', 'select_default'],
            
            # Detection Events
            'detection.confidence_changed': ['update_detection_engine', 'save_settings'],
            'detection.calibration_complete': ['apply_calibration', 'show_results'],
            'detection.false_positive': ['adjust_thresholds', 'log_event'],
            
            # Error Events
            'error.critical': ['show_error_dialog', 'attempt_recovery', 'log_error'],
            'error.warning': ['show_notification', 'log_warning'],
            'error.info': ['log_info'],
            
            # Notification Events
            'notification.show': ['display_notification', 'play_sound'],
            'notification.dismiss': ['hide_notification', 'log_dismissal'],
            
            # Backup Events
            'backup.created': ['log_backup', 'cleanup_old_backups'],
            'backup.restored': ['reload_config', 'restart_services'],
            'backup.failed': ['show_error', 'retry_backup'],
        }
        
    def get_handlers_for_event(self, event_type: str) -> List[str]:
        return self.handlers.get(event_type, [])
        
    def register_handler(self, event_type: str, handler_name: str):
        if event_type not in self.handlers:
            self.handlers[event_type] = []
        self.handlers[event_type].append(handler_name)
```

This comprehensive event handler blueprint provides the complete foundation for implementing all event handling in the PySide6 version of the RF4S Bot Control application.
