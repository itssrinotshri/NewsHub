import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ExternalLink, Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import NewsCard from '../components/NewsCard';
import { fetchRecommendations, getFavorites } from '../services/api';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load favorites from localStorage on component mount
  useEffect(() => {
    loadFavorites();
  }, []);

  // Listen for storage changes (when favorites are added from other pages)
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('localStorage favorites changed, reloading...');
      loadFavorites();
    };
    
    // Listen for storage events (from other tabs/windows)
    const storageHandler = (e) => {
      if (e.key === 'favorites' || e.key === null) {
        handleStorageChange();
      }
    };
    
    window.addEventListener('storage', storageHandler);
    
    // Also listen for custom event (from same tab)
    window.addEventListener('favoritesUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener('favoritesUpdated', handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter favorites when search term or category changes
  useEffect(() => {
    filterFavorites();
  }, [favorites, searchTerm, selectedCategory]);

  const loadFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      // Always load from localStorage first (this is where Home page saves)
      const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const localStorageArray = Array.isArray(savedFavorites) ? savedFavorites : [];
      console.log('Loaded favorites from localStorage:', localStorageArray);
      
      // Try to fetch from backend and merge (backend is optional)
      try {
        const backendFavorites = await getFavorites();
        console.log('Fetched favorites from backend:', backendFavorites);
        const backendArray = Array.isArray(backendFavorites) ? backendFavorites : [];
        
        // Merge localStorage and backend favorites, prioritizing localStorage
        // Combine unique articles by URL
        const allFavorites = [...localStorageArray];
        const localStorageUrls = new Set(localStorageArray.map(fav => fav.url));
        
        // Add backend favorites that aren't already in localStorage
        backendArray.forEach(fav => {
          if (!localStorageUrls.has(fav.url)) {
            allFavorites.push(fav);
          }
        });
        
        console.log('Merged favorites:', allFavorites);
        setFavorites(allFavorites);
      } catch (backendError) {
        console.warn('Backend favorites not available, using localStorage only:', backendError);
        // Use localStorage if backend fails
        setFavorites(localStorageArray);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setError('Could not load favorites. Please try again.');
      // Final fallback to localStorage
      const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const favoritesArray = Array.isArray(savedFavorites) ? savedFavorites : [];
      setFavorites(favoritesArray);
    } finally {
      setLoading(false);
    }
  };

  const filterFavorites = () => {
    // Ensure favorites is always an array
    if (!Array.isArray(favorites)) {
      setFilteredFavorites([]);
      return;
    }

    let filtered = favorites;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.source?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.source?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article =>
        article.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredFavorites(filtered);
  };

  const handleRemoveFromFavorites = (article) => {
    if (!Array.isArray(favorites)) return;
    const newFavorites = favorites.filter(fav => fav.url !== article.url);
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    // Dispatch event so other components can refresh
    window.dispatchEvent(new Event('favoritesUpdated'));
    console.log('Removed from favorites:', article.title);
  };

  const handleGetRecommendations = async () => {
    if (!Array.isArray(favorites) || favorites.length === 0) return;
    
    try {
      // Use the first favorite article to get recommendations
      const recData = await fetchRecommendations(favorites[0].url);
      setRecommendations(recData);
      setShowRecommendations(true);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const handleAddToFavorites = (article) => {
    if (!Array.isArray(favorites)) {
      setFavorites([article]);
      localStorage.setItem('favorites', JSON.stringify([article]));
      window.dispatchEvent(new Event('favoritesUpdated'));
      return;
    }
    const newFavorites = [...favorites, article];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    // Dispatch event so other components can refresh
    window.dispatchEvent(new Event('favoritesUpdated'));
    console.log('Added to favorites:', article.title);
  };

  const isFavorite = (article) => {
    if (!Array.isArray(favorites)) return false;
    return favorites.some(fav => fav.url === article.url);
  };

  // Get unique categories from favorites (ensure favorites is an array)
  const categories = Array.isArray(favorites) 
    ? ['all', ...new Set(favorites.map(fav => fav.category).filter(Boolean))]
    : ['all'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-red-500 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              My Favorites
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Your saved articles and personalized recommendations
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-red-600">{Array.isArray(favorites) ? favorites.length : 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Favorites</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">{Array.isArray(filteredFavorites) ? filteredFavorites.length : 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Filtered Results</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{categories.length - 1}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Categories</div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search your favorites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Filter className="h-5 w-5 text-gray-400 mt-1" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  selectedCategory === category
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-6 w-6 animate-spin text-red-600" />
              <span className="text-lg text-gray-600 dark:text-gray-300">Loading favorites...</span>
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
              onClick={loadFavorites}
              className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        )}

        {/* Action Buttons */}
        {!loading && Array.isArray(favorites) && favorites.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleGetRecommendations}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Heart className="h-5 w-5 mr-2" />
              Get Recommendations
            </button>
            <button
              onClick={() => setShowRecommendations(!showRecommendations)}
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              {showRecommendations ? 'Hide' : 'Show'} Recommendations
            </button>
          </div>
        )}

        {/* Recommendations Section */}
        {showRecommendations && recommendations.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Recommended for You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.slice(0, 6).map((article, index) => (
                <NewsCard
                  key={`rec-${article.url}-${index}`}
                  article={article}
                  onAddToFavorites={handleAddToFavorites}
                  onRemoveFromFavorites={handleRemoveFromFavorites}
                  isFavorite={isFavorite(article)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Favorites Grid */}
        {!loading && filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((article, index) => (
              <div key={`fav-${article.url}-${index}`} className="relative stagger-item">
                {/* Favorite Badge */}
                <div className="absolute -top-2 -right-2 z-10">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                    <Heart className="h-3 w-3 mr-1" />
                    Saved
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
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
              {(!Array.isArray(favorites) || favorites.length === 0) ? '💔' : '🔍'}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {(!Array.isArray(favorites) || favorites.length === 0) ? 'No favorites yet' : 'No matching favorites'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {(!Array.isArray(favorites) || favorites.length === 0)
                ? 'Start saving articles to see them here'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {(!Array.isArray(favorites) || favorites.length === 0) && (
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Browse News
              </a>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default FavoritesPage;
