# PySide6 Integration Blueprint

This document provides specific implementation details for integrating PySide6 UI components with the RF4S core codebase.

## Integration Architecture

### Core Integration Points

1. **Agent Manager Integration** (`rf4s/ai/agent_manager.py`)
   - Signals: `system_status_changed`, `agent_data_updated`, `code_quality_issues_detected`
   - Hook Location: Lines 15-35 (signal definitions)

2. **Main Window Integration** (`rf4s/ui/main_window.py`)
   - Constructor injection: `MainWindow(agent_manager)`
   - Hook Location: Line 10 (`__init__` method)

3. **Widget Framework** (`rf4s/ui/framework/`)
   - Dynamic widget registration and management
   - Hook Location: `widget_manager.py`, `dock_manager.py`

## Implementation Strategy

### 1. Adapter Pattern Implementation

```python
# File: rf4s/ui/adapters/agent_adapter.py
from PySide6.QtCore import QObject, Signal, Slot

class AgentManagerAdapter(QObject):
    status_updated = Signal(dict)
    metrics_changed = Signal(dict)
    
    def __init__(self, agent_manager):
        super().__init__()
        self.agent_manager = agent_manager
        self.setup_connections()
    
    def setup_connections(self):
        self.agent_manager.system_status_changed.connect(self.on_status_changed)
        self.agent_manager.system_metrics_updated.connect(self.on_metrics_updated)
    
    @Slot(str)
    def on_status_changed(self, status):
        self.status_updated.emit({"status": status, "timestamp": "now"})
```

### 2. Panel Integration

```python
# File: rf4s/ui/panels/ai_integration_panel.py
from PySide6.QtWidgets import QWidget, QVBoxLayout, QLabel, QPushButton

class AIIntegrationPanel(QWidget):
    def __init__(self, agent_manager):
        super().__init__()
        self.agent_manager = agent_manager
        self.setup_ui()
        self.setup_connections()
    
    def setup_ui(self):
        layout = QVBoxLayout(self)
        self.status_label = QLabel("Agent Status: Ready")
        self.start_button = QPushButton("Start Agents")
        layout.addWidget(self.status_label)
        layout.addWidget(self.start_button)
    
    def setup_connections(self):
        self.agent_manager.system_status_changed.connect(self.update_status)
        self.start_button.clicked.connect(self.start_agents)
```

### 3. Dynamic Widget Registration

```python
# File: rf4s/ui/framework/widget_registry.py
class WidgetRegistry:
    def __init__(self):
        self.widgets = {}
    
    def register_widget(self, name, widget_class, config=None):
        self.widgets[name] = {
            'class': widget_class,
            'config': config or {},
            'instance': None
        }
    
    def create_widget(self, name, parent=None):
        if name in self.widgets:
            widget_info = self.widgets[name]
            instance = widget_info['class'](parent)
            widget_info['instance'] = instance
            return instance
        return None
```

## Hook Points Reference

| Component | File | Line | Method | Description |
|-----------|------|------|--------|-------------|
| MainWindow | `ui/main_window.py` | 10 | `__init__` | Agent manager injection |
| WidgetManager | `ui/framework/widget_manager.py` | 25 | `register_widget` | Widget registration |
| DockManager | `ui/framework/dock_manager.py` | 30 | `add_dock_widget` | Dock management |
| AgentManager | `ai/agent_manager.py` | 15-35 | Signals | Event notifications |

## Configuration Integration

### UI Configuration Hook

```python
# File: rf4s/ui/framework/ui_config.py
class UIConfigManager:
    def __init__(self, config_path="config/ui_config.json"):
        self.config_path = config_path
        self.config = self.load_config()
    
    def load_config(self):
        # Load UI configuration from file
        pass
    
    def get_panel_config(self, panel_name):
        return self.config.get('panels', {}).get(panel_name, {})
```

## Event System Integration

### Signal/Slot Connections

```python
# File: rf4s/ui/framework/signal_manager.py
class SignalManager:
    def __init__(self):
        self.connections = []
    
    def connect_agent_signals(self, agent_manager, ui_component):
        # Safe signal connections with tracking
        connection = agent_manager.system_status_changed.connect(
            ui_component.update_status
        )
        self.connections.append(connection)
    
    def disconnect_all(self):
        for connection in self.connections:
            connection.disconnect()
```

This blueprint provides the foundation for PySide6 integration without modifying core RF4S functionality.
