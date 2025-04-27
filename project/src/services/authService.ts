import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types/movie';
import { apiClient } from '../api/apiClient';
import { logger } from '../utils/logger';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      // Use the correct API path without duplication
      const response = await apiClient.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('user', JSON.stringify(user));
      
      logger.debug(`User logged in: ${user.name} (${user.id})`);
      return response.data;
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/register', credentials);
      const { token, user } = response.data;
      
      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('user', JSON.stringify(user));
      
      logger.debug(`User registered: ${user.name} (${user.id})`);
      return response.data;
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    logger.debug('User logged out');
  },

  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch (error) {
      logger.error('Error parsing user from localStorage:', error);
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  }
};
