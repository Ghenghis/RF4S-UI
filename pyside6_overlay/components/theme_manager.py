
"""
Theme Manager - Handles application theming
"""

from PySide6.QtCore import QObject, Signal, QSettings
from typing import Dict, Any


class ThemeManager(QObject):
    """Manages application themes and styling"""
    
    # Signals
    theme_changed = Signal(str)
    color_scheme_changed = Signal(dict)
    font_changed = Signal(dict)
    
    def __init__(self):
        super().__init__()
        
        # Available themes
        self.available_themes = {
            'light': {
                'name': 'Light',
                'primary_color': '#0078d4',
                'background_color': '#ffffff',
                'text_color': '#000000',
                'accent_color': '#106ebe'
            },
            'dark': {
                'name': 'Dark',
                'primary_color': '#0078d4',
                'background_color': '#202020',
                'text_color': '#ffffff',
                'accent_color': '#4cc2ff'
            }
        }
        
        # Current theme
        self.current_theme = 'dark'
        
        # Custom color schemes
        self.custom_colors = {}
        
        # Font settings
        self.font_settings = {
            'family': 'Segoe UI',
            'size': 10,
            'weight': 'normal'
        }
        
        # Load saved settings
        self.load_theme_settings()
        
    def set_theme(self, theme_name: str):
        """Set current theme"""
        if theme_name in self.available_themes:
            old_theme = self.current_theme
            self.current_theme = theme_name
            
            if old_theme != theme_name:
                self.theme_changed.emit(theme_name)
                self.save_theme_settings()
                print(f"Theme changed from {old_theme} to {theme_name}")
                
    def get_current_theme(self) -> str:
        """Get current theme name"""
        return self.current_theme
        
    def get_theme_info(self, theme_name: str = None) -> Dict[str, Any]:
        """Get theme information"""
        theme = theme_name or self.current_theme
        return self.available_themes.get(theme, {})
        
    def get_available_themes(self) -> Dict[str, Dict[str, Any]]:
        """Get all available themes"""
        return self.available_themes.copy()
        
    def set_custom_color(self, color_key: str, color_value: str):
        """Set custom color"""
        self.custom_colors[color_key] = color_value
        self.color_scheme_changed.emit(self.custom_colors.copy())
        self.save_theme_settings()
        
    def get_custom_colors(self) -> Dict[str, str]:
        """Get custom colors"""
        return self.custom_colors.copy()
        
    def set_font_family(self, family: str):
        """Set font family"""
        self.font_settings['family'] = family
        self.font_changed.emit(self.font_settings.copy())
        self.save_theme_settings()
        
    def set_font_size(self, size: int):
        """Set font size"""
        self.font_settings['size'] = size
        self.font_changed.emit(self.font_settings.copy())
        self.save_theme_settings()
        
    def set_font_weight(self, weight: str):
        """Set font weight"""
        if weight in ['normal', 'bold', 'light']:
            self.font_settings['weight'] = weight
            self.font_changed.emit(self.font_settings.copy())
            self.save_theme_settings()
            
    def get_font_settings(self) -> Dict[str, Any]:
        """Get current font settings"""
        return self.font_settings.copy()
        
    def create_custom_theme(self, name: str, theme_data: Dict[str, Any]):
        """Create a custom theme"""
        self.available_themes[name] = theme_data
        self.save_theme_settings()
        print(f"Custom theme created: {name}")
        
    def delete_custom_theme(self, name: str):
        """Delete a custom theme"""
        if name in self.available_themes and name not in ['light', 'dark']:
            del self.available_themes[name]
            
            # Switch to default if current theme is deleted
            if self.current_theme == name:
                self.set_theme('dark')
                
            self.save_theme_settings()
            print(f"Custom theme deleted: {name}")
            
    def get_theme_preview_data(self, theme_name: str) -> Dict[str, Any]:
        """Get theme preview data"""
        theme_info = self.get_theme_info(theme_name)
        return {
            'theme_name': theme_name,
            'colors': theme_info,
            'fonts': self.font_settings.copy(),
            'custom_colors': self.custom_colors.copy()
        }
        
    def load_theme_settings(self):
        """Load theme settings from storage"""
        settings = QSettings('RF4S', 'Overlay')
        
        # Load current theme
        self.current_theme = settings.value('theme/current', 'dark')
        
        # Load custom colors
        settings.beginGroup('theme/custom_colors')
        for key in settings.childKeys():
            self.custom_colors[key] = settings.value(key)
        settings.endGroup()
        
        # Load font settings
        settings.beginGroup('theme/fonts')
        self.font_settings['family'] = settings.value('family', 'Segoe UI')
        self.font_settings['size'] = int(settings.value('size', 10))
        self.font_settings['weight'] = settings.value('weight', 'normal')
        settings.endGroup()
        
    def save_theme_settings(self):
        """Save theme settings to storage"""
        settings = QSettings('RF4S', 'Overlay')
        
        # Save current theme
        settings.setValue('theme/current', self.current_theme)
        
        # Save custom colors
        settings.beginGroup('theme/custom_colors')
        for key, value in self.custom_colors.items():
            settings.setValue(key, value)
        settings.endGroup()
        
        # Save font settings
        settings.beginGroup('theme/fonts')
        settings.setValue('family', self.font_settings['family'])
        settings.setValue('size', self.font_settings['size'])
        settings.setValue('weight', self.font_settings['weight'])
        settings.endGroup()
        
        settings.sync()
        
    def reset_to_defaults(self):
        """Reset theme to default settings"""
        self.current_theme = 'dark'
        self.custom_colors.clear()
        self.font_settings = {
            'family': 'Segoe UI',
            'size': 10,
            'weight': 'normal'
        }
        
        self.theme_changed.emit(self.current_theme)
        self.color_scheme_changed.emit({})
        self.font_changed.emit(self.font_settings.copy())
        self.save_theme_settings()
