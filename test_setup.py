#!/usr/bin/env python3
"""
Test script to verify NewsAPI setup
"""

import os
import sys
from pathlib import Path

def test_newsapi_setup():
    """Test if NewsAPI is properly configured."""
    print("🔧 Testing NewsAPI Setup")
    print("=" * 30)
    
    # Check if we're in the right directory
    if not Path("backend").exists():
        print("❌ Please run this from the project root directory")
        return False
    
    # Check .env file
    env_file = Path("backend/.env")
    if not env_file.exists():
        print("❌ No .env file found in backend directory")
        print("💡 Create it with: echo NEWSAPI_KEY=your_key > backend\\.env")
        return False
    
    # Check if NEWSAPI_KEY is in .env
    with open(env_file, 'r') as f:
        content = f.read()
        if 'NEWSAPI_KEY' not in content:
            print("❌ NEWSAPI_KEY not found in .env file")
            return False
    
    print("✅ .env file exists")
    
    # Test loading the key
    os.chdir("backend")
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv('NEWSAPI_KEY')
    if not api_key:
        print("❌ NEWSAPI_KEY not loaded from .env file")
        return False
    
    print(f"✅ NEWSAPI_KEY loaded: {api_key[:8]}...")
    
    # Test API connection
    try:
        import requests
        response = requests.get(
            "https://newsapi.org/v2/top-headlines",
            params={'country': 'us', 'apiKey': api_key},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'ok':
                print(f"✅ NewsAPI working! Found {len(data.get('articles', []))} articles")
                return True
            else:
                print(f"❌ NewsAPI error: {data.get('message')}")
                return False
        else:
            print(f"❌ HTTP error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

if __name__ == "__main__":
    success = test_newsapi_setup()
    if success:
        print("\n🎉 Everything is working! Your trending news should now show live data.")
    else:
        print("\n🔧 Please fix the issues above and try again.")
