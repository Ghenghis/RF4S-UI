RF4S: Russian Fishing 4 Script - Project Overview and FeaturesThis document provides a comprehensive overview of the "Russian Fishing 4 Script" (RF4S) project, detailing its features, architecture, and usage. It aims to serve as a blueprint for developers, designers, and creators looking to understand, replicate, or extend the project.1. Current Features IncludedThe RF4S script automates various aspects of the Russian Fishing 4 game, providing several distinct functionalities. Here's a breakdown of the currently implemented features:1.1. Fishing Bot (Main Script)This is the core automation feature, designed to handle various fishing modes and routines. It orchestrates casting, retrieving, fish handling, and various in-game interactions based on the selected fishing mode and configuration.Functionality:Multiple Fishing Modes: Supports Spin, Bottom, Pirk, Elevator, Telescopic, and Bolognese fishing modes, each with specific behaviors.Automated Casting & Retrieval: Manages the casting process (power, delay) and retrieval based on visual cues (spool/meter detection).Fish Handling: Detects bites, lifts rods, battles fish (with optional friction brake automation), and handles fish capture.Keepnet Management: Tracks fish count in the keepnet and can perform actions (e.g., quit, tag fish) when the keepnet is full.Consumable Management: Can automatically use coffee for stamina, tea/carrot for hunger/comfort, and alcohol before keeping fish.Rod Selection: Supports single rod use for most modes and multiple rod selection for Bottom mode.Randomization: Includes options for random mouse movement, random redundant casts, and occasional pauses to simulate human behavior.Trolling: Specific logic for boat trolling with directional control.Lure Management: Can automatically change lures, including handling broken lures.Spod Rod Management: Can recast a spod rod for bottom fishing.Groundbait/PVA/Dry Mix: Automation for refilling these components in bottom fishing.Notification: Supports email, MiaoTixing, and Discord notifications upon script termination.System Actions: Can shutdown the computer or sign out of the game after the script stops.How to Use (Main Script):Prerequisites: Ensure Python 3.12.* is installed (if running from source), game language matches config.yaml, system and in-game interface scales are "1x", and game is in "window mode" or "borderless windowed".Configuration: Edit rf4s/config/config.yaml to set up your desired fishing profile (e.g., SPIN, BOTTOM, PIRK) and other global settings.Game Setup:Bottom Mode: Add rods to quick selection slots (1-3), cast and place them nearby.Other Modes: Pick up the rod you intend to use.Run:Executable: Double-click rf4s.exe (if compiled).Python: Navigate to the project directory in your terminal and run python tools/main.py.Select Feature: When prompted, enter 0 to select "Fishing Bot".Select Profile: The script will display available fishing profiles from config.yaml. Enter the corresponding ID or use command-line arguments (-p <ID> or -N <NAME>).Monitor/Quit: The script will activate the game window and start fishing. Press the configured quit key (default: CTRL-C) to stop.Example Command-Line Usage:python tools/main.py -p 0 # Start fishing with the first profile
python tools/main.py -N SPIN_WITH_PAUSE --rainbow --troll right # Start spin with pause, rainbow line, and right trolling
python tools/main.py SCRIPT.LANGUAGE en PROFILE.SPIN.CAST_POWER_LEVEL 7.0 # Overwrite config values
1.2. Craft ItemsThis feature allows the bot to automatically harvest baits while staying idle. It's designed for resource gathering.Functionality: Automates the process of crafting items (e.g., bait components) within the game.How to Use:Ensure prerequisites for the main script are met.Run the script: python tools/main.py.When prompted, enter 1 to select "Craft Items".The script will activate the game window and begin the crafting routine.1.3. Harvest BaitsSimilar to crafting, this feature focuses specifically on harvesting baits when the bot is idle.Functionality: Automates the process of harvesting baits (e.g., digging for worms).How to Use:Ensure prerequisites for the main script are met.Run the script: python tools/main.py.When prompted, enter 2 to select "Harvest Baits".The script will activate the game window and begin the harvesting routine. Ensure your digging tool is in the configured quick slot.1.4. Toggle Moving ForwardThis utility continuously presses the 'W' key (or 'Shift + W' for sprinting) to make the character move forward. Useful for automated travel or staying in motion.Functionality: Simulates holding down the 'W' key (or 'Shift + W') for continuous forward movement.How to Use:Ensure prerequisites for the main script are met.Run the script: python tools/main.py.When prompted, enter 3 to select "Toggle Moving Forward".The script will activate the game window and start moving the character. Press the quit key to stop.1.5. Automate Friction BrakeThis feature automatically adjusts the friction brake of the reel during a fish fight, aiming to prevent line breaks while maximizing retrieval speed.Functionality: Monitors the game state (likely line tension/reel sound/visual cues) and dynamically adjusts the friction brake setting ([, ]) to keep the line from breaking.How to Use:Ensure prerequisites for the main script are met.Run the script: python tools/main.py.When prompted, enter 4 to select "Automate Friction Brake".The script will activate the game window and start monitoring for fish fights to apply automatic brake adjustments.1.6. Calculate Tackle's StatsA utility to calculate the real drag or load capacity of your current fishing tackle setup. This is likely a tool for analysis rather than automation.Functionality: Reads the components of the current tackle setup and calculates its combined drag or load capacity. This is an analytical tool rather than an in-game automation.How to Use:Ensure prerequisites for the main script are met.Run the script: python tools/main.py.When prompted, enter 5 to select "Calculate Tackle's Stats".The script will perform the calculation and display the result in the console. It likely requires specific in-game conditions (e.g., the tackle menu open) or relies on configured tackle data.2. Overall Project BlueprintThe RF4S project follows a modular and somewhat layered architecture, designed to separate concerns and make the application extensible.Core Components:rf4s/app/app.py: Defines the base App and ToolApp classes, providing fundamental functionalities shared across all tools, such as configuration loading, window management (rf4s/controller/window.py), and result display (rf4s/result/result.py). It also handles the main loop and graceful exit.rf4s/config/: Manages application configuration.config.yaml: The primary configuration file, containing default settings for fishing profiles, keybinds, notification services, etc.config.py: Provides utilities for loading, merging, and validating configurations (e.g., CfgNode from yacs).defaults.py: Likely contains default values that are programmatically set if not found in config.yaml.rf4s/controller/: Contains classes responsible for interacting with the game environment.detection.py: Handles visual detection within the game window (e.g., spool, meter, text).window.py: Manages the game window, including activation, resizing, and screenshot capabilities.timer.py: Provides timing utilities for delays and timeouts.notification.py: Manages sending external notifications (email, Discord).rf4s/component/: Defines specific game-related components or behaviors.friction_brake.py: Logic for automating friction brake adjustments.tackle.py: Likely contains logic related to fishing tackle and its properties.rf4s/player.py: Encapsulates the main fishing logic and player actions, coordinating various controllers and components to perform the fishing routine. This is where the core fishing automation resides.rf4s/result/result.py: A utility for collecting and displaying the outcomes or statistics of a script run.rf4s/utils.py: General utility functions (e.g., safe exit, logging setup, compiled environment detection).tools/: Contains separate scripts for each specific automation feature, acting as entry points for specialized tasks.main.py: The main CLI entry point for the entire project, which allows users to select and run different features.auto_friction_brake.py: Script for automating friction brake.calculate.py: Script for calculating tackle stats.craft.py: Script for automating crafting.harvest.py: Script for automating bait harvesting.move.py: Script for continuous forward movement.docs/: Documentation in various languages..github/workflows/: CI/CD related configurations (e.g., for bumping versions).3. Overall Project Mermaid Diagram (Flowchart)This diagram illustrates the high-level flow of the RF4S application, from user interaction to core process execution.graph TD
    A[User Starts `main.py`] --> B{Select Feature?};
    B -- Fishing Bot (0) --> C[RF4SApp];
    B -- Craft Items (1) --> D[CraftApp];
    B -- Harvest Baits (2) --> E[HarvestApp];
    B -- Toggle Move (3) --> F[MoveApp];
    B -- Auto Friction Brake (4) --> G[AutoFrictionBrakeApp];
    B -- Calc Tackle Stats (5) --> H[CalculateApp];

    C --> C1[Load Config & Args];
    C1 --> C2{Validate Config & Environment?};
    C2 -- No --> Z[Exit];
    C2 -- Yes --> C3[Activate Game Window];
    C3 --> C4[Initialize Player (Player.py)];
    C4 --> C5[Start Fishing Routine];
    C5 -- Loop --> C6[Perform Actions (Cast, Reel, Fight, etc.)];
    C6 --> C7{Fish Caught / Keepnet Full / Stop Condition?};
    C7 -- Yes --> C8[Display Results];
    C8 --> C9[Deactivate Game Window];
    C9 --> C10[Handle Notifications/Shutdown];
    C10 --> Z;

    D --> D1[Load Config & Args];
    D1 --> D2[Activate Game Window];
    D2 --> D3[Start Crafting Routine];
    D3 --> D4[Display Results];
    D4 --> D5[Deactivate Game Window];
    D5 --> Z;

    E --> E1[Load Config & Args];
    E1 --> E2[Activate Game Window];
    E2 --> E3[Start Harvesting Routine];
    E3 --> E4[Display Results];
    E4 --> E5[Deactivate Game Window];
    E5 --> Z;

    F --> F1[Load Config & Args];
    F1 --> F2[Activate Game Window];
    F2 --> F3[Start Moving Forward];
    F3 --> F4[Display Results];
    F4 --> F5[Deactivate Game Window];
    F5 --> Z;

    G --> G1[Load Config & Args];
    G1 --> G2[Activate Game Window];
    G2 --> G3[Start Friction Brake Automation];
    G3 --> G4[Display Results];
    G4 --> G5[Deactivate Game Window];
    G5 --> Z;

    H --> H1[Load Config & Args];
    H1 --> H2[Calculate & Display Tackle Stats];
    H2 --> Z;

RF4S Module Dependency DiagramThis Mermaid graph illustrates the dependencies between the major modules and directories within the Russian Fishing 4 Script project. An arrow from Module A to Module B indicates that Module A imports or uses components from Module B.graph TD
    subgraph Core Applications
        A[rf4s/app]
    end

    subgraph Controllers
        B[rf4s/controller]
        B1[rf4s/controller/detection]
        B2[rf4s/controller/window]
        B3[rf4s/controller/timer]
        B4[rf4s/controller/notification]
    end

    subgraph Components
        C[rf4s/component]
        C1[rf4s/component/friction_brake]
        C2[rf4s/component/tackle]
    end

    subgraph Core Logic
        D[rf4s/player]
    end

    subgraph Configuration
        E[rf4s/config]
        E1[rf4s/config/config.py]
        E2[rf4s/config/defaults.py]
        E3[rf4s/config/config.yaml]
    end

    subgraph Results & Utilities
        F[rf4s/result]
        G[rf4s/utils]
        H[rf4s/exceptions]
    end

    subgraph Tools & Entry Point
        I[tools/]
        I0[tools/main.py]
        I1[tools/auto_friction_brake.py]
        I2[tools/calculate.py]
        I3[tools/craft.py]
        I4[tools/harvest.py]
        I5[tools/move.py]
    end

    %% Explicit dependencies
    A --> E1: uses config.setup_cfg
    A --> B2: uses Window
    A --> F: uses Result (via ToolApp)
    A --> G: uses is_compiled, safe_exit

    B --> B1
    B --> B2
    B --> B3
    B --> B4

    B1 --> E1: uses CfgNode
    B1 --> B2: uses Window
    B1 --> G: uses logging, safe_exit
    B3 --> E1: uses CfgNode
    B3 --> G: uses logging
    B4 --> E1: uses CfgNode
    B4 --> G: uses logging

    C --> C1
    C --> C2

    C1 --> E1: uses CfgNode
    C2 --> E1: uses CfgNode
    C2 --> B1: uses Detection

    D --> E1: uses CfgNode
    D --> B1: uses Detection
    D --> B2: uses Window
    D --> B3: uses Timer
    D --> B4: uses Notification
    D --> C1: uses FrictionBrake
    D --> G: uses logging, safe_exit
    D --> F: updates results

    I0 --> A: inherits from App
    I0 --> D: instantiates Player
    I0 --> E1: uses config utils
    I0 --> G: uses utils.update_argv, safe_exit
    I0 --> H: uses RF4SException
    I0 --> I1: calls run_app_from_main()
    I0 --> I2: calls run_app_from_main()
    I0 --> I3: calls run_app_from_main()
    I0 --> I4: calls run_app_from_main()
    I0 --> I5: calls run_app_from_main()

    I1 --> A: inherits from ToolApp
    I1 --> C1: uses FrictionBrake
    I2 --> A: inherits from ToolApp
    I2 --> C2: uses Tackle
    I3 --> A: inherits from ToolApp
    I4 --> A: inherits from ToolApp
    I5 --> A: inherits from ToolApp

    %% General usage/Implicit dependencies
    E1 --> E2: defines defaults structure
    E1 --> E3: loads from config.yaml
    A --- E: Config is fundamental
    D --- B: Player orchestrates controllers
    D --- C: Player uses components
    I --- A: Tools build on App/ToolApp
    I --- G: Tools use general utilities
    I --- H: Tools handle exceptions

RF4S Module Blueprints: rf4s/exceptions & rf4s/utils
These two modules provide foundational support functionalities that are used across various parts of the RF4S project. rf4s/exceptions defines custom exception types for specific error conditions, enhancing error handling and debugging. rf4s/utils offers a collection of general-purpose helper functions that encapsulate common operations, promoting code reusability and maintainability.

1. rf4s/exceptions Module Blueprint
Purpose
This module is dedicated to defining custom exception classes. Using custom exceptions makes the codebase more robust and readable by allowing specific error conditions to be caught and handled explicitly. It also provides more context than generic Python exceptions.

Key File and Its Functionality
rf4s/exceptions.py
This file defines a single custom exception class.

Class: RF4SException (Exception)

Purpose: A base exception for all custom errors within the RF4S project. While currently it's the only one, this pattern allows for creating more specific custom exceptions in the future (e.g., WindowNotFoundError, ImageDetectionError, InvalidConfigurationError) that all inherit from RF4SException. This provides a convenient way to catch any RF4S-specific error.

Functionality: Inherits directly from Python's built-in Exception class. It has no custom methods or attributes beyond what is inherited.

Relationship to Other Modules
Throughout the project: Any part of the RF4S application can raise RF4SException when a critical, script-specific error occurs that requires immediate termination or special handling.

rf4s.utils.safe_exit(): This utility function might indirectly use or be triggered by RF4SException if an error occurs that warrants a graceful shutdown.

How to Replicate/Understand
Custom Exception Best Practices: Understand why custom exceptions are beneficial for larger projects (improved clarity, specific error handling).

Inheritance: Recognize that RF4SException inherits from Exception, making it compatible with standard Python exception handling.

2. rf4s/utils Module Blueprint
Purpose
The rf4s/utils module gathers various utility functions that do not belong to a specific controller or component but are useful across multiple parts of the application. These functions improve code reusability, reduce redundancy, and centralize common operations.

Key File and Its Functionality
rf4s/utils.py
This file contains several helper functions.

Key Functions:

create_rich_logger() -> logging.Logger:

Sets up and returns a logging.Logger instance configured to use rich for enhanced console output (e.g., colored messages, formatting). This standardizes logging across the application.

print_error(msg: str) -> None:

A simple utility to print error messages to the console using rich's styling capabilities, ensuring errors are highly visible.

safe_exit() -> None:

Provides a controlled way to terminate the application. It prints a "Bye." message and exits the program using sys.exit(). This is used for graceful shutdowns after critical errors or user-initiated quits.

is_compiled() -> bool:

Determines if the script is currently running as a compiled executable (e.g., created by Nuitka or PyInstaller) or as a raw Python script. This is crucial for correctly locating relative paths (like config.yaml or image assets). It typically checks sys.executable or similar attributes.

update_argv() -> None:

Modifies sys.argv (the list of command-line arguments) to remove certain arguments that might be passed when running the script in specific environments or debugging tools. This ensures consistent argument parsing.

Relationship to Other Modules
rf4s.app: Uses is_compiled() to determine the ROOT path and safe_exit() for critical errors during initialization.

tools/main.py: Uses create_rich_logger() for global logging, print_error() for invalid user inputs, and safe_exit() for application termination.

Throughout the project: Any module needing enhanced logging, graceful exit, or path resolution can import and use functions from rf4s.utils.

How to Replicate/Understand
Logging Setup: Understand how rich is integrated with the standard logging module for better console output.

Cross-Platform Pathing: Pay attention to is_compiled() and how it helps the application find its resources correctly, regardless of whether it's run as a script or an executable.

Controlled Exits: Recognize the importance of safe_exit() for clean application termination, especially in automation scripts that might run for long periods.

RF4S Class Diagram: tools/ Module (ToolApps)
This Mermaid class diagram illustrates the RF4SApp and the various specialized ToolApp subclasses found within the tools/ directory.

classDiagram
    direction LR
    App <|-- RF4SApp
    ToolApp <|-- AutoFrictionBrakeApp
    ToolApp <|-- CalculateApp
    ToolApp <|-- CraftApp
    ToolApp <|-- HarvestApp
    ToolApp <|-- MoveApp

    class App {
        <<abstract>>
        +CfgNode cfg
        +Window window
        +<<abstract>>_start()
        +<<abstract>>start()
        +<<abstract>>create_parser()
        +<<abstract>>display_result()
    }

    class ToolApp {
        +Detection detection
        +Result result
        +start()
        +display_result()
        --
        - Inherits _start()
        - Inherits create_parser()
    }

    class RF4SApp {
        +ArgumentParser parser
        +Namespace args
        +Player player
        +__init__()
        +create_parser()
        +is_args_valid()
        +create_user_profile()
        +start()
        #_start()
        +display_result()
    }

    class AutoFrictionBrakeApp {
        +__init__()
        #_start()
        +create_parser()
    }

    class CalculateApp {
        +__init__()
        #_start()
        +create_parser()
    }

    class CraftApp {
        +__init__()
        #_start()
        +create_parser()
    }

    class HarvestApp {
        +__init__()
        #_start()
        +create_parser()
    }

    class MoveApp {
        +__init__()
        #_start()
        +create_parser()
    }

    RF4SApp "1" --> "1" Player : uses >
    AutoFrictionBrakeApp "1" --> "1" FrictionBrake : uses >
    CalculateApp "1" --> "1" Tackle : uses >

    class Player {
        // from rf4s.player
    }
    class FrictionBrake {
        // from rf4s.component.friction_brake
    }
    class Tackle {
        // from rf4s.component.tackle
    }

RF4S Module Blueprint: tools/
The tools/ directory contains individual Python scripts that serve as specific application entry points for various automation features. Each script here typically implements a specialized task, often building upon the ToolApp base class from rf4s/app/app.py to leverage common functionalities like configuration management, window control, and result display.

Purpose
This module provides a clear separation of concerns for different automation tasks. Instead of a monolithic application, each distinct feature (e.g., crafting, harvesting, friction brake automation) has its own dedicated script. This makes the project:

Modular: Features can be developed and maintained independently.

Focused: Each script focuses on a single purpose.

Extensible: Easy to add new automation tools without impacting existing ones.

User-Friendly: Allows users to select and run specific features from the main.py CLI.

Key Scripts and Their Functionality
tools/main.py
This is the primary command-line interface (CLI) and entry point for the entire RF4S project. It presents a menu of available features and dispatches control to the respective tool scripts or the main RF4SApp (fishing bot).

Class: RF4SApp (App)

Purpose: Manages the main fishing bot logic, distinct from other ToolApp derivatives, as it has more complex configuration and flow.

Functionality:

Inherits from rf4s.app.App.

Extends argument parsing to include specific fishing bot options (e.g., --rainbow, --trolling, --fishes-in-keepnet).

Handles user profile selection (via ID or name) and merges profile-specific configurations.

Performs critical pre-flight checks: validates arguments, SMTP connection, Discord webhook URL, and presence of necessary image files for the selected language.

Instantiates and manages the rf4s.player.Player object to execute the core fishing routine.

Overrides _start() and display_result() to integrate Player's functionality.

Usage: python tools/main.py [options] [profile-opts]

Main Execution Block (if __name__ == "__main__":)

Displays project logo and links.

Calls utils.update_argv().

Presents an interactive menu of features (Fishing Bot, Craft Items, Harvest Baits, Toggle Moving Forward, Automate Friction Brake, Calculate Tackle's Stats).

Based on user input, it calls the start() method of the corresponding App or ToolApp subclass (e.g., RF4SApp().start(), craft.run_app_from_main()).

Includes try-except for general exceptions during the main app's execution and ensures a safe_exit().

tools/auto_friction_brake.py
Class: AutoFrictionBrakeApp (ToolApp)

Purpose: Provides a standalone application for automating the reel's friction brake.

Functionality:

Extends rf4s.app.ToolApp.

Implements create_parser() to define arguments specific to this tool (e.g., possibly --initial-brake, --sensitivity, though generally it relies on config.yaml).

Implements _start(): Initializes rf4s.component.friction_brake.FrictionBrake and then enters a loop to continuously call friction_brake.adjust_brake() (or similar logic) while detecting if a fish is on the line.

Updates the result with status messages.

Usage: Selected from main.py CLI. Can also be run directly: python tools/auto_friction_brake.py

tools/calculate.py
Class: CalculateApp (ToolApp)

Purpose: A utility tool to calculate the combined drag/load capacity of the current fishing tackle setup.

Functionality:

Extends rf4s.app.ToolApp.

Implements create_parser() (likely no specific arguments needed).

Implements _start(): Instantiates rf4s.component.tackle.Tackle and calls tackle.calculate_tackle_drag().

Adds the calculated tackle statistics to the result object for display.

Usage: Selected from main.py CLI. Can also be run directly: python tools/calculate.py

tools/craft.py
Class: CraftApp (ToolApp)

Purpose: Automates the crafting of items/baits within the game.

Functionality:

Extends rf4s.app.ToolApp.

Implements create_parser() (e.g., arguments for specific recipes or quantities).

Implements _start(): Contains the sequence of actions required for crafting (e.g., opening crafting menu, selecting recipe, clicking craft buttons, using pyautogui).

Uses detection for UI elements and timer for delays.

Updates the result with crafting progress/statistics.

Usage: Selected from main.py CLI. Can also be run directly: python tools/craft.py

tools/harvest.py
Class: HarvestApp (ToolApp)

Purpose: Automates the harvesting of baits (e.g., digging for worms).

Functionality:

Extends rf4s.app.ToolApp.

Implements create_parser() (e.g., arguments for quantity or duration).

Implements _start(): Contains the sequence of actions for harvesting (e.g., equipping digging tool, moving to a spot, clicking to dig, collecting items).

Uses detection for UI elements and timer for delays.

Updates the result with harvesting progress/statistics.

Usage: Selected from main.py CLI. Can also be run directly: python tools/harvest.py

tools/move.py
Class: MoveApp (ToolApp)

Purpose: Continuously presses the 'W' key (or 'Shift + W') for forward movement.

Functionality:

Extends rf4s.app.ToolApp.

Implements create_parser() (e.g., an argument for sprinting).

Implements _start(): Enters an infinite loop that repeatedly presses and holds the 'W' key (and 'Shift' if sprinting is enabled) using pynput.keyboard.

Relies on the user pressing the global quit key to stop.

Usage: Selected from main.py CLI. Can also be run directly: python tools/move.py

How to Replicate/Understand
To replicate or deeply understand this module:

ToolApp Inheritance: Understand that most scripts in tools/ inherit from ToolApp, which provides them with a common structure for configuration, window management, and result display, significantly reducing boilerplate.

Specialized Logic in _start(): The core, unique functionality of each tool is encapsulated within its _start() method.

CLI Dispatch: Recognize how main.py acts as a central dispatcher, using a simple match statement to direct execution based on user choice.

Dependencies: Note that these tools often import and use classes from rf4s/controller, rf4s/component, and rf4s/utils to perform their specific tasks.

RF4S Class Diagram: rf4s/result Module
This Mermaid class diagram illustrates the simple structure of the Result class within the rf4s/result module.

classDiagram
    class Result {
        -_data: dict
        +__init__()
        +add_data(key, value)
        +as_dict() dict
    }
	
	RF4S Module Blueprint: rf4s/result
The rf4s/result module is a small but essential part of the RF4S project, dedicated to collecting, storing, and providing access to the outcomes and statistics of an application run. It centralizes the data that is eventually displayed to the user after a script has finished its execution.

Purpose
The primary goal of this module is to provide a standardized way to:

Aggregate Results: Gather various metrics and data points generated during the script's operation (e.g., number of fish caught, consumables used, elapsed time).

Structured Storage: Store these results in a structured format for easy retrieval.

Result Presentation: Facilitate the display of these results to the user in a clear and consistent manner.

Key Class and Its Functionality
rf4s/result/result.py
This file contains the Result class, a simple data container that holds key-value pairs representing the outcome of a script's execution.

Class: Result

Attributes:

_data (dict): A private dictionary that stores the actual results as key-value pairs.

Core Methods:

__init__(self): Initializes the _data dictionary as empty.

add_data(self, key: str, value: Any) -> None:

Adds a new key-value pair to the _data dictionary.

If the key already exists, it updates the corresponding value. This allows for accumulating or overriding results.

as_dict(self) -> dict:

Returns a copy of the internal _data dictionary. This provides read-only access to the collected results, preventing external modifications to the internal state.

Relationship to Other Modules
rf4s.app: The ToolApp class (which RF4SApp and other specific tool apps extend) instantiates the Result class. It then calls display_result() which internally uses result.as_dict() to retrieve data for presentation.

rf4s.player: The Player class (the main fishing bot logic) uses result (passed via ToolApp or directly to its timer which then updates result) to store metrics like fish caught count, coffee drink count, etc.

rf4s.controller.timer: The Timer class can also add_data to the Result object if it's responsible for tracking and saving session data.

How to Replicate/Understand
To replicate or deeply understand this module:

Simplicity: Recognize that this module is intentionally simple. Its main purpose is to be a clean interface for data aggregation, not complex processing.

Data Flow: Understand the unidirectional flow of data: various parts of the script (e.g., Player, Timer) add_data to Result, and then a display mechanism (ToolApp.display_result()) retrieves it using as_dict().

Extensibility: If new metrics or result types are needed, they can simply be added via add_data, and display_result will adapt accordingly.

sequenceDiagram
    participant App as RF4SApp
    participant Player
    participant Window
    participant Detection
    participant Timer
    participant Notification
    participant FrictionBrake

    App->>Player: __init__(cfg, window)
    Player->>Detection: __init__(cfg, window)
    Player->>Timer: __init__(cfg)
    Player->>Notification: __init__(cfg)
    Player->>FrictionBrake: __init__(cfg) (if enabled)

    App->>Window: activate_game_window()
    App->>Player: start_fishing()
    Player->>Timer: start()

    loop Fishing Session
        Player->>Player: check_connection()
        Player->>Player: check_consumables()
        Player->>Player: check_keepnet_full()

        Player->>Player: cast_rod()
        Player->>Window: get_screenshot_region()
        Player->>Detection: is_image_exist(casting_bar)
        Player->>Timer: delay(cast_delay)
        Player->>pyautogui: press('cast_key')

        Player->>Player: wait_for_fish()
        alt Spin/Pirk/Elevator Modes
            Player->>Detection: is_fish_on_line_exist()
            Player->>Timer: delay(pre_acceleration/post_acceleration)
        else Bottom Mode
            Player->>Detection: is_image_exist(rod_tip_movement)
            Player->>Timer: delay(check_delay)
        else Float Mode
            Player->>Detection: is_float_diving()/is_float_wobble()
            Player->>Timer: delay(check_delay)
        end

        alt Fish Bites
            Player->>Player: fish_fight()
            Player->>pyautogui: press('lift_rod_key')
            loop While fighting
                Player->>Detection: is_fish_on_line_exist()
                alt Auto Friction Brake Enabled
                    Player->>FrictionBrake: adjust_brake()
                    FrictionBrake->>pyautogui: press('[') or ']'
                end
                Player->>pyautogui: hold('reel_key')
                Player->>Timer: delay()
            end
            Player->>Player: retrieve_line()
            Player->>Detection: is_spool_disappear() / is_meter_disappear()
            Player->>pyautogui: press('lift_rod_key')

            Player->>Player: handle_caught_fish()
            Player->>Detection: is_fish_name_exist()
            Player->>Detection: is_fish_tagged()
            Player->>Notification: send_notification(fish_caught_msg)
            Player->>Timer: add_data(fish_data)
            Player->>pyautogui: press('keep_fish_key')
        else No Fish / Timeout
            Player->>Player: retrieve_line() (timeout)
            Player->>Detection: is_spool_disappear() / is_meter_disappear()
            Player->>pyautogui: press('lift_rod_key')
        end
    end

    Player->>App: build_result_dict()
    Player->>Timer: save_data()
    App->>Player: display_result()
    App->>Window: activate_script_window()
    App->>App: Exit

classDiagram
    direction LR

    class Player {
        +CfgNode cfg
        +Detection detection
        +keyboard.Controller keyboard
        +mouse.Controller mouse
        +Notification notification
        +Timer timer
        +Window window
        +FrictionBrake friction_brake
        -_fishes_caught_count: int
        -_coffee_drink_count: int
        -_alcohol_drink_count: int
        -_check_miss_count: int
        -_is_fighting: bool
        -_is_connected: bool
        -_is_spooling: bool
        -_trolling_direction: str
        -_fishing_data: list
        +__init__(cfg, window)
        +check_connection()
        +start_fishing()
        +cast_rod()
        +wait_for_fish()
        +fish_fight()
        +retrieve_line()
        +handle_caught_fish()
        +check_consumables()
        +reset_spool_detection()
        +check_keepnet_full()
        +_cast_spin_like()
        +_retrieve_spin_like()
        +_wait_for_fish_bottom()
        +_pirk()
        +_elevator()
        +_float_fishing()
        +build_result_dict(status)
        +build_result_table(result_dict)
    }

    class Detection {
        // From rf4s.controller.detection
    }
    class Notification {
        // From rf4s.controller.notification
    }
    class Timer {
        // From rf4s.controller.timer
    }
    class Window {
        // From rf4s.controller.window
    }
    class FrictionBrake {
        // From rf4s.component.friction_brake
    }
    class CfgNode {
        // From yacs.config
    }

    Player "1" *-- "1" CfgNode : configures >
    Player "1" *-- "1" Detection : uses >
    Player "1" *-- "1" Notification : uses >
    Player "1" *-- "1" Timer : uses >
    Player "1" *-- "1" Window : uses >
    Player "1" o-- "0..1" FrictionBrake : uses (if enabled) >

RF4S Module Blueprint: rf4s/player
The rf4s/player module contains the Player class, which serves as the central orchestrator for the automated fishing process in Russian Fishing 4. It integrates various controllers (Detection, Window, Timer, Notification) and components (FrictionBrake, Tackle) to simulate player actions, manage game states, and execute complex fishing routines based on the configured profile.

Purpose
The Player class encapsulates the entire fishing automation logic. Its responsibilities include:

Fishing Mode Management: Adapting behavior to different fishing modes (spin, bottom, pirk, elevator, float).

Action Sequencing: Coordinating a sequence of actions like casting, reeling, setting hooks, and lifting rods.

Fish Fight Management: Responding to fish bites, battling fish, and managing the friction brake.

Resource Management: Monitoring and utilizing in-game consumables (stamina, hunger, comfort).

Keepnet and Fish Handling: Managing caught fish, handling keepnet capacity, and applying tags.

Error Recovery/Robustness: Implementing checks and recovery mechanisms for common in-game issues (e.g., snags, connection loss, unresponsiveness).

Data Collection: Recording fishing statistics.

Key Class and Its Functionality
rf4s/player.py
This file defines the Player class. Due to its central role, it's a large class with many methods, each handling a specific aspect of the fishing process.

Class: Player

Attributes:

cfg (yacs.config.CfgNode): The application configuration, holding all settings for the selected profile and global script behavior.

detection (rf4s.controller.detection.Detection): Instance of the detection controller for visual recognition.

keyboard (pynput.keyboard.Controller): Instance of pynput keyboard controller for simulating key presses.

mouse (pynput.mouse.Controller): Instance of pynput mouse controller for simulating mouse actions.

notification (rf4s.controller.notification.Notification): Instance of the notification controller.

timer (rf4s.controller.timer.Timer): Instance of the timer controller.

window (rf4s.controller.window.Window): Instance of the window controller.

friction_brake (rf4s.component.friction_brake.FrictionBrake): Instance of the friction brake component (if enabled).

_fishes_caught_count (int): Counter for fish caught in the current session.

_coffee_drink_count (int): Counter for coffee consumed.

_alcohol_drink_count (int): Counter for alcohol consumed.

_check_miss_count (int): Counter for missed checks (e.g., for bottom fishing).

_is_fighting (bool): Flag indicating if a fish is currently being fought.

_is_connected (bool): Flag indicating game connection status.

_is_spooling (bool): Flag indicating if the reel is currently spooling.

_trolling_direction (str): Current trolling direction.

_fishing_data (list): Data collected for the current session.

Core Methods (Categorized by Functionality):

Initialization & Setup:

__init__(self, cfg: CfgNode, window: Window): Initializes all sub-controllers and components, setting up the player's state.

check_connection(self) -> None: Periodically checks if the game is still active and connected. If not, can trigger notifications or shutdown.

Game Interaction & Core Fishing Loop:

start_fishing(self) -> None: The main entry point for the fishing bot. It orchestrates the entire loop: cast_rod(), wait_for_fish(), fish_fight(), handle_caught_fish(), and resource checks.

cast_rod(self) -> None:

Manages the casting process: selects rod, adjusts power, performs cast.

Handles random_cast, skip_cast, trolling, broken_lure, lure_change, harvest_baits, spod_rod_recast, dry_mix, groundbait, pva flags.

Uses detection to confirm UI elements (e.g., casting bar).

wait_for_fish(self) -> None:

Different implementations for each mode:

Spin/Pirk/Elevator: Waits for a bite, possibly with pre_acceleration or post_acceleration.

Bottom: Periodically checks rods, waits for bites.

Float: Monitors the float for movement (is_float_diving, is_float_wobble).

Handles drift_timeout for float fishing, pirk_timeout, elevate_timeout.

fish_fight(self) -> None:

Engages the fish: lifts rod, reels in, adjusts friction brake (if enabled via friction_brake.adjust_brake()).

Monitors for snags, uses coffee for stamina.

Uses detection.is_fish_on_line_exist() to determine if a fish is still fighting.

retrieve_line(self) -> None: Handles the final retrieval of the line after a fish fight or timeout, using spool/meter detection.

Fish Handling & Keepnet:

handle_caught_fish(self) -> None:

Processes a caught fish: checks if it's tagged, whitelisted, or blacklisted.

Handles tag, alcohol, screenshot, data flags.

Determines if the keepnet is full and performs the configured action (quit, sell, etc.).

Uses detection.is_fish_name_exist() and detection.is_fish_tagged().

Resource & State Management:

check_consumables(self) -> None: Monitors player stats (energy, hunger, comfort) and uses configured consumables (tea, carrot, coffee) when thresholds are met.

reset_spool_detection(self) -> None: Resets the spool detection system if it becomes unreliable.

check_keepnet_full(self) -> None: Checks keepnet status and takes action if full.

Specific Mode Logic (Examples):

_cast_spin_like(self) -> None: Generic casting for spin, pirk, elevator.

_retrieve_spin_like(self) -> None: Generic retrieval for spin, pirk, elevator.

_wait_for_fish_bottom(self) -> None: Logic specific to bottom fishing.

_pirk(self) -> None: Pirking/jigging animation logic.

_elevator(self) -> None: Elevator jigging logic.

_float_fishing(self) -> None: Float fishing logic including checking for bites and drift.

Utility Methods:

build_result_dict(self, status: str) -> dict: Compiles a dictionary of session results (fishes caught, coffee used, elapsed time).

build_result_table(self, result_dict: dict) -> rich.table.Table: Formats the result dictionary into a rich table for display.

Relationship to Other Modules
rf4s.app: The Player class is instantiated by RF4SApp (tools/main.py), which passes the cfg and window objects.

rf4s.config: Heavily relies on the cfg object to dictate all aspects of its behavior, from fishing mode parameters to keybinds and thresholds.

rf4s.controller.*: Directly uses instances of Detection, Window, Timer, and Notification to perform game-related operations.

rf4s.component.*: Uses FrictionBrake if the auto-friction brake feature is enabled.

rf4s.result: The Player class populates the Result object (via its _data attribute and timer.add_data()) for final display.

pyautogui: Used extensively for simulating mouse clicks and key presses for in-game actions.

pynput: Used for direct keyboard/mouse control.

logging: For logging information, warnings, and errors.

How to Replicate/Understand
To replicate or deeply understand this module:

State Management: Pay close attention to the various internal flags (_is_fighting, _is_connected, _is_spooling) and counters, as these determine the flow of the fishing routine.

Mode-Specific Logic: Observe how different fishing modes are handled, often through conditional logic (if self.cfg.SELECTED.MODE == "spin":) or by passing specific parameters to general methods.

Interaction with Controllers: Understand how Player acts as a coordinator, calling methods on detection, window, timer, and notification to achieve its goals.

Error Handling & Robustness: Analyze the try-except blocks and check_connection() calls, which are crucial for the script's stability against unexpected game states or disconnections.

Timing and Delays: Note the extensive use of self.timer.delay() and self.timer.timeout() to synchronize actions with in-game animations and prevent rapid, bot-like movements.

Configuration Driven: Recognize that almost every configurable aspect of the fishing behavior stems from the self.cfg object, highlighting the importance of the rf4s/config module.

classDiagram
    direction LR

    class FrictionBrake {
        +CfgNode cfg
        -_start_delay: float
        -_increase_delay: float
        -_sensitivity: str
        -_prev_time: float
        -_curr_brake: int
        +__init__(cfg)
        +set_initial_brake()
        +adjust_brake()
        +increase_brake()
        +decrease_brake()
        +get_current_brake()
        +set_current_brake(brake)
    }

    class Tackle {
        +CfgNode cfg
        +Detection detection
        +__init__(cfg, detection)
        +get_rod_load_capacity()
        +get_reel_drag()
        +get_line_load_capacity()
        +calculate_tackle_drag()
    }

    FrictionBrake "1" --> "1" CfgNode : configures >
    Tackle "1" --> "1" CfgNode : configures >
    Tackle "1" --> "1" Detection : uses >

RF4S Module Blueprint: rf4s/component
The rf4s/component module defines reusable, game-specific components that encapsulate particular mechanics or behaviors within Russian Fishing 4. These components are designed to be integrated into higher-level automation logic, such as the Player class, to manage complex in-game interactions.

Purpose
This module aims to modularize game-specific functionalities, making the automation logic cleaner and more manageable. It separates concerns related to:

Friction Brake Management: Automating the adjustment of the reel's friction brake during fish fights.

Tackle Data Handling: Representing and potentially analyzing fishing tackle attributes.

Key Classes and Their Functionality
rf4s/component/friction_brake.py
This file contains the FrictionBrake class, which is responsible for automatically adjusting the reel's friction brake (drag) in response to a fish fighting on the line. This prevents the line from breaking while attempting to maximize retrieval.

Class: FrictionBrake

Attributes:

cfg (yacs.config.CfgNode): The application configuration, specifically used to retrieve friction brake settings (e.g., INITIAL, MAX, INCREASE_DELAY, SENSITIVITY).

_start_delay (float): Initial delay before the auto-brake system starts adjusting.

_increase_delay (float): Delay between incremental adjustments to the brake.

_sensitivity (str): Defines how aggressively the brake adjusts (e.g., 'medium').

_prev_time (float): Stores the timestamp of the last brake adjustment.

_curr_brake (int): The current friction brake setting (from 0 to 30, based on in-game UI).

Core Methods:

__init__(self, cfg: CfgNode): Initializes the friction brake component with configuration settings and sets the initial brake level.

set_initial_brake(self) -> None: Sets the reel's friction brake to the INITIAL value specified in the config using keyboard inputs (pyautogui.press).

adjust_brake(self) -> None:

This is the core logic. It's called periodically during a fish fight.

It monitors the "tension" of the line (implicitly through Player actions or direct observation of the game UI, though Detection is not directly injected here).

Based on _sensitivity and elapsed time since the last adjustment, it decides whether to increase or decrease the brake using pyautogui.press('[') (decrease) or pyautogui.press(']') (increase).

Aims to keep the brake at an optimal level, preventing line breaks while reeling.

increase_brake(self) -> None: Increases the brake by one step, ensuring it doesn't exceed MAX.

decrease_brake(self) -> None: Decreases the brake by one step.

get_current_brake(self) -> int: Returns the current internal brake setting.

set_current_brake(self, brake: int) -> None: Sets the internal brake value.

rf4s/component/tackle.py
This file contains the Tackle class, which appears to be a placeholder or an incomplete implementation for managing fishing tackle properties and potentially calculating their combined statistics. In the provided code, its primary use case is tools/calculate.py.

Class: Tackle

Attributes:

cfg (yacs.config.CfgNode): The application configuration.

detection (rf4s.controller.detection.Detection): An instance of the Detection controller, used to read tackle stats from the screen.

Core Methods:

__init__(self, cfg: CfgNode, detection: Detection): Initializes the tackle component with configuration and a detection instance.

get_rod_load_capacity(self) -> float: Reads the "Rod Load Capacity" text from the game UI using OCR (detection.get_text) and converts it to a float.

get_reel_drag(self) -> float: Reads the "Reel Drag" text from the game UI using OCR and converts it to a float.

get_line_load_capacity(self) -> float: Reads the "Line Load Capacity" text from the game UI using OCR and converts it to a float.

calculate_tackle_drag(self) -> dict:

This is the core logic for tools/calculate.py.

It orchestrates the reading of rod, reel, and line capacities/drags.

It then calculates the "real drag" of the combined tackle setup, which is the minimum of the three components.

Returns a dictionary containing the individual components and the calculated real drag.

Relationship to Other Modules
rf4s.config: Both FrictionBrake and Tackle receive the CfgNode object to configure their behavior and retrieve specific settings.

rf4s.controller.detection: Tackle directly uses the Detection class to perform OCR and extract numerical values from the game screen.

rf4s.player: The Player class likely instantiates and uses FrictionBrake during fish fighting sequences if auto-friction brake is enabled.

tools/auto_friction_brake.py: This tool uses FrictionBrake directly.

tools/calculate.py: This tool uses Tackle directly.

pyautogui: Heavily used by FrictionBrake to simulate keyboard presses for adjusting the brake.

How to Replicate/Understand
To replicate or deeply understand this module:

Game Mechanics: A basic understanding of how friction brake and tackle stats work in Russian Fishing 4 is helpful.

pyautogui for Interaction: Understand how pyautogui.press is used to simulate key presses for brake adjustment.

OCR for Tackle: Comprehend how Detection.get_text() (and underlying pytesseract) is used to read numerical values from the game screen for tackle calculation.

Integration Points: Observe how these components are integrated into the larger automation logic, especially within Player.py for the main fishing bot and directly by the specific tools in tools/.

classDiagram
    direction LR

    class Detection {
        +CfgNode cfg
        +Window window
        +MSS sct
        +str language
        +Path image_dir
        +dict image_templates
        +__init__(cfg, window)
        +load_image(name, mode)
        +get_screenshot_as_gray(bbox)
        +is_image_exist(name, bbox, threshold)
        +get_text(bbox)
        +is_spool_exist()
        +is_spool_disappear()
        +is_meter_exist()
        +is_meter_disappear()
        +is_snag_exist()
        +is_fish_on_line_exist()
        +is_fish_name_exist(name)
        +is_fish_tagged(tags)
    }

    class Notification {
        +CfgNode cfg
        +__init__(cfg)
        +send_email(msg)
        +send_miaotixing_notification(msg)
        +send_discord_webhook(msg)
        +send_notification(msg)
    }

    class Timer {
        +CfgNode cfg
        +float start_time
        -_data: list
        +__init__(cfg)
        +delay(duration, msg)
        +timeout(duration)
        +get_elapsed_time()
        +start()
        +stop()
        +save_data()
        +add_data(data)
    }

    class Window {
        +str game_window_title
        +str script_window_title
        -_game_window: pygetwindow.Window
        +__init__()
        +activate_game_window()
        +activate_script_window()
        +get_resolution_str()
        +is_size_supported()
        +is_title_bar_exist()
    }

    Detection "1" --> "1" Window : uses >
    Detection "1" --> "1" CfgNode : configures >
    Notification "1" --> "1" CfgNode : configures >
    Timer "1" --> "1" CfgNode : configures >

RF4S Module Blueprint: rf4s/controller
The rf4s/controller module is a critical part of the RF4S project, housing classes that directly interact with the operating system and the Russian Fishing 4 game client. These controllers abstract away the complexities of image detection, window manipulation, timing, and external notifications, allowing higher-level logic (like Player.py) to focus on game-specific automation routines.

Purpose
This module provides the low-level interaction layer between the script and the game. Its primary responsibilities include:

Visual Detection: Identifying specific elements (e.g., spool, UI text, fish status) within the game window using image recognition.

Window Management: Activating, deactivating, and obtaining information about the game window.

Timing Control: Managing delays, timeouts, and tracking elapsed time for various in-game actions.

External Notifications: Sending alerts or updates via email, Discord, or other services.

Key Classes and Their Functionality
rf4s/controller/detection.py
This file contains the Detection class, which is central to the script's ability to "see" and interpret the game state. It heavily relies on the mss (screenshotting) and cv2 (OpenCV for image processing) libraries.

Class: Detection

Attributes:

cfg (yacs.config.CfgNode): The application configuration.

window (rf4s.controller.window.Window): An instance of the Window controller, used to get screenshot regions and resolutions.

sct (mss.mss.MSS): An mss instance for taking screenshots.

language (str): The game's language, used to determine which image assets to load.

image_dir (pathlib.Path): The directory where image templates for detection are stored (e.g., static/en/).

image_templates (dict): A dictionary caching loaded image templates (e.g., spool, meter, fish icons) for efficiency.

Core Methods:

__init__(self, cfg: CfgNode, window: Window): Initializes the detection system, loads image templates based on the configured language, and sets up the mss screen grabber.

load_image(self, name: str, mode: str = cv2.IMREAD_COLOR) -> np.ndarray: Loads an image template from the image_dir and caches it.

get_screenshot_as_gray(self, bbox: tuple) -> np.ndarray: Takes a screenshot of a specified bounding box and converts it to grayscale.

is_image_exist(self, name: str, bbox: tuple = None, threshold: float = None) -> bool:

The primary method for detecting if a specific image template exists within a given screen region (or the whole screen if bbox is None).

Uses template matching (cv2.matchTemplate, cv2.minMaxLoc).

Returns True if the confidence (correlation) exceeds the threshold (or SPOOL_CONFIDENCE from config if not provided).

get_text(self, bbox: tuple) -> str:

Performs OCR (Optical Character Recognition) on a specified screen region. It saves the screenshot temporarily and uses pytesseract to extract text.

Requires Tesseract-OCR to be installed and its path configured.

is_spool_exist(), is_spool_disappear(), is_meter_exist(), is_meter_disappear(): Specific methods for detecting the spool (red box) or meter (green box) for retrieval progress, adapted to the game's UI. These use is_image_exist with pre-defined bounding boxes.

is_snag_exist(): Detects if a snag (line stuck) icon is present.

is_fish_on_line_exist(): Detects if a "fish on the line" indicator is present.

is_fish_name_exist(self, name: str) -> bool: Checks if a specific fish name is visible, used for whitelisting/blacklisting fish.

is_fish_tagged(self, tags: list[str] = None) -> str | None: Detects if a caught fish has a specific tag color on its icon.

rf4s/controller/notification.py
This file handles sending notifications to external services.

Class: Notification

Attributes:

cfg (yacs.config.CfgNode): Application configuration.

Core Methods:

__init__(self, cfg: CfgNode): Initializes with the configuration.

send_email(self, msg: str) -> None: Sends an email using SMTP with credentials from the configuration. Includes error handling for connection or authentication issues.

send_miaotixing_notification(self, msg: str) -> None: Sends a notification via the Miaotixing service (requires a specific API key/code).

send_discord_webhook(self, msg: str) -> None: Sends a message to a Discord channel via a webhook URL.

send_notification(self, msg: str) -> None: A wrapper method that dispatches the message to all enabled notification services (email, Miaotixing, Discord) based on command-line arguments.

rf4s/controller/timer.py
This file provides utility methods for precise timing, delays, and tracking durations, crucial for automating time-sensitive game actions.

Class: Timer

Attributes:

cfg (yacs.config.CfgNode): Application configuration.

start_time (float): Timestamp when the timer was started (e.g., when the fishing routine began).

_data (list): A list to store fishing session data (e.g., time, fish caught), if enabled.

Core Methods:

__init__(self, cfg: CfgNode): Initializes the timer and, if data saving is enabled, prepares the data storage.

delay(self, duration: float, msg: str = None) -> None: Pauses script execution for a specified duration. Can optionally print a message.

timeout(self, duration: float) -> ContextManager: A context manager for handling timeouts. Allows a block of code to run, and if it exceeds duration, a TimeoutError is raised. This is critical for preventing the script from getting stuck indefinitely.

get_elapsed_time(self) -> float: Returns the time elapsed since the timer was initialized.

start(self) -> None: Resets the timer and sets start_time to the current time.

stop(self) -> None: Placeholder, often used to signify end of a timed operation.

save_data(self) -> None: Saves accumulated fishing data to a CSV file in the logs directory.

add_data(self, data: dict) -> None: Adds a new record to the internal data storage.

rf4s/controller/window.py
This file handles interactions with the game window itself, including finding it, bringing it to the foreground, and performing basic checks.

Class: Window

Attributes:

game_window_title (str): The expected title of the Russian Fishing 4 game window.

script_window_title (str): The title of the script's console window.

_game_window (pygetwindow.Window): An instance representing the game window, found by pygetwindow.

Core Methods:

__init__(self): Initializes window titles.

activate_game_window(self) -> None: Finds the game window and brings it to the foreground, focusing it for interaction. Includes error handling if the window is not found.

activate_script_window(self) -> None: Brings the script's own console window to the foreground.

get_resolution_str(self) -> str: Returns the current resolution of the game window as a string (e.g., "1920x1080").

is_size_supported(self) -> bool: Checks if the game window's current resolution is one of the supported sizes (e.g., 2560x1440, 1920x1080, 1600x900). Crucial for visual detection accuracy.

is_title_bar_exist(self) -> bool: Determines if the game window has a visible title bar, indicating "Windowed" mode vs. "Borderless Windowed" or Fullscreen.

Relationship to Other Modules
rf4s.app: App and ToolApp classes instantiate and utilize Window and Detection controllers.

rf4s.player: The Player class extensively uses Detection, Window, and Timer to perform fishing actions.

rf4s.config: All controller classes receive the CfgNode object to access configuration settings (e.g., language for Detection, SMTP details for Notification, delays for Timer).

rf4s.utils: Used for logging and safe exit.

External Libraries: Heavily relies on pygetwindow, mss, cv2 (OpenCV), pytesseract, smtplib, requests.

How to Replicate/Understand
To replicate or deeply understand this module:

External Library Knowledge: A strong understanding of the external libraries used (especially pygetwindow, mss, opencv-python, pytesseract) is essential for replicating the core functionalities.

Image Recognition: Grasp the principles of template matching (cv2.matchTemplate) and OCR (pytesseract). Understand how image templates are managed.

Window Interaction: Learn how pygetwindow is used to find, activate, and get properties of windows.

Error Handling: Pay attention to how try-except blocks are used for robust handling of missing windows, failed network connections, or TimeoutError.

Configuration Dependency: Note how deeply these controllers depend on the cfg object to dynamically adjust their behavior based on user settings (e.g., language, notification preferences, detection thresholds).

graph TD
    A[Start Application: rf4s/app/app.py or tools/main.py] --> B{Call config.setup_cfg()};
    B --> C[Load Base Defaults from rf4s/config/defaults.py];
    C --> D[Create Initial CfgNode Object];
    D --> E{Merge config.yaml};
    E -- If config.yaml exists --> F[Load config.yaml];
    F --> G[Merge config.yaml into CfgNode];
    E -- If config.yaml missing --> H[Critical Error & Exit];
    G --> I{Parse Command-Line Arguments};
    I --> J[Convert Args to CfgNode Format (config.dict_to_cfg)];
    J --> K[Merge Args CfgNode into Main CfgNode];
    K --> L{Handle Profile Selection (in RF4SApp)};
    L -- User/CLI selects profile --> M[Load Profile Settings from CfgNode];
    M --> N[Merge Profile Settings into cfg.SELECTED];
    N --> O{Check Profile-Specific LAUNCH_OPTIONS};
    O -- If LAUNCH_OPTIONS exist --> P[Re-parse Args from LAUNCH_OPTIONS];
    P --> Q[Merge new Args CfgNode into Main CfgNode];
    Q --> R[Final Frozen CfgNode Available];
    N -- No LAUNCH_OPTIONS --> R;
    R --> S[Application Uses Final CfgNode];

    subgraph rf4s/config Module
        C
        F
        J
    end

    subgraph rf4s/app Module & tools/main.py
        A
        B
        D
        E
        G
        H
        I
        K
        L
        M
        N
        O
        P
        Q
        R
        S
    end

RF4S Module Blueprint: rf4s/config
The rf4s/config module is responsible for managing all application settings and parameters. It utilizes yacs (Yet Another Configuration System) to provide a flexible and hierarchical way to define, load, and override configurations from a YAML file (config.yaml) and command-line arguments.

Purpose
This module centralizes the configuration logic, enabling users and developers to easily customize the script's behavior without modifying the core code. It ensures:

Hierarchical Configuration: Settings are organized into logical sections (e.g., SCRIPT, KEY, PROFILE).

Default Values: Programmatic default values are established to ensure the script has a baseline configuration.

Override Mechanism: Supports overriding settings via config.yaml and command-line arguments, with a defined precedence.

Validation (Implicit): While not explicit validation methods here, the CfgNode structure and type expectations implicitly guide valid configurations.

Readability and Maintainability: Separates configuration from code, making the system easier to understand and manage.

Key Files and Their Functionality
rf4s/config/config.py
This Python file contains functions for setting up, loading, and manipulating the application's configuration using yacs.

Key Functions:

setup_cfg() -> CfgNode:

Initializes a yacs.config.CfgNode object with default configuration values defined in rf4s.config.defaults.

This function is the primary entry point for obtaining the base configuration.

print_cfg(cfg: CfgNode) -> None:

A utility function to print the contents of a CfgNode in a human-readable format, often used for debugging or displaying the active configuration.

dict_to_cfg(dictionary: dict) -> CfgNode:

Converts a standard Python dictionary into a yacs.config.CfgNode object. This is crucial for merging command-line arguments (which are typically parsed into a dictionary-like Namespace object) into the main configuration.

rf4s/config/defaults.py
This file defines the programmatic default values for the CfgNode. These defaults act as a fallback if corresponding settings are not found in config.yaml or provided via command-line arguments.

Content:

It defines a _C (conventionally, a CfgNode object) that structures all default configuration parameters.

Examples of default sections include:

_C.VERSION: Script version.

_C.SCRIPT: General script settings (language, launch options, detection confidences, alarm sound, screenshot tags).

_C.KEY: Key bindings for various in-game actions (tea, carrot, rods, coffee, digging tool, alcohol, main rod, spod rod, quit key).

_C.STAT: Thresholds and delays for consumable usage (energy, hunger, comfort, tea delay, coffee limit, alcohol delay).

_C.FRICTION_BRAKE: Settings for automated friction brake (initial, max, delays, sensitivity).

_C.KEEPNET: Keepnet management settings (capacity, fish delay, full action, whitelist/blacklist, tags).

_C.NOTIFICATION: Settings for email, MiaoTixing, and Discord notifications (server, credentials, webhook URL).

_C.PAUSE: Settings for occasional pauses during fishing.

_C.PROFILE: A nested structure defining default settings for various fishing modes (SPIN, BOTTOM, PIRK, ELEVATOR, TELESCOPIC, BOLOGNESE). Each mode has specific parameters like CAST_POWER_LEVEL, CAST_DELAY, RETRIEVAL_DURATION, SINK_TIMEOUT, FLOAT_SENSITIVITY, etc.

_C.ARGS: A special section (initially empty) that will be populated with parsed command-line arguments.

_C.SELECTED: Another special section (initially empty) that will hold the configuration for the currently selected user profile, dynamically populated at runtime.

rf4s/config/config.yaml
This YAML file is the primary user-editable configuration file. It allows users to override the default settings defined in defaults.py and customize fishing profiles.

Structure: Mirrors the CfgNode structure defined in defaults.py.

Key Sections (Examples):

VERSION: Script version.

SCRIPT: LANGUAGE, LAUNCH_OPTIONS, SMTP_VERIFICATION, SPOOL_CONFIDENCE, ALARM_SOUND, etc.

KEY: TEA, CARROT, BOTTOM_RODS, QUIT, etc.

STAT: ENERGY_THRESHOLD, HUNGER_THRESHOLD, COFFEE_LIMIT, etc.

FRICTION_BRAKE: INITIAL, MAX, SENSITIVITY.

KEEPNET: CAPACITY, FULL_ACTION, WHITELIST, BLACKLIST.

NOTIFICATION: EMAIL, PASSWORD, DISCORD_WEBHOOK_URL.

PROFILE: Defines specific named fishing profiles (e.g., SPIN, BOTTOM, PIRK_WITH_RETRIEVAL, BOLOGNESE). Each profile typically inherits from a base mode and can override its settings or add new ones.

Configuration Loading and Precedence
The configuration loading process follows a clear precedence:

Programmatic Defaults (defaults.py): The absolute baseline values are established here.

config.yaml: Values from this file override the programmatic defaults. This is the primary way users customize settings.

Command-Line Arguments (tools/main.py): Arguments passed when running main.py (e.g., --rainbow, --trolling forward, SCRIPT.LANGUAGE en) override both defaults and config.yaml.

Profile-Specific LAUNCH_OPTIONS: If a selected profile in config.yaml has a LAUNCH_OPTIONS field, these options are parsed and merged last, giving them the highest precedence for profile-specific overrides.

How to Replicate/Understand
To replicate or deeply understand this module:

yacs Library: Familiarize yourself with yacs.config.CfgNode and its merge_from_file, merge_from_other_cfg, and merge_from_list methods, which are central to how configurations are loaded and combined.

Configuration Hierarchy: Pay close attention to the nested structure in defaults.py and config.yaml. Understanding how PROFILE and SELECTED nodes work is key to dynamic profile loading.

Precedence Rules: Internalize the order of precedence for configuration overrides (defaults -> config.yaml -> CLI args -> profile LAUNCH_OPTIONS). This is critical for predicting script behavior based on various inputs.

rf4s/app/app.py Interaction: Observe how App and ToolApp call config.setup_cfg() and cfg.merge_from_file() to get their initial configuration, and how main.py further processes command-line arguments and profile selection to finalize the cfg object.

classDiagram
    direction LR
    App <|-- ToolApp
    App <|-- RF4SApp

    class App {
        <<abstract>>
        +CfgNode cfg
        +Window window
        +__init__()
        #_on_release(key)
        +<<abstract>>_start()
        +<<abstract>>start()
        +<<abstract>>create_parser()
        +<<abstract>>display_result()
    }

    class ToolApp {
        +Detection detection
        +Result result
        +__init__()
        +display_result()
        +start()
        --
        - Inherits _start()
        - Inherits create_parser()
    }

    class RF4SApp {
        +ArgumentParser parser
        +Namespace args
        +Player player
        +__init__()
        +create_parser()
        +is_args_valid(args)
        +is_pid_valid(pid)
        +is_smtp_valid()
        +is_discord_webhook_url_valid()
        +is_images_valid()
        +is_profile_valid(profile_name)
        +display_profiles()
        +get_pid()
        +create_user_profile()
        +is_window_valid()
        +is_electro_valid()
        #_start()
        +start()
        +display_result()
    }

    class Window {
        // From rf4s.controller.window
    }
    class Detection {
        // From rf4s.controller.detection
    }
    class Result {
        // From rf4s.result.result
    }
    class Player {
        // From rf4s.player
    }

    App "1" *-- "1" Window : uses >
    ToolApp "1" *-- "1" Detection : uses >
    ToolApp "1" *-- "1" Result : uses >
    RF4SApp "1" *-- "1" Player : uses >
	
	RF4S Module Blueprint: rf4s/app
The rf4s/app module contains the foundational classes for all tools and the main fishing bot script. It establishes a common structure for application initialization, configuration management, window interaction, and graceful termination.

Purpose
This module provides the core App and ToolApp classes, which serve as the base for various functionalities within the RF4S project. It encapsulates common operations such as:

Configuration Loading and Management: Handles loading config.yaml and merging command-line arguments.

Game Window Control: Provides an interface for interacting with the Russian Fishing 4 game window (activation, deactivation).

Result Display: Standardizes how operation results are presented to the user.

Graceful Exit: Implements mechanisms for stopping the script, including monitoring a custom quit key.

Key Classes and Their Functionality
App (ABC)
This is an abstract base class that defines the fundamental interface for any application or tool within RF4S. It ensures that all concrete application classes implement certain core methods.

Attributes:

cfg (yacs.config.CfgNode): A CfgNode object that holds the merged configuration from config.yaml and any command-line overrides. It's initialized in the constructor.

window (rf4s.controller.window.Window): An instance of the Window controller, used to interact with the game window.

Core Methods:

__init__(self):

Initializes self.cfg by loading the default configuration and then merging config.yaml.

Initializes self.window.

Includes logic to find the root directory of the application, accommodating both compiled executables and Python source execution.

Performs critical checks like the existence of config.yaml.

_on_release(self, key: keyboard.KeyCode) -> None:

A private method used as a callback for the pynput keyboard listener.

Monitors for the configured KEY.QUIT (default CTRL-C).

If the quit key is pressed, it simulates a CTRL_C_EVENT to terminate the script gracefully across different operating systems.

_start(self) (abstract method):

Must be implemented by subclasses. This method contains the core logic of the specific application or tool.

start(self) (abstract method):

Must be implemented by subclasses. This method acts as a wrapper for _start(), typically handling window activation, keyboard listener setup, and result display around the core logic.

create_parser(self) (abstract method):

Must be implemented by subclasses to define and return an ArgumentParser specific to the tool's command-line options.

display_result(self) -> None (abstract method):

Must be implemented by subclasses to define how the results of the application's execution are displayed.

ToolApp (App)
This class extends the App base class and provides common functionalities specifically for standalone tools (like Craft, Harvest, Auto Friction Brake, Calculate). It builds upon App by adding argument parsing, detection capabilities, and a concrete implementation of result display.

Attributes:

Inherits cfg and window from App.

detection (rf4s.controller.detection.Detection): An instance of the Detection controller, used for visual recognition within the game.

result (rf4s.result.result.Result): An instance of the Result class, used to store and manage the data/statistics collected during the tool's execution.

Core Methods:

__init__(self):

Calls super().__init__() to initialize the base App components.

Parses command-line arguments using the create_parser() method and merges them into self.cfg.

Creates instances of Detection and Result.

Freezes the configuration (self.cfg.freeze()) after initial setup to prevent accidental modification (though it seems RF4SApp re-merges later, which might be a point of careful consideration).

display_result(self) -> None:

Provides a concrete implementation for displaying results. It retrieves data from self.result and presents it in a formatted rich.table.Table.

start(self) -> None:

Provides a concrete implementation for the start() method.

Starts the keyboard listener if the quit key is not CTRL-C.

Activates the game window (self.window.activate_game_window()).

Calls the _start() method (which must be implemented by concrete tool classes).

Includes try-except KeyboardInterrupt for graceful termination.

Calls display_result() after _start() completes or is interrupted.

Activates the script window (self.window.activate_script_window()) to return focus.

_start(self) (abstract method, inherited): Still requires implementation by the specific tool.

create_parser(self) (abstract method, inherited): Still requires implementation by the specific tool.

Relationship to Other Modules
rf4s.config: Directly used for loading and managing the application configuration (config.setup_cfg, config.dict_to_cfg).

rf4s.controller.window: The Window class is instantiated and used by App for game window management.

rf4s.controller.detection: The Detection class is instantiated and used by ToolApp for in-game visual detection.

rf4s.result.result: The Result class is instantiated and used by ToolApp for collecting and displaying operational results.

rf4s.utils: Used for utility functions like is_compiled() and safe_exit().

tools/main.py: The main entry point RF4SApp (which extends App) and other tools (CraftApp, HarvestApp, etc., which extend ToolApp) utilize these base classes.

How to Replicate/Understand
To replicate or deeply understand this module:

Dependencies: Understand yacs.config for configuration management and pynput.keyboard for input monitoring.

Inheritance: Grasp the inheritance hierarchy: App (abstract) -> ToolApp (concrete implementation for general tools) and App -> RF4SApp (concrete for main fishing bot).

Core Flow: Observe how start() orchestrates _start(), window activation, and result display.

Error Handling: Note the try-except KeyboardInterrupt for graceful termination.

Path Resolution: Understand how ROOT is determined to correctly locate config.yaml in different deployment scenarios (compiled vs. source).

This module forms the backbone, ensuring consistency and reusability across different automation features.

seems to be missing Alot of useful details, not a 1:1 whats still missing to complete. need all blueprint markdowns  and mermaid diagrams in there own file. each should have there own file all diagrams all blueprints, all sections, and stages of project, all phases, each component, function, backend, frontend, logic, ect





<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RF4S Configurator</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #1a202c; /* Dark background inspired by RF4 */
            color: #e2e8f0; /* Light text for contrast */
            display: flex;
            justify-content: center;
            align-items: flex-start; /* Align to top for longer content */
            min-height: 100vh;
            padding: 2rem;
            box-sizing: border-box;
        }
        .container {
            background-color: #2d3748; /* Slightly lighter dark background for container */
            border-radius: 0.75rem; /* Rounded corners */
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* Subtle shadow */
            width: 100%;
            max-width: 960px; /* Max width for readability */
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .header {
            background-color: #242c38; /* Even darker header */
            padding: 1.5rem;
            text-align: center;
            border-bottom: 1px solid #4a5568;
        }
        .nav-tabs {
            display: flex;
            justify-content: center;
            background-color: #242c38;
            border-bottom: 1px solid #4a5568;
            padding: 0.5rem 0;
        }
        .nav-tab {
            padding: 0.75rem 1.5rem;
            cursor: pointer;
            border-radius: 0.5rem;
            margin: 0 0.5rem;
            transition: background-color 0.2s, color 0.2s;
            font-weight: 600;
            color: #a0aec0;
        }
        .nav-tab.active {
            background-color: #4a5568; /* Active tab background */
            color: #cbd5e0; /* Active tab text */
        }
        .content {
            padding: 2rem;
            overflow-y: auto; /* Enable scrolling for content */
            max-height: calc(100vh - 100px); /* Adjust based on header/footer height */
        }
        .form-section {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background-color: #2d3748;
            border-radius: 0.5rem;
            border: 1px solid #4a5568;
        }
        .form-section-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: #cbd5e0;
        }
        .form-group {
            margin-bottom: 1rem;
        }
        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #a0aec0;
        }
        input[type="text"],
        input[type="number"],
        input[type="email"],
        input[type="password"],
        select {
            width: 100%;
            padding: 0.75rem;
            border-radius: 0.5rem;
            border: 1px solid #4a5568;
            background-color: #1a202c; /* Input background */
            color: #e2e8f0;
            font-size: 1rem;
            box-sizing: border-box;
        }
        input[type="checkbox"] {
            margin-right: 0.5rem;
        }
        .button {
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 700;
            cursor: pointer;
            transition: background-color 0.2s, color 0.2s;
            margin-top: 1rem;
            background-color: #4299e1; /* Blue button */
            color: white;
            border: none;
        }
        .button:hover {
            background-color: #3182ce; /* Darker blue on hover */
        }
        .note {
            background-color: #31445b; /* Slightly lighter blue-grey for notes */
            border-left: 4px solid #63b3ed; /* Blue border */
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 2rem;
            color: #cbd5e0;
        }

        .profile-config-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
        }
        .profile-card {
            background-color: #242c38;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            border: 1px solid #4a5568;
        }
        .profile-card h3 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: #63b3ed;
        }
        .profile-card input[type="text"],
        .profile-card input[type="number"] {
            background-color: #1a202c;
        }
        .profile-add-btn {
            background-color: #48bb78; /* Green for add */
            margin-top: 1.5rem;
        }
        .profile-add-btn:hover {
            background-color: #38a169;
        }
        .profile-remove-btn {
            background-color: #e53e3e; /* Red for remove */
            margin-left: 1rem;
        }
        .profile-remove-btn:hover {
            background-color: #c53030;
        }
        .download-button {
            background-color: #d69e2e; /* Yellow for download */
        }
        .download-button:hover {
            background-color: #b7791f;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            .nav-tab {
                padding: 0.5rem 1rem;
                font-size: 0.9rem;
                margin: 0 0.25rem;
            }
            .form-section {
                padding: 1rem;
            }
            .form-section-title {
                font-size: 1.25rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="text-3xl font-bold text-gray-100">RF4S Configurator</h1>
            <p class="text-gray-400 mt-2">Manage your Russian Fishing 4 Script settings</p>
        </div>

        <div class="nav-tabs">
            <div class="nav-tab active" data-tab="main-config">Main Configuration</div>
            <div class="nav-tab" data-tab="profiles">Fishing Profiles</div>
            <div class="nav-tab" data-tab="tools">Tools & Utilities</div>
        </div>

        <div class="content">
            <div id="main-config" class="tab-content active">
                <div class="note">
                    <strong>Important Note:</strong> This web UI helps you configure your `config.yaml` file. The actual fishing automation is performed by the Python scripts running on your local machine. You will need to download the generated `config.yaml` and place it in your RF4S project directory for the script to use.
                </div>

                <div class="form-section">
                    <h2 class="form-section-title">Script Settings</h2>
                    <div class="form-group">
                        <label for="script-language">Language:</label>
                        <select id="script-language">
                            <option value="en">English (en)</option>
                            <option value="zh-TW">Traditional Chinese (zh-TW)</option>
                            <!-- Add more languages as supported -->
                        </select>
                    </div>
                    <div class="form-group flex items-center">
                        <input type="checkbox" id="script-smtp-verification">
                        <label for="script-smtp-verification">SMTP Verification</label>
                    </div>
                    <div class="form-group flex items-center">
                        <input type="checkbox" id="script-image-verification">
                        <label for="script-image-verification">Image Verification</label>
                    </div>
                    <div class="form-group flex items-center">
                        <input type="checkbox" id="script-snag-detection">
                        <label for="script-snag-detection">Snag Detection</label>
                    </div>
                    <div class="form-group flex items-center">
                        <input type="checkbox" id="script-spooling-detection">
                        <label for="script-spooling-detection">Spooling Detection</label>
                    </div>
                    <div class="form-group flex items-center">
                        <input type="checkbox" id="script-random-rod-selection">
                        <label for="script-random-rod-selection">Random Rod Selection (Bottom Mode)</label>
                    </div>
                    <div class="form-group">
                        <label for="script-spool-confidence">Spool Confidence (0.0 - 1.0):</label>
                        <input type="number" id="script-spool-confidence" step="0.01" min="0" max="1">
                    </div>
                    <div class="form-group">
                        <label for="script-lure-change-delay">Lure Change Delay (seconds):</label>
                        <input type="number" id="script-lure-change-delay" step="1" min="0">
                    </div>
                    <div class="form-group">
                        <label for="script-random-cast-probability">Random Cast Probability (0.0 - 1.0):</label>
                        <input type="number" id="script-random-cast-probability" step="0.01" min="0" max="1">
                    </div>
                </div>

                <div class="form-section">
                    <h2 class="form-section-title">Key Bindings</h2>
                    <p class="text-sm text-gray-500 mb-4">Set these to your in-game keybinds. For `BOTTOM_RODS`, use comma-separated numbers (e.g., "1,2,3").</p>
                    <div class="form-group">
                        <label for="key-quit">Quit Key:</label>
                        <input type="text" id="key-quit" placeholder="e.g., CTRL-C">
                    </div>
                    <div class="form-group">
                        <label for="key-main-rod">Main Rod:</label>
                        <input type="text" id="key-main-rod" placeholder="e.g., 1">
                    </div>
                    <div class="form-group">
                        <label for="key-bottom-rods">Bottom Rods (comma-separated):</label>
                        <input type="text" id="key-bottom-rods" placeholder="e.g., 1,2,3">
                    </div>
                    <div class="form-group">
                        <label for="key-coffee">Coffee Key:</label>
                        <input type="text" id="key-coffee" placeholder="e.g., 4">
                    </div>
                    <div class="form-group">
                        <label for="key-digging-tool">Digging Tool Key:</label>
                        <input type="text" id="key-digging-tool" placeholder="e.g., 5">
                    </div>
                    <div class="form-group">
                        <label for="key-alcohol">Alcohol Key:</label>
                        <input type="text" id="key-alcohol" placeholder="e.g., 6">
                    </div>
                    <div class="form-group">
                        <label for="key-spod-rod">Spod Rod Key:</label>
                        <input type="text" id="key-spod-rod" placeholder="e.g., 7">
                    </div>
                    <div class="form-group">
                        <label for="key-tea">Tea Key (Set to -1 to disable):</label>
                        <input type="text" id="key-tea" placeholder="e.g., -1">
                    </div>
                    <div class="form-group">
                        <label for="key-carrot">Carrot Key (Set to -1 to disable):</label>
                        <input type="text" id="key-carrot" placeholder="e.g., -1">
                    </div>
                </div>

                <div class="form-section">
                    <h2 class="form-section-title">Statistic & Consumable Thresholds</h2>
                    <div class="form-group">
                        <label for="stat-energy-threshold">Energy Threshold (0.0 - 1.0):</label>
                        <input type="number" id="stat-energy-threshold" step="0.01" min="0" max="1">
                    </div>
                    <div class="form-group">
                        <label for="stat-hunger-threshold">Hunger Threshold (0.0 - 1.0):</label>
                        <input type="number" id="stat-hunger-threshold" step="0.01" min="0" max="1">
                    </div>
                    <div class="form-group">
                        <label for="stat-comfort-threshold">Comfort Threshold (0.0 - 1.0):</label>
                        <input type="number" id="stat-comfort-threshold" step="0.01" min="0" max="1">
                    </div>
                    <div class="form-group">
                        <label for="stat-tea-delay">Tea Delay (seconds):</label>
                        <input type="number" id="stat-tea-delay" step="1" min="0">
                    </div>
                    <div class="form-group">
                        <label for="stat-coffee-limit">Coffee Limit:</label>
                        <input type="number" id="stat-coffee-limit" step="1" min="0">
                    </div>
                    <div class="form-group">
                        <label for="stat-coffee-per-drink">Coffee Per Drink:</label>
                        <input type="number" id="stat-coffee-per-drink" step="1" min="0">
                    </div>
                    <div class="form-group">
                        <label for="stat-alcohol-delay">Alcohol Delay (seconds):</label>
                        <input type="number" id="stat-alcohol-delay" step="1" min="0">
                    </div>
                </div>

                <div class="form-section">
                    <h2 class="form-section-title">Friction Brake Settings</h2>
                    <div class="form-group">
                        <label for="fb-initial">Initial Brake:</label>
                        <input type="number" id="fb-initial" step="1" min="0" max="30">
                    </div>
                    <div class="form-group">
                        <label for="fb-max">Max Brake:</label>
                        <input type="number" id="fb-max" step="1" min="0" max="30">
                    </div>
                    <div class="form-group">
                        <label for="fb-start-delay">Start Delay (seconds):</label>
                        <input type="number" id="fb-start-delay" step="0.1" min="0">
                    </div>
                    <div class="form-group">
                        <label for="fb-increase-delay">Increase Delay (seconds):</label>
                        <input type="number" id="fb-increase-delay" step="0.1" min="0">
                    </div>
                    <div class="form-group">
                        <label for="fb-sensitivity">Sensitivity:</label>
                        <select id="fb-sensitivity">
                            <option value="low">low</option>
                            <option value="medium">medium</option>
                            <option value="high">high</option>
                        </select>
                    </div>
                </div>

                <div class="form-section">
                    <h2 class="form-section-title">Keepnet Settings</h2>
                    <div class="form-group">
                        <label for="keepnet-capacity">Capacity:</label>
                        <input type="number" id="keepnet-capacity" step="1" min="1">
                    </div>
                    <div class="form-group">
                        <label for="keepnet-full-action">Full Action:</label>
                        <select id="keepnet-full-action">
                            <option value="quit">quit</option>
                            <option value="sell">sell</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="keepnet-whitelist">Whitelist (comma-separated):</label>
                        <input type="text" id="keepnet-whitelist" placeholder="e.g., mackerel,saithe">
                    </div>
                    <div class="form-group">
                        <label for="keepnet-blacklist">Blacklist (comma-separated):</label>
                        <input type="text" id="keepnet-blacklist" placeholder="e.g., frog,snake">
                    </div>
                    <div class="form-group">
                        <label for="keepnet-tags">Tags (comma-separated, for tagged fish detection):</label>
                        <input type="text" id="keepnet-tags" placeholder="e.g., green,yellow">
                    </div>
                </div>

                <div class="form-section">
                    <h2 class="form-section-title">Notification Settings</h2>
                    <div class="form-group">
                        <label for="notification-email">Email:</label>
                        <input type="email" id="notification-email" placeholder="email@example.com">
                    </div>
                    <div class="form-group">
                        <label for="notification-password">Email App Password:</label>
                        <input type="password" id="notification-password" placeholder="your_app_password">
                    </div>
                    <div class="form-group">
                        <label for="notification-smtp-server">SMTP Server:</label>
                        <input type="text" id="notification-smtp-server" placeholder="e.g., smtp.gmail.com">
                    </div>
                    <div class="form-group">
                        <label for="notification-miaotixing-code">Miaotixing Code:</label>
                        <input type="text" id="notification-miaotixing-code" placeholder="example_code">
                    </div>
                    <div class="form-group">
                        <label for="notification-discord-webhook-url">Discord Webhook URL:</label>
                        <input type="text" id="notification-discord-webhook-url" placeholder="https://discord.com/api/webhooks/...">
                    </div>
                </div>

                <div class="form-section">
                    <h2 class="form-section-title">Pause Settings</h2>
                    <div class="form-group">
                        <label for="pause-delay">Delay (seconds before pause):</label>
                        <input type="number" id="pause-delay" step="1" min="0">
                    </div>
                    <div class="form-group">
                        <label for="pause-duration">Duration (seconds of pause):</label>
                        <input type="number" id="pause-duration" step="1" min="0">
                    </div>
                </div>
            </div>

            <div id="profiles" class="tab-content hidden">
                <div class="note">
                    Here you can manage your custom fishing profiles. Each profile builds upon a base fishing mode. You can add new profiles or edit existing ones.
                </div>
                <div id="profile-list" class="profile-config-grid">
                    <!-- Profile cards will be dynamically loaded here -->
                </div>
                <button id="add-profile-btn" class="button profile-add-btn">Add New Profile</button>
            </div>

            <div id="tools" class="tab-content hidden">
                <div class="note">
                    These are individual utilities that can be run from `tools/main.py`. The settings configured here will be applied if you select the respective tool when running the script.
                </div>
                <div class="form-section">
                    <h2 class="form-section-title">Toggle Moving Forward</h2>
                    <div class="form-group flex items-center">
                        <input type="checkbox" id="tool-move-sprint">
                        <label for="tool-move-sprint">Sprint (Shift + W)</label>
                    </div>
                </div>
                <div class="form-section">
                    <h2 class="form-section-title">Automate Friction Brake</h2>
                    <p class="text-sm text-gray-500 mb-4">Settings are shared with the 'Friction Brake Settings' in Main Configuration.</p>
                </div>
                <div class="form-section">
                    <h2 class="form-section-title">Calculate Tackle's Stats</h2>
                    <p class="text-sm text-gray-500 mb-4">No specific UI settings for this tool; it directly calculates based on in-game UI.</p>
                </div>
                <div class="form-section">
                    <h2 class="form-section-title">Craft Items / Harvest Baits</h2>
                    <p class="text-sm text-gray-500 mb-4">These tools are mostly automated sequences. Ensure 'Digging Tool' key is set in Key Bindings for harvesting.</p>
                </div>
            </div>

            <div class="flex justify-end gap-4 mt-8">
                <button id="download-config-btn" class="button download-button">Download config.yaml</button>
            </div>
        </div>
    </div>

    <script>
        // Default configuration structure for the UI to operate on
        // This mirrors rf4s/config/defaults.py and rf4s/config/config.yaml
        let currentConfig = {
            VERSION: "0.5.2",
            SCRIPT: {
                LANGUAGE: "en",
                LAUNCH_OPTIONS: "", // Not directly editable via UI but maintained
                SMTP_VERIFICATION: true,
                IMAGE_VERIFICATION: true,
                SNAG_DETECTION: true,
                SPOOLING_DETECTION: true,
                RANDOM_ROD_SELECTION: true,
                SPOOL_CONFIDENCE: 0.98,
                SPOD_ROD_RECAST_DELAY: 1800,
                LURE_CHANGE_DELAY: 1800,
                ALARM_SOUND: "./static/sound/guitar.wav",
                RANDOM_CAST_PROBABILITY: 0.25,
                SCREENSHOT_TAGS: ["green", "yellow", "blue", "purple", "pink"], // Not exposed in UI for simplicity
            },
            KEY: {
                TEA: -1,
                CARROT: -1,
                BOTTOM_RODS: [1, 2, 3],
                COFFEE: 4,
                DIGGING_TOOL: 5,
                ALCOHOL: 6,
                MAIN_ROD: 1,
                SPOD_ROD: 7,
                QUIT: "CTRL-C",
            },
            STAT: {
                ENERGY_THRESHOLD: 0.74,
                HUNGER_THRESHOLD: 0.5,
                COMFORT_THRESHOLD: 0.51,
                TEA_DELAY: 300,
                COFFEE_LIMIT: 10,
                COFFEE_PER_DRINK: 1,
                ALCOHOL_DELAY: 900,
                ALCOHOL_PER_DRINK: 1,
            },
            FRICTION_BRAKE: {
                INITIAL: 29,
                MAX: 30,
                START_DELAY: 2.0,
                INCREASE_DELAY: 1.0,
                SENSITIVITY: "medium",
            },
            KEEPNET: {
                CAPACITY: 100,
                FISH_DELAY: 0.0, // Not exposed in UI for simplicity
                GIFT_DELAY: 4.0, // Not exposed in UI for simplicity
                FULL_ACTION: "quit",
                WHITELIST: ["mackerel", "saithe", "herring", "squid", "scallop", "mussel"],
                BLACKLIST: [],
                TAGS: ["green", "yellow", "blue", "purple", "pink"],
            },
            NOTIFICATION: {
                EMAIL: "email@example.com",
                PASSWORD: "password",
                SMTP_SERVER: "smtp.gmail.com",
                MIAO_CODE: "example",
                DISCORD_WEBHOOK_URL: "",
            },
            PAUSE: {
                DELAY: 1800,
                DURATION: 600,
            },
            PROFILE: {
                SPIN: {
                    MODE: "spin",
                    LAUNCH_OPTIONS: "",
                    CAST_POWER_LEVEL: 5.0,
                    CAST_DELAY: 6.0,
                    TIGHTEN_DURATION: 0.0,
                    RETRIEVAL_DURATION: 0.0,
                    RETRIEVAL_DELAY: 0.0,
                    RETRIEVAL_TIMEOUT: 256.0,
                    PRE_ACCELERATION: false,
                    POST_ACCELERATION: "off",
                    TYPE: "normal",
                },
                SPIN_WITH_PAUSE: {
                    MODE: "spin",
                    LAUNCH_OPTIONS: "",
                    CAST_POWER_LEVEL: 5.0,
                    CAST_DELAY: 6.0,
                    TIGHTEN_DURATION: 1.0,
                    RETRIEVAL_DURATION: 1.0,
                    RETRIEVAL_DELAY: 3.0,
                    RETRIEVAL_TIMEOUT: 256.0,
                    PRE_ACCELERATION: false,
                    POST_ACCELERATION: "off",
                    TYPE: "pause",
                },
                SPIN_WITH_LIFT: {
                    MODE: "spin",
                    LAUNCH_OPTIONS: "",
                    CAST_POWER_LEVEL: 5.0,
                    CAST_DELAY: 6.0,
                    TIGHTEN_DURATION: 0.0,
                    RETRIEVAL_DURATION: 1.0,
                    RETRIEVAL_DELAY: 1.0,
                    RETRIEVAL_TIMEOUT: 256.0,
                    PRE_ACCELERATION: false,
                    POST_ACCELERATION: "off",
                    TYPE: "lift",
                },
                BOTTOM: {
                    MODE: "bottom",
                    LAUNCH_OPTIONS: "",
                    CAST_POWER_LEVEL: 5.0,
                    CAST_DELAY: 4.0,
                    POST_ACCELERATION: "off",
                    CHECK_DELAY: 32.0,
                    CHECK_MISS_LIMIT: 16,
                    PUT_DOWN_DELAY: 0.0,
                },
                PIRK: {
                    MODE: "pirk",
                    LAUNCH_OPTIONS: "",
                    CAST_POWER_LEVEL: 1.0,
                    CAST_DELAY: 4.0,
                    SINK_TIMEOUT: 60.0,
                    TIGHTEN_DURATION: 1.0,
                    DEPTH_ADJUST_DELAY: 4.0,
                    DEPTH_ADJUST_DURATION: 1.0,
                    CTRL: false,
                    SHIFT: false,
                    PIRK_DURATION: 0.5,
                    PIRK_DELAY: 2.0,
                    PIRK_TIMEOUT: 32.0,
                    PIRK_RETRIEVAL: false,
                    HOOK_DELAY: 0.5,
                    POST_ACCELERATION: "auto",
                },
                PIRK_WITH_RETRIEVAL: {
                    MODE: "pirk",
                    LAUNCH_OPTIONS: "",
                    CAST_POWER_LEVEL: 1.0,
                    CAST_DELAY: 4.0,
                    SINK_TIMEOUT: 60.0,
                    TIGHTEN_DURATION: 1.0,
                    DEPTH_ADJUST_DELAY: 0.0,
                    DEPTH_ADJUST_DURATION: 1.0,
                    CTRL: false,
                    SHIFT: false,
                    PIRK_DURATION: 0.5,
                    PIRK_DELAY: 2.0,
                    PIRK_TIMEOUT: 32.0,
                    PIRK_RETRIEVAL: true,
                    HOOK_DELAY: 0.5,
                    POST_ACCELERATION: "auto",
                },
                WAKEY_RIG: {
                    MODE: "pirk",
                    LAUNCH_OPTIONS: "",
                    CAST_POWER_LEVEL: 1.0,
                    CAST_DELAY: 4.0,
                    SINK_TIMEOUT: 45.0,
                    TIGHTEN_DURATION: 1.0,
                    DEPTH_ADJUST_DELAY: 4.0,
                    DEPTH_ADJUST_DURATION: 1.0,
                    CTRL: true,
                    SHIFT: false,
                    PIRK_DURATION: 1.5,
                    PIRK_DELAY: 4.0,
                    PIRK_TIMEOUT: 32.0,
                    PIRK_RETRIEVAL: false,
                    HOOK_DELAY: 0.5,
                    POST_ACCELERATION: "auto",
                },
                ELEVATOR: {
                    MODE: "elevator",
                    LAUNCH_OPTIONS: "",
                    CAST_POWER_LEVEL: 1.0,
                    CAST_DELAY: 4.0,
                    SINK_TIMEOUT: 60.0,
                    TIGHTEN_DURATION: 1.0,
                    ELEVATE_DURATION: 4.0,
                    ELEVATE_DELAY: 4.0,
                    ELEVATE_TIMEOUT: 40.0,
                    DROP: false,
                    HOOK_DELAY: 0.5,
                    POST_ACCELERATION: "auto",
                },
                ELEVATOR_WITH_DROP: {
                    MODE: "elevator",
                    LAUNCH_OPTIONS: "",
                    CAST_POWER_LEVEL: 1.0,
                    CAST_DELAY: 4.0,
                    SINK_TIMEOUT: 60.0,
                    TIGHTEN_DURATION: 1.0,
                    ELEVATE_DURATION: 4.0,
                    ELEVATE_DELAY: 4.0,
                    ELEVATE_TIMEOUT: 40.0,
                    DROP: true,
                    HOOK_DELAY: 0.5,
                    POST_ACCELERATION: "auto",
                },
                TELESCOPIC: {
                    MODE: "telescopic",
                    LAUNCH_OPTIONS: "",
                    CAST_POWER_LEVEL: 5.0,
                    CAST_DELAY: 4.0,
                    FLOAT_SENSITIVITY: 0.68,
                    CHECK_DELAY: 1.0,
                    PULL_DELAY: 0.5,
                    DRIFT_TIMEOUT: 16.0,
                    CAMERA_SHAPE: "square",
                },
                BOLOGNESE: {
                    MODE: "bolognese",
                    LAUNCH_OPTIONS: "",
                    CAST_POWER_LEVEL: 5.0,
                    CAST_DELAY: 4.0,
                    FLOAT_SENSITIVITY: 0.68,
                    CHECK_DELAY: 1.0,
                    PULL_DELAY: 0.5,
                    DRIFT_TIMEOUT: 32.0,
                    CAMERA_SHAPE: "square",
                    POST_ACCELERATION: "off",
                },
            },
        };

        // Base profile structures for adding new profiles
        const baseProfileTemplates = {
            "spin": {
                MODE: "spin",
                LAUNCH_OPTIONS: "",
                CAST_POWER_LEVEL: 5.0,
                CAST_DELAY: 6.0,
                TIGHTEN_DURATION: 0.0,
                RETRIEVAL_DURATION: 0.0,
                RETRIEVAL_DELAY: 0.0,
                RETRIEVAL_TIMEOUT: 256.0,
                PRE_ACCELERATION: false,
                POST_ACCELERATION: "off",
                TYPE: "normal",
            },
            "bottom": {
                MODE: "bottom",
                LAUNCH_OPTIONS: "",
                CAST_POWER_LEVEL: 5.0,
                CAST_DELAY: 4.0,
                POST_ACCELERATION: "off",
                CHECK_DELAY: 32.0,
                CHECK_MISS_LIMIT: 16,
                PUT_DOWN_DELAY: 0.0,
            },
            "pirk": {
                MODE: "pirk",
                LAUNCH_OPTIONS: "",
                CAST_POWER_LEVEL: 1.0,
                CAST_DELAY: 4.0,
                SINK_TIMEOUT: 60.0,
                TIGHTEN_DURATION: 1.0,
                DEPTH_ADJUST_DELAY: 4.0,
                DEPTH_ADJUST_DURATION: 1.0,
                CTRL: false,
                SHIFT: false,
                PIRK_DURATION: 0.5,
                PIRK_DELAY: 2.0,
                PIRK_TIMEOUT: 32.0,
                PIRK_RETRIEVAL: false,
                HOOK_DELAY: 0.5,
                POST_ACCELERATION: "auto",
            },
            "elevator": {
                MODE: "elevator",
                LAUNCH_OPTIONS: "",
                CAST_POWER_LEVEL: 1.0,
                CAST_DELAY: 4.0,
                SINK_TIMEOUT: 60.0,
                TIGHTEN_DURATION: 1.0,
                ELEVATE_DURATION: 4.0,
                ELEVATE_DELAY: 4.0,
                ELEVATE_TIMEOUT: 40.0,
                DROP: false,
                HOOK_DELAY: 0.5,
                POST_ACCELERATION: "auto",
            },
            "telescopic": {
                MODE: "telescopic",
                LAUNCH_OPTIONS: "",
                CAST_POWER_LEVEL: 5.0,
                CAST_DELAY: 4.0,
                FLOAT_SENSITIVITY: 0.68,
                CHECK_DELAY: 1.0,
                PULL_DELAY: 0.5,
                DRIFT_TIMEOUT: 16.0,
                CAMERA_SHAPE: "square",
            },
            "bolognese": {
                MODE: "bolognese",
                LAUNCH_OPTIONS: "",
                CAST_POWER_LEVEL: 5.0,
                CAST_DELAY: 4.0,
                FLOAT_SENSITIVITY: 0.68,
                CHECK_DELAY: 1.0,
                PULL_DELAY: 0.5,
                DRIFT_TIMEOUT: 32.0,
                CAMERA_SHAPE: "square",
                POST_ACCELERATION: "off",
            },
        };


        document.addEventListener('DOMContentLoaded', () => {
            setupTabs();
            loadConfigToUI(currentConfig);
            renderProfiles();

            document.getElementById('download-config-btn').addEventListener('click', downloadConfig);
            document.getElementById('add-profile-btn').addEventListener('click', addNewProfile);

            // Add change listeners for main config inputs
            document.getElementById('main-config').addEventListener('change', updateConfigFromUI);
            document.getElementById('main-config').addEventListener('input', updateConfigFromUI); // For number inputs changing during typing
        });

        function setupTabs() {
            const tabs = document.querySelectorAll('.nav-tab');
            const contents = document.querySelectorAll('.tab-content');

            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(item => item.classList.remove('active'));
                    contents.forEach(item => item.classList.add('hidden'));

                    tab.classList.add('active');
                    document.getElementById(tab.dataset.tab).classList.remove('hidden');
                });
            });
        }

        // Function to load the currentConfig into the UI form fields
        function loadConfigToUI(cfg) {
            // SCRIPT settings
            document.getElementById('script-language').value = cfg.SCRIPT.LANGUAGE;
            document.getElementById('script-smtp-verification').checked = cfg.SCRIPT.SMTP_VERIFICATION;
            document.getElementById('script-image-verification').checked = cfg.SCRIPT.IMAGE_VERIFICATION;
            document.getElementById('script-snag-detection').checked = cfg.SCRIPT.SNAG_DETECTION;
            document.getElementById('script-spooling-detection').checked = cfg.SCRIPT.SPOOLING_DETECTION;
            document.getElementById('script-random-rod-selection').checked = cfg.SCRIPT.RANDOM_ROD_SELECTION;
            document.getElementById('script-spool-confidence').value = cfg.SCRIPT.SPOOL_CONFIDENCE;
            document.getElementById('script-lure-change-delay').value = cfg.SCRIPT.LURE_CHANGE_DELAY;
            document.getElementById('script-random-cast-probability').value = cfg.SCRIPT.RANDOM_CAST_PROBABILITY;

            // KEY settings
            document.getElementById('key-quit').value = cfg.KEY.QUIT;
            document.getElementById('key-main-rod').value = cfg.KEY.MAIN_ROD;
            document.getElementById('key-bottom-rods').value = cfg.KEY.BOTTOM_RODS.join(',');
            document.getElementById('key-coffee').value = cfg.KEY.COFFEE;
            document.getElementById('key-digging-tool').value = cfg.KEY.DIGGING_TOOL;
            document.getElementById('key-alcohol').value = cfg.KEY.ALCOHOL;
            document.getElementById('key-spod-rod').value = cfg.KEY.SPOD_ROD;
            document.getElementById('key-tea').value = cfg.KEY.TEA;
            document.getElementById('key-carrot').value = cfg.KEY.CARROT;

            // STAT settings
            document.getElementById('stat-energy-threshold').value = cfg.STAT.ENERGY_THRESHOLD;
            document.getElementById('stat-hunger-threshold').value = cfg.STAT.HUNGER_THRESHOLD;
            document.getElementById('stat-comfort-threshold').value = cfg.STAT.COMFORT_THRESHOLD;
            document.getElementById('stat-tea-delay').value = cfg.STAT.TEA_DELAY;
            document.getElementById('stat-coffee-limit').value = cfg.STAT.COFFEE_LIMIT;
            document.getElementById('stat-coffee-per-drink').value = cfg.STAT.COFFEE_PER_DRINK;
            document.getElementById('stat-alcohol-delay').value = cfg.STAT.ALCOHOL_DELAY;

            // FRICTION_BRAKE settings
            document.getElementById('fb-initial').value = cfg.FRICTION_BRAKE.INITIAL;
            document.getElementById('fb-max').value = cfg.FRICTION_BRAKE.MAX;
            document.getElementById('fb-start-delay').value = cfg.FRICTION_BRAKE.START_DELAY;
            document.getElementById('fb-increase-delay').value = cfg.FRICTION_BRAKE.INCREASE_DELAY;
            document.getElementById('fb-sensitivity').value = cfg.FRICTION_BRAKE.SENSITIVITY;

            // KEEPNET settings
            document.getElementById('keepnet-capacity').value = cfg.KEEPNET.CAPACITY;
            document.getElementById('keepnet-full-action').value = cfg.KEEPNET.FULL_ACTION;
            document.getElementById('keepnet-whitelist').value = cfg.KEEPNET.WHITELIST.join(',');
            document.getElementById('keepnet-blacklist').value = cfg.KEEPNET.BLACKLIST.join(',');
            document.getElementById('keepnet-tags').value = cfg.KEEPNET.TAGS.join(',');

            // NOTIFICATION settings
            document.getElementById('notification-email').value = cfg.NOTIFICATION.EMAIL;
            document.getElementById('notification-password').value = cfg.NOTIFICATION.PASSWORD;
            document.getElementById('notification-smtp-server').value = cfg.NOTIFICATION.SMTP_SERVER;
            document.getElementById('notification-miaotixing-code').value = cfg.NOTIFICATION.MIAO_CODE;
            document.getElementById('notification-discord-webhook-url').value = cfg.NOTIFICATION.DISCORD_WEBHOOK_URL;

            // PAUSE settings
            document.getElementById('pause-delay').value = cfg.PAUSE.DELAY;
            document.getElementById('pause-duration').value = cfg.PAUSE.DURATION;
        }

        // Function to update the currentConfig from UI form fields
        function updateConfigFromUI() {
            // SCRIPT
            currentConfig.SCRIPT.LANGUAGE = document.getElementById('script-language').value;
            currentConfig.SCRIPT.SMTP_VERIFICATION = document.getElementById('script-smtp-verification').checked;
            currentConfig.SCRIPT.IMAGE_VERIFICATION = document.getElementById('script-image-verification').checked;
            currentConfig.SCRIPT.SNAG_DETECTION = document.getElementById('script-snag-detection').checked;
            currentConfig.SCRIPT.SPOOLING_DETECTION = document.getElementById('script-spooling-detection').checked;
            currentConfig.SCRIPT.RANDOM_ROD_SELECTION = document.getElementById('script-random-rod-selection').checked;
            currentConfig.SCRIPT.SPOOL_CONFIDENCE = parseFloat(document.getElementById('script-spool-confidence').value);
            currentConfig.SCRIPT.LURE_CHANGE_DELAY = parseInt(document.getElementById('script-lure-change-delay').value);
            currentConfig.SCRIPT.RANDOM_CAST_PROBABILITY = parseFloat(document.getElementById('script-random-cast-probability').value);

            // KEY
            currentConfig.KEY.QUIT = document.getElementById('key-quit').value;
            currentConfig.KEY.MAIN_ROD = parseKey(document.getElementById('key-main-rod').value);
            currentConfig.KEY.BOTTOM_RODS = document.getElementById('key-bottom-rods').value.split(',').map(s => parseKey(s.trim())).filter(n => n !== null);
            currentConfig.KEY.COFFEE = parseKey(document.getElementById('key-coffee').value);
            currentConfig.KEY.DIGGING_TOOL = parseKey(document.getElementById('key-digging-tool').value);
            currentConfig.KEY.ALCOHOL = parseKey(document.getElementById('key-alcohol').value);
            currentConfig.KEY.SPOD_ROD = parseKey(document.getElementById('key-spod-rod').value);
            currentConfig.KEY.TEA = parseKey(document.getElementById('key-tea').value);
            currentConfig.KEY.CARROT = parseKey(document.getElementById('key-carrot').value);

            // STAT
            currentConfig.STAT.ENERGY_THRESHOLD = parseFloat(document.getElementById('stat-energy-threshold').value);
            currentConfig.STAT.HUNGER_THRESHOLD = parseFloat(document.getElementById('stat-hunger-threshold').value);
            currentConfig.STAT.COMFORT_THRESHOLD = parseFloat(document.getElementById('stat-comfort-threshold').value);
            currentConfig.STAT.TEA_DELAY = parseInt(document.getElementById('stat-tea-delay').value);
            currentConfig.STAT.COFFEE_LIMIT = parseInt(document.getElementById('stat-coffee-limit').value);
            currentConfig.STAT.COFFEE_PER_DRINK = parseInt(document.getElementById('stat-coffee-per-drink').value);
            currentConfig.STAT.ALCOHOL_DELAY = parseInt(document.getElementById('stat-alcohol-delay').value);

            // FRICTION_BRAKE
            currentConfig.FRICTION_BRAKE.INITIAL = parseInt(document.getElementById('fb-initial').value);
            currentConfig.FRICTION_BRAKE.MAX = parseInt(document.getElementById('fb-max').value);
            currentConfig.FRICTION_BRAKE.START_DELAY = parseFloat(document.getElementById('fb-start-delay').value);
            currentConfig.FRICTION_BRAKE.INCREASE_DELAY = parseFloat(document.getElementById('fb-increase-delay').value);
            currentConfig.FRICTION_BRAKE.SENSITIVITY = document.getElementById('fb-sensitivity').value;

            // KEEPNET
            currentConfig.KEEPNET.CAPACITY = parseInt(document.getElementById('keepnet-capacity').value);
            currentConfig.KEEPNET.FULL_ACTION = document.getElementById('keepnet-full-action').value;
            currentConfig.KEEPNET.WHITELIST = document.getElementById('keepnet-whitelist').value.split(',').map(s => s.trim()).filter(s => s !== '');
            currentConfig.KEEPNET.BLACKLIST = document.getElementById('keepnet-blacklist').value.split(',').map(s => s.trim()).filter(s => s !== '');
            currentConfig.KEEPNET.TAGS = document.getElementById('keepnet-tags').value.split(',').map(s => s.trim()).filter(s => s !== '');

            // NOTIFICATION
            currentConfig.NOTIFICATION.EMAIL = document.getElementById('notification-email').value;
            currentConfig.NOTIFICATION.PASSWORD = document.getElementById('notification-password').value;
            currentConfig.NOTIFICATION.SMTP_SERVER = document.getElementById('notification-smtp-server').value;
            currentConfig.NOTIFICATION.MIAO_CODE = document.getElementById('notification-miaotixing-code').value;
            currentConfig.NOTIFICATION.DISCORD_WEBHOOK_URL = document.getElementById('notification-discord-webhook-url').value;

            // PAUSE
            currentConfig.PAUSE.DELAY = parseInt(document.getElementById('pause-delay').value);
            currentConfig.PAUSE.DURATION = parseInt(document.getElementById('pause-duration').value);

            // Tools (future, if specific UI elements are added)
            // For now, only 'move' has a simple checkbox
            // This is conceptual, currently the main config handles global settings
            // For example, if a tool needed a specific param
            // currentConfig.TOOLS.MOVE_FORWARD.SPRINT = document.getElementById('tool-move-sprint').checked;
        }

        // Helper to parse key values (could be number or string like 'CTRL-C')
        function parseKey(value) {
            const num = parseInt(value);
            return isNaN(num) ? value : num;
        }

        // Convert JS object to YAML string
        function toYAML(obj, indent = '') {
            let yamlString = '';
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const value = obj[key];
                    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                        yamlString += `${indent}${key}:\n${toYAML(value, indent + '  ')}`;
                    } else if (Array.isArray(value)) {
                        yamlString += `${indent}${key}: [${value.map(item => typeof item === 'string' && item.includes(' ') ? `'${item}'` : item).join(', ')}]\n`;
                    } else if (typeof value === 'string' && value.includes(' ')) {
                        yamlString += `${indent}${key}: '${value}'\n`; // Quote strings with spaces
                    } else {
                        yamlString += `${indent}${key}: ${value}\n`;
                    }
                }
            }
            return yamlString;
        }


        function downloadConfig() {
            updateConfigFromUI(); // Ensure current config is up-to-date
            const yamlContent = toYAML(currentConfig);
            const blob = new Blob([yamlContent], { type: 'text/yaml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'config.yaml';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // --- Profile Management ---
        function renderProfiles() {
            const profileListDiv = document.getElementById('profile-list');
            profileListDiv.innerHTML = ''; // Clear existing profiles

            for (const profileName in currentConfig.PROFILE) {
                if (currentConfig.PROFILE.hasOwnProperty(profileName)) {
                    const profile = currentConfig.PROFILE[profileName];
                    const profileCard = createProfileCard(profileName, profile);
                    profileListDiv.appendChild(profileCard);
                }
            }
        }

        function createProfileCard(profileName, profileData) {
            const card = document.createElement('div');
            card.className = 'profile-card';
            card.setAttribute('data-profile-name', profileName);

            let formHtml = `
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl text-blue-300">${profileName}</h3>
                    <button class="button profile-remove-btn" onclick="removeProfile('${profileName}')">Remove</button>
                </div>
                <div class="form-group">
                    <label>Profile Name:</label>
                    <input type="text" value="${profileName}" onchange="renameProfile(this, '${profileName}')">
                </div>
                <div class="form-group">
                    <label>Mode:</label>
                    <select onchange="updateProfileMode(this, '${profileName}')">
                        ${Object.keys(baseProfileTemplates).map(mode => `<option value="${mode}" ${profileData.MODE === mode ? 'selected' : ''}>${mode.toUpperCase()}</option>`).join('')}
                    </select>
                </div>
            `;

            // Dynamically add fields based on the profileData
            for (const key in profileData) {
                if (profileData.hasOwnProperty(key) && key !== 'MODE' && key !== 'LAUNCH_OPTIONS') { // LAUNCH_OPTIONS not exposed for simplicity
                    const value = profileData[key];
                    let inputType = 'text';
                    if (typeof value === 'number') inputType = 'number';
                    if (typeof value === 'boolean') inputType = 'checkbox';

                    formHtml += `
                        <div class="form-group">
                            <label>${key.replace(/_/g, ' ')}:</label>
                            ${inputType === 'checkbox' ?
                                `<input type="checkbox" id="profile-${profileName}-${key}" ${value ? 'checked' : ''} onchange="updateProfileSetting('${profileName}', '${key}', this.checked)">` :
                                `<input type="${inputType}" id="profile-${profileName}-${key}" value="${value}" step="${inputType === 'number' && String(value).includes('.') ? '0.01' : '1'}" onchange="updateProfileSetting('${profileName}', '${key}', this.value)">`
                            }
                        </div>
                    `;
                }
            }

            card.innerHTML = formHtml;
            return card;
        }

        function updateProfileSetting(profileName, key, value) {
            let parsedValue = value;
            // Attempt to parse numbers/booleans correctly
            if (typeof currentConfig.PROFILE[profileName][key] === 'number') {
                parsedValue = parseFloat(value);
                if (isNaN(parsedValue)) parsedValue = 0; // Default to 0 if invalid number
            } else if (typeof currentConfig.PROFILE[profileName][key] === 'boolean') {
                parsedValue = (value === true || value === 'true'); // Handle checkbox boolean or string "true"/"false"
            }
            currentConfig.PROFILE[profileName][key] = parsedValue;
            console.log(`Updated ${profileName}.${key} to ${parsedValue}`);
        }

        function renameProfile(inputElement, oldName) {
            const newName = inputElement.value.trim();
            if (newName && newName !== oldName && !currentConfig.PROFILE[newName]) {
                const updatedProfile = { ...currentConfig.PROFILE[oldName] };
                delete currentConfig.PROFILE[oldName];
                currentConfig.PROFILE[newName] = updatedProfile;
                renderProfiles(); // Re-render to update names and event listeners
            } else {
                inputElement.value = oldName; // Revert if invalid or duplicate
                alert('Invalid new profile name or name already exists!');
            }
        }

        function updateProfileMode(selectElement, profileName) {
            const newMode = selectElement.value;
            const currentProfile = currentConfig.PROFILE[profileName];
            if (currentProfile) {
                // Get the base template for the new mode
                const newBaseSettings = JSON.parse(JSON.stringify(baseProfileTemplates[newMode])); // Deep copy

                // Keep existing name and LAUNCH_OPTIONS if they exist
                newBaseSettings.LAUNCH_OPTIONS = currentProfile.LAUNCH_OPTIONS || "";
                newBaseSettings.MODE = newMode; // Ensure mode is correctly set

                currentConfig.PROFILE[profileName] = newBaseSettings;
                renderProfiles(); // Re-render this specific card or all cards
            }
        }

        function addNewProfile() {
            let newProfileName = prompt("Enter a name for the new profile:");
            if (newProfileName) {
                newProfileName = newProfileName.trim();
                if (currentConfig.PROFILE[newProfileName]) {
                    alert('Profile name already exists!');
                    return;
                }
                const defaultMode = "spin"; // Or a prompt for mode
                currentConfig.PROFILE[newProfileName] = JSON.parse(JSON.stringify(baseProfileTemplates[defaultMode]));
                currentConfig.PROFILE[newProfileName].MODE = defaultMode;
                renderProfiles();
            }
        }

        function removeProfile(profileName) {
            if (confirm(`Are you sure you want to remove profile "${profileName}"?`)) {
                delete currentConfig.PROFILE[profileName];
                renderProfiles();
            }
        }

    </script>
</body>
</html>


# This is a CONCEPTUAL Python Flask backend.
# It serves as an example of how a web UI *could* communicate with a Python component
# to manage the config.yaml.
#
# IMPORTANT: This Flask app DOES NOT run the game automation logic itself.
# The actual RF4S game automation (using PyAutoGUI, pynput, OpenCV) must still
# be run locally on the user's machine using the 'tools/main.py' script.
#
# This server would primarily be for:
# 1. Serving/retrieving configuration to/from the UI.
# 2. Saving the configuration to a file (e.g., config.yaml) which the LOCAL RF4S script can then read.

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS # Required for cross-origin requests from the HTML frontend
import yaml
import os

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

CONFIG_FILE = 'config.yaml' # The file this server will read/write
DEFAULT_CONFIG_PATH = 'default_config.yaml' # A default config if CONFIG_FILE doesn't exist

# --- Helper to create a dummy default config if none exists ---
def create_default_config_if_missing():
    if not os.path.exists(CONFIG_FILE):
        print(f"'{CONFIG_FILE}' not found. Creating a default one.")
        # This structure should match your currentConfig in JavaScript
        # For brevity, this is a very minimal example.
        # In a real scenario, you'd load from rf4s/config/defaults.py or a more complete YAML.
        default_data = {
            "VERSION": "0.5.2",
            "SCRIPT": {
                "LANGUAGE": "en",
                "SMTP_VERIFICATION": True,
                "IMAGE_VERIFICATION": True,
                "SNAG_DETECTION": True,
                "SPOOLING_DETECTION": True,
                "RANDOM_ROD_SELECTION": True,
                "SPOOL_CONFIDENCE": 0.98,
                "SPOD_ROD_RECAST_DELAY": 1800,
                "LURE_CHANGE_DELAY": 1800,
                "ALARM_SOUND": "./static/sound/guitar.wav",
                "RANDOM_CAST_PROBABILITY": 0.25,
                "SCREENSHOT_TAGS": ["green", "yellow", "blue", "purple", "pink"]
            },
            "KEY": {
                "TEA": -1, "CARROT": -1, "BOTTOM_RODS": [1, 2, 3], "COFFEE": 4,
                "DIGGING_TOOL": 5, "ALCOHOL": 6, "MAIN_ROD": 1, "SPOD_ROD": 7, "QUIT": "CTRL-C"
            },
            "STAT": {
                "ENERGY_THRESHOLD": 0.74, "HUNGER_THRESHOLD": 0.5, "COMFORT_THRESHOLD": 0.51,
                "TEA_DELAY": 300, "COFFEE_LIMIT": 10, "COFFEE_PER_DRINK": 1, "ALCOHOL_DELAY": 900, "ALCOHOL_PER_DRINK": 1
            },
            "FRICTION_BRAKE": {
                "INITIAL": 29, "MAX": 30, "START_DELAY": 2.0, "INCREASE_DELAY": 1.0, "SENSITIVITY": "medium"
            },
            "KEEPNET": {
                "CAPACITY": 100, "FISH_DELAY": 0.0, "GIFT_DELAY": 4.0, "FULL_ACTION": "quit",
                "WHITELIST": ["mackerel", "saithe", "herring", "squid", "scallop", "mussel"], "BLACKLIST": [],
                "TAGS": ["green", "yellow", "blue", "purple", "pink"]
            },
            "NOTIFICATION": {
                "EMAIL": "email@example.com", "PASSWORD": "password", "SMTP_SERVER": "smtp.gmail.com",
                "MIAO_CODE": "example", "DISCORD_WEBHOOK_URL": ""
            },
            "PAUSE": {
                "DELAY": 1800, "DURATION": 600
            },
            "PROFILE": {
                "SPIN": {
                    "MODE": "spin", "LAUNCH_OPTIONS": "", "CAST_POWER_LEVEL": 5.0, "CAST_DELAY": 6.0,
                    "TIGHTEN_DURATION": 0.0, "RETRIEVAL_DURATION": 0.0, "RETRIEVAL_DELAY": 0.0,
                    "RETRIEVAL_TIMEOUT": 256.0, "PRE_ACCELERATION": False, "POST_ACCELERATION": "off", "TYPE": "normal"
                },
                "BOTTOM": {
                    "MODE": "bottom", "LAUNCH_OPTIONS": "", "CAST_POWER_LEVEL": 5.0, "CAST_DELAY": 4.0,
                    "POST_ACCELERATION": "off", "CHECK_DELAY": 32.0, "CHECK_MISS_LIMIT": 16, "PUT_DOWN_DELAY": 0.0
                }
                # ... add other profiles as needed
            }
        }
        with open(CONFIG_FILE, 'w') as f:
            yaml.dump(default_data, f, sort_keys=False)


@app.route('/config', methods=['GET'])
def get_config():
    """Serves the current config.yaml content."""
    create_default_config_if_missing() # Ensure a config file exists
    try:
        with open(CONFIG_FILE, 'r') as f:
            config_data = yaml.safe_load(f)
        return jsonify(config_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/config', methods=['POST'])
def update_config():
    """Receives updated config data from the UI and saves it to config.yaml."""
    try:
        new_config_data = request.json
        with open(CONFIG_FILE, 'w') as f:
            yaml.dump(new_config_data, f, sort_keys=False) # sort_keys=False to preserve order
        return jsonify({"message": "Config updated successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Optional: Serve the HTML file directly from Flask if you want to bundle them
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')


if __name__ == '__main__':
    # Ensure pyyaml is installed: pip install pyyaml flask flask-cors
    create_default_config_if_missing()
    print(f"Flask server running. Config will be saved to '{os.path.abspath(CONFIG_FILE)}'.")
    print("Remember to place this 'config.yaml' in your RF4S Python script's root directory.")
    app.run(debug=True) # Run in debug mode for development
