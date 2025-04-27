import { logger } from '../utils/logger';
import { apiClient } from '../api/apiClient';
import { Movie, Cinema, Showtime, Booking, BookingRequest, User } from '../types/movie';
import { standardizeDate } from '../utils/dateUtils';

/**
 * Service for interacting with the backend
 * Handles common utilities and backend status checks
 */
export const backendService = {
  /**
   * Check if the backend bridge is online (not necessarily the C++ backend)
   */
  checkStatus: async (): Promise<{ available: boolean; bridgeOnly: boolean }> => {
    try {
      const response = await apiClient.get('/status');
      logger.debug('Backend status check:', response.data);
      
      const bridgeAvailable = response.data?.status === 'ok';
      const backendConnected = response.data?.backend === 'connected';
      
      // Backend is available if both bridge and backend are up
      // bridgeOnly flag is true if only the bridge is up (using mock data)
      return { 
        available: bridgeAvailable, 
        bridgeOnly: bridgeAvailable && !backendConnected
      };
    } catch (error) {
      logger.error('Backend status check failed:', error);
      return { available: false, bridgeOnly: false };
    }
  },

  /**
   * Check connection and notify user if we're using mock data
   */
  notifyIfMockData: async (): Promise<void> => {
    const { available, bridgeOnly } = await backendService.checkStatus();
    
    if (!available) {
      console.warn("⚠️ Backend service is completely unavailable");
    } else if (bridgeOnly) {
      console.warn("⚠️ Using mock data - C++ backend is not connected");
    }
  },

  /**
   * Fetch movies from C++ backend
   * The C++ backend should implement efficient data structures for storing and retrieving movies
   */
  getMovies: async (): Promise<Movie[]> => {
    try {
      const response = await apiClient.get('/movies');
      logger.debug(`Loaded ${response.data.length} movies from C++ backend`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching movies from C++ backend:', error);
      throw error;
    }
  },

  /**
   * Fetch cinemas with showtimes from C++ backend
   * The C++ backend should implement a graph data structure to organize cinemas and their showtimes
   */
  getCinemas: async (): Promise<Cinema[]> => {
    try {
      const response = await apiClient.get('/cinemas');
      
      // Standardize date formats in showtimes
      const cinemas = response.data.map((cinema: Cinema) => ({
        ...cinema,
        showtimes: Array.isArray(cinema.showtimes) 
          ? cinema.showtimes.map((showtime: Showtime) => ({
              ...showtime,
              date: standardizeDate(showtime.date)
            }))
          : []
      }));
      
      logger.debug(`Loaded ${cinemas.length} cinemas from C++ backend`);
      return cinemas;
    } catch (error) {
      logger.error('Error fetching cinemas from C++ backend:', error);
      throw error;
    }
  },

  /**
   * Get showtimes from C++ backend with filtering
   * The C++ backend should implement efficient algorithms for filtering and searching
   */
  getShowtimes: async (movieId?: number, date?: string): Promise<Showtime[]> => {
    try {
      const standardizedDate = date ? standardizeDate(date) : undefined;
      
      // Build query parameters
      const params = new URLSearchParams();
      if (movieId !== undefined) params.append('movieId', movieId.toString());
      if (standardizedDate) params.append('date', standardizedDate);
      
      const url = `/showtimes${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get(url);
      
      // Standardize dates in the returned showtimes
      const showtimes = response.data.map((showtime: Showtime) => ({
        ...showtime,
        date: standardizeDate(showtime.date)
      }));
      
      logger.debug(`Loaded ${showtimes.length} showtimes from C++ backend`);
      return showtimes;
    } catch (error) {
      logger.error('Error fetching showtimes from C++ backend:', error);
      throw error;
    }
  },

  /**
   * Get bookings for a user
   * The C++ backend should implement a queue data structure for bookings
   */
  getUserBookings: async (userId: string): Promise<Booking[]> => {
    try {
      const response = await apiClient.get(`/users/${userId}/bookings`);
      logger.debug(`Loaded ${response.data.length} bookings for user ${userId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching bookings for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new booking
   * The C++ backend should implement a queue to process bookings
   */
  createBooking: async (booking: BookingRequest): Promise<Booking> => {
    try {
      // Make sure date is in standardized format
      const standardizedBooking = {
        ...booking,
        showtimeDate: standardizeDate(booking.showtimeDate)
      };
      
      const response = await apiClient.post('/bookings', standardizedBooking);
      logger.debug('Booking created:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error creating booking:', error);
      throw error;
    }
  },

  /**
   * Cancel a booking
   * The C++ backend should implement stack operations to track booking history
   */
  cancelBooking: async (bookingId: string): Promise<void> => {
    try {
      await apiClient.post(`/bookings/${bookingId}/cancel`);
      logger.debug(`Booking ${bookingId} cancelled`);
    } catch (error) {
      logger.error(`Error cancelling booking ${bookingId}:`, error);
      throw error;
    }
  },

  /**
   * Restore a cancelled booking
   * The C++ backend should implement a stack to track booking history changes
   */
  restoreBooking: async (bookingId: string): Promise<void> => {
    try {
      await apiClient.post(`/bookings/${bookingId}/restore`);
      logger.debug(`Booking ${bookingId} restored`);
    } catch (error) {
      logger.error(`Error restoring booking ${bookingId}:`, error);
      throw error;
    }
  },

  /**
   * Get all seats booked for a showtime
   * The C++ backend should implement a hash table for quick seat availability lookups
   */
  getBookedSeats: async (showtimeId: string): Promise<string[]> => {
    try {
      const response = await apiClient.get(`/showtimes/${showtimeId}/seats`);
      logger.debug(`Loaded ${response.data.length} booked seats for showtime ${showtimeId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching booked seats for showtime ${showtimeId}:`, error);
      throw error;
    }
  },

  /**
   * Get analytics data for the admin dashboard
   */
  getAnalytics: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/admin/analytics');
      logger.debug('Retrieved analytics data from backend');
      return response.data;
    } catch (error) {
      logger.error('Failed to retrieve analytics data:', error);
      
      // Return dummy analytics in case of error
      return {
        totalBookings: 0,
        totalRevenue: 0,
        uniqueUsers: 0,
        error: "Could not connect to analytics backend"
      };
    }
  },

  /**
   * Normalize date format using the backend utility endpoint
   * This ensures consistent date handling between frontend and backend
   */
  normalizeDate: async (dateString: string): Promise<string> => {
    try {
      const response = await apiClient.post('/utils/normalize-date', { date: dateString });
      return response.data.normalized;
    } catch (error) {
      logger.error(`Error normalizing date ${dateString}:`, error);
      return dateString; // Return original if normalization fails
    }
  }
};
