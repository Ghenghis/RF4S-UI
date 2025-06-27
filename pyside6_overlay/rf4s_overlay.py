
"""
RF4S Game Overlay - Main Application
A frameless, transparent overlay for Russian Fishing 4
"""

import sys
import os
import ctypes
from ctypes import wintypes
import json
from typing import Optional, Tuple

from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QSlider, QPushButton, QCheckBox, QFrame, QScrollArea,
    QSizePolicy, QSpacerItem
)
from PySide6.QtCore import (
    Qt, QTimer, QThread, Signal, QRect, QPoint, QSize,
    QPropertyAnimation, QEasingCurve, pyqtSignal
)
from PySide6.QtGui import (
    QFont, QPalette, QColor, QKeySequence, QShortcut,
    QPixmap, QPainter, QBrush
)

from qfluentwidgets import (
    FluentWindow, NavigationItemPosition, FluentIcon,
    SubtitleLabel, BodyLabel, Slider, PushButton,
    CheckBox, ToggleButton, CommandBar, Action,
    setTheme, Theme, setThemeColor, FluentThemeColor,
    CardWidget, HeaderCardWidget, SimpleCardWidget
)

import win32gui
import win32con
import win32api
import keyboard
import psutil

# Import our custom components
from core.overlay_manager import OverlayManager
from core.game_detector import GameDetector
from core.hotkey_manager import HotkeyManager
from ui.panel_factory import PanelFactory
from ui.workspace_manager import WorkspaceManager
from services.rf4s_service import RF4SService


class RF4SOverlay(FluentWindow):
    """Main overlay window class"""
    
    # Signals
    mode_changed = pyqtSignal(str)  # 'interactive' or 'passthrough'
    opacity_changed = pyqtSignal(float)
    attachment_changed = pyqtSignal(bool)  # True if attached to game
    
    def __init__(self):
        super().__init__()
        
        # Core components
        self.overlay_manager = OverlayManager(self)
        self.game_detector = GameDetector()
        self.hotkey_manager = HotkeyManager()
        self.panel_factory = PanelFactory()
        self.workspace_manager = WorkspaceManager(self)
        self.rf4s_service = RF4SService()
        
        # State variables
        self.is_attached = False
        self.current_mode = 'interactive'  # 'interactive' or 'passthrough'
        self.current_opacity = 0.9
        self.game_window_handle = None
        self.last_game_rect = None
        
        # Timers
        self.game_detection_timer = QTimer()
        self.position_sync_timer = QTimer()
        
        self.init_ui()
        self.setup_window_properties()
        self.setup_connections()
        self.setup_hotkeys()
        self.start_services()
        
    def init_ui(self):
        """Initialize the user interface"""
        # Set application theme
        setTheme(Theme.DARK)
        setThemeColor(FluentThemeColor.BLUE)
        
        # Main widget setup
        self.resize(1200, 800)
        self.setWindowTitle("RF4S Overlay")
        
        # Create main layout
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(10, 10, 10, 10)
        
        # Header section
        self.create_header_section(main_layout)
        
        # Control panel
        self.create_control_panel(main_layout)
        
        # Workspace area
        self.workspace_widget = self.workspace_manager.create_workspace()
        main_layout.addWidget(self.workspace_widget, 1)
        
        # Status bar
        self.create_status_bar(main_layout)
        
    def create_header_section(self, parent_layout):
        """Create the header section with branding and status"""
        header_card = HeaderCardWidget(self)
        header_card.setTitle("RF4S Game Overlay")
        header_card.setContent("Russian Fishing 4 Bot Control Interface")
        
        # Status indicators
        status_layout = QHBoxLayout()
        
        # Game connection status
        self.game_status_label = BodyLabel("Game: Disconnected")
        self.game_status_label.setStyleSheet("color: #ff4757;")
        status_layout.addWidget(self.game_status_label)
        
        # RF4S service status
        self.rf4s_status_label = BodyLabel("RF4S: Offline")
        self.rf4s_status_label.setStyleSheet("color: #ff4757;")
        status_layout.addWidget(self.rf4s_status_label)
        
        # Mode indicator
        self.mode_label = BodyLabel(f"Mode: {self.current_mode.title()}")
        self.mode_label.setStyleSheet("color: #2ed573;")
        status_layout.addWidget(self.mode_label)
        
        status_layout.addStretch()
        header_card.addWidget(QWidget())  # Placeholder for status layout
        
        parent_layout.addWidget(header_card)
        
    def create_control_panel(self, parent_layout):
        """Create the main control panel"""
        control_card = SimpleCardWidget(self)
        control_layout = QHBoxLayout(control_card)
        
        # Opacity control
        opacity_group = QVBoxLayout()
        opacity_label = BodyLabel("Opacity")
        self.opacity_slider = Slider(Qt.Horizontal)
        self.opacity_slider.setRange(10, 100)
        self.opacity_slider.setValue(int(self.current_opacity * 100))
        self.opacity_slider.valueChanged.connect(self.on_opacity_changed)
        
        opacity_group.addWidget(opacity_label)
        opacity_group.addWidget(self.opacity_slider)
        control_layout.addLayout(opacity_group)
        
        # Mode toggle
        mode_group = QVBoxLayout()
        mode_label = BodyLabel("Interaction Mode")
        self.mode_toggle = ToggleButton()
        self.mode_toggle.setText("Interactive")
        self.mode_toggle.setChecked(True)
        self.mode_toggle.toggled.connect(self.on_mode_toggled)
        
        mode_group.addWidget(mode_label)
        mode_group.addWidget(self.mode_toggle)
        control_layout.addLayout(mode_group)
        
        # Attachment control
        attach_group = QVBoxLayout()
        attach_label = BodyLabel("Window Attachment")
        self.attach_toggle = ToggleButton()
        self.attach_toggle.setText("Auto-Attach")
        self.attach_toggle.setChecked(True)
        self.attach_toggle.toggled.connect(self.on_attachment_toggled)
        
        attach_group.addWidget(attach_label)
        attach_group.addWidget(self.attach_toggle)
        control_layout.addLayout(attach_group)
        
        # Quick actions
        actions_group = QVBoxLayout()
        actions_label = BodyLabel("Quick Actions")
        
        self.emergency_stop_btn = PushButton("Emergency Stop")
        self.emergency_stop_btn.setStyleSheet("background-color: #ff4757;")
        self.emergency_stop_btn.clicked.connect(self.on_emergency_stop)
        
        self.reset_position_btn = PushButton("Reset Position")
        self.reset_position_btn.clicked.connect(self.on_reset_position)
        
        actions_group.addWidget(actions_label)
        actions_group.addWidget(self.emergency_stop_btn)
        actions_group.addWidget(self.reset_position_btn)
        control_layout.addLayout(actions_group)
        
        parent_layout.addWidget(control_card)
        
    def create_status_bar(self, parent_layout):
        """Create the status bar"""
        status_card = SimpleCardWidget(self)
        status_layout = QHBoxLayout(status_card)
        
        # Position info
        self.position_label = BodyLabel("Position: (0, 0)")
        status_layout.addWidget(self.position_label)
        
        # Size info
        self.size_label = BodyLabel("Size: 1200x800")
        status_layout.addWidget(self.size_label)
        
        # Hotkey hint
        hotkey_label = BodyLabel("Hotkey: Ctrl+M (Toggle Mode)")
        hotkey_label.setStyleSheet("color: #747d8c;")
        status_layout.addWidget(hotkey_label)
        
        status_layout.addStretch()
        parent_layout.addWidget(status_card)
        
    def setup_window_properties(self):
        """Setup window properties for overlay functionality"""
        # Make window frameless and always on top
        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint |
            Qt.WindowType.WindowStaysOnTopHint |
            Qt.WindowType.Tool
        )
        
        # Enable transparency
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setWindowOpacity(self.current_opacity)
        
        # Set initial position
        self.move(100, 100)
        
    def setup_connections(self):
        """Setup signal connections"""
        # Game detection timer
        self.game_detection_timer.timeout.connect(self.detect_game_window)
        self.game_detection_timer.start(1000)  # Check every second
        
        # Position sync timer
        self.position_sync_timer.timeout.connect(self.sync_with_game_window)
        self.position_sync_timer.start(100)  # Sync every 100ms when attached
        
        # Internal signals
        self.mode_changed.connect(self.on_mode_change_internal)
        self.opacity_changed.connect(self.on_opacity_change_internal)
        self.attachment_changed.connect(self.on_attachment_change_internal)
        
    def setup_hotkeys(self):
        """Setup global hotkeys"""
        try:
            # Ctrl+M to toggle mode
            keyboard.add_hotkey('ctrl+m', self.toggle_mode_hotkey)
            print("Hotkeys registered successfully")
        except Exception as e:
            print(f"Failed to register hotkeys: {e}")
            
    def start_services(self):
        """Start background services"""
        self.rf4s_service.start()
        
    # Event handlers
    def on_opacity_changed(self, value):
        """Handle opacity slider change"""
        self.current_opacity = value / 100.0
        self.setWindowOpacity(self.current_opacity)
        self.opacity_changed.emit(self.current_opacity)
        
    def on_mode_toggled(self, checked):
        """Handle mode toggle"""
        if checked:
            self.current_mode = 'interactive'
            self.mode_toggle.setText("Interactive")
            self.enable_window_interaction()
        else:
            self.current_mode = 'passthrough'
            self.mode_toggle.setText("Click-Through")
            self.enable_click_through()
            
        self.mode_changed.emit(self.current_mode)
        
    def on_attachment_toggled(self, checked):
        """Handle attachment toggle"""
        if checked:
            self.attach_toggle.setText("Auto-Attach")
            self.position_sync_timer.start(100)
        else:
            self.attach_toggle.setText("Free-Float")
            self.position_sync_timer.stop()
            # Change to solid background when detached
            self.setStyleSheet("background-color: rgba(0, 0, 0, 200);")
            
    def on_emergency_stop(self):
        """Handle emergency stop"""
        self.rf4s_service.emergency_stop()
        print("Emergency stop activated!")
        
    def on_reset_position(self):
        """Reset window position"""
        self.move(100, 100)
        self.resize(1200, 800)
        
    def toggle_mode_hotkey(self):
        """Toggle mode via hotkey"""
        self.mode_toggle.setChecked(not self.mode_toggle.isChecked())
        
    def detect_game_window(self):
        """Detect Russian Fishing 4 game window"""
        game_handle = self.game_detector.find_rf4_window()
        
        if game_handle and game_handle != self.game_window_handle:
            self.game_window_handle = game_handle
            self.is_attached = True
            self.game_status_label.setText("Game: Connected")
            self.game_status_label.setStyleSheet("color: #2ed573;")
            self.attachment_changed.emit(True)
            
        elif not game_handle and self.game_window_handle:
            self.game_window_handle = None
            self.is_attached = False
            self.game_status_label.setText("Game: Disconnected")
            self.game_status_label.setStyleSheet("color: #ff4757;")
            self.attachment_changed.emit(False)
            
    def sync_with_game_window(self):
        """Sync overlay position with game window"""
        if not self.game_window_handle or not self.attach_toggle.isChecked():
            return
            
        try:
            rect = win32gui.GetWindowRect(self.game_window_handle)
            game_rect = QRect(rect[0], rect[1], rect[2] - rect[0], rect[3] - rect[1])
            
            # Only update if position changed significantly
            if self.last_game_rect != game_rect:
                self.setGeometry(game_rect)
                self.last_game_rect = game_rect
                
                # Update status
                self.position_label.setText(f"Position: ({game_rect.x()}, {game_rect.y()})")
                self.size_label.setText(f"Size: {game_rect.width()}x{game_rect.height()}")
                
        except Exception as e:
            print(f"Error syncing with game window: {e}")
            
    def enable_click_through(self):
        """Enable click-through mode"""
        hwnd = int(self.winId())
        
        # Get current window style
        style = win32gui.GetWindowLong(hwnd, win32con.GWL_EXSTYLE)
        
        # Add transparent flag
        style |= win32con.WS_EX_TRANSPARENT | win32con.WS_EX_LAYERED
        
        # Apply new style
        win32gui.SetWindowLong(hwnd, win32con.GWL_EXSTYLE, style)
        print("Click-through mode enabled")
        
    def enable_window_interaction(self):
        """Enable window interaction mode"""
        hwnd = int(self.winId())
        
        # Get current window style
        style = win32gui.GetWindowLong(hwnd, win32con.GWL_EXSTYLE)
        
        # Remove transparent flag
        style &= ~win32con.WS_EX_TRANSPARENT
        
        # Apply new style
        win32gui.SetWindowLong(hwnd, win32con.GWL_EXSTYLE, style)
        print("Interactive mode enabled")
        
    # Internal signal handlers
    def on_mode_change_internal(self, mode):
        """Handle internal mode change"""
        self.mode_label.setText(f"Mode: {mode.title()}")
        print(f"Mode changed to: {mode}")
        
    def on_opacity_change_internal(self, opacity):
        """Handle internal opacity change"""
        print(f"Opacity changed to: {opacity:.2f}")
        
    def on_attachment_change_internal(self, attached):
        """Handle internal attachment change"""
        if attached:
            # Transparent background when attached
            self.setStyleSheet("background-color: rgba(0, 0, 0, 50);")
        else:
            # Solid background when detached
            self.setStyleSheet("background-color: rgba(0, 0, 0, 200);")
            
    def closeEvent(self, event):
        """Handle application close"""
        # Cleanup
        self.game_detection_timer.stop()
        self.position_sync_timer.stop()
        self.rf4s_service.stop()
        
        # Unregister hotkeys
        try:
            keyboard.unhook_all()
        except:
            pass
            
        event.accept()


def main():
    """Main application entry point"""
    # Enable high DPI scaling
    QApplication.setHighDpiScaleFactorRoundingPolicy(
        Qt.HighDpiScaleFactorRoundingPolicy.PassThrough
    )
    QApplication.setAttribute(Qt.ApplicationAttribute.AA_EnableHighDpiScaling)
    QApplication.setAttribute(Qt.ApplicationAttribute.AA_UseHighDpiPixmaps)
    
    app = QApplication(sys.argv)
    
    # Create and show overlay
    overlay = RF4SOverlay()
    overlay.show()
    
    print("RF4S Overlay started successfully!")
    print("Use Ctrl+M to toggle between interactive and click-through modes")
    
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
