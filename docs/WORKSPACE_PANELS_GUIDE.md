
# Workspace and Panels Implementation Guide

## Workspace Component

### Core Workspace Implementation

```python
# ui/components/workspace.py
from PySide6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, 
                               QStackedWidget, QSplitter, QScrollArea,
                               QLabel, QPushButton, QButtonGroup)
from PySide6.QtCore import Qt, pyqtSignal, QPropertyAnimation, QEasingCurve
from PySide6.QtGui import QFont, QPalette
from qfluentwidgets import CardWidget, PushButton, RadioButton
from .panels import PanelFactory

class LayoutSelector(QWidget):
    layout_changed = pyqtSignal(int)
    
    def __init__(self):
        super().__init__()
        self.current_layout = 1
        self.setup_ui()
    
    def setup_ui(self):
        self.setFixedHeight(50)
        
        layout = QHBoxLayout(self)
        layout.setContentsMargins(16, 8, 16, 8)
        
        # Layout selector container
        selector_container = QWidget()
        selector_container.setStyleSheet("""
            QWidget {
                background-color: #1F2937;
                border-radius: 8px;
                padding: 8px;
            }
        """)
        
        selector_layout = QHBoxLayout(selector_container)
        
        # Label
        label = QLabel("Panel Layout:")
        label.setStyleSheet("color: #D1D5DB; font-size: 12px;")
        selector_layout.addWidget(label)
        
        # Layout buttons
        self.button_group = QButtonGroup()
        self.layout_buttons = []
        
        for i in range(1, 4):
            button = RadioButton(f"{i} Panel{'s' if i > 1 else ''}")
            button.setChecked(i == 1)
            button.clicked.connect(lambda checked, num=i: self.on_layout_selected(num))
            
            self.button_group.addButton(button, i)
            self.layout_buttons.append(button)
            selector_layout.addWidget(button)
        
        layout.addWidget(selector_container)
        layout.addStretch()
    
    def on_layout_selected(self, layout_num):
        if layout_num != self.current_layout:
            self.current_layout = layout_num
            self.layout_changed.emit(layout_num)

class EmptyWorkspace(QWidget):
    def __init__(self, state_manager):
        super().__init__()
        self.state_manager = state_manager
        self.setup_ui()
    
    def setup_ui(self):
        self.setStyleSheet("""
            EmptyWorkspace {
                background-color: #111827;
            }
        """)
        
        layout = QVBoxLayout(self)
        layout.setAlignment(Qt.AlignCenter)
        
        # Central content
        content_widget = QWidget()
        content_widget.setFixedSize(400, 300)
        content_layout = QVBoxLayout(content_widget)
        content_layout.setAlignment(Qt.AlignCenter)
        content_layout.setSpacing(20)
        
        # Title
        title = QLabel("🎣 RF4S Bot Control")
        title.setAlignment(Qt.AlignCenter)
        title.setStyleSheet("color: #9CA3AF; font-size: 20px; font-weight: bold;")
        content_layout.addWidget(title)
        
        # Subtitle
        subtitle = QLabel("Use the left sidebar to add panels and start fishing!")
        subtitle.setAlignment(Qt.AlignCenter)
        subtitle.setStyleSheet("color: #6B7280; font-size: 14px;")
        content_layout.addWidget(subtitle)
        
        # Status card
        status_card = self.create_status_card()
        content_layout.addWidget(status_card)
        
        layout.addWidget(content_widget)
    
    def create_status_card(self):
        card = CardWidget()
        card.setFixedSize(300, 120)
        card.setStyleSheet("""
            CardWidget {
                background-color: #1F2937;
                border: 1px solid #374151;
                border-radius: 8px;
            }
        """)
        
        layout = QVBoxLayout(card)
        layout.setContentsMargins(16, 12, 16, 12)
        
        # Title
        title = QLabel("RF4S Codebase Status")
        title.setStyleSheet("color: #D1D5DB; font-size: 12px; font-weight: 500;")
        layout.addWidget(title)
        
        # Status items
        status_layout = QVBoxLayout()
        status_layout.setSpacing(4)
        
        # Connection status
        conn_widget = self.create_status_item("Connection:", "Disconnected", "#EF4444")
        status_layout.addWidget(conn_widget)
        
        # Panels loaded
        panels_widget = self.create_status_item("Panels Loaded:", "14", "#3B82F6")
        status_layout.addWidget(panels_widget)
        
        layout.addLayout(status_layout)
        
        # Connection message
        msg = QLabel("Establishing RF4S codebase connection...")
        msg.setStyleSheet("color: #F59E0B; font-size: 10px;")
        layout.addWidget(msg)
        
        return card
    
    def create_status_item(self, label, value, color):
        widget = QWidget()
        layout = QHBoxLayout(widget)
        layout.setContentsMargins(0, 0, 0, 0)
        
        label_widget = QLabel(label)
        label_widget.setStyleSheet("color: #9CA3AF; font-size: 10px;")
        
        value_widget = QLabel(value)
        value_widget.setStyleSheet(f"color: {color}; font-size: 10px;")
        
        layout.addWidget(label_widget)
        layout.addStretch()
        layout.addWidget(value_widget)
        
        return widget

class WorkspaceHeader(QWidget):
    def __init__(self, state_manager):
        super().__init__()
        self.state_manager = state_manager
        self.setup_ui()
    
    def setup_ui(self):
        self.setFixedHeight(60)
        self.setStyleSheet("""
            WorkspaceHeader {
                background-color: #111827;
                border-bottom: 1px solid #374151;
            }
        """)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(16, 8, 16, 8)
        
        # Layout selector
        self.layout_selector = LayoutSelector()
        layout.addWidget(self.layout_selector)
        
        # Connection status
        status_layout = QHBoxLayout()
        
        # Status dot
        self.status_dot = QLabel()
        self.status_dot.setFixedSize(8, 8)
        self.status_dot.setStyleSheet("""
            QLabel {
                background-color: #EF4444;
                border-radius: 4px;
            }
        """)
        
        status_text = QLabel("RF4S Codebase Disconnected")
        status_text.setStyleSheet("color: #9CA3AF; font-size: 10px;")
        
        panels_text = QLabel("• 0 panels active")
        panels_text.setStyleSheet("color: #6B7280; font-size: 10px;")
        
        status_layout.addWidget(self.status_dot)
        status_layout.addWidget(status_text)
        status_layout.addWidget(panels_text)
        status_layout.addStretch()
        
        layout.addLayout(status_layout)

class PanelContainer(QWidget):
    def __init__(self, panel_widget):
        super().__init__()
        self.panel_widget = panel_widget
        self.setup_ui()
    
    def setup_ui(self):
        self.setStyleSheet("""
            PanelContainer {
                background-color: #111827;
                border: 1px solid #374151;
                border-radius: 8px;
                margin: 4px;
            }
        """)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.addWidget(self.panel_widget)

class WorkspaceWidget(QWidget):
    def __init__(self, state_manager):
        super().__init__()
        self.state_manager = state_manager
        self.current_layout = 1
        self.panel_factory = PanelFactory(state_manager)
        
        self.setup_ui()
        self.setup_connections()
    
    def setup_ui(self):
        self.setStyleSheet("""
            WorkspaceWidget {
                background-color: #111827;
            }
        """)
        
        self.main_layout = QVBoxLayout(self)
        self.main_layout.setContentsMargins(0, 0, 0, 0)
        self.main_layout.setSpacing(0)
        
        # Header
        self.header = WorkspaceHeader(self.state_manager)
        self.main_layout.addWidget(self.header)
        
        # Content area
        self.content_stack = QStackedWidget()
        
        # Empty workspace
        self.empty_workspace = EmptyWorkspace(self.state_manager)
        self.content_stack.addWidget(self.empty_workspace)
        
        # Panel workspace
        self.panel_workspace = QWidget()
        self.setup_panel_workspace()
        self.content_stack.addWidget(self.panel_workspace)
        
        self.main_layout.addWidget(self.content_stack)
        
        # Show empty workspace initially
        self.content_stack.setCurrentWidget(self.empty_workspace)
    
    def setup_panel_workspace(self):
        self.panel_layout = QVBoxLayout(self.panel_workspace)
        self.panel_layout.setContentsMargins(8, 8, 8, 8)
        
        # Splitter for panels
        self.panel_splitter = QSplitter(Qt.Horizontal)
        self.update_panel_layout()
        
        self.panel_layout.addWidget(self.panel_splitter)
    
    def setup_connections(self):
        self.header.layout_selector.layout_changed.connect(self.change_layout)
        self.state_manager.panel_visibility_changed.connect(self.update_panels)
    
    def change_layout(self, layout_num):
        if layout_num != self.current_layout:
            self.current_layout = layout_num
            self.update_panel_layout()
    
    def toggle_panel(self, panel_id):
        self.state_manager.toggle_panel(panel_id)
    
    def update_panels(self, panel_id, visible):
        visible_panels = self.state_manager.get_visible_panels()
        
        if len(visible_panels) == 0:
            self.content_stack.setCurrentWidget(self.empty_workspace)
        else:
            self.content_stack.setCurrentWidget(self.panel_workspace)
            self.organize_panels(visible_panels)
    
    def organize_panels(self, visible_panels):
        # Clear existing panels
        for i in reversed(range(self.panel_splitter.count())):
            child = self.panel_splitter.widget(i)
            if child:
                child.setParent(None)
        
        # Organize panels based on layout
        panel_groups = self.organize_panel_groups(visible_panels)
        
        for group in panel_groups:
            if len(group) == 1:
                # Single panel
                panel_widget = self.panel_factory.create_panel(group[0].id)
                container = PanelContainer(panel_widget)
                self.panel_splitter.addWidget(container)
            else:
                # Multiple panels in vertical layout
                vertical_widget = QWidget()
                vertical_layout = QVBoxLayout(vertical_widget)
                vertical_layout.setContentsMargins(0, 0, 0, 0)
                vertical_layout.setSpacing(4)
                
                for panel_config in group:
                    panel_widget = self.panel_factory.create_panel(panel_config.id)
                    container = PanelContainer(panel_widget)
                    vertical_layout.addWidget(container)
                
                self.panel_splitter.addWidget(vertical_widget)
        
        # Set equal sizes
        sizes = [100] * self.panel_splitter.count()
        self.panel_splitter.setSizes(sizes)
    
    def organize_panel_groups(self, visible_panels):
        """Organize panels into groups based on layout"""
        if self.current_layout == 1:
            return [visible_panels]
        elif self.current_layout == 2:
            mid = len(visible_panels) // 2
            return [visible_panels[:mid], visible_panels[mid:]] if visible_panels else []
        else:  # layout == 3
            third = len(visible_panels) // 3
            remainder = len(visible_panels) % 3
            
            groups = []
            start = 0
            for i in range(3):
                size = third + (1 if i < remainder else 0)
                if start < len(visible_panels):
                    groups.append(visible_panels[start:start + size])
                    start += size
            
            return [g for g in groups if g]  # Remove empty groups
    
    def update_panel_layout(self):
        visible_panels = self.state_manager.get_visible_panels()
        if visible_panels:
            self.organize_panels(visible_panels)
```

## Panel Factory and Base Panel

```python
# ui/components/panels/__init__.py
from .base_panel import BasePanel
from .script_control_panel import ScriptControlPanel
from .game_integration_panel import GameIntegrationPanel
from .system_monitor_panel import SystemMonitorPanel
from .achievement_panel import AchievementPanel
from .save_load_panel import SaveLoadPanel
from .environmental_panel import EnvironmentalPanel
from .game_state_panel import GameStatePanel
from .configurator_integration_panel import ConfiguratorIntegrationPanel
from .system_status_panel import SystemStatusPanel
from .detection_settings_panel import DetectionSettingsPanel
from .fishing_stats_panel import FishingStatsPanel
from .fishing_profiles_panel import FishingProfilesPanel
from .friction_brake_panel import FrictionBrakePanel

class PanelFactory:
    def __init__(self, state_manager):
        self.state_manager = state_manager
        self.panel_classes = {
            'script-control': ScriptControlPanel,
            'game-integration': GameIntegrationPanel,
            'system-monitor': SystemMonitorPanel,
            'achievement-tracker': AchievementPanel,
            'save-load-manager': SaveLoadPanel,
            'environmental-effects': EnvironmentalPanel,
            'game-state-monitor': GameStatePanel,
            'configurator-integration': ConfiguratorIntegrationPanel,
            'system-status': SystemStatusPanel,
            'detection-settings': DetectionSettingsPanel,
            'fishing-stats': FishingStatsPanel,
            'fishing-profiles': FishingProfilesPanel,
            'friction-brake': FrictionBrakePanel,
        }
    
    def create_panel(self, panel_id):
        panel_class = self.panel_classes.get(panel_id)
        if panel_class:
            return panel_class(self.state_manager)
        else:
            return BasePanel(f"Unknown Panel: {panel_id}", self.state_manager)

# ui/components/panels/base_panel.py
from PySide6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, 
                               QLabel, QScrollArea, QFrame)
from PySide6.QtCore import Qt
from PySide6.QtGui import QFont
from qfluentwidgets import CardWidget, IconWidget, FluentIcon
import qtawesome as qta

class BasePanel(QWidget):
    def __init__(self, title, state_manager, icon_name=None):
        super().__init__()
        self.title = title
        self.state_manager = state_manager
        self.icon_name = icon_name
        self.setup_ui()
    
    def setup_ui(self):
        self.setStyleSheet("""
            BasePanel {
                background-color: #111827;
                color: white;
            }
        """)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        
        # Header
        header = self.create_header()
        layout.addWidget(header)
        
        # Content area
        self.content_area = QScrollArea()
        self.content_area.setWidgetResizable(True)
        self.content_area.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        self.content_area.setVerticalScrollBarPolicy(Qt.ScrollBarAsNeeded)
        self.content_area.setStyleSheet("""
            QScrollArea {
                border: none;
                background: transparent;
            }
            QScrollBar:vertical {
                background: #374151;
                width: 8px;
                border-radius: 4px;
            }
            QScrollBar::handle:vertical {
                background: #6B7280;
                border-radius: 4px;
                min-height: 20px;
            }
            QScrollBar::handle:vertical:hover {
                background: #9CA3AF;
            }
        """)
        
        # Content widget
        self.content_widget = QWidget()
        self.content_layout = QVBoxLayout(self.content_widget)
        self.content_layout.setContentsMargins(16, 16, 16, 16)
        self.content_layout.setSpacing(12)
        
        self.setup_content()
        
        self.content_area.setWidget(self.content_widget)
        layout.addWidget(self.content_area)
    
    def create_header(self):
        header = QWidget()
        header.setFixedHeight(40)
        header.setStyleSheet("""
            QWidget {
                background-color: #1F2937;
                border-bottom: 1px solid #374151;
            }
        """)
        
        layout = QHBoxLayout(header)
        layout.setContentsMargins(16, 8, 16, 8)
        
        # Icon (if provided)
        if self.icon_name:
            icon = qta.icon(f'fa5s.{self.icon_name}', color='#3B82F6')
            icon_label = QLabel()
            icon_label.setPixmap(icon.pixmap(16, 16))
            layout.addWidget(icon_label)
        
        # Title
        title_label = QLabel(self.title)
        title_label.setStyleSheet("""
            QLabel {
                color: white;
                font-size: 14px;
                font-weight: 600;
            }
        """)
        layout.addWidget(title_label)
        layout.addStretch()
        
        return header
    
    def setup_content(self):
        """Override this method in subclasses to add panel-specific content"""
        placeholder = QLabel("Panel content goes here")
        placeholder.setAlignment(Qt.AlignCenter)
        placeholder.setStyleSheet("color: #6B7280; font-size: 12px;")
        self.content_layout.addWidget(placeholder)
        self.content_layout.addStretch()
    
    def add_section(self, title, widget):
        """Helper method to add a section to the panel"""
        if title:
            section_title = QLabel(title)
            section_title.setStyleSheet("""
                QLabel {
                    color: #D1D5DB;
                    font-size: 12px;
                    font-weight: 600;
                    margin-bottom: 8px;
                }
            """)
            self.content_layout.addWidget(section_title)
        
        self.content_layout.addWidget(widget)
    
    def add_separator(self):
        """Add a separator line"""
        separator = QFrame()
        separator.setFrameShape(QFrame.HLine)
        separator.setStyleSheet("""
            QFrame {
                color: #374151;
                background-color: #374151;
                border: none;
                height: 1px;
            }
        """)
        self.content_layout.addWidget(separator)
```

This implementation provides the complete workspace and panel system foundation. The next sections will cover specific panel implementations and the service coordination layer.
