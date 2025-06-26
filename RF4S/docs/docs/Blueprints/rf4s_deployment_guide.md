# RF4S Deployment and Distribution Guide

## Overview

This guide covers the complete deployment process for the Russian Fishing 4 Script (RF4S), including development setup, testing, compilation, packaging, and distribution strategies.

## Development Environment Setup

### Prerequisites

#### System Requirements

**Minimum Requirements:**
- Operating System: Windows 10/11, macOS 10.14+, Ubuntu 18.04+
- Python: 3.12 or higher
- RAM: 4GB minimum, 8GB recommended
- Storage: 2GB free space
- Display: 1280x720 minimum resolution

**Recommended Requirements:**
- RAM: 16GB for development
- Storage: 10GB free space for development environment
- Display: 1920x1080 or higher
- Multi-core CPU for faster compilation

#### External Dependencies

**Tesseract-OCR Installation:**

```bash
# Windows (using Chocolatey)
choco install tesseract

# Windows (manual installation)
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
# Add to PATH: C:\Program Files\Tesseract-OCR

# macOS
brew install tesseract

# Ubuntu/Debian
sudo apt update
sudo apt install tesseract-ocr tesseract-ocr-eng

# Add additional language packs
sudo apt install tesseract-ocr-rus tesseract-ocr-deu
```

**System Dependencies:**

```bash
# Windows
# Visual Studio Build Tools or Visual Studio Community
# Windows SDK

# macOS
xcode-select --install

# Ubuntu/Debian
sudo apt install build-essential python3-dev
sudo apt install libxcb1-dev libxrandr-dev libxss1 libgconf-2-4
```

### Development Setup

#### 1. Repository Setup

```bash
# Clone repository
git clone https://github.com/your-org/RF4S.git
cd RF4S

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

# Upgrade pip
python -m pip install --upgrade pip
```

#### 2. Dependencies Installation

```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Install runtime dependencies
pip install -r requirements.txt

# Install package in development mode
pip install -e .
```

#### 3. Configuration Setup

```bash
# Copy example configuration
cp rf4s/config/config.example.yaml rf4s/config/config.yaml

# Edit configuration for development
# Set debug flags, test paths, etc.
```

#### 4. Verify Installation

```bash
# Run basic tests
pytest tests/unit/ -v

# Test CLI
python tools/main.py --help

# Validate configuration
python -c "from rf4s.config.config import setup_cfg; print('Config OK')"

# Test detection system
python tests/validators/system_validator.py
```

## Testing Framework

### Test Categories

#### 1. Unit Tests

```bash
# Run all unit tests
pytest tests/unit/ -v --cov=rf4s --cov-report=html

# Run specific component tests
pytest tests/unit/test_detection.py -v
pytest tests/unit/test_player.py -v
pytest tests/unit/test_config.py -v

# Run with coverage
pytest tests/unit/ --cov=rf4s --cov-report=term-missing
```

#### 2. Integration Tests

```bash
# Run integration tests
pytest tests/integration/ -v

# Test fishing workflow
pytest tests/integration/test_fishing_workflow.py -v

# Test tool applications
pytest tests/integration/test_tool_applications.py -v
```

#### 3. Performance Tests

```bash
# Run performance benchmarks
pytest tests/performance/ -v

# Memory usage tests
pytest tests/performance/test_memory_usage.py -v

# Detection speed tests
pytest tests/performance/test_detection_speed.py -v
```

#### 4. System Validation

```bash
# Validate system requirements
python tests/validators/system_validator.py

# Validate configuration
python tests/validators/config_validator.py

# Validate image templates
python tests/validators/template_validator.py
```

### Continuous Integration

#### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        python-version: [3.12]

    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python ${{ matrix.python-version }}
      uses: actions/setup-python@v4
      with:
        python-version: ${{ matrix.python-version }}
    
    - name: Install system dependencies (Ubuntu)
      if: matrix.os == 'ubuntu-latest'
      run: |
        sudo apt update
        sudo apt install tesseract-ocr tesseract-ocr-eng
        sudo apt install xvfb  # For headless testing
    
    - name: Install system dependencies (macOS)
      if: matrix.os == 'macos-latest'
      run: |
        brew install tesseract
    
    - name: Install system dependencies (Windows)
      if: matrix.os == 'windows-latest'
      run: |
        choco install tesseract
    
    - name: Install Python dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements-dev.txt
        pip install -e .
    
    - name: Lint with flake8
      run: |
        flake8 rf4s tests --count --select=E9,F63,F7,F82 --show-source --statistics
        flake8 rf4s tests --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics
    
    - name: Type check with mypy
      run: |
        mypy rf4s
    
    - name: Test with pytest
      run: |
        pytest tests/unit/ -v --cov=rf4s --cov-report=xml
    
    - name: Integration tests (Ubuntu only)
      if: matrix.os == 'ubuntu-latest'
      run: |
        xvfb-run -a pytest tests/integration/ -v
    
    - name: Upload coverage to Codecov
      if: matrix.os == 'ubuntu-latest'
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml

  build:
    needs: test
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]

    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python 3.12
      uses: actions/setup-python@v4
      with:
        python-version: 3.12
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install pyinstaller
    
    - name: Build executable
      run: |
        pyinstaller --clean --noconfirm build/rf4s.spec
    
    - name: Upload artifacts
      uses: actions/upload-artifact@v3
      with:
        name: rf4s-${{ matrix.os }}
        path: dist/
```

## Compilation and Packaging

### PyInstaller Configuration

#### Build Specification

```python
# build/rf4s.spec
import os
from pathlib import Path

# Configuration
project_root = Path('.').absolute()
static_dir = project_root / 'static'
config_dir = project_root / 'rf4s' / 'config'

block_cipher = None

# Data files to include
datas = [
    (str(static_dir), 'static'),
    (str(config_dir / 'config.yaml'), 'rf4s/config'),
    (str(config_dir / 'defaults.py'), 'rf4s/config')
]

# Hidden imports
hiddenimports = [
    'PIL._tkinter_finder',
    'pkg_resources.extern',
    'cv2',
    'numpy',
    'pytesseract',
    'mss',
    'pygetwindow',
    'pynput',
    'yacs',
    'rich'
]

# Platform-specific hidden imports
import platform
if platform.system() == 'Windows':
    hiddenimports.extend([
        'win32gui',
        'win32con',
        'win32api',
        'win32process'
    ])
elif platform.system() == 'Darwin':
    hiddenimports.extend([
        'AppKit',
        'Quartz'
    ])
elif platform.system() == 'Linux':
    hiddenimports.extend([
        'Xlib',
        'Xlib.display'
    ])

a = Analysis(
    ['tools/main.py'],
    pathex=[str(project_root)],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='rf4s',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='static/icon.ico'  # Optional icon
)
```

#### Build Scripts

```bash
# build/build.sh (Linux/macOS)
#!/bin/bash
set -e

echo "Building RF4S executable..."

# Clean previous builds
rm -rf build dist

# Install build dependencies
pip install pyinstaller

# Build executable
pyinstaller --clean --noconfirm build/rf4s.spec

# Verify build
if [ -f "dist/rf4s" ]; then
    echo "Build successful: dist/rf4s"
    
    # Test executable
    ./dist/rf4s --help
    
    echo "Build verification complete"
else
    echo "Build failed: executable not found"
    exit 1
fi
```

```batch
REM build/build.bat (Windows)
@echo off
echo Building RF4S executable...

REM Clean previous builds
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist

REM Install build dependencies
pip install pyinstaller

REM Build executable
pyinstaller --clean --noconfirm build/rf4s.spec

REM Verify build
if exist "dist/rf4s.exe" (
    echo Build successful: dist/rf4s.exe
    
    REM Test executable
    dist\rf4s.exe --help
    
    echo Build verification complete
) else (
    echo Build failed: executable not found
    exit /b 1
)
```

### Advanced Compilation Options

#### Optimized Build

```python
# build/rf4s-optimized.spec
# Same as rf4s.spec but with optimizations

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='rf4s',
    debug=False,
    bootloader_ignore_signals=False,
    strip=True,        # Strip debug symbols
    upx=True,          # Compress with UPX
    upx_exclude=[
        'vcruntime140.dll',  # Exclude from UPX compression
        'python312.dll'
    ],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    optimize=2         # Python optimization level
)
```

#### Directory Distribution

```python
# build/rf4s-dir.spec
# Creates directory distribution instead of single file

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='rf4s',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='rf4s'
)
```

## Distribution Strategies

### Release Packaging

#### 1. GitHub Releases

```bash
# scripts/create-release.sh
#!/bin/bash

VERSION=$1
if [ -z "$VERSION" ]; then
    echo "Usage: $0 <version>"
    exit 1
fi

echo "Creating release $VERSION..."

# Build for all platforms
for OS in ubuntu-latest windows-latest macos-latest; do
    echo "Building for $OS..."
    # Platform-specific build commands
done

# Create release directory
mkdir -p release/$VERSION

# Package executables
zip -r release/$VERSION/rf4s-windows-$VERSION.zip dist/windows/
tar -czf release/$VERSION/rf4s-linux-$VERSION.tar.gz dist/linux/
tar -czf release/$VERSION/rf4s-macos-$VERSION.tar.gz dist/macos/

# Create checksums
cd release/$VERSION
sha256sum * > checksums.txt

echo "Release $VERSION created in release/$VERSION/"
```

#### 2. Auto-updater Integration

```python
# rf4s/updater.py
import requests
import json
import zipfile
import shutil
from pathlib import Path
from packaging import version as pkg_version

class AutoUpdater:
    """Automatic update system for RF4S"""
    
    def __init__(self, current_version: str, update_url: str):
        self.current_version = current_version
        self.update_url = update_url
        self.update_available = False
        self.latest_version = None
    
    def check_for_updates(self) -> bool:
        """Check if updates are available"""
        try:
            response = requests.get(f"{self.update_url}/latest", timeout=10)
            response.raise_for_status()
            
            release_info = response.json()
            self.latest_version = release_info['tag_name'].lstrip('v')
            
            if pkg_version.parse(self.latest_version) > pkg_version.parse(self.current_version):
                self.update_available = True
                return True
            
            return False
        
        except Exception as e:
            logging.error(f"Update check failed: {e}")
            return False
    
    def download_update(self, download_path: Path) -> bool:
        """Download the latest update"""
        try:
            if not self.update_available:
                return False
            
            # Determine platform-specific download URL
            download_url = self._get_platform_download_url()
            
            response = requests.get(download_url, timeout=300)
            response.raise_for_status()
            
            with open(download_path, 'wb') as f:
                f.write(response.content)
            
            return True
        
        except Exception as e:
            logging.error(f"Update download failed: {e}")
            return False
    
    def install_update(self, update_path: Path) -> bool:
        """Install the downloaded update"""
        try:
            # Create backup of current installation
            backup_path = Path("rf4s_backup")
            if backup_path.exists():
                shutil.rmtree(backup_path)
            
            current_path = Path(sys.executable).parent
            shutil.copytree(current_path, backup_path)
            
            # Extract update
            with zipfile.ZipFile(update_path, 'r') as zip_ref:
                zip_ref.extractall(current_path)
            
            return True
        
        except Exception as e:
            logging.error(f"Update installation failed: {e}")
            # Restore backup on failure
            self._restore_backup()
            return False
```

### Installation Packages

#### 1. Windows Installer (NSIS)

```nsis
; installer/windows/rf4s-installer.nsi
!define APP_NAME "Russian Fishing 4 Script"
!define APP_VERSION "1.0.0"
!define APP_PUBLISHER "RF4S Team"
!define APP_URL "https://github.com/your-org/RF4S"

Name "${APP_NAME}"
OutFile "RF4S-${APP_VERSION}-Setup.exe"
InstallDir "$PROGRAMFILES64\RF4S"
InstallDirRegKey HKLM "Software\RF4S" "InstallPath"

Page directory
Page instfiles

Section "Main Application"
    SetOutPath "$INSTDIR"
    
    ; Copy files
    File /r "dist\*"
    
    ; Create shortcuts
    CreateDirectory "$SMPROGRAMS\RF4S"
    CreateShortCut "$SMPROGRAMS\RF4S\RF4S.lnk" "$INSTDIR\rf4s.exe"
    CreateShortCut "$DESKTOP\RF4S.lnk" "$INSTDIR\rf4s.exe"
    
    ; Register uninstaller
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\RF4S" \
                     "DisplayName" "${APP_NAME}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\RF4S" \
                     "UninstallString" "$INSTDIR\uninstall.exe"
    WriteUninstaller "$INSTDIR\uninstall.exe"
SectionEnd

Section "Uninstall"
    Delete "$INSTDIR\*"
    RMDir "$INSTDIR"
    
    Delete "$SMPROGRAMS\RF4S\*"
    RMDir "$SMPROGRAMS\RF4S"
    Delete "$DESKTOP\RF4S.lnk"
    
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\RF4S"
SectionEnd
```

#### 2. macOS Package

```bash
# installer/macos/create-dmg.sh
#!/bin/bash

APP_NAME="RF4S"
VERSION="1.0.0"
DMG_NAME="${APP_NAME}-${VERSION}"

# Create temporary directory
mkdir -p tmp/${APP_NAME}

# Copy application
cp -R dist/${APP_NAME}.app tmp/${APP_NAME}/

# Create Applications symlink
ln -s /Applications tmp/${APP_NAME}/Applications

# Create DMG
hdiutil create -volname "${APP_NAME}" -srcfolder tmp/${APP_NAME} -ov -format UDZO ${DMG_NAME}.dmg

# Clean up
rm -rf tmp
```

#### 3. Linux Package (DEB)

```bash
# installer/linux/create-deb.sh
#!/bin/bash

APP_NAME="rf4s"
VERSION="1.0.0"
ARCH="amd64"

# Create package structure
mkdir -p package/DEBIAN
mkdir -p package/usr/bin
mkdir -p package/usr/share/${APP_NAME}
mkdir -p package/usr/share/applications

# Copy executable
cp dist/rf4s package/usr/bin/

# Copy resources
cp -r static package/usr/share/${APP_NAME}/

# Create desktop entry
cat > package/usr/share/applications/${APP_NAME}.desktop << EOF
[Desktop Entry]
Name=Russian Fishing 4 Script
Comment=Automation tool for Russian Fishing 4
Exec=/usr/bin/rf4s
Icon=${APP_NAME}
Terminal=true
Type=Application
Categories=Game;
EOF

# Create control file
cat > package/DEBIAN/control << EOF
Package: ${APP_NAME}
Version: ${VERSION}
Section: games
Priority: optional
Architecture: ${ARCH}
Depends: tesseract-ocr
Maintainer: RF4S Team <team@rf4s.org>
Description: Russian Fishing 4 Script
 Automation tool for Russian Fishing 4 game.
EOF

# Build package
dpkg-deb --build package ${APP_NAME}_${VERSION}_${ARCH}.deb
```

## Deployment Automation

### Docker Containerization

```dockerfile
# Dockerfile
FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-rus \
    tesseract-ocr-deu \
    libxcb1-dev \
    libxrandr-dev \
    libxss1 \
    libgconf-2-4 \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Install application
RUN pip install -e .

# Create non-root user
RUN useradd -m -u 1000 rf4s
USER rf4s

# Set entrypoint
ENTRYPOINT ["python", "tools/main.py"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  rf4s:
    build: .
    volumes:
      - ./config:/app/config
      - ./logs:/app/logs
      - /tmp/.X11-unix:/tmp/.X11-unix:rw
    environment:
      - DISPLAY=${DISPLAY}
    network_mode: host
    stdin_open: true
    tty: true
```

### Cloud Deployment

#### AWS Lambda Function

```python
# deployment/aws/lambda_function.py
import json
import boto3
from rf4s.player import Player
from rf4s.config.config import setup_cfg

def lambda_handler(event, context):
    """AWS Lambda handler for RF4S automation"""
    
    try:
        # Setup configuration
        cfg = setup_cfg()
        
        # Override with Lambda-specific settings
        cfg.SCRIPT.HEADLESS = True
        cfg.NOTIFICATION.ENABLED = True
        
        # Initialize player
        # Note: This would require headless operation
        player = Player(cfg, None)  # No window in Lambda
        
        # Execute fishing automation
        result = player.start_fishing()
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'status': 'success',
                'result': result
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'status': 'error',
                'message': str(e)
            })
        }
```

### Monitoring and Analytics

#### Application Metrics

```python
# rf4s/monitoring.py
import time
import logging
import psutil
import requests
from typing import Dict, Any

class MetricsCollector:
    """Collect and report application metrics"""
    
    def __init__(self, endpoint: str = None):
        self.endpoint = endpoint
        self.start_time = time.time()
        self.metrics = {}
    
    def record_metric(self, name: str, value: Any, tags: Dict[str, str] = None):
        """Record a metric value"""
        self.metrics[name] = {
            'value': value,
            'timestamp': time.time(),
            'tags': tags or {}
        }
    
    def get_system_metrics(self) -> Dict[str, float]:
        """Get current system metrics"""
        return {
            'cpu_percent': psutil.cpu_percent(),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_usage': psutil.disk_usage('/').percent,
            'uptime': time.time() - self.start_time
        }
    
    def send_metrics(self):
        """Send metrics to monitoring endpoint"""
        if not self.endpoint:
            return
        
        try:
            payload = {
                'application': 'rf4s',
                'timestamp': time.time(),
                'metrics': self.metrics,
                'system': self.get_system_metrics()
            }
            
            response = requests.post(self.endpoint, json=payload, timeout=10)
            response.raise_for_status()
            
        except Exception as e:
            logging.error(f"Failed to send metrics: {e}")

# Usage in Player class
class Player:
    def __init__(self, cfg, window):
        # ... existing initialization ...
        self.metrics = MetricsCollector(cfg.MONITORING.ENDPOINT)
    
    def start_fishing(self):
        """Enhanced fishing with metrics"""
        start_time = time.time()
        
        try:
            # ... existing fishing logic ...
            
            # Record metrics
            self.metrics.record_metric('fishing_session_duration', 
                                     time.time() - start_time)
            self.metrics.record_metric('fish_caught', self._fishes_caught_count)
            self.metrics.record_metric('casts_made', self._casts_made)
            
            # Send metrics
            self.metrics.send_metrics()
        
        except Exception as e:
            self.metrics.record_metric('errors', 1, {'error_type': type(e).__name__})
            raise
```

This comprehensive deployment guide provides all the necessary tools and processes for building, packaging, and distributing the RF4S application across multiple platforms with proper monitoring and update capabilities.