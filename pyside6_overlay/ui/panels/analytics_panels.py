
"""
Analytics Panels - Data analysis and visualization panels
"""

from PySide6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout, QLabel
from PySide6.QtCore import Qt

from qfluentwidgets import (
    CardWidget, TitleLabel, StrongBodyLabel, BodyLabel,
    ProgressBar, FluentIcon
)


class FishingStatsPanel(CardWidget):
    """Panel showing detailed fishing statistics"""
    
    def __init__(self):
        super().__init__()
        self.setObjectName("FishingStatsPanel")
        self.setup_ui()
        
    def setup_ui(self):
        """Setup the UI components"""
        layout = QVBoxLayout(self)
        
        # Title
        title = TitleLabel("Fishing Statistics")
        layout.addWidget(title)
        
        # Catch breakdown
        self.total_catches_label = StrongBodyLabel("Total Catches: 0")
        layout.addWidget(self.total_catches_label)
        
        self.kept_fish_label = BodyLabel("Fish Kept: 0")
        layout.addWidget(self.kept_fish_label)
        
        self.released_fish_label = BodyLabel("Fish Released: 0")
        layout.addWidget(self.released_fish_label)
        
        # Average stats
        self.avg_fight_time_label = BodyLabel("Avg Fight Time: 0s")
        layout.addWidget(self.avg_fight_time_label)
        
        self.best_fish_label = BodyLabel("Best Fish: None")
        layout.addWidget(self.best_fish_label)
        
    def update_fishing_stats(self, stats: dict):
        """Update fishing statistics"""
        self.total_catches_label.setText(f"Total Catches: {stats.get('total_catches', 0)}")
        self.kept_fish_label.setText(f"Fish Kept: {stats.get('kept_fish', 0)}")
        self.released_fish_label.setText(f"Fish Released: {stats.get('released_fish', 0)}")
        self.avg_fight_time_label.setText(f"Avg Fight Time: {stats.get('avg_fight_time', 0)}s")
        self.best_fish_label.setText(f"Best Fish: {stats.get('best_fish', 'None')}")


class PerformanceMonitorPanel(CardWidget):
    """Panel showing system performance metrics"""
    
    def __init__(self):
        super().__init__()
        self.setObjectName("PerformanceMonitorPanel")
        self.setup_ui()
        
    def setup_ui(self):
        """Setup the UI components"""
        layout = QVBoxLayout(self)
        
        # Title
        title = TitleLabel("Performance Monitor")
        layout.addWidget(title)
        
        # CPU usage
        self.cpu_label = BodyLabel("CPU Usage:")
        layout.addWidget(self.cpu_label)
        
        self.cpu_progress = ProgressBar()
        self.cpu_progress.setMaximum(100)
        layout.addWidget(self.cpu_progress)
        
        # Memory usage
        self.memory_label = BodyLabel("Memory Usage:")
        layout.addWidget(self.memory_label)
        
        self.memory_progress = ProgressBar()
        self.memory_progress.setMaximum(100)
        layout.addWidget(self.memory_progress)
        
        # FPS
        self.fps_label = StrongBodyLabel("FPS: --")
        layout.addWidget(self.fps_label)
        
    def update_performance(self, cpu: float, memory: float, fps: int):
        """Update performance metrics"""
        self.cpu_progress.setValue(int(cpu))
        self.cpu_label.setText(f"CPU Usage: {cpu:.1f}%")
        
        self.memory_progress.setValue(int(memory))
        self.memory_label.setText(f"Memory Usage: {memory:.1f}%")
        
        self.fps_label.setText(f"FPS: {fps}")


class CatchAnalysisPanel(CardWidget):
    """Panel for analyzing catch patterns"""
    
    def __init__(self):
        super().__init__()
        self.setObjectName("CatchAnalysisPanel")
        self.setup_ui()
        
    def setup_ui(self):
        """Setup the UI components"""
        layout = QVBoxLayout(self)
        
        # Title
        title = TitleLabel("Catch Analysis")
        layout.addWidget(title)
        
        # Fish type breakdown
        self.green_fish_label = BodyLabel("Green Fish: 0")
        layout.addWidget(self.green_fish_label)
        
        self.yellow_fish_label = BodyLabel("Yellow Fish: 0")
        layout.addWidget(self.yellow_fish_label)
        
        self.blue_fish_label = BodyLabel("Blue Fish: 0")
        layout.addWidget(self.blue_fish_label)
        
        self.purple_fish_label = BodyLabel("Purple Fish: 0")
        layout.addWidget(self.purple_fish_label)
        
        self.pink_fish_label = BodyLabel("Pink Fish: 0")
        layout.addWidget(self.pink_fish_label)
        
        # Success rate by type
        self.success_rate_label = StrongBodyLabel("Overall Success Rate: 0%")
        layout.addWidget(self.success_rate_label)
        
    def update_catch_analysis(self, analysis: dict):
        """Update catch analysis data"""
        self.green_fish_label.setText(f"Green Fish: {analysis.get('green', 0)}")
        self.yellow_fish_label.setText(f"Yellow Fish: {analysis.get('yellow', 0)}")
        self.blue_fish_label.setText(f"Blue Fish: {analysis.get('blue', 0)}")
        self.purple_fish_label.setText(f"Purple Fish: {analysis.get('purple', 0)}")
        self.pink_fish_label.setText(f"Pink Fish: {analysis.get('pink', 0)}")
        self.success_rate_label.setText(f"Overall Success Rate: {analysis.get('success_rate', 0)}%")
