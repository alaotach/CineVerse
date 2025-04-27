import axios from 'axios';
import { authService } from '../services/authService';
import { logger } from '../utils/logger';

// Update the API URL to use port 8080
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000, // 15 seconds timeout
});

// Track API health status
let apiHealthy = true;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

// Add a request interceptor to handle authentication
apiClient.interceptors.request.use(
  config => {
    // Get the current user token
    const user = authService.getCurrentUser();
    
    // If token exists, add it to the request headers
    if (user?.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    
    // Log outgoing requests in development
    if (import.meta.env.DEV) {
      logger.debug(`API Request to ${config.baseURL}: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  error => {
    logger.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  response => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      logger.debug(`API Response: ${response.status} ${response.config.url}`);
    }
    
    // Mark API as healthy on successful response
    apiHealthy = true;
    
    return response;
  },
  error => {
    // Handle error responses
    if (error.response) {
      const { status, data } = error.response;
      
      // Log detailed error information
      logger.error(`HTTP Error ${status}`);
      
      // Handle 401 Unauthorized - Token expired or invalid
      if (status === 401) {
        logger.warn('Authentication failed. Logging out...');
        authService.logout();
        window.location.href = '/login';
      }
      
      // Handle 403 Forbidden - User doesn't have permission
      if (status === 403) {
        logger.warn('Permission denied for this operation');
      }
      
      // Handle 404 Not Found - Resource doesn't exist
      if (status === 404) {
        logger.warn(`Resource not found: ${error.config.url}`);
      }

      // Handle 405 Method Not Allowed - API method not supported
      if (status === 405) {
        logger.warn(`Method ${error.config.method?.toUpperCase()} not allowed for ${error.config.url}`);
      }
      
      // Handle 500 Internal Server Error - Server issues
      if (status >= 500) {
        logger.error(`Server error ${status}: ${data?.message || 'Unknown server error'}`);
        
        // Mark API as unhealthy
        apiHealthy = false;
        
        // Record timestamp of health state change
        lastHealthCheck = Date.now();
      }
    } else if (error.request) {
      // The request was made but no response received
      logger.error('No response received from server', error.request);
      
      // Mark API as unhealthy
      apiHealthy = false;
      lastHealthCheck = Date.now();
      
      // Store information that can help with fallback strategies
      error.noResponse = true;
    } else {
      // Error setting up the request
      logger.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Setup API health check function
const checkAPIHealth = async () => {
  try {
    // Only perform health check if API is marked unhealthy or it's been a while
    if (!apiHealthy || (Date.now() - lastHealthCheck > HEALTH_CHECK_INTERVAL)) {
      lastHealthCheck = Date.now();
      const response = await apiClient.get('/health');
      apiHealthy = true;
      return { status: 'healthy', data: response.data };
    }
    return { status: 'healthy', cached: true };
  } catch (error) {
    logger.error('API Health Check Failed:', error);
    apiHealthy = false;
    return { status: 'healthy', error };
  }
};

// Add the function that's being imported in BackendStatusBanner.tsx
const checkApiAvailability = async () => {
  try {
    // Try to access the status endpoint, which should be lightweight and always available
    const healthCheck = await checkAPIHealth();
    
    return {
      available: apiHealthy,
      status: healthCheck.status,
      timestamp: new Date(),
      details: healthCheck
    };
  } catch (error) {
    logger.warn('Backend API unavailable:', error);
    apiHealthy = false;
    return {
      available: false,
      error: error,
      timestamp: new Date()
    };
  }
};

export { apiClient, checkAPIHealth, checkApiAvailability, apiHealthy };
