import React, { useState, useEffect } from 'react';
import { Heart, ExternalLink, Clock, User, Trash2, Bookmark } from 'lucide-react';
import { getFavorites, removeFromFavorites } from '../services/api';
import NewsCard from './NewsCard';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await getFavorites();
      if (response.status === 'success') {
        setFavorites(response.favorites);
      } else {
        setError('Failed to load favorites');
      }
    } catch (err) {
      setError('Error loading favorites: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (url) => {
    try {
      await removeFromFavorites(url);
      setFavorites(prev => prev.filter(fav => fav.url !== url));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your favorites...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">❤️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Favorites</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={loadFavorites}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Heart className="h-8 w-8 text-red-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
          </div>
          <p className="text-gray-600">
            {favorites.length} saved article{favorites.length !== 1 ? 's' : ''}
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-6">
              Start saving articles you love by clicking the heart icon on any news card.
            </p>
            <a
              href="#home"
              className="btn-primary"
            >
              Browse News
            </a>
          </div>
        ) : (
          <div className="news-grid">
            {favorites.map((article, index) => (
              <div key={`${article.url}-${index}`} className="relative">
                <NewsCard
                  article={article}
                  onAddToFavorites={() => {}}
                  onRemoveFromFavorites={handleRemoveFavorite}
                  isFavorite={true}
                  showAI={false}
                />
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFavorite(article.url)}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                  title="Remove from favorites"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
