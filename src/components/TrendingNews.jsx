import React, { useState, useEffect } from 'react';
import { TrendingUp, ExternalLink, Clock, User } from 'lucide-react';
import { getTrendingNews } from '../services/api';

const TrendingNews = ({ country = 'us' }) => {
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
        <div className="flex items-center mb-4">
          <TrendingUp className="h-5 w-5 text-red-500 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">🔥 Trending Now</h2>
        </div>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-shrink-0 w-80 bg-gray-200 rounded-lg animate-pulse">
              <div className="h-48 bg-gray-300 rounded-t-lg"></div>
              <div className="p-4">
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
        <div className="flex items-center mb-4">
          <TrendingUp className="h-5 w-5 text-red-500 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">🔥 Trending Now</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={loadTrendingNews}
            className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
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
      <div className="flex items-center mb-4">
        <TrendingUp className="h-5 w-5 text-red-500 mr-2" />
        <h2 className="text-xl font-bold text-gray-900">🔥 Trending Now</h2>
        <span className="ml-2 text-sm text-gray-500">
          {country.toUpperCase()}
        </span>
      </div>
      
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {trendingArticles.map((article, index) => (
          <div 
            key={`${article.url}-${index}`}
            className="flex-shrink-0 w-80 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 group"
          >
            {/* Article Image */}
            {article.urlToImage && (
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="absolute top-2 left-2">
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    #{index + 1}
                  </span>
                </div>
              </div>
            )}

            {/* Article Content */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                {article.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {article.description}
              </p>

              {/* Article Meta */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <div className="flex items-center space-x-2">
                  <User className="h-3 w-3" />
                  <span>{article.source?.name || 'Unknown Source'}</span>
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

      {/* Scroll Indicator */}
      <div className="text-center mt-2">
        <span className="text-xs text-gray-400">
          ← Scroll to see more trending news →
        </span>
      </div>
    </div>
  );
};

export default TrendingNews;