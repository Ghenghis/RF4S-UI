
# UI Component Specifications - RF4S Bot Control

## Overview
This document provides detailed specifications for all UI components, their properties, styling, animations, and interactions for the PySide6 implementation.

## Component Hierarchy and Structure

### Main Application Window

```python
# ui/main_window.py - Complete Specification
class MainWindow(FluentWindow):
    def __init__(self):
        super().__init__()
        # Window Properties
        self.setWindowTitle("RF4S Bot Control")
        self.setMinimumSize(1200, 800)
        self.setWindowIcon(QIcon("resources/icons/rf4s_icon.png"))
        
        # Window Flags and Attributes
        self.setWindowFlags(Qt.Window | Qt.WindowMinimizeButtonHint | 
                          Qt.WindowMaximizeButtonHint | Qt.WindowCloseButtonHint)
        
        # Apply window styling
        self.setStyleSheet(self.get_window_style())
        
    def get_window_style(self) -> str:
        return """
        FluentWindow {
            background-color: #111827;
            border: 1px solid #374151;
        }
        FluentWindow::title {
            background-color: #1F2937;
            color: white;
            font-size: 14px;
            font-weight: 600;
            padding: 8px 16px;
        }
        """
```

### Header Component Specifications

```python
# ui/components/header.py - Detailed Specifications
class HeaderWidget(QWidget):
    def __init__(self, state_manager):
        super().__init__()
        self.state_manager = state_manager
        self.setup_ui()
        
    def setup_ui(self):
        # Fixed dimensions
        self.setFixedHeight(80)
        self.setMinimumWidth(800)
        
        # Main layout
        main_layout = QHBoxLayout(self)
        main_layout.setContentsMargins(16, 12, 16, 12)
        main_layout.setSpacing(20)
        
        # Brand section
        brand_section = self.create_brand_section()
        main_layout.addWidget(brand_section)
        
        # Central spacer
        main_layout.addStretch()
        
        # Status grid
        status_grid = self.create_status_grid()
        main_layout.addWidget(status_grid)
        
        # Connection indicator
        connection_indicator = self.create_connection_indicator()
        main_layout.addWidget(connection_indicator)
        
    def create_brand_section(self) -> QWidget:
        """Create brand logo and title section"""
        brand_widget = QWidget()
        brand_widget.setFixedSize(200, 56)
        
        layout = QHBoxLayout(brand_widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(12)
        
        # Logo container
        logo_container = QWidget()
        logo_container.setFixedSize(40, 40)
        logo_container.setStyleSheet("""
            QWidget {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 #F97316, stop:1 #DC2626);
                border-radius: 8px;
            }
        """)
        
        # Logo text
        logo_layout = QVBoxLayout(logo_container)
        logo_layout.setContentsMargins(0, 0, 0, 0)
        
        logo_text = QLabel("RF4S")
        logo_text.setAlignment(Qt.AlignCenter)
        logo_text.setStyleSheet("""
            QLabel {
                color: white;
                font-size: 12px;
                font-weight: bold;
                background: transparent;
            }
        """)
        logo_layout.addWidget(logo_text)
        
        layout.addWidget(logo_container)
        
        # Title section
        title_layout = QVBoxLayout()
        title_layout.setSpacing(2)
        
        main_title = QLabel("RF4S Bot Control")
        main_title.setStyleSheet("""
            QLabel {
                color: white;
                font-size: 16px;
                font-weight: 700;
            }
        """)
        
        subtitle = QLabel("Fishing Automation System")
        subtitle.setStyleSheet("""
            QLabel {
                color: #9CA3AF;
                font-size: 11px;
                font-weight: 400;
            }
        """)
        
        title_layout.addWidget(main_title)
        title_layout.addWidget(subtitle)
        
        layout.addLayout(title_layout)
        
        return brand_widget
        
    def create_status_grid(self) -> QWidget:
        """Create 2x2 status grid"""
        grid_widget = QWidget()
        grid_widget.setFixedSize(220, 60)
        
        grid_layout = QGridLayout(grid_widget)
        grid_layout.setContentsMargins(0, 0, 0, 0)
        grid_layout.setSpacing(4)
        
        # Status indicators
        self.rf4s_status = self.create_status_indicator("RF4S", "dot")
        self.game_status = self.create_status_indicator("Game", "dot")
        self.script_status = self.create_status_indicator("Script", "dot")
        self.time_status = self.create_status_indicator("Time", "text", "00:00")
        
        grid_layout.addWidget(self.rf4s_status, 0, 0)
        grid_layout.addWidget(self.game_status, 0, 1)
        grid_layout.addWidget(self.script_status, 1, 0)
        grid_layout.addWidget(self.time_status, 1, 1)
        
        return grid_widget
        
    def create_status_indicator(self, label: str, type: str, initial_value: str = "") -> QWidget:
        """Create individual status indicator"""
        indicator = QWidget()
        indicator.setFixedSize(105, 28)
        indicator.setStyleSheet("""
            QWidget {
                background-color: rgba(55, 65, 81, 0.4);
                border: 1px solid rgba(75, 85, 99, 0.3);
                border-radius: 6px;
            }
        """)
        
        layout = QHBoxLayout(indicator)
        layout.setContentsMargins(8, 4, 8, 4)
        layout.setSpacing(6)
        
        # Label
        label_widget = QLabel(label)
        label_widget.setStyleSheet("""
            QLabel {
                color: #D1D5DB;
                font-size: 10px;
                font-weight: 500;
                background: transparent;
                border: none;
            }
        """)
        layout.addWidget(label_widget)
        
        layout.addStretch()
        
        # Status element
        if type == "dot":
            status_dot = QLabel()
            status_dot.setFixedSize(8, 8)
            status_dot.setStyleSheet("""
                QLabel {
                    background-color: #6B7280;
                    border-radius: 4px;
                    border: none;
                }
            """)
            layout.addWidget(status_dot)
            indicator.status_element = status_dot
        else:  # text
            status_text = QLabel(initial_value)
            status_text.setStyleSheet("""
                QLabel {
                    color: white;
                    font-size: 10px;
                    font-family: 'Consolas', 'Monaco', monospace;
                    background: transparent;
                    border: none;
                }
            """)
            layout.addWidget(status_text)
            indicator.status_element = status_text
            
        return indicator
        
    def create_connection_indicator(self) -> QWidget:
        """Create connection status indicator"""
        conn_widget = QWidget()
        conn_widget.setFixedSize(140, 56)
        
        layout = QVBoxLayout(conn_widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(4)
        
        # Connection status
        status_layout = QHBoxLayout()
        status_layout.setSpacing(6)
        
        self.connection_dot = QLabel()
        self.connection_dot.setFixedSize(6, 6)
        self.connection_dot.setStyleSheet("""
            QLabel {
                background-color: #EF4444;
                border-radius: 3px;
            }
        """)
        
        self.connection_text = QLabel("Disconnected")
        self.connection_text.setStyleSheet("""
            QLabel {
                color: #F87171;
                font-size: 11px;
                font-weight: 500;
            }
        """)
        
        status_layout.addWidget(self.connection_dot)
        status_layout.addWidget(self.connection_text)
        status_layout.addStretch()
        
        layout.addLayout(status_layout)
        
        # Additional info
        self.info_text = QLabel("0 panels active")
        self.info_text.setStyleSheet("""
            QLabel {
                color: #6B7280;
                font-size: 9px;
            }
        """)
        layout.addWidget(self.info_text)
        
        return conn_widget
```

### Icon Bar Component Specifications

```python
# ui/components/icon_bar.py - Complete Specifications
class IconButton(QPushButton):
    def __init__(self, panel_config, state_manager):
        super().__init__()
        self.panel_config = panel_config
        self.state_manager = state_manager
        self.hover_animation = None
        self.press_animation = None
        self.setup_button()
        
    def setup_button(self):
        # Button dimensions and properties
        self.setFixedSize(64, 80)
        self.setCheckable(True)
        self.setChecked(self.panel_config.visible)
        
        # Icon setup
        self.setup_icon()
        
        # Text setup
        self.setText(self.get_button_text())
        
        # Styling
        self.setStyleSheet(self.get_button_style())
        
        # Animations
        self.setup_animations()
        
        # Tooltip
        self.setToolTip(self.get_tooltip_text())
        
    def setup_icon(self):
        """Setup button icon"""
        icon_name = self.get_icon_name()
        icon_color = self.get_icon_color()
        
        # Use qtawesome for consistent icons
        icon = qta.icon(f'fa5s.{icon_name}', color=icon_color)
        self.setIcon(icon)
        self.setIconSize(QSize(20, 20))
        
    def get_button_text(self) -> str:
        """Get shortened button text"""
        text = self.panel_config.label
        # Shorten text if too long
        if len(text) > 8:
            words = text.split()
            if len(words) > 1:
                return f"{words[0][:4]}\n{words[1][:4]}"
            else:
                return f"{text[:4]}\n{text[4:8]}" if len(text) > 4 else text
        return text
        
    def get_button_style(self) -> str:
        """Get button stylesheet"""
        category_color = self.get_category_color()
        
        return f"""
        QPushButton {{
            border: none;
            border-radius: 10px;
            background-color: transparent;
            color: #9CA3AF;
            font-size: 9px;
            font-weight: 500;
            text-align: center;
            padding: 6px 4px;
        }}
        QPushButton:hover {{
            background-color: rgba({self.hex_to_rgb(category_color)}, 0.15);
            color: white;
            transform: scale(1.05);
        }}
        QPushButton:checked {{
            background-color: rgba(55, 65, 81, 0.8);
            color: white;
            border: 1px solid rgba({self.hex_to_rgb(category_color)}, 0.4);
        }}
        QPushButton:pressed {{
            background-color: rgba({self.hex_to_rgb(category_color)}, 0.25);
            transform: scale(0.95);
        }}
        QPushButton::after {{
            content: "";
            position: absolute;
            top: 4px;
            right: 4px;
            width: 6px;
            height: 6px;
            border-radius: 3px;
            background-color: {category_color};
        }}
        """
        
    def setup_animations(self):
        """Setup button animations"""
        # Hover animation
        self.hover_animation = QPropertyAnimation(self, b"geometry")
        self.hover_animation.setDuration(150)
        self.hover_animation.setEasingCurve(QEasingCurve.OutCubic)
        
        # Press animation
        self.press_animation = QPropertyAnimation(self, b"geometry")
        self.press_animation.setDuration(100)
        self.press_animation.setEasingCurve(QEasingCurve.OutBack)
        
    def animate_hover_enter(self):
        """Animate button on hover enter"""
        current_geo = self.geometry()
        center = current_geo.center()
        
        new_size = QSize(int(64 * 1.05), int(80 * 1.05))
        new_geo = QRect(0, 0, new_size.width(), new_size.height())
        new_geo.moveCenter(center)
        
        self.hover_animation.setStartValue(current_geo)
        self.hover_animation.setEndValue(new_geo)
        self.hover_animation.start()
        
    def animate_hover_leave(self):
        """Animate button on hover leave"""
        current_geo = self.geometry()
        center = current_geo.center()
        
        new_geo = QRect(0, 0, 64, 80)
        new_geo.moveCenter(center)
        
        self.hover_animation.setStartValue(current_geo)
        self.hover_animation.setEndValue(new_geo)
        self.hover_animation.start()
        
    def animate_press(self):
        """Animate button press"""
        current_geo = self.geometry()
        center = current_geo.center()
        
        # Scale down
        pressed_size = QSize(int(64 * 0.95), int(80 * 0.95))
        pressed_geo = QRect(0, 0, pressed_size.width(), pressed_size.height())
        pressed_geo.moveCenter(center)
        
        self.press_animation.setStartValue(current_geo)
        self.press_animation.setEndValue(pressed_geo)
        self.press_animation.finished.connect(self.animate_release)
        self.press_animation.start()
        
    def animate_release(self):
        """Animate button release"""
        current_geo = self.geometry()
        center = current_geo.center()
        
        # Scale back to normal
        normal_geo = QRect(0, 0, 64, 80)
        normal_geo.moveCenter(center)
        
        self.press_animation.setStartValue(current_geo)
        self.press_animation.setEndValue(normal_geo)
        self.press_animation.start()
        
    def get_category_color(self) -> str:
        """Get category color"""
        colors = {
            'main': '#10B981',      # Green
            'settings': '#F59E0B',  # Yellow
            'tools': '#3B82F6',     # Blue
            'smart': '#8B5CF6',     # Purple
            'ai': '#EC4899'         # Pink
        }
        return colors.get(self.panel_config.category, '#6B7280')
        
    def get_icon_name(self) -> str:
        """Map icon names to FontAwesome"""
        mapping = {
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
        return mapping.get(self.panel_config.icon, 'square')
        
    def get_icon_color(self) -> str:
        """Get icon color based on state"""
        if self.isChecked():
            return '#FFFFFF'
        return '#9CA3AF'
        
    def get_tooltip_text(self) -> str:
        """Get tooltip text"""
        return f"{self.panel_config.label}\nCategory: {self.panel_config.category.title()}\nClick to toggle panel"
        
    def hex_to_rgb(self, hex_color: str) -> str:
        """Convert hex color to RGB string"""
        hex_color = hex_color.lstrip('#')
        return ', '.join(str(int(hex_color[i:i+2], 16)) for i in (0, 2, 4))
        
    # Event overrides
    def enterEvent(self, event):
        super().enterEvent(event)
        self.animate_hover_enter()
        
    def leaveEvent(self, event):
        super().leaveEvent(event)
        self.animate_hover_leave()
        
    def mousePressEvent(self, event):
        super().mousePressEvent(event)
        self.animate_press()
```

### Panel Container Specifications

```python
# ui/components/panels/panel_container.py
class PanelContainer(QWidget):
    def __init__(self, panel_widget, panel_id: str):
        super().__init__()
        self.panel_widget = panel_widget
        self.panel_id = panel_id
        self.is_focused = False
        self.resize_handle = None
        self.setup_container()
        
    def setup_container(self):
        # Container styling
        self.setStyleSheet(self.get_container_style())
        
        # Layout
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        
        # Add panel widget
        layout.addWidget(self.panel_widget)
        
        # Add resize handle
        self.setup_resize_handle()
        
    def get_container_style(self) -> str:
        """Get container stylesheet"""
        return """
        PanelContainer {
            background-color: #111827;
            border: 1px solid #374151;
            border-radius: 12px;
            margin: 4px;
        }
        PanelContainer:focus {
            border: 2px solid #3B82F6;
        }
        PanelContainer[focused="true"] {
            border: 2px solid #10B981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        """
        
    def setup_resize_handle(self):
        """Setup resize handle"""
        self.resize_handle = QWidget()
        self.resize_handle.setFixedHeight(4)
        self.resize_handle.setCursor(Qt.SizeVerCursor)
        self.resize_handle.setStyleSheet("""
            QWidget {
                background-color: transparent;
            }
            QWidget:hover {
                background-color: #3B82F6;
            }
        """)
        
        # Add to layout
        self.layout().addWidget(self.resize_handle)
        
    def set_focus_state(self, focused: bool):
        """Set focus state"""
        self.is_focused = focused
        self.setProperty("focused", focused)
        self.style().unpolish(self)
        self.style().polish(self)
        
    def animate_focus_change(self, focused: bool):
        """Animate focus state change"""
        self.focus_animation = QPropertyAnimation(self, b"geometry")
        self.focus_animation.setDuration(200)
        self.focus_animation.setEasingCurve(QEasingCurve.OutCubic)
        
        current_geo = self.geometry()
        
        if focused:
            # Slight scale up when focused
            new_geo = current_geo.adjusted(-2, -2, 2, 2)
        else:
            # Scale back to normal
            new_geo = current_geo.adjusted(2, 2, -2, -2)
            
        self.focus_animation.setStartValue(current_geo)
        self.focus_animation.setEndValue(new_geo)
        self.focus_animation.start()
```

### Workspace Layout Specifications

```python
# ui/components/workspace.py - Layout Specifications
class WorkspaceLayoutManager:
    def __init__(self, workspace_widget):
        self.workspace = workspace_widget
        self.current_layout = 1
        self.panel_groups = []
        self.layout_animations = {}
        
    def organize_panels_for_layout(self, layout_type: int, visible_panels: List[str]):
        """Organize panels based on layout type"""
        if layout_type == 1:
            return [visible_panels]  # Single column
        elif layout_type == 2:
            return self.split_into_groups(visible_panels, 2)
        else:  # layout_type == 3
            return self.split_into_groups(visible_panels, 3)
            
    def split_into_groups(self, panels: List[str], num_groups: int) -> List[List[str]]:
        """Split panels into groups"""
        if not panels:
            return []
            
        base_size = len(panels) // num_groups
        remainder = len(panels) % num_groups
        
        groups = []
        start_idx = 0
        
        for i in range(num_groups):
            group_size = base_size + (1 if i < remainder else 0)
            if start_idx < len(panels):
                groups.append(panels[start_idx:start_idx + group_size])
                start_idx += group_size
                
        return [group for group in groups if group]
        
    def animate_layout_change(self, old_layout: int, new_layout: int):
        """Animate layout transition"""
        self.layout_transition = QPropertyAnimation()
        self.layout_transition.setDuration(300)
        self.layout_transition.setEasingCurve(QEasingCurve.OutCubic)
        
        # Fade out current layout
        self.fade_out_animation = QGraphicsOpacityEffect()
        self.workspace.setGraphicsEffect(self.fade_out_animation)
        
        self.opacity_animation = QPropertyAnimation(self.fade_out_animation, b"opacity")
        self.opacity_animation.setDuration(150)
        self.opacity_animation.setStartValue(1.0)
        self.opacity_animation.setEndValue(0.3)
        self.opacity_animation.finished.connect(self.apply_new_layout)
        self.opacity_animation.start()
        
    def apply_new_layout(self):
        """Apply new layout after fade out"""
        # Reorganize panels
        self.workspace.reorganize_panels()
        
        # Fade back in
        self.opacity_animation.setStartValue(0.3)
        self.opacity_animation.setEndValue(1.0)
        self.opacity_animation.finished.disconnect()
        self.opacity_animation.start()
```

### Custom Widget Specifications

#### Slider with Value Display

```python
# ui/widgets/value_slider.py
class ValueSlider(QWidget):
    valueChanged = pyqtSignal(float)
    
    def __init__(self, minimum=0, maximum=100, initial_value=50, suffix="", decimals=0):
        super().__init__()
        self.minimum = minimum
        self.maximum = maximum
        self.suffix = suffix
        self.decimals = decimals
        self.setup_ui(initial_value)
        
    def setup_ui(self, initial_value):
        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(12)
        
        # Slider
        self.slider = QSlider(Qt.Horizontal)
        self.slider.setMinimum(int(self.minimum * (10 ** self.decimals)))
        self.slider.setMaximum(int(self.maximum * (10 ** self.decimals)))
        self.slider.setValue(int(initial_value * (10 ** self.decimals)))
        self.slider.setStyleSheet(self.get_slider_style())
        
        # Value display
        self.value_label = QLabel()
        self.value_label.setFixedWidth(60)
        self.value_label.setAlignment(Qt.AlignCenter)
        self.value_label.setStyleSheet("""
            QLabel {
                background-color: #374151;
                border: 1px solid #4B5563;
                border-radius: 4px;
                padding: 4px 8px;
                color: white;
                font-family: monospace;
                font-size: 11px;
            }
        """)
        
        layout.addWidget(self.slider, 1)
        layout.addWidget(self.value_label)
        
        # Connect signals
        self.slider.valueChanged.connect(self.on_slider_changed)
        self.update_value_display()
        
    def get_slider_style(self) -> str:
        return """
        QSlider::groove:horizontal {
            border: 1px solid #4B5563;
            height: 6px;
            background: #374151;
            border-radius: 3px;
        }
        QSlider::handle:horizontal {
            background: #3B82F6;
            border: 2px solid #1E40AF;
            width: 16px;
            height: 16px;
            border-radius: 8px;
            margin: -6px 0;
        }
        QSlider::handle:horizontal:hover {
            background: #60A5FA;
            border: 2px solid #3B82F6;
        }
        QSlider::handle:horizontal:pressed {
            background: #1E40AF;
        }
        QSlider::sub-page:horizontal {
            background: #3B82F6;
            border-radius: 3px;
        }
        """
        
    def on_slider_changed(self, value):
        real_value = value / (10 ** self.decimals)
        self.update_value_display()
        self.valueChanged.emit(real_value)
        
    def update_value_display(self):
        value = self.slider.value() / (10 ** self.decimals)
        if self.decimals == 0:
            text = f"{int(value)}{self.suffix}"
        else:
            text = f"{value:.{self.decimals}f}{self.suffix}"
        self.value_label.setText(text)
        
    def setValue(self, value):
        self.slider.setValue(int(value * (10 ** self.decimals)))
        
    def value(self):
        return self.slider.value() / (10 ** self.decimals)
```

#### Progress Bar with Animation

```python
# ui/widgets/animated_progress.py
class AnimatedProgressBar(QProgressBar):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.animation = QPropertyAnimation(self, b"value")
        self.animation.setDuration(500)
        self.animation.setEasingCurve(QEasingCurve.OutCubic)
        self.setup_styling()
        
    def setup_styling(self):
        self.setStyleSheet("""
        QProgressBar {
            border: 1px solid #4B5563;
            border-radius: 6px;
            background-color: #374151;
            text-align: center;
            color: white;
            font-size: 11px;
            font-weight: 500;
        }
        QProgressBar::chunk {
            background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                stop:0 #3B82F6, stop:1 #1E40AF);
            border-radius: 5px;
        }
        """)
        
    def setValueAnimated(self, value):
        """Set value with animation"""
        self.animation.setStartValue(self.value())
        self.animation.setEndValue(value)
        self.animation.start()
```

#### Toggle Switch

```python
# ui/widgets/toggle_switch.py
class ToggleSwitch(QCheckBox):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setFixedSize(50, 24)
        self.setup_styling()
        
    def setup_styling(self):
        self.setStyleSheet("""
        QCheckBox {
            spacing: 0px;
        }
        QCheckBox::indicator {
            width: 50px;
            height: 24px;
            border-radius: 12px;
            background-color: #4B5563;
            border: 2px solid #6B7280;
        }
        QCheckBox::indicator:checked {
            background-color: #10B981;
            border: 2px solid #059669;
        }
        QCheckBox::indicator::before {
            content: "";
            width: 16px;
            height: 16px;
            border-radius: 8px;
            background-color: white;
            position: absolute;
            left: 4px;
            top: 4px;
            transition: left 0.3s ease;
        }
        QCheckBox::indicator:checked::before {
            left: 30px;
        }
        """)
```

This comprehensive UI component specification provides detailed implementation guidelines for creating all visual elements of the RF4S Bot Control interface using PySide6 and Fluent Widgets.
