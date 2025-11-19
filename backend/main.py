from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import httpx
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables explicitly from backend/.env
ENV_PATH = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)

# Import our modules
from database.db import Database
from ml_models.summarizer import summarizer
from ml_models.sentiment import sentiment_analyzer
from ml_models.recommend import recommender

# Initialize FastAPI app
app = FastAPI(
    title="NewsHub API",
    description="A real-time news aggregator with AI-powered analysis",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
db = Database()

# NewsAPI configuration
NEWSAPI_KEY = os.getenv('NEWSAPI_KEY')
NEWSAPI_BASE_URL = "https://newsapi.org/v2"

# Countries supported by NewsAPI top-headlines country filter
SUPPORTED_COUNTRIES = {
    'ae','ar','at','au','be','bg','br','ca','ch','cn','co','cu','cz','de','eg','fr','gb','gr',
    'hk','hu','id','ie','il','in','it','jp','kr','lt','lv','ma','mx','my','ng','nl','no','nz',
    'ph','pl','pt','ro','rs','ru','sa','se','sg','si','sk','th','tr','tw','ua','us','ve','za'
}

# Validate API key
if not NEWSAPI_KEY:
    raise ValueError("NEWSAPI_KEY not found in environment variables. Please set it in .env file")

# Pydantic models
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

# Helper functions
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

async def fetch_news_from_api(country: str = "us", category: str = "general", keyword: str = None) -> List[Dict[str, Any]]:
    """Fetch live news from NewsAPI.org using httpx."""
    try:
        # Filter function to get only recent news (last 24-48 hours)
        def filter_recent_news(articles: List[Dict[str, Any]], hours: int = 48) -> List[Dict[str, Any]]:
            """Filter articles to only include news from the last N hours."""
            now = datetime.now(timezone.utc)
            cutoff = now - timedelta(hours=hours)
            filtered = []
            for article in articles:
                published_str = article.get('publishedAt', '')
                if published_str:
                    try:
                        # Parse ISO 8601 format - handle various formats
                        if published_str.endswith('Z'):
                            pub_date = datetime.strptime(published_str, '%Y-%m-%dT%H:%M:%SZ').replace(tzinfo=timezone.utc)
                        elif '+' in published_str[-6:] or '-' in published_str[-6:]:
                            pub_date = datetime.fromisoformat(published_str)
                        else:
                            # No timezone info, assume UTC
                            pub_date = datetime.strptime(published_str, '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc)
                        
                        # Only include if published recently
                        if pub_date >= cutoff:
                            filtered.append(article)
                    except (ValueError, AttributeError) as e:
                        # If date parsing fails, include the article anyway
                        print(f"⚠️ Could not parse date '{published_str}': {e}")
                        filtered.append(article)
                else:
                    # If no date, include it (rare case)
                    filtered.append(article)
            
            print(f"📅 Filtered {len(filtered)}/{len(articles)} articles from last {hours} hours")
            return filtered
        # Map custom categories to NewsAPI supported categories
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
            'education': 'general',    # Map education to general
            'food': 'entertainment'    # Map food to entertainment
        }
        
        # Use mapped category or fallback to original
        mapped_category = category_mapping.get(category, category)
        
        # Use country filter only if supported; otherwise omit it
        params = {
            'category': mapped_category,
            'apiKey': NEWSAPI_KEY
        }
        if country.lower() in SUPPORTED_COUNTRIES:
            params['country'] = country
        
        # For categories that don't map well, add keyword search
        if category in ['politics', 'world', 'environment', 'education', 'food']:
            if not keyword:
                keyword = category
            else:
                keyword = f"{keyword} {category}"
        
        if keyword:
            params['q'] = keyword
        
        print(f"🌐 Fetching live news: country={country}, category={category}, keyword={keyword}")
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Primary: top-headlines
            response = await client.get(f"{NEWSAPI_BASE_URL}/top-headlines", params=params)
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'ok':
                    articles = data.get('articles', [])
                    if articles:
                        # Filter for recent news only
                        filtered_articles = filter_recent_news(articles, hours=48)
                        normalized_articles = [normalize_article(article) for article in filtered_articles]
                        print(f"✅ Fetched {len(normalized_articles)} recent articles (top-headlines)")
                        return normalized_articles
                    # Fallback when zero results: try /everything with a smart query
                    else:
                        # Map country code to language (rough heuristic)
                        lang_map = {
                            'us': 'en','gb': 'en','in': 'en','au': 'en','ca': 'en','nz': 'en',
                            'es': 'es','mx': 'es','ar': 'es',
                            'fr': 'fr','de': 'de','it': 'it','pt': 'pt','br': 'pt',
                            'ru': 'ru','jp': 'ja','cn': 'zh','kr': 'ko',
                        }
                        language = lang_map.get(country.lower(), 'en')
                        country_terms = {
                            'in': 'India','es': 'Spain','mx': 'Mexico','us': 'USA','gb': 'UK','de': 'Germany','fr':'France','it':'Italy','jp':'Japan','kr':'Korea','br':'Brazil'
                        }
                        country_name = country_terms.get(country.lower(), country.upper())
                        query_terms = [category]
                        if keyword:
                            query_terms.append(keyword)
                        query_terms.append(country_name)
                        q_string = ' '.join(t for t in query_terms if t)
                        
                        # Use a 7-day range for the API (then filter to 48 hours on our side)
                        today = datetime.now(timezone.utc)
                        seven_days_ago = today - timedelta(days=7)
                        today_str = today.strftime('%Y-%m-%d')
                        seven_days_ago_str = seven_days_ago.strftime('%Y-%m-%d')
                        
                        everything_params = {
                            'q': q_string,
                            'language': language,
                            'pageSize': 20,
                            'sortBy': 'publishedAt',
                            'from': seven_days_ago_str,
                            'to': today_str,
                            'apiKey': NEWSAPI_KEY
                        }
                        print(f"🔁 Falling back to /everything with q='{q_string}', language={language}")
                        resp2 = await client.get(f"{NEWSAPI_BASE_URL}/everything", params=everything_params)
                        if resp2.status_code == 200:
                            data2 = resp2.json()
                            if data2.get('status') == 'ok':
                                arts2 = data2.get('articles', [])
                                # Filter for recent news only
                                filtered_articles2 = filter_recent_news(arts2, hours=48)
                                normalized_articles = [normalize_article(article) for article in filtered_articles2]
                                print(f"✅ Fetched {len(normalized_articles)} recent articles via /everything fallback")
                                return normalized_articles
                        # If fallback fails too, return empty list gracefully
                        return []
                else:
                    raise HTTPException(status_code=400, detail=f"NewsAPI error: {data.get('message')}")
            else:
                raise HTTPException(status_code=response.status_code, detail=f"HTTP error: {response.text}")
                
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Request timeout")
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Connection error - check internet connection")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching news: {str(e)}")

async def fetch_trending_news(country: str = "us") -> List[Dict[str, Any]]:
    """Fetch trending news. If country == 'world', aggregate from multiple countries."""
    try:
        # If world is requested, aggregate from several regions
        if country.lower() in {"world", "global", "all"}:
            countries = [
                c for c in ["us","gb","in","ca","au","de","fr","jp","cn","br","ru","kr","it","es","mx","ar","za","ng","eg","sa","ae","tr","id","th","sg","my","ph","vn","nz","nl","be","ch","at","se","no","dk","fi","pl","cz","hu","ro","bg","gr","pt","ie","is","lu","mt","cy"]
                if c in SUPPORTED_COUNTRIES
            ]
            print(f"🔥 Fetching global trending news from: {countries}")
            aggregated: List[Dict[str, Any]] = []
            seen_urls = set()
            async with httpx.AsyncClient(timeout=10.0) as client:
                for c in countries:
                    params = {'country': c, 'apiKey': NEWSAPI_KEY}
                    resp = await client.get(f"{NEWSAPI_BASE_URL}/top-headlines", params=params)
                    if resp.status_code != 200:
                        continue
                    data = resp.json()
                    if data.get('status') != 'ok':
                        continue
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
            print(f"✅ Fetched {len(aggregated)} global trending articles")
            return aggregated

        # Otherwise fetch country-specific
        params = {
            'country': country,
            'apiKey': NEWSAPI_KEY
        }
        print(f"🔥 Fetching trending news: country={country}")
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{NEWSAPI_BASE_URL}/top-headlines", params=params)
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'ok':
                    articles = data.get('articles', [])[:10]
                    normalized_articles = [normalize_article(article) for article in articles]
                    print(f"✅ Fetched {len(normalized_articles)} trending articles")
                    return normalized_articles
                else:
                    raise HTTPException(status_code=400, detail=f"NewsAPI error: {data.get('message')}")
            else:
                raise HTTPException(status_code=response.status_code, detail=f"HTTP error: {response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching trending news: {str(e)}")

# API Endpoints
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "NewsHub API",
        "version": "1.0.0",
        "status": "Live news from NewsAPI.org",
        "endpoints": {
            "news": "/news",
            "trending": "/news/trending",
            "summarize": "/news/summarize",
            "sentiment": "/news/sentiment",
            "recommend": "/news/recommend",
            "favorites": "/user/favorites"
        }
    }

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
    
    Supported categories: business, entertainment, general, health, science, sports, technology
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

@app.get("/news/trending")
async def get_trending_news(country: str = Query("us", description="Country code for trending news")):
    """
    Get trending/breaking news headlines from NewsAPI.org.
    
    Parameters:
    - country: Country code (default: us)
    """
    try:
        articles = await fetch_trending_news(country)
        
        return {
            "status": "success",
            "source": "NewsAPI.org (Live)",
            "country": country,
            "totalResults": len(articles),
            "articles": articles
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.post("/news/summarize")
async def summarize_article(request: SummarizeRequest):
    """
    Summarize article text using BART model.
    """
    try:
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error summarizing text: {str(e)}")

@app.post("/news/sentiment")
async def analyze_sentiment(request: SentimentRequest):
    """
    Analyze sentiment of article text.
    """
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        sentiment_result = sentiment_analyzer.analyze_sentiment(request.text)
        
        return {
            "status": "success",
            "sentiment": sentiment_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing sentiment: {str(e)}")

@app.post("/news/recommend")
async def recommend_articles(request: RecommendRequest):
    """
    Get article recommendations based on similarity.
    """
    try:
        recommendations = recommender.recommend_similar(
            request.article.dict(),
            n_recommendations=request.n_recommendations
        )
        
        return {
            "status": "success",
            "recommendations": recommendations,
            "count": len(recommendations)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting recommendations: {str(e)}")

@app.get("/user/favorites")
async def get_favorites():
    """
    Get user's favorite articles.
    """
    try:
        favorites = db.get_favorites()
        return {
            "status": "success",
            "favorites": favorites,
            "count": len(favorites)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching favorites: {str(e)}")

@app.post("/user/favorites")
async def add_favorite(request: FavoriteRequest):
    """
    Add an article to favorites.
    """
    try:
        success = db.add_favorite(request.article.dict())
        if success:
            return {
                "status": "success",
                "message": "Article added to favorites"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to add article to favorites")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding favorite: {str(e)}")

@app.delete("/user/favorites")
async def remove_favorite(url: str):
    """
    Remove an article from favorites.
    """
    try:
        success = db.remove_favorite(url)
        if success:
            return {
                "status": "success",
                "message": "Article removed from favorites"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to remove article from favorites")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing favorite: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)