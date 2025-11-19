import axios from 'axios';

// Create axios instance with base URL
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for ML operations
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    console.log('Full URL:', `${config.baseURL}${config.url}`);
    console.log('Request params:', config.params);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.data);
    return response.data;
  },
  (error) => {
    console.error('Response error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.detail || 'Server error occurred');
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check if the backend is running.');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

// News API endpoints
export const fetchNews = async (filters = {}) => {
  try {
    const { country = 'us', category = 'general', keyword = '' } = filters;
    const params = { country, category };
    if (keyword) params.q = keyword;
    
    console.log('Fetching news with params:', params);
    const response = await api.get('/news', { params });
    console.log('News API response:', response);
    
    // Handle the response format from your backend
    if (response && response.articles) {
      return response.articles;
    } else if (Array.isArray(response)) {
      return response;
    } else {
      console.warn('Unexpected response format:', response);
      return [];
    }
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

export const fetchTrendingNews = async (country = 'world') => {
  try {
    console.log('Fetching trending news for country:', country);
    const response = await api.get('/news/trending', { params: { country } });
    console.log('Trending API response:', response);
    
    // Handle the response format from your backend
    if (response && response.articles) {
      return response.articles;
    } else if (Array.isArray(response)) {
      return response;
    } else {
      console.warn('Unexpected trending response format:', response);
      return [];
    }
  } catch (error) {
    console.error('Error fetching trending news:', error);
    throw error;
  }
};

export const fetchRecommendations = async (articleUrl) => {
  try {
    return await api.post('/news/recommend', {
      article_url: articleUrl,
      n_recommendations: 6
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};

// AI/ML API endpoints
export const summarizeArticle = async (text, maxLength = 150, minLength = 30) => {
  try {
    return await api.post('/news/summarize', {
      text,
      max_length: maxLength,
      min_length: minLength
    });
  } catch (error) {
    console.error('Error summarizing article:', error);
    throw error;
  }
};

export const analyzeSentiment = async (text) => {
  try {
    return await api.post('/news/sentiment', {
      text
    });
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw error;
  }
};

export const getRecommendations = async (article, nRecommendations = 3) => {
  try {
    return await api.post('/news/recommend', {
      article,
      n_recommendations: nRecommendations
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
};

// User favorites API endpoints
export const getFavorites = async () => {
  try {
    const response = await api.get('/user/favorites');
    // Backend returns { status, favorites, count } - extract the favorites array
    if (response && Array.isArray(response.favorites)) {
      return response.favorites;
    } else if (Array.isArray(response)) {
      return response;
    } else {
      console.warn('Unexpected favorites response format:', response);
      return [];
    }
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
};

export const addToFavorites = async (article) => {
  try {
    return await api.post('/user/favorites', {
      article
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

export const removeFromFavorites = async (url) => {
  try {
    return await api.delete('/user/favorites', {
      params: { url }
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

// Health check endpoint
export const healthCheck = async () => {
  try {
    return await api.get('/');
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

export default api;