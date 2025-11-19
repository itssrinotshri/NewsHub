# 📰 NewsHub

A **NewsHub Web App** that combines **Web Development** (React + Tailwind + FastAPI) with **Data Science/NLP skills**. Features a Google News-style interface with real-time news from NewsAPI.org and AI-powered analysis.

## 🚀 Features

### Real-time News
- **Live news** from NewsAPI.org (no dummy data)
- **Multi-country support** (US, India, UK, Canada, etc.)
- **Category filtering** (General, Business, Technology, Science, Health, Sports, Entertainment)
- **Keyword search** across all articles
- **Trending news** section with breaking headlines

### AI/ML Features
- **📝 Text Summarization** using HuggingFace BART model
- **😊 Sentiment Analysis** with confidence scoring
- **🔍 Article Recommendations** using TF-IDF + cosine similarity
- **📊 Trending Topics** extraction

### Professional UI/UX
- **Google News-style** interface
- **Responsive design** for all devices
- **Favorites management** with SQLite persistence
- **Real-time search** and filtering
- **Interactive news cards** with AI features

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icons

### Backend
- **FastAPI** - Modern Python web framework
- **SQLite** - Lightweight database for favorites
- **httpx** - Async HTTP client for NewsAPI
- **Transformers** - HuggingFace ML models

### AI/ML Models
- **BART** - Text summarization
- **RoBERTa** - Sentiment analysis
- **TF-IDF** - Text vectorization
- **Cosine Similarity** - Article recommendations

## 📁 Project Structure

```
project/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Environment variables
│   ├── database/
│   │   └── db.py              # SQLite operations
│   └── ml_models/
│       ├── summarizer.py      # Text summarization
│       ├── sentiment.py       # Sentiment analysis
│       └── recommend.py       # Article recommendations
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx     # Navigation
│   │   │   ├── Filters.jsx    # Search & filtering
│   │   │   ├── NewsCard.jsx   # Article cards
│   │   │   ├── Trending.jsx   # Trending section
│   │   │   └── Favorites.jsx  # Favorites page
│   │   ├── services/
│   │   │   └── api.js         # API integration
│   │   ├── App.jsx            # Main React app
│   │   ├── index.js           # React entry point
│   │   └── index.css          # Tailwind styles
│   ├── package.json           # Node.js dependencies
│   └── tailwind.config.js     # Tailwind configuration
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **NewsAPI.org account** (free)

### 1. Get NewsAPI Key
1. Go to [NewsAPI.org](https://newsapi.org/)
2. Click "Get API Key"
3. Sign up (free, takes 2 minutes)
4. Copy your API key

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create .env file with your API key
echo "NEWSAPI_KEY=your_actual_api_key_here" > .env

# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm start
```

The application will be available at `http://localhost:3000`

## 📚 API Endpoints

### News Endpoints
- `GET /news?country=us&category=technology&q=ai` - Fetch live news with filters
- `GET /news/trending?country=us` - Get trending/breaking news headlines

### AI/ML Endpoints
- `POST /news/summarize` - Summarize article text
- `POST /news/sentiment` - Analyze article sentiment
- `POST /news/recommend` - Get similar articles

### User Endpoints
- `GET /user/favorites` - Get user's favorite articles
- `POST /user/favorites` - Add article to favorites
- `DELETE /user/favorites` - Remove article from favorites

## 🌍 Supported Countries & Categories

### Countries
- **us** - United States
- **in** - India
- **gb** - United Kingdom
- **ca** - Canada
- **au** - Australia
- **de** - Germany
- **fr** - France
- **jp** - Japan
- And many more...

### Categories
- **general** - General news
- **business** - Business news
- **technology** - Technology news
- **science** - Science news
- **health** - Health news
- **sports** - Sports news
- **entertainment** - Entertainment news

## 🎨 UI Components

### Navbar
- **Logo** with NewsHub branding
- **Navigation links** (Home, Trending, Favorites)
- **Search toggle** for mobile
- **Responsive design**

### Filters
- **Search bar** for keywords
- **Country dropdown** with flags
- **Category dropdown** with icons
- **Active filters display**
- **Clear filters** functionality

### NewsCard
- **Article image** with hover effects
- **Title, source, and date**
- **AI summary** (on demand)
- **Sentiment analysis** badge
- **Similar articles** recommendations
- **Favorite button** with heart icon
- **Read more** external link

### Trending Section
- **Breaking news** carousel
- **Trending badges** (#1, #2, etc.)
- **Country-specific** content
- **Responsive grid** layout

### Favorites Page
- **Saved articles** grid
- **Remove from favorites** functionality
- **Empty state** with call-to-action
- **AI features** disabled for performance

## 🤖 How AI/ML Features Work

### 1. Text Summarization
- Uses **Facebook's BART** model for abstractive summarization
- Automatically truncates long texts to fit model limits
- Provides fallback extractive summarization if model fails
- Configurable summary length (min/max tokens)

### 2. Sentiment Analysis
- Employs **RoBERTa-based** sentiment classification
- Returns sentiment label (POSITIVE/NEGATIVE/NEUTRAL)
- Provides confidence scores and reliability indicators
- Includes rule-based fallback for robustness

### 3. Article Recommendations
- Uses **TF-IDF vectorization** to represent articles
- Calculates **cosine similarity** between article vectors
- Combines title, description, and content for better representation
- Returns top similar articles with similarity scores

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:
```env
# NewsAPI key for live news (REQUIRED)
NEWSAPI_KEY=your_api_key_here

# Database configuration
DATABASE_URL=sqlite:///news_aggregator.db
```

### Customization
- **Tailwind colors** can be modified in `frontend/tailwind.config.js`
- **API timeout** can be adjusted in `frontend/src/services/api.js`
- **ML model parameters** can be tuned in respective model files

## 🐛 Troubleshooting

### Common Issues

#### Backend Won't Start
- Ensure Python 3.8+ is installed
- Check if all dependencies are installed: `pip install -r requirements.txt`
- Verify NEWSAPI_KEY is set in `.env` file
- Check if port 8000 is available

#### Frontend Won't Start
- Ensure Node.js 16+ is installed
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

#### NewsAPI Issues
- Verify your API key is correct
- Check if you've exceeded the free tier limits (1000 requests/day)
- Ensure you have internet connectivity
- Check the backend logs for specific error messages

#### AI Features Not Working
- Check if transformers models are downloading (first run takes time)
- Verify sufficient RAM (models require ~2GB)
- Check browser console for error messages

## 🎯 What to Expect

1. **Backend starts** with AI models loading
2. **Frontend opens** in your browser
3. **🔥 Trending News** section appears at the top
4. **Live news articles** appear with real-time data
5. **Use filters** to change country and category
6. **Search** for specific topics
7. **Click AI buttons** on articles to see:
   - Summarization
   - Sentiment analysis
   - Similar article recommendations
   - Add to favorites

## 🚀 Deployment

### Backend Deployment
1. Install production dependencies
2. Use a production WSGI server (e.g., Gunicorn)
3. Set up environment variables
4. Configure reverse proxy (Nginx)

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Serve static files with a web server
3. Configure API URL for production

## 📈 Future Enhancements

- **User Authentication** with JWT tokens
- **Real-time News Updates** with WebSockets
- **Advanced ML Models** (GPT, BERT)
- **News Categories** and personalized feeds
- **Social Features** (sharing, comments)
- **Mobile App** with React Native

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **NewsAPI.org** for providing live news data
- **HuggingFace** for pre-trained models
- **FastAPI** team for the excellent framework
- **Tailwind CSS** for the utility-first approach
- **React** team for the amazing library

---

**Happy Coding! 🎉**

For questions or support, please open an issue on GitHub.