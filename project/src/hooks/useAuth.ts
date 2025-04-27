import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { authService } from '../services/authService';
import { LoginCredentials, RegisterCredentials } from '../types/movie';

export const useAuth = () => {
  const { user, setUser } = useContext(AppContext);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setShowLoginModal(false);
      return true;
    } catch (error) {
      setError(error.message || 'Login failed. Please check your credentials.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(credentials);
      setUser(response.user);
      setShowLoginModal(false);
      return true;
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const showLoginPrompt = () => {
    setShowLoginModal(true);
  };

  return {
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    user,
    login,
    register,
    logout,
    showLoginPrompt,
    showLoginModal,
    setShowLoginModal,
    isLoading,
    error,
    setError
  };
};