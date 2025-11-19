#!/usr/bin/env python3
"""
Startup script for the News Aggregator backend.
This script ensures all dependencies are installed and starts the FastAPI server.
"""

import subprocess
import sys
import os
from pathlib import Path

def check_python_version():
    """Check if Python version is 3.8 or higher."""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required.")
        print(f"Current version: {sys.version}")
        sys.exit(1)
    print(f"✅ Python version: {sys.version.split()[0]}")

def install_requirements():
    """Install Python requirements."""
    backend_dir = Path(__file__).parent / "backend"
    requirements_file = backend_dir / "requirements.txt"
    
    if not requirements_file.exists():
        print("❌ requirements.txt not found in backend directory")
        sys.exit(1)
    
    print("📦 Installing Python dependencies...")
    try:
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", str(requirements_file)
        ], check=True, cwd=backend_dir)
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        sys.exit(1)

def start_server():
    """Start the FastAPI server."""
    backend_dir = Path(__file__).parent / "backend"
    main_file = backend_dir / "main.py"
    
    if not main_file.exists():
        print("❌ main.py not found in backend directory")
        sys.exit(1)
    
    print("🚀 Starting FastAPI server...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📚 API documentation: http://localhost:8000/docs")
    print("🛑 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        subprocess.run([
            sys.executable, str(main_file)
        ], cwd=backend_dir)
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

def main():
    """Main function to start the backend."""
    print("🎯 News Aggregator Backend Startup")
    print("=" * 40)
    
    check_python_version()
    install_requirements()
    start_server()

if __name__ == "__main__":
    main()
