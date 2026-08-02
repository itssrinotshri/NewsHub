#!/usr/bin/env python3
"""
NewsAPI Setup Script for News Aggregator
This script helps you set up your NewsAPI key.
"""

import os
from pathlib import Path

def setup_newsapi():
    """Setup NewsAPI key for the news aggregator."""
    print("🔧 NewsAPI Setup for News Aggregator")
    print("=" * 40)
    
    # Check if .env file exists
    env_file = Path("backend/.env")
    
    if env_file.exists():
        print("📄 Found existing .env file")
        with open(env_file, 'r') as f:
            content = f.read()
            if 'NEWSAPI_KEY' in content:
                print("✅ NEWSAPI_KEY already exists in .env file")
                return
    
    print("\n📝 To get a NewsAPI key:")
    print("1. Go to https://newsapi.org/")
    print("2. Click 'Get API Key'")
    print("3. Sign up for a free account")
    print("4. Copy your API key")
    
    api_key = input("\n🔑 Enter your NewsAPI key (or press Enter to skip): ").strip()
    
    if not api_key:
        print("⏭️ Skipping NewsAPI setup. The app will use dummy data.")
        return
    
    # Create .env file
    env_content = f"# NewsAPI configuration\nNEWSAPI_KEY={api_key}\n"
    
    try:
        with open(env_file, 'w') as f:
            f.write(env_content)
        print(f"✅ NewsAPI key saved to {env_file}")
        print("🚀 Restart the backend to use live news data!")
    except Exception as e:
        print(f"❌ Error saving .env file: {e}")
        print(f"💡 Manually create {env_file} with: NEWSAPI_KEY={api_key}")

if __name__ == "__main__":
    setup_newsapi()

