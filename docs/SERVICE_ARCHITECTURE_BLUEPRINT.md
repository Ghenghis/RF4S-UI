
# Service Architecture Blueprint - RF4S Bot Control

## Overview
This document provides a complete blueprint for the service architecture, background processing, and integration layer for the RF4S Bot Control application using PySide6.

## Service Layer Architecture

### Core Service Framework

```python
# core/service_framework.py
from PySide6.QtCore import QObject, QThread, pyqtSignal, QTimer, QMutex
from abc import ABC, abstractmethod
from enum import Enum
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime

class ServiceStatus(Enum):
    STOPPED = "stopped"
    STARTING = "starting"
    RUNNING = "running"
    STOPPING = "stopping"
    ERROR = "error"
    PAUSED = "paused"

@dataclass
class ServiceInfo:
    name: str
    status: ServiceStatus
    start_time: Optional[datetime]
    error_message: Optional[str]
    dependency_count: int
    health_score: float

class BaseService(QObject, ABC):
    # Signals
    status_changed = pyqtSignal(str, ServiceStatus)
    error_occurred = pyqtSignal(str, str)
    data_updated = pyqtSignal(str, dict)
    health_changed = pyqtSignal(str, float)
    
    def __init__(self, service_name: str):
        super().__init__()
        self.service_name = service_name
        self.status = ServiceStatus.STOPPED
        self.start_time = None
        self.error_message = None
        self.health_score = 1.0
        self.mutex = QMutex()
        
        # Health monitoring
        self.health_timer = QTimer()
        self.health_timer.timeout.connect(self.check_health)
        
    @abstractmethod
    def initialize(self) -> bool:
        """Initialize the service"""
        pass
        
    @abstractmethod
    def start_service(self) -> bool:
        """Start the service"""
        pass
        
    @abstractmethod
    def stop_service(self) -> bool:
        """Stop the service"""
        pass
        
    @abstractmethod
    def check_health(self) -> float:
        """Check service health (0.0 to 1.0)"""
        pass
        
    def get_info(self) -> ServiceInfo:
        """Get service information"""
        return ServiceInfo(
            name=self.service_name,
            status=self.status,
            start_time=self.start_time,
            error_message=self.error_message,
            dependency_count=len(self.get_dependencies()),
            health_score=self.health_score
        )
        
    def get_dependencies(self) -> List[str]:
        """Get service dependencies"""
        return []
```

### 1. RF4S Integration Service

```python
# services/rf4s_integration_service.py
import subprocess
import json
import socket
from PySide6.QtCore import QTimer, QProcess
from PySide6.QtNetwork import QNetworkAccessManager, QNetworkRequest, QNetworkReply

class RF4SIntegrationService(BaseService):
    # RF4S specific signals
    rf4s_connected = pyqtSignal(dict)
    rf4s_disconnected = pyqtSignal(str)
    fishing_data_received = pyqtSignal(dict)
    script_status_changed = pyqtSignal(bool)
    session_updated = pyqtSignal(dict)
    
    def __init__(self):
        super().__init__("RF4S Integration")
        self.rf4s_process = None
        self.network_manager = QNetworkAccessManager()
        self.connection_timer = QTimer()
        self.data_request_timer = QTimer()
        self.rf4s_port = 8080
        self.rf4s_host = "localhost"
        self.session_data = {}
        
        self.setup_timers()
        self.setup_network_handlers()
        
    def setup_timers(self):
        """Setup periodic timers"""
        # Connection check every 5 seconds
        self.connection_timer.timeout.connect(self.check_rf4s_connection)
        self.connection_timer.start(5000)
        
        # Data request every 2 seconds when connected
        self.data_request_timer.timeout.connect(self.request_rf4s_data)
        
    def setup_network_handlers(self):
        """Setup network request handlers"""
        self.network_manager.finished.connect(self.handle_network_response)
        
    def initialize(self) -> bool:
        """Initialize RF4S integration"""
        try:
            self.status = ServiceStatus.STARTING
            self.status_changed.emit(self.service_name, self.status)
            
            # Check if RF4S is already running
            if self.is_rf4s_running():
                self.connect_to_existing_rf4s()
            else:
                self.start_rf4s_process()
                
            self.status = ServiceStatus.RUNNING
            self.start_time = datetime.now()
            self.status_changed.emit(self.service_name, self.status)
            return True
            
        except Exception as e:
            self.handle_error(f"Failed to initialize RF4S: {str(e)}")
            return False
            
    def start_service(self) -> bool:
        """Start the RF4S integration service"""
        if self.status == ServiceStatus.RUNNING:
            return True
            
        return self.initialize()
        
    def stop_service(self) -> bool:
        """Stop the RF4S integration service"""
        try:
            self.status = ServiceStatus.STOPPING
            self.status_changed.emit(self.service_name, self.status)
            
            self.data_request_timer.stop()
            
            if self.rf4s_process and self.rf4s_process.state() == QProcess.Running:
                self.rf4s_process.terminate()
                self.rf4s_process.waitForFinished(5000)
                
            self.status = ServiceStatus.STOPPED
            self.status_changed.emit(self.service_name, self.status)
            return True
            
        except Exception as e:
            self.handle_error(f"Failed to stop RF4S: {str(e)}")
            return False
            
    def check_health(self) -> float:
        """Check RF4S service health"""
        health_factors = []
        
        # Check process health
        if self.rf4s_process and self.rf4s_process.state() == QProcess.Running:
            health_factors.append(1.0)
        else:
            health_factors.append(0.0)
            
        # Check network connectivity
        if self.is_rf4s_reachable():
            health_factors.append(1.0)
        else:
            health_factors.append(0.0)
            
        # Check data freshness
        if self.is_data_fresh():
            health_factors.append(1.0)
        else:
            health_factors.append(0.5)
            
        self.health_score = sum(health_factors) / len(health_factors)
        self.health_changed.emit(self.service_name, self.health_score)
        return self.health_score
        
    def start_rf4s_process(self):
        """Start RF4S as external process"""
        self.rf4s_process = QProcess()
        self.rf4s_process.started.connect(self.on_rf4s_started)
        self.rf4s_process.finished.connect(self.on_rf4s_finished)
        self.rf4s_process.errorOccurred.connect(self.on_rf4s_error)
        
        # Start RF4S with appropriate parameters
        rf4s_executable = self.get_rf4s_executable_path()
        self.rf4s_process.start(rf4s_executable, ["--api-port", str(self.rf4s_port)])
        
    def check_rf4s_connection(self):
        """Check RF4S connection status"""
        if self.is_rf4s_reachable():
            if not self.data_request_timer.isActive():
                self.data_request_timer.start(2000)
                self.rf4s_connected.emit({"status": "connected", "timestamp": datetime.now()})
        else:
            if self.data_request_timer.isActive():
                self.data_request_timer.stop()
                self.rf4s_disconnected.emit("Connection lost")
                
    def request_rf4s_data(self):
        """Request data from RF4S"""
        endpoints = [
            f"http://{self.rf4s_host}:{self.rf4s_port}/api/status",
            f"http://{self.rf4s_host}:{self.rf4s_port}/api/session",
            f"http://{self.rf4s_host}:{self.rf4s_port}/api/stats"
        ]
        
        for endpoint in endpoints:
            request = QNetworkRequest(endpoint)
            self.network_manager.get(request)
            
    def handle_network_response(self, reply: QNetworkReply):
        """Handle network responses from RF4S"""
        if reply.error() == QNetworkReply.NoError:
            try:
                data = json.loads(reply.readAll().data().decode())
                endpoint = reply.url().path()
                
                if endpoint == "/api/status":
                    self.handle_status_response(data)
                elif endpoint == "/api/session":
                    self.handle_session_response(data)
                elif endpoint == "/api/stats":
                    self.handle_stats_response(data)
                    
            except json.JSONDecodeError as e:
                self.handle_error(f"Invalid JSON response: {str(e)}")
        else:
            self.handle_error(f"Network error: {reply.errorString()}")
            
        reply.deleteLater()
        
    def handle_status_response(self, data: dict):
        """Handle RF4S status response"""
        self.script_status_changed.emit(data.get('script_running', False))
        self.data_updated.emit('status', data)
        
    def handle_session_response(self, data: dict):
        """Handle RF4S session response"""
        self.session_data = data
        self.session_updated.emit(data)
        self.fishing_data_received.emit(data)
        
    def handle_stats_response(self, data: dict):
        """Handle RF4S statistics response"""
        self.data_updated.emit('stats', data)
        
    # RF4S Control Methods
    def start_script(self) -> bool:
        """Start RF4S fishing script"""
        return self.send_rf4s_command("start")
        
    def stop_script(self) -> bool:
        """Stop RF4S fishing script"""
        return self.send_rf4s_command("stop")
        
    def pause_script(self) -> bool:
        """Pause RF4S fishing script"""
        return self.send_rf4s_command("pause")
        
    def send_rf4s_command(self, command: str) -> bool:
        """Send command to RF4S"""
        try:
            url = f"http://{self.rf4s_host}:{self.rf4s_port}/api/control"
            request = QNetworkRequest(url)
            request.setHeader(QNetworkRequest.ContentTypeHeader, "application/json")
            
            data = json.dumps({"command": command}).encode()
            self.network_manager.post(request, data)
            return True
            
        except Exception as e:
            self.handle_error(f"Failed to send command: {str(e)}")
            return False
            
    # Utility Methods
    def is_rf4s_running(self) -> bool:
        """Check if RF4S process is running"""
        try:
            # Check for RF4S process
            result = subprocess.run(['tasklist'], capture_output=True, text=True)
            return 'rf4s' in result.stdout.lower()
        except:
            return False
            
    def is_rf4s_reachable(self) -> bool:
        """Check if RF4S API is reachable"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex((self.rf4s_host, self.rf4s_port))
            sock.close()
            return result == 0
        except:
            return False
            
    def is_data_fresh(self) -> bool:
        """Check if received data is fresh"""
        if not self.session_data:
            return False
            
        last_update = self.session_data.get('timestamp')
        if not last_update:
            return False
            
        # Data is fresh if updated within last 10 seconds
        time_diff = datetime.now() - datetime.fromisoformat(last_update)
        return time_diff.total_seconds() < 10
        
    def get_rf4s_executable_path(self) -> str:
        """Get RF4S executable path"""
        # This would be configurable or auto-detected
        return "rf4s.exe"
        
    def handle_error(self, error_message: str):
        """Handle service errors"""
        self.error_message = error_message
        self.status = ServiceStatus.ERROR
        self.error_occurred.emit(self.service_name, error_message)
        self.status_changed.emit(self.service_name, self.status)
        
    # Event Handlers
    def on_rf4s_started(self):
        """Handle RF4S process started"""
        print(f"RF4S process started successfully")
        
    def on_rf4s_finished(self, exit_code: int):
        """Handle RF4S process finished"""
        print(f"RF4S process finished with exit code: {exit_code}")
        self.rf4s_disconnected.emit(f"Process exited with code {exit_code}")
        
    def on_rf4s_error(self, error):
        """Handle RF4S process error"""
        self.handle_error(f"RF4S process error: {error}")
        
    def get_dependencies(self) -> List[str]:
        """Get service dependencies"""
        return ["SystemMonitorService"]
```

### 2. System Monitor Service

```python
# services/system_monitor_service.py
import psutil
import GPUtil
from PySide6.QtCore import QTimer

class SystemMonitorService(BaseService):
    # System monitoring signals
    system_stats_updated = pyqtSignal(dict)
    performance_alert = pyqtSignal(str, dict)
    resource_threshold_exceeded = pyqtSignal(str, float, float)
    
    def __init__(self):
        super().__init__("System Monitor")
        self.monitoring_timer = QTimer()
        self.monitoring_interval = 2000  # 2 seconds
        self.performance_thresholds = {
            'cpu_usage': 90.0,
            'memory_usage': 85.0,
            'disk_usage': 90.0,
            'temperature': 80.0
        }
        self.system_stats = {}
        
    def initialize(self) -> bool:
        """Initialize system monitoring"""
        try:
            self.status = ServiceStatus.STARTING
            self.status_changed.emit(self.service_name, self.status)
            
            # Test system access
            psutil.cpu_percent()
            psutil.virtual_memory()
            
            self.setup_monitoring_timer()
            
            self.status = ServiceStatus.RUNNING
            self.start_time = datetime.now()
            self.status_changed.emit(self.service_name, self.status)
            return True
            
        except Exception as e:
            self.handle_error(f"Failed to initialize system monitoring: {str(e)}")
            return False
            
    def start_service(self) -> bool:
        """Start system monitoring"""
        if self.status == ServiceStatus.RUNNING:
            return True
            
        if self.initialize():
            self.monitoring_timer.start(self.monitoring_interval)
            return True
        return False
        
    def stop_service(self) -> bool:
        """Stop system monitoring"""
        try:
            self.status = ServiceStatus.STOPPING
            self.status_changed.emit(self.service_name, self.status)
            
            self.monitoring_timer.stop()
            
            self.status = ServiceStatus.STOPPED
            self.status_changed.emit(self.service_name, self.status)
            return True
            
        except Exception as e:
            self.handle_error(f"Failed to stop system monitoring: {str(e)}")
            return False
            
    def setup_monitoring_timer(self):
        """Setup monitoring timer"""
        self.monitoring_timer.timeout.connect(self.collect_system_stats)
        
    def collect_system_stats(self):
        """Collect system statistics"""
        try:
            stats = {
                'timestamp': datetime.now().isoformat(),
                'cpu_usage': psutil.cpu_percent(interval=None),
                'memory_usage': psutil.virtual_memory().percent,
                'disk_usage': psutil.disk_usage('/').percent,
                'network_io': self.get_network_io(),
                'process_count': len(psutil.pids()),
                'boot_time': psutil.boot_time(),
            }
            
            # Add GPU stats if available
            try:
                gpus = GPUtil.getGPUs()
                if gpus:
                    gpu = gpus[0]
                    stats.update({
                        'gpu_usage': gpu.load * 100,
                        'gpu_memory_usage': gpu.memoryUtil * 100,
                        'gpu_temperature': gpu.temperature
                    })
            except:
                pass
                
            # Add system temperature if available
            try:
                temps = psutil.sensors_temperatures()
                if temps:
                    avg_temp = sum(temp.current for sensor in temps.values() 
                                 for temp in sensor) / sum(len(sensor) for sensor in temps.values())
                    stats['system_temperature'] = avg_temp
            except:
                pass
                
            self.system_stats = stats
            self.check_performance_thresholds(stats)
            self.system_stats_updated.emit(stats)
            self.data_updated.emit('system_stats', stats)
            
        except Exception as e:
            self.handle_error(f"Failed to collect system stats: {str(e)}")
            
    def get_network_io(self) -> dict:
        """Get network I/O statistics"""
        try:
            net_io = psutil.net_io_counters()
            return {
                'bytes_sent': net_io.bytes_sent,
                'bytes_recv': net_io.bytes_recv,
                'packets_sent': net_io.packets_sent,
                'packets_recv': net_io.packets_recv
            }
        except:
            return {}
            
    def check_performance_thresholds(self, stats: dict):
        """Check performance thresholds and emit alerts"""
        for metric, threshold in self.performance_thresholds.items():
            if metric in stats and stats[metric] > threshold:
                self.performance_alert.emit(metric, stats)
                self.resource_threshold_exceeded.emit(metric, stats[metric], threshold)
                
    def check_health(self) -> float:
        """Check system monitoring service health"""
        health_factors = []
        
        # Check if monitoring is active
        if self.monitoring_timer.isActive():
            health_factors.append(1.0)
        else:
            health_factors.append(0.0)
            
        # Check data freshness
        if self.system_stats and 'timestamp' in self.system_stats:
            last_update = datetime.fromisoformat(self.system_stats['timestamp'])
            time_diff = datetime.now() - last_update
            if time_diff.total_seconds() < 10:
                health_factors.append(1.0)
            else:
                health_factors.append(0.5)
        else:
            health_factors.append(0.0)
            
        # Check system responsiveness
        try:
            psutil.cpu_percent(interval=None)
            health_factors.append(1.0)
        except:
            health_factors.append(0.0)
            
        self.health_score = sum(health_factors) / len(health_factors)
        self.health_changed.emit(self.service_name, self.health_score)
        return self.health_score
        
    def get_current_stats(self) -> dict:
        """Get current system statistics"""
        return self.system_stats.copy()
        
    def set_monitoring_interval(self, interval_ms: int):
        """Set monitoring interval"""
        self.monitoring_interval = interval_ms
        if self.monitoring_timer.isActive():
            self.monitoring_timer.setInterval(interval_ms)
            
    def set_performance_threshold(self, metric: str, threshold: float):
        """Set performance threshold for a metric"""
        self.performance_thresholds[metric] = threshold
```

### 3. Configuration Service

```python
# services/configuration_service.py
import json
import os
from pathlib import Path
from PySide6.QtCore import QFileSystemWatcher, QSettings

class ConfigurationService(BaseService):
    # Configuration signals
    config_loaded = pyqtSignal(dict)
    config_saved = pyqtSignal(str)
    config_changed = pyqtSignal(str, dict)
    config_validation_failed = pyqtSignal(list)
    
    def __init__(self):
        super().__init__("Configuration")
        self.config_data = {}
        self.config_file_path = Path("config/rf4s_config.json")
        self.file_watcher = QFileSystemWatcher()
        self.settings = QSettings("RF4S", "BotControl")
        self.auto_save_timer = QTimer()
        self.validation_rules = self.define_validation_rules()
        
    def initialize(self) -> bool:
        """Initialize configuration service"""
        try:
            self.status = ServiceStatus.STARTING
            self.status_changed.emit(self.service_name, self.status)
            
            # Create config directory if it doesn't exist
            self.config_file_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Load configuration
            self.load_configuration()
            
            # Setup file watching
            self.setup_file_watcher()
            
            # Setup auto-save
            self.setup_auto_save()
            
            self.status = ServiceStatus.RUNNING
            self.start_time = datetime.now()
            self.status_changed.emit(self.service_name, self.status)
            return True
            
        except Exception as e:
            self.handle_error(f"Failed to initialize configuration: {str(e)}")
            return False
            
    def start_service(self) -> bool:
        """Start configuration service"""
        return self.initialize()
        
    def stop_service(self) -> bool:
        """Stop configuration service"""
        try:
            self.status = ServiceStatus.STOPPING
            self.status_changed.emit(self.service_name, self.status)
            
            # Save any pending changes
            self.save_configuration()
            
            # Stop timers and watchers
            self.auto_save_timer.stop()
            self.file_watcher.removePaths(self.file_watcher.files())
            
            self.status = ServiceStatus.STOPPED
            self.status_changed.emit(self.service_name, self.status)
            return True
            
        except Exception as e:
            self.handle_error(f"Failed to stop configuration service: {str(e)}")
            return False
            
    def load_configuration(self):
        """Load configuration from file"""
        try:
            if self.config_file_path.exists():
                with open(self.config_file_path, 'r') as f:
                    self.config_data = json.load(f)
            else:
                self.config_data = self.get_default_configuration()
                self.save_configuration()
                
            # Validate configuration
            validation_errors = self.validate_configuration(self.config_data)
            if validation_errors:
                self.config_validation_failed.emit(validation_errors)
                # Use default config if validation fails
                self.config_data = self.get_default_configuration()
                
            self.config_loaded.emit(self.config_data)
            
        except Exception as e:
            self.handle_error(f"Failed to load configuration: {str(e)}")
            self.config_data = self.get_default_configuration()
            
    def save_configuration(self):
        """Save configuration to file"""
        try:
            with open(self.config_file_path, 'w') as f:
                json.dump(self.config_data, f, indent=2)
            self.config_saved.emit(str(self.config_file_path))
            
        except Exception as e:
            self.handle_error(f"Failed to save configuration: {str(e)}")
            
    def get_default_configuration(self) -> dict:
        """Get default configuration"""
        return {
            "detection": {
                "fish_bite_confidence": 0.8,
                "spool_confidence": 0.75,
                "cast_confidence": 0.85,
                "auto_detect_enabled": True
            },
            "automation": {
                "cast_delay_min": 2000,
                "cast_delay_max": 4000,
                "reel_speed": 50,
                "auto_mode_enabled": False
            },
            "ui": {
                "theme": "dark",
                "language": "en",
                "panel_layout": 1,
                "show_notifications": True,
                "sound_enabled": True
            },
            "system": {
                "monitoring_interval": 2000,
                "auto_save_interval": 30000,
                "log_level": "INFO",
                "max_log_files": 10
            },
            "rf4s": {
                "host": "localhost",
                "port": 8080,
                "auto_connect": True,
                "reconnect_attempts": 5
            }
        }
        
    def validate_configuration(self, config: dict) -> List[str]:
        """Validate configuration against rules"""
        errors = []
        
        for section, rules in self.validation_rules.items():
            if section not in config:
                errors.append(f"Missing configuration section: {section}")
                continue
                
            section_config = config[section]
            
            for field, rule in rules.items():
                if field not in section_config:
                    if rule.get('required', False):
                        errors.append(f"Missing required field: {section}.{field}")
                    continue
                    
                value = section_config[field]
                
                # Type validation
                expected_type = rule.get('type')
                if expected_type and not isinstance(value, expected_type):
                    errors.append(f"Invalid type for {section}.{field}: expected {expected_type.__name__}")
                    
                # Range validation
                min_val = rule.get('min')
                max_val = rule.get('max')
                if min_val is not None and value < min_val:
                    errors.append(f"Value too low for {section}.{field}: minimum {min_val}")
                if max_val is not None and value > max_val:
                    errors.append(f"Value too high for {section}.{field}: maximum {max_val}")
                    
                # Custom validation
                validator = rule.get('validator')
                if validator and not validator(value):
                    errors.append(f"Invalid value for {section}.{field}")
                    
        return errors
        
    def define_validation_rules(self) -> dict:
        """Define validation rules for configuration"""
        return {
            "detection": {
                "fish_bite_confidence": {"type": float, "min": 0.1, "max": 1.0, "required": True},
                "spool_confidence": {"type": float, "min": 0.1, "max": 1.0, "required": True},
                "cast_confidence": {"type": float, "min": 0.1, "max": 1.0, "required": True},
                "auto_detect_enabled": {"type": bool, "required": True}
            },
            "automation": {
                "cast_delay_min": {"type": int, "min": 500, "max": 10000, "required": True},
                "cast_delay_max": {"type": int, "min": 1000, "max": 20000, "required": True},
                "reel_speed": {"type": int, "min": 1, "max": 100, "required": True}
            },
            "ui": {
                "theme": {"type": str, "validator": lambda x: x in ["dark", "light"], "required": True},
                "language": {"type": str, "required": True},
                "panel_layout": {"type": int, "min": 1, "max": 3, "required": True}
            },
            "system": {
                "monitoring_interval": {"type": int, "min": 1000, "max": 10000, "required": True},
                "auto_save_interval": {"type": int, "min": 10000, "max": 300000, "required": True}
            }
        }
        
    def setup_file_watcher(self):
        """Setup file system watcher"""
        if self.config_file_path.exists():
            self.file_watcher.addPath(str(self.config_file_path))
            self.file_watcher.fileChanged.connect(self.on_config_file_changed)
            
    def setup_auto_save(self):
        """Setup auto-save timer"""
        auto_save_interval = self.config_data.get('system', {}).get('auto_save_interval', 30000)
        self.auto_save_timer.timeout.connect(self.save_configuration)
        self.auto_save_timer.start(auto_save_interval)
        
    def on_config_file_changed(self, file_path: str):
        """Handle external configuration file changes"""
        try:
            # Reload configuration
            self.load_configuration()
            self.config_changed.emit("file_changed", self.config_data)
        except Exception as e:
            self.handle_error(f"Failed to reload configuration: {str(e)}")
            
    def update_config(self, section: str, key: str, value: Any):
        """Update a configuration value"""
        if section not in self.config_data:
            self.config_data[section] = {}
            
        old_value = self.config_data[section].get(key)
        self.config_data[section][key] = value
        
        # Validate change
        validation_errors = self.validate_configuration(self.config_data)
        if validation_errors:
            # Revert change if validation fails
            if old_value is not None:
                self.config_data[section][key] = old_value
            else:
                del self.config_data[section][key]
            self.config_validation_failed.emit(validation_errors)
            return False
            
        self.config_changed.emit(section, {key: value})
        return True
        
    def get_config(self, section: str = None, key: str = None):
        """Get configuration value(s)"""
        if section is None:
            return self.config_data.copy()
        if key is None:
            return self.config_data.get(section, {}).copy()
        return self.config_data.get(section, {}).get(key)
        
    def check_health(self) -> float:
        """Check configuration service health"""
        health_factors = []
        
        # Check if config file exists and is readable
        try:
            if self.config_file_path.exists():
                with open(self.config_file_path, 'r') as f:
                    json.load(f)
                health_factors.append(1.0)
            else:
                health_factors.append(0.5)
        except:
            health_factors.append(0.0)
            
        # Check if configuration is valid
        validation_errors = self.validate_configuration(self.config_data)
        if not validation_errors:
            health_factors.append(1.0)
        else:
            health_factors.append(0.5)
            
        # Check if auto-save is working
        if self.auto_save_timer.isActive():
            health_factors.append(1.0)
        else:
            health_factors.append(0.0)
            
        self.health_score = sum(health_factors) / len(health_factors)
        self.health_changed.emit(self.service_name, self.health_score)
        return self.health_score
```

### Service Orchestrator

```python
# services/service_orchestrator.py
from typing import Dict, List
import asyncio

class ServiceOrchestrator(QObject):
    # Orchestrator signals
    all_services_started = pyqtSignal()
    all_services_stopped = pyqtSignal()
    service_dependency_resolved = pyqtSignal(str)
    orchestration_failed = pyqtSignal(str)
    
    def __init__(self):
        super().__init__()
        self.services: Dict[str, BaseService] = {}
        self.service_dependencies: Dict[str, List[str]] = {}
        self.startup_order: List[str] = []
        
    def register_service(self, service: BaseService):
        """Register a service with the orchestrator"""
        self.services[service.service_name] = service
        self.service_dependencies[service.service_name] = service.get_dependencies()
        
        # Connect service signals
        service.status_changed.connect(self.on_service_status_changed)
        service.error_occurred.connect(self.on_service_error)
        
    def calculate_startup_order(self) -> List[str]:
        """Calculate optimal service startup order based on dependencies"""
        order = []
        remaining = set(self.services.keys())
        
        while remaining:
            # Find services with no remaining dependencies
            ready_services = []
            for service_name in remaining:
                dependencies = self.service_dependencies[service_name]
                if all(dep in order for dep in dependencies):
                    ready_services.append(service_name)
                    
            if not ready_services:
                # Circular dependency detected
                raise ValueError("Circular dependency detected in services")
                
            # Sort by priority (services with fewer dependencies first)
            ready_services.sort(key=lambda x: len(self.service_dependencies[x]))
            
            for service_name in ready_services:
                order.append(service_name)
                remaining.remove(service_name)
                
        return order
        
    async def start_all_services(self):
        """Start all services in dependency order"""
        try:
            self.startup_order = self.calculate_startup_order()
            
            for service_name in self.startup_order:
                service = self.services[service_name]
                print(f"Starting service: {service_name}")
                
                if not await self.start_service_async(service):
                    raise Exception(f"Failed to start service: {service_name}")
                    
                self.service_dependency_resolved.emit(service_name)
                
            self.all_services_started.emit()
            
        except Exception as e:
            self.orchestration_failed.emit(str(e))
            
    async def start_service_async(self, service: BaseService) -> bool:
        """Start a service asynchronously"""
        return await asyncio.get_event_loop().run_in_executor(
            None, service.start_service
        )
        
    def stop_all_services(self):
        """Stop all services in reverse order"""
        try:
            # Stop in reverse dependency order
            for service_name in reversed(self.startup_order):
                service = self.services[service_name]
                print(f"Stopping service: {service_name}")
                service.stop_service()
                
            self.all_services_stopped.emit()
            
        except Exception as e:
            self.orchestration_failed.emit(str(e))
            
    def get_service_status_summary(self) -> Dict[str, ServiceInfo]:
        """Get status summary of all services"""
        return {name: service.get_info() for name, service in self.services.items()}
```

This comprehensive service architecture blueprint provides the complete foundation for implementing all background services, integration layers, and service orchestration in the PySide6 version of the RF4S Bot Control application.
