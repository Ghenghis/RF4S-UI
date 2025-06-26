# RF4S Detection Controller Blueprint

## Overview

The Detection controller is the visual recognition engine of the RF4S system, responsible for interpreting the game state through image recognition and optical character recognition (OCR). It serves as the "eyes" of the automation system, enabling the script to respond to visual cues and UI elements within Russian Fishing 4.

## Architecture

### Class Structure

```python
class Detection:
    def __init__(self, cfg: CfgNode, window: Window)
    def load_image(self, name: str, mode: str = cv2.IMREAD_COLOR) -> np.ndarray
    def get_screenshot_as_gray(self, bbox: tuple) -> np.ndarray
    def is_image_exist(self, name: str, bbox: tuple = None, threshold: float = None) -> bool
    def get_text(self, bbox: tuple) -> str
    
    # Specific detection methods
    def is_spool_exist(self) -> bool
    def is_spool_disappear(self) -> bool
    def is_meter_exist(self) -> bool
    def is_meter_disappear(self) -> bool
    def is_snag_exist(self) -> bool
    def is_fish_on_line_exist(self) -> bool
    def is_fish_name_exist(self, name: str) -> bool
    def is_fish_tagged(self, tags: list[str] = None) -> str | None
    def is_float_diving(self) -> bool
    def is_float_wobble(self) -> bool
    def is_casting_bar_exist(self) -> bool
    def is_rod_tip_movement(self) -> bool
```

### Dependencies

- **OpenCV (cv2)**: Core image processing and template matching
- **MSS**: High-performance screen capture
- **Pytesseract**: OCR text extraction
- **NumPy**: Array operations for image data
- **Pathlib**: Image template file management

### Core Attributes

```python
class Detection:
    cfg: CfgNode                    # Configuration object
    window: Window                  # Window controller instance
    sct: mss.mss.MSS               # Screen capture object
    language: str                   # Game language setting
    image_dir: Path                 # Template images directory
    image_templates: dict           # Cached image templates
```

## Image Template System

### Template Organization

```
static/
├── en/                    # English game language
│   ├── spool.png         # Red spool indicator
│   ├── meter.png         # Green meter indicator
│   ├── fish_on_line.png  # Fish bite indicator
│   ├── snag.png          # Snag/stuck indicator
│   ├── casting_bar.png   # Casting power bar
│   ├── fish_names/       # Individual fish recognition
│   │   ├── carp.png
│   │   ├── pike.png
│   │   └── ...
│   └── tags/             # Fish tag colors
│       ├── red_tag.png
│       ├── blue_tag.png
│       └── ...
├── ru/                   # Russian game language
├── de/                   # German game language
└── ...
```

### Template Loading Strategy

```python
def load_image(self, name: str, mode: str = cv2.IMREAD_COLOR) -> np.ndarray:
    """
    Load and cache image templates for efficient reuse
    
    Args:
        name: Template image filename (without extension)
        mode: OpenCV imread mode (color, grayscale, etc.)
    
    Returns:
        NumPy array representing the image
    
    Caching Strategy:
    - Templates are loaded once and cached in memory
    - Language-specific template selection
    - Fallback to default language if template missing
    """
    cache_key = f"{name}_{mode}"
    if cache_key not in self.image_templates:
        image_path = self.image_dir / f"{name}.png"
        if not image_path.exists():
            # Fallback to default language
            image_path = self.image_dir.parent / "en" / f"{name}.png"
        
        template = cv2.imread(str(image_path), mode)
        self.image_templates[cache_key] = template
    
    return self.image_templates[cache_key]
```

## Detection Methods

### Core Image Recognition

```python
def is_image_exist(self, name: str, bbox: tuple = None, threshold: float = None) -> bool:
    """
    Primary template matching method
    
    Process:
    1. Capture screenshot of specified region (or full screen)
    2. Load template image
    3. Perform template matching using cv2.matchTemplate
    4. Check if best match exceeds confidence threshold
    
    Args:
        name: Template image name
        bbox: Screen region to search (x, y, width, height)
        threshold: Confidence threshold (0.0-1.0)
    
    Returns:
        Boolean indicating if template was found with sufficient confidence
    """
    if bbox is None:
        # Use full game window
        bbox = self.window.get_game_window_bbox()
    
    if threshold is None:
        threshold = self.cfg.SCRIPT.SPOOL_CONFIDENCE
    
    # Capture screenshot
    screenshot = self.get_screenshot_as_gray(bbox)
    
    # Load template
    template = self.load_image(name, cv2.IMREAD_GRAYSCALE)
    
    # Template matching
    result = cv2.matchTemplate(screenshot, template, cv2.TM_CCOEFF_NORMED)
    _, max_val, _, _ = cv2.minMaxLoc(result)
    
    return max_val >= threshold
```

### OCR Text Extraction

```python
def get_text(self, bbox: tuple) -> str:
    """
    Extract text from screen region using OCR
    
    Process:
    1. Capture screenshot of specified region
    2. Apply image preprocessing for better OCR accuracy
    3. Use Tesseract to extract text
    4. Clean and return text
    
    Args:
        bbox: Screen region coordinates (x, y, width, height)
    
    Returns:
        Extracted text string
    """
    # Capture screenshot
    screenshot = self.sct.grab(bbox)
    img = np.array(screenshot)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply preprocessing for better OCR
    # - Gaussian blur to reduce noise
    # - Thresholding to enhance text contrast
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # OCR configuration for fishing game text
    custom_config = r'--oem 3 --psm 8 -c tessedit_char_whitelist=0123456789.ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz '
    
    # Extract text
    text = pytesseract.image_to_string(thresh, config=custom_config)
    
    # Clean extracted text
    return text.strip()
```

## Specialized Detection Methods

### Fishing State Detection

```python
def is_spool_exist(self) -> bool:
    """Detect red spool indicator during line retrieval"""
    bbox = self.cfg.DETECTION.SPOOL_REGION
    return self.is_image_exist("spool", bbox, self.cfg.SCRIPT.SPOOL_CONFIDENCE)

def is_meter_exist(self) -> bool:
    """Detect green meter indicator during line retrieval"""
    bbox = self.cfg.DETECTION.METER_REGION
    return self.is_image_exist("meter", bbox, self.cfg.SCRIPT.METER_CONFIDENCE)

def is_fish_on_line_exist(self) -> bool:
    """Detect fish bite indicator"""
    bbox = self.cfg.DETECTION.FISH_INDICATOR_REGION
    return self.is_image_exist("fish_on_line", bbox)

def is_snag_exist(self) -> bool:
    """Detect snag/stuck indicator"""
    bbox = self.cfg.DETECTION.SNAG_REGION
    return self.is_image_exist("snag", bbox)
```

### Float Fishing Detection

```python
def is_float_diving(self) -> bool:
    """
    Detect float diving motion (bite indicator)
    
    Implementation approaches:
    1. Template matching for submerged float
    2. Motion detection in float region
    3. Color change detection (float visibility)
    """
    # Method 1: Template matching
    bbox = self.cfg.DETECTION.FLOAT_REGION
    return self.is_image_exist("float_diving", bbox)

def is_float_wobble(self) -> bool:
    """
    Detect float wobbling motion (preliminary bite indicator)
    
    Implementation:
    - Compare consecutive screenshots for position changes
    - Calculate movement delta
    - Return true if movement exceeds sensitivity threshold
    """
    bbox = self.cfg.DETECTION.FLOAT_REGION
    
    # Capture current and previous screenshots
    current = self.get_screenshot_as_gray(bbox)
    
    if hasattr(self, '_prev_float_screenshot'):
        # Calculate frame difference
        diff = cv2.absdiff(current, self._prev_float_screenshot)
        
        # Calculate movement magnitude
        movement = np.sum(diff) / (diff.shape[0] * diff.shape[1])
        
        self._prev_float_screenshot = current
        
        return movement > self.cfg.PROFILE.SELECTED.FLOAT_SENSITIVITY
    else:
        self._prev_float_screenshot = current
        return False
```

### Fish Recognition

```python
def is_fish_name_exist(self, name: str) -> bool:
    """
    Detect specific fish by name (for whitelist/blacklist)
    
    Args:
        name: Fish name to detect
    
    Returns:
        Boolean indicating if specified fish was caught
    """
    bbox = self.cfg.DETECTION.FISH_NAME_REGION
    template_name = f"fish_names/{name.lower()}"
    return self.is_image_exist(template_name, bbox)

def is_fish_tagged(self, tags: list[str] = None) -> str | None:
    """
    Detect fish tag colors
    
    Args:
        tags: List of tag colors to check
    
    Returns:
        Detected tag color or None if no tags found
    """
    if tags is None:
        tags = ["red", "blue", "green", "yellow", "purple"]
    
    bbox = self.cfg.DETECTION.FISH_TAG_REGION
    
    for tag_color in tags:
        template_name = f"tags/{tag_color}_tag"
        if self.is_image_exist(template_name, bbox):
            return tag_color
    
    return None
```

## Performance Optimization

### Screenshot Caching

```python
class Detection:
    def __init__(self, cfg: CfgNode, window: Window):
        # ... existing initialization ...
        self._screenshot_cache = {}
        self._cache_timestamp = 0
        self._cache_duration = 0.1  # 100ms cache duration
    
    def get_screenshot_as_gray(self, bbox: tuple) -> np.ndarray:
        """
        Cached screenshot capture to reduce redundant screen grabs
        """
        current_time = time.time()
        cache_key = str(bbox)
        
        if (current_time - self._cache_timestamp > self._cache_duration or 
            cache_key not in self._screenshot_cache):
            
            screenshot = self.sct.grab(bbox)
            img = np.array(screenshot)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            self._screenshot_cache[cache_key] = gray
            self._cache_timestamp = current_time
        
        return self._screenshot_cache[cache_key]
```

### Multi-Scale Template Matching

```python
def is_image_exist_multiscale(self, name: str, bbox: tuple = None, 
                             scales: list = None) -> bool:
    """
    Template matching with multiple scales for better reliability
    
    Handles slight size variations in game UI elements
    """
    if scales is None:
        scales = [0.8, 0.9, 1.0, 1.1, 1.2]
    
    screenshot = self.get_screenshot_as_gray(bbox)
    template = self.load_image(name, cv2.IMREAD_GRAYSCALE)
    
    for scale in scales:
        # Resize template
        width = int(template.shape[1] * scale)
        height = int(template.shape[0] * scale)
        resized_template = cv2.resize(template, (width, height))
        
        # Skip if template is larger than screenshot
        if (resized_template.shape[0] > screenshot.shape[0] or 
            resized_template.shape[1] > screenshot.shape[1]):
            continue
        
        # Template matching
        result = cv2.matchTemplate(screenshot, resized_template, cv2.TM_CCOEFF_NORMED)
        _, max_val, _, _ = cv2.minMaxLoc(result)
        
        if max_val >= self.cfg.SCRIPT.SPOOL_CONFIDENCE:
            return True
    
    return False
```

## Error Handling and Robustness

### Detection Validation

```python
def validate_detection_environment(self) -> bool:
    """
    Validate that detection can function properly
    
    Checks:
    - Game window is active and properly sized
    - Template images exist for current language
    - Screen capture is functioning
    - OCR engine is available
    """
    try:
        # Check window
        if not self.window.is_size_supported():
            logging.error("Unsupported window size for detection")
            return False
        
        # Check template images
        required_templates = ["spool", "meter", "fish_on_line", "snag"]
        for template in required_templates:
            if not (self.image_dir / f"{template}.png").exists():
                logging.error(f"Missing template: {template}.png")
                return False
        
        # Test screen capture
        bbox = (0, 0, 100, 100)
        test_screenshot = self.get_screenshot_as_gray(bbox)
        if test_screenshot is None or test_screenshot.size == 0:
            logging.error("Screen capture failed")
            return False
        
        # Test OCR
        test_text = self.get_text(bbox)
        # OCR test passes if no exception is raised
        
        return True
        
    except Exception as e:
        logging.error(f"Detection validation failed: {e}")
        return False
```

### Adaptive Thresholds

```python
def auto_calibrate_thresholds(self) -> None:
    """
    Automatically adjust detection thresholds based on current game conditions
    
    Useful for handling different lighting conditions or graphics settings
    """
    # Capture baseline screenshots
    known_positive_regions = self.cfg.DETECTION.CALIBRATION_REGIONS
    
    for region_name, bbox in known_positive_regions.items():
        # Capture multiple samples
        samples = []
        for _ in range(5):
            screenshot = self.get_screenshot_as_gray(bbox)
            template = self.load_image(region_name, cv2.IMREAD_GRAYSCALE)
            
            result = cv2.matchTemplate(screenshot, template, cv2.TM_CCOEFF_NORMED)
            _, max_val, _, _ = cv2.minMaxLoc(result)
            samples.append(max_val)
            
            time.sleep(0.1)  # Brief delay between samples
        
        # Calculate optimal threshold
        avg_confidence = np.mean(samples)
        std_confidence = np.std(samples)
        
        # Set threshold to 2 standard deviations below average
        optimal_threshold = max(0.5, avg_confidence - (2 * std_confidence))
        
        # Update configuration
        self.cfg.DETECTION.THRESHOLDS[region_name] = optimal_threshold
        
        logging.info(f"Calibrated {region_name} threshold: {optimal_threshold:.3f}")
```

## Integration Points

### Controller Integration

```python
# Usage in Player class
class Player:
    def __init__(self, cfg: CfgNode, window: Window):
        self.detection = Detection(cfg, window)
    
    def wait_for_fish(self):
        """Example integration in fishing logic"""
        start_time = time.time()
        timeout = self.cfg.PROFILE.SELECTED.BITE_TIMEOUT
        
        while time.time() - start_time < timeout:
            if self.detection.is_fish_on_line_exist():
                logging.info("Fish detected!")
                return True
            
            if self.detection.is_snag_exist():
                logging.warning("Snag detected!")
                return False
            
            time.sleep(0.1)  # Check every 100ms
        
        logging.info("Bite timeout")
        return False
```

### Configuration Dependencies

```yaml
# config.yaml detection settings
DETECTION:
  SPOOL_REGION: [100, 200, 50, 50]
  METER_REGION: [150, 200, 50, 50]
  FISH_INDICATOR_REGION: [200, 100, 100, 50]
  FISH_NAME_REGION: [300, 150, 200, 30]
  FISH_TAG_REGION: [320, 180, 20, 20]
  FLOAT_REGION: [400, 300, 100, 100]
  
  THRESHOLDS:
    spool: 0.8
    meter: 0.8
    fish_on_line: 0.75
    snag: 0.7

SCRIPT:
  SPOOL_CONFIDENCE: 0.8
  METER_CONFIDENCE: 0.8
  LANGUAGE: "en"
```

This Detection controller blueprint provides the foundation for implementing robust visual recognition in the RF4S system, handling the complex task of interpreting game state through computer vision techniques.