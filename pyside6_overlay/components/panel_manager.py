
"""
Panel Manager - Manages panel layouts and configurations
"""

from PySide6.QtCore import QObject, Signal
from typing import Dict, List, Any


class PanelManager(QObject):
    """Manages panel layouts and configurations"""
    
    # Signals
    layout_changed = Signal(str)
    panel_added = Signal(str)
    panel_removed = Signal(str)
    panel_moved = Signal(str, int)
    
    def __init__(self):
        super().__init__()
        
        # Available layouts
        self.available_layouts = {
            'single': {'panels': 1, 'orientation': 'vertical'},
            'dual': {'panels': 2, 'orientation': 'horizontal'},
            'triple': {'panels': 3, 'orientation': 'mixed'},
            'quad': {'panels': 4, 'orientation': 'grid'}
        }
        
        # Current layout
        self.current_layout = 'dual'
        
        # Panel configurations
        self.panel_configs = {}
        
        # Active panels
        self.active_panels = []
        
    def set_layout(self, layout_name: str):
        """Set current panel layout"""
        if layout_name in self.available_layouts:
            old_layout = self.current_layout
            self.current_layout = layout_name
            
            if old_layout != layout_name:
                self.layout_changed.emit(layout_name)
                print(f"Panel layout changed from {old_layout} to {layout_name}")
                
    def get_current_layout(self) -> str:
        """Get current layout name"""
        return self.current_layout
        
    def get_layout_info(self, layout_name: str = None) -> Dict[str, Any]:
        """Get layout information"""
        layout = layout_name or self.current_layout
        return self.available_layouts.get(layout, {})
        
    def get_available_layouts(self) -> List[str]:
        """Get list of available layouts"""
        return list(self.available_layouts.keys())
        
    def add_panel(self, panel_id: str, config: Dict[str, Any] = None):
        """Add a panel to the active panels"""
        if panel_id not in self.active_panels:
            self.active_panels.append(panel_id)
            
            if config:
                self.panel_configs[panel_id] = config
                
            self.panel_added.emit(panel_id)
            print(f"Panel added: {panel_id}")
            
    def remove_panel(self, panel_id: str):
        """Remove a panel from active panels"""
        if panel_id in self.active_panels:
            self.active_panels.remove(panel_id)
            
            if panel_id in self.panel_configs:
                del self.panel_configs[panel_id]
                
            self.panel_removed.emit(panel_id)
            print(f"Panel removed: {panel_id}")
            
    def move_panel(self, panel_id: str, new_position: int):
        """Move panel to new position"""
        if panel_id in self.active_panels:
            old_position = self.active_panels.index(panel_id)
            
            # Remove from old position
            self.active_panels.pop(old_position)
            
            # Insert at new position
            self.active_panels.insert(new_position, panel_id)
            
            self.panel_moved.emit(panel_id, new_position)
            print(f"Panel {panel_id} moved from {old_position} to {new_position}")
            
    def get_active_panels(self) -> List[str]:
        """Get list of active panels"""
        return self.active_panels.copy()
        
    def get_panel_config(self, panel_id: str) -> Dict[str, Any]:
        """Get panel configuration"""
        return self.panel_configs.get(panel_id, {})
        
    def set_panel_config(self, panel_id: str, config: Dict[str, Any]):
        """Set panel configuration"""
        self.panel_configs[panel_id] = config
        
    def get_max_panels_for_layout(self, layout_name: str = None) -> int:
        """Get maximum panels for layout"""
        layout = layout_name or self.current_layout
        return self.available_layouts.get(layout, {}).get('panels', 1)
        
    def can_add_panel(self) -> bool:
        """Check if more panels can be added"""
        max_panels = self.get_max_panels_for_layout()
        return len(self.active_panels) < max_panels
        
    def get_panel_state(self) -> Dict[str, Any]:
        """Get current panel state"""
        return {
            'layout': self.current_layout,
            'active_panels': self.active_panels.copy(),
            'panel_configs': self.panel_configs.copy()
        }
        
    def restore_panel_state(self, state: Dict[str, Any]):
        """Restore panel state"""
        if 'layout' in state:
            self.set_layout(state['layout'])
            
        if 'active_panels' in state:
            self.active_panels = state['active_panels'].copy()
            
        if 'panel_configs' in state:
            self.panel_configs = state['panel_configs'].copy()
