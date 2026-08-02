import React, { useState, useEffect } from 'react';
import { TrendingUp, ExternalLink, Clock, User, Flame } from 'lucide-react';
import { getTrendingNews } from '../services/api';

const Trending = ({ country = 'us' }) => {
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTrendingNews();
  }, [country]);

  const loadTrendingNews = async () => {
    try {
      setLoading(true);
      const response = await getTrendingNews(country);
      if (response.status === 'success') {
        setTrendingArticles(response.articles);
      } else {
        setError('Failed to load trending news');
      }
    } catch (err) {
      setError('Error loading trending news: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <Flame className="h-6 w-6 text-red-500 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">🔥 Trending Now</h2>
        </div>
        <div className="trending-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="news-card animate-pulse">
              <div className="h-48 bg-gray-300 rounded-t-lg"></div>
              <div className="p-6">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <Flame className="h-6 w-6 text-red-500 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">🔥 Trending Now</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 mb-4">{error}</p>
          <button 
            onClick={loadTrendingNews}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (trendingArticles.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Flame className="h-6 w-6 text-red-500 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">🔥 Trending Now</h2>
          <span className="ml-3 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {country.toUpperCase()}
          </span>
        </div>
        <button 
          onClick={loadTrendingNews}
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          Refresh
        </button>
      </div>
      
      <div className="trending-grid">
        {trendingArticles.map((article, index) => (
          <div 
            key={`${article.url}-${index}`}
            className="news-card group relative"
          >
            {/* Trending Badge */}
            <div className="absolute top-3 left-3 z-10">
              <span className="badge-trending">
                #{index + 1} Trending
              </span>
            </div>

            {/* Article Image */}
            {article.urlToImage && (
              <div className="relative overflow-hidden">
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Article Content */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                {article.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {article.description}
              </p>

              {/* Article Meta */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex items-center space-x-2">
                  <User className="h-3 w-3" />
                  <span className="font-medium">{article.source?.name || 'Unknown Source'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(article.publishedAt)}</span>
                </div>
              </div>

              {/* Read More Button */}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
              >
                <span>Read Full Article</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Trending;
