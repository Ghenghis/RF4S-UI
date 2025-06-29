
# RF4S Overlay - PySide6 Game Overlay

A frameless, transparent game overlay for Russian Fishing 4 using PySide6 and PyQt-Fluent-Widgets.

## Features

- **Frameless Window**: Borderless overlay that snaps to game window
- **Transparency Control**: Real-time opacity adjustment
- **Click-through Mode**: Toggle between interactive and passthrough modes
- **Always On Top**: Stays above game window
- **Auto-attach/Detach**: Automatically switches background based on attachment state
- **Hotkey Support**: Ctrl+M to toggle modes
- **40+ Feature Panels**: All RF4S features accessible via expandable panels
- **1-3 Panel Layout**: Flexible workspace configuration

## Installation

```bash
pip install PySide6 PyQt-Fluent-Widgets pywin32 qtawesome psutil
```

## Usage

1. Start Russian Fishing 4
2. Run the overlay: `python rf4s_overlay.py`
3. Use Ctrl+M to toggle between interactive/passthrough modes
4. Adjust opacity and features as needed

## Project Structure

```
pyside6_overlay/
├── rf4s_overlay.py          # Main application entry point
├── core/                    # Core system components
├── ui/                      # UI components and widgets
├── services/               # Background services
├── resources/              # Icons, styles, assets
└── config/                 # Configuration files
```
