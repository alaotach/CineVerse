// API Configuration file

// Determine if the environment is development
const isDevelopment = import.meta.env.MODE === 'development' || import.meta.env.DEV;

// Base URL for API calls
let apiBaseUrl = isDevelopment 
  ? '/api'  // During development, proxied through Vite
  : import.meta.env.VITE_API_BASE_URL || '/api';  // In production, use env variable

// Log the configuration for debugging
console.log(`API configuration: mode=${import.meta.env.MODE}, apiBaseUrl=${apiBaseUrl}`);

export const API_BASE_URL = apiBaseUrl;

// Other API-related constants
export const API_TIMEOUT = 15000; // 15 seconds

// Direct API URL for non-proxy calls (used by health checks)
export const DIRECT_API_URL = 'http://localhost:5000';

// Feature flags
export const USE_MOCK_DATA = false;  // Set to false to use real data

// Log the feature flags
if (USE_MOCK_DATA) {
  console.log('Using mock data for API calls');
} else {
  console.log('Using real data for API calls');
}

// API endpoints
export const ENDPOINTS = {
  // Movies
  MOVIES: `${API_BASE_URL}/movies`,
  MOVIE_DETAILS: (id: number) => `${API_BASE_URL}/movies/${id}`,
  
  // Cinemas
  CINEMAS: `${API_BASE_URL}/cinemas`,
  CINEMA_DETAILS: (id: number) => `${API_BASE_URL}/cinemas/${id}`,
  
  // Showtimes
  SHOWTIMES: `${API_BASE_URL}/showtimes`,
  SHOWTIME_DETAILS: (id: string) => `${API_BASE_URL}/showtimes/${id}`,
  
  // Bookings
  BOOKINGS: `${API_BASE_URL}/bookings`,
  USER_BOOKINGS: (userId: string) => `${API_BASE_URL}/users/${userId}/bookings`,
  BOOKING_DETAILS: (id: string) => `${API_BASE_URL}/bookings/${id}`,
  CANCEL_BOOKING: (id: string) => `${API_BASE_URL}/bookings/${id}/cancel`,
  RESTORE_BOOKING: (id: string) => `${API_BASE_URL}/bookings/${id}/restore`,
  
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  VERIFY_TOKEN: `${API_BASE_URL}/auth/verify`,
  
  // Admin
  ADMIN_BOOKINGS: `${API_BASE_URL}/admin/bookings`,
  ADMIN_ANALYTICS: `${API_BASE_URL}/admin/analytics`,
  
  // Status
  STATUS: `${API_BASE_URL}/status`,
};

// Authentication token storage key
export const AUTH_TOKEN_KEY = 'token';
