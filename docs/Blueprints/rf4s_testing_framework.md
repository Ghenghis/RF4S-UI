# RF4S Testing Framework Blueprint

## Overview

The RF4S testing framework provides comprehensive testing capabilities for all components of the automation system. This includes unit tests, integration tests, mock implementations, and validation tools to ensure reliability and maintainability.

## Testing Architecture

### Test Structure

```
tests/
├── __init__.py
├── conftest.py                 # pytest configuration
├── unit/                       # Unit tests
│   ├── __init__.py
│   ├── test_app.py            # App base class tests
│   ├── test_config.py         # Configuration system tests
│   ├── test_detection.py      # Detection controller tests
│   ├── test_window.py         # Window controller tests
│   ├── test_timer.py          # Timer controller tests
│   ├── test_notification.py   # Notification tests
│   ├── test_player.py         # Player logic tests
│   ├── test_friction_brake.py # Friction brake tests
│   ├── test_tackle.py         # Tackle component tests
│   └── test_utils.py          # Utilities tests
├── integration/               # Integration tests
│   ├── __init__.py
│   ├── test_fishing_workflow.py    # End-to-end fishing tests
│   ├── test_tool_applications.py   # Tool integration tests
│   ├── test_configuration_flow.py  # Config loading tests
│   └── test_detection_pipeline.py  # Detection system tests
├── mocks/                     # Mock implementations
│   ├── __init__.py
│   ├── mock_game_window.py    # Mock game window
│   ├── mock_detection.py      # Mock detection system
│   ├── mock_input.py          # Mock input simulation
│   └── mock_notifications.py  # Mock notification services
├── fixtures/                  # Test data and fixtures
│   ├── __init__.py
│   ├── test_images/           # Test image templates
│   ├── test_configs/          # Test configuration files
│   ├── test_screenshots/      # Sample screenshots
│   └── test_data.py           # Test data generators
├── performance/               # Performance tests
│   ├── __init__.py
│   ├── test_detection_speed.py     # Detection performance
│   ├── test_memory_usage.py        # Memory usage tests
│   └── test_cpu_usage.py           # CPU usage tests
└── validators/                # Validation tools
    ├── __init__.py
    ├── config_validator.py    # Configuration validation
    ├── template_validator.py  # Image template validation
    └── system_validator.py    # System requirements validation
```

## Mock Implementations

### Mock Game Window

```python
# tests/mocks/mock_game_window.py
from typing import Tuple, Optional
from unittest.mock import Mock
import time

class MockGameWindow:
    """Mock implementation of game window for testing"""
    
    def __init__(self, title: str = "Russian Fishing 4", 
                 width: int = 1920, height: int = 1080,
                 left: int = 0, top: int = 0):
        self.title = title
        self.width = width
        self.height = height
        self.left = left
        self.top = top
        self.visible = True
        self.isMinimized = False
        self.isMaximized = False
        self._activation_count = 0
        self._last_activation = 0
        
    def activate(self) -> None:
        """Mock window activation"""
        self._activation_count += 1
        self._last_activation = time.time()
        self.isMinimized = False
        
    def restore(self) -> None:
        """Mock window restoration"""
        self.isMinimized = False
        self.isMaximized = False
        
    def minimize(self) -> None:
        """Mock window minimization"""
        self.isMinimized = True
        
    def maximize(self) -> None:
        """Mock window maximization"""
        self.isMaximized = True
        self.isMinimized = False

class MockWindowController:
    """Mock window controller for testing"""
    
    def __init__(self, mock_window: Optional[MockGameWindow] = None):
        self._game_window = mock_window or MockGameWindow()
        self._script_window = MockGameWindow("Command Prompt")
        self.game_window_title = "Russian Fishing 4"
        self.script_window_title = "Command Prompt"
        self._supported_resolutions = [
            (2560, 1440), (1920, 1080), (1600, 900), (1366, 768), (1280, 720)
        ]
    
    def activate_game_window(self) -> None:
        """Mock game window activation"""
        if self._game_window:
            self._game_window.activate()
    
    def activate_script_window(self) -> None:
        """Mock script window activation"""
        if self._script_window:
            self._script_window.activate()
    
    def get_resolution_str(self) -> str:
        """Get mock resolution string"""
        if self._game_window:
            return f"{self._game_window.width}x{self._game_window.height}"
        return "1920x1080"
    
    def is_size_supported(self) -> bool:
        """Check if mock size is supported"""
        if not self._game_window:
            return True
        
        current_resolution = (self._game_window.width, self._game_window.height)
        return current_resolution in self._supported_resolutions
    
    def get_game_window_bbox(self) -> Tuple[int, int, int, int]:
        """Get mock window bounding box"""
        if not self._game_window:
            return (0, 0, 1920, 1080)
        
        return (
            self._game_window.left,
            self._game_window.top,
            self._game_window.width,
            self._game_window.height
        )
    
    def get_client_area_bbox(self) -> Tuple[int, int, int, int]:
        """Get mock client area"""
        if not self._game_window:
            return (0, 30, 1920, 1050)  # Assume 30px title bar
        
        return (
            self._game_window.left,
            self._game_window.top + 30,  # Title bar
            self._game_window.width,
            self._game_window.height - 30
        )
    
    def ensure_window_ready(self) -> bool:
        """Mock window readiness check"""
        return self._game_window is not None and not self._game_window.isMinimized
```

### Mock Detection System

```python
# tests/mocks/mock_detection.py
import numpy as np
from typing import Dict, Optional, List, Tuple
from unittest.mock import Mock
import cv2

class MockDetection:
    """Mock detection system for testing"""
    
    def __init__(self, mock_responses: Optional[Dict[str, bool]] = None):
        """
        Initialize mock detection with predefined responses
        
        Args:
            mock_responses: Dictionary mapping detection method names to return values
        """
        self.mock_responses = mock_responses or {}
        self.call_history: List[Tuple[str, tuple, dict]] = []
        self.image_templates: Dict[str, np.ndarray] = {}
        
        # Default responses
        self.default_responses = {
            'is_spool_exist': False,
            'is_meter_exist': False,
            'is_fish_on_line_exist': False,
            'is_snag_exist': False,
            'is_casting_bar_exist': True,
            'is_float_diving': False,
            'is_float_wobble': False,
            'is_broken_lure_exist': False,
            'is_disconnected_indicator_exist': False,
            'is_loading_screen_exist': False,
            'is_error_dialog_exist': False,
            'is_rod_idle': True
        }
        
        # Create mock image templates
        self._create_mock_templates()
    
    def _create_mock_templates(self) -> None:
        """Create mock image templates for testing"""
        # Create small test images
        for template_name in ['spool', 'meter', 'fish_on_line', 'snag']:
            # Create a simple colored rectangle as mock template
            template = np.random.randint(0, 255, (50, 50, 3), dtype=np.uint8)
            self.image_templates[f"{template_name}_{cv2.IMREAD_COLOR}"] = template
            
            # Grayscale version
            gray_template = cv2.cvtColor(template, cv2.COLOR_BGR2GRAY)
            self.image_templates[f"{template_name}_{cv2.IMREAD_GRAYSCALE}"] = gray_template
    
    def set_response(self, method_name: str, value: bool) -> None:
        """Set specific response for a detection method"""
        self.mock_responses[method_name] = value
    
    def set_responses(self, responses: Dict[str, bool]) -> None:
        """Set multiple responses at once"""
        self.mock_responses.update(responses)
    
    def get_call_history(self) -> List[Tuple[str, tuple, dict]]:
        """Get history of method calls"""
        return self.call_history.copy()
    
    def clear_call_history(self) -> None:
        """Clear call history"""
        self.call_history.clear()
    
    def _log_call(self, method_name: str, args: tuple, kwargs: dict) -> None:
        """Log method call for testing"""
        self.call_history.append((method_name, args, kwargs))
    
    def _get_response(self, method_name: str) -> bool:
        """Get response for method"""
        response = self.mock_responses.get(method_name, 
                                         self.default_responses.get(method_name, False))
        self._log_call(method_name, (), {})
        return response
    
    # Mock detection methods
    def is_spool_exist(self) -> bool:
        return self._get_response('is_spool_exist')
    
    def is_spool_disappear(self) -> bool:
        return not self.is_spool_exist()
    
    def is_meter_exist(self) -> bool:
        return self._get_response('is_meter_exist')
    
    def is_meter_disappear(self) -> bool:
        return not self.is_meter_exist()
    
    def is_fish_on_line_exist(self) -> bool:
        return self._get_response('is_fish_on_line_exist')
    
    def is_snag_exist(self) -> bool:
        return self._get_response('is_snag_exist')
    
    def is_casting_bar_exist(self) -> bool:
        return self._get_response('is_casting_bar_exist')
    
    def is_float_diving(self) -> bool:
        return self._get_response('is_float_diving')
    
    def is_float_wobble(self) -> bool:
        return self._get_response('is_float_wobble')
    
    def is_broken_lure_exist(self) -> bool:
        return self._get_response('is_broken_lure_exist')
    
    def is_rod_tip_movement(self) -> bool:
        return self._get_response('is_rod_tip_movement')
    
    def is_disconnected_indicator_exist(self) -> bool:
        return self._get_response('is_disconnected_indicator_exist')
    
    def is_loading_screen_exist(self) -> bool:
        return self._get_response('is_loading_screen_exist')
    
    def is_error_dialog_exist(self) -> bool:
        return self._get_response('is_error_dialog_exist')
    
    def is_rod_idle(self) -> bool:
        return self._get_response('is_rod_idle')
    
    def is_fish_name_exist(self, name: str) -> bool:
        method_name = f'is_fish_name_exist_{name}'
        self._log_call('is_fish_name_exist', (name,), {})
        return self.mock_responses.get(method_name, False)
    
    def is_fish_tagged(self, tags: Optional[List[str]] = None) -> Optional[str]:
        method_name = 'is_fish_tagged'
        self._log_call(method_name, (tags,), {})
        
        # Return first tag that has a positive response
        tags = tags or ["red", "blue", "green", "yellow", "purple"]
        for tag in tags:
            if self.mock_responses.get(f'fish_tag_{tag}', False):
                return tag
        
        return None
    
    def get_text(self, bbox: Tuple[int, int, int, int]) -> str:
        """Mock OCR text extraction"""
        method_name = 'get_text'
        self._log_call(method_name, (bbox,), {})
        
        # Return predefined text or default
        bbox_str = f"{bbox[0]}_{bbox[1]}_{bbox[2]}_{bbox[3]}"
        return self.mock_responses.get(f'text_{bbox_str}', "Mock Text")
    
    def load_image(self, name: str, mode: int = cv2.IMREAD_COLOR) -> np.ndarray:
        """Mock image loading"""
        cache_key = f"{name}_{mode}"
        self._log_call('load_image', (name, mode), {})
        
        if cache_key in self.image_templates:
            return self.image_templates[cache_key]
        
        # Create dummy image
        if mode == cv2.IMREAD_GRAYSCALE:
            return np.random.randint(0, 255, (50, 50), dtype=np.uint8)
        else:
            return np.random.randint(0, 255, (50, 50, 3), dtype=np.uint8)
    
    def get_screenshot_as_gray(self, bbox: Tuple[int, int, int, int]) -> np.ndarray:
        """Mock screenshot capture"""
        self._log_call('get_screenshot_as_gray', (bbox,), {})
        
        # Return mock screenshot
        width, height = bbox[2], bbox[3]
        return np.random.randint(0, 255, (height, width), dtype=np.uint8)
```

### Mock Input System

```python
# tests/mocks/mock_input.py
from typing import List, Tuple, Any
from unittest.mock import Mock
import time

class MockKeyboard:
    """Mock keyboard controller for testing"""
    
    def __init__(self):
        self.pressed_keys: List[Tuple[str, float]] = []
        self.released_keys: List[Tuple[str, float]] = []
        self.key_combinations: List[Tuple[List[str], float]] = []
        
    def press(self, key: str) -> None:
        """Mock key press"""
        self.pressed_keys.append((key, time.time()))
    
    def release(self, key: str) -> None:
        """Mock key release"""
        self.released_keys.append((key, time.time()))
    
    def press_combination(self, keys: List[str]) -> None:
        """Mock key combination"""
        self.key_combinations.append((keys, time.time()))
    
    def get_pressed_keys(self) -> List[Tuple[str, float]]:
        """Get history of pressed keys"""
        return self.pressed_keys.copy()
    
    def get_released_keys(self) -> List[Tuple[str, float]]:
        """Get history of released keys"""
        return self.released_keys.copy()
    
    def clear_history(self) -> None:
        """Clear key press history"""
        self.pressed_keys.clear()
        self.released_keys.clear()
        self.key_combinations.clear()

class MockMouse:
    """Mock mouse controller for testing"""
    
    def __init__(self):
        self.clicks: List[Tuple[Tuple[int, int], str, float]] = []
        self.moves: List[Tuple[Tuple[int, int], float]] = []
        self.position = (0, 0)
    
    def click(self, button: str, count: int = 1) -> None:
        """Mock mouse click"""
        self.clicks.append((self.position, button, time.time()))
    
    def move(self, x: int, y: int) -> None:
        """Mock mouse move"""
        self.position = (x, y)
        self.moves.append((self.position, time.time()))
    
    def get_clicks(self) -> List[Tuple[Tuple[int, int], str, float]]:
        """Get click history"""
        return self.clicks.copy()
    
    def get_moves(self) -> List[Tuple[Tuple[int, int], float]]:
        """Get move history"""
        return self.moves.copy()
    
    def clear_history(self) -> None:
        """Clear input history"""
        self.clicks.clear()
        self.moves.clear()
```

## Unit Tests

### Configuration System Tests

```python
# tests/unit/test_config.py
import pytest
import tempfile
import yaml
from pathlib import Path
from yacs.config import CfgNode

from rf4s.config.config import setup_cfg, dict_to_cfg, find_config_file
from rf4s.config.defaults import get_cfg_defaults

class TestConfiguration:
    """Test configuration system"""
    
    def test_default_config_creation(self):
        """Test default configuration creation"""
        cfg = get_cfg_defaults()
        
        assert isinstance(cfg, CfgNode)
        assert cfg.VERSION is not None
        assert cfg.SCRIPT.LANGUAGE == "en"
        assert cfg.KEY.QUIT == "ctrl+c"
        assert cfg.KEEPNET.CAPACITY == 50
    
    def test_config_file_loading(self):
        """Test loading configuration from YAML file"""
        # Create temporary config file
        config_data = {
            'SCRIPT': {
                'LANGUAGE': 'ru',
                'SPOOL_CONFIDENCE': 0.9
            },
            'KEY': {
                'QUIT': 'ctrl+x'
            }
        }
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False) as f:
            yaml.dump(config_data, f)
            config_path = Path(f.name)
        
        try:
            cfg = get_cfg_defaults()
            cfg.merge_from_file(str(config_path))
            
            assert cfg.SCRIPT.LANGUAGE == 'ru'
            assert cfg.SCRIPT.SPOOL_CONFIDENCE == 0.9
            assert cfg.KEY.QUIT == 'ctrl+x'
            
        finally:
            config_path.unlink()
    
    def test_dict_to_cfg_conversion(self):
        """Test dictionary to CfgNode conversion"""
        test_dict = {
            'test_key': 'test_value',
            'nested': {
                'inner_key': 42
            }
        }
        
        cfg = dict_to_cfg(test_dict)
        
        assert isinstance(cfg, CfgNode)
        assert cfg.test_key == 'test_value'
        assert cfg.nested.inner_key == 42
    
    def test_config_merging(self):
        """Test configuration merging priority"""
        base_cfg = get_cfg_defaults()
        override_cfg = dict_to_cfg({
            'SCRIPT': {
                'LANGUAGE': 'de'
            },
            'NEW_SECTION': {
                'NEW_KEY': 'new_value'
            }
        })
        
        base_cfg.merge_from_other_cfg(override_cfg)
        
        assert base_cfg.SCRIPT.LANGUAGE == 'de'
        assert base_cfg.NEW_SECTION.NEW_KEY == 'new_value'
        # Ensure other values remain unchanged
        assert base_cfg.KEY.QUIT == "ctrl+c"
    
    def test_config_freezing(self):
        """Test configuration freezing"""
        cfg = get_cfg_defaults()
        cfg.freeze()
        
        with pytest.raises(AttributeError):
            cfg.SCRIPT.LANGUAGE = 'modified'
    
    def test_profile_configuration(self):
        """Test profile-specific configuration"""
        cfg = get_cfg_defaults()
        
        # Test default profiles exist
        assert hasattr(cfg.PROFILE, 'SPIN')
        assert hasattr(cfg.PROFILE, 'BOTTOM')
        
        # Test profile structure
        assert cfg.PROFILE.SPIN.MODE == 'spin'
        assert cfg.PROFILE.BOTTOM.MODE == 'bottom'
        assert isinstance(cfg.PROFILE.SPIN.CAST_POWER_LEVEL, (int, float))

class TestConfigValidation:
    """Test configuration validation"""
    
    def test_required_keys_present(self):
        """Test that all required configuration keys are present"""
        cfg = get_cfg_defaults()
        
        required_sections = ['VERSION', 'SCRIPT', 'KEY', 'STAT', 'KEEPNET', 'PROFILE']
        for section in required_sections:
            assert hasattr(cfg, section), f"Missing required section: {section}"
    
    def test_key_bindings_valid(self):
        """Test that key bindings are valid"""
        cfg = get_cfg_defaults()
        
        # Test essential keys are defined
        essential_keys = ['TEA', 'CARROT', 'COFFEE', 'QUIT', 'CAST', 'REEL']
        for key in essential_keys:
            assert hasattr(cfg.KEY, key), f"Missing essential key binding: {key}"
            assert cfg.KEY[key] is not None, f"Key binding {key} is None"
    
    def test_numeric_ranges_valid(self):
        """Test that numeric configuration values are in valid ranges"""
        cfg = get_cfg_defaults()
        
        # Test thresholds are percentages
        assert 0 <= cfg.STAT.ENERGY_THRESHOLD <= 100
        assert 0 <= cfg.STAT.HUNGER_THRESHOLD <= 100
        assert 0 <= cfg.STAT.COMFORT_THRESHOLD <= 100
        
        # Test confidence values
        assert 0.0 <= cfg.SCRIPT.SPOOL_CONFIDENCE <= 1.0
        
        # Test keepnet capacity
        assert cfg.KEEPNET.CAPACITY > 0
        
        # Test friction brake values
        assert 0 <= cfg.FRICTION_BRAKE.INITIAL <= cfg.FRICTION_BRAKE.MAX
```

### Detection System Tests

```python
# tests/unit/test_detection.py
import pytest
import numpy as np
import cv2
from unittest.mock import Mock, patch, MagicMock
from pathlib import Path

from rf4s.controller.detection import Detection
from rf4s.config.defaults import get_cfg_defaults
from tests.mocks.mock_game_window import MockWindowController
from tests.fixtures.test_images import create_test_image

class TestDetection:
    """Test detection controller"""
    
    @pytest.fixture
    def mock_window(self):
        """Create mock window controller"""
        return MockWindowController()
    
    @pytest.fixture
    def test_config(self):
        """Create test configuration"""
        cfg = get_cfg_defaults()
        cfg.SCRIPT.LANGUAGE = "en"
        return cfg
    
    @pytest.fixture
    def detection(self, test_config, mock_window):
        """Create detection instance with mocks"""
        with patch('rf4s.controller.detection.mss.mss'), \
             patch('rf4s.controller.detection.pytesseract'):
            detection = Detection(test_config, mock_window)
            detection.sct = Mock()
            return detection
    
    def test_initialization(self, detection):
        """Test detection initialization"""
        assert detection.language == "en"
        assert detection.image_templates == {}
        assert detection.sct is not None
    
    def test_image_loading(self, detection):
        """Test image template loading"""
        # Create test image
        test_image = create_test_image(50, 50)
        
        with patch('cv2.imread', return_value=test_image):
            loaded_image = detection.load_image("test_template")
            
            assert loaded_image is not None
            assert loaded_image.shape == test_image.shape
            assert "test_template_1" in detection.image_templates
    
    def test_image_loading_fallback(self, detection):
        """Test image loading with fallback to English"""
        with patch('cv2.imread', side_effect=[None, create_test_image(50, 50)]):
            with patch.object(Path, 'exists', side_effect=[False, True]):
                loaded_image = detection.load_image("missing_template")
                assert loaded_image is not None
    
    def test_screenshot_capture(self, detection):
        """Test screenshot capture"""
        mock_screenshot = create_test_image(100, 100, channels=4)  # BGRA
        detection.sct.grab.return_value = mock_screenshot
        
        with patch('numpy.array', return_value=mock_screenshot[:,:,:3]):  # Remove alpha
            screenshot = detection.get_screenshot_as_gray((0, 0, 100, 100))
            
            assert screenshot is not None
            assert len(screenshot.shape) == 2  # Grayscale
    
    def test_template_matching(self, detection):
        """Test template matching"""
        # Create test screenshot and template
        screenshot = create_test_image(200, 200, grayscale=True)
        template = create_test_image(50, 50, grayscale=True)
        
        detection.get_screenshot_as_gray = Mock(return_value=screenshot)
        detection.load_image = Mock(return_value=template)
        
        with patch('cv2.matchTemplate') as mock_match:
            mock_match.return_value = np.array([[0.9]])  # High confidence
            with patch('cv2.minMaxLoc', return_value=(0, 0.9, (0, 0), (0, 0))):
                result = detection.is_image_exist("test_template", threshold=0.8)
                
                assert result is True
                detection.load_image.assert_called_once()
    
    def test_template_matching_low_confidence(self, detection):
        """Test template matching with low confidence"""
        screenshot = create_test_image(200, 200, grayscale=True)
        template = create_test_image(50, 50, grayscale=True)
        
        detection.get_screenshot_as_gray = Mock(return_value=screenshot)
        detection.load_image = Mock(return_value=template)
        
        with patch('cv2.matchTemplate') as mock_match:
            mock_match.return_value = np.array([[0.5]])  # Low confidence
            with patch('cv2.minMaxLoc', return_value=(0, 0.5, (0, 0), (0, 0))):
                result = detection.is_image_exist("test_template", threshold=0.8)
                
                assert result is False
    
    def test_ocr_text_extraction(self, detection):
        """Test OCR text extraction"""
        test_image = create_test_image(100, 50, channels=4)
        detection.sct.grab.return_value = test_image
        
        with patch('numpy.array', return_value=test_image[:,:,:3]):
            with patch('pytesseract.image_to_string', return_value="Test Text 123"):
                text = detection.get_text((0, 0, 100, 50))
                
                assert text == "Test Text 123"
    
    def test_specific_detection_methods(self, detection):
        """Test specific detection methods"""
        detection.is_image_exist = Mock(return_value=True)
        
        # Test spool detection
        assert detection.is_spool_exist() is True
        assert detection.is_spool_disappear() is False
        
        # Test fish detection
        assert detection.is_fish_on_line_exist() is True
        
        # Test snag detection
        assert detection.is_snag_exist() is True
    
    def test_fish_tag_detection(self, detection):
        """Test fish tag detection"""
        detection.is_image_exist = Mock(side_effect=lambda name, bbox: "red" in name)
        
    def test_fish_tag_detection(self, detection):
        """Test fish tag detection"""
        detection.is_image_exist = Mock(side_effect=lambda name, bbox: "red" in name)
        
        result = detection.is_fish_tagged(["red", "blue", "green"])
        assert result == "red"
        
        detection.is_image_exist = Mock(return_value=False)
        result = detection.is_fish_tagged(["red", "blue", "green"])
        assert result is None
    
    def test_float_detection(self, detection):
        """Test float fishing detection"""
        # Test float diving
        detection.is_image_exist = Mock(return_value=True)
        assert detection.is_float_diving() is True
        
        # Test float wobble with frame difference
        test_image1 = create_test_image(100, 100, grayscale=True)
        test_image2 = create_test_image(100, 100, grayscale=True) + 20  # Different image
        
        detection.get_screenshot_as_gray = Mock(side_effect=[test_image1, test_image2])
        
        # First call establishes baseline
        assert detection.is_float_wobble() is False
        
        # Second call detects difference
        with patch.object(detection.cfg.PROFILE.SELECTED, 'FLOAT_SENSITIVITY', 5.0):
            assert detection.is_float_wobble() is True
    
    def test_multiscale_detection(self, detection):
        """Test multi-scale template matching"""
        screenshot = create_test_image(200, 200, grayscale=True)
        template = create_test_image(50, 50, grayscale=True)
        
        detection.get_screenshot_as_gray = Mock(return_value=screenshot)
        detection.load_image = Mock(return_value=template)
        
        with patch('cv2.resize', return_value=template):
            with patch('cv2.matchTemplate', return_value=np.array([[0.9]])):
                with patch('cv2.minMaxLoc', return_value=(0, 0.9, (0, 0), (0, 0))):
                    result = detection.is_image_exist_multiscale("test_template")
                    assert result is True
    
    def test_caching_mechanism(self, detection):
        """Test screenshot caching"""
        test_image = create_test_image(100, 100, grayscale=True)
        detection.sct.grab = Mock(return_value=test_image)
        
        bbox = (0, 0, 100, 100)
        
        # First call should capture screenshot
        screenshot1 = detection.get_screenshot_as_gray(bbox)
        
        # Second call within cache duration should use cached version
        screenshot2 = detection.get_screenshot_as_gray(bbox)
        
        # Should only call grab once due to caching
        assert detection.sct.grab.call_count == 1
        assert np.array_equal(screenshot1, screenshot2)
    
    def test_error_handling(self, detection):
        """Test error handling in detection methods"""
        # Test image loading error
        with patch('cv2.imread', return_value=None):
            with pytest.raises(ValueError):
                detection.load_image("invalid_image")
        
        # Test screenshot error
        detection.sct.grab.side_effect = Exception("Screenshot failed")
        screenshot = detection.get_screenshot_as_gray((0, 0, 100, 100))
        assert screenshot.size == 0  # Should return empty array
        
        # Test template matching error
        detection.get_screenshot_as_gray = Mock(side_effect=Exception("Error"))
        result = detection.is_image_exist("test_template")
        assert result is False  # Should return False on error

class TestDetectionValidation:
    """Test detection system validation"""
    
    def test_template_existence_validation(self):
        """Test validation of required templates"""
        cfg = get_cfg_defaults()
        mock_window = MockWindowController()
        
        with patch('rf4s.controller.detection.mss.mss'):
            with patch('pathlib.Path.exists', return_value=False):
                with pytest.raises(FileNotFoundError):
                    Detection(cfg, mock_window)
    
    def test_tesseract_availability(self):
        """Test Tesseract OCR availability check"""
        cfg = get_cfg_defaults()
        mock_window = MockWindowController()
        
        with patch('rf4s.controller.detection.mss.mss'):
            with patch('pytesseract.get_tesseract_version', side_effect=Exception()):
                # Should not raise exception, but log warning
                detection = Detection(cfg, mock_window)
                assert detection is not None
```

### Player Logic Tests

```python
# tests/unit/test_player.py
import pytest
from unittest.mock import Mock, patch, MagicMock
import time

from rf4s.player import Player, FishingState
from rf4s.config.defaults import get_cfg_defaults
from tests.mocks.mock_game_window import MockWindowController
from tests.mocks.mock_detection import MockDetection
from tests.mocks.mock_input import MockKeyboard, MockMouse

class TestPlayer:
    """Test Player core logic"""
    
    @pytest.fixture
    def test_config(self):
        """Create test configuration"""
        cfg = get_cfg_defaults()
        cfg.SELECTED = cfg.PROFILE.SPIN.clone()
        cfg.SELECTED.NAME = "TEST_SPIN"
        cfg.freeze()
        return cfg
    
    @pytest.fixture
    def mock_controllers(self):
        """Create mock controllers"""
        return {
            'window': MockWindowController(),
            'detection': MockDetection(),
            'keyboard': MockKeyboard(),
            'mouse': MockMouse()
        }
    
    @pytest.fixture
    def player(self, test_config, mock_controllers):
        """Create Player instance with mocks"""
        with patch('rf4s.player.Detection', return_value=mock_controllers['detection']):
            with patch('rf4s.player.Timer') as mock_timer:
                with patch('rf4s.player.Notification') as mock_notification:
                    with patch('rf4s.player.keyboard.Controller', return_value=mock_controllers['keyboard']):
                        with patch('rf4s.player.mouse.Controller', return_value=mock_controllers['mouse']):
                            player = Player(test_config, mock_controllers['window'])
                            player.timer = mock_timer.return_value
                            player.notification = mock_notification.return_value
                            return player
    
    def test_player_initialization(self, player, test_config):
        """Test player initialization"""
        assert player.cfg == test_config
        assert player.current_state == FishingState.IDLE
        assert player._fishes_caught_count == 0
        assert player._coffee_drink_count == 0
        assert player._is_fighting is False
        assert player._is_connected is True
    
    def test_state_transitions(self, player):
        """Test state machine transitions"""
        # Test transition to casting
        player._transition_to_state(FishingState.CASTING, "Test transition")
        assert player.current_state == FishingState.CASTING
        assert len(player.state_history) == 1
        
        # Test transition to waiting
        player._transition_to_state(FishingState.WAITING, "Cast complete")
        assert player.current_state == FishingState.WAITING
        assert len(player.state_history) == 2
        
        # Verify history
        assert player.state_history[0]['from_state'] == FishingState.IDLE
        assert player.state_history[0]['to_state'] == FishingState.CASTING
        assert player.state_history[1]['from_state'] == FishingState.CASTING
        assert player.state_history[1]['to_state'] == FishingState.WAITING
    
    def test_casting_logic(self, player, mock_controllers):
        """Test rod casting logic"""
        # Setup mock responses
        mock_controllers['detection'].set_response('is_casting_bar_exist', True)
        
        with patch.object(player, '_pre_cast_validation', return_value=True):
            with patch.object(player, '_post_cast_validation', return_value=True):
                with patch.object(player, '_cast_spin_like') as mock_cast:
                    player.cast_rod()
                    
                    mock_cast.assert_called_once()
                    assert player.current_state == FishingState.WAITING
    
    def test_fish_detection(self, player, mock_controllers):
        """Test fish bite detection"""
        # Test no fish detected
        mock_controllers['detection'].set_response('is_fish_on_line_exist', False)
        
        with patch.object(player.timer, 'delay'):
            with patch('time.time', side_effect=[0, 1, 2, 50]):  # Simulate timeout
                result = player.wait_for_fish()
                assert result is None  # Timeout
        
        # Test fish detected
        mock_controllers['detection'].set_response('is_fish_on_line_exist', True)
        
        with patch.object(player.timer, 'delay'):
            with patch('time.time', side_effect=[0, 1]):
                result = player.wait_for_fish()
                assert player.current_state == FishingState.FIGHTING
    
    def test_fish_fighting(self, player, mock_controllers):
        """Test fish fighting logic"""
        # Setup fish fight scenario
        mock_controllers['detection'].set_responses({
            'is_fish_on_line_exist': True
        })
        
        with patch.object(player, '_lift_rod'):
            with patch.object(player, '_reel_fish'):
                with patch.object(player, '_is_fish_landed', return_value=True):
                    with patch('time.time', side_effect=[0, 1, 2]):
                        player.fish_fight()
                        
                        assert player.current_state == FishingState.HANDLING_FISH
    
    def test_fish_handling(self, player, mock_controllers):
        """Test caught fish processing"""
        # Setup fish info
        fish_info = {
            'name': 'Carp',
            'weight': '2.5',
            'is_tagged': False
        }
        
        with patch.object(player, '_wait_for_fish_info', return_value=True):
            with patch.object(player, '_extract_fish_info', return_value=fish_info):
                with patch.object(player, '_should_keep_fish', return_value=True):
                    with patch.object(player, '_keep_fish'):
                        player.handle_caught_fish()
                        
                        assert player._fishes_caught_count == 1
                        assert player.current_state == FishingState.IDLE
    
    def test_consumables_management(self, player, mock_controllers):
        """Test consumables usage"""
        # Test coffee consumption
        with patch.object(player, '_get_energy_level', return_value=15):  # Below threshold
            with patch.object(player, '_drink_coffee') as mock_coffee:
                player.check_consumables()
                mock_coffee.assert_called_once()
        
        # Test no consumption when above threshold
        with patch.object(player, '_get_energy_level', return_value=80):  # Above threshold
            with patch.object(player, '_drink_coffee') as mock_coffee:
                player.check_consumables()
                mock_coffee.assert_not_called()
    
    def test_keepnet_management(self, player):
        """Test keepnet capacity management"""
        # Set fish count to capacity
        player._fishes_caught_count = player.cfg.KEEPNET.CAPACITY
        
        with patch.object(player, '_quit_fishing') as mock_quit:
            player.check_keepnet_full()
            mock_quit.assert_called_once()
    
    def test_connection_monitoring(self, player, mock_controllers):
        """Test connection monitoring"""
        # Test connected state
        mock_controllers['window'].ensure_window_ready = Mock(return_value=True)
        mock_controllers['detection'].set_response('is_disconnected_indicator_exist', False)
        
        result = player.check_connection()
        assert result is True
        assert player._is_connected is True
        
        # Test disconnected state
        mock_controllers['detection'].set_response('is_disconnected_indicator_exist', True)
        
        result = player.check_connection()
        assert result is False
        assert player._is_connected is False
    
    def test_error_handling(self, player, mock_controllers):
        """Test error handling in player methods"""
        # Test casting error
        with patch.object(player, '_pre_cast_validation', side_effect=Exception("Test error")):
            player.cast_rod()
            assert player.current_state == FishingState.ERROR
        
        # Test fish handling error
        with patch.object(player, '_wait_for_fish_info', side_effect=Exception("Fish error")):
            player.handle_caught_fish()
            assert player.current_state == FishingState.ERROR
    
    def test_mode_specific_logic(self, player, mock_controllers):
        """Test mode-specific implementations"""
        # Test spin mode
        player.cfg.SELECTED.MODE = "spin"
        
        with patch.object(player, '_wait_for_fish_spin', return_value=True) as mock_spin:
            with patch.object(player.timer, 'delay'):
                player.wait_for_fish()
                mock_spin.assert_called_once()
        
        # Test bottom mode
        player.cfg.SELECTED.MODE = "bottom"
        
        with patch.object(player, '_wait_for_fish_bottom', return_value=True) as mock_bottom:
            with patch.object(player.timer, 'delay'):
                player.wait_for_fish()
                mock_bottom.assert_called_once()
    
    def test_statistics_collection(self, player):
        """Test session statistics collection"""
        # Simulate fishing session
        player._fishes_caught_count = 5
        player._coffee_drink_count = 3
        player.timer.get_elapsed_time = Mock(return_value=3600)  # 1 hour
        
        result_dict = player.build_result_dict("completed")
        
        assert result_dict['fishes_caught'] == 5
        assert result_dict['coffee_consumed'] == 3
        assert result_dict['duration'] == 3600
        assert result_dict['fish_per_hour'] == 5.0
        assert 'efficiency' in result_dict
    
    def test_quit_conditions(self, player):
        """Test quit condition checking"""
        # Test normal operation
        player._should_quit = Mock(return_value=False)
        assert player._should_quit() is False
        
        # Test quit condition
        player._should_quit = Mock(return_value=True)
        assert player._should_quit() is True

class TestPlayerModeImplementations:
    """Test mode-specific player implementations"""
    
    @pytest.fixture
    def spin_player(self):
        """Create player configured for spin fishing"""
        cfg = get_cfg_defaults()
        cfg.SELECTED = cfg.PROFILE.SPIN.clone()
        cfg.freeze()
        
        window = MockWindowController()
        detection = MockDetection()
        
        with patch('rf4s.player.Detection', return_value=detection):
            with patch('rf4s.player.Timer'):
                with patch('rf4s.player.Notification'):
                    with patch('rf4s.player.keyboard.Controller'):
                        with patch('rf4s.player.mouse.Controller'):
                            return Player(cfg, window)
    
    def test_spin_fishing_workflow(self, spin_player):
        """Test complete spin fishing workflow"""
        detection = spin_player.detection
        
        # Setup detection responses for spin fishing
        detection.set_responses({
            'is_casting_bar_exist': True,
            'is_fish_on_line_exist': False,  # Initially no fish
            'is_spool_exist': True,
            'is_fish_name_exist_carp': True
        })
        
        with patch.object(spin_player.timer, 'delay'):
            with patch.object(spin_player, '_execute_power_cast'):
                # Test casting
                spin_player._cast_spin_like()
                
                # Verify casting actions
                cast_calls = spin_player.keyboard.get_pressed_keys()
                assert len(cast_calls) > 0
    
    def test_bottom_fishing_workflow(self):
        """Test bottom fishing workflow"""
        cfg = get_cfg_defaults()
        cfg.SELECTED = cfg.PROFILE.BOTTOM.clone()
        cfg.freeze()
        
        window = MockWindowController()
        detection = MockDetection()
        
        with patch('rf4s.player.Detection', return_value=detection):
            with patch('rf4s.player.Timer'):
                with patch('rf4s.player.Notification'):
                    with patch('rf4s.player.keyboard.Controller'):
                        with patch('rf4s.player.mouse.Controller'):
                            player = Player(cfg, window)
        
        detection.set_responses({
            'is_rod_tip_movement': True
        })
        
        with patch.object(player.timer, 'delay'):
            with patch.object(player, '_switch_to_rod'):
                with patch('time.time', side_effect=[0, 1]):
                    result = player._wait_for_fish_bottom()
                    assert result is True
```

## Integration Tests

### End-to-End Fishing Tests

```python
# tests/integration/test_fishing_workflow.py
import pytest
from unittest.mock import Mock, patch
import time

from rf4s.app.app import RF4SApp
from rf4s.config.defaults import get_cfg_defaults
from tests.mocks.mock_game_window import MockWindowController
from tests.mocks.mock_detection import MockDetection

class TestFishingWorkflow:
    """Test complete fishing workflow integration"""
    
    @pytest.fixture
    def fishing_app(self):
        """Create complete fishing application for integration testing"""
        cfg = get_cfg_defaults()
        cfg.SELECTED = cfg.PROFILE.SPIN.clone()
        cfg.SELECTED.NAME = "TEST_INTEGRATION"
        
        # Mock external dependencies
        with patch('rf4s.app.app.setup_cfg', return_value=cfg):
            with patch('rf4s.controller.window.Window', return_value=MockWindowController()):
                with patch('rf4s.controller.detection.Detection', return_value=MockDetection()):
                    with patch('rf4s.player.Timer'):
                        with patch('rf4s.player.Notification'):
                            app = RF4SApp()
                            app.cfg = cfg
                            return app
    
    def test_complete_fishing_session(self, fishing_app):
        """Test a complete fishing session from start to finish"""
        detection = fishing_app.player.detection
        
        # Define fishing scenario
        fishing_scenario = [
            # Cast 1: Successful catch
            {'is_casting_bar_exist': True, 'is_fish_on_line_exist': True, 
             'is_spool_exist': True, 'fish_caught': True},
            # Cast 2: Timeout
            {'is_casting_bar_exist': True, 'is_fish_on_line_exist': False, 
             'is_spool_exist': True, 'fish_caught': False},
            # Cast 3: Snag
            {'is_casting_bar_exist': True, 'is_snag_exist': True, 
             'fish_caught': False}
        ]
        
        with patch.object(fishing_app.player, '_should_quit', side_effect=[False, False, False, True]):
            with patch.object(fishing_app.player.timer, 'delay'):
                with patch('time.time', side_effect=range(100)):  # Mock time progression
                    
                    # Run fishing session
                    for i, scenario in enumerate(fishing_scenario):
                        detection.set_responses(scenario)
                        
                        # Execute one fishing cycle
                        fishing_app.player._handle_idle_state()
                        
                        if scenario.get('fish_caught'):
                            assert fishing_app.player._fishes_caught_count == i + 1
    
    def test_error_recovery(self, fishing_app):
        """Test error recovery during fishing"""
        detection = fishing_app.player.detection
        
        # Simulate connection loss
        detection.set_response('is_disconnected_indicator_exist', True)
        
        with patch.object(fishing_app.player, '_handle_error_state') as mock_error_handler:
            fishing_app.player.check_connection()
            
            # Should transition to error state
            assert fishing_app.player._is_connected is False
    
    def test_configuration_integration(self, fishing_app):
        """Test configuration integration across components"""
        # Verify configuration is properly propagated
        assert fishing_app.cfg.SELECTED.MODE == "spin"
        assert fishing_app.player.cfg == fishing_app.cfg
        assert fishing_app.player.detection.cfg == fishing_app.cfg
    
    def test_notification_integration(self, fishing_app):
        """Test notification system integration"""
        # Enable notifications
        fishing_app.cfg.NOTIFICATION.EMAIL.ENABLED = True
        
        with patch.object(fishing_app.player.notification, 'send_notification') as mock_notify:
            # Simulate fish catch
            fish_info = {'name': 'Carp', 'weight': '2.5'}
            fishing_app.player._send_fish_notification(fish_info, True)
            
            mock_notify.assert_called_once()

class TestToolIntegration:
    """Test integration of individual tools"""
    
    def test_craft_tool_integration(self):
        """Test craft tool integration"""
        from tools.craft import CraftApp
        
        with patch('rf4s.app.app.setup_cfg'):
            with patch('rf4s.controller.window.Window'):
                with patch('rf4s.controller.detection.Detection'):
                    with patch('sys.argv', ['craft.py']):
                        app = CraftApp()
                        
                        with patch.object(app, '_start') as mock_start:
                            app.start()
                            mock_start.assert_called_once()
    
    def test_harvest_tool_integration(self):
        """Test harvest tool integration"""
        from tools.harvest import HarvestApp
        
        with patch('rf4s.app.app.setup_cfg'):
            with patch('rf4s.controller.window.Window'):
                with patch('rf4s.controller.detection.Detection'):
                    with patch('sys.argv', ['harvest.py']):
                        app = HarvestApp()
                        
                        with patch.object(app, '_start') as mock_start:
                            app.start()
                            mock_start.assert_called_once()
```

## Performance Tests

```python
# tests/performance/test_detection_speed.py
import pytest
import time
import numpy as np
from unittest.mock import patch, Mock

from rf4s.controller.detection import Detection
from rf4s.config.defaults import get_cfg_defaults
from tests.mocks.mock_game_window import MockWindowController
from tests.fixtures.test_images import create_test_image

class TestDetectionPerformance:
    """Test detection system performance"""
    
    @pytest.fixture
    def detection_system(self):
        """Create detection system for performance testing"""
        cfg = get_cfg_defaults()
        window = MockWindowController()
        
        with patch('rf4s.controller.detection.mss.mss'):
            with patch('rf4s.controller.detection.pytesseract'):
                detection = Detection(cfg, window)
                detection.sct = Mock()
                return detection
    
    def test_template_matching_speed(self, detection_system):
        """Test template matching performance"""
        # Create test data
        screenshot = create_test_image(1920, 1080, grayscale=True)
        template = create_test_image(100, 100, grayscale=True)
        
        detection_system.get_screenshot_as_gray = Mock(return_value=screenshot)
        detection_system.load_image = Mock(return_value=template)
        
        # Measure performance
        iterations = 100
        start_time = time.time()
        
        with patch('cv2.matchTemplate', return_value=np.array([[0.8]])):
            with patch('cv2.minMaxLoc', return_value=(0, 0.8, (0, 0), (0, 0))):
                for _ in range(iterations):
                    detection_system.is_image_exist("test_template")
        
        end_time = time.time()
        avg_time = (end_time - start_time) / iterations
        
        # Assert performance requirement
        assert avg_time < 0.1, f"Template matching too slow: {avg_time:.3f}s per detection"
    
    def test_screenshot_capture_speed(self, detection_system):
        """Test screenshot capture performance"""
        test_image = create_test_image(200, 200, channels=4)
        detection_system.sct.grab = Mock(return_value=test_image)
        
        iterations = 50
        start_time = time.time()
        
        with patch('numpy.array', return_value=test_image[:,:,:3]):
            for _ in range(iterations):
                detection_system.get_screenshot_as_gray((0, 0, 200, 200))
        
        end_time = time.time()
        avg_time = (end_time - start_time) / iterations
        
        assert avg_time < 0.05, f"Screenshot capture too slow: {avg_time:.3f}s per capture"
    
    def test_ocr_performance(self, detection_system):
        """Test OCR performance"""
        test_image = create_test_image(200, 50, channels=4)
        detection_system.sct.grab = Mock(return_value=test_image)
        
        iterations = 10  # OCR is slower
        start_time = time.time()
        
        with patch('numpy.array', return_value=test_image[:,:,:3]):
            with patch('pytesseract.image_to_string', return_value="Test Text"):
                for _ in range(iterations):
                    detection_system.get_text((0, 0, 200, 50))
        
        end_time = time.time()
        avg_time = (end_time - start_time) / iterations
        
        assert avg_time < 0.5, f"OCR too slow: {avg_time:.3f}s per extraction"
    
    def test_memory_usage(self, detection_system):
        """Test memory usage during detection"""
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # Perform many detections
        screenshot = create_test_image(1920, 1080, grayscale=True)
        template = create_test_image(100, 100, grayscale=True)
        
        detection_system.get_screenshot_as_gray = Mock(return_value=screenshot)
        detection_system.load_image = Mock(return_value=template)
        
        with patch('cv2.matchTemplate', return_value=np.array([[0.8]])):
            with patch('cv2.minMaxLoc', return_value=(0, 0.8, (0, 0), (0, 0))):
                for _ in range(1000):
                    detection_system.is_image_exist("test_template")
        
        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = final_memory - initial_memory
        
        # Should not increase memory significantly (less than 100MB)
        assert memory_increase < 100, f"Memory usage increased by {memory_increase:.1f}MB"
```

## Test Fixtures and Utilities

```python
# tests/fixtures/test_images.py
import numpy as np
import cv2
from typing import Optional

def create_test_image(width: int, height: int, channels: int = 3, 
                     grayscale: bool = False, pattern: str = "random") -> np.ndarray:
    """
    Create test images for detection testing
    
    Args:
        width: Image width
        height: Image height
        channels: Number of color channels
        grayscale: Whether to create grayscale image
        pattern: Pattern type ('random', 'solid', 'gradient', 'checkerboard')
    
    Returns:
        NumPy array representing the test image
    """
    if pattern == "random":
        if grayscale:
            return np.random.randint(0, 255, (height, width), dtype=np.uint8)
        else:
            return np.random.randint(0, 255, (height, width, channels), dtype=np.uint8)
    
    elif pattern == "solid":
        color = 128  # Gray
        if grayscale:
            return np.full((height, width), color, dtype=np.uint8)
        else:
            return np.full((height, width, channels), color, dtype=np.uint8)
    
    elif pattern == "gradient":
        if grayscale:
            gradient = np.linspace(0, 255, width, dtype=np.uint8)
            return np.tile(gradient, (height, 1))
        else:
            gradient = np.linspace(0, 255, width, dtype=np.uint8)
            image = np.tile(gradient, (height, 1))
            return np.stack([image] * channels, axis=2)
    
    elif pattern == "checkerboard":
        checkerboard = np.zeros((height, width), dtype=np.uint8)
        checkerboard[::20, ::20] = 255
        checkerboard[10::20, 10::20] = 255
        
        if grayscale:
            return checkerboard
        else:
            return np.stack([checkerboard] * channels, axis=2)
    
    else:
        raise ValueError(f"Unknown pattern: {pattern}")

def create_fish_template(fish_name: str) -> np.ndarray:
    """Create mock fish template image"""
    # Create a distinctive pattern for each fish
    fish_patterns = {
        'carp': 'solid',
        'pike': 'gradient',
        'bass': 'checkerboard'
    }
    
    pattern = fish_patterns.get(fish_name.lower(), 'random')
    return create_test_image(80, 40, pattern=pattern)

def create_ui_element_template(element_name: str) -> np.ndarray:
    """Create mock UI element template"""
    element_sizes = {
        'spool': (30, 30),
        'meter': (40, 20),
        'fish_on_line': (60, 30),
        'snag': (50, 25),
        'casting_bar': (150, 20)
    }
    
    width, height = element_sizes.get(element_name, (50, 50))
    return create_test_image(width, height, pattern="solid")
```

```python
# tests/fixtures/test_data.py
from typing import Dict, Any, List
import random

def generate_fish_data() -> Dict[str, Any]:
    """Generate realistic fish data for testing"""
    fish_types = ['Carp', 'Pike', 'Bass', 'Trout', 'Salmon', 'Perch']
    
    return {
        'name': random.choice(fish_types),
        'weight': f"{random.uniform(0.5, 10.0):.2f}",
        'length': f"{random.uniform(20, 80):.1f}",
        'is_tagged': random.choice([True, False]),
        'tag_color': random.choice(['red', 'blue', 'green', 'yellow', None]),
        'is_rare': random.choice([True, False]),
        'timestamp': random.uniform(1000000000, 2000000000)
    }

def generate_session_data(fish_count: int = 10) -> List[Dict[str, Any]]:
    """Generate fishing session data for testing"""
    session = []
    
    for i in range(fish_count):
        fish = generate_fish_data()
        fish['cast_number'] = i + 1
        fish['time_to_catch'] = random.uniform(30, 300)  # 30s to 5min
        session.append(fish)
    
    return session

def generate_performance_data() -> Dict[str, float]:
    """Generate performance metrics for testing"""
    return {
        'detection_time': random.uniform(0.01, 0.1),
        'screenshot_time': random.uniform(0.005, 0.05),
        'ocr_time': random.uniform(0.1, 0.5),
        'memory_usage': random.uniform(50, 200),  # MB
        'cpu_usage': random.uniform(5, 30)  # Percentage
    }
```

This comprehensive testing framework provides robust validation capabilities for the RF4S system, ensuring reliability, performance, and maintainability across all components.
        