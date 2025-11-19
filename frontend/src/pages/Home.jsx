import React, { useState, useEffect } from 'react';
import { Filter, Search, RefreshCw, AlertCircle } from 'lucide-react';
import NewsCard from '../components/NewsCard';
import FilterBar from '../components/FilterBar';
import { fetchNews, fetchRecommendations } from '../services/api';

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    country: 'in', // Default to India as requested
    category: 'general',
    keyword: ''
  });
  const [favorites, setFavorites] = useState([]);

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(savedFavorites);
  }, []);

  // Load news when component mounts or filters change
  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('=== LOADING NEWS ===');
      console.log('Filters:', filters);
      console.log('API Base URL:', import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000');
      
      const newsData = await fetchNews(filters);
      console.log('=== NEWS DATA RECEIVED ===');
      console.log('Type:', typeof newsData);
      console.log('Is Array:', Array.isArray(newsData));
      console.log('Length:', newsData?.length);
      console.log('First item:', newsData?.[0]);
      
      setArticles(newsData || []);
      
      // Load recommendations if we have articles
      if (newsData && newsData.length > 0) {
        try {
          console.log('=== LOADING RECOMMENDATIONS ===');
          const recData = await fetchRecommendations(newsData[0].url);
          console.log('Recommendations received:', recData);
          setRecommendations(recData || []);
        } catch (recError) {
          console.warn('Could not load recommendations:', recError);
          setRecommendations([]);
        }
      }
    } catch (error) {
      console.error('=== ERROR LOADING NEWS ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      setError(`Could not fetch news: ${error.message}`);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = async () => {
    console.log('Applying filters:', filters);
    await loadNews();
  };

  const handleAddToFavorites = (article) => {
    const newFavorites = [...favorites, article];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    // Dispatch event so FavoritesPage can refresh if open
    window.dispatchEvent(new Event('favoritesUpdated'));
    console.log('Added to favorites:', article.title);
  };

  const handleRemoveFromFavorites = (article) => {
    const newFavorites = favorites.filter(fav => fav.url !== article.url);
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    // Dispatch event so FavoritesPage can refresh if open
    window.dispatchEvent(new Event('favoritesUpdated'));
    console.log('Removed from favorites:', article.title);
  };

  const isFavorite = (article) => {
    return favorites.some(fav => fav.url === article.url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            NewsHub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Real-time news from around the world with AI-powered analysis. 
            Get summaries, sentiment analysis, and personalized recommendations.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="mb-8">
          <FilterBar 
            onFiltersChange={handleFiltersChange}
            onApplyFilters={handleApplyFilters}
            currentFilters={filters}
            loading={loading}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-lg text-gray-600 dark:text-gray-300">Loading news...</span>
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
              onClick={loadNews}
              className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        )}

        {/* Articles Grid */}
        {!loading && articles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Latest News
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, index) => (
                <div key={`${article.url}-${index}`} className="stagger-item">
                  <NewsCard
                    article={article}
                    onAddToFavorites={handleAddToFavorites}
                    onRemoveFromFavorites={handleRemoveFromFavorites}
                    isFavorite={isFavorite(article)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Section */}
        {!loading && recommendations.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Recommended for You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.slice(0, 6).map((article, index) => (
                <div key={`rec-${article.url}-${index}`} className="stagger-item">
                  <NewsCard
                    article={article}
                    onAddToFavorites={handleAddToFavorites}
                    onRemoveFromFavorites={handleRemoveFromFavorites}
                    isFavorite={isFavorite(article)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Articles State */}
        {!loading && articles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No articles found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Try adjusting your search or filters
            </p>
            <button
              onClick={loadNews}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
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

export default Home;
