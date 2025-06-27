
"""
Hotkey Manager - Handles global hotkey registration and management
"""

import keyboard
from PySide6.QtCore import QObject, Signal
from typing import Dict, Callable, Optional


class HotkeyManager(QObject):
    """Manages global hotkeys for the overlay"""
    
    hotkey_triggered = Signal(str)  # Hotkey name
    
    def __init__(self):
        super().__init__()
        self.registered_hotkeys: Dict[str, str] = {}
        self.hotkey_callbacks: Dict[str, Callable] = {}
        
    def register_hotkey(self, name: str, hotkey: str, callback: Callable) -> bool:
        """Register a global hotkey"""
        try:
            # Unregister if already exists
            if name in self.registered_hotkeys:
                self.unregister_hotkey(name)
                
            # Register new hotkey
            keyboard.add_hotkey(hotkey, self._hotkey_handler, args=[name])
            
            self.registered_hotkeys[name] = hotkey
            self.hotkey_callbacks[name] = callback
            
            print(f"Registered hotkey: {name} -> {hotkey}")
            return True
            
        except Exception as e:
            print(f"Failed to register hotkey {name} ({hotkey}): {e}")
            return False
            
    def unregister_hotkey(self, name: str) -> bool:
        """Unregister a hotkey"""
        try:
            if name in self.registered_hotkeys:
                hotkey = self.registered_hotkeys[name]
                keyboard.remove_hotkey(hotkey)
                
                del self.registered_hotkeys[name]
                del self.hotkey_callbacks[name]
                
                print(f"Unregistered hotkey: {name}")
                return True
                
        except Exception as e:
            print(f"Failed to unregister hotkey {name}: {e}")
            
        return False
        
    def unregister_all(self):
        """Unregister all hotkeys"""
        for name in list(self.registered_hotkeys.keys()):
            self.unregister_hotkey(name)
            
    def _hotkey_handler(self, name: str):
        """Internal hotkey handler"""
        if name in self.hotkey_callbacks:
            try:
                self.hotkey_callbacks[name]()
                self.hotkey_triggered.emit(name)
            except Exception as e:
                print(f"Error executing hotkey callback for {name}: {e}")
                
    def get_registered_hotkeys(self) -> Dict[str, str]:
        """Get all registered hotkeys"""
        return self.registered_hotkeys.copy()
        
    def is_hotkey_registered(self, name: str) -> bool:
        """Check if hotkey is registered"""
        return name in self.registered_hotkeys
        
    def setup_default_hotkeys(self, overlay_window):
        """Setup default RF4S overlay hotkeys"""
        default_hotkeys = {
            'toggle_mode': ('ctrl+m', lambda: overlay_window.toggle_mode_hotkey()),
            'toggle_opacity': ('ctrl+o', lambda: overlay_window.cycle_opacity()),
            'emergency_stop': ('ctrl+shift+s', lambda: overlay_window.on_emergency_stop()),
            'reset_position': ('ctrl+r', lambda: overlay_window.on_reset_position()),
            'show_hide_overlay': ('ctrl+h', lambda: overlay_window.toggle_visibility()),
        }
        
        for name, (hotkey, callback) in default_hotkeys.items():
            self.register_hotkey(name, hotkey, callback)
