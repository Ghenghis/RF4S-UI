# RF4S Window Controller Blueprint

## Overview

The Window controller manages all interactions with the Russian Fishing 4 game window and the script's console window. It provides essential functionality for window detection, activation, validation, and coordinate system management for accurate image detection and input simulation.

## Architecture

### Class Structure

```python
class Window:
    def __init__(self)
    def activate_game_window(self) -> None
    def activate_script_window(self) -> None
    def get_resolution_str(self) -> str
    def is_size_supported(self) -> bool
    def is_title_bar_exist(self) -> bool
    def get_game_window_bbox(self) -> tuple
    def get_client_area_bbox(self) -> tuple
    def center_mouse_on_window(self) -> None
    def is_window_minimized(self) -> bool
    def restore_window(self) -> None
    def get_window_state(self) -> dict
```

### Dependencies

- **pygetwindow**: Primary window management library
- **win32gui (Windows)**: Additional Windows-specific functionality
- **AppKit (macOS)**: macOS window management
- **Xlib (Linux)**: X11 window system interaction

### Core Attributes

```python
class Window:
    game_window_title: str              # Expected game window title
    script_window_title: str            # Script console window title
    _game_window: pygetwindow.Window    # Game window object
    _script_window: pygetwindow.Window  # Script window object
    _supported_resolutions: list        # List of supported resolutions
    _coordinate_offset: tuple           # Offset for coordinate calculations
```

## Window Detection and Management

### Game Window Detection

```python
def activate_game_window(self) -> None:
    """
    Locate and activate the Russian Fishing 4 game window
    
    Detection strategy:
    1. Search by exact window title
    2. Search by partial title match
    3. Search by process name
    4. Fallback to manual selection
    """
    try:
        # Primary detection by title
        possible_titles = [
            "Russian Fishing 4",
            "RF4",
            "Russian Fishing 4 - Fishing Planet",
            "Fishing Planet"
        ]
        
        for title in possible_titles:
            windows = pygetwindow.getWindowsWithTitle(title)
            if windows:
                self._game_window = windows[0]
                break
        
        if not self._game_window:
            # Fallback: search by process name
            self._game_window = self._find_window_by_process("rf4.exe")
        
        if not self._game_window:
            raise WindowNotFoundError("Could not locate Russian Fishing 4 window")
        
        # Activate and bring to front
        self._game_window.activate()
        
        # Wait for activation to complete
        time.sleep(0.5)
        
        # Validate activation
        if not self._is_window_active(self._game_window):
            raise WindowActivationError("Failed to activate game window")
        
        logging.info(f"Game window activated: {self._game_window.title}")
        
    except Exception as e:
        logging.error(f"Failed to activate game window: {e}")
        raise
```

### Window Validation

```python
def is_size_supported(self) -> bool:
    """
    Validate that the game window size is supported for detection
    
    Supported resolutions are predefined based on template compatibility
    """
    if not self._game_window:
        return False
    
    current_resolution = (self._game_window.width, self._game_window.height)
    
    # Supported resolutions for accurate detection
    supported_resolutions = [
        (2560, 1440),  # 1440p
        (1920, 1080),  # 1080p
        (1600, 900),   # 900p
        (1366, 768),   # 768p
        (1280, 720)    # 720p
    ]
    
    return current_resolution in supported_resolutions

def is_title_bar_exist(self) -> bool:
    """
    Determine if the game window has a visible title bar
    
    This affects coordinate calculations and detection regions
    """
    if not self._game_window:
        return False
    
    # Compare window size with client area
    window_rect = self._get_window_rect()
    client_rect = self._get_client_rect()
    
    # If window height > client height, title bar exists
    title_bar_height = window_rect.height - client_rect.height
    
    return title_bar_height > 0

def get_resolution_str(self) -> str:
    """Get current window resolution as string"""
    if not self._game_window:
        return "Unknown"
    
    return f"{self._game_window.width}x{self._game_window.height}"
```

## Coordinate System Management

### Bounding Box Calculations

```python
def get_game_window_bbox(self) -> tuple:
    """
    Get the complete game window bounding box
    
    Returns:
        Tuple (x, y, width, height) for the entire window
    """
    if not self._game_window:
        raise WindowNotFoundError("Game window not available")
    
    return (
        self._game_window.left,
        self._game_window.top,
        self._game_window.width,
        self._game_window.height
    )

def get_client_area_bbox(self) -> tuple:
    """
    Get the client area bounding box (excluding title bar and borders)
    
    This is the actual game rendering area
    """
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

def convert_relative_to_absolute(self, relative_bbox: tuple) -> tuple:
    """
    Convert relative coordinates to absolute screen coordinates
    
    Args:
        relative_bbox: (x, y, width, height) relative to game client area
    
    Returns:
        Absolute screen coordinates
    """
    client_bbox = self.get_client_area_bbox()
    
    return (
        client_bbox[0] + relative_bbox[0],
        client_bbox[1] + relative_bbox[1],
        relative_bbox[2],
        relative_bbox[3]
    )
```

### Resolution Scaling

```python
def scale_coordinates(self, base_coords: tuple, base_resolution: tuple = (1920, 1080)) -> tuple:
    """
    Scale coordinates from base resolution to current window resolution
    
    All detection coordinates are defined for 1920x1080, this method
    scales them appropriately for other supported resolutions
    
    Args:
        base_coords: (x, y, width, height) at base resolution
        base_resolution: Base resolution coordinates were designed for
    
    Returns:
        Scaled coordinates for current resolution
    """
    if not self._game_window:
        return base_coords
    
    current_resolution = (self._game_window.width, self._game_window.height)
    
    if current_resolution == base_resolution:
        return base_coords
    
    x_scale = current_resolution[0] / base_resolution[0]
    y_scale = current_resolution[1] / base_resolution[1]
    
    return (
        int(base_coords[0] * x_scale),
        int(base_coords[1] * y_scale),
        int(base_coords[2] * x_scale),
        int(base_coords[3] * y_scale)
    )
```

## Window State Management

### Window States

```python
class WindowState(Enum):
    MINIMIZED = "minimized"
    MAXIMIZED = "maximized"
    NORMAL = "normal"
    FULLSCREEN = "fullscreen"
    BORDERLESS = "borderless"
    NOT_FOUND = "not_found"

def get_window_state(self) -> dict:
    """
    Get comprehensive window state information
    
    Returns:
        Dictionary containing window state details
    """
    if not self._game_window:
        return {"state": WindowState.NOT_FOUND}
    
    state_info = {
        "state": self._determine_window_state(),
        "position": (self._game_window.left, self._game_window.top),
        "size": (self._game_window.width, self._game_window.height),
        "title": self._game_window.title,
        "is_active": self._is_window_active(self._game_window),
        "has_title_bar": self.is_title_bar_exist(),
        "is_size_supported": self.is_size_supported()
    }
    
    return state_info

def _determine_window_state(self) -> WindowState:
    """Determine the current window state"""
    if self.is_window_minimized():
        return WindowState.MINIMIZED
    elif self._is_window_maximized():
        return WindowState.MAXIMIZED
    elif self._is_window_fullscreen():
        return WindowState.FULLSCREEN
    elif not self.is_title_bar_exist():
        return WindowState.BORDERLESS
    else:
        return WindowState.NORMAL
```

### Window Recovery

```python
def restore_window(self) -> None:
    """
    Restore window from minimized state or bring to foreground
    """
    if not self._game_window:
        # Attempt to re-detect window
        self.activate_game_window()
        return
    
    try:
        # Restore from minimized state
        if self.is_window_minimized():
            self._game_window.restore()
            time.sleep(0.5)
        
        # Bring to foreground
        self._game_window.activate()
        
        # Ensure window is in foreground
        if not self._is_window_active(self._game_window):
            # Platform-specific activation methods
            self._force_window_activation()
        
        logging.info("Window restored and activated")
        
    except Exception as e:
        logging.error(f"Failed to restore window: {e}")
        raise WindowActivationError(f"Could not restore window: {e}")

def _force_window_activation(self) -> None:
    """
    Platform-specific forced window activation
    """
    import platform
    system = platform.system()
    
    if system == "Windows":
        self._force_activation_windows()
    elif system == "Darwin":  # macOS
        self._force_activation_macos()
    elif system == "Linux":
        self._force_activation_linux()

def _force_activation_windows(self) -> None:
    """Windows-specific window activation"""
    try:
        import win32gui
        import win32con
        
        hwnd = self._game_window._hWnd
        
        # Show window if hidden
        win32gui.ShowWindow(hwnd, win32con.SW_SHOW)
        
        # Bring to foreground
        win32gui.SetForegroundWindow(hwnd)
        
        # Ensure it's the active window
        win32gui.SetActiveWindow(hwnd)
        
    except ImportError:
        logging.warning("win32gui not available for Windows activation")
    except Exception as e:
        logging.error(f"Windows activation failed: {e}")
```

## Multi-Monitor Support

### Monitor Detection

```python
def get_monitor_info(self) -> dict:
    """
    Get information about all available monitors
    """
    try:
        import screeninfo
        monitors = screeninfo.get_monitors()
        
        monitor_info = []
        for i, monitor in enumerate(monitors):
            monitor_info.append({
                "id": i,
                "x": monitor.x,
                "y": monitor.y,
                "width": monitor.width,
                "height": monitor.height,
                "is_primary": monitor.is_primary
            })
        
        return {
            "monitors": monitor_info,
            "count": len(monitors)
        }
        
    except ImportError:
        logging.warning("screeninfo not available for monitor detection")
        return {"monitors": [], "count": 1}

def get_window_monitor(self) -> int:
    """
    Determine which monitor the game window is on
    
    Returns:
        Monitor ID (0-based index)
    """
    if not self._game_window:
        return 0
    
    window_center_x = self._game_window.left + (self._game_window.width // 2)
    window_center_y = self._game_window.top + (self._game_window.height // 2)
    
    monitor_info = self.get_monitor_info()
    
    for monitor in monitor_info["monitors"]:
        if (monitor["x"] <= window_center_x < monitor["x"] + monitor["width"] and
            monitor["y"] <= window_center_y < monitor["y"] + monitor["height"]):
            return monitor["id"]
    
    return 0  # Default to primary monitor
```

## Input Coordination

### Mouse Positioning

```python
def center_mouse_on_window(self) -> None:
    """
    Center mouse cursor on the game window
    """
    if not self._game_window:
        return
    
    center_x = self._game_window.left + (self._game_window.width // 2)
    center_y = self._game_window.top + (self._game_window.height // 2)
    
    import pyautogui
    pyautogui.moveTo(center_x, center_y)

def get_relative_mouse_position(self) -> tuple:
    """
    Get mouse position relative to game window client area
    
    Returns:
        (x, y) coordinates relative to client area
    """
    import pyautogui
    absolute_pos = pyautogui.position()
    
    client_bbox = self.get_client_area_bbox()
    
    relative_x = absolute_pos.x - client_bbox[0]
    relative_y = absolute_pos.y - client_bbox[1]
    
    return (relative_x, relative_y)

def convert_game_coords_to_screen(self, game_x: int, game_y: int) -> tuple:
    """
    Convert in-game coordinates to absolute screen coordinates
    
    Args:
        game_x, game_y: Coordinates within the game client area
    
    Returns:
        Absolute screen coordinates
    """
    client_bbox = self.get_client_area_bbox()
    
    screen_x = client_bbox[0] + game_x
    screen_y = client_bbox[1] + game_y
    
    return (screen_x, screen_y)
```

## Error Handling

### Custom Exceptions

```python
class WindowError(Exception):
    """Base exception for window-related errors"""
    pass

class WindowNotFoundError(WindowError):
    """Raised when the game window cannot be located"""
    pass

class WindowActivationError(WindowError):
    """Raised when window activation fails"""
    pass

class UnsupportedResolutionError(WindowError):
    """Raised when window resolution is not supported"""
    pass
```

### Robust Window Management

```python
def ensure_window_ready(self) -> bool:
    """
    Comprehensive check to ensure window is ready for automation
    
    Returns:
        True if window is ready, False otherwise
    """
    try:
        # Check if window exists
        if not self._game_window:
            self.activate_game_window()
        
        # Validate window state
        if self.is_window_minimized():
            self.restore_window()
        
        # Check if window is responsive
        if not self._is_window_responsive():
            logging.warning("Game window appears unresponsive")
            return False
        
        # Validate resolution
        if not self.is_size_supported():
            current_res = self.get_resolution_str()
            logging.error(f"Unsupported resolution: {current_res}")
            return False
        
        # Ensure window is active
        if not self._is_window_active(self._game_window):
            self._game_window.activate()
            time.sleep(0.5)
        
        return True
        
    except Exception as e:
        logging.error(f"Window readiness check failed: {e}")
        return False

def _is_window_responsive(self) -> bool:
    """
    Check if the window is responsive (not frozen/crashed)
    """
    try:
        # Attempt to get window properties
        _ = self._game_window.title
        _ = self._game_window.left
        _ = self._game_window.top
        
        # Platform-specific responsiveness check
        return self._platform_specific_responsiveness_check()
        
    except Exception:
        return False
```

## Configuration Integration

### Window Settings

```yaml
# config.yaml window configuration
WINDOW:
  GAME_TITLE_PATTERNS:
    - "Russian Fishing 4"
    - "RF4"
    - "Fishing Planet"
  
  SUPPORTED_RESOLUTIONS:
    - [2560, 1440]
    - [1920, 1080]
    - [1600, 900]
    - [1366, 768]
    - [1280, 720]
  
  ACTIVATION_TIMEOUT: 5.0
  RESPONSIVENESS_CHECK: true
  AUTO_RESTORE: true
  
  COORDINATE_SCALING:
    BASE_RESOLUTION: [1920, 1080]
    AUTO_SCALE: true
```

### Usage in Configuration

```python
class Window:
    def __init__(self, cfg: CfgNode = None):
        self.cfg = cfg or default_config()
        
        self.game_window_title = self.cfg.WINDOW.GAME_TITLE_PATTERNS[0]
        self._supported_resolutions = self.cfg.WINDOW.SUPPORTED_RESOLUTIONS
        self._activation_timeout = self.cfg.WINDOW.ACTIVATION_TIMEOUT
        
        # ... rest of initialization
```

This Window controller blueprint provides comprehensive window management capabilities essential for reliable automation in the RF4S system, ensuring proper window detection, activation, and coordinate system management across different platforms and configurations.