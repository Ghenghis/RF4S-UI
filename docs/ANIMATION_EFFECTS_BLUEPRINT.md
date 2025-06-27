
# Animation and Effects Blueprint - RF4S Bot Control

## Overview
This document provides comprehensive specifications for all animations, transitions, visual effects, and interactive feedback systems in the RF4S Bot Control PySide6 application.

## Animation Framework

### Core Animation System

```python
# ui/animations/animation_manager.py
from PySide6.QtCore import (QPropertyAnimation, QSequentialAnimationGroup, 
                           QParallelAnimationGroup, QEasingCurve, QTimer, pyqtSignal)
from PySide6.QtWidgets import QGraphicsOpacityEffect, QGraphicsDropShadowEffect
from PySide6.QtGui import QColor
from enum import Enum
from typing import Dict, List, Callable

class AnimationType(Enum):
    FADE_IN = "fade_in"
    FADE_OUT = "fade_out"
    SLIDE_IN = "slide_in"
    SLIDE_OUT = "slide_out"
    SCALE_UP = "scale_up"
    SCALE_DOWN = "scale_down"
    BOUNCE = "bounce"
    SHAKE = "shake"
    GLOW = "glow"
    PULSE = "pulse"

class AnimationManager(QObject):
    animation_started = pyqtSignal(str, str)  # widget_id, animation_type
    animation_finished = pyqtSignal(str, str)
    animation_interrupted = pyqtSignal(str, str)
    
    def __init__(self):
        super().__init__()
        self.active_animations: Dict[str, QPropertyAnimation] = {}
        self.animation_groups: Dict[str, QSequentialAnimationGroup] = {}
        self.effects: Dict[str, QGraphicsEffect] = {}
        
    def fade_in(self, widget, duration=300, easing=QEasingCurve.OutCubic, 
                start_opacity=0.0, end_opacity=1.0, callback=None):
        """Fade in animation"""
        widget_id = self.get_widget_id(widget)
        
        # Create opacity effect if doesn't exist
        if widget_id not in self.effects:
            effect = QGraphicsOpacityEffect()
            widget.setGraphicsEffect(effect)
            self.effects[widget_id] = effect
        else:
            effect = self.effects[widget_id]
            
        # Create animation
        animation = QPropertyAnimation(effect, b"opacity")
        animation.setDuration(duration)
        animation.setEasingCurve(easing)
        animation.setStartValue(start_opacity)
        animation.setEndValue(end_opacity)
        
        # Connect signals
        animation.started.connect(lambda: self.animation_started.emit(widget_id, "fade_in"))
        animation.finished.connect(lambda: self.animation_finished.emit(widget_id, "fade_in"))
        if callback:
            animation.finished.connect(callback)
            
        # Store and start
        self.active_animations[f"{widget_id}_fade"] = animation
        animation.start()
        
        return animation
        
    def fade_out(self, widget, duration=300, easing=QEasingCurve.OutCubic,
                 start_opacity=1.0, end_opacity=0.0, callback=None):
        """Fade out animation"""
        widget_id = self.get_widget_id(widget)
        
        if widget_id not in self.effects:
            effect = QGraphicsOpacityEffect()
            widget.setGraphicsEffect(effect)
            self.effects[widget_id] = effect
        else:
            effect = self.effects[widget_id]
            
        animation = QPropertyAnimation(effect, b"opacity")
        animation.setDuration(duration)
        animation.setEasingCurve(easing)
        animation.setStartValue(start_opacity)
        animation.setEndValue(end_opacity)
        
        animation.started.connect(lambda: self.animation_started.emit(widget_id, "fade_out"))
        animation.finished.connect(lambda: self.animation_finished.emit(widget_id, "fade_out"))
        if callback:
            animation.finished.connect(callback)
            
        self.active_animations[f"{widget_id}_fade"] = animation
        animation.start()
        
        return animation
        
    def slide_in(self, widget, direction="left", duration=400, 
                 easing=QEasingCurve.OutCubic, distance=None, callback=None):
        """Slide in animation"""
        widget_id = self.get_widget_id(widget)
        
        current_pos = widget.pos()
        widget_size = widget.size()
        
        if distance is None:
            distance = widget_size.width() if direction in ["left", "right"] else widget_size.height()
            
        # Calculate start position
        if direction == "left":
            start_pos = QPoint(current_pos.x() - distance, current_pos.y())
        elif direction == "right":
            start_pos = QPoint(current_pos.x() + distance, current_pos.y())
        elif direction == "up":
            start_pos = QPoint(current_pos.x(), current_pos.y() - distance)
        else:  # down
            start_pos = QPoint(current_pos.x(), current_pos.y() + distance)
            
        # Set initial position
        widget.move(start_pos)
        
        # Create animation
        animation = QPropertyAnimation(widget, b"pos")
        animation.setDuration(duration)
        animation.setEasingCurve(easing)
        animation.setStartValue(start_pos)
        animation.setEndValue(current_pos)
        
        animation.started.connect(lambda: self.animation_started.emit(widget_id, "slide_in"))
        animation.finished.connect(lambda: self.animation_finished.emit(widget_id, "slide_in"))
        if callback:
            animation.finished.connect(callback)
            
        self.active_animations[f"{widget_id}_slide"] = animation
        animation.start()
        
        return animation
        
    def scale_animation(self, widget, scale_factor=1.1, duration=200, 
                       easing=QEasingCurve.OutBack, return_to_normal=True, callback=None):
        """Scale animation with optional return"""
        widget_id = self.get_widget_id(widget)
        
        current_geometry = widget.geometry()
        center = current_geometry.center()
        
        # Calculate scaled geometry
        new_width = int(current_geometry.width() * scale_factor)
        new_height = int(current_geometry.height() * scale_factor)
        scaled_geometry = QRect(0, 0, new_width, new_height)
        scaled_geometry.moveCenter(center)
        
        # Scale up animation
        scale_up = QPropertyAnimation(widget, b"geometry")
        scale_up.setDuration(duration)
        scale_up.setEasingCurve(easing)
        scale_up.setStartValue(current_geometry)
        scale_up.setEndValue(scaled_geometry)
        
        if return_to_normal:
            # Scale down animation
            scale_down = QPropertyAnimation(widget, b"geometry")
            scale_down.setDuration(duration)
            scale_down.setEasingCurve(QEasingCurve.OutCubic)
            scale_down.setStartValue(scaled_geometry)
            scale_down.setEndValue(current_geometry)
            
            # Create sequence
            sequence = QSequentialAnimationGroup()
            sequence.addAnimation(scale_up)
            sequence.addAnimation(scale_down)
            
            sequence.started.connect(lambda: self.animation_started.emit(widget_id, "scale"))
            sequence.finished.connect(lambda: self.animation_finished.emit(widget_id, "scale"))
            if callback:
                sequence.finished.connect(callback)
                
            self.animation_groups[f"{widget_id}_scale"] = sequence
            sequence.start()
            
            return sequence
        else:
            scale_up.started.connect(lambda: self.animation_started.emit(widget_id, "scale"))
            scale_up.finished.connect(lambda: self.animation_finished.emit(widget_id, "scale"))
            if callback:
                scale_up.finished.connect(callback)
                
            self.active_animations[f"{widget_id}_scale"] = scale_up
            scale_up.start()
            
            return scale_up
            
    def bounce_animation(self, widget, intensity=0.1, duration=600, callback=None):
        """Bounce animation effect"""
        widget_id = self.get_widget_id(widget)
        
        current_geometry = widget.geometry()
        center = current_geometry.center()
        
        # Calculate bounce positions
        bounce_height = int(current_geometry.height() * intensity)
        bounce_up = current_geometry.adjusted(0, -bounce_height, 0, -bounce_height)
        bounce_up.moveCenter(QPoint(center.x(), center.y() - bounce_height))
        
        # Create bounce sequence
        sequence = QSequentialAnimationGroup()
        
        # Up
        up_anim = QPropertyAnimation(widget, b"geometry")
        up_anim.setDuration(duration // 4)
        up_anim.setEasingCurve(QEasingCurve.OutQuad)
        up_anim.setStartValue(current_geometry)
        up_anim.setEndValue(bounce_up)
        
        # Down (with bounce)
        down_anim = QPropertyAnimation(widget, b"geometry")
        down_anim.setDuration(duration * 3 // 4)
        down_anim.setEasingCurve(QEasingCurve.OutBounce)
        down_anim.setStartValue(bounce_up)
        down_anim.setEndValue(current_geometry)
        
        sequence.addAnimation(up_anim)
        sequence.addAnimation(down_anim)
        
        sequence.started.connect(lambda: self.animation_started.emit(widget_id, "bounce"))
        sequence.finished.connect(lambda: self.animation_finished.emit(widget_id, "bounce"))
        if callback:
            sequence.finished.connect(callback)
            
        self.animation_groups[f"{widget_id}_bounce"] = sequence
        sequence.start()
        
        return sequence
        
    def shake_animation(self, widget, intensity=10, duration=500, callback=None):
        """Shake animation for error feedback"""
        widget_id = self.get_widget_id(widget)
        
        original_pos = widget.pos()
        
        # Create shake sequence
        sequence = QSequentialAnimationGroup()
        shake_count = 8
        single_duration = duration // shake_count
        
        for i in range(shake_count):
            shake_anim = QPropertyAnimation(widget, b"pos")
            shake_anim.setDuration(single_duration)
            shake_anim.setEasingCurve(QEasingCurve.Linear)
            
            if i % 2 == 0:
                shake_pos = QPoint(original_pos.x() + intensity, original_pos.y())
            else:
                shake_pos = QPoint(original_pos.x() - intensity, original_pos.y())
                
            shake_anim.setStartValue(widget.pos())
            shake_anim.setEndValue(shake_pos)
            sequence.addAnimation(shake_anim)
            
        # Return to original position
        return_anim = QPropertyAnimation(widget, b"pos")
        return_anim.setDuration(single_duration)
        return_anim.setStartValue(widget.pos())
        return_anim.setEndValue(original_pos)
        sequence.addAnimation(return_anim)
        
        sequence.started.connect(lambda: self.animation_started.emit(widget_id, "shake"))
        sequence.finished.connect(lambda: self.animation_finished.emit(widget_id, "shake"))
        if callback:
            sequence.finished.connect(callback)
            
        self.animation_groups[f"{widget_id}_shake"] = sequence
        sequence.start()
        
        return sequence
        
    def glow_effect(self, widget, color=QColor(59, 130, 246), duration=1000, 
                    intensity=20, callback=None):
        """Glow effect using drop shadow"""
        widget_id = self.get_widget_id(widget)
        
        # Create glow effect
        glow = QGraphicsDropShadowEffect()
        glow.setBlurRadius(0)
        glow.setColor(color)
        glow.setOffset(0, 0)
        widget.setGraphicsEffect(glow)
        
        # Animate glow intensity
        glow_anim = QPropertyAnimation(glow, b"blurRadius")
        glow_anim.setDuration(duration // 2)
        glow_anim.setEasingCurve(QEasingCurve.InOutSine)
        glow_anim.setStartValue(0)
        glow_anim.setEndValue(intensity)
        
        # Create pulsing effect
        sequence = QSequentialAnimationGroup()
        
        # Glow up
        glow_up = QPropertyAnimation(glow, b"blurRadius")
        glow_up.setDuration(duration // 2)
        glow_up.setEasingCurve(QEasingCurve.InOutSine)
        glow_up.setStartValue(0)
        glow_up.setEndValue(intensity)
        
        # Glow down
        glow_down = QPropertyAnimation(glow, b"blurRadius")
        glow_down.setDuration(duration // 2)
        glow_down.setEasingCurve(QEasingCurve.InOutSine)
        glow_down.setStartValue(intensity)
        glow_down.setEndValue(0)
        
        sequence.addAnimation(glow_up)
        sequence.addAnimation(glow_down)
        
        sequence.started.connect(lambda: self.animation_started.emit(widget_id, "glow"))
        sequence.finished.connect(lambda: self.animation_finished.emit(widget_id, "glow"))
        if callback:
            sequence.finished.connect(callback)
            
        self.effects[f"{widget_id}_glow"] = glow
        self.animation_groups[f"{widget_id}_glow"] = sequence
        sequence.start()
        
        return sequence
        
    def pulse_animation(self, widget, min_opacity=0.3, max_opacity=1.0, 
                       duration=1000, loops=-1, callback=None):
        """Continuous pulse animation"""
        widget_id = self.get_widget_id(widget)
        
        if widget_id not in self.effects:
            effect = QGraphicsOpacityEffect()
            widget.setGraphicsEffect(effect)
            self.effects[widget_id] = effect
        else:
            effect = self.effects[widget_id]
            
        # Create pulse animation
        pulse = QPropertyAnimation(effect, b"opacity")
        pulse.setDuration(duration)
        pulse.setEasingCurve(QEasingCurve.InOutSine)
        pulse.setStartValue(min_opacity)
        pulse.setEndValue(max_opacity)
        pulse.setLoopCount(loops)  # -1 for infinite
        
        pulse.started.connect(lambda: self.animation_started.emit(widget_id, "pulse"))
        if callback:
            pulse.finished.connect(callback)
            
        self.active_animations[f"{widget_id}_pulse"] = pulse
        pulse.start()
        
        return pulse
        
    def stop_animation(self, widget, animation_type=None):
        """Stop specific or all animations for a widget"""
        widget_id = self.get_widget_id(widget)
        
        if animation_type:
            key = f"{widget_id}_{animation_type}"
            if key in self.active_animations:
                self.active_animations[key].stop()
                del self.active_animations[key]
            if key in self.animation_groups:
                self.animation_groups[key].stop()
                del self.animation_groups[key]
        else:
            # Stop all animations for this widget
            keys_to_remove = [key for key in self.active_animations.keys() 
                            if key.startswith(widget_id)]
            for key in keys_to_remove:
                self.active_animations[key].stop()
                del self.active_animations[key]
                
            keys_to_remove = [key for key in self.animation_groups.keys() 
                            if key.startswith(widget_id)]
            for key in keys_to_remove:
                self.animation_groups[key].stop()
                del self.animation_groups[key]
                
    def get_widget_id(self, widget) -> str:
        """Generate unique widget identifier"""
        return f"{widget.__class__.__name__}_{id(widget)}"
        
    def cleanup_finished_animations(self):
        """Clean up finished animations"""
        finished_animations = [key for key, anim in self.active_animations.items() 
                             if anim.state() == QPropertyAnimation.Stopped]
        for key in finished_animations:
            del self.active_animations[key]
            
        finished_groups = [key for key, group in self.animation_groups.items() 
                          if group.state() == QSequentialAnimationGroup.Stopped]
        for key in finished_groups:
            del self.animation_groups[key]
```

## Specific Component Animations

### Panel Animations

```python
# ui/animations/panel_animations.py
class PanelAnimations:
    def __init__(self, animation_manager):
        self.animation_manager = animation_manager
        
    def animate_panel_show(self, panel_widget, direction="bottom"):
        """Animate panel appearance"""
        # Start with panel hidden
        panel_widget.setVisible(True)
        
        # Combine fade in with slide in
        parallel_group = QParallelAnimationGroup()
        
        # Fade in
        fade_anim = self.animation_manager.fade_in(panel_widget, duration=400)
        
        # Slide in
        slide_anim = self.animation_manager.slide_in(
            panel_widget, direction=direction, duration=400,
            easing=QEasingCurve.OutBack
        )
        
        parallel_group.addAnimation(fade_anim)
        parallel_group.addAnimation(slide_anim)
        parallel_group.start()
        
        return parallel_group
        
    def animate_panel_hide(self, panel_widget, direction="bottom", callback=None):
        """Animate panel disappearance"""
        parallel_group = QParallelAnimationGroup()
        
        # Fade out
        fade_anim = self.animation_manager.fade_out(panel_widget, duration=300)
        
        # Slide out
        slide_out_anim = self.create_slide_out_animation(
            panel_widget, direction, duration=300
        )
        
        parallel_group.addAnimation(fade_anim)
        parallel_group.addAnimation(slide_out_anim)
        
        if callback:
            parallel_group.finished.connect(callback)
        else:
            parallel_group.finished.connect(lambda: panel_widget.setVisible(False))
            
        parallel_group.start()
        return parallel_group
        
    def animate_panel_focus(self, panel_widget):
        """Animate panel gaining focus"""
        # Glow effect
        self.animation_manager.glow_effect(
            panel_widget, 
            color=QColor(16, 185, 129),  # Green glow
            duration=600,
            intensity=15
        )
        
        # Slight scale up
        self.animation_manager.scale_animation(
            panel_widget,
            scale_factor=1.02,
            duration=200,
            easing=QEasingCurve.OutCubic,
            return_to_normal=False
        )
        
    def animate_panel_blur(self, panel_widget):
        """Animate panel losing focus"""
        # Scale back to normal
        current_geo = panel_widget.geometry()
        center = current_geo.center()
        normal_geo = QRect(0, 0, 
                          int(current_geo.width() / 1.02), 
                          int(current_geo.height() / 1.02))
        normal_geo.moveCenter(center)
        
        scale_anim = QPropertyAnimation(panel_widget, b"geometry")
        scale_anim.setDuration(200)
        scale_anim.setEasingCurve(QEasingCurve.OutCubic)
        scale_anim.setStartValue(current_geo)
        scale_anim.setEndValue(normal_geo)
        scale_anim.start()
        
    def animate_panel_error(self, panel_widget):
        """Animate panel error state"""
        # Red glow + shake
        parallel_group = QParallelAnimationGroup()
        
        glow_anim = self.animation_manager.glow_effect(
            panel_widget,
            color=QColor(239, 68, 68),  # Red
            duration=800,
            intensity=20
        )
        
        shake_anim = self.animation_manager.shake_animation(
            panel_widget,
            intensity=8,
            duration=400
        )
        
        parallel_group.addAnimation(glow_anim)
        parallel_group.addAnimation(shake_anim)
        parallel_group.start()
        
        return parallel_group
        
    def animate_layout_transition(self, workspace_widget, old_layout, new_layout):
        """Animate workspace layout change"""
        # Create staggered fade out/in effect
        sequence = QSequentialAnimationGroup()
        
        # Fade out current panels
        fade_out = self.animation_manager.fade_out(
            workspace_widget, duration=200, end_opacity=0.3
        )
        
        # Brief pause
        pause_timer = QTimer()
        pause_timer.setSingleShot(True)
        
        # Reorganize layout (this would be called in the middle)
        def reorganize_and_fade_in():
            # Layout reorganization happens here
            workspace_widget.reorganize_panels()
            
            # Fade back in
            self.animation_manager.fade_in(
                workspace_widget, duration=300, start_opacity=0.3
            )
            
        fade_out.finished.connect(lambda: QTimer.singleShot(100, reorganize_and_fade_in))
        fade_out.start()
```

### Button and Control Animations

```python
# ui/animations/control_animations.py
class ControlAnimations:
    def __init__(self, animation_manager):
        self.animation_manager = animation_manager
        
    def animate_button_press(self, button):
        """Animate button press"""
        # Scale down and back up
        sequence = QSequentialAnimationGroup()
        
        current_geo = button.geometry()
        center = current_geo.center()
        
        # Scale down
        pressed_size = QSize(int(current_geo.width() * 0.95), 
                           int(current_geo.height() * 0.95))
        pressed_geo = QRect(0, 0, pressed_size.width(), pressed_size.height())
        pressed_geo.moveCenter(center)
        
        press_down = QPropertyAnimation(button, b"geometry")
        press_down.setDuration(100)
        press_down.setEasingCurve(QEasingCurve.OutQuad)
        press_down.setStartValue(current_geo)
        press_down.setEndValue(pressed_geo)
        
        # Scale back up
        press_up = QPropertyAnimation(button, b"geometry")
        press_up.setDuration(150)
        press_up.setEasingCurve(QEasingCurve.OutBack)
        press_up.setStartValue(pressed_geo)
        press_up.setEndValue(current_geo)
        
        sequence.addAnimation(press_down)
        sequence.addAnimation(press_up)
        sequence.start()
        
        return sequence
        
    def animate_button_hover(self, button, hover_in=True):
        """Animate button hover state"""
        if hover_in:
            # Glow and slight scale
            parallel_group = QParallelAnimationGroup()
            
            glow_anim = self.animation_manager.glow_effect(
                button, 
                color=QColor(59, 130, 246),
                duration=400,
                intensity=10
            )
            
            scale_anim = self.animation_manager.scale_animation(
                button,
                scale_factor=1.05,
                duration=200,
                return_to_normal=False
            )
            
            parallel_group.addAnimation(glow_anim)
            parallel_group.addAnimation(scale_anim)
            parallel_group.start()
            
            return parallel_group
        else:
            # Scale back to normal
            current_geo = button.geometry()
            center = current_geo.center()
            normal_size = QSize(int(current_geo.width() / 1.05), 
                              int(current_geo.height() / 1.05))
            normal_geo = QRect(0, 0, normal_size.width(), normal_size.height())
            normal_geo.moveCenter(center)
            
            scale_anim = QPropertyAnimation(button, b"geometry")
            scale_anim.setDuration(200)
            scale_anim.setEasingCurve(QEasingCurve.OutCubic)
            scale_anim.setStartValue(current_geo)
            scale_anim.setEndValue(normal_geo)
            scale_anim.start()
            
            return scale_anim
            
    def animate_slider_change(self, slider, value_label):
        """Animate slider value change"""
        # Pulse the value label
        self.animation_manager.scale_animation(
            value_label,
            scale_factor=1.2,
            duration=300,
            easing=QEasingCurve.OutBack
        )
        
        # Brief glow on slider handle
        self.animation_manager.glow_effect(
            slider,
            color=QColor(59, 130, 246),
            duration=500,
            intensity=8
        )
        
    def animate_toggle_switch(self, switch, checked=True):
        """Animate toggle switch state change"""
        # Color transition animation would be handled by stylesheet
        # Add bounce effect
        self.animation_manager.bounce_animation(
            switch,
            intensity=0.1,
            duration=400
        )
```

### Loading and Progress Animations

```python
# ui/animations/progress_animations.py
class ProgressAnimations:
    def __init__(self, animation_manager):
        self.animation_manager = animation_manager
        
    def create_loading_spinner(self, parent_widget, size=32):
        """Create animated loading spinner"""
        spinner = QLabel(parent_widget)
        spinner.setFixedSize(size, size)
        spinner.setAlignment(Qt.AlignCenter)
        
        # Create spinning icon
        spinner_pixmap = self.create_spinner_pixmap(size)
        spinner.setPixmap(spinner_pixmap)
        
        # Rotation animation
        rotation_anim = QPropertyAnimation(spinner, b"rotation")
        rotation_anim.setDuration(1000)
        rotation_anim.setLoopCount(-1)  # Infinite
        rotation_anim.setStartValue(0)
        rotation_anim.setEndValue(360)
        rotation_anim.start()
        
        return spinner, rotation_anim
        
    def animate_progress_bar(self, progress_bar, target_value, duration=1000):
        """Animate progress bar to target value"""
        current_value = progress_bar.value()
        
        progress_anim = QPropertyAnimation(progress_bar, b"value")
        progress_anim.setDuration(duration)
        progress_anim.setEasingCurve(QEasingCurve.OutCubic)
        progress_anim.setStartValue(current_value)
        progress_anim.setEndValue(target_value)
        
        # Add pulse effect when reaching 100%
        if target_value == 100:
            progress_anim.finished.connect(
                lambda: self.animation_manager.pulse_animation(
                    progress_bar, duration=500, loops=3
                )
            )
            
        progress_anim.start()
        return progress_anim
        
    def create_pulse_dot_loader(self, parent_widget, dot_count=3):
        """Create pulsing dots loader"""
        container = QWidget(parent_widget)
        layout = QHBoxLayout(container)
        layout.setSpacing(8)
        
        dots = []
        animations = []
        
        for i in range(dot_count):
            dot = QLabel()
            dot.setFixedSize(8, 8)
            dot.setStyleSheet("""
                QLabel {
                    background-color: #3B82F6;
                    border-radius: 4px;
                }
            """)
            
            # Stagger the pulse animations
            pulse_anim = self.animation_manager.pulse_animation(
                dot, min_opacity=0.3, max_opacity=1.0, duration=800
            )
            
            # Delay each dot's animation
            QTimer.singleShot(i * 200, pulse_anim.start)
            
            dots.append(dot)
            animations.append(pulse_anim)
            layout.addWidget(dot)
            
        return container, dots, animations
```

### Notification and Feedback Animations

```python
# ui/animations/notification_animations.py
class NotificationAnimations:
    def __init__(self, animation_manager):
        self.animation_manager = animation_manager
        
    def show_success_notification(self, widget, message="Success!"):
        """Show success notification with animation"""
        notification = self.create_notification_widget(widget, message, "success")
        
        # Slide in from top
        slide_anim = self.animation_manager.slide_in(
            notification, direction="up", duration=400,
            easing=QEasingCurve.OutBack
        )
        
        # Auto-hide after 3 seconds
        QTimer.singleShot(3000, lambda: self.hide_notification(notification))
        
        return notification
        
    def show_error_notification(self, widget, message="Error!"):
        """Show error notification with shake animation"""
        notification = self.create_notification_widget(widget, message, "error")
        
        # Slide in + shake
        parallel_group = QParallelAnimationGroup()
        
        slide_anim = self.animation_manager.slide_in(
            notification, direction="up", duration=400
        )
        
        # Delayed shake
        QTimer.singleShot(400, lambda: self.animation_manager.shake_animation(
            notification, intensity=5, duration=300
        ))
        
        parallel_group.addAnimation(slide_anim)
        parallel_group.start()
        
        # Auto-hide after 4 seconds
        QTimer.singleShot(4000, lambda: self.hide_notification(notification))
        
        return notification
        
    def show_info_tooltip(self, widget, message, duration=2000):
        """Show animated tooltip"""
        tooltip = self.create_tooltip_widget(widget, message)
        
        # Fade in
        self.animation_manager.fade_in(tooltip, duration=200)
        
        # Auto-hide
        QTimer.singleShot(duration, lambda: self.hide_tooltip(tooltip))
        
        return tooltip
        
    def create_notification_widget(self, parent, message, type="info"):
        """Create notification widget"""
        notification = QWidget(parent)
        notification.setFixedHeight(60)
        notification.setAttribute(Qt.WA_StyledBackground, True)
        
        # Styling based on type
        colors = {
            "success": {"bg": "#10B981", "text": "white"},
            "error": {"bg": "#EF4444", "text": "white"},
            "warning": {"bg": "#F59E0B", "text": "white"},
            "info": {"bg": "#3B82F6", "text": "white"}
        }
        
        color_scheme = colors.get(type, colors["info"])
        
        notification.setStyleSheet(f"""
            QWidget {{
                background-color: {color_scheme["bg"]};
                border-radius: 8px;
                color: {color_scheme["text"]};
            }}
        """)
        
        layout = QHBoxLayout(notification)
        layout.setContentsMargins(16, 8, 16, 8)
        
        message_label = QLabel(message)
        message_label.setStyleSheet(f"color: {color_scheme['text']}; font-weight: 500;")
        layout.addWidget(message_label)
        
        # Position at top of parent
        notification.move(10, 10)
        notification.resize(parent.width() - 20, 60)
        notification.show()
        
        return notification
        
    def hide_notification(self, notification):
        """Hide notification with animation"""
        self.animation_manager.fade_out(
            notification, duration=300,
            callback=lambda: notification.deleteLater()
        )
        
    def ripple_effect(self, widget, click_pos):
        """Create ripple effect at click position"""
        ripple = QWidget(widget)
        ripple.setFixedSize(0, 0)
        ripple.move(click_pos)
        ripple.setStyleSheet("""
            QWidget {
                background-color: rgba(255, 255, 255, 0.3);
                border-radius: 0px;
            }
        """)
        ripple.show()
        
        # Expand ripple
        expand_anim = QPropertyAnimation(ripple, b"size")
        expand_anim.setDuration(600)
        expand_anim.setEasingCurve(QEasingCurve.OutCubic)
        expand_anim.setStartValue(QSize(0, 0))
        expand_anim.setEndValue(QSize(200, 200))
        
        # Fade out ripple
        fade_anim = self.animation_manager.fade_out(
            ripple, duration=600, start_opacity=0.3, end_opacity=0.0
        )
        
        parallel_group = QParallelAnimationGroup()
        parallel_group.addAnimation(expand_anim)
        parallel_group.addAnimation(fade_anim)
        parallel_group.finished.connect(ripple.deleteLater)
        parallel_group.start()
        
        return parallel_group
```

## Animation Configuration and Presets

```python
# ui/animations/animation_presets.py
class AnimationPresets:
    # Duration presets
    DURATION_FAST = 150
    DURATION_NORMAL = 300
    DURATION_SLOW = 500
    DURATION_VERY_SLOW = 800
    
    # Easing curve presets
    EASE_OUT_CUBIC = QEasingCurve.OutCubic
    EASE_OUT_BACK = QEasingCurve.OutBack
    EASE_OUT_BOUNCE = QEasingCurve.OutBounce
    EASE_IN_OUT_SINE = QEasingCurve.InOutSine
    
    # Color presets
    SUCCESS_COLOR = QColor(16, 185, 129)
    ERROR_COLOR = QColor(239, 68, 68)
    WARNING_COLOR = QColor(245, 158, 11)
    INFO_COLOR = QColor(59, 130, 246)
    ACCENT_COLOR = QColor(139, 92, 246)
    
    @staticmethod
    def get_panel_show_preset():
        return {
            "duration": AnimationPresets.DURATION_NORMAL,
            "easing": AnimationPresets.EASE_OUT_BACK,
            "direction": "bottom"
        }
        
    @staticmethod
    def get_button_hover_preset():
        return {
            "duration": AnimationPresets.DURATION_FAST,
            "scale_factor": 1.05,
            "glow_intensity": 10,
            "glow_color": AnimationPresets.ACCENT_COLOR
        }
        
    @staticmethod
    def get_error_feedback_preset():
        return {
            "shake_intensity": 8,
            "shake_duration": 400,
            "glow_color": AnimationPresets.ERROR_COLOR,
            "glow_intensity": 20
        }
```

This comprehensive animation and effects blueprint provides all the specifications needed to implement smooth, professional animations throughout the RF4S Bot Control PySide6 application.
