#!/usr/bin/env python3
"""
Setup script for Live News API integration
This script helps you configure NewsAPI for real-time news fetching.
"""

import os
import sys
from pathlib import Path

def setup_live_news():
    """Setup NewsAPI for live news fetching."""
    print("🚀 Live News API Setup")
    print("=" * 30)
    
    # Check if we're in the right directory
    if not Path("backend").exists():
        print("❌ Please run this from the project root directory")
        return False
    
    # Check if .env file exists
    env_file = Path("backend/.env")
    
    print("📝 Step 1: Get NewsAPI Key")
    print("-" * 20)
    print("1. Go to https://newsapi.org/")
    print("2. Click 'Get API Key'")
    print("3. Sign up for a free account")
    print("4. Copy your API key")
    
    api_key = input("\n🔑 Enter your NewsAPI key (or press Enter to skip): ").strip()
    
    if not api_key:
        print("⏭️ Skipping NewsAPI setup. The app will use dummy data.")
        print("💡 You can set it up later by creating backend/.env with NEWSAPI_KEY=your_key")
        return False
    
    # Create .env file
    env_content = f"""# NewsAPI configuration for live news
NEWSAPI_KEY={api_key}

# Database configuration
DATABASE_URL=sqlite:///news_aggregator.db
"""
    
    try:
        with open(env_file, 'w') as f:
            f.write(env_content)
        print(f"✅ NewsAPI key saved to {env_file}")
        
        print("\n📦 Step 2: Install Dependencies")
        print("-" * 30)
        print("Run these commands:")
        print("cd backend")
        print("pip install -r requirements.txt")
        
        print("\n🚀 Step 3: Start the Backend")
        print("-" * 30)
        print("Run this command:")
        print("uvicorn main:app --reload")
        
        print("\n🎉 Setup Complete!")
        print("Your news aggregator will now fetch live news from NewsAPI.org")
        print("Visit http://localhost:8000/docs to test the API")
        
        return True
        
    except Exception as e:
        print(f"❌ Error saving .env file: {e}")
        print(f"💡 Manually create {env_file} with:")
        print(f"NEWSAPI_KEY={api_key}")
        return False

if __name__ == "__main__":
    setup_live_news()

