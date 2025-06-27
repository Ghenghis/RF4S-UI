
# PySide6 Implementation Guide - RF4S Bot Control

## Prerequisites

### Required Packages
```bash
pip install PySide6
pip install PyQt-Fluent-Widgets
pip install qtawesome  # for additional icons
```

### Project Structure
```
rf4s_bot_control/
├── main.py
├── ui/
│   ├── __init__.py
│   ├── main_window.py
│   ├── components/
│   │   ├── header.py
│   │   ├── icon_bar.py
│   │   ├── workspace.py
│   │   └── panels/
│   └── styles/
│       ├── themes.qss
│       └── components.qss
├── core/
│   ├── __init__.py
│   ├── state_manager.py
│   ├── service_coordinator.py
│   └── event_manager.py
├── services/
│   ├── __init__.py
│   ├── rf4s_service.py
│   └── monitoring_service.py
└── resources/
    ├── icons/
    └── styles/
```

## Core Implementation

### 1. Main Application Setup

```python
# main.py
import sys
from PySide6.QtWidgets import QApplication
from PySide6.QtCore import Qt
from qfluentwidgets import setTheme, Theme
from ui.main_window import MainWindow

class RF4SApplication(QApplication):
    def __init__(self, argv):
        super().__init__(argv)
        self.setApplicationName("RF4S Bot Control")
        self.setApplicationVersion("1.0.0")
        
        # Set fluent theme
        setTheme(Theme.DARK)
        
        # Apply custom styles
        self.setStyleSheet(self.load_stylesheet())
    
    def load_stylesheet(self):
        with open("ui/styles/themes.qss", "r") as f:
            return f.read()

def main():
    app = RF4SApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
```

### 2. Main Window Implementation

```python
# ui/main_window.py
from PySide6.QtWidgets import (QMainWindow, QWidget, QVBoxLayout, 
                               QHBoxLayout, QSplitter)
from PySide6.QtCore import Qt, QTimer
from qfluentwidgets import FluentWindow, NavigationItemPosition
from .components.header import HeaderWidget
from .components.icon_bar import IconBarWidget
from .components.workspace import WorkspaceWidget
from core.state_manager import StateManager

class MainWindow(FluentWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("RF4S Bot Control")
        self.setMinimumSize(1200, 800)
        
        # Initialize state manager
        self.state_manager = StateManager()
        
        # Setup UI
        self.setup_ui()
        self.setup_connections()
        
        # Start services
        self.start_services()
    
    def setup_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # Main layout
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)
        
        # Header
        self.header = HeaderWidget(self.state_manager)
        main_layout.addWidget(self.header)
        
        # Content area with splitter
        splitter = QSplitter(Qt.Horizontal)
        
        # Icon bar (left side)
        self.icon_bar = IconBarWidget(self.state_manager)
        self.icon_bar.setMaximumWidth(80)
        self.icon_bar.setMinimumWidth(60)
        splitter.addWidget(self.icon_bar)
        
        # Workspace (right side)
        self.workspace = WorkspaceWidget(self.state_manager)
        splitter.addWidget(self.workspace)
        
        # Set splitter proportions
        splitter.setSizes([80, 1120])
        splitter.setCollapsible(0, False)
        splitter.setCollapsible(1, False)
        
        main_layout.addWidget(splitter)
    
    def setup_connections(self):
        # Connect icon bar to workspace
        self.icon_bar.panel_toggled.connect(self.workspace.toggle_panel)
        
        # Connect state manager signals
        self.state_manager.connection_changed.connect(self.header.update_connection_status)
        self.state_manager.game_detection_changed.connect(self.header.update_game_status)
    
    def start_services(self):
        # Initialize and start background services
        self.service_timer = QTimer()
        self.service_timer.timeout.connect(self.update_services)
        self.service_timer.start(1000)  # Update every second
    
    def update_services(self):
        # Update service states
        self.state_manager.update_connection_status()
        self.state_manager.update_game_detection()
```

### 3. State Management

```python
# core/state_manager.py
from PySide6.QtCore import QObject, pyqtSignal, QSettings
from typing import Dict, List, Any
from dataclasses import dataclass, asdict

@dataclass
class PanelConfig:
    id: str
    label: str
    icon: str
    visible: bool
    category: str

@dataclass
class RF4SConfig:
    script_enabled: bool = False
    detection_confidence: float = 0.8
    brake_sensitivity: float = 0.75
    session_time: str = "00:00"

class StateManager(QObject):
    # Signals
    connection_changed = pyqtSignal(bool)
    game_detection_changed = pyqtSignal(bool)
    panel_visibility_changed = pyqtSignal(str, bool)
    config_updated = pyqtSignal(dict)
    
    def __init__(self):
        super().__init__()
        self.settings = QSettings("RF4S", "BotControl")
        
        # State variables
        self._connected = False
        self._game_detected = False
        self._config = RF4SConfig()
        
        # Panel definitions
        self._panels = self._initialize_panels()
        
        # Load saved state
        self.load_state()
    
    def _initialize_panels(self) -> List[PanelConfig]:
        return [
            # Main category
            PanelConfig("script-control", "Script Control", "play", True, "main"),
            PanelConfig("game-integration", "Game Integration", "gamepad-2", True, "main"),
            PanelConfig("system-monitor", "System Monitor", "monitor", False, "main"),
            
            # Settings category
            PanelConfig("achievement-tracker", "Achievements", "trophy", False, "settings"),
            PanelConfig("save-load-manager", "Save/Load", "save", False, "settings"),
            PanelConfig("environmental-effects", "Environment", "cloud", False, "settings"),
            
            # Tools category
            PanelConfig("game-state-monitor", "Game State", "activity", False, "tools"),
            PanelConfig("configurator-integration", "Configurator", "settings", False, "tools"),
            PanelConfig("system-status", "System Status", "server", True, "tools"),
            
            # Smart category
            PanelConfig("detection-settings", "Detection", "eye", False, "smart"),
            PanelConfig("fishing-stats", "Statistics", "bar-chart", False, "smart"),
            PanelConfig("fishing-profiles", "Profiles", "user", False, "smart"),
            PanelConfig("friction-brake", "Brake Control", "shield", False, "smart"),
        ]
    
    @property
    def connected(self) -> bool:
        return self._connected
    
    @connected.setter
    def connected(self, value: bool):
        if self._connected != value:
            self._connected = value
            self.connection_changed.emit(value)
    
    @property
    def game_detected(self) -> bool:
        return self._game_detected
    
    @game_detected.setter
    def game_detected(self, value: bool):
        if self._game_detected != value:
            self._game_detected = value
            self.game_detection_changed.emit(value)
    
    def get_visible_panels(self) -> List[PanelConfig]:
        return [panel for panel in self._panels if panel.visible]
    
    def toggle_panel(self, panel_id: str):
        for panel in self._panels:
            if panel.id == panel_id:
                panel.visible = not panel.visible
                self.panel_visibility_changed.emit(panel_id, panel.visible)
                self.save_state()
                break
    
    def update_config(self, key: str, value: Any):
        if hasattr(self._config, key):
            setattr(self._config, key, value)
            self.config_updated.emit(asdict(self._config))
            self.save_state()
    
    def save_state(self):
        # Save panel visibility
        for panel in self._panels:
            self.settings.setValue(f"panel_{panel.id}_visible", panel.visible)
        
        # Save configuration
        config_dict = asdict(self._config)
        for key, value in config_dict.items():
            self.settings.setValue(f"config_{key}", value)
    
    def load_state(self):
        # Load panel visibility
        for panel in self._panels:
            saved_visibility = self.settings.value(f"panel_{panel.id}_visible", panel.visible)
            panel.visible = bool(saved_visibility)
        
        # Load configuration
        for key in asdict(self._config).keys():
            saved_value = self.settings.value(f"config_{key}")
            if saved_value is not None:
                setattr(self._config, key, saved_value)
```

### 4. Header Component

```python
# ui/components/header.py
from PySide6.QtWidgets import (QWidget, QHBoxLayout, QVBoxLayout, 
                               QLabel, QGridLayout)
from PySide6.QtCore import Qt, QTimer
from PySide6.QtGui import QFont, QPalette
from qfluentwidgets import CardWidget, IconWidget, FluentIcon

class HeaderWidget(QWidget):
    def __init__(self, state_manager):
        super().__init__()
        self.state_manager = state_manager
        self.setup_ui()
        self.setup_timer()
    
    def setup_ui(self):
        self.setFixedHeight(80)
        self.setStyleSheet("""
            HeaderWidget {
                background-color: #1F2937;
                border-bottom: 1px solid #374151;
            }
        """)
        
        layout = QHBoxLayout(self)
        layout.setContentsMargins(12, 8, 12, 8)
        
        # Left side - Brand
        brand_layout = QVBoxLayout()
        
        # Brand section
        brand_widget = QWidget()
        brand_widget.setFixedSize(32, 32)
        brand_widget.setStyleSheet("""
            QWidget {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 #F97316, stop:1 #DC2626);
                border-radius: 6px;
            }
        """)
        
        brand_label = QLabel("RF4S")
        brand_label.setAlignment(Qt.AlignCenter)
        brand_label.setStyleSheet("color: white; font-weight: bold; font-size: 10px;")
        
        title_label = QLabel("RF4S Automation")
        title_label.setStyleSheet("color: white; font-weight: bold; font-size: 14px;")
        
        brand_layout.addWidget(brand_widget)
        brand_layout.addWidget(title_label)
        
        layout.addLayout(brand_layout)
        layout.addStretch()
        
        # Right side - Status grid
        self.setup_status_grid(layout)
    
    def setup_status_grid(self, parent_layout):
        status_widget = QWidget()
        status_widget.setFixedSize(200, 60)
        
        grid_layout = QGridLayout(status_widget)
        grid_layout.setSpacing(4)
        
        # Status indicators
        self.rf4s_status = self.create_status_indicator("RF4S", False)
        self.game_status = self.create_status_indicator("Game", False)
        self.script_status = self.create_status_indicator("Script", False)
        self.time_status = self.create_status_indicator("Time", True, "00:00")
        
        grid_layout.addWidget(self.rf4s_status, 0, 0)
        grid_layout.addWidget(self.game_status, 0, 1)
        grid_layout.addWidget(self.script_status, 1, 0)
        grid_layout.addWidget(self.time_status, 1, 1)
        
        parent_layout.addWidget(status_widget)
    
    def create_status_indicator(self, label, is_text=False, text_value=""):
        widget = QWidget()
        widget.setFixedSize(95, 28)
        widget.setStyleSheet("""
            QWidget {
                background-color: rgba(55, 65, 81, 0.3);
                border-radius: 4px;
            }
        """)
        
        layout = QHBoxLayout(widget)
        layout.setContentsMargins(8, 4, 8, 4)
        
        label_widget = QLabel(label)
        label_widget.setStyleSheet("color: #D1D5DB; font-size: 10px;")
        layout.addWidget(label_widget)
        
        if is_text:
            value_widget = QLabel(text_value)
            value_widget.setStyleSheet("color: white; font-family: monospace; font-size: 10px;")
            layout.addWidget(value_widget)
            widget.value_widget = value_widget
        else:
            status_dot = QLabel()
            status_dot.setFixedSize(8, 8)
            status_dot.setStyleSheet("""
                QLabel {
                    background-color: #6B7280;
                    border-radius: 4px;
                }
            """)
            layout.addWidget(status_dot)
            widget.status_dot = status_dot
        
        return widget
    
    def setup_timer(self):
        self.timer = QTimer()
        self.timer.timeout.connect(self.update_time)
        self.timer.start(1000)
    
    def update_connection_status(self, connected):
        color = "#10B981" if connected else "#EF4444"
        self.rf4s_status.status_dot.setStyleSheet(f"""
            QLabel {{
                background-color: {color};
                border-radius: 4px;
            }}
        """)
    
    def update_game_status(self, detected):
        color = "#10B981" if detected else "#F59E0B"
        self.game_status.status_dot.setStyleSheet(f"""
            QLabel {{
                background-color: {color};
                border-radius: 4px;
            }}
        """)
    
    def update_time(self):
        from datetime import datetime
        current_time = datetime.now().strftime("%H:%M")
        self.time_status.value_widget.setText(current_time)
```

### 5. Icon Bar Component

```python
# ui/components/icon_bar.py
from PySide6.QtWidgets import (QWidget, QVBoxLayout, QScrollArea, 
                               QPushButton, QLabel, QToolTip)
from PySide6.QtCore import Qt, pyqtSignal, QPropertyAnimation, QEasingCurve
from PySide6.QtGui import QIcon, QPainter, QColor, QFont
from qfluentwidgets import FluentIcon, ToolTipFilter, setFont
import qtawesome as qta

class IconButton(QPushButton):
    def __init__(self, panel_config, state_manager):
        super().__init__()
        self.panel_config = panel_config
        self.state_manager = state_manager
        self.is_panel_visible = panel_config.visible
        
        self.setup_ui()
        self.setup_animations()
    
    def setup_ui(self):
        self.setFixedSize(60, 70)
        self.setCheckable(True)
        self.setChecked(self.is_panel_visible)
        
        # Set icon
        icon_name = self.get_icon_name()
        icon = qta.icon(f'fa5s.{icon_name}', color='#9CA3AF')
        self.setIcon(icon)
        self.setIconSize(QSize(20, 20))
        
        # Style
        category_colors = {
            'main': '#10B981',
            'settings': '#F59E0B', 
            'tools': '#3B82F6',
            'smart': '#8B5CF6',
            'ai': '#EC4899'
        }
        
        category_color = category_colors.get(self.panel_config.category, '#6B7280')
        
        self.setStyleSheet(f"""
            IconButton {{
                border: none;
                border-radius: 8px;
                background-color: transparent;
                color: #9CA3AF;
                font-size: 9px;
                font-weight: 500;
                text-align: center;
                padding: 8px 4px;
            }}
            IconButton:hover {{
                background-color: rgba({self.hex_to_rgb(category_color)}, 0.2);
                color: white;
                transform: scale(1.05);
            }}
            IconButton:checked {{
                background-color: rgba(55, 65, 81, 0.7);
                color: white;
            }}
            IconButton::after {{
                content: "";
                position: absolute;
                top: 4px;
                right: 4px;
                width: 6px;
                height: 6px;
                border-radius: 3px;
                background-color: {category_color};
            }}
        """)
        
        # Set text
        self.setText(self.panel_config.label)
        
        # Tooltip
        self.setToolTip(f"{self.panel_config.label}\nCategory: {self.panel_config.category.title()}")
    
    def get_icon_name(self):
        icon_mapping = {
            'play': 'play',
            'gamepad-2': 'gamepad',
            'monitor': 'desktop',
            'trophy': 'trophy',
            'save': 'save',
            'cloud': 'cloud',
            'activity': 'chart-line',
            'settings': 'cog',
            'server': 'server',
            'eye': 'eye',
            'bar-chart': 'chart-bar',
            'user': 'user',
            'shield': 'shield-alt'
        }
        return icon_mapping.get(self.panel_config.icon, 'square')
    
    def hex_to_rgb(self, hex_color):
        hex_color = hex_color.lstrip('#')
        return ', '.join(str(int(hex_color[i:i+2], 16)) for i in (0, 2, 4))
    
    def setup_animations(self):
        self.scale_animation = QPropertyAnimation(self, b"geometry")
        self.scale_animation.setDuration(200)
        self.scale_animation.setEasingCurve(QEasingCurve.OutCubic)
    
    def enterEvent(self, event):
        super().enterEvent(event)
        self.animate_scale(1.05)
    
    def leaveEvent(self, event):
        super().leaveEvent(event)
        self.animate_scale(1.0)
    
    def animate_scale(self, scale_factor):
        current_rect = self.geometry()
        center = current_rect.center()
        
        new_size = QSize(int(60 * scale_factor), int(70 * scale_factor))
        new_rect = QRect(0, 0, new_size.width(), new_size.height())
        new_rect.moveCenter(center)
        
        self.scale_animation.setStartValue(current_rect)
        self.scale_animation.setEndValue(new_rect)
        self.scale_animation.start()

class IconBarWidget(QWidget):
    panel_toggled = pyqtSignal(str)
    
    def __init__(self, state_manager):
        super().__init__()
        self.state_manager = state_manager
        self.setup_ui()
        self.setup_connections()
    
    def setup_ui(self):
        self.setFixedWidth(80)
        self.setStyleSheet("""
            IconBarWidget {
                background-color: #111827;
                border-right: 1px solid #374151;
            }
        """)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(10, 10, 10, 10)
        layout.setSpacing(5)
        
        # Scroll area for buttons
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        scroll_area.setVerticalScrollBarPolicy(Qt.ScrollBarAsNeeded)
        scroll_area.setStyleSheet("""
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
            }
        """)
        
        # Container for buttons
        button_container = QWidget()
        button_layout = QVBoxLayout(button_container)
        button_layout.setSpacing(2)
        
        # Create buttons for each panel
        self.icon_buttons = {}
        for panel in self.state_manager._panels:
            button = IconButton(panel, self.state_manager)
            button.clicked.connect(lambda checked, p=panel.id: self.on_button_clicked(p))
            self.icon_buttons[panel.id] = button
            button_layout.addWidget(button)
        
        button_layout.addStretch()
        scroll_area.setWidget(button_container)
        layout.addWidget(scroll_area)
    
    def setup_connections(self):
        self.state_manager.panel_visibility_changed.connect(self.update_button_state)
    
    def on_button_clicked(self, panel_id):
        self.panel_toggled.emit(panel_id)
    
    def update_button_state(self, panel_id, visible):
        if panel_id in self.icon_buttons:
            self.icon_buttons[panel_id].setChecked(visible)
            self.icon_buttons[panel_id].is_panel_visible = visible
```

This implementation guide provides the foundation for creating a PySide6 version of the RF4S Bot Control interface. The next files will cover the workspace, panel implementations, and service layer.
