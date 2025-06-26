#!/usr/bin/env python3
"""
RF4S Professional PySide6 Interface
Complete resizable panel system with dark theme and professional layout
"""

import sys
import json
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
    QGridLayout, QSplitter, QFrame, QLabel, QPushButton, QSlider,
    QSpinBox, QDoubleSpinBox, QComboBox, QCheckBox, QLineEdit,
    QTextEdit, QTabWidget, QScrollArea, QGroupBox, QProgressBar,
    QToolButton, QButtonGroup, QSizePolicy, QGraphicsDropShadowEffect,
    QStackedWidget, QDockWidget, QMenuBar, QStatusBar, QToolBar,
    QHeaderView, QTreeWidget, QTreeWidgetItem, QTableWidget, 
    QTableWidgetItem, QListWidget, QListWidgetItem
)
from PySide6.QtCore import (
    Qt, QTimer, QSize, QRect, QPoint, Signal, Slot, QObject,
    QPropertyAnimation, QEasingCurve, QParallelAnimationGroup,
    QSequentialAnimationGroup, QAbstractAnimation, QThread,
    QMutex, QWaitCondition
)
from PySide6.QtGui import (
    QFont, QPixmap, QPainter, QPen, QBrush, QColor, QLinearGradient,
    QRadialGradient, QPalette, QIcon, QAction, QKeySequence,
    QPainterPath, QPolygonF, QCursor, QFontMetrics
)


class PanelType(Enum):
    """Panel types for the application"""
    SCRIPT_CONFIG = "script_config"
    PROFILES = "profiles"
    EQUIPMENT = "equipment"
    BAIT_MANAGEMENT = "bait_management"
    DETECTION = "detection"
    FISH_TARGETING = "fish_targeting"
    AUTOMATION = "automation"
    NOTIFICATIONS = "notifications"
    COMPETITION = "competition"
    MACROS = "macros"
    MONITORING = "monitoring"
    CONSOLE = "console"
    KEYBINDS = "keybinds"
    WEATHER = "weather"
    TECHNIQUES = "techniques"
    HELPERS = "helpers"


@dataclass
class PanelConfig:
    """Configuration for individual panels"""
    title: str
    icon: str
    default_size: QSize
    min_size: QSize
    resizable: bool = True
    closable: bool = True
    collapsible: bool = True


class RF4STheme:
    """Professional dark theme with orange and blue accents"""
    
    # Base colors
    BACKGROUND = "#0a0a0a"
    SURFACE = "#151515"
    SURFACE_VARIANT = "#1a1a1a"
    SURFACE_HIGHLIGHT = "#252525"
    
    # Text colors
    TEXT_PRIMARY = "#e0e0e0"
    TEXT_SECONDARY = "#b0b0b0"
    TEXT_DISABLED = "#666666"
    
    # Accent colors
    PRIMARY_ORANGE = "#ff6b35"
    PRIMARY_ORANGE_DARK = "#cc5529"
    PRIMARY_ORANGE_LIGHT = "#ff8559"
    
    SECONDARY_BLUE = "#2196f3"
    SECONDARY_BLUE_DARK = "#1976d2"
    SECONDARY_BLUE_LIGHT = "#42a5f5"
    
    # Status colors
    SUCCESS = "#4caf50"
    WARNING = "#ff9800"
    ERROR = "#f44336"
    INFO = "#2196f3"
    
    # UI elements
    BORDER = "#333333"
    BORDER_HOVER = "#555555"
    BORDER_ACTIVE = "#ff6b35"
    
    BUTTON_NORMAL = "#333333"
    BUTTON_HOVER = "#555555"
    BUTTON_PRESSED = "#222222"
    
    @classmethod
    def get_stylesheet(cls) -> str:
        """Get the complete stylesheet for the application"""
        return f"""
        QMainWindow {{
            background-color: {cls.BACKGROUND};
            color: {cls.TEXT_PRIMARY};
            font-family: 'Segoe UI', system-ui, sans-serif;
            font-size: 9pt;
        }}
        
        QWidget {{
            background-color: {cls.BACKGROUND};
            color: {cls.TEXT_PRIMARY};
            selection-background-color: {cls.PRIMARY_ORANGE};
            selection-color: white;
        }}
        
        QFrame {{
            border: 1px solid {cls.BORDER};
            border-radius: 4px;
            background-color: {cls.SURFACE};
        }}
        
        QFrame[frameShape="4"] {{ /* QFrame::Panel */
            background-color: {cls.SURFACE_VARIANT};
            border: 1px solid {cls.BORDER};
        }}
        
        QLabel {{
            background-color: transparent;
            color: {cls.TEXT_PRIMARY};
            font-weight: 500;
        }}
        
        QLabel[class="title"] {{
            font-size: 12pt;
            font-weight: 700;
            color: {cls.PRIMARY_ORANGE};
        }}
        
        QLabel[class="subtitle"] {{
            font-size: 10pt;
            font-weight: 600;
            color: {cls.TEXT_SECONDARY};
        }}
        
        QPushButton {{
            background-color: {cls.BUTTON_NORMAL};
            border: 1px solid {cls.BORDER};
            border-radius: 4px;
            padding: 6px 12px;
            font-weight: 500;
            color: {cls.TEXT_PRIMARY};
            min-height: 20px;
        }}
        
        QPushButton:hover {{
            background-color: {cls.BUTTON_HOVER};
            border-color: {cls.BORDER_HOVER};
        }}
        
        QPushButton:pressed {{
            background-color: {cls.BUTTON_PRESSED};
        }}
        
        QPushButton[class="primary"] {{
            background-color: {cls.PRIMARY_ORANGE};
            color: white;
            border-color: {cls.PRIMARY_ORANGE_DARK};
        }}
        
        QPushButton[class="primary"]:hover {{
            background-color: {cls.PRIMARY_ORANGE_LIGHT};
        }}
        
        QPushButton[class="secondary"] {{
            background-color: {cls.SECONDARY_BLUE};
            color: white;
            border-color: {cls.SECONDARY_BLUE_DARK};
        }}
        
        QPushButton[class="secondary"]:hover {{
            background-color: {cls.SECONDARY_BLUE_LIGHT};
        }}
        
        QToolButton {{
            background-color: {cls.SURFACE_VARIANT};
            border: 1px solid {cls.BORDER};
            border-radius: 4px;
            padding: 4px;
            margin: 2px;
        }}
        
        QToolButton:hover {{
            background-color: {cls.SURFACE_HIGHLIGHT};
            border-color: {cls.PRIMARY_ORANGE};
        }}
        
        QToolButton:checked {{
            background-color: {cls.PRIMARY_ORANGE};
            border-color: {cls.PRIMARY_ORANGE_DARK};
            color: white;
        }}
        
        QLineEdit, QTextEdit, QSpinBox, QDoubleSpinBox, QComboBox {{
            background-color: {cls.SURFACE_VARIANT};
            border: 1px solid {cls.BORDER};
            border-radius: 3px;
            padding: 4px;
            color: {cls.TEXT_PRIMARY};
            selection-background-color: {cls.PRIMARY_ORANGE};
        }}
        
        QLineEdit:focus, QTextEdit:focus, QSpinBox:focus, 
        QDoubleSpinBox:focus, QComboBox:focus {{
            border-color: {cls.PRIMARY_ORANGE};
        }}
        
        QComboBox::drop-down {{
            border: none;
            border-left: 1px solid {cls.BORDER};
            border-radius: 0px 3px 3px 0px;
            background-color: {cls.BUTTON_NORMAL};
            width: 20px;
        }}
        
        QComboBox::down-arrow {{
            image: none;
            border: 2px solid {cls.TEXT_SECONDARY};
            border-top: none;
            border-right: none;
            width: 6px;
            height: 6px;
            margin-right: 2px;
        }}
        
        QComboBox QAbstractItemView {{
            background-color: {cls.SURFACE};
            border: 1px solid {cls.BORDER};
            selection-background-color: {cls.PRIMARY_ORANGE};
        }}
        
        QSlider::groove:horizontal {{
            background-color: {cls.SURFACE_VARIANT};
            height: 6px;
            border-radius: 3px;
        }}
        
        QSlider::handle:horizontal {{
            background-color: {cls.PRIMARY_ORANGE};
            width: 16px;
            height: 16px;
            border-radius: 8px;
            margin: -5px 0;
        }}
        
        QSlider::handle:horizontal:hover {{
            background-color: {cls.PRIMARY_ORANGE_LIGHT};
        }}
        
        QCheckBox {{
            spacing: 6px;
            color: {cls.TEXT_PRIMARY};
        }}
        
        QCheckBox::indicator {{
            width: 16px;
            height: 16px;
            border: 1px solid {cls.BORDER};
            border-radius: 3px;
            background-color: {cls.SURFACE_VARIANT};
        }}
        
        QCheckBox::indicator:checked {{
            background-color: {cls.PRIMARY_ORANGE};
            border-color: {cls.PRIMARY_ORANGE_DARK};
        }}
        
        QCheckBox::indicator:checked:hover {{
            background-color: {cls.PRIMARY_ORANGE_LIGHT};
        }}
        
        QProgressBar {{
            background-color: {cls.SURFACE_VARIANT};
            border: 1px solid {cls.BORDER};
            border-radius: 4px;
            text-align: center;
            color: {cls.TEXT_PRIMARY};
        }}
        
        QProgressBar::chunk {{
            background-color: {cls.PRIMARY_ORANGE};
            border-radius: 3px;
        }}
        
        QTabWidget::pane {{
            border: 1px solid {cls.BORDER};
            background-color: {cls.SURFACE};
        }}
        
        QTabBar::tab {{
            background-color: {cls.SURFACE_VARIANT};
            border: 1px solid {cls.BORDER};
            padding: 6px 12px;
            margin-right: 2px;
        }}
        
        QTabBar::tab:selected {{
            background-color: {cls.PRIMARY_ORANGE};
            color: white;
        }}
        
        QTabBar::tab:hover:!selected {{
            background-color: {cls.SURFACE_HIGHLIGHT};
        }}
        
        QGroupBox {{
            font-weight: 600;
            border: 1px solid {cls.BORDER};
            border-radius: 4px;
            margin-top: 8px;
            padding-top: 4px;
            background-color: {cls.SURFACE};
        }}
        
        QGroupBox::title {{
            subcontrol-origin: margin;
            left: 8px;
            padding: 0 4px 0 4px;
            color: {cls.PRIMARY_ORANGE};
        }}
        
        QScrollArea {{
            border: 1px solid {cls.BORDER};
            background-color: {cls.SURFACE};
        }}
        
        QScrollBar:vertical {{
            background-color: {cls.SURFACE_VARIANT};
            width: 12px;
            border-radius: 6px;
        }}
        
        QScrollBar::handle:vertical {{
            background-color: {cls.BORDER_HOVER};
            border-radius: 6px;
            min-height: 20px;
        }}
        
        QScrollBar::handle:vertical:hover {{
            background-color: {cls.PRIMARY_ORANGE};
        }}
        
        QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
            height: 0px;
        }}
        
        QSplitter::handle {{
            background-color: {cls.BORDER};
        }}
        
        QSplitter::handle:hover {{
            background-color: {cls.PRIMARY_ORANGE};
        }}
        
        QStatusBar {{
            background-color: {cls.SURFACE_VARIANT};
            border-top: 1px solid {cls.BORDER};
            color: {cls.TEXT_SECONDARY};
        }}
        
        QMenuBar {{
            background-color: {cls.SURFACE_VARIANT};
            border-bottom: 1px solid {cls.BORDER};
        }}
        
        QMenuBar::item {{
            background-color: transparent;
            padding: 4px 8px;
        }}
        
        QMenuBar::item:selected {{
            background-color: {cls.PRIMARY_ORANGE};
            color: white;
        }}
        
        QDockWidget {{
            titlebar-close-icon: none;
            titlebar-normal-icon: none;
            background-color: {cls.SURFACE};
        }}
        
        QDockWidget::title {{
            background-color: {cls.SURFACE_VARIANT};
            padding: 4px;
            border-bottom: 1px solid {cls.BORDER};
            font-weight: 600;
        }}
        """


class ResizablePanel(QFrame):
    """Custom resizable panel with title bar and controls"""
    
    # Signals
    panel_closed = Signal(str)
    panel_collapsed = Signal(str, bool)
    panel_moved = Signal(str, QPoint)
    panel_resized = Signal(str, QSize)
    
    def __init__(self, panel_id: str, config: PanelConfig, parent=None):
        super().__init__(parent)
        self.panel_id = panel_id
        self.config = config
        self.is_collapsed = False
        self.is_moving = False
        self.move_start_pos = QPoint()
        self.content_widget = None
        
        self.setup_ui()
        self.setup_styling()
        
    def setup_ui(self):
        """Setup the panel UI structure"""
        self.setFrameStyle(QFrame.Panel | QFrame.Raised)
        self.setMinimumSize(self.config.min_size)
        self.resize(self.config.default_size)
        
        # Main layout
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        
        # Title bar
        self.title_bar = self.create_title_bar()
        layout.addWidget(self.title_bar)
        
        # Content area
        self.content_area = QFrame()
        self.content_area.setFrameStyle(QFrame.NoFrame)
        self.content_layout = QVBoxLayout(self.content_area)
        self.content_layout.setContentsMargins(8, 8, 8, 8)
        layout.addWidget(self.content_area)
        
        # Resize grip
        if self.config.resizable:
            self.resize_grip = self.create_resize_grip()
            layout.addWidget(self.resize_grip, 0, Qt.AlignRight | Qt.AlignBottom)
    
    def create_title_bar(self) -> QWidget:
        """Create the panel title bar with controls"""
        title_bar = QFrame()
        title_bar.setFixedHeight(28)
        title_bar.setFrameStyle(QFrame.Panel | QFrame.Raised)
        title_bar.setCursor(QCursor(Qt.SizeAllCursor))
        
        layout = QHBoxLayout(title_bar)
        layout.setContentsMargins(8, 4, 4, 4)
        
        # Title label
        self.title_label = QLabel(self.config.title)
        self.title_label.setProperty("class", "subtitle")
        layout.addWidget(self.title_label)
        
        layout.addStretch()
        
        # Control buttons
        if self.config.collapsible:
            self.collapse_btn = QPushButton("−")
            self.collapse_btn.setFixedSize(20, 20)
            self.collapse_btn.clicked.connect(self.toggle_collapse)
            layout.addWidget(self.collapse_btn)
        
        if self.config.closable:
            self.close_btn = QPushButton("×")
            self.close_btn.setFixedSize(20, 20)
            self.close_btn.clicked.connect(self.close_panel)
            layout.addWidget(self.close_btn)
        
        # Mouse events for dragging
        title_bar.mousePressEvent = self.title_mouse_press
        title_bar.mouseMoveEvent = self.title_mouse_move
        title_bar.mouseReleaseEvent = self.title_mouse_release
        
        return title_bar
    
    def create_resize_grip(self) -> QWidget:
        """Create resize grip for the panel"""
        grip = QLabel("◢")
        grip.setFixedSize(16, 16)
        grip.setAlignment(Qt.AlignRight | Qt.AlignBottom)
        grip.setCursor(QCursor(Qt.SizeFDiagCursor))
        grip.setStyleSheet("color: #666666; font-size: 12px;")
        return grip
    
    def setup_styling(self):
        """Apply custom styling to the panel"""
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(10)
        shadow.setColor(QColor(0, 0, 0, 100))
        shadow.setOffset(2, 2)
        self.setGraphicsEffect(shadow)
    
    def set_content(self, widget: QWidget):
        """Set the content widget for this panel"""
        if self.content_widget:
            self.content_layout.removeWidget(self.content_widget)
            self.content_widget.deleteLater()
        
        self.content_widget = widget
        self.content_layout.addWidget(widget)
    
    def toggle_collapse(self):
        """Toggle panel collapse state"""
        self.is_collapsed = not self.is_collapsed
        
        if self.is_collapsed:
            self.content_area.hide()
            self.collapse_btn.setText("+")
            self.setFixedHeight(self.title_bar.height())
        else:
            self.content_area.show()
            self.collapse_btn.setText("−")
            self.setMaximumHeight(16777215)  # Remove height constraint
        
        self.panel_collapsed.emit(self.panel_id, self.is_collapsed)
    
    def close_panel(self):
        """Close the panel"""
        self.panel_closed.emit(self.panel_id)
        self.hide()
    
    def title_mouse_press(self, event):
        """Handle mouse press on title bar"""
        if event.button() == Qt.LeftButton:
            self.is_moving = True
            self.move_start_pos = event.globalPos() - self.pos()
    
    def title_mouse_move(self, event):
        """Handle mouse move on title bar"""
        if self.is_moving and event.buttons() == Qt.LeftButton:
            new_pos = event.globalPos() - self.move_start_pos
            self.move(new_pos)
            self.panel_moved.emit(self.panel_id, new_pos)
    
    def title_mouse_release(self, event):
        """Handle mouse release on title bar"""
        self.is_moving = False


class SidebarIcon(QToolButton):
    """Custom sidebar icon button"""
    
    icon_clicked = Signal(str)
    
    def __init__(self, panel_id: str, icon_text: str, tooltip: str, parent=None):
        super().__init__(parent)
        self.panel_id = panel_id
        
        self.setText(icon_text)
        self.setToolTip(tooltip)
        self.setCheckable(True)
        self.setFixedSize(48, 36)
        self.setFont(QFont("Segoe UI", 8, QFont.Bold))
        
        self.clicked.connect(lambda: self.icon_clicked.emit(self.panel_id))


class PanelManager(QObject):
    """Manages all panels and their configurations"""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.panels: Dict[str, ResizablePanel] = {}
        self.panel_configs = self.get_panel_configurations()
        
    def get_panel_configurations(self) -> Dict[str, PanelConfig]:
        """Get all panel configurations"""
        return {
            PanelType.SCRIPT_CONFIG.value: PanelConfig(
                "Script Configuration", "SC", QSize(320, 400), QSize(250, 300)
            ),
            PanelType.PROFILES.value: PanelConfig(
                "Fishing Profiles", "FP", QSize(320, 350), QSize(250, 250)
            ),
            PanelType.EQUIPMENT.value: PanelConfig(
                "Equipment Setup", "EQ", QSize(300, 380), QSize(250, 300)
            ),
            PanelType.BAIT_MANAGEMENT.value: PanelConfig(
                "Bait Management", "BM", QSize(300, 320), QSize(250, 250)
            ),
            PanelType.DETECTION.value: PanelConfig(
                "Detection Settings", "DS", QSize(340, 400), QSize(280, 350)
            ),
            PanelType.FISH_TARGETING.value: PanelConfig(
                "Fish Targeting", "FT", QSize(320, 360), QSize(250, 280)
            ),
            PanelType.AUTOMATION.value: PanelConfig(
                "Automation", "AU", QSize(300, 380), QSize(250, 300)
            ),
            PanelType.NOTIFICATIONS.value: PanelConfig(
                "Notifications", "NT", QSize(320, 340), QSize(250, 280)
            ),
            PanelType.COMPETITION.value: PanelConfig(
                "Competition Mode", "CM", QSize(300, 300), QSize(250, 250)
            ),
            PanelType.MACROS.value: PanelConfig(
                "Macro System", "MS", QSize(350, 400), QSize(280, 320)
            ),
            PanelType.MONITORING.value: PanelConfig(
                "System Monitor", "SM", QSize(320, 380), QSize(250, 300)
            ),
            PanelType.CONSOLE.value: PanelConfig(
                "Console Output", "CO", QSize(400, 300), QSize(300, 200)
            ),
            PanelType.KEYBINDS.value: PanelConfig(
                "Key Bindings", "KB", QSize(300, 350), QSize(250, 280)
            ),
            PanelType.WEATHER.value: PanelConfig(
                "Weather & Time", "WT", QSize(280, 320), QSize(220, 250)
            ),
            PanelType.TECHNIQUES.value: PanelConfig(
                "Fishing Techniques", "FT", QSize(320, 380), QSize(250, 300)
            ),
            PanelType.HELPERS.value: PanelConfig(
                "Helper Tools", "HT", QSize(300, 360), QSize(250, 280)
            ),
        }
    
    def create_panel(self, panel_id: str, parent=None) -> Optional[ResizablePanel]:
        """Create a new panel instance"""
        if panel_id not in self.panel_configs:
            return None
        
        config = self.panel_configs[panel_id]
        panel = ResizablePanel(panel_id, config, parent)
        
        # Set panel content based on type
        content = self.create_panel_content(panel_id)
        if content:
            panel.set_content(content)
        
        self.panels[panel_id] = panel
        return panel
    
    def create_panel_content(self, panel_id: str) -> Optional[QWidget]:
        """Create content widget for specific panel type"""
        content_creators = {
            PanelType.SCRIPT_CONFIG.value: self.create_script_config_content,
            PanelType.PROFILES.value: self.create_profiles_content,
            PanelType.EQUIPMENT.value: self.create_equipment_content,
            PanelType.BAIT_MANAGEMENT.value: self.create_bait_content,
            PanelType.DETECTION.value: self.create_detection_content,
            PanelType.FISH_TARGETING.value: self.create_fish_targeting_content,
            PanelType.AUTOMATION.value: self.create_automation_content,
            PanelType.NOTIFICATIONS.value: self.create_notifications_content,
            PanelType.COMPETITION.value: self.create_competition_content,
            PanelType.MACROS.value: self.create_macros_content,
            PanelType.MONITORING.value: self.create_monitoring_content,
            PanelType.CONSOLE.value: self.create_console_content,
            PanelType.KEYBINDS.value: self.create_keybinds_content,
            PanelType.WEATHER.value: self.create_weather_content,
            PanelType.TECHNIQUES.value: self.create_techniques_content,
            PanelType.HELPERS.value: self.create_helpers_content,
        }
        
        creator = content_creators.get(panel_id)
        return creator() if creator else None
    
    def create_script_config_content(self) -> QWidget:
        """Create script configuration content"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # General Settings Group
        general_group = QGroupBox("General Settings")
        general_layout = QGridLayout(general_group)
        
        # Language selection
        general_layout.addWidget(QLabel("Language:"), 0, 0)
        language_combo = QComboBox()
        language_combo.addItems(["English", "Russian", "German"])
        general_layout.addWidget(language_combo, 0, 1)
        
        # SMTP Verification
        smtp_check = QCheckBox("SMTP Verification")
        general_layout.addWidget(smtp_check, 1, 0, 1, 2)
        
        # Detection Algorithm
        general_layout.addWidget(QLabel("Detection Algorithm:"), 2, 0)
        detection_combo = QComboBox()
        detection_combo.addItems(["Template Matching", "Feature Detection", "Deep Learning"])
        general_layout.addWidget(detection_combo, 2, 1)
        
        # Timing Randomization
        general_layout.addWidget(QLabel("Timing Randomization:"), 3, 0)
        timing_slider = QSlider(Qt.Horizontal)
        timing_slider.setRange(0, 100)
        timing_slider.setValue(15)
        general_layout.addWidget(timing_slider, 3, 1)
        
        # Safety Mode
        safety_check = QCheckBox("Safety Mode")
        safety_check.setChecked(True)
        general_layout.addWidget(safety_check, 4, 0, 1, 2)
        
        layout.addWidget(general_group)
        
        # Advanced Settings Group
        advanced_group = QGroupBox("Advanced Settings")
        advanced_layout = QGridLayout(advanced_group)
        
        # Max Runtime
        advanced_layout.addWidget(QLabel("Max Runtime (min):"), 0, 0)
        runtime_spin = QSpinBox()
        runtime_spin.setRange(1, 1440)
        runtime_spin.setValue(180)
        advanced_layout.addWidget(runtime_spin, 0, 1)
        
        # Screenshot Interval
        advanced_layout.addWidget(QLabel("Screenshot Interval (ms):"), 1, 0)
        screenshot_spin = QSpinBox()
        screenshot_spin.setRange(50, 1000)
        screenshot_spin.setValue(100)
        screenshot_spin.setSingleStep(10)
        advanced_layout.addWidget(screenshot_spin, 1, 1)
        
        layout.addWidget(advanced_group)
        layout.addStretch()
        
        return widget
    
    def create_profiles_content(self) -> QWidget:
        """Create profiles content"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # Profile Selection
        profile_group = QGroupBox("Active Profile")
        profile_layout = QGridLayout(profile_group)
        
        profile_layout.addWidget(QLabel("Current Profile:"), 0, 0)
        profile_combo = QComboBox()
        profile_combo.addItems(["Default", "Advanced Carp", "Pike Hunter", "Competition"])
        profile_combo.setCurrentText("Advanced Carp")
        profile_layout.addWidget(profile_combo, 0, 1)
        
        # Profile Actions
        actions_layout = QHBoxLayout()
        actions_layout.addWidget(QPushButton("Save"))
        actions_layout.addWidget(QPushButton("New"))
        actions_layout.addWidget(QPushButton("Delete"))
        profile_layout.addLayout(actions_layout, 1, 0, 1, 2)
        
        layout.addWidget(profile_group)
        
        # Fishing Mode
        mode_group = QGroupBox("Fishing Mode")
        mode_layout = QGridLayout(mode_group)
        
        mode_layout.addWidget(QLabel("Primary Mode:"), 0, 0)
        mode_combo = QComboBox()
        mode_combo.addItems(["Spin Fishing", "Bottom Fishing", "Float Fishing", "Trolling"])
        mode_combo.setCurrentText("Bottom Fishing")
        mode_layout.addWidget(mode_combo, 0, 1)
        
        # Cast Power
        mode_layout.addWidget(QLabel("Cast Power:"), 1, 0)
        cast_slider = QSlider(Qt.Horizontal)
        cast_slider.setRange(10, 100)
        cast_slider.setValue(80)
        mode_layout.addWidget(cast_slider, 1, 1)
        
        # Bite Sensitivity
        mode_layout.addWidget(QLabel("Bite Sensitivity:"), 2, 0)
        sensitivity_slider = QSlider(Qt.Horizontal)
        sensitivity_slider.setRange(1, 10)
        sensitivity_slider.setValue(7)
        mode_layout.addWidget(sensitivity_slider, 2, 1)
        
        layout.addWidget(mode_group)
        layout.addStretch()
        
        return widget
    
    def create_equipment_content(self) -> QWidget:
        """Create equipment setup content"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # Rod Setup
        rod_group = QGroupBox("Rod Configuration")
        rod_layout = QGridLayout(rod_group)
        
        rod_layout.addWidget(QLabel("Rod Type:"), 0, 0)
        rod_combo = QComboBox()
        rod_combo.addItems(["Carp Rod", "Spinning Rod", "Float Rod", "Feeder Rod"])
        rod_combo.setCurrentText("Carp Rod")
        rod_layout.addWidget(rod_combo, 0, 1)
        
        rod_layout.addWidget(QLabel("Test Curve:"), 1, 0)
        test_spin = QDoubleSpinBox()
        test_spin.setRange(1.0, 5.0)
        test_spin.setValue(3.5)
        test_spin.setSingleStep(0.25)
        test_spin.setSuffix(" lb")
        rod_layout.addWidget(test_spin, 1, 1)
        
        layout.addWidget(rod_group)
        
        # Reel Setup
        reel_group = QGroupBox("Reel Configuration")
        reel_layout = QGridLayout(reel_group)
        
        reel_layout.addWidget(QLabel("Reel Type:"), 0, 0)
        reel_combo = QComboBox()
        reel_combo.addItems(["Carp Reel", "Spinning Reel", "Baitrunner"])
        reel_combo.setCurrentText("Carp Reel")
        reel_layout.addWidget(reel_combo, 0, 1)
        
        reel_layout.addWidget(QLabel("Drag Setting:"), 1, 0)
        drag_slider = QSlider(Qt.Horizontal)
        drag_slider.setRange(1, 10)
        drag_slider.setValue(5)
        reel_layout.addWidget(drag_slider, 1, 1)
        
        layout.addWidget(reel_group)
        
        # Line Setup
        line_group = QGroupBox("Line Configuration")
        line_layout = QGridLayout(line_group)
        
        line_layout.addWidget(QLabel("Line Type:"), 0, 0)
        line_combo = QComboBox()
        line_combo.addItems(["Mono", "Fluoro", "Braid"])
        line_combo.setCurrentText("Mono")
        line_layout.addWidget(line_combo, 0, 1)
        
        line_layout.addWidget(QLabel("Line Strength:"), 1, 0)
        strength_spin = QDoubleSpinBox()
        strength_spin.setRange(5.0, 50.0)
        strength_spin.setValue(15.0)
        strength_spin.setSuffix(" lb")
        line_layout.addWidget(strength_spin, 1, 1)
        
        layout.addWidget(line_group)
        layout.addStretch()
        
        return widget
    
    def create_bait_content(self) -> QWidget:
        """Create bait management content"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # Bait Selection
        bait_group = QGroupBox("Bait Selection")
        bait_layout = QGridLayout(bait_group)
        
        bait_layout.addWidget(QLabel("Primary Bait:"), 0, 0)
        primary_combo = QComboBox()
        primary_combo.addItems(["Boilies", "Corn", "Worms", "Pellets", "Pop-ups"])
        primary_combo.setCurrentText("Boilies")
        bait_layout.addWidget(primary_combo, 0, 1)
        
        bait_layout.addWidget(QLabel("Secondary Bait:"), 1, 0)
        secondary_combo = QComboBox()
        secondary_combo.addItems(["None", "Corn", "Hemp", "Maggots"])
        secondary_combo.setCurrentText("Corn")
        bait_layout.addWidget(secondary_combo, 1, 1)
        
        # Auto Rebait
        auto_rebait = QCheckBox("Auto Rebait")
        auto_rebait.setChecked(True)
        bait_layout.addWidget(auto_rebait, 2, 0, 1, 2)
        
        layout.addWidget(bait_group)
        
        # Bait Inventory
        inventory_group = QGroupBox("Bait Inventory")
        inventory_layout = QVBoxLayout(inventory_group)
        
        # Create inventory table
        inventory_table = QTableWidget(5, 3)
        inventory_table.setHorizontalHeaderLabels(["Bait Type", "Quantity", "Auto-Buy"])
        inventory_table.horizontalHeader().setStretchLastSection(True)
        
        # Sample data
        baits = [
            ("Boilies 18mm", "150", True),
            ("Sweetcorn", "2kg", True),
            ("Worms", "50", False),
            ("Pellets 8mm", "1kg", True),
            ("Pop-ups", "30", False)
        ]
        
        for row, (bait, qty, auto) in enumerate(baits):
            inventory_table.setItem(row, 0, QTableWidgetItem(bait))
            inventory_table.setItem(row, 1, QTableWidgetItem(qty))
            
            auto_check = QCheckBox()
            auto_check.setChecked(auto)
            inventory_table.setCellWidget(row, 2, auto_check)
        
        inventory_layout.addWidget(inventory_table)
        layout.addWidget(inventory_group)
        
        return widget
    
    def create_detection_content(self) -> QWidget:
        """Create detection settings content"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # Detection Engine
        engine_group = QGroupBox("Detection Engine")
        engine_layout = QGridLayout(engine_group)
        
        engine_layout.addWidget(QLabel("Detection Method:"), 0, 0)
        method_combo = QComboBox()
        method_combo.addItems(["Template Matching", "Feature Detection", "Deep Learning", "Hybrid"])
        method_combo.setCurrentText("Template Matching")
        engine_layout.addWidget(method_combo, 0, 1)
        
        engine_layout.addWidget(QLabel("Confidence Threshold:"), 1, 0)
        confidence_spin = QSpinBox()
        confidence_spin.setRange(50, 99)
        confidence_spin.setValue(85)
        confidence_spin.setSuffix("%")
        engine_layout.addWidget(confidence_spin, 1, 1)
        
        engine_layout.addWidget(QLabel("Detection FPS:"), 2, 0)
        fps_spin = QSpinBox()
        fps_spin.setRange(1, 30)
        fps_spin.setValue(10)
        engine_layout.addWidget(fps_spin, 2, 1)
        
        layout.addWidget(engine_group)
        
        # Bite Detection
        bite_group = QGroupBox("Bite Detection")
        bite_layout = QGridLayout(bite_group)
        
        bite_layout.addWidget(QLabel("Float Movement:"), 0, 0)
        float_slider = QSlider(Qt.Horizontal)
        float_slider.setRange(1, 10)
        float_slider.setValue(5)
        bite_layout.addWidget(float_slider, 0, 1)
        
        bite_layout.addWidget(QLabel("Rod Tip Sensitivity:"), 1, 0)
        rod_slider = QSlider(Qt.Horizontal)
        rod_slider.setRange(1, 10)
        rod_slider.setValue(7)
        bite_layout.addWidget(rod_slider, 1, 1)
        
        # Detection Features
        audio_check = QCheckBox("Audio Detection")
        audio_check.setChecked(True)
        bite_layout.addWidget(audio_check, 2, 0)
        
        visual_check = QCheckBox("Visual Indicators")
        visual_check.setChecked(True)
        bite_layout.addWidget(visual_check, 2, 1)
        
        layout.addWidget(bite_group)
        
        # Advanced Detection
        advanced_group = QGroupBox("Advanced Detection")
        advanced_layout = QGridLayout(advanced_group)
        
        advanced_layout.addWidget(QLabel("Anti-Aliasing:"), 0, 0)
        aa_combo = QComboBox()
        aa_combo.addItems(["None", "2x", "4x", "8x"])
        aa_combo.setCurrentText("4x")
        advanced_layout.addWidget(aa_combo, 0, 1)
        
        advanced_layout.addWidget(QLabel("Edge Enhancement:"), 1, 0)
        edge_slider = QSlider(Qt.Horizontal)
        edge_slider.setRange(0, 100)
        edge_slider.setValue(50)
        advanced_layout.addWidget(edge_slider, 1, 1)
        
        layout.addWidget(advanced_group)
        layout.addStretch()
        
        return widget
    
    def create_fish_targeting_content(self) -> QWidget:
        """Create fish targeting content"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # Target Species
        species_group = QGroupBox("Target Species")
        species_layout = QVBoxLayout(species_group)
        
        # Species checkboxes
        species_list = ["Carp", "Pike", "Catfish", "Sturgeon", "Barbel", "Tench", "Bream"]
        for species in species_list:
            check = QCheckBox(species)
            if species in ["Carp", "Pike"]:
                check.setChecked(True)
            species_layout.addWidget(check)
        
        layout.addWidget(species_group)
        
        # Size Preferences
        size_group = QGroupBox("Size Preferences")
        size_layout = QGridLayout(size_group)
        
        size_layout.addWidget(QLabel("Min Weight (kg):"), 0, 0)
        min_weight = QDoubleSpinBox()
        min_weight.setRange(0.0, 50.0)
        min_weight.setValue(5.0)
        min_weight.setSingleStep(0.5)
        size_layout.addWidget(min_weight, 0, 1)
        
        size_layout.addWidget(QLabel("Max Weight (kg):"), 1, 0)
        max_weight = QDoubleSpinBox()
        max_weight.setRange(0.0, 100.0)
        max_weight.setValue(50.0)
        max_weight.setSingleStep(1.0)
        size_layout.addWidget(max_weight, 1, 1)
        
        trophy_check = QCheckBox("Trophy Fish Only")
        size_layout.addWidget(trophy_check, 2, 0, 1, 2)
        
        layout.addWidget(size_group)
        layout.addStretch()
        
        return widget
    
    def create_automation_content(self) -> QWidget:
        """Create automation content"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # Auto Actions
        auto_group = QGroupBox("Automated Actions")
        auto_layout = QVBoxLayout(auto_group)
        
        auto_cast = QCheckBox("Auto Cast")
        auto_cast.setChecked(True)
        auto_layout.addWidget(auto_cast)
        
        auto_strike = QCheckBox("Auto Strike")
        auto_strike.setChecked(True)
        auto_layout.addWidget(auto_strike)
        
        auto_retrieve = QCheckBox("Auto Retrieve")
        auto_retrieve.setChecked(True)
        auto_layout.addWidget(auto_retrieve)
        
        auto_release = QCheckBox("Auto Release Small Fish")
        auto_layout.addWidget(auto_release)
        
        auto_photo = QCheckBox("Auto Screenshot Catches")
        auto_photo.setChecked(True)
        auto_layout.addWidget(auto_photo)
        
        layout.addWidget(auto_group)
        
        # Timing Settings
        timing_group = QGroupBox("Timing Configuration")
        timing_layout = QGridLayout(timing_group)
        
        timing_layout.addWidget(QLabel("Cast Delay (s):"), 0, 0)
        cast_delay = QSpinBox()
        cast_delay.setRange(1, 60)
        cast_delay.setValue(5)
        timing_layout.addWidget(cast_delay, 0, 1)
        
        timing_layout.addWidget(QLabel("Strike Delay (ms):"), 1, 0)
        strike_delay = QSpinBox()
        strike_delay.setRange(100, 5000)
        strike_delay.setValue(500)
        strike_delay.setSingleStep(100)
        timing_layout.addWidget(strike_delay, 1, 1)
        
        timing_layout.addWidget(QLabel("Retrieve Speed:"), 2, 0)
        retrieve_slider = QSlider(Qt.Horizontal)
        retrieve_slider.setRange(1, 10)
        retrieve_slider.setValue(5)
        timing_layout.addWidget(retrieve_slider, 2, 1)
        
        layout.addWidget(timing_group)
        
        # Safety Settings
        safety_group = QGroupBox("Safety Features")
        safety_layout = QVBoxLayout(safety_group)
        
        human_check = QCheckBox("Human-like Behavior")
        human_check.setChecked(True)
        safety_layout.addWidget(human_check)
        
        random_check = QCheckBox("Randomize Timings")
        random_check.setChecked(True)
        safety_layout.addWidget(random_check)
        
        break_check = QCheckBox("Take Breaks")
        break_check.setChecked(True)
        safety_layout.addWidget(break_check)
        
        layout.addWidget(safety_group)
        layout.addStretch()
        
        return widget
    
    def create_notifications_content(self) -> QWidget:
        """Create notifications content"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # Notification Types
        types_group = QGroupBox("Notification Types")
        types_layout = QVBoxLayout(types_group)
        
        fish_caught = QCheckBox("Fish Caught")
        fish_caught.setChecked(True)
        types_layout.addWidget(fish_caught)
        
        trophy_fish = QCheckBox("Trophy Fish")
        trophy_fish.setChecked(True)
        types_layout.addWidget(trophy_fish)
        
        bait_low = QCheckBox("Low Bait Warning")
        bait_low.setChecked(True)
        types_layout.addWidget(bait_low)
        
        equipment_damage = QCheckBox("Equipment Damage")
        equipment_damage.setChecked(True)
        types_layout.addWidget(equipment_damage)
        
        session_complete = QCheckBox("Session Complete")
        session_complete.setChecked(True)
        types_layout.addWidget(session_complete)
        
        layout.addWidget(types_group)
        
        # Notification Methods
        methods_group = QGroupBox("Notification Methods")
        methods_layout = QGridLayout(methods_group)
        
        # Sound notifications
        sound_check = QCheckBox("Sound Alerts")
        sound_check.setChecked(True)
        methods_layout.addWidget(sound_check, 0, 0)
        
        volume_slider = QSlider(Qt.Horizontal)
        volume_slider.setRange(0, 100)
        volume_slider.setValue(75)
        methods_layout.addWidget(volume_slider, 0, 1)
        
        # Email notifications
        email_check = QCheckBox("Email Alerts")
        methods_layout.addWidget(email_check, 1, 0)
        
        email_edit = QLineEdit()
        email_edit.setPlaceholderText("your@email.com")
        methods_layout.addWidget(email_edit, 1, 1)
        
        # Discord webhook
        discord_check = QCheckBox("Discord Webhook")
        methods_layout.addWidget(discord_check, 2, 0)
        
        webhook_edit = QLineEdit()
        webhook_edit.setPlaceholderText("Discord webhook URL")
        methods_layout.addWidget(webhook_edit, 2, 1)
        
        layout.addWidget(methods_group)
        layout.addStretch()
        
        return widget
    
    def create_competition_content(self) -> QWidget:
        """Create competition mode content"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # Competition Settings
        comp_group = QGroupBox("Competition Settings")
        comp_layout = QGridLayout(comp_group)
        
        comp_layout.addWidget(QLabel("Competition Type:"), 0, 0)
        comp_combo = QComboBox()
        comp_combo.addItems(["Weight Based", "Number Based", "Points Based", "Species Hunt"])
        comp_layout.addWidget(comp_combo, 0, 1)
        
        comp_layout.addWidget(QLabel("Duration (min):"), 1, 0)
        duration_spin = QSpinBox()
        duration_spin.setRange(15, 360)
        duration_spin.setValue(60)
        comp_layout.addWidget(duration_spin, 1, 1)
        
        # Competition features
        keepnet_check = QCheckBox("Auto Keepnet Management")
        keepnet_check.setChecked(True)
        comp_layout.addWidget(keepnet_check, 2, 0, 1, 2)
        
        fast_mode = QCheckBox("Fast Competition Mode")
        fast_mode.setChecked(True)
        comp_layout.addWidget(fast_mode, 3, 0, 1, 2)
        
        layout.addWidget(comp_group)
        
        # Strategy Settings
        strategy_group = QGroupBox("Competition Strategy")
        strategy_layout = QVBoxLayout(strategy_group)
        
        strategy_combo = QComboBox()
        strategy_combo.addItems([
            "Maximize Weight",
            "Maximize Count",
            "Target Specific Species",
            "Balanced Approach"
        ])
        strategy_layout.addWidget(strategy_combo)
        
        # Quick settings
        quick_strike = QCheckBox("Quick Strike Mode")
        quick_strike.setChecked(True)
        strategy_layout.addWidget(quick_strike)
        
        skip_small = QCheckBox("Skip Small Fish")
        strategy_layout.addWidget(skip_small)
        
        layout.addWidget(strategy_group)
        layout.addStretch()
        
        return widget
    
    def create_macros_content(self) -> QWidget:
        """Create macro system content"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # Macro List
        macro_group = QGroupBox("Macro Management")
        macro_layout = QVBoxLayout(macro_group)
        
        # Macro table
        macro_table = QTableWidget(5, 4)
        macro_table.setHorizontalHeaderLabels(["Name", "Hotkey", "Actions", "Enabled"])
        macro_table.horizontalHeader().setStretchLastSection(True)
        
        # Sample macros
        macros = [
            ("Quick Cast", "F1", "Cast → Wait → Retrieve", True),
            ("Bait Switch", "F2", "Open Bait → Select → Apply", True),
            ("Photo Mode", "F3", "Screenshot → Save → Share", False),
            ("Emergency Stop", "F9", "Stop All → Reel In", True),
            ("Competition Start", "F5", "Reset → Fast Mode → Go", False)
        ]
        
        for row, (name, key, actions, enabled) in enumerate(macros):
            macro_table.setItem(row, 0, QTableWidgetItem(name))
            macro_table.setItem(row, 1, QTableWidgetItem(key))
            macro_table.setItem(row, 2, QTableWidgetItem(actions))
            
            enabled_check = QCheckBox()
            enabled_check.setChecked(enabled)
            macro_table.setCellWidget(row, 3, enabled_check)
        
        macro_layout.addWidget(macro_table)
        
        # Macro buttons
        button_layout = QHBoxLayout()
        button_layout.addWidget(QPushButton("New Macro"))
        button_layout.addWidget(QPushButton("Edit"))
        button_layout.addWidget(QPushButton("Delete"))
        button_layout.addWidget(QPushButton("Record"))
        macro_layout.addLayout(button_layout)
        
        layout.addWidget(macro_group)
        
        # Macro Editor
        editor_group = QGroupBox("Macro Editor")
        editor_layout = QVBoxLayout(editor_group)
        
        editor_text = QTextEdit()
        editor_text.setMaximumHeight(100)
        editor_text.setPlaceholderText("// Macro commands here\ncast(80)\nwait(2000)\nif (fish_hooked) {\n  strike()\n  retrieve()\n}")
        editor_layout.addWidget(editor_text)
        
        layout.addWidget(editor_group)
        layout.addStretch()
        
        return widget
    
    def create_monitoring_content(self) -> QWidget:
        """Create system monitoring content"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # Performance Metrics
        perf_group = QGroupBox("Performance Metrics")
        perf_layout = QGridLayout(perf_group)
        
        # CPU Usage
        perf_layout.addWidget(QLabel("CPU Usage:"), 0, 0)
        cpu_bar = QProgressBar()
        cpu_bar.setValue(35)
        perf_layout.addWidget(cpu_bar, 0, 1)
        
        # Memory Usage
        perf_layout.addWidget(QLabel("Memory:"), 1, 0)
        mem_bar = QProgressBar()
        mem_bar.setValue(42)
        perf_layout.addWidget(mem_bar, 1, 1)
        
        # FPS
        perf_layout.addWidget(QLabel("Detection FPS:"), 2, 0)
        fps_label = QLabel("10.2 FPS")
        fps_label.setStyleSheet("color: #4caf50; font-weight: bold;")
        perf_layout.addWidget(fps_label, 2, 1)
        
        layout.addWidget(perf_group)
        
        # Session Statistics
        stats_group = QGroupBox("Session Statistics")
        stats_layout = QGridLayout(stats_group)
        
        stats_data = [
            ("Session Time:", "2h 34m"),
            ("Fish Caught:", "47"),
            ("Success Rate:", "87%"),
            ("Largest Fish:", "24.5 kg"),
            ("Total Weight:", "312.4 kg"),
            ("Casts Made:", "54")
        ]
        
        for row, (label, value) in enumerate(stats_data):
            stats_layout.addWidget(QLabel(label), row, 0)
            value_label = QLabel(value)
            value_label.setStyleSheet("font-weight: bold;")
            stats_layout.addWidget(value_label, row, 1)
        
        layout.addWidget(stats_group)
        
        # System Health
        health_group = QGroupBox("System Health")
        health_layout = QVBoxLayout(health_group)
        
        health_status = QLabel("✓ All Systems Operational")
        health_status.setStyleSheet("color: #4caf50; font-weight: bold; font-size: 10pt;")
        health_layout.addWidget(health_status)
        
        # Health indicators
        indicators = [
            ("Detection Engine", True),
            ("Automation System", True),
            ("Network Connection", True),
            ("Game Connection", False)
        ]
        
        for name, status in indicators:
            indicator_layout = QHBoxLayout()
            indicator_layout.addWidget(QLabel(name))
            indicator_layout.addStretch()
            
            status_label = QLabel("●")
            status_label.setStyleSheet(f"color: {'#4caf50' if status else '#f44336'}; font-size: 14pt;")
            indicator_layout.addWidget(status_label)
            
            health_layout.addLayout(indicator_layout)
        
        layout.addWidget(health_group)
        layout.addStretch()
        
        return widget
    
    def create_console_content(self) -> QWidget:
        """Create console output content"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # Console output
        self.console_text = QTextEdit()
        self.console_text.setReadOnly(True)
        self.console_text.setFont(QFont("Consolas", 9))
        self.console_text.setStyleSheet("""
            QTextEdit {
                background-color: #0a0a0a;
                color: #e0e0e0;
                border: 1px solid #333333;
            }
        """)
        
        # Add sample console output
        console_output = """[2024-01-20 14:32:15] System initialized
        [2024-01-20 14:32:16] Loading configuration...
        [2024-01-20 14:32:16] Configuration loaded successfully
        [2024-01-20 14:32:17] Connecting to game...
        [2024-01-20 14:32:18] Game connection established
        [2024-01-20 14:32:19] Starting detection engine...
        [2024-01-20 14:32:20] Detection engine ready
        [2024-01-20 14:32:21] Auto-fishing started
        [2024-01-20 14:32:45] Cast successful (Power: 82%)
        [2024-01-20 14:33:12] Bite detected!
        [2024-01-20 14:33:13] Strike executed
        [2024-01-20 14:33:14] Fish hooked - Common Carp
        [2024-01-20 14:33:28] Fish landed - Weight: 12.3 kg
        [2024-01-20 14:33:30] Screenshot saved
        [2024-01-20 14:33:32] Preparing next cast..."""

        self.console_text.setPlainText(console_output)
        layout.addWidget(self.console_text)
        
        # Console controls
        control_layout = QHBoxLayout()
        
        # Log level
        control_layout.addWidget(QLabel("Log Level:"))
        log_combo = QComboBox()
        log_combo.addItems(["Debug", "Info", "Warning", "Error"])
        log_combo.setCurrentText("Info")
        control_layout.addWidget(log_combo)
        
        control_layout.addStretch()
        
        # Console buttons
        control_layout.addWidget(QPushButton("Clear"))
        control_layout.addWidget(QPushButton("Export"))
        control_layout.addWidget(QPushButton("Pause"))
        
        layout.addLayout(control_layout)
        
        return widget
    
    def create_keybinds_content(self) -> QWidget:
        """Create key bindings content"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # Keybind table
        keybind_table = QTableWidget(10, 3)
        keybind_table.setHorizontalHeaderLabels(["Action", "Current Key", "New Key"])
        keybind_table.horizontalHeader().setStretchLastSection(True)
        
        # Keybind data
        keybinds = [
            ("Start/Stop Fishing", "F1", ""),
            ("Emergency Stop", "ESC", ""),
            ("Cast Line", "Space", ""),
            ("Quick Strike", "E", ""),
            ("Open Inventory", "I", ""),
            ("Switch Rod", "Tab", ""),
            ("Take Screenshot", "F12", ""),
            ("Toggle Detection", "F2", ""),
            ("Quick Save", "F5", ""),
            ("Reload Config", "F9", "")
        ]
        
        for row, (action, current, _) in enumerate(keybinds):
            keybind_table.setItem(row, 0, QTableWidgetItem(action))
            keybind_table.setItem(row, 1, QTableWidgetItem(current))
            
            # Key capture button
            capture_btn = QPushButton("Set")
            capture_btn.setMaximumWidth(60)
            keybind_table.setCellWidget(row, 2, capture_btn)
        
        layout.addWidget(keybind_table)
        
        # Control buttons
        button_layout = QHBoxLayout()
        button_layout.addWidget(QPushButton("Reset Defaults"))
        button_layout.addWidget(QPushButton("Import"))
        button_layout.addWidget(QPushButton("Export"))
        button_layout.addStretch()
        button_layout.addWidget(QPushButton("Apply"))
        
        layout.addLayout(button_layout)
        
        return widget
    
    def create_weather_content(self) -> QWidget:
        """Create weather and time content"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # Current Conditions
        current_group = QGroupBox("Current Conditions")
        current_layout = QGridLayout(current_group)
        
        # Weather icon and temp
        weather_layout = QHBoxLayout()
        weather_icon = QLabel("☀️")
        weather_icon.setStyleSheet("font-size: 48px;")
        weather_layout.addWidget(weather_icon)
        
        temp_label = QLabel("22°C")
        temp_label.setStyleSheet("font-size: 24px; font-weight: bold;")
        weather_layout.addWidget(temp_label)
        weather_layout.addStretch()
        
        current_layout.addLayout(weather_layout, 0, 0, 1, 2)
        
        # Weather details
        details = [
            ("Conditions:", "Clear"),
            ("Wind:", "5 km/h NE"),
            ("Pressure:", "1013 mb"),
            ("Humidity:", "65%")
        ]
        
        for row, (label, value) in enumerate(details, 1):
            current_layout.addWidget(QLabel(label), row, 0)
            current_layout.addWidget(QLabel(value), row, 1)
        
        layout.addWidget(current_group)
        
        # Time Settings
        time_group = QGroupBox("Time Management")
        time_layout = QGridLayout(time_group)
        
        time_layout.addWidget(QLabel("Current Time:"), 0, 0)
        time_label = QLabel("14:35")
        time_label.setStyleSheet("font-weight: bold;")
        time_layout.addWidget(time_label, 0, 1)
        
        time_layout.addWidget(QLabel("Time Speed:"), 1, 0)
        speed_combo = QComboBox()
        speed_combo.addItems(["Real Time", "2x", "4x", "8x", "16x"])
        speed_combo.setCurrentText("4x")
        time_layout.addWidget(speed_combo, 1, 1)
        
        # Time preferences
        dawn_check = QCheckBox("Prefer Dawn Fishing")
        dawn_check.setChecked(True)
        time_layout.addWidget(dawn_check, 2, 0, 1, 2)
        
        dusk_check = QCheckBox("Prefer Dusk Fishing")
        dusk_check.setChecked(True)
        time_layout.addWidget(dusk_check, 3, 0, 1, 2)
        
        layout.addWidget(time_group)
        
        # Weather Impact
        impact_group = QGroupBox("Weather Impact")
        impact_layout = QVBoxLayout(impact_group)
        
        impact_label = QLabel("Current fishing conditions: EXCELLENT")
        impact_label.setStyleSheet("color: #4caf50; font-weight: bold;")
        impact_layout.addWidget(impact_label)
        
        # Impact factors
        factors = [
            ("Fish Activity:", "+20%", True),
            ("Bite Rate:", "+15%", True),
            ("Trophy Chance:", "+5%", True)
        ]
        
        for factor, value, positive in factors:
            factor_layout = QHBoxLayout()
            factor_layout.addWidget(QLabel(factor))
            factor_layout.addStretch()
            
            value_label = QLabel(value)
            color = "#4caf50" if positive else "#f44336"
            value_label.setStyleSheet(f"color: {color}; font-weight: bold;")
            factor_layout.addWidget(value_label)
            
            impact_layout.addLayout(factor_layout)
        
        layout.addWidget(impact_group)
        layout.addStretch()
        
        return widget
    
    def create_techniques_content(self) -> QWidget:
        """Create fishing techniques content"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # Technique Selection
        technique_group = QGroupBox("Active Techniques")
        technique_layout = QVBoxLayout(technique_group)
        
        # Technique list with descriptions
        techniques = [
            ("Lift Method", "Slowly lift and drop bait", True),
            ("Twitching", "Quick rod tip movements", True),
            ("Dead Sticking", "No movement strategy", False),
            ("Slow Retrieve", "Constant slow reeling", False),
            ("Stop and Go", "Intermittent retrieval", True),
            ("Bottom Bouncing", "Drag along bottom", False)
        ]
        
        for name, desc, enabled in techniques:
            tech_widget = QWidget()
            tech_layout = QHBoxLayout(tech_widget)
            tech_layout.setContentsMargins(0, 0, 0, 0)
            
            check = QCheckBox(name)
            check.setChecked(enabled)
            tech_layout.addWidget(check)
            
            desc_label = QLabel(f"- {desc}")
            desc_label.setStyleSheet("color: #b0b0b0; font-size: 8pt;")
            tech_layout.addWidget(desc_label)
            tech_layout.addStretch()
            
            technique_layout.addWidget(tech_widget)
        
        layout.addWidget(technique_group)
        
        # Technique Rotation
        rotation_group = QGroupBox("Technique Rotation")
        rotation_layout = QGridLayout(rotation_group)
        
        rotation_layout.addWidget(QLabel("Rotation Interval:"), 0, 0)
        interval_spin = QSpinBox()
        interval_spin.setRange(30, 600)
        interval_spin.setValue(120)
        interval_spin.setSuffix(" sec")
        rotation_layout.addWidget(interval_spin, 0, 1)
        
        auto_rotate = QCheckBox("Auto Rotate Techniques")
        auto_rotate.setChecked(True)
        rotation_layout.addWidget(auto_rotate, 1, 0, 1, 2)
        
        adaptive = QCheckBox("Adaptive Selection (AI)")
        adaptive.setChecked(True)
        rotation_layout.addWidget(adaptive, 2, 0, 1, 2)
        
        layout.addWidget(rotation_group)
        layout.addStretch()
        
        return widget
    
    def create_helpers_content(self) -> QWidget:
        """Create helper tools content"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # Quick Tools
        tools_group = QGroupBox("Quick Tools")
        tools_layout = QGridLayout(tools_group)
        
        # Tool buttons
        tools = [
            ("🎯", "Spot Analyzer", "Analyze fishing spots"),
            ("📊", "Statistics", "View detailed statistics"),
            ("🗺️", "Map Helper", "Interactive map tools"),
            ("🎣", "Rig Builder", "Build custom rigs"),
            ("📷", "Gallery", "View caught fish"),
            ("⚙️", "Optimizer", "Optimize settings")
        ]
        
        for i, (icon, name, tooltip) in enumerate(tools):
            btn = QPushButton(f"{icon}\n{name}")
            btn.setToolTip(tooltip)
            btn.setFixedSize(80, 60)
            tools_layout.addWidget(btn, i // 3, i % 3)
        
        layout.addWidget(tools_group)
        
        # Calculators
        calc_group = QGroupBox("Calculators")
        calc_layout = QVBoxLayout(calc_group)
        
        # Distance calculator
        dist_layout = QHBoxLayout()
        dist_layout.addWidget(QLabel("Cast Distance:"))
        
        power_spin = QSpinBox()
        power_spin.setRange(1, 100)
        power_spin.setValue(80)
        power_spin.setSuffix("%")
        dist_layout.addWidget(power_spin)
        
        dist_layout.addWidget(QLabel("="))
        
        distance_label = QLabel("72m")
        distance_label.setStyleSheet("font-weight: bold;")
        dist_layout.addWidget(distance_label)
        
        calc_layout.addLayout(dist_layout)
        
        # Line strength calculator
        line_layout = QHBoxLayout()
        line_layout.addWidget(QLabel("Fish Weight:"))
        
        weight_spin = QDoubleSpinBox()
        weight_spin.setRange(0.1, 100.0)
        weight_spin.setValue(15.0)
        weight_spin.setSuffix(" kg")
        line_layout.addWidget(weight_spin)
        
        line_layout.addWidget(QLabel("→"))
        
        line_label = QLabel("20lb line")
        line_label.setStyleSheet("font-weight: bold; color: #4caf50;")
        line_layout.addWidget(line_label)
        
        calc_layout.addLayout(line_layout)
        
        layout.addWidget(calc_group)
        
        # Import/Export
        io_group = QGroupBox("Import/Export")
        io_layout = QVBoxLayout(io_group)
        
        io_buttons = QHBoxLayout()
        io_buttons.addWidget(QPushButton("Import Settings"))
        io_buttons.addWidget(QPushButton("Export Settings"))
        io_layout.addLayout(io_buttons)
        
        backup_check = QCheckBox("Auto Backup Settings")
        backup_check.setChecked(True)
        io_layout.addWidget(backup_check)
        
        layout.addWidget(io_group)
        layout.addStretch()
        
        return widget


class RF4SMainWindow(QMainWindow):
    """Main application window for RF4S"""
    
    def __init__(self):
        super().__init__()
        self.panel_manager = PanelManager()
        self.active_panels = {}
        self.panel_positions = {}
        
        self.setup_ui()
        self.setup_theme()
        self.load_default_layout()
        
    def setup_ui(self):
        """Setup the main window UI"""
        self.setWindowTitle("RF4S Professional - Fishing Automation Suite")
        self.setGeometry(100, 100, 1400, 900)
        
        # Central widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # Main layout
        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)
        
        # Sidebar
        self.sidebar = self.create_sidebar()
        main_layout.addWidget(self.sidebar)
        
        # Panel container
        self.panel_container = QWidget()
        self.panel_container.setMinimumWidth(1200)
        self.panel_layout = QGridLayout(self.panel_container)
        self.panel_layout.setContentsMargins(10, 10, 10, 10)
        self.panel_layout.setSpacing(10)
        
        # Scroll area for panels
        scroll_area = QScrollArea()
        scroll_area.setWidget(self.panel_container)
        scroll_area.setWidgetResizable(True)
        scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarAsNeeded)
        scroll_area.setVerticalScrollBarPolicy(Qt.ScrollBarAsNeeded)
        
        main_layout.addWidget(scroll_area)
        
        # Create menu bar
        self.create_menu_bar()
        
        # Create status bar
        self.create_status_bar()
    
    def create_sidebar(self) -> QWidget:
        """Create the sidebar with panel icons"""
        sidebar = QFrame()
        sidebar.setFixedWidth(60)
        sidebar.setFrameStyle(QFrame.Box)
        
        layout = QVBoxLayout(sidebar)
        layout.setContentsMargins(6, 6, 6, 6)
        layout.setSpacing(4)
        
        # Title
        title_label = QLabel("RF4S")
        title_label.setAlignment(Qt.AlignCenter)
        title_label.setProperty("class", "title")
        layout.addWidget(title_label)
        
        # Separator
        separator = QFrame()
        separator.setFrameShape(QFrame.HLine)
        separator.setFixedHeight(2)
        layout.addWidget(separator)
        
        # Panel icons
        self.icon_group = QButtonGroup()
        self.icon_group.setExclusive(False)
        
        panel_icons = [
            (PanelType.SCRIPT_CONFIG, "⚙️", "Script Configuration"),
            (PanelType.PROFILES, "👤", "Fishing Profiles"),
            (PanelType.EQUIPMENT, "🎣", "Equipment Setup"),
            (PanelType.BAIT_MANAGEMENT, "🐛", "Bait Management"),
            (PanelType.DETECTION, "👁️", "Detection Settings"),
            (PanelType.FISH_TARGETING, "🎯", "Fish Targeting"),
            (PanelType.AUTOMATION, "🤖", "Automation"),
            (PanelType.NOTIFICATIONS, "🔔", "Notifications"),
            (PanelType.COMPETITION, "🏆", "Competition Mode"),
            (PanelType.MACROS, "⚡", "Macro System"),
            (PanelType.MONITORING, "📊", "System Monitor"),
            (PanelType.CONSOLE, "💻", "Console Output"),
            (PanelType.KEYBINDS, "⌨️", "Key Bindings"),
            (PanelType.WEATHER, "🌤️", "Weather & Time"),
            (PanelType.TECHNIQUES, "🎯", "Fishing Techniques"),
            (PanelType.HELPERS, "🛠️", "Helper Tools"),
        ]
        
        for panel_type, icon, tooltip in panel_icons:
            icon_btn = SidebarIcon(panel_type.value, icon, tooltip)
            icon_btn.icon_clicked.connect(self.toggle_panel)
            self.icon_group.addButton(icon_btn)
            layout.addWidget(icon_btn)
        
        layout.addStretch()
        
        # Bottom buttons
        settings_btn = QToolButton()
        settings_btn.setText("⚙️")
        settings_btn.setToolTip("Settings")
        settings_btn.setFixedSize(36, 36)
        layout.addWidget(settings_btn)
        
        help_btn = QToolButton()
        help_btn.setText("❓")
        help_btn.setToolTip("Help")
        help_btn.setFixedSize(36, 36)
        layout.addWidget(help_btn)
        
        return sidebar
    
    def create_menu_bar(self):
        """Create the application menu bar"""
        menubar = self.menuBar()
        
        # File menu
        file_menu = menubar.addMenu("File")
        file_menu.addAction("New Profile", self.new_profile)
        file_menu.addAction("Load Profile", self.load_profile)
        file_menu.addAction("Save Profile", self.save_profile)
        file_menu.addSeparator()
        file_menu.addAction("Import Settings", self.import_settings)
        file_menu.addAction("Export Settings", self.export_settings)
        file_menu.addSeparator()
        file_menu.addAction("Exit", self.close)
        
        # View menu
        view_menu = menubar.addMenu("View")
        view_menu.addAction("Reset Layout", self.reset_layout)
        view_menu.addAction("Save Layout", self.save_layout)
        view_menu.addSeparator()
        view_menu.addAction("Toggle All Panels", self.toggle_all_panels)
        
        # Tools menu
        tools_menu = menubar.addMenu("Tools")
        tools_menu.addAction("Spot Analyzer", self.open_spot_analyzer)
        tools_menu.addAction("Statistics Viewer", self.open_statistics)
        tools_menu.addAction("Rig Builder", self.open_rig_builder)
        tools_menu.addSeparator()
        tools_menu.addAction("Options", self.open_options)
        
        # Help menu
        help_menu = menubar.addMenu("Help")
        help_menu.addAction("Documentation", self.open_documentation)
        help_menu.addAction("Video Tutorials", self.open_tutorials)
        help_menu.addSeparator()
        help_menu.addAction("Check for Updates", self.check_updates)
        help_menu.addAction("About RF4S", self.show_about)
    
    def create_status_bar(self):
        """Create the application status bar"""
        status_bar = self.statusBar()
        
        # Status message
        self.status_label = QLabel("Ready")
        status_bar.addWidget(self.status_label)
        
        # Separator
        status_bar.addPermanentWidget(QFrame())
        
        # Connection status
        self.connection_label = QLabel("⚫ Disconnected")
        self.connection_label.setStyleSheet("color: #f44336;")
        status_bar.addPermanentWidget(self.connection_label)
        
        # Session time
        self.session_label = QLabel("Session: 00:00:00")
        status_bar.addPermanentWidget(self.session_label)
        
        # Fish count
        self.fish_count_label = QLabel("Fish: 0")
        status_bar.addPermanentWidget(self.fish_count_label)
        
        # Version
        version_label = QLabel("v3.0.0")
        version_label.setStyleSheet("color: #666666;")
        status_bar.addPermanentWidget(version_label)
    
    def setup_theme(self):
        """Apply the dark theme to the application"""
        self.setStyleSheet(RF4STheme.get_stylesheet())
    
    def load_default_layout(self):
        """Load the default panel layout"""
        default_panels = [
            PanelType.SCRIPT_CONFIG,
            PanelType.PROFILES,
            PanelType.MONITORING,
            PanelType.CONSOLE
        ]
        
        for i, panel_type in enumerate(default_panels):
            self.show_panel(panel_type.value)
            if panel_type.value in self.active_panels:
                panel = self.active_panels[panel_type.value]
                row = i // 2
                col = i % 2
                panel.move(10 + col * 340, 10 + row * 420)
    
    @Slot(str)
    def toggle_panel(self, panel_id: str):
        """Toggle panel visibility"""
        if panel_id in self.active_panels:
            self.hide_panel(panel_id)
        else:
            self.show_panel(panel_id)
    
    def show_panel(self, panel_id: str):
        """Show a panel"""
        if panel_id not in self.active_panels:
            panel = self.panel_manager.create_panel(panel_id, self.panel_container)
            if panel:
                self.active_panels[panel_id] = panel
                
                # Connect panel signals
                panel.panel_closed.connect(self.hide_panel)
                panel.panel_moved.connect(self.save_panel_position)
                
                # Position panel
                if panel_id in self.panel_positions:
                    panel.move(self.panel_positions[panel_id])
                else:
                    # Find empty position
                    x, y = self.find_empty_position()
                    panel.move(x, y)
                
                panel.show()
                
                # Update sidebar icon
                self.update_sidebar_icon(panel_id, True)
    
    def hide_panel(self, panel_id: str):
        """Hide a panel"""
        if panel_id in self.active_panels:
            panel = self.active_panels[panel_id]
            panel.hide()
            del self.active_panels[panel_id]
            
            # Update sidebar icon
            self.update_sidebar_icon(panel_id, False)
    
    def update_sidebar_icon(self, panel_id: str, checked: bool):
        """Update sidebar icon state"""
        for button in self.icon_group.buttons():
            if isinstance(button, SidebarIcon) and button.panel_id == panel_id:
                button.setChecked(checked)
                break
    
    def save_panel_position(self, panel_id: str, position: QPoint):
        """Save panel position"""
        self.panel_positions[panel_id] = position
    
    def find_empty_position(self) -> tuple:
        """Find an empty position for a new panel"""
        occupied_positions = set()
        for panel in self.active_panels.values():
            occupied_positions.add((panel.x(), panel.y()))
        
        # Grid positioning
        for row in range(3):
            for col in range(4):
                x = 10 + col * 340
                y = 10 + row * 420
                if (x, y) not in occupied_positions:
                    return x, y
        
        # Default position if grid is full
        return 10, 10
    
    def toggle_all_panels(self):
        """Toggle all panels visibility"""
        if self.active_panels:
            # Hide all panels
            panels_to_hide = list(self.active_panels.keys())
            for panel_id in panels_to_hide:
                self.hide_panel(panel_id)
        else:
            # Show default panels
            self.load_default_layout()
    
    def reset_layout(self):
        """Reset to default layout"""
        # Hide all panels
        panels_to_hide = list(self.active_panels.keys())
        for panel_id in panels_to_hide:
            self.hide_panel(panel_id)
        
        # Clear saved positions
        self.panel_positions.clear()
        
        # Load default layout
        self.load_default_layout()
    
    def save_layout(self):
        """Save current layout"""
        layout_data = {
            "panels": list(self.active_panels.keys()),
            "positions": {
                panel_id: (panel.x(), panel.y())
                for panel_id, panel in self.active_panels.items()
            }
        }
        
        # Save to file
        with open("layout.json", "w") as f:
            json.dump(layout_data, f, indent=2)
        
        self.status_label.setText("Layout saved")
        QTimer.singleShot(2000, lambda: self.status_label.setText("Ready"))
    
    # Menu action implementations
    def new_profile(self):
        self.status_label.setText("Creating new profile...")
    
    def load_profile(self):
        self.status_label.setText("Loading profile...")
    
    def save_profile(self):
        self.status_label.setText("Saving profile...")
    
    def import_settings(self):
        self.status_label.setText("Importing settings...")
    
    def export_settings(self):
        self.status_label.setText("Exporting settings...")
    
    def open_spot_analyzer(self):
        self.status_label.setText("Opening spot analyzer...")
    
    def open_statistics(self):
        self.status_label.setText("Opening statistics viewer...")
    
    def open_rig_builder(self):
        self.status_label.setText("Opening rig builder...")
    
    def open_options(self):
        self.status_label.setText("Opening options...")
    
    def open_documentation(self):
        self.status_label.setText("Opening documentation...")
    
    def open_tutorials(self):
        self.status_label.setText("Opening video tutorials...")
    
    def check_updates(self):
        self.status_label.setText("Checking for updates...")
    
    def show_about(self):
        self.status_label.setText("RF4S Professional v3.0.0")


def main():
    """Main application entry point"""
    app = QApplication(sys.argv)
    app.setApplicationName("RF4S Professional")
    app.setOrganizationName("RF4S Development Team")
    
    # Set application icon
    app.setWindowIcon(QIcon("icon.png"))
    
    # Create and show main window
    window = RF4SMainWindow()
    window.show()
    
    # Start event loop
    sys.exit(app.exec())


if __name__ == "__main__":
    main()