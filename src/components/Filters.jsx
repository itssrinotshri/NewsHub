import React, { useState } from 'react';
import { Filter, Globe, Tag, Search, X } from 'lucide-react';

const Filters = ({ onFiltersChange, currentFilters }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    country: currentFilters?.country || 'us',
    category: currentFilters?.category || 'general',
    keyword: currentFilters?.keyword || ''
  });

  // News categories - expanded with more specific options
  const newsCategories = [
    { value: 'general', label: 'General News', icon: '📰' },
    { value: 'business', label: 'Business & Economy', icon: '💼' },
    { value: 'technology', label: 'Technology', icon: '💻' },
    { value: 'science', label: 'Science & Research', icon: '🔬' },
    { value: 'health', label: 'Health & Medicine', icon: '🏥' },
    { value: 'sports', label: 'Sports', icon: '⚽' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { value: 'politics', label: 'Politics', icon: '🏛️' },
    { value: 'world', label: 'World News', icon: '🌍' },
    { value: 'environment', label: 'Environment', icon: '🌱' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'food', label: 'Food & Lifestyle', icon: '🍽️' }
  ];

  // Country options - expanded with many more countries
  const countries = [
    { value: 'us', label: 'United States', flag: '🇺🇸' },
    { value: 'in', label: 'India', flag: '🇮🇳' },
    { value: 'gb', label: 'United Kingdom', flag: '🇬🇧' },
    { value: 'ca', label: 'Canada', flag: '🇨🇦' },
    { value: 'au', label: 'Australia', flag: '🇦🇺' },
    { value: 'de', label: 'Germany', flag: '🇩🇪' },
    { value: 'fr', label: 'France', flag: '🇫🇷' },
    { value: 'jp', label: 'Japan', flag: '🇯🇵' },
    { value: 'cn', label: 'China', flag: '🇨🇳' },
    { value: 'br', label: 'Brazil', flag: '🇧🇷' },
    { value: 'ru', label: 'Russia', flag: '🇷🇺' },
    { value: 'kr', label: 'South Korea', flag: '🇰🇷' },
    { value: 'it', label: 'Italy', flag: '🇮🇹' },
    { value: 'es', label: 'Spain', flag: '🇪🇸' },
    { value: 'mx', label: 'Mexico', flag: '🇲🇽' },
    { value: 'ar', label: 'Argentina', flag: '🇦🇷' },
    { value: 'za', label: 'South Africa', flag: '🇿🇦' },
    { value: 'ng', label: 'Nigeria', flag: '🇳🇬' },
    { value: 'eg', label: 'Egypt', flag: '🇪🇬' },
    { value: 'sa', label: 'Saudi Arabia', flag: '🇸🇦' },
    { value: 'ae', label: 'UAE', flag: '🇦🇪' },
    { value: 'tr', label: 'Turkey', flag: '🇹🇷' },
    { value: 'id', label: 'Indonesia', flag: '🇮🇩' },
    { value: 'th', label: 'Thailand', flag: '🇹🇭' },
    { value: 'sg', label: 'Singapore', flag: '🇸🇬' },
    { value: 'my', label: 'Malaysia', flag: '🇲🇾' },
    { value: 'ph', label: 'Philippines', flag: '🇵🇭' },
    { value: 'vn', label: 'Vietnam', flag: '🇻🇳' },
    { value: 'nz', label: 'New Zealand', flag: '🇳🇿' },
    { value: 'nl', label: 'Netherlands', flag: '🇳🇱' },
    { value: 'be', label: 'Belgium', flag: '🇧🇪' },
    { value: 'ch', label: 'Switzerland', flag: '🇨🇭' },
    { value: 'at', label: 'Austria', flag: '🇦🇹' },
    { value: 'se', label: 'Sweden', flag: '🇸🇪' },
    { value: 'no', label: 'Norway', flag: '🇳🇴' },
    { value: 'dk', label: 'Denmark', flag: '🇩🇰' },
    { value: 'fi', label: 'Finland', flag: '🇫🇮' },
    { value: 'pl', label: 'Poland', flag: '🇵🇱' },
    { value: 'cz', label: 'Czech Republic', flag: '🇨🇿' },
    { value: 'hu', label: 'Hungary', flag: '🇭🇺' },
    { value: 'ro', label: 'Romania', flag: '🇷🇴' },
    { value: 'bg', label: 'Bulgaria', flag: '🇧🇬' },
    { value: 'gr', label: 'Greece', flag: '🇬🇷' },
    { value: 'pt', label: 'Portugal', flag: '🇵🇹' },
    { value: 'ie', label: 'Ireland', flag: '🇮🇪' },
    { value: 'is', label: 'Iceland', flag: '🇮🇸' },
    { value: 'lu', label: 'Luxembourg', flag: '🇱🇺' },
    { value: 'mt', label: 'Malta', flag: '🇲🇹' },
    { value: 'cy', label: 'Cyprus', flag: '🇨🇾' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    // Don't trigger API call immediately - wait for Apply button
  };

  const handleKeywordChange = (e) => {
    const keyword = e.target.value;
    const newFilters = { ...filters, keyword };
    setFilters(newFilters);
    // Don't trigger API call immediately - wait for Apply button
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  const applyFilters = () => {
    onFiltersChange(filters);
  };

  const clearFilters = () => {
    const defaultFilters = { country: 'us', category: 'general', keyword: '' };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = filters.country !== 'us' || filters.category !== 'general' || filters.keyword;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search for news..."
          value={filters.keyword}
          onChange={handleKeywordChange}
          onKeyPress={handleKeyPress}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors font-medium"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {showFilters ? (
            <X className="h-4 w-4" />
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:text-primary-700 transition-colors font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="space-y-4 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Country Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="inline h-4 w-4 mr-1" />
                Country
              </label>
              <select
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {countries.map(country => (
                  <option key={country.value} value={country.value}>
                    {country.flag} {country.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="inline h-4 w-4 mr-1" />
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {newsCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Apply Filters Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={applyFilters}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Filter className="h-5 w-5" />
              <span>Apply Filters</span>
            </button>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {filters.country !== 'us' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                    {countries.find(c => c.value === filters.country)?.flag} {countries.find(c => c.value === filters.country)?.label}
                    <button
                      onClick={() => handleFilterChange('country', 'us')}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.category !== 'general' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                    {newsCategories.find(c => c.value === filters.category)?.icon} {newsCategories.find(c => c.value === filters.category)?.label}
                    <button
                      onClick={() => handleFilterChange('category', 'general')}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.keyword && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                    "{filters.keyword}"
                    <button
                      onClick={() => handleFilterChange('keyword', '')}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Filters;