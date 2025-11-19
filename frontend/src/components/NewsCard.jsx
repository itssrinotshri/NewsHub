import React, { useState } from 'react';
import { 
  Heart, 
  Brain, 
  TrendingUp, 
  ExternalLink, 
  Clock, 
  User,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Bookmark
} from 'lucide-react';
import { 
  summarizeArticle, 
  analyzeSentiment, 
  getRecommendations,
  addToFavorites,
  removeFromFavorites 
} from '../services/api';

const NewsCard = ({ article, onAddToFavorites, onRemoveFromFavorites, isFavorite, showAI = true }) => {
  const [summary, setSummary] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState({
    summary: false,
    sentiment: false,
    recommendations: false,
    favorite: false
  });

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

  const handleGetRecommendations = async () => {
    setLoading(prev => ({ ...prev, recommendations: true }));
    try {
      const response = await getRecommendations(article);
      if (response.status === 'success') {
        setRecommendations(response.recommendations);
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
    } finally {
      setLoading(prev => ({ ...prev, recommendations: false }));
    }
  };

  const handleToggleFavorite = () => {
    if (isFavorite) {
      onRemoveFromFavorites(article);
    } else {
      onAddToFavorites(article);
    }
  };

  const getSentimentIcon = (label) => {
    switch (label) {
      case 'POSITIVE':
        return <ThumbsUp className="h-4 w-4" />;
      case 'NEGATIVE':
        return <ThumbsDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getSentimentBadgeClass = (label) => {
    switch (label) {
      case 'POSITIVE':
        return 'badge-positive';
      case 'NEGATIVE':
        return 'badge-negative';
      default:
        return 'badge-neutral';
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

  return (
    <div className="news-card group">
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
          <div className="absolute top-2 right-2">
            <button
              onClick={handleToggleFavorite}
              disabled={loading.favorite}
              className={`p-2 rounded-full transition-colors ${
                isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="p-6">
        {/* Title and Source */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {article.title}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <User className="h-4 w-4" />
            <span className="font-medium">{article.source.name}</span>
            <Clock className="h-4 w-4 ml-2" />
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {article.description}
        </p>

        {/* AI Features Section */}
        {showAI && (
          <div className="space-y-3 mb-4">
            {/* Summary */}
            {summary && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                  <Brain className="h-4 w-4 mr-1" />
                  AI Summary
                </h4>
                <p className="text-sm text-blue-800">{summary}</p>
              </div>
            )}

            {/* Sentiment Analysis */}
            {sentiment && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Sentiment Analysis</h4>
                <div className="flex items-center space-x-2">
                  <span className={`badge ${getSentimentBadgeClass(sentiment.label)}`}>
                    {getSentimentIcon(sentiment.label)}
                    <span className="ml-1">{sentiment.label}</span>
                  </span>
                  <span className="text-sm text-gray-600">
                    {Math.round(sentiment.score * 100)}% confidence
                  </span>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-green-900 mb-2">Similar Articles</h4>
                <div className="space-y-2">
                  {recommendations.slice(0, 2).map((rec, index) => (
                    <div key={index} className="text-sm">
                      <a
                        href={rec.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-800 hover:text-green-900 underline line-clamp-1"
                      >
                        {rec.title}
                      </a>
                      <span className="text-green-600 ml-2">
                        ({Math.round(rec.similarity_score * 100)}% similar)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          {/* AI Buttons */}
          {showAI && (
            <>
              <button
                onClick={handleSummarize}
                disabled={loading.summary}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Brain className="h-4 w-4" />
                <span>{loading.summary ? 'Analyzing...' : 'Summarize'}</span>
              </button>

              <button
                onClick={handleAnalyzeSentiment}
                disabled={loading.sentiment}
                className="flex items-center space-x-1 px-3 py-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <TrendingUp className="h-4 w-4" />
                <span>{loading.sentiment ? 'Analyzing...' : 'Sentiment'}</span>
              </button>

              <button
                onClick={handleGetRecommendations}
                disabled={loading.recommendations}
                className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <TrendingUp className="h-4 w-4" />
                <span>{loading.recommendations ? 'Finding...' : 'Similar'}</span>
              </button>
            </>
          )}

          {/* Read More Button */}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg text-sm font-medium transition-colors ml-auto"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Read More</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;