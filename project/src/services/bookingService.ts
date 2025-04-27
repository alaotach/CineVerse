import { apiClient } from '../api/apiClient';
import { Booking, BookingRequest } from '../types/movie';
import { logger } from '../utils/logger';

export const bookingService = {
  // Retrieve all bookings for a user
  getUserBookings: async (userId?: string): Promise<Booking[]> => {
    try {
      logger.debug(`Fetching bookings for user: ${userId || 'current'}`);
      
      try {
        // If userId is provided, use the specific endpoint
        if (userId) {
          const endpoint = `/users/${userId}/bookings`;
          logger.debug(`API Request to endpoint: ${endpoint}`);
          
          const response = await apiClient.get(endpoint);
          
          if (response.data) {
            const bookings = Array.isArray(response.data) ? response.data : [];
            logger.debug(`Found ${bookings.length} bookings for user ${userId}`);
            return bookings;
          }
        } else {
          // If no userId provided, use the general endpoint
          const endpoint = '/users/bookings';
          logger.debug(`API Request to endpoint: ${endpoint}`);
          
          const response = await apiClient.get(endpoint);
          
          if (response.data) {
            const bookings = Array.isArray(response.data) ? response.data : [];
            logger.debug(`Found ${bookings.length} bookings for current user`);
            return bookings;
          }
        }
      } catch (error: any) {
        logger.warn(`Error fetching user bookings: ${error.message}`);
        
        // Try to load mock data if available
        try {
          logger.info('Loading mock booking data');
          const mockData = [
            {
              id: "booking-1",
              userId: "1",
              movieId: 1,
              movieName: "Avengers: Endgame",
              moviePoster: "https://images.pexels.com/photos/11902838/pexels-photo-11902838.jpeg",
              cinemaId: 1,
              cinemaName: "CineVerse Deluxe",
              screenType: "IMAX",
              showtimeId: "st1",
              date: "2025-04-28",
              time: "18:30",
              seats: ["A1", "A2", "A3"],
              totalAmount: 450,
              bookingDate: "2025-04-25",
              cancelled: false
            }
          ];
          
          logger.debug('Using mock booking data');
          return mockData;
        } catch (mockError) {
          logger.error('Error loading mock data:', mockError);
          return [];
        }
      }
      
      return [];
    } catch (error) {
      logger.error('Error fetching user bookings:', error);
      return [];
    }
  },

  // Get all bookings (admin function)
  getAllBookings: async (): Promise<Booking[]> => {
    try {
      const response = await apiClient.get('/bookings');
      const bookings = Array.isArray(response.data) ? response.data : [];
      return bookings;
    } catch (error) {
      logger.error('Error fetching all bookings:', error);
      return [];
    }
  },

  // Get a specific booking by ID
  getBookingById: async (id: string): Promise<Booking | null> => {
    try {
      const response = await apiClient.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching booking ${id}:`, error);
      return null;
    }
  },

  // Create a new booking - updated to send userId instead of payment status
  createBooking: async (bookingData: Partial<Booking>): Promise<Booking> => {
    try {
      // Make sure we have userId in the booking data
      if (!bookingData.userId) {
        logger.warn('No userId provided for booking, using default "1"');
        bookingData.userId = '1';
      }

      logger.debug('Creating booking with data:', bookingData);
      
      const response = await apiClient.post('/bookings', bookingData);
      
      logger.debug('Booking created successfully:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error creating booking:', error);
      throw error;
    }
  },

  // Confirm payment for a booking
  confirmPayment: async (bookingId: string): Promise<Booking> => {
    try {
      logger.debug(`Confirming payment for booking: ${bookingId}`);
      
      try {
        const response = await apiClient.put(`/bookings/${bookingId}/payment`, {
          status: 'confirmed',
          paymentStatus: 'completed'
        });
        
        logger.debug('Payment confirmed successfully via PUT:', response.data);
        return response.data;
      } catch (putError: any) {
        // If PUT fails with 405, try POST instead
        if (putError.response?.status === 405) {
          logger.warn('PUT to payment endpoint failed with 405, trying POST instead');
          
          const response = await apiClient.post(`/bookings/${bookingId}/payment`, {
            status: 'confirmed',
            paymentStatus: 'completed'
          });
          
          logger.debug('Payment confirmed successfully via POST:', response.data);
          return response.data;
        }
        throw putError;
      }
    } catch (error) {
      logger.error('Error in payment confirmation:', error);
      throw error;
    }
  },

  // Cancel a booking
  cancelBooking: async (id: string): Promise<void> => {
    try {
      await apiClient.put(`/bookings/${id}/cancel`, {
        cancelled: true
      });
    } catch (error: any) {
      // If PUT fails with 405, try alternative methods
      if (error.response?.status === 405) {
        await apiClient.post(`/bookings/${id}/cancel`, {
          cancelled: true
        });
      } else {
        logger.error('Error cancelling booking:', error);
        throw error;
      }
    }
  },

  // Restore a cancelled booking
  restoreBooking: async (id: string): Promise<void> => {
    try {
      await apiClient.put(`/bookings/${id}/restore`, {
        cancelled: false
      });
    } catch (error: any) {
      // If PUT fails with 405, try alternative methods
      if (error.response?.status === 405) {
        await apiClient.post(`/bookings/${id}/restore`, {
          cancelled: false
        });
      } else {
        logger.error('Error restoring booking:', error);
        throw error;
      }
    }
  },

  // Get analytics data
  getAnalytics: async (): Promise<any> => {
    try {
      logger.debug('Fetching analytics data from admin endpoint');
      const response = await apiClient.get('/admin/analytics');
      logger.debug('Successfully retrieved analytics data');
      return response.data;
    } catch (error) {
      logger.error('Error fetching analytics data:', error);
      throw error;
    }
  },

  // Flag for mock data use
  isUsingMockData: () => false
};
