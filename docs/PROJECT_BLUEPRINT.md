
# RF4S Bot Control - Complete Project Blueprint

## Project Overview
This is a comprehensive fishing automation control interface built with React/TypeScript. The application provides a sophisticated panel-based workspace for managing fishing bot operations, system monitoring, and configuration management.

## Architecture Overview

### Core Technologies Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn/UI components
- **State Management**: Zustand store pattern
- **Layout**: Resizable panels with dynamic layouts
- **Icons**: Lucide React icons
- **Real-time**: Event-driven architecture with service coordination

### PySide6 Equivalent Stack
- **GUI Framework**: PySide6 (Qt6)
- **Styling**: PyQt-Fluent-Widgets + Custom QSS
- **State Management**: Signal/Slot pattern + QSettings
- **Layout**: QSplitter with custom panel management
- **Icons**: Fluent Icons + Custom icon sets
- **Real-time**: QTimer + QThread for background services

## Application Structure

### Main Components Hierarchy
```
RF4S Application
├── Header (Status indicators)
├── Left Icon Bar (Panel toggles)
├── Resizable Workspace
│   ├── Panel Layout Selector (1/2/3 panels)
│   ├── Dynamic Panel Groups
│   └── Empty State
└── Service Coordination Layer
```

### Panel Categories
1. **Main Controls** (Green category)
   - Script Control Panel
   - Game Integration Panel
   - System Monitor Panel

2. **Settings** (Yellow category)  
   - Achievement Panel
   - Save/Load Panel
   - Environmental Panel

3. **Tools** (Blue category)
   - Game State Panel
   - Configurator Integration Panel
   - System Status Panel

4. **Smart Features** (Purple category)
   - Detection Settings Panel
   - Fishing Stats Panel
   - Fishing Profiles Panel
   - Friction Brake Panel

## Feature Specifications

### 1. Workspace Management
- **Resizable Panel System**: 3 layout modes (1, 2, or 3 panels)
- **Dynamic Panel Organization**: Auto-organization based on visible panels
- **Scroll Controls**: Vertical scrolling for overflow panels
- **Empty State**: Branded empty workspace with connection status

### 2. Panel System
- **Icon-based Navigation**: Left sidebar with categorized icons
- **Panel Visibility Toggle**: Show/hide individual panels
- **Category-based Organization**: Color-coded panel categories
- **Responsive Layout**: Adapts to different panel counts

### 3. Service Architecture
- **Service Orchestrator**: Manages all background services
- **Enhanced Service Coordinator**: Sequential initialization
- **Startup Verification**: Health checks and status reporting
- **Real-time Monitoring**: Live service status updates

### 4. Configuration Management
- **RF4S Store**: Centralized state management
- **Fishing Profiles**: Multiple fishing configuration profiles
- **Detection Settings**: AI confidence thresholds and features
- **Equipment Settings**: Brake controls and timing

### 5. Real-time Features
- **Connection Status**: Live RF4S connection monitoring
- **Game Detection**: Active game state tracking
- **Statistics**: Real-time fishing performance metrics
- **System Health**: Service status and error reporting

## UI Components Specifications

### Header Component
- **Dimensions**: Full width, ~60px height
- **Elements**: Brand logo, connection indicators, session time
- **Status Grid**: 2x2 grid showing RF4S, Game, Script, Time status
- **Colors**: Gray-800 background with colored status dots

### Icon Bar Component  
- **Width**: 5% of screen (min 3%, max 12%)
- **Layout**: Vertical icon stack with categories
- **Interactions**: Hover effects, active states, tooltips
- **Categories**: Color-coded dots (green/yellow/blue/purple/pink)

### Panel Components
- **Container**: Dark theme with rounded corners
- **Headers**: Icon + title + optional controls
- **Content**: Scrollable with custom styling
- **Controls**: Sliders, toggles, buttons, progress bars

## Data Models

### RF4S Store Structure
```typescript
interface RF4SState {
  connected: boolean
  gameDetection: boolean
  panels: Panel[]
  config: Configuration
  fishingProfiles: FishingProfile[]
  activeFishingProfile: string
}
```

### Panel Model
```typescript
interface Panel {
  id: string
  label: string
  icon: LucideIcon
  visible: boolean
  category: 'main' | 'settings' | 'tools' | 'smart' | 'ai'
}
```

### Configuration Model
```typescript
interface Configuration {
  script: ScriptConfig
  detection: DetectionConfig
  equipment: EquipmentConfig
  system: SystemConfig
}
```

## Service Layer

### Service Coordination Flow
1. **Initialization Phase**: Start core services
2. **Integration Phase**: Connect external services
3. **Verification Phase**: Health checks and validation
4. **Ready Phase**: Full system operational

### Event Management
- **Event-driven Architecture**: Publish/subscribe pattern
- **Service Communication**: Inter-service messaging
- **State Synchronization**: Real-time state updates
- **Error Handling**: Centralized error management

## Styling Specifications

### Color Palette
- **Primary Background**: Gray-900 (#111827)
- **Secondary Background**: Gray-800 (#1F2937)
- **Border Colors**: Gray-700 (#374151)
- **Text Primary**: White (#FFFFFF)
- **Text Secondary**: Gray-300 (#D1D5DB)
- **Accent Colors**: Blue-500, Green-500, Yellow-500, Purple-500

### Typography
- **Primary Font**: System default sans-serif
- **Sizes**: 9px (labels), 12px (body), 14px (headers), 16px (titles)
- **Weights**: Normal (400), Medium (500), Semibold (600), Bold (700)

### Spacing System
- **Base Unit**: 4px (0.25rem)
- **Common Spacing**: 8px, 12px, 16px, 20px, 24px
- **Panel Padding**: 16px
- **Icon Sizes**: 16px (small), 20px (medium), 24px (large)

## Interaction Patterns

### Panel Management
- **Toggle Visibility**: Click icon to show/hide panel
- **Layout Selection**: Radio buttons for 1/2/3 panel layouts
- **Scroll Navigation**: Up/down arrows for panel overflow
- **Resize Handles**: Drag to adjust panel widths

### Control Interactions
- **Sliders**: Custom styled range inputs with value display
- **Toggles**: Switch-style boolean controls
- **Buttons**: Hover effects with state feedback
- **Progress Bars**: Animated progress indicators

### Responsive Behavior
- **Minimum Widths**: Panels maintain minimum readable width
- **Overflow Handling**: Scroll controls when panels exceed viewport
- **Layout Adaptation**: Smart panel arrangement based on count
- **Mobile Considerations**: Touch-friendly control sizes

This blueprint provides the foundation for recreating the entire RF4S Bot Control interface using PySide6 and Fluent Widgets. Each component can be mapped to equivalent Qt widgets while maintaining the same functionality and visual design.
