
@echo off
echo Starting RF4S Overlay...
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Check if rf4s_overlay.py exists
if not exist "rf4s_overlay.py" (
    echo Error: rf4s_overlay.py not found
    echo Please make sure you're running this from the correct directory
    pause
    exit /b 1
)

REM Run the overlay
echo Starting RF4S Overlay...
python rf4s_overlay.py

REM If the overlay exits, pause to show any error messages
if errorlevel 1 (
    echo.
    echo RF4S Overlay exited with an error
    pause
)
