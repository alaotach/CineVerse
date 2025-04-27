import { apiClient } from '../api/apiClient';
import { Movie } from '../types/movie';
import { logger } from '../utils/logger';

export const movieService = {
  getAllMovies: async (): Promise<Movie[]> => {
    try {
      logger.debug('Fetching all movies');
      const response = await apiClient.get('/movies');
      logger.debug(`Fetched ${response.data?.length || 0} movies from API`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      logger.error('Error fetching movies:', error);
      return [];
    }
  },

  getMovieById: async (id: number): Promise<Movie | undefined> => {
    try {
      const response = await apiClient.get(`/movies/${id}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching movie ${id}:`, error);
      return undefined;
    }
  },

  createMovie: async (movieData: Omit<Movie, 'id'>): Promise<Movie> => {
    try {
      const response = await apiClient.post('/movies', movieData);
      return response.data;
    } catch (error) {
      logger.error('Error creating movie:', error);
      throw error;
    }
  },

  updateMovie: async (id: number, movieData: Partial<Movie>): Promise<Movie> => {
    try {
      const response = await apiClient.put(`/movies/${id}`, movieData);
      return response.data;
    } catch (error) {
      logger.error(`Error updating movie ${id}:`, error);
      throw error;
    }
  },

  deleteMovie: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/movies/${id}`);
    } catch (error) {
      logger.error(`Error deleting movie ${id}:`, error);
      throw error;
    }
  }
};
