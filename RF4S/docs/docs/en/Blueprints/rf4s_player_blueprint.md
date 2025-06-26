# RF4S Player Core Logic Blueprint

## Overview

The Player class is the central orchestrator of the RF4S automation system, implementing the core fishing logic that coordinates all controllers, components, and game interactions. It represents the "brain" of the fishing bot, managing state transitions, decision making, and the complete fishing workflow.

## Architecture

### Class Structure

```python
class Player:
    def __init__(self, cfg: CfgNode, window: Window)
    
    # Core fishing methods
    def start_fishing(self) -> None
    def cast_rod(self) -> None
    def wait_for_fish(self) -> None
    def fish_fight(self) -> None
    def retrieve_line(self) -> None
    def handle_caught_fish(self) -> None
    
    # State management
    def check_connection(self) -> bool
    def check_consumables(self) -> None
    def check_keepnet_full(self) -> None
    def reset_spool_detection(self) -> None
    
    # Mode-specific implementations
    def _cast_spin_like(self) -> None
    def _retrieve_spin_like(self) -> None
    def _wait_for_fish_bottom(self) -> None
    def _wait_for_fish_float(self) -> None
    def _pirk(self) -> None
    def _elevator(self) -> None
    
    # Utility methods
    def build_result_dict(self, status: str) -> dict
    def build_result_table(self, result_dict: dict) -> Table
```

### Dependencies and Composition

```python
class Player:
    cfg: CfgNode                    # Configuration
    detection: Detection            # Visual recognition
    window: Window                  # Window management
    timer: Timer                    # Timing and delays
    notification: Notification      # External notifications
    friction_brake: FrictionBrake   # Auto brake (optional)
    
    # Input controllers
    keyboard: keyboard.Controller   # Keyboard simulation
    mouse: mouse.Controller         # Mouse simulation
    
    # State tracking
    _fishes_caught_count: int
    _coffee_drink_count: int
    _alcohol_drink_count: int
    _check_miss_count: int
    _is_fighting: bool
    _is_connected: bool
    _is_spooling: bool
    _trolling_direction: str
    _fishing_data: list
```

## Core Fishing State Machine

### State Definitions

```python
class FishingState(Enum):
    IDLE = "idle"
    CASTING = "casting"
    WAITING = "waiting"
    FIGHTING = "fighting"
    RETRIEVING = "retrieving"
    HANDLING_FISH = "handling_fish"
    PAUSED = "paused"
    ERROR = "error"
    FINISHED = "finished"

class Player:
    def __init__(self, cfg: CfgNode, window: Window):
        # ... initialization ...
        self.current_state = FishingState.IDLE
        self.state_start_time = time.time()
        self.state_history = []
```

### State Machine Implementation

```python
def start_fishing(self) -> None:
    """
    Main fishing loop implementing the core state machine
    """
    logging.info("Starting fishing automation")
    self.timer.start()
    
    try:
        while True:
            # Check for quit conditions
            if self._should_quit():
                break
            
            # State machine execution
            if self.current_state == FishingState.IDLE:
                self._handle_idle_state()
            elif self.current_state == FishingState.CASTING:
                self._handle_casting_state()
            elif self.current_state == FishingState.WAITING:
                self._handle_waiting_state()
            elif self.current_state == FishingState.FIGHTING:
                self._handle_fighting_state()
            elif self.current_state == FishingState.RETRIEVING:
                self._handle_retrieving_state()
            elif self.current_state == FishingState.HANDLING_FISH:
                self._handle_fish_handling_state()
            elif self.current_state == FishingState.PAUSED:
                self._handle_paused_state()
            elif self.current_state == FishingState.ERROR:
                self._handle_error_state()
            
            # Brief pause to prevent excessive CPU usage
            time.sleep(0.1)
    
    except KeyboardInterrupt:
        logging.info("Fishing interrupted by user")
    except Exception as e:
        logging.error(f"Fishing error: {e}")
        self._transition_to_state(FishingState.ERROR)
    finally:
        self._cleanup_fishing_session()

def _transition_to_state(self, new_state: FishingState, reason: str = None) -> None:
    """
    Handle state transitions with logging and validation
    """
    if new_state == self.current_state:
        return
    
    # Log state transition
    duration = time.time() - self.state_start_time
    logging.debug(f"State: {self.current_state.value} -> {new_state.value} "
                 f"(duration: {duration:.1f}s, reason: {reason})")
    
    # Update state history
    self.state_history.append({
        "from_state": self.current_state,
        "to_state": new_state,
        "timestamp": time.time(),
        "duration": duration,
        "reason": reason
    })
    
    # Perform state-specific cleanup
    self._cleanup_current_state()
    
    # Update current state
    self.current_state = new_state
    self.state_start_time = time.time()
    
    # Perform state-specific initialization
    self._initialize_new_state()
```

## Core Fishing Methods

### Casting Implementation

```python
def cast_rod(self) -> None:
    """
    Execute rod casting sequence with mode-specific behavior
    """
    try:
        self._transition_to_state(FishingState.CASTING, "Starting cast")
        
        # Pre-cast checks
        if not self._pre_cast_validation():
            self._transition_to_state(FishingState.ERROR, "Pre-cast validation failed")
            return
        
        # Handle mode-specific casting
        mode = self.cfg.SELECTED.MODE.upper()
        
        if mode in ["SPIN", "PIRK", "ELEVATOR"]:
            self._cast_spin_like()
        elif mode == "BOTTOM":
            self._cast_bottom()
        elif mode in ["TELESCOPIC", "BOLOGNESE"]:
            self._cast_float()
        else:
            raise ValueError(f"Unsupported fishing mode: {mode}")
        
        # Post-cast validation
        if self._post_cast_validation():
            self._transition_to_state(FishingState.WAITING, "Cast successful")
        else:
            self._transition_to_state(FishingState.ERROR, "Cast failed")
    
    except Exception as e:
        logging.error(f"Casting error: {e}")
        self._transition_to_state(FishingState.ERROR, f"Cast exception: {e}")

def _cast_spin_like(self) -> None:
    """
    Casting implementation for spin, pirk, and elevator modes
    """
    # Handle random cast skip
    if self.cfg.SELECTED.RANDOM_CAST and random.random() < 0.1:
        logging.info("Skipping cast (random behavior)")
        return
    
    # Handle lure management
    if self.cfg.SELECTED.LURE_CHANGE and self._should_change_lure():
        self._change_lure()
    
    # Handle broken lure detection
    if self.cfg.SELECTED.BROKEN_LURE and self.detection.is_broken_lure_exist():
        self._handle_broken_lure()
        return
    
    # Wait for casting bar
    if not self._wait_for_casting_bar():
        raise CastingError("Casting bar not detected")
    
    # Calculate cast power
    cast_power = self._calculate_cast_power()
    
    # Execute cast with power control
    self._execute_power_cast(cast_power)
    
    # Handle trolling if enabled
    if self.cfg.SELECTED.TROLLING:
        self._start_trolling()

def _execute_power_cast(self, power_level: float) -> None:
    """
    Execute power-controlled casting
    
    Args:
        power_level: Cast power from 0.0 to 10.0
    """
    # Convert power level to hold duration
    max_hold_time = self.cfg.SELECTED.MAX_CAST_HOLD_TIME
    hold_duration = (power_level / 10.0) * max_hold_time
    
    # Add random variation
    if self.cfg.SELECTED.RANDOM_CAST_POWER:
        variation = random.uniform(-0.1, 0.1)
        hold_duration *= (1.0 + variation)
    
    # Execute cast
    cast_key = self.cfg.KEY.CAST
    
    # Press and hold cast key
    self.keyboard.press(cast_key)
    
    # Wait for power buildup
    self.timer.delay(hold_duration, f"Building cast power: {power_level:.1f}")
    
    # Release cast key
    self.keyboard.release(cast_key)
    
    logging.info(f"Cast executed with power {power_level:.1f}")
    
    # Wait for cast animation
    cast_delay = self.cfg.SELECTED.CAST_DELAY
    self.timer.delay(cast_delay, "Waiting for cast animation")
```

### Fish Detection and Fighting

```python
def wait_for_fish(self) -> None:
    """
    Wait for fish bite with mode-specific detection
    """
    self._transition_to_state(FishingState.WAITING, "Waiting for fish")
    
    mode = self.cfg.SELECTED.MODE.upper()
    timeout = self.cfg.SELECTED.BITE_TIMEOUT
    
    start_time = time.time()
    
    while time.time() - start_time < timeout:
        # Check for quit conditions
        if self._should_quit():
            return
        
        # Check for snag
        if self.detection.is_snag_exist():
            logging.warning("Snag detected")
            self._handle_snag()
            return
        
        # Mode-specific bite detection
        if mode in ["SPIN", "PIRK", "ELEVATOR"]:
            if self._check_spin_bite():
                self._transition_to_state(FishingState.FIGHTING, "Spin bite detected")
                return
        elif mode == "BOTTOM":
            if self._check_bottom_bite():
                self._transition_to_state(FishingState.FIGHTING, "Bottom bite detected")
                return
        elif mode in ["TELESCOPIC", "BOLOGNESE"]:
            if self._check_float_bite():
                self._transition_to_state(FishingState.FIGHTING, "Float bite detected")
                return
        
        # Perform mode-specific actions while waiting
        if mode == "PIRK":
            self._pirk()
        elif mode == "ELEVATOR":
            self._elevator()
        
        # Brief pause before next check
        time.sleep(0.1)
    
    # Timeout reached
    logging.info("Bite timeout reached")
    self._transition_to_state(FishingState.RETRIEVING, "Timeout")

def fish_fight(self) -> None:
    """
    Handle fish fighting with automatic friction brake and stamina management
    """
    logging.info("Fish fight started")
    self._is_fighting = True
    
    # Initial rod lift
    self._lift_rod()
    
    fight_start_time = time.time()
    max_fight_duration = self.cfg.SELECTED.MAX_FIGHT_DURATION
    
    try:
        while self._is_fighting and time.time() - fight_start_time < max_fight_duration:
            # Check if fish is still on line
            if not self.detection.is_fish_on_line_exist():
                logging.info("Fish lost during fight")
                break
            
            # Check for snag during fight
            if self.detection.is_snag_exist():
                logging.warning("Snag during fish fight")
                self._handle_fight_snag()
                break
            
            # Automatic friction brake adjustment
            if self.friction_brake and self.cfg.SELECTED.AUTO_FRICTION_BRAKE:
                self.friction_brake.adjust_brake()
            
            # Stamina management
            if self._needs_coffee():
                self._drink_coffee()
            
            # Reel in fish
            self._reel_fish()
            
            # Check if fish is landed
            if self._is_fish_landed():
                logging.info("Fish landed successfully")
                self._transition_to_state(FishingState.HANDLING_FISH, "Fish landed")
                return
            
            # Brief pause
            time.sleep(0.05)
        
        # Fight timeout or other condition
        if time.time() - fight_start_time >= max_fight_duration:
            logging.warning("Fish fight timeout")
        
        self._is_fighting = False
        self._transition_to_state(FishingState.RETRIEVING, "Fight ended")
    
    except Exception as e:
        logging.error(f"Fish fight error: {e}")
        self._is_fighting = False
        self._transition_to_state(FishingState.ERROR, f"Fight error: {e}")

def _reel_fish(self) -> None:
    """
    Execute reeling action with timing and variation
    """
    reel_key = self.cfg.KEY.REEL
    
    # Determine reel duration based on fish resistance
    base_duration = self.cfg.SELECTED.REEL_DURATION
    
    # Add slight random variation
    if self.cfg.SELECTED.RANDOM_REEL:
        variation = random.uniform(0.8, 1.2)
        duration = base_duration * variation
    else:
        duration = base_duration
    
    # Execute reel action
    self.keyboard.press(reel_key)
    time.sleep(duration)
    self.keyboard.release(reel_key)
    
    # Brief pause between reel actions
    pause_duration = self.cfg.SELECTED.REEL_PAUSE
    time.sleep(pause_duration)
```

### Line Retrieval and Fish Handling

```python
def retrieve_line(self) -> None:
    """
    Retrieve fishing line with spool/meter detection
    """
    self._transition_to_state(FishingState.RETRIEVING, "Starting line retrieval")
    
    retrieval_start_time = time.time()
    max_retrieval_time = self.cfg.SELECTED.MAX_RETRIEVAL_TIME
    
    # Reset spool detection state
    self.reset_spool_detection()
    
    try:
        while time.time() - retrieval_start_time < max_retrieval_time:
            # Check for retrieval completion
            if self._is_retrieval_complete():
                logging.info("Line retrieval complete")
                self._transition_to_state(FishingState.IDLE, "Retrieval complete")
                return
            
            # Continue reeling
            self._execute_retrieval_reel()
            
            # Brief pause
            time.sleep(0.1)
        
        # Retrieval timeout
        logging.warning("Line retrieval timeout")
        self._force_retrieval_completion()
        self._transition_to_state(FishingState.IDLE, "Retrieval timeout")
    
    except Exception as e:
        logging.error(f"Line retrieval error: {e}")
        self._transition_to_state(FishingState.ERROR, f"Retrieval error: {e}")

def _is_retrieval_complete(self) -> bool:
    """
    Determine if line retrieval is complete based on visual indicators
    """
    # Check for spool disappearance (primary indicator)
    if self.detection.is_spool_disappear():
        return True
    
    # Check for meter disappearance (alternative indicator)
    if self.detection.is_meter_disappear():
        return True
    
    # Check for idle rod state
    if self.detection.is_rod_idle():
        return True
    
    return False

def handle_caught_fish(self) -> None:
    """
    Process caught fish with tagging, statistics, and keepnet management
    """
    logging.info("Processing caught fish")
    
    try:
        # Wait for fish information to appear
        if not self._wait_for_fish_info():
            logging.warning("Fish information not detected")
            self._transition_to_state(FishingState.IDLE, "No fish info")
            return
        
        # Extract fish information
        fish_info = self._extract_fish_info()
        
        # Check whitelist/blacklist
        keep_fish = self._should_keep_fish(fish_info)
        
        # Handle fish tagging
        if self.cfg.SELECTED.TAG and fish_info.get('is_rare', False):
            self._tag_fish()
        
        # Take screenshot if enabled
        if self.cfg.SELECTED.SCREENSHOT:
            self._take_fish_screenshot(fish_info)
        
        # Drink alcohol before keeping (if enabled)
        if self.cfg.SELECTED.ALCOHOL and keep_fish:
            self._drink_alcohol()
        
        # Keep or release fish
        if keep_fish:
            self._keep_fish()
            self._fishes_caught_count += 1
            logging.info(f"Fish kept: {fish_info.get('name', 'Unknown')} "
                        f"({fish_info.get('weight', 'Unknown')})")
        else:
            self._release_fish()
            logging.info(f"Fish released: {fish_info.get('name', 'Unknown')} "
                        f"(blacklisted or not whitelisted)")
        
        # Update fishing data
        self._update_fishing_data(fish_info, keep_fish)
        
        # Send notification if enabled
        if self.cfg.NOTIFICATION.ENABLED:
            self._send_fish_notification(fish_info, keep_fish)
        
        # Check keepnet status
        if keep_fish:
            self.check_keepnet_full()
        
        self._transition_to_state(FishingState.IDLE, "Fish processed")
    
    except Exception as e:
        logging.error(f"Fish handling error: {e}")
        self._transition_to_state(FishingState.ERROR, f"Fish handling error: {e}")

def _extract_fish_info(self) -> dict:
    """
    Extract fish information from game UI using OCR and detection
    """
    fish_info = {
        'name': 'Unknown',
        'weight': 'Unknown',
        'length': 'Unknown',
        'is_tagged': False,
        'tag_color': None,
        'is_rare': False,
        'timestamp': time.time()
    }
    
    try:
        # Extract fish name
        name_region = self.cfg.DETECTION.FISH_NAME_REGION
        fish_name = self.detection.get_text(name_region).strip()
        if fish_name:
            fish_info['name'] = fish_name
        
        # Extract fish weight
        weight_region = self.cfg.DETECTION.FISH_WEIGHT_REGION
        weight_text = self.detection.get_text(weight_region).strip()
        if weight_text:
            # Parse weight (e.g., "2.45 kg" -> "2.45")
            import re
            weight_match = re.search(r'(\d+\.?\d*)', weight_text)
            if weight_match:
                fish_info['weight'] = weight_match.group(1)
        
        # Extract fish length
        length_region = self.cfg.DETECTION.FISH_LENGTH_REGION
        length_text = self.detection.get_text(length_region).strip()
        if length_text:
            length_match = re.search(r'(\d+\.?\d*)', length_text)
            if length_match:
                fish_info['length'] = length_match.group(1)
        
        # Check for tags
        tag_colors = self.cfg.KEEPNET.TAGS
        detected_tag = self.detection.is_fish_tagged(tag_colors)
        if detected_tag:
            fish_info['is_tagged'] = True
            fish_info['tag_color'] = detected_tag
            fish_info['is_rare'] = True
        
        # Check if fish is rare/valuable
        rare_indicators = self.cfg.DETECTION.RARE_FISH_INDICATORS
        for indicator in rare_indicators:
            if self.detection.is_image_exist(indicator):
                fish_info['is_rare'] = True
                break
    
    except Exception as e:
        logging.error(f"Error extracting fish info: {e}")
    
    return fish_info

def _should_keep_fish(self, fish_info: dict) -> bool:
    """
    Determine whether to keep or release the fish based on whitelist/blacklist
    """
    fish_name = fish_info.get('name', '').lower()
    
    # Always keep tagged fish if tag handling is enabled
    if self.cfg.SELECTED.TAG and fish_info.get('is_tagged', False):
        return True
    
    # Check whitelist (if defined, only keep whitelisted fish)
    whitelist = [name.lower() for name in self.cfg.KEEPNET.WHITELIST]
    if whitelist and fish_name not in whitelist:
        return False
    
    # Check blacklist (never keep blacklisted fish)
    blacklist = [name.lower() for name in self.cfg.KEEPNET.BLACKLIST]
    if blacklist and fish_name in blacklist:
        return False
    
    # Default behavior: keep fish
    return True
```