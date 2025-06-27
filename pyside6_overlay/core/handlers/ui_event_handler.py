
"""
UI Event Handler - Manages UI-specific events
"""

from PySide6.QtCore import QObject, Signal


class UIEventHandler(QObject):
    """Handles UI-specific events and interactions"""
    
    # UI state change signals
    mode_changed = Signal(str)
    attachment_changed = Signal(bool)
    
    def __init__(self, overlay_manager):
        super().__init__()
        self.overlay_manager = overlay_manager
        self.current_mode = 'interactive'
        self.current_opacity = 0.9
        self.is_attached = True
        
    def on_opacity_changed(self, value: int):
        """Handle opacity slider change"""
        self.current_opacity = value / 100.0
        self.overlay_manager.main_window.setWindowOpacity(self.current_opacity)
        
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
        self.attachment_changed.emit(checked)
        
    def on_emergency_stop(self):
        """Handle emergency stop - forwarded to RF4S handler"""
        pass  # Will be handled by RF4S event handler
        
    def on_reset_position(self):
        """Reset window position"""
        self.overlay_manager.main_window.move(100, 100)
        self.overlay_manager.main_window.resize(1200, 800)
        
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
            
        self.overlay_manager.main_window.setWindowOpacity(self.current_opacity)
        
    def toggle_visibility(self):
        """Toggle overlay visibility"""
        self.overlay_manager.main_window.setVisible(not self.overlay_manager.main_window.isVisible())
