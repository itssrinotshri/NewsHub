import React, { useState } from 'react';
import { 
  Heart, 
  TrendingUp, 
  ExternalLink, 
  Clock, 
  User,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Sparkles,
  Landmark,
  Coins,
  Building2,
  Cpu,
  Leaf
} from 'lucide-react';
import { 
  fetchArticleIntelligence
} from '../services/api';

const NewsCard = ({ article, onAddToFavorites, onRemoveFromFavorites, isFavorite, showAI = true }) => {
  const [intelligence, setIntelligence] = useState(null);
  const [showAIDrawer, setShowAIDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'bias' | 'impact' | 'insights'
  const [summaryType, setSummaryType] = useState('one_minute'); // 'one_minute' | 'tldr' | 'eli10'
  const [loading, setLoading] = useState({
    intelligence: false,
    favorite: false
  });

  const handleFetchIntelligence = async () => {
    if (intelligence) return; // already loaded
    setLoading(prev => ({ ...prev, intelligence: true }));
    try {
      const response = await fetchArticleIntelligence(
        article.title,
        article.description || '',
        article.content || article.description || ''
      );
      if (response.status === 'success') {
        setIntelligence(response.intelligence);
      }
    } catch (error) {
      console.error('Error fetching article intelligence:', error);
    } finally {
      setLoading(prev => ({ ...prev, intelligence: false }));
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
        return <ThumbsUp className="h-3 w-3" />;
      case 'NEGATIVE':
        return <ThumbsDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
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

  const renderSummaryTab = () => {
    if (!intelligence || !intelligence.summary) return null;
    return (
      <div className="space-y-3 animate-fadeIn">
        {/* Sub-tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg w-fit">
          <button
            onClick={() => setSummaryType('one_minute')}
            className={`px-3 py-1 text-2xs font-semibold rounded-md transition-all ${
              summaryType === 'one_minute'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            1-Min Summary
          </button>
          <button
            onClick={() => setSummaryType('tldr')}
            className={`px-3 py-1 text-2xs font-semibold rounded-md transition-all ${
              summaryType === 'tldr'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            TL;DR Bullet Points
          </button>
          <button
            onClick={() => setSummaryType('eli10')}
            className={`px-3 py-1 text-2xs font-semibold rounded-md transition-all ${
              summaryType === 'eli10'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            ELI10
          </button>
        </div>

        {/* Content */}
        <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-xs">
          {summaryType === 'one_minute' && (
            <p>{intelligence.summary.one_minute}</p>
          )}
          {summaryType === 'tldr' && (
            <ul className="list-disc pl-4 space-y-1.5">
              {intelligence.summary.tldr.map((bullet, idx) => (
                <li key={idx} className="marker:text-indigo-500">{bullet}</li>
              ))}
            </ul>
          )}
          {summaryType === 'eli10' && (
            <div className="bg-amber-50/70 border border-amber-100/70 dark:bg-amber-950/20 dark:border-amber-900/30 p-3 rounded-lg text-amber-900 dark:text-amber-300 italic">
              👶 {intelligence.summary.eli10}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBiasTab = () => {
    if (!intelligence || !intelligence.political_analysis) return null;
    const leaningColors = {
      'Left': 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30',
      'Center-Left': 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-100 dark:border-sky-900/30',
      'Center': 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-100 dark:border-purple-900/30',
      'Center-Right': 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-100 dark:border-amber-900/30',
      'Right': 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-100 dark:border-red-900/30'
    };
    
    const currentLeaning = intelligence.political_analysis.leaning;
    const sentimentLabel = intelligence.sentiment?.label || 'NEUTRAL';
    const sentimentScore = intelligence.sentiment?.score || 0.5;

    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700/50">
            <div className="text-3xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Sentiment</div>
            <div className="flex items-center space-x-1.5">
              <span className={`badge ${getSentimentBadgeClass(sentimentLabel)}`}>
                {getSentimentIcon(sentimentLabel)}
                <span className="ml-1 text-2xs font-semibold">{sentimentLabel}</span>
              </span>
              <span className="text-3xs text-gray-500 font-medium">
                {Math.round(sentimentScore * 100)}% conf
              </span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700/50">
            <div className="text-3xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Political Leaning</div>
            <span className={`text-2xs px-2 py-0.5 rounded-full font-bold ${leaningColors[currentLeaning] || 'bg-gray-100 text-gray-800'}`}>
              ⚖️ {currentLeaning}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-3xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Bias Analysis</div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50/50 dark:bg-gray-800/20 p-2.5 rounded-lg border border-gray-100/50 dark:border-gray-700/30">
            {intelligence.political_analysis.bias_description}
          </p>
        </div>
      </div>
    );
  };

  const renderImpactTab = () => {
    if (!intelligence || !intelligence.domain_impact) return null;
    const domains = [
      { key: 'politics', label: 'Politics', icon: Landmark, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30' },
      { key: 'economy', label: 'Economy', icon: Coins, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' },
      { key: 'business', label: 'Business', icon: Building2, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30' },
      { key: 'technology', label: 'Technology', icon: Cpu, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30' },
      { key: 'environment', label: 'Environment', icon: Leaf, color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30' }
    ];

    const getImpactBadgeClass = (impactText) => {
      const lower = impactText.toLowerCase();
      if (lower.startsWith('high')) return 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30';
      if (lower.startsWith('medium')) return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30';
      if (lower.startsWith('low')) return 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30';
      return 'bg-gray-50 text-gray-700 dark:bg-gray-950/20 dark:text-gray-400 border border-gray-100 dark:border-gray-900/30';
    };

    return (
      <div className="space-y-3.5 animate-fadeIn">
        {/* Scrollable list of impact cards */}
        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
          {domains.map(domain => {
            const impactText = intelligence.domain_impact[domain.key] || 'None - No significant impact.';
            const dashIdx = impactText.indexOf(' - ');
            const level = dashIdx !== -1 ? impactText.substring(0, dashIdx) : 'Impact';
            const detail = dashIdx !== -1 ? impactText.substring(dashIdx + 3) : impactText;
            const Icon = domain.icon;

            return (
              <div key={domain.key} className="flex items-start space-x-2.5 bg-gray-50 dark:bg-gray-800/30 p-2 rounded-lg border border-gray-100 dark:border-gray-700/30">
                <div className={`p-1.5 rounded-md ${domain.color} shrink-0`}>
                   <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-2xs font-bold text-gray-900 dark:text-gray-100">{domain.label}</span>
                    <span className={`text-3xs px-2 py-0.5 rounded-full font-bold ${getImpactBadgeClass(level)}`}>
                      {level}
                    </span>
                  </div>
                  <p className="text-2xs text-gray-500 dark:text-gray-400 leading-snug">{detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Future Outlook */}
        {intelligence.domain_impact.future_outlook && (
          <div className="bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-100/50 dark:border-indigo-900/30 p-2.5 rounded-lg">
            <div className="text-3xs font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-wider mb-1 flex items-center">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              Future Outlook Prediction
            </div>
            <p className="text-xs text-indigo-800 dark:text-indigo-300 italic leading-relaxed">
              "{intelligence.domain_impact.future_outlook}"
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderInsightsTab = () => {
    if (!intelligence || !intelligence.key_insights) return null;
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="space-y-2">
          <div className="text-3xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Key Takeaways</div>
          <ul className="space-y-1.5">
            {intelligence.key_insights.map((insight, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-xs text-gray-700 dark:text-gray-300 leading-snug">
                <span className="text-indigo-500 mt-0.5 shrink-0">💡</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tags */}
        {intelligence.metadata?.tags && (
          <div className="space-y-1.5 pt-2.5 border-t border-gray-100 dark:border-gray-800">
            <div className="text-3xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Generated Tags</div>
            <div className="flex flex-wrap gap-1 items-center">
              {intelligence.metadata.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-850 dark:text-gray-350 text-3xs font-semibold border border-gray-200 dark:border-gray-705"
                >
                  #{tag}
                </span>
              ))}
              {intelligence.metadata.reading_difficulty && (
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 text-3xs font-bold border border-indigo-100 dark:border-indigo-900/30 ml-auto">
                  📖 {intelligence.metadata.reading_difficulty} Read
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
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
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {article.title}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <User className="h-4 w-4" />
            <span className="font-medium">{article.source.name}</span>
            <Clock className="h-4 w-4 ml-2" />
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {article.description}
        </p>

        {/* Expanded AI Drawer */}
        {showAI && showAIDrawer && (
          <div className="mt-4 pt-4 border-t border-gray-150 dark:border-gray-700/60 min-h-[180px]">
            {loading.intelligence ? (
              <div className="space-y-4 animate-pulse py-2">
                <div className="flex space-x-1.5">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-11/12"></div>
                  <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                </div>
              </div>
            ) : intelligence ? (
              <div className="flex flex-col space-y-4">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto scrollbar-hide">
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`px-3 py-1.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                      activeTab === 'summary'
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                    }`}
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => setActiveTab('bias')}
                    className={`px-3 py-1.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                      activeTab === 'bias'
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                    }`}
                  >
                    Bias & Sentiment
                  </button>
                  <button
                    onClick={() => setActiveTab('impact')}
                    className={`px-3 py-1.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                      activeTab === 'impact'
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                    }`}
                  >
                    Domain Impacts
                  </button>
                  <button
                    onClick={() => setActiveTab('insights')}
                    className={`px-3 py-1.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                      activeTab === 'insights'
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                    }`}
                  >
                    Insights & Tags
                  </button>
                </div>

                {/* Tab content area */}
                <div className="min-h-[140px]">
                  {activeTab === 'summary' && renderSummaryTab()}
                  {activeTab === 'bias' && renderBiasTab()}
                  {activeTab === 'impact' && renderImpactTab()}
                  {activeTab === 'insights' && renderInsightsTab()}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 text-xs">
                ⚠️ Failed to load AI Analysis. Check backend connectivity.
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-250 dark:border-gray-700/60 mt-4">
          {showAI && (
            <button
              onClick={() => {
                setShowAIDrawer(!showAIDrawer);
                if (!showAIDrawer && !intelligence) {
                  handleFetchIntelligence();
                }
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                showAIDrawer
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100 dark:shadow-none'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300'
              }`}
            >
              <Sparkles className={`h-3.5 w-3.5 ${showAIDrawer ? 'animate-pulse' : ''}`} />
              <span>{showAIDrawer ? 'Close AI Analytics' : '✨ AI Intelligence'}</span>
            </button>
          )}

          {/* Read More Button */}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-700 dark:hover:bg-indigo-600 rounded-lg text-xs font-semibold transition-colors ml-auto shadow-sm"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Read More</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;