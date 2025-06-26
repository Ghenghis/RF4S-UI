# RF4S UI Blueprint Feature List - Section 2: Key Binding Features

## 2. KEY BINDING CONFIGURATION FEATURES

### 2.1 Consumable Item Keys
- **Feature ID**: `KEY_TEA`
- **Type**: Key Binding Selector
- **Default**: `-1` (Quick Selection Menu)
- **Range**: `-1` or `1-9`, `F1-F12`, `A-Z`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Failsafe**: Falls back to -1 (menu) if invalid
- **UI Component**: KeyCaptureButton with visual key display
- **Theme Customizable**: ✅ Button style, key visualization, hover effects

- **Feature ID**: `KEY_CARROT`
- **Type**: Key Binding Selector
- **Default**: `-1` (Quick Selection Menu)
- **Range**: `-1` or `1-9`, `F1-F12`, `A-Z`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Failsafe**: Falls back to -1 (menu) if invalid
- **UI Component**: KeyCaptureButton with visual key display
- **Theme Customizable**: ✅ Button style, key visualization, hover effects

- **Feature ID**: `KEY_COFFEE`
- **Type**: Key Binding Selector
- **Default**: `4`
- **Range**: `1-9`, `F1-F12`, `A-Z`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Conflict Detection**: ✅ Prevents duplicate assignments
- **UI Component**: KeyCaptureButton with conflict warning
- **Theme Customizable**: ✅ Button style, warning colors

- **Feature ID**: `KEY_ALCOHOL`
- **Type**: Key Binding Selector
- **Default**: `6`
- **Range**: `1-9`, `F1-F12`, `A-Z`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Conflict Detection**: ✅ Prevents duplicate assignments
- **UI Component**: KeyCaptureButton with conflict warning
- **Theme Customizable**: ✅ Button style, warning colors

### 2.2 Tool & Equipment Keys
- **Feature ID**: `KEY_DIGGING_TOOL`
- **Type**: Key Binding Selector
- **Default**: `5`
- **Range**: `1-9`, `F1-F12`, `A-Z`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Conflict Detection**: ✅ Prevents duplicate assignments
- **UI Component**: KeyCaptureButton with tool icon
- **Theme Customizable**: ✅ Button style, icon colors

### 2.3 Rod Configuration Keys
- **Feature ID**: `KEY_BOTTOM_RODS`
- **Type**: Multi-Key Binding Array
- **Default**: `[1, 2, 3]`
- **Range**: Array of `1-9`, `F1-F12`, `A-Z`
- **Max Items**: `6` (game limitation)
- **Editable**: ✅ Yes (add/remove/reorder)
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Conflict Detection**: ✅ No duplicates within array
- **UI Component**: DynamicKeyList with drag-and-drop reordering
- **Theme Customizable**: ✅ List style, drag indicators, spacing

- **Feature ID**: `KEY_MAIN_ROD`
- **Type**: Key Binding Selector
- **Default**: `1`
- **Range**: `1-9`, `F1-F12`, `A-Z`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Conflict Detection**: ✅ Prevents duplicate assignments
- **UI Component**: KeyCaptureButton with rod icon
- **Theme Customizable**: ✅ Button style, rod visualization

- **Feature ID**: `KEY_SPOD_ROD`
- **Type**: Key Binding Selector
- **Default**: `7`
- **Range**: `1-9`, `F1-F12`, `A-Z`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Conflict Detection**: ✅ Prevents duplicate assignments
- **UI Component**: KeyCaptureButton with spod rod icon
- **Theme Customizable**: ✅ Button style, specialized rod visualization

### 2.4 System Control Keys
- **Feature ID**: `KEY_QUIT`
- **Type**: Key Combination Selector
- **Default**: `"CTRL-C"`
- **Options**: Single keys, key combinations, special sequences
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Safety Check**: ✅ Confirms before allowing dangerous combinations
- **UI Component**: KeyComboCapture with safety warnings
- **Theme Customizable**: ✅ Button style, warning indicators

---

## 3. PLAYER STATISTICS CONFIGURATION

### 3.1 Threshold Settings
- **Feature ID**: `STAT_ENERGY_THRESHOLD`
- **Type**: Slider (Percentage)
- **Range**: `0.0 - 1.0`
- **Default**: `0.74`
- **Step**: `0.01`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Live Preview**: ✅ Shows current energy level vs threshold
- **UI Component**: Slider with energy bar visualization
- **Theme Customizable**: ✅ Slider colors, energy bar style

- **Feature ID**: `STAT_HUNGER_THRESHOLD`
- **Type**: Slider (Percentage)
- **Range**: `0.0 - 1.0`
- **Default**: `0.5`
- **Step**: `0.01`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Live Preview**: ✅ Shows current hunger level vs threshold
- **UI Component**: Slider with hunger bar visualization
- **Theme Customizable**: ✅ Slider colors, hunger bar style

- **Feature ID**: `STAT_COMFORT_THRESHOLD`
- **Type**: Slider (Percentage)
- **Range**: `0.0 - 1.0`
- **Default**: `0.51`
- **Step**: `0.01`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Live Preview**: ✅ Shows current comfort level vs threshold
- **UI Component**: Slider with comfort bar visualization
- **Theme Customizable**: ✅ Slider colors, comfort bar style

### 3.2 Consumption Timing
- **Feature ID**: `STAT_TEA_DELAY`
- **Type**: Number Input (Seconds)
- **Range**: `0 - 3600`
- **Default**: `300`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Time Format**: ✅ Displays as MM:SS
- **UI Component**: SpinBox with time format display
- **Theme Customizable**: ✅ Font, colors, time display style

- **Feature ID**: `STAT_ALCOHOL_DELAY`
- **Type**: Number Input (Seconds)
- **Range**: `0 - 3600`
- **Default**: `900`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Time Format**: ✅ Displays as MM:SS
- **UI Component**: SpinBox with time format display
- **Theme Customizable**: ✅ Font, colors, time display style

### 3.3 Consumption Limits
- **Feature ID**: `STAT_COFFEE_LIMIT`
- **Type**: Number Input (Count)
- **Range**: `1 - 50`
- **Default**: `10`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Counter Display**: ✅ Shows current vs limit
- **UI Component**: SpinBox with progress indicator
- **Theme Customizable**: ✅ Font, colors, progress bar style

- **Feature ID**: `STAT_COFFEE_PER_DRINK`
- **Type**: Number Input (Count)
- **Range**: `1 - 10`
- **Default**: `1`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **UI Component**: SpinBox with consumption visualization
- **Theme Customizable**: ✅ Font, colors, visualization style

- **Feature ID**: `STAT_ALCOHOL_PER_DRINK`
- **Type**: Number Input (Count)
- **Range**: `1 - 10`
- **Default**: `1`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **UI Component**: SpinBox with consumption visualization
- **Theme Customizable**: ✅ Font, colors, visualization style

---

## Advanced UI Studio Features for Section 2

### Key Binding Studio
- **Visual Key Mapper**: Interactive keyboard layout for visual key assignment
- **Conflict Resolution**: Real-time detection and resolution of key conflicts
- **Macro Support**: Record and assign complex key sequences
- **Profile Switching**: Quick switching between different key binding profiles
- **Import/Export**: Share key binding configurations
- **Game Integration**: Test key bindings directly in-game

### Statistics Dashboard
- **Real-Time Monitoring**: Live display of all player statistics
- **Threshold Visualization**: Visual indicators for all threshold settings
- **Historical Tracking**: Charts showing statistics over time
- **Alert System**: Customizable alerts when thresholds are reached
- **Efficiency Metrics**: Analysis of consumption patterns and optimization suggestions

### Customization Engine
- **Theme Builder**: Visual theme creation tool with live preview
- **Component Library**: Extensive widget library with customization options
- **Layout Designer**: Drag-and-drop interface layout designer
- **Animation Studio**: Custom animation creation and timing controls
- **Responsive Design**: Automatic adaptation to different screen sizes

---

*This is Section 2 of the Blueprint Feature List. Continue with Section 3 for Friction Brake & Fishing Mode Features.*