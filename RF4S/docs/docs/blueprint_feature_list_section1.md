# RF4S UI Blueprint Feature List - Section 1: Core Configuration Features

## Overview
This is a comprehensive feature-by-feature analysis of the RF4S codebase, cataloging every configurable element for the UI Studio system. Each feature includes customization capabilities, save/load functionality, defaults, and failsafe options.

---

## 1. SCRIPT CONFIGURATION FEATURES

### 1.1 Language & Localization
- **Feature ID**: `SCRIPT_LANGUAGE`
- **Type**: Dropdown Selection
- **Options**: `["en", "ru", "zh-TW", "zh-CN"]`
- **Default**: `"en"`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Failsafe**: Falls back to "en" if invalid
- **UI Component**: ComboBox with flag icons
- **Theme Customizable**: ✅ Font, colors, dropdown style

### 1.2 Launch Options
- **Feature ID**: `SCRIPT_LAUNCH_OPTIONS`
- **Type**: Text Input
- **Default**: `""`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Validation**: Command line argument format
- **Failsafe**: Empty string if invalid
- **UI Component**: LineEdit with validation hints
- **Theme Customizable**: ✅ Font, colors, border style

### 1.3 Verification Systems
- **Feature ID**: `SCRIPT_SMTP_VERIFICATION`
- **Type**: Toggle Switch
- **Default**: `true`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Failsafe**: Defaults to true for safety
- **UI Component**: SwitchButton with status indicator
- **Theme Customizable**: ✅ Switch colors, animations

- **Feature ID**: `SCRIPT_IMAGE_VERIFICATION`
- **Type**: Toggle Switch
- **Default**: `true`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Failsafe**: Defaults to true for safety
- **UI Component**: SwitchButton with status indicator
- **Theme Customizable**: ✅ Switch colors, animations

### 1.4 Detection Systems
- **Feature ID**: `SCRIPT_SNAG_DETECTION`
- **Type**: Toggle Switch
- **Default**: `true`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Failsafe**: Defaults to true for safety
- **UI Component**: SwitchButton with detection preview
- **Theme Customizable**: ✅ Switch colors, preview window style

- **Feature ID**: `SCRIPT_SPOOLING_DETECTION`
- **Type**: Toggle Switch
- **Default**: `true`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Failsafe**: Defaults to true for safety
- **UI Component**: SwitchButton with confidence meter
- **Theme Customizable**: ✅ Switch colors, meter style

### 1.5 Confidence & Sensitivity Settings
- **Feature ID**: `SCRIPT_SPOOL_CONFIDENCE`
- **Type**: Slider (Precision)
- **Range**: `0.01 - 1.0`
- **Default**: `0.98`
- **Step**: `0.01`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Failsafe**: Clamps to valid range
- **UI Component**: Slider with live preview
- **Theme Customizable**: ✅ Slider track, handle, labels

### 1.6 Timing & Delays
- **Feature ID**: `SCRIPT_SPOD_ROD_RECAST_DELAY`
- **Type**: Number Input (Seconds)
- **Range**: `0 - 7200`
- **Default**: `1800`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Failsafe**: Clamps to safe range
- **UI Component**: SpinBox with time format display
- **Theme Customizable**: ✅ Font, colors, button style

- **Feature ID**: `SCRIPT_LURE_CHANGE_DELAY`
- **Type**: Number Input (Seconds)
- **Range**: `0 - 7200`
- **Default**: `1800`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Failsafe**: Clamps to safe range
- **UI Component**: SpinBox with time format display
- **Theme Customizable**: ✅ Font, colors, button style

### 1.7 Audio Configuration
- **Feature ID**: `SCRIPT_ALARM_SOUND`
- **Type**: File Path Selector
- **Default**: `"./static/sound/guitar.wav"`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Validation**: Audio file format check
- **Failsafe**: Falls back to default sound
- **UI Component**: FileDialog with audio preview
- **Theme Customizable**: ✅ Button style, dialog theme

### 1.8 Randomization Features
- **Feature ID**: `SCRIPT_RANDOM_ROD_SELECTION`
- **Type**: Toggle Switch
- **Default**: `true`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Failsafe**: Defaults to false for predictability
- **UI Component**: SwitchButton with randomization indicator
- **Theme Customizable**: ✅ Switch colors, indicator style

- **Feature ID**: `SCRIPT_RANDOM_CAST_PROBABILITY`
- **Type**: Slider (Probability)
- **Range**: `0.0 - 1.0`
- **Default**: `0.25`
- **Step**: `0.01`
- **Editable**: ✅ Yes
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Failsafe**: Clamps to valid range
- **UI Component**: Slider with percentage display
- **Theme Customizable**: ✅ Slider track, handle, labels

### 1.9 Screenshot Tagging System
- **Feature ID**: `SCRIPT_SCREENSHOT_TAGS`
- **Type**: Multi-Select Tags
- **Options**: `["green", "yellow", "blue", "purple", "pink"]`
- **Default**: All selected
- **Editable**: ✅ Yes (add/remove custom tags)
- **Savable**: ✅ Yes
- **Resetable**: ✅ Yes
- **Failsafe**: At least one tag must be selected
- **UI Component**: TagSelector with color preview
- **Theme Customizable**: ✅ Tag colors, fonts, spacing

---

## UI Studio Features for Section 1

### Widget Customization Options
- **Font Settings**: Family, size, weight, style for all text elements
- **Color Themes**: Primary, secondary, accent colors for all components
- **Layout Options**: Spacing, margins, alignment, grouping
- **Animation Settings**: Transition speeds, easing curves, hover effects
- **Validation Styling**: Error states, warning colors, success indicators
- **Responsive Design**: Scaling factors, breakpoints, adaptive layouts

### Save/Load System
- **Profile Management**: Named configuration profiles
- **Export/Import**: JSON, YAML, XML format support
- **Version Control**: Configuration history and rollback
- **Backup System**: Automatic backups with timestamps
- **Sync Options**: Cloud sync, network sharing capabilities

### Failsafe & Safety Features
- **Safe Mode**: Minimal configuration with conservative settings
- **Validation Engine**: Real-time input validation with helpful errors
- **Recovery System**: Automatic recovery from corrupted configs
- **Default Restoration**: One-click reset to factory defaults
- **Conflict Resolution**: Handles conflicting settings gracefully

---

*This is Section 1 of the Blueprint Feature List. Continue with Section 2 for Key Binding Features.*