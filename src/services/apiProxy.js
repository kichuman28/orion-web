/**
 * API Proxy Helper
 * Provides utility functions to handle proxying API requests to avoid CORS issues
 */

/**
 * Get the appropriate base URL for API calls
 * In production, this should be configured to use the actual API endpoint
 * In development, this should point to a proxy server or use a relative URL
 */
export const getApiBaseUrl = () => {
  // Check if running in development mode
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                        window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
  
  if (isDevelopment) {
    // In development, we can use a relative URL which will be handled by the dev server
    // if it's configured with a proxy, or use a proxy service
    return '/api';
  } else {
    // In production, use the actual API URL
    return 'http://192.168.40.5:8000';
  }
};

/**
 * Makes an API request with appropriate CORS handling
 * @param {string} endpoint - API endpoint path (without base URL)
 * @param {Object} options - Fetch API options
 * @returns {Promise<Object>} API response as JSON
 */
export const apiRequest = async (endpoint, options = {}) => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/${endpoint.replace(/^\//, '')}`;
  
  // Set default headers
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

export default {
  getApiBaseUrl,
  apiRequest
}; 