
"""
Dependency installer for RF4S Overlay
Run this script to install all required packages
"""

import subprocess
import sys
import pkg_resources
from pathlib import Path


def install_package(package):
    """Install a package using pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✓ Successfully installed {package}")
        return True
    except subprocess.CalledProcessError:
        print(f"✗ Failed to install {package}")
        return False


def check_package(package_name):
    """Check if a package is already installed"""
    try:
        pkg_resources.get_distribution(package_name)
        return True
    except pkg_resources.DistributionNotFound:
        return False


def main():
    """Main installation function"""
    print("RF4S Overlay - Dependency Installer")
    print("=" * 40)
    
    # Required packages
    packages = [
        "PySide6>=6.6.0",
        "PyQt-Fluent-Widgets>=1.5.0", 
        "qtawesome>=1.3.0",
        "pywin32>=306",
        "psutil>=5.9.0",
        "GPUtil>=1.4.0",
        "keyboard>=0.13.5"
    ]
    
    print(f"Installing {len(packages)} packages...\n")
    
    success_count = 0
    for package in packages:
        package_name = package.split(">=")[0]
        
        if check_package(package_name):
            print(f"✓ {package_name} is already installed")
            success_count += 1
        else:
            print(f"Installing {package}...")
            if install_package(package):
                success_count += 1
        print()
    
    print("=" * 40)
    print(f"Installation complete: {success_count}/{len(packages)} packages installed")
    
    if success_count == len(packages):
        print("✓ All dependencies installed successfully!")
        print("\nYou can now run the overlay with:")
        print("python rf4s_overlay.py")
    else:
        print("✗ Some packages failed to install. Please check the errors above.")
        print("You may need to run this script as administrator.")
    
    print("\nPress Enter to exit...")
    input()


if __name__ == "__main__":
    main()
