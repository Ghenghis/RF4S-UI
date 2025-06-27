
"""
Main Window - Core application window with multi-panel layout
"""

from PySide6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
    QSplitter, QMenuBar, QStatusBar, QApplication
)
from PySide6.QtCore import Qt, QTimer, Signal
from PySide6.QtGui import QAction

from qfluentwidgets import (
    NavigationInterface, NavigationItemPosition, FluentIcon,
    setTheme, Theme, isDarkTheme, qconfig
)

from .workspace_manager import WorkspaceManager
from ..components.theme_manager import ThemeManager
from ..components.settings_manager import SettingsManager
from ..components.panel_manager import PanelManager


class MainWindow(QMainWindow):
    """Main application window with multi-panel layout"""
    
    # Signals
    window_closed = Signal()
    theme_changed = Signal(str)
    layout_changed = Signal(str)
    
    def __init__(self):
        super().__init__()
        
        # Initialize managers
        self.theme_manager = ThemeManager()
        self.settings_manager = SettingsManager()
        self.panel_manager = PanelManager()
        self.workspace_manager = WorkspaceManager(self)
        
        # Setup window
        self.setup_window()
        self.create_menu_bar()
        self.create_main_layout()
        self.create_status_bar()
        
        # Connect signals
        self.connect_signals()
        
        # Load settings
        self.load_window_settings()
        
        # Apply theme
        self.apply_current_theme()
        
    def setup_window(self):
        """Setup basic window properties"""
        self.setWindowTitle("RF4S Control Panel")
        self.setMinimumSize(1000, 700)
        self.resize(1400, 900)
        
        # Enable window controls
        self.setWindowFlags(
            Qt.WindowType.Window | 
            Qt.WindowType.WindowMinimizeButtonHint |
            Qt.WindowType.WindowMaximizeButtonHint |
            Qt.WindowType.WindowCloseButtonHint
        )
        
    def create_menu_bar(self):
        """Create application menu bar"""
        menubar = self.menuBar()
        
        # File menu
        file_menu = menubar.addMenu("File")
        
        settings_action = QAction("Settings", self)
        settings_action.triggered.connect(self.show_settings_dialog)
        file_menu.addAction(settings_action)
        
        file_menu.addSeparator()
        
        exit_action = QAction("Exit", self)
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)
        
        # View menu
        view_menu = menubar.addMenu("View")
        
        theme_menu = view_menu.addMenu("Theme")
        
        light_theme = QAction("Light", self)
        light_theme.triggered.connect(lambda: self.change_theme("light"))
        theme_menu.addAction(light_theme)
        
        dark_theme = QAction("Dark", self)
        dark_theme.triggered.connect(lambda: self.change_theme("dark"))
        theme_menu.addAction(dark_theme)
        
        view_menu.addSeparator()
        
        # Panel layout options
        layout_menu = view_menu.addMenu("Layout")
        
        single_panel = QAction("Single Panel", self)
        single_panel.triggered.connect(lambda: self.change_layout("single"))
        layout_menu.addAction(single_panel)
        
        dual_panel = QAction("Dual Panel", self)
        dual_panel.triggered.connect(lambda: self.change_layout("dual"))
        layout_menu.addAction(dual_panel)
        
        triple_panel = QAction("Triple Panel", self)
        triple_panel.triggered.connect(lambda: self.change_layout("triple"))
        layout_menu.addAction(triple_panel)
        
        quad_panel = QAction("Quad Panel", self)
        quad_panel.triggered.connect(lambda: self.change_layout("quad"))
        layout_menu.addAction(quad_panel)
        
    def create_main_layout(self):
        """Create the main layout with workspace"""
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        layout = QVBoxLayout(central_widget)
        layout.setContentsMargins(5, 5, 5, 5)
        
        # Create workspace
        self.workspace_widget = self.workspace_manager.create_workspace()
        layout.addWidget(self.workspace_widget)
        
    def create_status_bar(self):
        """Create status bar with system information"""
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        
        # Status labels
        self.status_bar.showMessage("Ready")
        
        # Update timer for status
        self.status_timer = QTimer()
        self.status_timer.timeout.connect(self.update_status_bar)
        self.status_timer.start(2000)  # Update every 2 seconds
        
    def connect_signals(self):
        """Connect component signals"""
        # Theme manager signals
        self.theme_manager.theme_changed.connect(self.on_theme_changed)
        
        # Panel manager signals
        self.panel_manager.layout_changed.connect(self.on_layout_changed)
        
        # Workspace manager signals
        self.workspace_manager.layout_changed.connect(self.save_layout_settings)
        
    def change_theme(self, theme_name: str):
        """Change application theme"""
        self.theme_manager.set_theme(theme_name)
        
    def change_layout(self, layout_name: str):
        """Change panel layout"""
        self.panel_manager.set_layout(layout_name)
        self.workspace_manager.update_layout(layout_name)
        
    def on_theme_changed(self, theme_name: str):
        """Handle theme change"""
        self.apply_current_theme()
        self.theme_changed.emit(theme_name)
        self.save_theme_settings()
        
    def on_layout_changed(self, layout_name: str):
        """Handle layout change"""
        self.layout_changed.emit(layout_name)
        self.save_layout_settings()
        
    def apply_current_theme(self):
        """Apply current theme to application"""
        theme_name = self.theme_manager.get_current_theme()
        
        if theme_name == "dark":
            setTheme(Theme.DARK)
        else:
            setTheme(Theme.LIGHT)
            
        # Update window style
        self.update_window_style()
        
    def update_window_style(self):
        """Update window styling based on theme"""
        if isDarkTheme():
            self.setStyleSheet("""
                QMainWindow {
                    background-color: #202020;
                    color: #ffffff;
                }
                QMenuBar {
                    background-color: #2d2d2d;
                    color: #ffffff;
                    border: none;
                }
                QMenuBar::item {
                    background-color: transparent;
                    padding: 4px 8px;
                }
                QMenuBar::item:selected {
                    background-color: #404040;
                    border-radius: 4px;
                }
                QStatusBar {
                    background-color: #2d2d2d;
                    color: #ffffff;
                    border-top: 1px solid #404040;
                }
            """)
        else:
            self.setStyleSheet("""
                QMainWindow {
                    background-color: #ffffff;
                    color: #000000;
                }
                QMenuBar {
                    background-color: #f5f5f5;
                    color: #000000;
                    border: none;
                }
                QMenuBar::item {
                    background-color: transparent;
                    padding: 4px 8px;
                }
                QMenuBar::item:selected {
                    background-color: #e5e5e5;
                    border-radius: 4px;
                }
                QStatusBar {
                    background-color: #f5f5f5;
                    color: #000000;
                    border-top: 1px solid #d0d0d0;
                }
            """)
            
    def update_status_bar(self):
        """Update status bar information"""
        # Get current panel count
        panel_count = self.workspace_manager.get_active_panel_count()
        layout_name = self.panel_manager.get_current_layout()
        theme_name = self.theme_manager.get_current_theme()
        
        status_text = f"Layout: {layout_name.title()} | Panels: {panel_count} | Theme: {theme_name.title()}"
        self.status_bar.showMessage(status_text)
        
    def show_settings_dialog(self):
        """Show settings dialog"""
        # This would open a settings dialog
        # For now, just show a message
        self.status_bar.showMessage("Settings dialog would open here", 3000)
        
    def load_window_settings(self):
        """Load window settings from settings manager"""
        settings = self.settings_manager.get_window_settings()
        
        # Apply window geometry
        if settings.get('geometry'):
            self.restoreGeometry(settings['geometry'])
            
        # Apply window state
        if settings.get('window_state'):
            self.restoreState(settings['window_state'])
            
        # Apply theme
        theme_name = settings.get('theme', 'dark')
        self.theme_manager.set_theme(theme_name)
        
        # Apply layout
        layout_name = settings.get('layout', 'dual')
        self.panel_manager.set_layout(layout_name)
        self.workspace_manager.update_layout(layout_name)
        
    def save_window_settings(self):
        """Save current window settings"""
        settings = {
            'geometry': self.saveGeometry(),
            'window_state': self.saveState(),
            'theme': self.theme_manager.get_current_theme(),
            'layout': self.panel_manager.get_current_layout()
        }
        
        self.settings_manager.save_window_settings(settings)
        
    def save_theme_settings(self):
        """Save theme settings"""
        self.settings_manager.save_setting('theme', self.theme_manager.get_current_theme())
        
    def save_layout_settings(self):
        """Save layout settings"""
        self.settings_manager.save_setting('layout', self.panel_manager.get_current_layout())
        
    def closeEvent(self, event):
        """Handle window close event"""
        # Save settings before closing
        self.save_window_settings()
        
        # Emit signal
        self.window_closed.emit()
        
        # Accept close event
        event.accept()
