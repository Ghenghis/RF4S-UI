"""
PySide6 Widget Template for RF4S Integration

This template provides a standardized approach for creating PySide6 widgets
that integrate with RF4S core components without modifying the core codebase.
"""

from PySide6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QTextEdit, QProgressBar
from PySide6.QtCore import Signal, Slot, QTimer, QObject
from typing import Any, Dict, Optional, Callable
import logging

logger = logging.getLogger(__name__)


class RF4SWidgetTemplate(QWidget):
    """
    Template for creating RF4S-integrated widgets.
    
    This template provides:
    - Standard signal/slot connections to core components
    - Error handling and logging
    - Status display and progress tracking
    - Action buttons and data display
    """
    
    # Standard signals for RF4S integration
    data_requested = Signal()
    action_triggered = Signal(str, dict)
    status_changed = Signal(str)
    error_occurred = Signal(str)
    
    def __init__(self, core_component: Any, config: Optional[Dict] = None, parent=None):
        """
        Initialize the widget with core component integration.
        
        Args:
            core_component: The RF4S core component to integrate with
            config: Optional configuration dictionary
            parent: Parent widget
        """
        super().__init__(parent)
        self.core_component = core_component
        self.config = config or {}
        self.is_connected = False
        
        # Initialize UI and connections
        self.setup_ui()
        self.setup_connections()
        self.setup_timer()
        
        logger.info(f"RF4S Widget initialized: {self.__class__.__name__}")
    
    def setup_ui(self):
        """Set up the widget UI components."""
        # Main layout
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(10, 10, 10, 10)
        main_layout.setSpacing(10)
        
        # Header section
        header_layout = QHBoxLayout()
        
        self.title_label = QLabel("RF4S Component")
        self.title_label.setStyleSheet("font-weight: bold; font-size: 14px;")
        header_layout.addWidget(self.title_label)
        
        self.status_label = QLabel("Status: Ready")
        self.status_label.setStyleSheet("color: green;")
        header_layout.addStretch()
        header_layout.addWidget(self.status_label)
        
        main_layout.addLayout(header_layout)
        
        # Progress bar
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        main_layout.addWidget(self.progress_bar)
        
        # Data display area
        self.data_display = QTextEdit()
        self.data_display.setMaximumHeight(200)
        self.data_display.setReadOnly(True)
        main_layout.addWidget(self.data_display)
        
        # Action buttons
        button_layout = QHBoxLayout()
        
        self.refresh_button = QPushButton("Refresh Data")
        self.refresh_button.clicked.connect(self.on_refresh_clicked)
        button_layout.addWidget(self.refresh_button)
        
        self.action_button = QPushButton("Execute Action")
        self.action_button.clicked.connect(self.on_action_clicked)
        button_layout.addWidget(self.action_button)
        
        button_layout.addStretch()
        main_layout.addLayout(button_layout)
        
        # Apply custom styling if configured
        if 'style' in self.config:
            self.setStyleSheet(self.config['style'])
    
    def setup_connections(self):
        """Set up signal/slot connections with the core component."""
        try:
            # Connect to core component signals if they exist
            if hasattr(self.core_component, 'status_changed'):
                self.core_component.status_changed.connect(self.update_status)
            
            if hasattr(self.core_component, 'data_updated'):
                self.core_component.data_updated.connect(self.update_data)
            
            if hasattr(self.core_component, 'error_occurred'):
                self.core_component.error_occurred.connect(self.handle_error)
            
            if hasattr(self.core_component, 'progress_updated'):
                self.core_component.progress_updated.connect(self.update_progress)
            
            # Connect internal signals
            self.status_changed.connect(self.on_internal_status_changed)
            self.error_occurred.connect(self.on_internal_error)
            
            self.is_connected = True
            logger.info("Core component connections established")
            
        except Exception as e:
            logger.error(f"Failed to setup connections: {e}")
            self.handle_error(f"Connection setup failed: {e}")
    
    def setup_timer(self):
        """Set up periodic updates if configured."""
        if self.config.get('auto_refresh', False):
            self.refresh_timer = QTimer(self)
            self.refresh_timer.timeout.connect(self.auto_refresh)
            interval = self.config.get('refresh_interval', 5000)  # Default 5 seconds
            self.refresh_timer.start(interval)
    
    @Slot(str)
    def update_status(self, status: str):
        """Update the status display."""
        self.status_label.setText(f"Status: {status}")
        
        # Update status color based on content
        if "error" in status.lower():
            self.status_label.setStyleSheet("color: red;")
        elif "running" in status.lower() or "active" in status.lower():
            self.status_label.setStyleSheet("color: blue;")
        else:
            self.status_label.setStyleSheet("color: green;")
        
        self.status_changed.emit(status)
    
    @Slot(dict)
    def update_data(self, data: Dict[str, Any]):
        """Update the data display."""
        try:
            # Format data for display
            formatted_data = self.format_data_for_display(data)
            self.data_display.setPlainText(formatted_data)
            
            # Update title if data contains a name
            if 'name' in data:
                self.title_label.setText(f"RF4S {data['name']}")
                
        except Exception as e:
            logger.error(f"Failed to update data display: {e}")
            self.handle_error(f"Data update failed: {e}")
    
    @Slot(str)
    def handle_error(self, error_message: str):
        """Handle error messages."""
        logger.error(f"Widget error: {error_message}")
        self.update_status(f"Error: {error_message}")
        self.data_display.setPlainText(f"Error: {error_message}")
        self.error_occurred.emit(error_message)
    
    @Slot(int)
    def update_progress(self, progress: int):
        """Update the progress bar."""
        if 0 <= progress <= 100:
            self.progress_bar.setVisible(True)
            self.progress_bar.setValue(progress)
            
            if progress >= 100:
                QTimer.singleShot(2000, lambda: self.progress_bar.setVisible(False))
        else:
            self.progress_bar.setVisible(False)
    
    @Slot()
    def on_refresh_clicked(self):
        """Handle refresh button click."""
        try:
            self.update_status("Refreshing...")
            self.data_requested.emit()
            
            # If core component has a refresh method, call it
            if hasattr(self.core_component, 'refresh_data'):
                self.core_component.refresh_data()
            elif hasattr(self.core_component, 'get_data'):
                data = self.core_component.get_data()
                if data:
                    self.update_data(data)
            
            self.action_triggered.emit("refresh", {"timestamp": "now"})
            
        except Exception as e:
            self.handle_error(f"Refresh failed: {e}")
    
    @Slot()
    def on_action_clicked(self):
        """Handle action button click."""
        try:
            action_name = self.config.get('action_name', 'execute')
            action_params = self.config.get('action_params', {})
            
            self.update_status(f"Executing {action_name}...")
            
            # Execute action on core component if method exists
            if hasattr(self.core_component, action_name):
                method = getattr(self.core_component, action_name)
                if callable(method):
                    result = method(**action_params)
                    if result:
                        self.update_data({"result": result})
            
            self.action_triggered.emit(action_name, action_params)
            
        except Exception as e:
            self.handle_error(f"Action execution failed: {e}")
    
    @Slot()
    def auto_refresh(self):
        """Perform automatic refresh."""
        if self.is_connected and self.config.get('auto_refresh', False):
            self.on_refresh_clicked()
    
    @Slot(str)
    def on_internal_status_changed(self, status: str):
        """Handle internal status changes."""
        # Override in subclasses for custom status handling
        pass
    
    @Slot(str)
    def on_internal_error(self, error: str):
        """Handle internal errors."""
        # Override in subclasses for custom error handling
        pass
    
    def format_data_for_display(self, data: Dict[str, Any]) -> str:
        """
        Format data dictionary for display in the text area.
        Override in subclasses for custom formatting.
        """
        if not data:
            return "No data available"
        
        formatted_lines = []
        for key, value in data.items():
            if isinstance(value, dict):
                formatted_lines.append(f"{key}:")
                for sub_key, sub_value in value.items():
                    formatted_lines.append(f"  {sub_key}: {sub_value}")
            elif isinstance(value, list):
                formatted_lines.append(f"{key}: [{len(value)} items]")
                for i, item in enumerate(value[:5]):  # Show first 5 items
                    formatted_lines.append(f"  [{i}]: {item}")
                if len(value) > 5:
                    formatted_lines.append(f"  ... and {len(value) - 5} more")
            else:
                formatted_lines.append(f"{key}: {value}")
        
        return "\n".join(formatted_lines)
    
    def get_core_component(self):
        """Get the associated core component."""
        return self.core_component
    
    def get_config(self):
        """Get the widget configuration."""
        return self.config
    
    def update_config(self, new_config: Dict[str, Any]):
        """Update the widget configuration."""
        self.config.update(new_config)
        
        # Apply any UI changes based on new config
        if 'style' in new_config:
            self.setStyleSheet(new_config['style'])
        
        if 'auto_refresh' in new_config:
            if hasattr(self, 'refresh_timer'):
                if new_config['auto_refresh']:
                    interval = new_config.get('refresh_interval', 5000)
                    self.refresh_timer.start(interval)
                else:
                    self.refresh_timer.stop()
    
    def disconnect_from_core(self):
        """Disconnect from the core component."""
        if self.is_connected:
            try:
                # Disconnect signals
                if hasattr(self.core_component, 'status_changed'):
                    self.core_component.status_changed.disconnect(self.update_status)
                
                if hasattr(self.core_component, 'data_updated'):
                    self.core_component.data_updated.disconnect(self.update_data)
                
                if hasattr(self.core_component, 'error_occurred'):
                    self.core_component.error_occurred.disconnect(self.handle_error)
                
                self.is_connected = False
                logger.info("Disconnected from core component")
                
            except Exception as e:
                logger.error(f"Failed to disconnect from core component: {e}")
    
    def closeEvent(self, event):
        """Handle widget close event."""
        self.disconnect_from_core()
        
        if hasattr(self, 'refresh_timer'):
            self.refresh_timer.stop()
        
        super().closeEvent(event)


# Example usage and specialization
class AIAgentWidget(RF4SWidgetTemplate):
    """Specialized widget for AI Agent integration."""
    
    def __init__(self, agent_manager, agent_id: str, parent=None):
        self.agent_id = agent_id
        config = {
            'action_name': 'start_agent',
            'action_params': {'agent_id': agent_id},
            'auto_refresh': True,
            'refresh_interval': 3000
        }
        super().__init__(agent_manager, config, parent)
        self.title_label.setText(f"AI Agent: {agent_id}")
    
    def format_data_for_display(self, data: Dict[str, Any]) -> str:
        """Custom formatting for agent data."""
        if 'agents' in data and self.agent_id in data['agents']:
            agent_data = data['agents'][self.agent_id]
            lines = [
                f"Agent ID: {self.agent_id}",
                f"Status: {agent_data.get('status', 'Unknown')}",
                f"Last Update: {agent_data.get('last_update', 'Never')}",
                f"Error Count: {agent_data.get('error_count', 0)}"
            ]
            return "\n".join(lines)
        return super().format_data_for_display(data)


class CodeQualityWidget(RF4SWidgetTemplate):
    """Specialized widget for Code Quality integration."""
    
    def __init__(self, agent_manager, parent=None):
        config = {
            'action_name': 'run_quality_scan',
            'auto_refresh': False
        }
        super().__init__(agent_manager, config, parent)
        self.title_label.setText("Code Quality Monitor")
    
    def format_data_for_display(self, data: Dict[str, Any]) -> str:
        """Custom formatting for code quality data."""
        if 'quality_metrics' in data:
            metrics = data['quality_metrics']
            lines = [
                f"Total Issues: {metrics.get('total_issues', 0)}",
                f"Critical Issues: {metrics.get('critical_issues', 0)}",
                f"Code Coverage: {metrics.get('coverage', 0)}%",
                f"Last Scan: {metrics.get('last_scan', 'Never')}"
            ]
            return "\n".join(lines)
        return super().format_data_for_display(data)
