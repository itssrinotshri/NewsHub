import React, { useState } from 'react';
import { Filter, Search, Globe, RefreshCw } from 'lucide-react';

const FilterBar = ({ onFiltersChange, onApplyFilters, currentFilters, loading }) => {
  const [filters, setFilters] = useState(currentFilters);

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
    { value: 'it', label: 'Italy', flag: '🇮🇹' },
    { value: 'es', label: 'Spain', flag: '🇪🇸' },
    { value: 'jp', label: 'Japan', flag: '🇯🇵' },
    { value: 'kr', label: 'South Korea', flag: '🇰🇷' },
    { value: 'cn', label: 'China', flag: '🇨🇳' },
    { value: 'ru', label: 'Russia', flag: '🇷🇺' },
    { value: 'br', label: 'Brazil', flag: '🇧🇷' },
    { value: 'mx', label: 'Mexico', flag: '🇲🇽' },
    { value: 'ar', label: 'Argentina', flag: '🇦🇷' },
    { value: 'za', label: 'South Africa', flag: '🇿🇦' },
    { value: 'ng', label: 'Nigeria', flag: '🇳🇬' },
    { value: 'eg', label: 'Egypt', flag: '🇪🇬' },
    { value: 'sa', label: 'Saudi Arabia', flag: '🇸🇦' },
    { value: 'ae', label: 'UAE', flag: '🇦🇪' },
    { value: 'il', label: 'Israel', flag: '🇮🇱' },
    { value: 'tr', label: 'Turkey', flag: '🇹🇷' },
    { value: 'pl', label: 'Poland', flag: '🇵🇱' },
    { value: 'nl', label: 'Netherlands', flag: '🇳🇱' },
    { value: 'se', label: 'Sweden', flag: '🇸🇪' },
    { value: 'no', label: 'Norway', flag: '🇳🇴' },
    { value: 'dk', label: 'Denmark', flag: '🇩🇰' },
    { value: 'fi', label: 'Finland', flag: '🇫🇮' },
    { value: 'ie', label: 'Ireland', flag: '🇮🇪' },
    { value: 'pt', label: 'Portugal', flag: '🇵🇹' },
    { value: 'gr', label: 'Greece', flag: '🇬🇷' },
    { value: 'cz', label: 'Czech Republic', flag: '🇨🇿' },
    { value: 'hu', label: 'Hungary', flag: '🇭🇺' },
    { value: 'ro', label: 'Romania', flag: '🇷🇴' },
    { value: 'bg', label: 'Bulgaria', flag: '🇧🇬' },
    { value: 'hr', label: 'Croatia', flag: '🇭🇷' },
    { value: 'si', label: 'Slovenia', flag: '🇸🇮' },
    { value: 'sk', label: 'Slovakia', flag: '🇸🇰' },
    { value: 'lt', label: 'Lithuania', flag: '🇱🇹' },
    { value: 'lv', label: 'Latvia', flag: '🇱🇻' },
    { value: 'ee', label: 'Estonia', flag: '🇪🇪' },
    { value: 'th', label: 'Thailand', flag: '🇹🇭' },
    { value: 'sg', label: 'Singapore', flag: '🇸🇬' },
    { value: 'my', label: 'Malaysia', flag: '🇲🇾' },
    { value: 'id', label: 'Indonesia', flag: '🇮🇩' },
    { value: 'ph', label: 'Philippines', flag: '🇵🇭' },
    { value: 'vn', label: 'Vietnam', flag: '🇻🇳' },
    { value: 'tw', label: 'Taiwan', flag: '🇹🇼' },
    { value: 'hk', label: 'Hong Kong', flag: '🇭🇰' },
    { value: 'ua', label: 'Ukraine', flag: '🇺🇦' },
    { value: 'by', label: 'Belarus', flag: '🇧🇾' },
    { value: 'kz', label: 'Kazakhstan', flag: '🇰🇿' },
    { value: 'uz', label: 'Uzbekistan', flag: '🇺🇿' },
    { value: 'cy', label: 'Cyprus', flag: '🇨🇾' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleKeywordChange = (e) => {
    const keyword = e.target.value;
    const newFilters = { ...filters, keyword };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onApplyFilters();
    }
  };

  const applyFilters = () => {
    onApplyFilters();
  };

  const resetFilters = () => {
    const defaultFilters = {
      country: 'us',
      category: 'general',
      keyword: ''
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center mb-6">
        <Filter className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Filter News
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Country Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Globe className="inline h-4 w-4 mr-1" />
            Country
          </label>
          <select
            value={filters.country}
            onChange={(e) => handleFilterChange('country', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {countries.map((country) => (
              <option key={country.value} value={country.value}>
                {country.flag} {country.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {newsCategories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.icon} {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Keyword Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Search className="inline h-4 w-4 mr-1" />
            Keyword
          </label>
          <input
            type="text"
            placeholder="Search for specific topics..."
            value={filters.keyword}
            onChange={handleKeywordChange}
            onKeyPress={handleKeyPress}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={applyFilters}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Filter className="h-4 w-4" />
            )}
            <span>{loading ? 'Loading...' : 'Apply Filters'}</span>
          </button>
          
          <button
            onClick={resetFilters}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Quick Filter Tags */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Quick filters:</span>
        {[
          { country: 'us', category: 'technology', label: 'US Tech' },
          { country: 'in', category: 'sports', label: 'India Sports' },
          { country: 'gb', category: 'business', label: 'UK Business' },
          { country: 'de', category: 'science', label: 'German Science' },
          { country: 'jp', category: 'entertainment', label: 'Japan Entertainment' }
        ].map((quickFilter, index) => (
          <button
            key={index}
            onClick={() => {
              const newFilters = {
                country: quickFilter.country,
                category: quickFilter.category,
                keyword: ''
              };
              setFilters(newFilters);
              onFiltersChange(newFilters);
            }}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            {quickFilter.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
