# 🔧 Troubleshooting NewsAPI Integration

## Why NewsAPI Might Not Be Working

### 1. **No API Key Set**
**Problem:** You see "❌ No NewsAPI key found. Using dummy data."

**Solution:**
```bash
# Run the setup script
python setup_newsapi.py

# OR manually create .env file
echo "NEWSAPI_KEY=your_actual_api_key_here" > backend/.env
```

### 2. **Invalid API Key**
**Problem:** You see "❌ NewsAPI error: Invalid API key"

**Solution:**
1. Go to [NewsAPI.org](https://newsapi.org/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Update your `.env` file with the correct key

### 3. **API Key Not Loading**
**Problem:** Backend doesn't detect your API key

**Solution:**
1. Make sure `.env` file is in the `backend` directory
2. Restart the backend server after adding the key
3. Check the file format:
   ```
   NEWSAPI_KEY=your_key_here
   ```
   (No spaces around the = sign)

### 4. **Network/Connection Issues**
**Problem:** "Connection error" or timeout

**Solution:**
- Check your internet connection
- Try again in a few minutes
- NewsAPI has rate limits on free accounts

### 5. **API Quota Exceeded**
**Problem:** "API key has exceeded its quota"

**Solution:**
- Free NewsAPI accounts have daily limits
- Wait 24 hours or upgrade to a paid plan
- The app will fallback to dummy data

## 🧪 Testing Your Setup

### 1. **Check API Key Status**
Visit: `http://localhost:8000/`
Look for: `"newsapi_status": "enabled"`

### 2. **Test NewsAPI Connection**
Visit: `http://localhost:8000/test-newsapi`
Should show: `"status": "success"`

### 3. **Check Backend Logs**
Look for these messages in your terminal:
- ✅ `NewsAPI key found: abcd1234...`
- 🌐 `Fetching news from NewsAPI: country=us, category=general`
- ✅ `Successfully fetched X articles from NewsAPI`

## 🚀 Quick Fix Steps

1. **Get a NewsAPI key:**
   - Go to https://newsapi.org/
   - Sign up (free)
   - Copy your API key

2. **Set up the key:**
   ```bash
   # Option 1: Use setup script
   python setup_newsapi.py
   
   # Option 2: Manual setup
   echo "NEWSAPI_KEY=your_key_here" > backend/.env
   ```

3. **Restart backend:**
   ```bash
   cd backend
   python main.py
   ```

4. **Test it:**
   - Visit `http://localhost:8000/test-newsapi`
   - Check if you see live news in the frontend

## 📱 Frontend Indicators

### NewsAPI Working:
- News articles show real headlines
- Different articles when you change country/category
- Trending section shows current headlines

### Using Dummy Data:
- Same articles every time
- No change when switching countries/categories
- "dummy_data" shown in API responses

## 🆘 Still Not Working?

1. **Check the backend logs** for error messages
2. **Verify your API key** at NewsAPI.org dashboard
3. **Test the API directly:**
   ```bash
   curl "https://newsapi.org/v2/top-headlines?country=us&apiKey=YOUR_KEY"
   ```
4. **Check your internet connection**
5. **Try a different API key** (create a new account)

## 💡 Pro Tips

- **Free accounts** have 1000 requests per day
- **Rate limits** apply (don't refresh too quickly)
- **Dummy data** is always available as fallback
- **API keys** are free and take 2 minutes to get

---

**Need help?** Check the backend terminal for detailed error messages!

