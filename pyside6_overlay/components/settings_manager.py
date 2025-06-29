
"""
Settings Manager - Handles application settings persistence
"""

from PySide6.QtCore import QObject, Signal, QSettings
from typing import Dict, Any, Optional
import json


class SettingsManager(QObject):
    """Manages application settings and persistence"""
    
    # Signals
    settings_changed = Signal(str, object)
    settings_loaded = Signal()
    settings_saved = Signal()
    
    def __init__(self):
        super().__init__()
        
        # QSettings instance
        self.settings = QSettings('RF4S', 'Overlay')
        
        # Settings cache
        self.settings_cache = {}
        
        # Default settings
        self.default_settings = {
            'window': {
                'geometry': None,
                'window_state': None,
                'theme': 'dark',
                'layout': 'dual'
            },
            'panels': {
                'active_panels': [],
                'panel_configs': {},
                'layout_settings': {}
            },
            'theme': {
                'current': 'dark',
                'custom_colors': {},
                'font_family': 'Segoe UI',
                'font_size': 10,
                'font_weight': 'normal'
            },
            'ui': {
                'animation_enabled': True,
                'auto_save': True,
                'auto_save_interval': 30,
                'show_tooltips': True
            },
            'rf4s': {
                'connection_host': 'localhost',
                'connection_port': 8888,
                'auto_connect': True,
                'connection_timeout': 5
            }
        }
        
        # Load settings on initialization
        self.load_all_settings()
        
    def get_setting(self, key: str, default_value: Any = None) -> Any:
        """Get a setting value"""
        # Check cache first
        if key in self.settings_cache:
            return self.settings_cache[key]
            
        # Get from QSettings
        value = self.settings.value(key, default_value)
        
        # Cache the value
        self.settings_cache[key] = value
        
        return value
        
    def set_setting(self, key: str, value: Any):
        """Set a setting value"""
        # Update cache
        old_value = self.settings_cache.get(key)
        self.settings_cache[key] = value
        
        # Save to QSettings
        self.settings.setValue(key, value)
        self.settings.sync()
        
        # Emit signal if value changed
        if old_value != value:
            self.settings_changed.emit(key, value)
            
    def save_setting(self, key: str, value: Any):
        """Alias for set_setting"""
        self.set_setting(key, value)
        
    def get_section_settings(self, section: str) -> Dict[str, Any]:
        """Get all settings for a section"""
        section_settings = {}
        
        self.settings.beginGroup(section)
        for key in self.settings.childKeys():
            section_settings[key] = self.settings.value(key)
        self.settings.endGroup()
        
        return section_settings
        
    def save_section_settings(self, section: str, settings_dict: Dict[str, Any]):
        """Save all settings for a section"""
        self.settings.beginGroup(section)
        
        # Clear existing settings in section
        self.settings.remove('')
        
        # Save new settings
        for key, value in settings_dict.items():
            self.settings.setValue(key, value)
            # Update cache
            cache_key = f"{section}/{key}"
            self.settings_cache[cache_key] = value
            
        self.settings.endGroup()
        self.settings.sync()
        
    def get_window_settings(self) -> Dict[str, Any]:
        """Get window-specific settings"""
        return self.get_section_settings('window')
        
    def save_window_settings(self, settings_dict: Dict[str, Any]):
        """Save window-specific settings"""
        self.save_section_settings('window', settings_dict)
        
    def get_panel_settings(self) -> Dict[str, Any]:
        """Get panel-specific settings"""
        return self.get_section_settings('panels')
        
    def save_panel_settings(self, settings_dict: Dict[str, Any]):
        """Save panel-specific settings"""
        self.save_section_settings('panels', settings_dict)
        
    def get_theme_settings(self) -> Dict[str, Any]:
        """Get theme-specific settings"""
        return self.get_section_settings('theme')
        
    def save_theme_settings(self, settings_dict: Dict[str, Any]):
        """Save theme-specific settings"""
        self.save_section_settings('theme', settings_dict)
        
    def get_ui_settings(self) -> Dict[str, Any]:
        """Get UI-specific settings"""
        return self.get_section_settings('ui')
        
    def save_ui_settings(self, settings_dict: Dict[str, Any]):
        """Save UI-specific settings"""
        self.save_section_settings('ui', settings_dict)
        
    def get_rf4s_settings(self) -> Dict[str, Any]:
        """Get RF4S-specific settings"""
        return self.get_section_settings('rf4s')
        
    def save_rf4s_settings(self, settings_dict: Dict[str, Any]):
        """Save RF4S-specific settings"""
        self.save_section_settings('rf4s', settings_dict)
        
    def load_all_settings(self):
        """Load all settings from storage"""
        try:
            # Load each section
            for section in self.default_settings.keys():
                section_settings = self.get_section_settings(section)
                
                # Merge with defaults
                for key, default_value in self.default_settings[section].items():
                    cache_key = f"{section}/{key}"
                    if key in section_settings:
                        self.settings_cache[cache_key] = section_settings[key]
                    else:
                        self.settings_cache[cache_key] = default_value
                        
            self.settings_loaded.emit()
            print("Settings loaded successfully")
            
        except Exception as e:
            print(f"Error loading settings: {e}")
            self.load_default_settings()
            
    def load_default_settings(self):
        """Load default settings"""
        for section, section_settings in self.default_settings.items():
            for key, value in section_settings.items():
                cache_key = f"{section}/{key}"
                self.settings_cache[cache_key] = value
                
        print("Default settings loaded")
        
    def export_settings(self, file_path: str) -> bool:
        """Export settings to file"""
        try:
            export_data = {}
            
            # Export all cached settings
            for section in self.default_settings.keys():
                export_data[section] = self.get_section_settings(section)
                
            with open(file_path, 'w') as f:
                json.dump(export_data, f, indent=2)
                
            print(f"Settings exported to {file_path}")
            return True
            
        except Exception as e:
            print(f"Error exporting settings: {e}")
            return False
            
    def import_settings(self, file_path: str) -> bool:
        """Import settings from file"""
        try:
            with open(file_path, 'r') as f:
                import_data = json.load(f)
                
            # Import each section
            for section, section_data in import_data.items():
                if section in self.default_settings:
                    self.save_section_settings(section, section_data)
                    
            # Reload settings
            self.load_all_settings()
            
            print(f"Settings imported from {file_path}")
            return True
            
        except Exception as e:
            print(f"Error importing settings: {e}")
            return False
            
    def reset_settings(self):
        """Reset all settings to defaults"""
        # Clear QSettings
        self.settings.clear()
        
        # Clear cache
        self.settings_cache.clear()
        
        # Load defaults
        self.load_default_settings()
        
        # Save defaults to storage
        for section, section_settings in self.default_settings.items():
            self.save_section_settings(section, section_settings)
            
        print("Settings reset to defaults")
        
    def validate_settings(self) -> Dict[str, List[str]]:
        """Validate current settings"""
        errors = {}
        
        # Validate RF4S settings
        rf4s_settings = self.get_rf4s_settings()
        rf4s_errors = []
        
        if 'connection_port' in rf4s_settings:
            port = rf4s_settings['connection_port']
            if not isinstance(port, int) or port < 1 or port > 65535:
                rf4s_errors.append("Invalid connection port")
                
        if 'connection_timeout' in rf4s_settings:
            timeout = rf4s_settings['connection_timeout']
            if not isinstance(timeout, (int, float)) or timeout < 1:
                rf4s_errors.append("Invalid connection timeout")
                
        if rf4s_errors:
            errors['rf4s'] = rf4s_errors
            
        # Validate UI settings
        ui_settings = self.get_ui_settings()
        ui_errors = []
        
        if 'auto_save_interval' in ui_settings:
            interval = ui_settings['auto_save_interval']
            if not isinstance(interval, int) or interval < 5:
                ui_errors.append("Auto-save interval must be at least 5 seconds")
                
        if ui_errors:
            errors['ui'] = ui_errors
            
        return errors
