import { apiClient } from '../api/apiClient';
import { Cinema, Showtime } from '../types/movie';
import { logger } from '../utils/logger';

export const cinemaService = {
  // Get all cinemas
  getAllCinemas: async (): Promise<Cinema[]> => {
    try {
      const response = await apiClient.get('/cinemas');
      return response.data;
    } catch (error) {
      logger.error('Error fetching cinemas:', error);
      return [];
    }
  },
  
  // Get a specific cinema by ID
  getCinemaById: async (id: number): Promise<Cinema | undefined> => {
    try {
      const response = await apiClient.get(`/cinemas/${id}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching cinema with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Get showtimes with optional filters
  getShowtimes: async (movieId?: number, date?: string): Promise<Showtime[]> => {
    try {
      let url = '/showtimes';
      const params: any = {};
      
      if (movieId) {
        params.movieId = movieId;
      }
      
      if (date) {
        params.date = date;
      }
      
      const response = await apiClient.get(url, { params });
      return response.data;
    } catch (error) {
      logger.error('Error fetching showtimes:', error);
      return [];
    }
  },

  // NEW METHOD: Get booked seats for a specific showtime
  getBookedSeats: async (showtimeId: string): Promise<string[]> => {
    try {
      logger.debug(`Fetching booked seats for showtime ${showtimeId}`);
      const response = await apiClient.get(`/showtimes/${showtimeId}/seats`);
      
      // Ensure we have an array of seats
      const bookedSeats = Array.isArray(response.data) ? response.data : [];
      logger.debug(`Found ${bookedSeats.length} booked seats for showtime ${showtimeId}`);
      
      return bookedSeats;
    } catch (error) {
      logger.error(`Error fetching booked seats for showtime ${showtimeId}:`, error);
      return [];
    }
  },
  
  // Add a new showtime
  addShowtime: async (showtime: Showtime): Promise<Showtime> => {
    try {
      const response = await apiClient.post('/showtimes', showtime);
      return response.data;
    } catch (error) {
      logger.error('Error adding showtime:', error);
      throw error;
    }
  },
  
  // Update an existing showtime
  updateShowtime: async (showtime: Showtime): Promise<Showtime> => {
    try {
      const response = await apiClient.put(`/showtimes/${showtime.id}`, showtime);
      return response.data;
    } catch (error) {
      logger.error(`Error updating showtime ${showtime.id}:`, error);
      throw error;
    }
  },
  
  // Delete a showtime
  deleteShowtime: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/showtimes/${id}`);
    } catch (error) {
      logger.error(`Error deleting showtime ${id}:`, error);
      throw error;
    }
  }
};
