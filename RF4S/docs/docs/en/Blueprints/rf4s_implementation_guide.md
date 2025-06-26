# RF4S Complete Implementation Guide

## Project Structure and Setup

### Directory Structure

```
RF4S/
├── rf4s/                           # Main package
│   ├── __init__.py
│   ├── app/                        # Application framework
│   │   ├── __init__.py
│   │   └── app.py                  # Base App and ToolApp classes
│   ├── config/                     # Configuration management
│   │   ├── __init__.py
│   │   ├── config.py               # Configuration utilities
│   │   ├── defaults.py             # Default configuration values
│   │   └── config.yaml             # User configuration file
│   ├── controller/                 # Game interaction controllers
│   │   ├── __init__.py
│   │   ├── detection.py            # Image recognition and OCR
│   │   ├── window.py               # Window management
│   │   ├── timer.py                # Timing and delays
│   │   └── notification.py         # External notifications
│   ├── component/                  # Game-specific components
│   │   ├── __init__.py
│   │   ├── friction_brake.py       # Auto friction brake
│   │   └── tackle.py               # Tackle statistics
│   ├── player.py                   # Core fishing logic
│   ├── utils.py                    # Utility functions
│   ├── exceptions.py               # Custom exceptions
│   └── result/                     # Result management
│       ├── __init__.py
│       └── result.py               # Result collection and display
├── tools/                          # Individual tool applications
│   ├── __init__.py
│   ├── main.py                     # Main CLI entry point
│   ├── auto_friction_brake.py      # Friction brake tool
│   ├── calculate.py                # Tackle calculation tool
│   ├── craft.py                    # Crafting automation tool
│   ├── harvest.py                  # Harvesting automation tool
│   └── move.py                     # Movement automation tool
├── static/                         # Image templates and assets
│   ├── en/                         # English templates
│   │   ├── spool.png
│   │   ├── meter.png
│   │   ├── fish_on_line.png
│   │   ├── snag.png
│   │   ├── casting_bar.png
│   │   ├── fish_names/             # Individual fish images
│   │   └── tags/                   # Fish tag color images
│   ├── ru/                         # Russian templates
│   ├── de/                         # German templates
│   └── ...                        # Other language templates
├── docs/                           # Documentation
│   ├── blueprints/                 # Individual component blueprints
│   ├── diagrams/                   # Mermaid diagrams
│   ├── user_guide.md              # User documentation
│   └── developer_guide.md         # Developer documentation
├── tests/                          # Test suite
│   ├── unit/                       # Unit tests
│   ├── integration/                # Integration tests
│   └── fixtures/                   # Test data and mock images
├── logs/                           # Log files and session data
├── requirements.txt                # Python dependencies
├── setup.py                       # Package setup
├── README.md                       # Project overview
└── LICENSE                        # License file
```

### Environment Setup

#### Python Environment

```bash
# Create virtual environment
python -m venv rf4s_env

# Activate environment (Windows)
rf4s_env\Scripts\activate

# Activate environment (Linux/macOS)
source rf4s_env/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Requirements.txt

```txt
# Core dependencies
opencv-python>=4.8.0
pytesseract>=0.3.10
pyautogui>=0.9.54
pynput>=1.7.6
mss>=9.0.1
pygetwindow>=0.0.9
yacs>=0.1.8
rich>=13.0.0

# Optional dependencies
screeninfo>=0.8.1      # Multi-monitor support
requests>=2.31.0       # HTTP notifications
smtplib3               # Email notifications
pillow>=10.0.0         # Image processing
numpy>=1.24.0          # Array operations

# Development dependencies
pytest>=7.4.0          # Testing framework
pytest-cov>=4.1.0     # Coverage reporting
black>=23.0.0          # Code formatting
flake8>=6.0.0          # Linting
mypy>=1.5.0            # Type checking

# Platform-specific dependencies (Windows)
pywin32>=306; sys_platform=="win32"
win32gui; sys_platform=="win32"

# Platform-specific dependencies (macOS)
pyobjc-framework-Quartz; sys_platform=="darwin"
pyobjc-framework-ApplicationServices; sys_platform=="darwin"

# Platform-specific dependencies (Linux)
python-xlib; sys_platform=="linux"
```

#### External Dependencies

##### Tesseract-OCR Installation

**Windows:**
```bash
# Download and install from: https://github.com/UB-Mannheim/tesseract/wiki
# Add to PATH or configure in config.yaml
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install tesseract-ocr tesseract-ocr-eng
```

**macOS:**
```bash
brew install tesseract
```

## Implementation Phases

### Phase 1: Core Foundation

#### 1.1 Project Structure Setup

```python
# setup.py
from setuptools import setup, find_packages

setup(
    name="rf4s",
    version="1.0.0",
    description="Russian Fishing 4 Script - Automation Suite",
    author="RF4S Development Team",
    packages=find_packages(),
    python_requires=">=3.12",
    install_requires=[
        "opencv-python>=4.8.0",
        "pytesseract>=0.3.10",
        "pyautogui>=0.9.54",
        "pynput>=1.7.6",
        "mss>=9.0.1",
        "pygetwindow>=0.0.9",
        "yacs>=0.1.8",
        "rich>=13.0.0",
    ],
    entry_points={
        "console_scripts": [
            "rf4s=tools.main:main",
        ],
    },
    package_data={
        "rf4s": ["config/config.yaml"],
        "": ["static/**/*.png"],
    },
    include_package_data=True,
)
```

#### 1.2 Configuration System Implementation

```python
# rf4s/config/defaults.py
from yacs.config import CfgNode as CN

_C = CN()

# Version information
_C.VERSION = "1.0.0"

# Script configuration
_C.SCRIPT = CN()
_C.SCRIPT.LANGUAGE = "en"
_C.SCRIPT.LAUNCH_OPTIONS = ""
_C.SCRIPT.SMTP_VERIFICATION = False
_C.SCRIPT.SPOOL_CONFIDENCE = 0.8
_C.SCRIPT.METER_CONFIDENCE = 0.8
_C.SCRIPT.ALARM_SOUND = False
_C.SCRIPT.SCREENSHOT_TAGS = False

# Key bindings
_C.KEY = CN()
_C.KEY.TEA = "5"
_C.KEY.CARROT = "6"
_C.KEY.BOTTOM_RODS = ["1", "2", "3"]
_C.KEY.COFFEE = "7"
_C.KEY.DIGGING_TOOL = "8"
_C.KEY.ALCOHOL = "9"
_C.KEY.MAIN_ROD = "1"
_C.KEY.SPOD_ROD = "4"
_C.KEY.QUIT = "ctrl+c"
_C.KEY.CAST = "space"
_C.KEY.REEL = "space"
_C.KEY.LIFT_ROD = "space"

# Player statistics thresholds
_C.STAT = CN()
_C.STAT.ENERGY_THRESHOLD = 20
_C.STAT.HUNGER_THRESHOLD = 20
_C.STAT.COMFORT_THRESHOLD = 20
_C.STAT.TEA_DELAY = 3.0
_C.STAT.COFFEE_LIMIT = 20
_C.STAT.ALCOHOL_DELAY = 1.0

# Friction brake configuration
_C.FRICTION_BRAKE = CN()
_C.FRICTION_BRAKE.INITIAL = 15
_C.FRICTION_BRAKE.MAX = 30
_C.FRICTION_BRAKE.START_DELAY = 1.0
_C.FRICTION_BRAKE.INCREASE_DELAY = 0.5
_C.FRICTION_BRAKE.SENSITIVITY = "medium"

# Keepnet management
_C.KEEPNET = CN()
_C.KEEPNET.CAPACITY = 50
_C.KEEPNET.FISH_DELAY = 2.0
_C.KEEPNET.FULL_ACTION = "quit"  # quit, sell, continue
_C.KEEPNET.WHITELIST = []
_C.KEEPNET.BLACKLIST = []
_C.KEEPNET.TAGS = ["red", "blue", "green", "yellow", "purple"]

# Notification settings
_C.NOTIFICATION = CN()
_C.NOTIFICATION.EMAIL = CN()
_C.NOTIFICATION.EMAIL.ENABLED = False
_C.NOTIFICATION.EMAIL.SMTP_SERVER = "smtp.gmail.com"
_C.NOTIFICATION.EMAIL.SMTP_PORT = 587
_C.NOTIFICATION.EMAIL.USERNAME = ""
_C.NOTIFICATION.EMAIL.PASSWORD = ""
_C.NOTIFICATION.EMAIL.TO_ADDRESS = ""

_C.NOTIFICATION.DISCORD = CN()
_C.NOTIFICATION.DISCORD.ENABLED = False
_C.NOTIFICATION.DISCORD.WEBHOOK_URL = ""

_C.NOTIFICATION.MIAOTIXING = CN()
_C.NOTIFICATION.MIAOTIXING.ENABLED = False
_C.NOTIFICATION.MIAOTIXING.API_KEY = ""

# Pause configuration
_C.PAUSE = CN()
_C.PAUSE.ENABLED = False
_C.PAUSE.MIN_INTERVAL = 300  # 5 minutes
_C.PAUSE.MAX_INTERVAL = 600  # 10 minutes
_C.PAUSE.MIN_DURATION = 30   # 30 seconds
_C.PAUSE.MAX_DURATION = 120  # 2 minutes

# Fishing profiles
_C.PROFILE = CN()
_C.PROFILE.SPIN = CN()
_C.PROFILE.SPIN.MODE = "spin"
_C.PROFILE.SPIN.CAST_POWER_LEVEL = 8.0
_C.PROFILE.SPIN.CAST_DELAY = 3.0
_C.PROFILE.SPIN.RETRIEVAL_DURATION = 30.0
_C.PROFILE.SPIN.PRE_ACCELERATION = True
_C.PROFILE.SPIN.PRE_ACCELERATION_DURATION = 5.0
_C.PROFILE.SPIN.POST_ACCELERATION = True
_C.PROFILE.SPIN.POST_ACCELERATION_DURATION = 3.0
_C.PROFILE.SPIN.ACCELERATION_DURATION = 0.3
_C.PROFILE.SPIN.BITE_TIMEOUT = 45.0
_C.PROFILE.SPIN.MAX_FIGHT_DURATION = 300.0
_C.PROFILE.SPIN.REEL_DURATION = 0.2
_C.PROFILE.SPIN.REEL_PAUSE = 0.1

_C.PROFILE.BOTTOM = CN()
_C.PROFILE.BOTTOM.MODE = "bottom"
_C.PROFILE.BOTTOM.CAST_POWER_LEVEL = 10.0
_C.PROFILE.BOTTOM.CAST_DELAY = 5.0
_C.PROFILE.BOTTOM.CHECK_INTERVAL = 2.0
_C.PROFILE.BOTTOM.BITE_TIMEOUT = 300.0
_C.PROFILE.BOTTOM.SPOD_ROD_RECAST = False
_C.PROFILE.BOTTOM.SPOD_RECAST_INTERVAL = 180.0
_C.PROFILE.BOTTOM.GROUNDBAIT = False
_C.PROFILE.BOTTOM.PVA = False
_C.PROFILE.BOTTOM.DRY_MIX = False

# Add other fishing modes...

# Runtime configuration sections
_C.ARGS = CN()      # CLI arguments
_C.SELECTED = CN()  # Selected profile

def get_cfg_defaults():
    """Get a yacs CfgNode object with default values"""
    return _C.clone()
```

```python
# rf4s/config/config.py
import os
import logging
from pathlib import Path
from yacs.config import CfgNode
from .defaults import get_cfg_defaults

def setup_cfg() -> CfgNode:
    """
    Setup configuration by loading defaults and merging with config.yaml
    """
    cfg = get_cfg_defaults()
    
    # Find config.yaml
    config_path = find_config_file()
    
    if config_path.exists():
        cfg.merge_from_file(str(config_path))
        logging.info(f"Configuration loaded from: {config_path}")
    else:
        logging.warning("config.yaml not found, using defaults")
    
    return cfg

def find_config_file() -> Path:
    """
    Find config.yaml in the appropriate location
    """
    # Check if running as compiled executable
    if hasattr(sys, '_MEIPASS'):
        # PyInstaller bundle
        root_dir = Path(sys._MEIPASS)
    elif hasattr(sys, 'frozen'):
        # Other executable packagers
        root_dir = Path(sys.executable).parent
    else:
        # Running as script
        root_dir = Path(__file__).parent.parent.parent
    
    config_path = root_dir / "rf4s" / "config" / "config.yaml"
    
    # Fallback locations
    if not config_path.exists():
        fallback_locations = [
            Path.cwd() / "config.yaml",
            Path.cwd() / "rf4s" / "config" / "config.yaml",
            Path.home() / ".rf4s" / "config.yaml"
        ]
        
        for location in fallback_locations:
            if location.exists():
                return location
    
    return config_path

def dict_to_cfg(dictionary: dict) -> CfgNode:
    """
    Convert dictionary to CfgNode
    """
    cfg = CfgNode()
    cfg.update(dictionary)
    return cfg

def print_cfg(cfg: CfgNode) -> None:
    """
    Print configuration in readable format
    """
    from rich.console import Console
    from rich.tree import Tree
    
    console = Console()
    tree = Tree("Configuration")
    
    def add_node(parent, key, value):
        if isinstance(value, CfgNode):
            branch = parent.add(f"[bold cyan]{key}[/bold cyan]")
            for k, v in value.items():
                add_node(branch, k, v)
        else:
            parent.add(f"{key}: [green]{value}[/green]")
    
    for key, value in cfg.items():
        add_node(tree, key, value)
    
    console.print(tree)
```

#### 1.3 Base Application Classes

```python
# rf4s/app/app.py
import time
import logging
from abc import ABC, abstractmethod
from pathlib import Path
from argparse import ArgumentParser, Namespace
from pynput import keyboard

from ..config.config import setup_cfg, dict_to_cfg
from ..controller.window import Window
from ..utils import is_compiled, safe_exit

class App(ABC):
    """
    Abstract base class for all RF4S applications
    """
    
    def __init__(self):
        """Initialize base application"""
        # Setup configuration
        self.cfg = setup_cfg()
        
        # Initialize window controller
        self.window = Window()
        
        # Validate critical files
        self._validate_environment()
        
        # Setup keyboard listener for quit key
        self._setup_quit_listener()
    
    def _validate_environment(self) -> None:
        """Validate that required files and dependencies exist"""
        # Check config.yaml exists
        config_path = Path(__file__).parent.parent / "config" / "config.yaml"
        if not config_path.exists():
            logging.error("config.yaml not found")
            safe_exit()
        
        # Check static directory exists
        static_path = Path(__file__).parent.parent.parent / "static"
        if not static_path.exists():
            logging.error("Static directory not found")
            safe_exit()
        
        # Platform-specific validations
        self._validate_platform_dependencies()
    
    def _validate_platform_dependencies(self) -> None:
        """Validate platform-specific dependencies"""
        import platform
        system = platform.system()
        
        try:
            if system == "Windows":
                import win32gui
            elif system == "Darwin":
                import AppKit
            elif system == "Linux":
                import Xlib
        except ImportError as e:
            logging.warning(f"Platform-specific dependency missing: {e}")
    
    def _setup_quit_listener(self) -> None:
        """Setup keyboard listener for quit key"""
        quit_key = self.cfg.KEY.QUIT.lower()
        
        if quit_key != "ctrl+c":
            # Only setup listener if not using default Ctrl+C
            try:
                self.listener = keyboard.Listener(on_release=self._on_release)
                self.listener.start()
            except Exception as e:
                logging.warning(f"Could not setup quit key listener: {e}")
    
    def _on_release(self, key):
        """Handle quit key release"""
        try:
            quit_combo = self.cfg.KEY.QUIT.lower().split('+')
            
            # Simple implementation - can be enhanced for complex combinations
            if hasattr(key, 'char') and key.char and key.char.lower() in quit_combo:
                logging.info("Quit key pressed")
                self._request_shutdown()
        except Exception as e:
            logging.error(f"Quit key handler error: {e}")
    
    def _request_shutdown(self) -> None:
        """Request graceful shutdown"""
        import os
        import signal
        
        if hasattr(self, 'listener'):
            self.listener.stop()
        
        # Simulate Ctrl+C
        os.kill(os.getpid(), signal.SIGINT)
    
    @abstractmethod
    def _start(self) -> None:
        """Core application logic - must be implemented by subclasses"""
        pass
    
    @abstractmethod
    def start(self) -> None:
        """Application startup - must be implemented by subclasses"""
        pass
    
    @abstractmethod
    def create_parser(self) -> ArgumentParser:
        """Create argument parser - must be implemented by subclasses"""
        pass
    
    @abstractmethod
    def display_result(self) -> None:
        """Display results - must be implemented by subclasses"""
        pass

class ToolApp(App):
    """
    Base class for tool applications (craft, harvest, etc.)
    """
    
    def __init__(self):
        """Initialize tool application"""
        super().__init__()
        
        # Parse arguments and merge into config
        parser = self.create_parser()
        args = parser.parse_args()
        
        # Convert args to config format and merge
        args_dict = vars(args)
        args_cfg = dict_to_cfg(args_dict)
        self.cfg.merge_from_other_cfg(args_cfg)
        
        # Initialize controllers
        from ..controller.detection import Detection
        from ..result.result import Result
        
        self.detection = Detection(self.cfg, self.window)
        self.result = Result()
        
        # Freeze configuration
        self.cfg.freeze()
    
    def start(self) -> None:
        """Start tool application"""
        try:
            # Setup quit listener if needed
            quit_key = self.cfg.KEY.QUIT.lower()
            if quit_key != "ctrl+c" and hasattr(self, 'listener'):
                self.listener.start()
            
            # Activate game window
            self.window.activate_game_window()
            
            # Execute core logic
            self._start()
        
        except KeyboardInterrupt:
            logging.info("Tool interrupted by user")
        except Exception as e:
            logging.error(f"Tool execution error: {e}")
            self.result.add_data("error", str(e))
        finally:
            # Display results
            self.display_result()
            
            # Activate script window
            self.window.activate_script_window()
            
            # Stop listener
            if hasattr(self, 'listener'):
                self.listener.stop()
    
    def display_result(self) -> None:
        """Display tool results"""
        from rich.console import Console
        from rich.table import Table
        
        console = Console()
        
        result_data = self.result.as_dict()
        
        if result_data:
            table = Table(title="Tool Results")
            table.add_column("Metric", style="cyan")
            table.add_column("Value", style="green")
            
            for key, value in result_data.items():
                table.add_row(key.replace('_', ' ').title(), str(value))
            
            console.print(table)
        else:
            console.print("[yellow]No results to display[/yellow]")
```

### Phase 2: Controller Implementation

#### 2.1 Window Controller

```python
# rf4s/controller/window.py
import time
import logging
from typing import Optional, Tuple, Dict, Any
import pygetwindow as gw
from enum import Enum

class WindowState(Enum):
    """Window state enumeration"""
    MINIMIZED = "minimized"
    MAXIMIZED = "maximized"
    NORMAL = "normal"
    FULLSCREEN = "fullscreen"
    BORDERLESS = "borderless"
    NOT_FOUND = "not_found"

class WindowError(Exception):
    """Base window error"""
    pass

class WindowNotFoundError(WindowError):
    """Window not found error"""
    pass

class WindowActivationError(WindowError):
    """Window activation error"""
    pass

class UnsupportedResolutionError(WindowError):
    """Unsupported resolution error"""
    pass

class Window:
    """
    Window management controller for game window interaction
    """
    
    def __init__(self):
        """Initialize window controller"""
        self.game_window_title = "Russian Fishing 4"
        self.script_window_title = "Command Prompt"  # Will be detected dynamically
        self._game_window: Optional[gw.Window] = None
        self._script_window: Optional[gw.Window] = None
        
        # Supported resolutions for accurate detection
        self._supported_resolutions = [
            (2560, 1440),  # 1440p
            (1920, 1080),  # 1080p
            (1600, 900),   # 900p
            (1366, 768),   # 768p
            (1280, 720)    # 720p
        ]
        
        # Initialize windows
        self._detect_script_window()
    
    def _detect_script_window(self) -> None:
        """Detect the script's console window"""
        try:
            import os
            current_pid = os.getpid()
            
            # Platform-specific detection
            import platform
            if platform.system() == "Windows":
                self._detect_script_window_windows(current_pid)
            else:
                # For other platforms, use generic detection
                self._detect_script_window_generic()
        
        except Exception as e:
            logging.warning(f"Could not detect script window: {e}")
    
    def _detect_script_window_windows(self, pid: int) -> None:
        """Windows-specific script window detection"""
        try:
            import win32gui
            import win32process
            
            def enum_windows_callback(hwnd, windows):
                if win32gui.IsWindowVisible(hwnd):
                    _, window_pid = win32process.GetWindowThreadProcessId(hwnd)
                    if window_pid == pid:
                        title = win32gui.GetWindowText(hwnd)
                        if title:
                            windows.append((hwnd, title))
                return True
            
            windows = []
            win32gui.EnumWindows(enum_windows_callback, windows)
            
            if windows:
                # Find console window
                for hwnd, title in windows:
                    if any(keyword in title.lower() for keyword in 
                          ['cmd', 'command', 'powershell', 'terminal', 'python']):
                        self.script_window_title = title
                        break
        
        except ImportError:
            logging.warning("win32gui not available for Windows script detection")
        except Exception as e:
            logging.warning(f"Windows script window detection failed: {e}")
    
    def _detect_script_window_generic(self) -> None:
        """Generic script window detection"""
        try:
            # Look for common terminal/console window titles
            common_titles = [
                "Terminal", "Console", "Command Prompt", "PowerShell",
                "Python", "cmd", "bash", "zsh"
            ]
            
            for title_pattern in common_titles:
                windows = gw.getWindowsWithTitle(title_pattern)
                if windows:
                    self.script_window_title = windows[0].title
                    self._script_window = windows[0]
                    break
        
        except Exception as e:
            logging.warning(f"Generic script window detection failed: {e}")
    
    def activate_game_window(self) -> None:
        """
        Locate and activate the Russian Fishing 4 game window
        """
        try:
            # Search for game window by various title patterns
            title_patterns = [
                "Russian Fishing 4",
                "RF4",
                "Russian Fishing 4 - Fishing Planet",
                "Fishing Planet"
            ]
            
            self._game_window = None
            
            for pattern in title_patterns:
                windows = gw.getWindowsWithTitle(pattern)
                if windows:
                    self._game_window = windows[0]
                    break
            
            if not self._game_window:
                # Try partial matching
                all_windows = gw.getAllWindows()
                for window in all_windows:
                    if any(pattern.lower() in window.title.lower() 
                          for pattern in title_patterns):
                        self._game_window = window
                        break
            
            if not self._game_window:
                raise WindowNotFoundError("Could not locate Russian Fishing 4 window")
            
            # Activate the window
            self._game_window.activate()
            time.sleep(0.5)  # Wait for activation
            
            # Verify activation
            if not self._is_window_active(self._game_window):
                # Try alternative activation methods
                self._force_window_activation()
            
            logging.info(f"Game window activated: {self._game_window.title}")
        
        except Exception as e:
            logging.error(f"Failed to activate game window: {e}")
            raise WindowActivationError(f"Could not activate game window: {e}")
    
    def activate_script_window(self) -> None:
        """Activate the script's console window"""
        try:
            if self._script_window:
                self._script_window.activate()
            else:
                # Try to find by title
                if self.script_window_title:
                    windows = gw.getWindowsWithTitle(self.script_window_title)
                    if windows:
                        windows[0].activate()
        
        except Exception as e:
            logging.warning(f"Could not activate script window: {e}")
    
    def get_resolution_str(self) -> str:
        """Get current window resolution as string"""
        if not self._game_window:
            return "Unknown"
        
        return f"{self._game_window.width}x{self._game_window.height}"
    
    def is_size_supported(self) -> bool:
        """Check if current window size is supported"""
        if not self._game_window:
            return False
        
        current_resolution = (self._game_window.width, self._game_window.height)
        return current_resolution in self._supported_resolutions
    
    def is_title_bar_exist(self) -> bool:
        """Check if window has a title bar"""
        if not self._game_window:
            return False
        
        try:
            # Platform-specific implementation
            import platform
            if platform.system() == "Windows":
                return self._has_title_bar_windows()
            else:
                return self._has_title_bar_generic()
        
        except Exception:
            return True  # Assume title bar exists if detection fails
    
    def _has_title_bar_windows(self) -> bool:
        """Windows-specific title bar detection"""
        try:
            import win32gui
            import win32con
            
            hwnd = self._game_window._hWnd
            style = win32gui.GetWindowLong(hwnd, win32con.GWL_STYLE)
            
            # Check for title bar style
            has_title_bar = bool(style & win32con.WS_CAPTION)
            return has_title_bar
        
        except ImportError:
            return True
        except Exception:
            return True
    
    def _has_title_bar_generic(self) -> bool:
        """Generic title bar detection"""
        # Simple heuristic: if window position is at screen edge, likely borderless
        try:
            return self._game_window.left > 0 or self._game_window.top > 0
        except Exception:
            return True
    
    def get_game_window_bbox(self) -> Tuple[int, int, int, int]:
        """Get game window bounding box"""
        if not self._game_window:
            raise WindowNotFoundError("Game window not available")
        
        return (
            self._game_window.left,
            self._game_window.top,
            self._game_window.width,
            self._game_window.height
        )
    
    def get_client_area_bbox(self) -> Tuple[int, int, int, int]:
        """Get client area bounding box (excluding title bar and borders)"""
        if not self._game_window:
            raise WindowNotFoundError("Game window not available")
        
        # Calculate client area offset
        title_bar_height = self._get_title_bar_height()
        border_width = self._get_border_width()
        
        return (
            self._game_window.left + border_width,
            self._game_window.top + title_bar_height,
            self._game_window.width - (2 * border_width),
            self._game_window.height - title_bar_height - border_width
        )
    
    def _get_title_bar_height(self) -> int:
        """Get title bar height"""
        if not self.is_title_bar_exist():
            return 0
        
        # Platform-specific implementation
        import platform
        if platform.system() == "Windows":
            return self._get_title_bar_height_windows()
        else:
            return 30  # Default estimate
    
    def _get_title_bar_height_windows(self) -> int:
        """Windows-specific title bar height"""
        try:
            import win32api
            return win32api.GetSystemMetrics(4)  # SM_CYCAPTION
        except ImportError:
            return 30
        except Exception:
            return 30
    
    def _get_border_width(self) -> int:
        """Get window border width"""
        # Platform-specific implementation
        import platform
        if platform.system() == "Windows":
            return self._get_border_width_windows()
        else:
            return 2  # Default estimate
    
    def _get_border_width_windows(self) -> int:
        """Windows-specific border width"""
        try:
            import win32api
            return win32api.GetSystemMetrics(32)  # SM_CXFRAME
        except ImportError:
            return 2
        except Exception:
            return 2
    
    def _is_window_active(self, window: gw.Window) -> bool:
        """Check if window is currently active"""
        try:
            # Platform-specific implementation
            import platform
            if platform.system() == "Windows":
                return self._is_window_active_windows(window)
            else:
                return self._is_window_active_generic(window)
        
        except Exception:
            return True  # Assume active if check fails
    
    def _is_window_active_windows(self, window: gw.Window) -> bool:
        """Windows-specific active window check"""
        try:
            import win32gui
            active_hwnd = win32gui.GetForegroundWindow()
            return active_hwnd == window._hWnd
        except ImportError:
            return True
        except Exception:
            return True
    
    def _is_window_active_generic(self, window: gw.Window) -> bool:
        """Generic active window check"""
        try:
            # Simple heuristic: check if window is visible and at top
            return window.visible and not window.isMinimized
        except Exception:
            return True
    
    def _force_window_activation(self) -> None:
        """Force window activation using platform-specific methods"""
        if not self._game_window:
            return
        
        import platform
        system = platform.system()
        
        try:
            if system == "Windows":
                self._force_activation_windows()
            elif system == "Darwin":
                self._force_activation_macos()
            elif system == "Linux":
                self._force_activation_linux()
        
        except Exception as e:
            logging.warning(f"Force activation failed: {e}")
    
    def _force_activation_windows(self) -> None:
        """Windows-specific forced activation"""
        try:
            import win32gui
            import win32con
            
            hwnd = self._game_window._hWnd
            
            # Restore if minimized
            if self._game_window.isMinimized:
                win32gui.ShowWindow(hwnd, win32con.SW_RESTORE)
                time.sleep(0.2)
            
            # Bring to foreground
            win32gui.SetForegroundWindow(hwnd)
            
            # Alternative method if first fails
            win32gui.ShowWindow(hwnd, win32con.SW_SHOW)
            win32gui.SetActiveWindow(hwnd)
        
        except ImportError:
            logging.warning("win32gui not available for Windows activation")
        except Exception as e:
            logging.warning(f"Windows forced activation failed: {e}")
    
    def _force_activation_macos(self) -> None:
        """macOS-specific forced activation"""
        try:
            import AppKit
            # Implementation for macOS window activation
            pass
        except ImportError:
            logging.warning("AppKit not available for macOS activation")
    
    def _force_activation_linux(self) -> None:
        """Linux-specific forced activation"""
        try:
            # X11-based activation
            pass
        except Exception as e:
            logging.warning(f"Linux forced activation failed: {e}")
    
    def ensure_window_ready(self) -> bool:
        """Ensure window is ready for automation"""
        try:
            # Check if window exists
            if not self._game_window:
                self.activate_game_window()
            
            # Check if window is responsive
            if not self._is_window_responsive():
                logging.warning("Game window appears unresponsive")
                return False
            
            # Validate resolution
            if not self.is_size_supported():
                current_res = self.get_resolution_str()
                logging.error(f"Unsupported resolution: {current_res}")
                raise UnsupportedResolutionError(f"Resolution {current_res} not supported")
            
            # Restore if minimized
            if self._game_window.isMinimized:
                self._game_window.restore()
                time.sleep(0.5)
            
            # Ensure active
            if not self._is_window_active(self._game_window):
                self._game_window.activate()
                time.sleep(0.5)
            
            return True
        
        except Exception as e:
            logging.error(f"Window readiness check failed: {e}")
            return False
    
    def _is_window_responsive(self) -> bool:
        """Check if window is responsive"""
        try:
            # Try to access window properties
            _ = self._game_window.title
            _ = self._game_window.left
            _ = self._game_window.top
            
            return True
        except Exception:
            return False
    
    def get_window_state(self) -> Dict[str, Any]:
        """Get comprehensive window state information"""
        if not self._game_window:
            return {"state": WindowState.NOT_FOUND}
        
        try:
            state_info = {
                "state": self._determine_window_state(),
                "position": (self._game_window.left, self._game_window.top),
                "size": (self._game_window.width, self._game_window.height),
                "title": self._game_window.title,
                "is_active": self._is_window_active(self._game_window),
                "has_title_bar": self.is_title_bar_exist(),
                "is_size_supported": self.is_size_supported(),
                "is_responsive": self._is_window_responsive()
            }
            
            return state_info
        
        except Exception as e:
            logging.error(f"Error getting window state: {e}")
            return {"state": WindowState.NOT_FOUND, "error": str(e)}
    
    def _determine_window_state(self) -> WindowState:
        """Determine current window state"""
        try:
            if self._game_window.isMinimized:
                return WindowState.MINIMIZED
            elif self._game_window.isMaximized:
                return WindowState.MAXIMIZED
            elif not self.is_title_bar_exist():
                return WindowState.BORDERLESS
            else:
                return WindowState.NORMAL
        except Exception:
            return WindowState.NORMAL
```

#### 2.2 Detection Controller Implementation

```python
# rf4s/controller/detection.py
import time
import logging
from pathlib import Path
from typing import Optional, List, Tuple, Dict, Any
import cv2
import numpy as np
import mss
import pytesseract
from yacs.config import CfgNode

from .window import Window

class Detection:
    """
    Image recognition and OCR controller for game state detection
    """
    
    def __init__(self, cfg: CfgNode, window: Window):
        """Initialize detection controller"""
        self.cfg = cfg
        self.window = window
        
        # Initialize screen capture
        self.sct = mss.mss()
        
        # Language and template settings
        self.language = cfg.SCRIPT.LANGUAGE
        self.image_dir = self._get_image_directory()
        self.image_templates: Dict[str, np.ndarray] = {}
        
        # Detection cache
        self._screenshot_cache: Dict[str, np.ndarray] = {}
        self._cache_timestamp = 0
        self._cache_duration = 0.1  # 100ms cache
        
        # Load critical templates
        self._load_critical_templates()
        
        # Validate detection environment
        self._validate_detection_setup()
    
    def _get_image_directory(self) -> Path:
        """Get image templates directory for current language"""
        # Find static directory
        current_file = Path(__file__)
        project_root = current_file.parent.parent.parent
        static_dir = project_root / "static"
        
        # Language-specific directory
        lang_dir = static_dir / self.language
        
        if not lang_dir.exists():
            # Fallback to English
            lang_dir = static_dir / "en"
            logging.warning(f"Language '{self.language}' not found, using English templates")
        
        if not lang_dir.exists():
            raise FileNotFoundError(f"Template directory not found: {lang_dir}")
        
        return lang_dir
    
    def _load_critical_templates(self) -> None:
        """Pre-load critical templates for better performance"""
        critical_templates = [
            "spool", "meter", "fish_on_line", "snag", 
            "casting_bar", "disconnected_indicator"
        ]
        
        for template_name in critical_templates:
            try:
                self.load_image(template_name)
            except Exception as e:
                logging.warning(f"Could not load critical template '{template_name}': {e}")
    
    def _validate_detection_setup(self) -> None:
        """Validate detection environment"""
        try:
            # Test screen capture
            test_bbox = (0, 0, 100, 100)
            test_screenshot = self.get_screenshot_as_gray(test_bbox)
            
            if test_screenshot is None or test_screenshot.size == 0:
                raise RuntimeError("Screen capture test failed")
            
            # Test OCR
            try:
                pytesseract.get_tesseract_version()
            except Exception:
                logging.warning("Tesseract-OCR not properly configured")
            
            # Validate window size
            if not self.window.is_size_supported():
                logging.warning("Current window size may affect detection accuracy")
            
            logging.info("Detection system validated successfully")
        
        except Exception as e:
            logging.error(f"Detection validation failed: {e}")
            raise
    
    def load_image(self, name: str, mode: int = cv2.IMREAD_COLOR) -> np.ndarray:
        """Load and cache image template"""
        cache_key = f"{name}_{mode}"
        
        if cache_key not in self.image_templates:
            image_path = self.image_dir / f"{name}.png"
            
            if not image_path.exists():
                # Try fallback to English
                fallback_path = self.image_dir.parent / "en" / f"{name}.png"
                if fallback_path.exists():
                    image_path = fallback_path
                else:
                    raise FileNotFoundError(f"Template image not found: {name}.png")
            
            # Load image
            template = cv2.imread(str(image_path), mode)
            
            if template is None:
                raise ValueError(f"Could not load image: {image_path}")
            
            self.image_templates[cache_key] = template
            logging.debug(f"Loaded template: {name}")
        
        return self.image_templates[cache_key]
    
    def get_screenshot_as_gray(self, bbox: Tuple[int, int, int, int]) -> np.ndarray:
        """Capture screenshot with caching"""
        cache_key = str(bbox)
        current_time = time.time()
        
        if (current_time - self._cache_timestamp > self._cache_duration or 
            cache_key not in self._screenshot_cache):
            
            # Capture new screenshot
            try:
                screenshot = self.sct.grab(bbox)
                img = np.array(screenshot)
                
                # Convert BGR to RGB (mss uses BGR)
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                
                # Convert to grayscale
                gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
                
                self._screenshot_cache[cache_key] = gray
                self._cache_timestamp = current_time
            
            except Exception as e:
                logging.error(f"Screenshot capture failed: {e}")
                # Return empty array as fallback
                return np.array([])
        
        return self._screenshot_cache[cache_key]
    
    def is_image_exist(self, name: str, bbox: Optional[Tuple[int, int, int, int]] = None, 
                      threshold: Optional[float] = None) -> bool:
        """Primary template matching method"""
        try:
            if bbox is None:
                # Use full game window
                bbox = self.window.get_client_area_bbox()
            
            if threshold is None:
                threshold = self.cfg.SCRIPT.SPOOL_CONFIDENCE
            
            # Capture screenshot
            screenshot = self.get_screenshot_as_gray(bbox)
            
            if screenshot.size == 0:
                return False
            
            # Load template
            template = self.load_image(name, cv2.IMREAD_GRAYSCALE)
            
            # Check if template fits in screenshot
            if (template.shape[0] > screenshot.shape[0] or 
                template.shape[1] > screenshot.shape[1]):
                logging.warning(f"Template '{name}' larger than screenshot region")
                return False
            
            # Template matching
            result = cv2.matchTemplate(screenshot, template, cv2.TM_CCOEFF_NORMED)
            _, max_val, _, max_loc = cv2.minMaxLoc(result)
            
            # Debug logging
            logging.debug(f"Template '{name}' match confidence: {max_val:.3f} "
                         f"(threshold: {threshold:.3f})")
            
            return max_val >= threshold
        
        except Exception as e:
            logging.error(f"Image detection error for '{name}': {e}")
            return False
    
    def is_image_exist_multiscale(self, name: str, 
                                 bbox: Optional[Tuple[int, int, int, int]] = None,
                                 scales: Optional[List[float]] = None) -> bool:
        """Multi-scale template matching for better reliability"""
        if scales is None:
            scales = [0.8, 0.9, 1.0, 1.1, 1.2]
        
        try:
            if bbox is None:
                bbox = self.window.get_client_area_bbox()
            
            screenshot = self.get_screenshot_as_gray(bbox)
            template = self.load_image(name, cv2.IMREAD_GRAYSCALE)
            threshold = self.cfg.SCRIPT.SPOOL_CONFIDENCE
            
            for scale in scales:
                # Resize template
                width = int(template.shape[1] * scale)
                height = int(template.shape[0] * scale)
                
                if width <= 0 or height <= 0:
                    continue
                
                resized_template = cv2.resize(template, (width, height))
                
                # Skip if template too large
                if (resized_template.shape[0] > screenshot.shape[0] or 
                    resized_template.shape[1] > screenshot.shape[1]):
                    continue
                
                # Template matching
                result = cv2.matchTemplate(screenshot, resized_template, cv2.TM_CCOEFF_NORMED)
                _, max_val, _, _ = cv2.minMaxLoc(result)
                
                if max_val >= threshold:
                    logging.debug(f"Multi-scale match for '{name}' at scale {scale:.1f}: {max_val:.3f}")
                    return True
            
            return False
        
        except Exception as e:
            logging.error(f"Multi-scale detection error for '{name}': {e}")
            return False
    
    def get_text(self, bbox: Tuple[int, int, int, int]) -> str:
        """Extract text using OCR"""
        try:
            # Capture screenshot
            screenshot = self.sct.grab(bbox)
            img = np.array(screenshot)
            
            # Convert color space
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
            
            # Image preprocessing for better OCR
            # Gaussian blur to reduce noise
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Thresholding
            _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # OCR configuration
            custom_config = (r'--oem 3 --psm 8 '
                           r'-c tessedit_char_whitelist=0123456789.'
                           r'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ')
            
            # Extract text
            text = pytesseract.image_to_string(thresh, config=custom_config)
            
            # Clean text
            cleaned_text = text.strip().replace('\n', ' ').replace('\r', '')
            
            logging.debug(f"OCR extracted text: '{cleaned_text}'")
            return cleaned_text
        
        except Exception as e:
            logging.error(f"OCR error: {e}")
            return ""
    
    # Specific detection methods
    def is_spool_exist(self) -> bool:
        """Detect red spool indicator"""
        bbox = getattr(self.cfg.DETECTION, 'SPOOL_REGION', None)
        if bbox is None:
            # Default region for 1920x1080
            client_bbox = self.window.get_client_area_bbox()
            bbox = (client_bbox[0] + 100, client_bbox[1] + 200, 50, 50)
        
        return self.is_image_exist("spool", bbox, self.cfg.SCRIPT.SPOOL_CONFIDENCE)
    
    def is_spool_disappear(self) -> bool:
        """Detect spool disappearance"""
        return not self.is_spool_exist()
    
    def is_meter_exist(self) -> bool:
        """Detect green meter indicator"""
        bbox = getattr(self.cfg.DETECTION, 'METER_REGION', None)
        if bbox is None:
            client_bbox = self.window.get_client_area_bbox()
            bbox = (client_bbox[0] + 150, client_bbox[1] + 200, 50, 50)
        
        return self.is_image_exist("meter", bbox, self.cfg.SCRIPT.METER_CONFIDENCE)
    
    def is_meter_disappear(self) -> bool:
        """Detect meter disappearance"""
        return not self.is_meter_exist()
    
    def is_fish_on_line_exist(self) -> bool:
        """Detect fish bite indicator"""
        bbox = getattr(self.cfg.DETECTION, 'FISH_INDICATOR_REGION', None)
        if bbox is None:
            client_bbox = self.window.get_client_area_bbox()
            bbox = (client_bbox[0] + 200, client_bbox[1] + 100, 100, 50)
        
        return self.is_image_exist("fish_on_line", bbox)
    
    def is_snag_exist(self) -> bool:
        """Detect snag indicator"""
        bbox = getattr(self.cfg.DETECTION, 'SNAG_REGION', None)
        if bbox is None:
            client_bbox = self.window.get_client_area_bbox()
            bbox = (client_bbox[0] + 300, client_bbox[1] + 150, 80, 40)
        
        return self.is_image_exist("snag", bbox)
    
    def is_fish_name_exist(self, name: str) -> bool:
        """Detect specific fish by name"""
        bbox = getattr(self.cfg.DETECTION, 'FISH_NAME_REGION', None)
        if bbox is None:
            client_bbox = self.window.get_client_area_bbox()
            bbox = (client_bbox[0] + 300, client_bbox[1] + 150, 200, 30)
        
        template_name = f"fish_names/{name.lower()}"
        return self.is_image_exist(template_name, bbox)
    
    def is_fish_tagged(self, tags: Optional[List[str]] = None) -> Optional[str]:
        """Detect fish tag colors"""
        if tags is None:
            tags = ["red", "blue", "green", "yellow", "purple"]
        
        bbox = getattr(self.cfg.DETECTION, 'FISH_TAG_REGION', None)
        if bbox is None:
            client_bbox = self.window.get_client_area_bbox()
            bbox = (client_bbox[0] + 320, client_bbox[1] + 180, 20, 20)
        
        for tag_color in tags:
            template_name = f"tags/{tag_color}_tag"
            try:
                if self.is_image_exist(template_name, bbox):
                    return tag_color
            except Exception as e:
                logging.debug(f"Could not check tag '{tag_color}': {e}")
        
        return None
    
    def is_float_diving(self) -> bool:
        """Detect float diving motion"""
        bbox = getattr(self.cfg.DETECTION, 'FLOAT_REGION', None)
        if bbox is None:
            client_bbox = self.window.get_client_area_bbox()
            bbox = (client_bbox[0] + 400, client_bbox[1] + 300, 100, 100)
        
        return self.is_image_exist("float_diving", bbox)
    
    def is_float_wobble(self) -> bool:
        """Detect float wobbling motion using frame difference"""
        bbox = getattr(self.cfg.DETECTION, 'FLOAT_REGION', None)
        if bbox is None:
            client_bbox = self.window.get_client_area_bbox()
            bbox = (client_bbox[0] + 400, client_bbox[1] + 300, 100, 100)
        
        try:
            current = self.get_screenshot_as_gray(bbox)
            
            if hasattr(self, '_prev_float_screenshot'):
                # Calculate frame difference
                diff = cv2.absdiff(current, self._prev_float_screenshot)
                movement = np.sum(diff) / (diff.shape[0] * diff.shape[1])
                
                sensitivity = getattr(self.cfg.PROFILE.SELECTED, 'FLOAT_SENSITIVITY', 10.0)
                
                self._prev_float_screenshot = current
                return movement > sensitivity
            else:
                self._prev_float_screenshot = current
                return False
        
        except Exception as e:
            logging.error(f"Float wobble detection error: {e}")
            return False
    
    def is_casting_bar_exist(self) -> bool:
        """Detect casting power bar"""
        bbox = getattr(self.cfg.DETECTION, 'CASTING_BAR_REGION', None)
        if bbox is None:
            client_bbox = self.window.get_client_area_bbox()
            bbox = (client_bbox[0] + 400, client_bbox[1] + 500, 200, 50)
        
        return self.is_image_exist("casting_bar", bbox)
    
    def is_rod_tip_movement(self) -> bool:
        """Detect rod tip movement for bottom fishing"""
        # Implementation for rod tip movement detection
        # This would require more sophisticated image analysis
        bbox = getattr(self.cfg.DETECTION, 'ROD_TIP_REGION', None)
        if bbox is None:
            return False
        
        try:
            current = self.get_screenshot_as_gray(bbox)
            
            if hasattr(self, '_prev_rod_tip_screenshot'):
                diff = cv2.absdiff(current, self._prev_rod_tip_screenshot)
                movement = np.sum(diff) / (diff.shape[0] * diff.shape[1])
                
                self._prev_rod_tip_screenshot = current
                return movement > 5.0  # Threshold for rod tip movement
            else:
                self._prev_rod_tip_screenshot = current
                return False
        
        except Exception as e:
            logging.error(f"Rod tip movement detection error: {e}")
            return False
    
    def is_broken_lure_exist(self) -> bool:
        """Detect broken lure indicator"""
        return self.is_image_exist("broken_lure")
    
    def is_disconnected_indicator_exist(self) -> bool:
        """Detect disconnection indicator"""
        return self.is_image_exist("disconnected_indicator")
    
    def is_loading_screen_exist(self) -> bool:
        """Detect loading screen"""
        return self.is_image_exist("loading_screen")
    
    def is_error_dialog_exist(self) -> bool:
        """Detect error dialog"""
        return self.is_image_exist("error_dialog")
    
    def is_rod_idle(self) -> bool:
        """Detect if rod is in idle state"""
        return self.is_image_exist("rod_idle")
    
    def get_energy_level_ocr(self) -> float:
        """Get energy level using OCR"""
        try:
            bbox = getattr(self.cfg.DETECTION, 'ENERGY_REGION', None)
            if bbox is None:
                return 100.0
            
            text = self.get_text(bbox)
            
            # Parse energy text (e.g., "Energy: 45%" -> 45.0)
            import re
            match = re.search(r'(\d+)', text)
            if match:
                return float(match.group(1))
            
            return 100.0
        
        except Exception as e:
            logging.error(f"Energy level OCR error: {e}")
            return 100.0
    
    def get_fish_weight_ocr(self) -> str:
        """Get fish weight using OCR"""
        try:
            bbox = getattr(self.cfg.DETECTION, 'FISH_WEIGHT_REGION', None)
            if bbox is None:
                return "Unknown"
            
            text = self.get_text(bbox)
            
            # Parse weight (e.g., "2.45 kg" -> "2.45")
            import re
            weight_match = re.search(r'(\d+\.?\d*)', text)
            if weight_match:
                return weight_match.group(1)
            
            return "Unknown"
        
        except Exception as e:
            logging.error(f"Fish weight OCR error: {e}")
            return "Unknown"
```

This implementation guide provides a comprehensive foundation for building the RF4S system. The code includes proper error handling, logging, cross-platform compatibility, and modular design that matches the blueprint architecture. Each component is designed to be testable and maintainable, with clear separation of concerns and robust configuration management.