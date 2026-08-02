# 📚 NewsHub - Important Code Snippets Documentation

> **For Viva & Project Documentation**  
> This document contains all important, educational, and unique code snippets from the NewsHub project, organized by component type.

---

## 🖥️ Frontend (React + Tailwind)

### File: `frontend/src/services/api.js`  
**Snippet Title:** Centralized API Service with Axios

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for ML operations
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      throw new Error(error.response.data.detail || 'Server error occurred');
    } else if (error.request) {
      throw new Error('No response from server. Please check if the backend is running.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

export const fetchNews = async (filters = {}) => {
  const { country = 'us', category = 'general', keyword = '' } = filters;
  const params = { country, category };
  if (keyword) params.q = keyword;
  
  const response = await api.get('/news', { params });
  return response.articles || [];
};
```

**Explanation:** This creates a centralized API client using Axios with interceptors for logging and error handling. It handles environment variables, sets timeouts for ML operations, and provides reusable functions for fetching news, recommendations, and favorites.

---

### File: `frontend/src/pages/Home.jsx`  
**Snippet Title:** React Hooks for State Management & API Calls

```javascript
const [articles, setArticles] = useState([]);
const [recommendations, setRecommendations] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [filters, setFilters] = useState({
  country: 'in',
  category: 'general',
  keyword: ''
});

// Load news when component mounts
useEffect(() => {
  loadNews();
}, []);

const loadNews = async () => {
  setLoading(true);
  setError(null);
  try {
    const newsData = await fetchNews(filters);
    setArticles(newsData || []);
    
    // Load recommendations if we have articles
    if (newsData && newsData.length > 0) {
      const recData = await fetchRecommendations(newsData[0].url);
      setRecommendations(recData || []);
    }
  } catch (error) {
    setError(`Could not fetch news: ${error.message}`);
    setArticles([]);
  } finally {
    setLoading(false);
  }
};
```

**Explanation:** Demonstrates React hooks (`useState`, `useEffect`) for managing component state, loading states, and error handling. Shows async/await pattern for API calls and conditional rendering based on data availability.

---

### File: `frontend/src/pages/FavoritesPage.jsx`  
**Snippet Title:** localStorage Synchronization & Event Listeners

```javascript
// Listen for storage changes (when favorites are added from other pages)
useEffect(() => {
  const handleStorageChange = () => {
    console.log('localStorage favorites changed, reloading...');
    loadFavorites();
  };
  
  const storageHandler = (e) => {
    if (e.key === 'favorites' || e.key === null) {
      handleStorageChange();
    }
  };
  
  window.addEventListener('storage', storageHandler);
  window.addEventListener('favoritesUpdated', handleStorageChange);
  
  return () => {
    window.removeEventListener('storage', storageHandler);
    window.removeEventListener('favoritesUpdated', handleStorageChange);
  };
}, []);

const loadFavorites = async () => {
  // Always load from localStorage first
  const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  const localStorageArray = Array.isArray(savedFavorites) ? savedFavorites : [];
  
  // Try to fetch from backend and merge
  try {
    const backendFavorites = await getFavorites();
    const backendArray = Array.isArray(backendFavorites) ? backendFavorites : [];
    
    // Merge unique articles by URL
    const allFavorites = [...localStorageArray];
    const localStorageUrls = new Set(localStorageArray.map(fav => fav.url));
    
    backendArray.forEach(fav => {
      if (!localStorageUrls.has(fav.url)) {
        allFavorites.push(fav);
      }
    });
    
    setFavorites(allFavorites);
  } catch (backendError) {
    setFavorites(localStorageArray);
  }
};
```

**Explanation:** Shows how to synchronize data between localStorage and backend API, handle cross-tab communication using browser events, and merge data from multiple sources while avoiding duplicates.

---

### File: `frontend/src/components/NewsCard.jsx`  
**Snippet Title:** Component with AI Feature Integration

```javascript
const handleSummarize = async () => {
  setLoading(prev => ({ ...prev, summary: true }));
  try {
    const response = await summarizeArticle(article.content);
    if (response.status === 'success') {
      setSummary(response.summary);
    }
  } catch (error) {
    console.error('Error summarizing article:', error);
  } finally {
    setLoading(prev => ({ ...prev, summary: false }));
  }
};

const handleAnalyzeSentiment = async () => {
  setLoading(prev => ({ ...prev, sentiment: true }));
  try {
    const response = await analyzeSentiment(article.content);
    if (response.status === 'success') {
      setSentiment(response.sentiment);
    }
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
  } finally {
    setLoading(prev => ({ ...prev, sentiment: false }));
  }
};
```

**Explanation:** Demonstrates component-level state management for multiple async operations (summary, sentiment, recommendations), with individual loading states and error handling. Shows how to integrate AI features into UI components.

---

### File: `frontend/src/App.jsx`  
**Snippet Title:** React Router Setup & Dark Mode Context

```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DarkModeProvider } from './contexts/DarkModeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import TrendingPage from './pages/TrendingPage';
import FavoritesPage from './pages/FavoritesPage';

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trending" element={<TrendingPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
          </Routes>
        </div>
      </Router>
    </DarkModeProvider>
  );
}
```

**Explanation:** Shows React Router setup for multi-page navigation, context provider pattern for global state (dark mode), and component composition. Demonstrates modern React application structure.

---

### File: `frontend/src/contexts/DarkModeContext.jsx`  
**Snippet Title:** React Context API for Global State

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext();

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within DarkModeProvider');
  }
  return context;
};

export const DarkModeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};
```

**Explanation:** Demonstrates React Context API pattern for global state management, localStorage persistence, and DOM manipulation for dark mode styling. Shows how to create reusable custom hooks.

---

### File: `frontend/src/components/Navbar.jsx`  
**Snippet Title:** Responsive Navigation with Active Route Detection

```javascript
import { Link, useLocation } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/trending', label: 'Trending', icon: TrendingUp },
    { path: '/favorites', label: 'Favorites', icon: Heart },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg">
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-8">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
              isActive(path)
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 hover:text-blue-600'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path} onClick={() => setIsMenuOpen(false)}>
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};
```

**Explanation:** Shows responsive navigation design with mobile menu toggle, active route highlighting using React Router's `useLocation` hook, and dynamic styling based on route state. Demonstrates icon integration and dark mode support.

---

### File: `frontend/src/components/FilterBar.jsx`  
**Snippet Title:** Advanced Filter Component with Quick Filters

```javascript
const FilterBar = ({ onFiltersChange, onApplyFilters, currentFilters, loading }) => {
  const [filters, setFilters] = useState(currentFilters);

  const newsCategories = [
    { value: 'general', label: 'General News', icon: '📰' },
    { value: 'business', label: 'Business & Economy', icon: '💼' },
    { value: 'technology', label: 'Technology', icon: '💻' },
    // ... more categories
  ];

  const countries = [
    { value: 'us', label: 'United States', flag: '🇺🇸' },
    { value: 'in', label: 'India', flag: '🇮🇳' },
    // ... 50+ countries
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Country Filter */}
        <select
          value={filters.country}
          onChange={(e) => handleFilterChange('country', e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        >
          {countries.map((country) => (
            <option key={country.value} value={country.value}>
              {country.flag} {country.label}
            </option>
          ))}
        </select>
        
        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          {newsCategories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.icon} {category.label}
            </option>
          ))}
        </select>
        
        {/* Keyword Search */}
        <input
          type="text"
          placeholder="Search for specific topics..."
          value={filters.keyword}
          onChange={(e) => handleFilterChange('keyword', e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onApplyFilters()}
        />
        
        {/* Apply Button */}
        <button
          onClick={onApplyFilters}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          {loading ? 'Loading...' : 'Apply Filters'}
        </button>
      </div>
      
      {/* Quick Filter Tags */}
      <div className="flex flex-wrap gap-2 mt-4">
        {[
          { country: 'us', category: 'technology', label: 'US Tech' },
          { country: 'in', category: 'sports', label: 'India Sports' },
        ].map((quickFilter, index) => (
          <button
            key={index}
            onClick={() => {
              const newFilters = {
                country: quickFilter.country,
                category: quickFilter.category,
                keyword: ''
              };
              setFilters(newFilters);
              onFiltersChange(newFilters);
            }}
            className="px-3 py-1 text-xs bg-gray-100 rounded-full"
          >
            {quickFilter.label}
          </button>
        ))}
      </div>
    </div>
  );
};
```

**Explanation:** Demonstrates a comprehensive filter component with multiple input types (dropdowns, text input), controlled component pattern, keyboard event handling (Enter key), and quick filter presets for common searches.

---

### File: `frontend/src/index.css`  
**Snippet Title:** Tailwind Custom Styles & Animations

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .news-card {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg 
           transition-shadow duration-300 border border-gray-200 dark:border-gray-700;
  }

  .badge-positive {
    @apply bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300;
  }

  .badge-negative {
    @apply bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300;
  }

  .badge-neutral {
    @apply bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300;
  }

  /* Stagger animation for grid items */
  .stagger-item {
    animation: staggerIn 0.6s ease-out forwards;
  }

  .stagger-item:nth-child(1) { animation-delay: 0.1s; }
  .stagger-item:nth-child(2) { animation-delay: 0.2s; }
  .stagger-item:nth-child(3) { animation-delay: 0.3s; }

  @keyframes staggerIn {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
}

@layer utilities {
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
```

**Explanation:** Shows Tailwind CSS layer system for custom components and utilities, dark mode styling, staggered animations for grid items, and text truncation utilities using CSS line-clamp.

---

### File: `frontend/tailwind.config.js`  
**Snippet Title:** Tailwind Configuration with Custom Theme

```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          // ... color scale
          600: '#2563eb',
          900: '#1e3a8a',
        },
        news: {
          // Custom news color palette
          50: '#f8fafc',
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

**Explanation:** Demonstrates Tailwind configuration with custom color palettes, font families, animations, and keyframes. Shows how to enable class-based dark mode and extend the default theme.

---

### File: `frontend/src/pages/TrendingPage.jsx`  
**Snippet Title:** Trending News with Sentiment Statistics

```javascript
const TrendingPage = () => {
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [sentimentStats, setSentimentStats] = useState({ positive: 0, neutral: 0, negative: 0 });

  const loadTrendingNews = async () => {
    setLoading(true);
    try {
      const newsData = await fetchTrendingNews('world');
      const top10Articles = newsData.slice(0, 10);
      setTrendingArticles(top10Articles);
      
      // Calculate sentiment statistics
      const stats = { positive: 0, neutral: 0, negative: 0 };
      top10Articles.forEach(article => {
        if (article.sentiment) {
          const sentiment = article.sentiment.toLowerCase();
          if (sentiment === 'positive') stats.positive++;
          else if (sentiment === 'negative') stats.negative++;
          else stats.neutral++;
        } else {
          stats.neutral++;
        }
      });
      setSentimentStats(stats);
    } catch (error) {
      setError('Could not fetch trending news.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Sentiment Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{sentimentStats.positive}</div>
            <div className="text-sm text-gray-600">Positive</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{sentimentStats.neutral}</div>
            <div className="text-sm text-gray-600">Neutral</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{sentimentStats.negative}</div>
            <div className="text-sm text-gray-600">Negative</div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

**Explanation:** Shows how to aggregate and display sentiment statistics from fetched articles, create visual data representations, and handle data processing after API calls. Demonstrates conditional statistics calculation.

---

## ⚙️ Backend (FastAPI)

### File: `backend/main.py`  
**Snippet Title:** FastAPI News Fetching with Date Filtering & Fallback Logic

```python
from datetime import datetime, timedelta, timezone
import httpx

async def fetch_news_from_api(country: str = "us", category: str = "general", keyword: str = None) -> List[Dict[str, Any]]:
    """Fetch live news from NewsAPI.org using httpx."""
    
    def filter_recent_news(articles: List[Dict[str, Any]], hours: int = 48) -> List[Dict[str, Any]]:
        """Filter articles to only include news from the last N hours."""
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(hours=hours)
        filtered = []
        
        for article in articles:
            published_str = article.get('publishedAt', '')
            if published_str:
                try:
                    # Parse ISO 8601 format
                    if published_str.endswith('Z'):
                        pub_date = datetime.strptime(published_str, '%Y-%m-%dT%H:%M:%SZ').replace(tzinfo=timezone.utc)
                    elif '+' in published_str[-6:] or '-' in published_str[-6:]:
                        pub_date = datetime.fromisoformat(published_str)
                    else:
                        pub_date = datetime.strptime(published_str, '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc)
                    
                    if pub_date >= cutoff:
                        filtered.append(article)
                except (ValueError, AttributeError) as e:
                    filtered.append(article)  # Include if parsing fails
        
        return filtered
    
    # Primary: top-headlines endpoint
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(f"{NEWSAPI_BASE_URL}/top-headlines", params=params)
        if response.status_code == 200:
            data = response.json()
            articles = data.get('articles', [])
            if articles:
                filtered_articles = filter_recent_news(articles, hours=48)
                return [normalize_article(article) for article in filtered_articles]
            else:
                # Fallback: /everything endpoint
                everything_params = {
                    'q': q_string,
                    'language': language,
                    'from': seven_days_ago_str,
                    'to': today_str,
                    'apiKey': NEWSAPI_KEY
                }
                resp2 = await client.get(f"{NEWSAPI_BASE_URL}/everything", params=everything_params)
                # Process fallback results...
```

**Explanation:** Shows async HTTP requests using httpx, date parsing and filtering to ensure only recent news (last 48 hours), and intelligent fallback mechanism when primary endpoint returns no results. Demonstrates robust error handling.

---

### File: `backend/main.py`  
**Snippet Title:** FastAPI Endpoint with Query Parameters

```python
@app.get("/news")
async def get_news(
    country: str = Query("us", description="Country code (e.g., us, in, gb)"),
    category: str = Query("general", description="News category"),
    q: Optional[str] = Query(None, description="Keyword search")
):
    """
    Fetch live news articles from NewsAPI.org.
    
    Parameters:
    - country: Country code (default: us)
    - category: News category (default: general)
    - q: Optional keyword search
    """
    try:
        articles = await fetch_news_from_api(country, category, q)
        
        # Fit recommendation system with new articles
        recommender.fit(articles)
        
        return {
            "status": "success",
            "source": "NewsAPI.org (Live)",
            "country": country,
            "category": category,
            "keyword": q,
            "totalResults": len(articles),
            "articles": articles
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
```

**Explanation:** Demonstrates FastAPI endpoint creation with query parameters, default values, type hints, and docstrings. Shows integration with ML models (recommender.fit) and structured JSON response format.

---

### File: `backend/main.py`  
**Snippet Title:** CORS Middleware Configuration

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Explanation:** Configures CORS (Cross-Origin Resource Sharing) to allow frontend React app to communicate with FastAPI backend. Essential for development and deployment.

---

### File: `backend/main.py`  
**Snippet Title:** Global Trending News Aggregation

```python
async def fetch_trending_news(country: str = "us") -> List[Dict[str, Any]]:
    """Fetch trending news. If country == 'world', aggregate from multiple countries."""
    
    if country.lower() in {"world", "global", "all"}:
        countries = ["us","gb","in","ca","au","de","fr","jp","cn","br","ru","kr","it","es","mx"]
        aggregated: List[Dict[str, Any]] = []
        seen_urls = set()
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            for c in countries:
                params = {'country': c, 'apiKey': NEWSAPI_KEY}
                resp = await client.get(f"{NEWSAPI_BASE_URL}/top-headlines", params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    for art in data.get('articles', []):
                        url = art.get('url')
                        if not url or url in seen_urls:
                            continue
                        seen_urls.add(url)
                        aggregated.append(normalize_article(art))
                        if len(aggregated) >= 10:
                            break
                if len(aggregated) >= 10:
                    break
        
        return aggregated
```

**Explanation:** Shows how to aggregate data from multiple API calls, deduplicate results using URL tracking, and implement early termination for performance optimization.

---

### File: `backend/main.py`  
**Snippet Title:** Article Normalization & Category Mapping

```python
def normalize_article(article: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize article data to ensure consistent structure."""
    return {
        "title": article.get("title", ""),
        "description": article.get("description", ""),
        "content": article.get("content", article.get("description", "")),
        "url": article.get("url", ""),
        "urlToImage": article.get("urlToImage"),
        "publishedAt": article.get("publishedAt", ""),
        "source": {
            "id": article.get("source", {}).get("id", ""),
            "name": article.get("source", {}).get("name", "Unknown Source")
        }
    }

# Category mapping for NewsAPI compatibility
category_mapping = {
    'general': 'general',
    'business': 'business',
    'technology': 'technology',
    'science': 'science',
    'health': 'health',
    'sports': 'sports',
    'entertainment': 'entertainment',
    'politics': 'general',  # NewsAPI doesn't have politics, use general
    'world': 'general',     # NewsAPI doesn't have world, use general
    'environment': 'science',  # Map environment to science
    'education': 'general',
    'food': 'entertainment'
}

# Use mapped category or fallback to original
mapped_category = category_mapping.get(category, category)

# Supported countries by NewsAPI
SUPPORTED_COUNTRIES = {
    'ae','ar','at','au','be','bg','br','ca','ch','cn','co','cu','cz','de','eg','fr',
    'gb','gr','hk','hu','id','ie','il','in','it','jp','kr','lt','lv','ma','mx','my',
    'ng','nl','no','nz','ph','pl','pt','ro','rs','ru','sa','se','sg','si','sk','th',
    'tr','tw','ua','us','ve','za'
}

# Use country filter only if supported
if country.lower() in SUPPORTED_COUNTRIES:
    params['country'] = country
```

**Explanation:** Demonstrates data normalization to ensure consistent API responses, category mapping to handle API limitations, and country validation to prevent API errors. Shows defensive programming and API compatibility handling.

---

## 🤖 ML/NLP Models

### File: `backend/ml_models/summarizer.py`  
**Snippet Title:** HuggingFace BART Summarization Model

```python
from transformers import pipeline
import torch

class NewsSummarizer:
    def __init__(self):
        self.model_name = "facebook/bart-large-cnn"
        self.summarizer = None
        self._load_model()
    
    def _load_model(self):
        """Load the summarization model."""
        try:
            print("🔄 Loading BART summarization model...")
            self.summarizer = pipeline(
                "summarization",
                model="facebook/bart-large-cnn",
                device=0 if torch.cuda.is_available() else -1
            )
            print("✅ Summarization model loaded successfully")
        except Exception as e:
            print(f"❌ Error loading summarization model: {e}")
            self.summarizer = None
    
    def summarize(self, text: str, max_length: int = 150, min_length: int = 30) -> str:
        """Summarize the given text."""
        if not text or len(text.strip()) < 50:
            return "Text too short for summarization"
        
        try:
            if self.summarizer:
                # Truncate text if too long (BART has input limits)
                if len(text) > 1024:
                    text = text[:1024]
                
                result = self.summarizer(
                    text,
                    max_length=max_length,
                    min_length=min_length,
                    do_sample=False
                )
                return result[0]['summary_text']
            else:
                return self._simple_summarize(text, max_length)
        except Exception as e:
            print(f"Error in summarization: {e}")
            return self._simple_summarize(text, max_length)
```

**Explanation:** Demonstrates loading HuggingFace Transformers models (BART for summarization), GPU/CPU detection, input length handling, and fallback mechanisms for robustness.

---

### File: `backend/ml_models/sentiment.py`  
**Snippet Title:** RoBERTa Sentiment Analysis with Label Mapping

```python
from transformers import pipeline
import torch

class SentimentAnalyzer:
    def __init__(self):
        self.sentiment_pipeline = None
        self._load_model()
    
    def _load_model(self):
        try:
            self.sentiment_pipeline = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                device=0 if torch.cuda.is_available() else -1
            )
        except Exception as e:
            # Fallback to default model
            self.sentiment_pipeline = pipeline("sentiment-analysis")
    
    def analyze_sentiment(self, text: str) -> dict:
        """Analyze sentiment of the given text."""
        if not text or len(text.strip()) < 10:
            return {"label": "NEUTRAL", "score": 0.5, "confidence": "low"}
        
        try:
            if self.sentiment_pipeline:
                if len(text) > 512:
                    text = text[:512]
                
                result = self.sentiment_pipeline(text)
                
                if isinstance(result, list) and len(result) > 0:
                    sentiment_data = result[0]
                    label = sentiment_data['label'].upper()
                    score = sentiment_data['score']
                    
                    # Map labels to standard format
                    if 'POSITIVE' in label or 'LABEL_2' in label:
                        label = 'POSITIVE'
                    elif 'NEGATIVE' in label or 'LABEL_0' in label:
                        label = 'NEGATIVE'
                    else:
                        label = 'NEUTRAL'
                    
                    # Determine confidence level
                    confidence = "high" if score > 0.8 else "medium" if score > 0.6 else "low"
                    
                    return {
                        "label": label,
                        "score": round(score, 3),
                        "confidence": confidence
                    }
        except Exception as e:
            return self._fallback_sentiment(text)
```

**Explanation:** Shows sentiment analysis using RoBERTa model, label standardization across different model outputs, confidence scoring, and rule-based fallback for edge cases.

---

### File: `backend/ml_models/recommend.py`  
**Snippet Title:** TF-IDF & Cosine Similarity for Article Recommendations

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class NewsRecommender:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        self.articles = []
        self.article_vectors = None
        self.is_fitted = False
    
    def fit(self, articles: List[Dict]):
        """Fit the recommendation system with articles."""
        self.articles = articles
        
        # Combine title, description, and content
        texts = []
        cleaned_articles = []
        for article in articles:
            text_parts = []
            if article.get('title'):
                text_parts.append(article['title'])
            if article.get('description'):
                text_parts.append(article['description'])
            if article.get('content'):
                text_parts.append(article['content'])
            
            combined_text = ' '.join(text_parts).strip()
            if combined_text and len(combined_text.split()) >= 3:
                texts.append(combined_text)
                cleaned_articles.append(article)
        
        if not texts:
            self.is_fitted = False
            return
        
        try:
            self.article_vectors = self.vectorizer.fit_transform(texts)
            self.articles = cleaned_articles
            self.is_fitted = True
        except ValueError as e:
            self.is_fitted = False
    
    def recommend_similar(self, target_article: Dict, n_recommendations: int = 3) -> List[Dict]:
        """Find similar articles using cosine similarity."""
        if not self.is_fitted:
            return []
        
        # Prepare target article text
        text_parts = []
        if target_article.get('title'):
            text_parts.append(target_article['title'])
        if target_article.get('description'):
            text_parts.append(target_article['description'])
        if target_article.get('content'):
            text_parts.append(target_article['content'])
        
        target_text = ' '.join(text_parts)
        target_vector = self.vectorizer.transform([target_text])
        
        # Calculate cosine similarities
        similarities = cosine_similarity(target_vector, self.article_vectors).flatten()
        
        # Get indices of most similar articles
        similar_indices = np.argsort(similarities)[::-1]
        
        recommendations = []
        for idx in similar_indices:
            if len(recommendations) >= n_recommendations:
                break
            
            if self._is_same_article(target_article, self.articles[idx]):
                continue
            
            article_with_score = self.articles[idx].copy()
            article_with_score['similarity_score'] = round(similarities[idx], 3)
            recommendations.append(article_with_score)
        
        return recommendations
```

**Explanation:** Demonstrates content-based recommendation using TF-IDF vectorization and cosine similarity. Shows how to combine multiple text fields, handle edge cases (empty vocabulary), and filter out duplicate articles.

---

## 🗃️ Database (SQLite)

### File: `backend/database/db.py`  
**Snippet Title:** SQLite Database Operations

```python
import sqlite3
from typing import List

class Database:
    def __init__(self, db_path: str = "news_aggregator.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize the database and create tables if they don't exist."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS favorites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                url TEXT NOT NULL UNIQUE,
                urlToImage TEXT,
                publishedAt TEXT,
                source_name TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def add_favorite(self, article: dict) -> bool:
        """Add an article to favorites."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR IGNORE INTO favorites (title, description, url, urlToImage, publishedAt, source_name)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                article.get('title', ''),
                article.get('description', ''),
                article.get('url', ''),
                article.get('urlToImage', ''),
                article.get('publishedAt', ''),
                article.get('source', {}).get('name', '')
            ))
            
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error adding favorite: {e}")
            return False
    
    def get_favorites(self) -> List[dict]:
        """Get all favorite articles."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT title, description, url, urlToImage, publishedAt, source_name, created_at
                FROM favorites
                ORDER BY created_at DESC
            ''')
            
            rows = cursor.fetchall()
            conn.close()
            
            favorites = []
            for row in rows:
                favorites.append({
                    'title': row[0],
                    'description': row[1],
                    'url': row[2],
                    'urlToImage': row[3],
                    'publishedAt': row[4],
                    'source': {'name': row[5]},
                    'created_at': row[6]
                })
            
            return favorites
        except Exception as e:
            print(f"Error getting favorites: {e}")
            return []
```

**Explanation:** Shows SQLite database operations: table creation with schema, INSERT OR IGNORE to prevent duplicates, parameterized queries for security, and data transformation from database rows to dictionaries.

---

## ☁️ Deployment / Configuration

### File: `backend/requirements.txt`  
**Snippet Title:** Python Dependencies

```txt
fastapi==0.104.1
uvicorn==0.24.0
python-multipart==0.0.6
httpx==0.25.2
transformers==4.35.2
torch==2.1.1
scikit-learn==1.3.2
nltk==3.8.1
pydantic==2.5.0
python-dotenv==1.0.0
```

**Explanation:** Lists all Python dependencies for the backend, including FastAPI framework, ML libraries (Transformers, PyTorch, scikit-learn), and utilities (httpx for async HTTP, python-dotenv for environment variables).

---

### File: `frontend/package.json`  
**Snippet Title:** React Dependencies

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "lucide-react": "^0.294.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.30.1",
    "react-scripts": "5.0.1"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.0"
  }
}
```

**Explanation:** Lists frontend dependencies: React for UI, React Router for navigation, Axios for API calls, Tailwind CSS for styling, and Lucide React for icons.

---

### File: `backend/main.py`  
**Snippet Title:** Environment Variable Loading

```python
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables explicitly from backend/.env
ENV_PATH = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)

NEWSAPI_KEY = os.getenv('NEWSAPI_KEY')

if not NEWSAPI_KEY:
    raise ValueError("NEWSAPI_KEY not found in environment variables. Please set it in .env file")
```

**Explanation:** Shows secure environment variable loading using python-dotenv, explicit path resolution using Pathlib, and validation to ensure required variables are present before starting the application.

---

### File: `backend/main.py`  
**Snippet Title:** Pydantic Models for Request/Response Validation

```python
from pydantic import BaseModel
from typing import Optional

class Article(BaseModel):
    title: str
    description: str
    content: str
    url: str
    urlToImage: Optional[str] = None
    publishedAt: str
    source: dict

class SummarizeRequest(BaseModel):
    text: str
    max_length: Optional[int] = 150
    min_length: Optional[int] = 30

class SentimentRequest(BaseModel):
    text: str

class RecommendRequest(BaseModel):
    article: Article
    n_recommendations: Optional[int] = 3

class FavoriteRequest(BaseModel):
    article: Article

@app.post("/news/summarize")
async def summarize_article(request: SummarizeRequest):
    """Summarize article text using BART model."""
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    summary = summarizer.summarize(
        request.text,
        max_length=request.max_length,
        min_length=request.min_length
    )
    
    return {
        "status": "success",
        "original_length": len(request.text),
        "summary_length": len(summary),
        "summary": summary
    }
```

**Explanation:** Demonstrates Pydantic models for request validation, type safety, optional fields, and nested models. Shows how FastAPI automatically validates request bodies and generates OpenAPI documentation from these models.

---

### File: `frontend/src/index.js`  
**Snippet Title:** React App Entry Point

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Explanation:** Shows modern React 18 entry point using `createRoot` API and `StrictMode` for development checks. Demonstrates proper app initialization and CSS import.

---

### File: `frontend/public/index.html`  
**Snippet Title:** HTML Template with Meta Tags & Font Preloading

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="NewsHub - Real-time news with AI-powered analysis" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <title>NewsHub</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

**Explanation:** Shows proper HTML5 structure, SEO meta tags, font preloading for performance, and accessibility considerations (noscript tag).

---

## 🧩 How Everything Connects

### Data Flow Overview

```
┌─────────────────┐
│   User Browser  │
│   (React App)   │
└────────┬────────┘
         │ HTTP Requests (Axios)
         │
         ▼
┌─────────────────┐
│  FastAPI Backend│
│  (Python/uvicorn)│
└────────┬────────┘
         │
         ├───► NewsAPI.org (External API)
         │     └─► Fetches real-time news
         │
         ├───► ML Models
         │     ├─► BART Summarizer (HuggingFace)
         │     ├─► RoBERTa Sentiment (HuggingFace)
         │     └─► TF-IDF Recommender (scikit-learn)
         │
         └───► SQLite Database
               └─► Stores user favorites
```

### Step-by-Step Flow

1. **User Interaction (Frontend)**
   - User selects filters (country, category, keyword) in `FilterBar.jsx`
   - `Home.jsx` calls `fetchNews()` from `api.js`
   - Axios sends HTTP GET request to `/news` endpoint

2. **Backend Processing (FastAPI)**
   - `main.py` receives request at `/news` endpoint
   - `fetch_news_from_api()` makes async HTTP call to NewsAPI.org
   - Filters articles to last 48 hours using date parsing
   - Falls back to `/everything` endpoint if no results
   - Normalizes article data structure

3. **ML Integration**
   - When articles are fetched, `recommender.fit()` is called with new articles
   - TF-IDF vectorizer processes article texts
   - User can request summary → `/news/summarize` → BART model
   - User can request sentiment → `/news/sentiment` → RoBERTa model
   - User can request recommendations → `/news/recommend` → Cosine similarity

4. **Data Persistence**
   - User adds favorite → Frontend saves to localStorage AND calls `/user/favorites` POST
   - Backend saves to SQLite database
   - Favorites page loads from both localStorage and backend, merges them

5. **State Synchronization**
   - When favorites are added/removed, `favoritesUpdated` event is dispatched
   - Other components (like FavoritesPage) listen for this event
   - Cross-tab synchronization via `storage` event listener

### Key Technologies & Their Roles

- **React**: Component-based UI, state management, routing
- **FastAPI**: RESTful API, async operations, request validation
- **NewsAPI.org**: External data source for real-time news
- **HuggingFace Transformers**: Pre-trained NLP models (BART, RoBERTa)
- **scikit-learn**: ML algorithms (TF-IDF, cosine similarity)
- **SQLite**: Lightweight database for user data
- **Axios**: HTTP client for API communication
- **Tailwind CSS**: Utility-first CSS framework for styling

---

## 📝 Summary for Viva

**What makes this project unique:**

1. **Real-time Data**: No dummy data - always fetches from NewsAPI.org with date filtering
2. **ML Integration**: Three NLP features - summarization, sentiment analysis, and recommendations
3. **Robust Error Handling**: Fallback mechanisms, graceful degradation, comprehensive error messages
4. **Modern Stack**: React hooks, async/await, FastAPI, Transformers
5. **User Experience**: Dark mode, localStorage sync, cross-tab communication, responsive design

**Key algorithms demonstrated:**

- **TF-IDF Vectorization**: Converts text to numerical features
- **Cosine Similarity**: Measures similarity between articles
- **BART Summarization**: Abstractive text summarization using transformer architecture
- **Sentiment Analysis**: Classification using RoBERTa model
- **Date Filtering**: Ensures only recent news (48 hours) is displayed

---

## 🎓 Key Programming Patterns & Techniques

### 1. **Error Handling Patterns**
- **Try-Catch with Fallbacks**: Multiple layers of error handling (API → ML → Database)
- **Graceful Degradation**: App continues working even if ML models fail
- **User-Friendly Error Messages**: Clear error messages for different failure scenarios

### 2. **State Management Patterns**
- **React Hooks**: `useState`, `useEffect`, `useContext` for local and global state
- **localStorage Persistence**: Client-side data persistence with backend sync
- **Event-Driven Updates**: Custom events for cross-component communication

### 3. **API Design Patterns**
- **RESTful Endpoints**: Standard HTTP methods (GET, POST, DELETE)
- **Query Parameters**: Flexible filtering with defaults
- **Structured Responses**: Consistent JSON response format

### 4. **Data Processing Patterns**
- **Data Normalization**: Standardizing external API responses
- **Deduplication**: Using Sets for URL tracking
- **Date Parsing**: Handling multiple ISO 8601 formats

### 5. **UI/UX Patterns**
- **Loading States**: Spinners and skeleton screens
- **Empty States**: User-friendly messages when no data
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Dark Mode**: Theme switching with persistence

### 6. **Performance Optimization**
- **Early Termination**: Breaking loops when target reached
- **Lazy Loading**: Loading ML models only when needed
- **Text Truncation**: Limiting input to model constraints (1024 chars for BART)
- **Debouncing**: Preventing excessive API calls

### 7. **Security Patterns**
- **Environment Variables**: Keeping API keys secure
- **Parameterized Queries**: Preventing SQL injection
- **CORS Configuration**: Allowing only trusted origins

### 8. **Code Organization**
- **Separation of Concerns**: Frontend/Backend/ML/Database separation
- **Reusable Components**: Modular React components
- **Service Layer**: Centralized API calls
- **Custom Hooks**: Reusable logic (useDarkMode)

---

## 📊 Statistics & Metrics

**Project Scale:**
- **Frontend Components**: 10+ React components
- **Backend Endpoints**: 6 RESTful endpoints
- **ML Models**: 3 NLP models (BART, RoBERTa, TF-IDF)
- **Database Tables**: 1 table (favorites)
- **Supported Countries**: 50+ countries
- **News Categories**: 12 categories
- **Lines of Code**: ~2000+ lines

**Technical Highlights:**
- **Real-time Data**: NewsAPI.org integration
- **AI Features**: Summarization, Sentiment, Recommendations
- **Responsive Design**: Mobile, Tablet, Desktop support
- **Dark Mode**: Full theme support
- **Error Resilience**: Multiple fallback mechanisms

---

## 🔍 Common Viva Questions & Answers

**Q: Why did you use FastAPI instead of Flask/Django?**  
A: FastAPI provides automatic API documentation, async support for better performance with external APIs, and built-in request validation using Pydantic models.

**Q: How does the recommendation system work?**  
A: It uses TF-IDF vectorization to convert article text into numerical features, then calculates cosine similarity between articles to find the most similar ones based on content.

**Q: Why localStorage AND backend database for favorites?**  
A: localStorage provides instant access and works offline, while the backend database ensures persistence across devices. The frontend merges both sources for a seamless experience.

**Q: How do you ensure only recent news is shown?**  
A: After fetching from NewsAPI, we parse each article's published date and filter to only include articles from the last 48 hours using datetime comparison.

**Q: What happens if the ML model fails to load?**  
A: Each ML model has a fallback mechanism - BART uses simple extractive summarization, sentiment uses rule-based analysis, and recommendations return empty list gracefully.

**Q: How do you handle API rate limits?**  
A: We use async HTTP requests with timeouts, implement caching where possible, and have fallback endpoints when primary ones fail.

**Q: Why React Context API instead of Redux?**  
A: For this project size, Context API is simpler and sufficient. Redux would add unnecessary complexity for managing just dark mode state.

**Q: How is the project structured?**  
A: Clear separation: `frontend/` for React UI, `backend/` for FastAPI server, `ml_models/` for AI features, `database/` for SQLite operations. Each module is independent and testable.

---

*Document generated for NewsHub project documentation and viva presentation.*  
*Last Updated: Comprehensive code snippets extracted from entire codebase.*

