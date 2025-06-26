# RF4S UI Blueprint Feature List - Section 3: Friction Brake & Fishing Mode Features

## 4. FRICTION BRAKE CONFIGURATION

### 4.1 Brake Settings
- **Feature ID**: `FRICTION_BRAKE_INITIAL`
- **Type**: Slider (Brake Level)
- **Range**: `0 - 30`
- **Default**: `29`
- **Step**: `1`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Live Preview**: ✅ Visual brake position indicator
- **Safety Check**: ✅ Warns if too high/low for current setup
- **UI Component**: Slider with brake visualization
- **Theme Customizable**: ✅ Slider colors, brake gauge style

- **Feature ID**: `FRICTION_BRAKE_MAX`
- **Type**: Slider (Brake Level)
- **Range**: `0 - 30`
- **Default**: `30`
- **Step**: `1`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Validation**: ✅ Must be >= INITIAL value
- **UI Component**: Slider with range validation
- **Theme Customizable**: ✅ Slider colors, validation indicators

### 4.2 Timing Controls
- **Feature ID**: `FRICTION_BRAKE_START_DELAY`
- **Type**: Number Input (Seconds)
- **Range**: `0.0 - 10.0`
- **Default**: `2.0`
- **Step**: `0.1`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Precision**: 1 decimal place
- **UI Component**: DoubleSpinBox with timing visualization
- **Theme Customizable**: ✅ Font, colors, timing indicators

- **Feature ID**: `FRICTION_BRAKE_INCREASE_DELAY`
- **Type**: Number Input (Seconds)
- **Range**: `0.0 - 5.0`
- **Default**: `1.0`
- **Step**: `0.1`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Precision**: 1 decimal place
- **UI Component**: DoubleSpinBox with timing visualization
- **Theme Customizable**: ✅ Font, colors, timing indicators

### 4.3 Sensitivity Settings
- **Feature ID**: `FRICTION_BRAKE_SENSITIVITY`
- **Type**: Dropdown Selection
- **Options**: `["low", "medium", "high", "custom"]`
- **Default**: `"medium"`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Custom Mode**: ✅ Allows manual sensitivity value input
- **UI Component**: ComboBox with sensitivity preview
- **Theme Customizable**: ✅ Dropdown style, preview indicators

---

## 5. KEEPNET MANAGEMENT FEATURES

### 5.1 Capacity & Timing
- **Feature ID**: `KEEPNET_CAPACITY`
- **Type**: Number Input (Fish Count)
- **Range**: `1 - 500`
- **Default**: `100`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Live Counter**: ✅ Shows current vs capacity
- **UI Component**: SpinBox with capacity bar
- **Theme Customizable**: ✅ Font, colors, capacity visualization

- **Feature ID**: `KEEPNET_FISH_DELAY`
- **Type**: Number Input (Seconds)
- **Range**: `0.0 - 60.0`
- **Default**: `0.0`
- **Step**: `0.1`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **UI Component**: DoubleSpinBox with timing display
- **Theme Customizable**: ✅ Font, colors, timing indicators

- **Feature ID**: `KEEPNET_GIFT_DELAY`
- **Type**: Number Input (Seconds)
- **Range**: `0.0 - 60.0`
- **Default**: `4.0`
- **Step**: `0.1`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **UI Component**: DoubleSpinBox with timing display
- **Theme Customizable**: ✅ Font, colors, timing indicators

### 5.2 Full Keepnet Actions
- **Feature ID**: `KEEPNET_FULL_ACTION`
- **Type**: Dropdown Selection
- **Options**: `["quit", "continue", "sell", "release"]`
- **Default**: `"quit"`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Action Preview**: ✅ Shows what will happen when full
- **UI Component**: ComboBox with action descriptions
- **Theme Customizable**: ✅ Dropdown style, action icons

### 5.3 Fish Management Lists
- **Feature ID**: `KEEPNET_WHITELIST`
- **Type**: Dynamic Fish List
- **Default**: `["mackerel", "saithe", "herring", "squid", "scallop", "mussel"]`
- **Editable**: ✅ Yes (add/remove/reorder)
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Fish Database**: ✅ Searchable fish database with images
- **Conflict Check**: ✅ Prevents fish being in both lists
- **UI Component**: DualListWidget with fish images
- **Theme Customizable**: ✅ List style, fish card design

- **Feature ID**: `KEEPNET_BLACKLIST`
- **Type**: Dynamic Fish List
- **Default**: `[]`
- **Editable**: ✅ Yes (add/remove/reorder)
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Fish Database**: ✅ Searchable fish database with images
- **Conflict Check**: ✅ Prevents fish being in both lists
- **UI Component**: DualListWidget with fish images
- **Theme Customizable**: ✅ List style, fish card design

### 5.4 Tag Management
- **Feature ID**: `KEEPNET_TAGS`
- **Type**: Multi-Select Tags
- **Options**: `["green", "yellow", "blue", "purple", "pink"]`
- **Default**: All selected
- **Editable**: ✅ Yes (add custom tags)
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Custom Tags**: ✅ User can define custom tag colors
- **UI Component**: TagSelector with color picker
- **Theme Customizable**: ✅ Tag colors, fonts, spacing

---

## 6. FISHING MODE PROFILES

### 6.1 Spin Fishing Mode
- **Feature ID**: `PROFILE_SPIN_MODE`
- **Type**: Profile Configuration
- **Default**: `"spin"`
- **Sub-Features**:
  - **Cast Power Level**: Slider (0.0-10.0, default: 5.0)
  - **Cast Delay**: Number Input (0.0-60.0s, default: 6.0)
  - **Tighten Duration**: Number Input (0.0-10.0s, default: 0.0)
  - **Retrieval Duration**: Number Input (0.0-60.0s, default: 0.0)
  - **Retrieval Delay**: Number Input (0.0-60.0s, default: 0.0)
  - **Retrieval Timeout**: Number Input (0.0-600.0s, default: 256.0)
  - **Pre-Acceleration**: Toggle (default: false)
  - **Post-Acceleration**: Dropdown ["off", "slow", "medium", "fast"]
  - **Type**: Dropdown ["normal", "pause", "lift"]

### 6.2 Float Fishing Mode
- **Feature ID**: `PROFILE_FLOAT_MODE`
- **Type**: Profile Configuration
- **Default**: `"float"`
- **Sub-Features**:
  - **Cast Power Level**: Slider (0.0-10.0, default: 5.0)
  - **Cast Delay**: Number Input (0.0-60.0s, default: 6.0)
  - **Float Sensitivity**: Slider (0.0-1.0, default: 0.8)
  - **Strike Delay**: Number Input (0.0-5.0s, default: 0.5)
  - **Bite Detection**: Toggle (default: true)
  - **Auto-Strike**: Toggle (default: true)

### 6.3 Bottom Fishing Mode
- **Feature ID**: `PROFILE_BOTTOM_MODE`
- **Type**: Profile Configuration
- **Default**: `"bottom"`
- **Sub-Features**:
  - **Cast Power Level**: Slider (0.0-10.0, default: 8.0)
  - **Cast Delay**: Number Input (0.0-60.0s, default: 8.0)
  - **Bite Sensitivity**: Slider (0.0-1.0, default: 0.7)
  - **Multiple Rods**: Toggle (default: true)
  - **Rod Rotation**: Toggle (default: false)
  - **Auto-Recast**: Toggle (default: true)

### 6.4 Specialized Modes
- **Feature ID**: `PROFILE_PIRK_MODE`
- **Type**: Profile Configuration
- **Sub-Features**: Pirk-specific settings (jigging patterns, depth control)

- **Feature ID**: `PROFILE_ELEVATOR_MODE`
- **Type**: Profile Configuration
- **Sub-Features**: Elevator-specific settings (lift patterns, timing)

---

## Advanced UI Studio Features for Section 3

### Friction Brake Studio
- **Real-Time Monitoring**: Live friction brake position display
- **Performance Analytics**: Brake efficiency and fish loss statistics
- **Auto-Tuning**: AI-powered brake setting optimization
- **Sensitivity Calibration**: Interactive calibration wizard
- **Profile Templates**: Pre-configured brake settings for different scenarios

### Keepnet Management Studio
- **Fish Database**: Comprehensive fish encyclopedia with images and data
- **Smart Lists**: AI-suggested whitelist/blacklist based on fishing goals
- **Capacity Planning**: Predictive capacity management with alerts
- **Tag Analytics**: Tag-based fishing performance analysis
- **Export Tools**: Keepnet data export for external analysis

### Fishing Mode Designer
- **Profile Wizard**: Step-by-step profile creation assistant
- **Performance Testing**: Simulated testing of profile settings
- **Optimization Engine**: Automatic profile optimization based on success rates
- **Template Library**: Community-shared profile templates
- **Advanced Editor**: Expert mode with all available parameters

### Theme & Customization Engine
- **Live Preview**: Real-time preview of all customization changes
- **Component Inspector**: Detailed customization options for each UI element
- **Animation Studio**: Custom animation creation and timing controls
- **Responsive Design**: Automatic adaptation to different screen sizes and orientations
- **Accessibility Tools**: High contrast modes, font scaling, keyboard navigation

---

*This is Section 3 of the Blueprint Feature List. Continue with Section 4 for Notification & Advanced Features.*