import React, { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, BarChart3, Globe, AlertCircle } from 'lucide-react';
import NewsCard from '../components/NewsCard';
import { fetchTrendingNews } from '../services/api';

const TrendingPage = () => {
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sentimentStats, setSentimentStats] = useState({ positive: 0, neutral: 0, negative: 0 });
  const [favorites, setFavorites] = useState([]);

  const categories = [
    { value: 'all', label: 'All Categories', icon: Globe },
    { value: 'general', label: 'General', icon: TrendingUp },
    { value: 'business', label: 'Business', icon: TrendingUp },
    { value: 'technology', label: 'Technology', icon: TrendingUp },
    { value: 'science', label: 'Science', icon: TrendingUp },
    { value: 'health', label: 'Health', icon: TrendingUp },
    { value: 'sports', label: 'Sports', icon: TrendingUp },
    { value: 'entertainment', label: 'Entertainment', icon: TrendingUp },
  ];

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(savedFavorites);
  }, []);

  // Load trending news when component mounts
  useEffect(() => {
    loadTrendingNews();
  }, []);

  const loadTrendingNews = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching trending news for category:', selectedCategory);
      const newsData = await fetchTrendingNews(selectedCategory === 'all' ? 'world' : selectedCategory);
      console.log('Received trending news:', newsData);
      
      // Limit to top 10 articles as requested
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
          stats.neutral++; // Default to neutral if no sentiment
        }
      });
      setSentimentStats(stats);
    } catch (error) {
      console.error('Error loading trending news:', error);
      setError('Could not fetch trending news. Please check your connection and try again.');
      setTrendingArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = async (category) => {
    setSelectedCategory(category);
    // Reload trending news when category changes
    await loadTrendingNews();
  };

  const handleAddToFavorites = (article) => {
    const newFavorites = [...favorites, article];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const handleRemoveFromFavorites = (article) => {
    const newFavorites = favorites.filter(fav => fav.url !== article.url);
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const isFavorite = (article) => {
    return favorites.some(fav => fav.url === article.url);
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'negative': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="h-8 w-8 text-orange-500 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Trending Now
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover the most talked-about stories from around the world
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => handleCategoryChange(value)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  selectedCategory === value
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={loadTrendingNews}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors duration-200"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh Trending'}
          </button>
        </div>

        {/* Sentiment Insights */}
        {!loading && trendingArticles.length > 0 && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Sentiment Distribution
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{sentimentStats.positive}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Positive</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{sentimentStats.neutral}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Neutral</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{sentimentStats.negative}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Negative</div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-6 w-6 animate-spin text-orange-600" />
              <span className="text-lg text-gray-600 dark:text-gray-300">Loading trending news...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="text-red-800 dark:text-red-200 font-medium">Error</span>
            </div>
            <p className="text-red-700 dark:text-red-300 mt-2">{error}</p>
            <button
              onClick={loadTrendingNews}
              className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        )}

        {/* Trending Articles */}
        {!loading && trendingArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingArticles.map((article, index) => (
              <div key={`trending-${article.url}-${index}`} className="relative stagger-item">
                {/* Trending Badge */}
                <div className="absolute -top-2 -right-2 z-10">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                    #{index + 1} Trending
                  </span>
                </div>
                
                <NewsCard
                  article={article}
                  onAddToFavorites={handleAddToFavorites}
                  onRemoveFromFavorites={handleRemoveFromFavorites}
                  isFavorite={isFavorite(article)}
                />
              </div>
            ))}
          </div>
        )}

        {/* No Articles State */}
        {!loading && trendingArticles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🔥</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No trending articles found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Try refreshing or selecting a different category
            </p>
            <button
              onClick={loadTrendingNews}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default TrendingPage;
