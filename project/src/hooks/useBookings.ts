import { useState, useCallback } from 'react';
import { bookingService } from '../services/bookingService';
import { Booking } from '../types/booking';
import { useAuth } from './useAuth';
import { logger } from '../utils/logger';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchUserBookings = useCallback(async () => {
    if (!user) {
      setError("You must be logged in to view bookings");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const fetchedBookings = await bookingService.getUserBookings(user.id);
      
      // Normalize bookings to ensure consistent property naming
      const normalizedBookings = Array.isArray(fetchedBookings) ? fetchedBookings.map(booking => ({
        ...booking,
        // Ensure consistent naming for fields that might have different property names
        movieName: booking.movieName || booking.movieTitle,
        date: booking.date || booking.showtimeDate,
        time: booking.time || booking.showtimeTime,
        totalAmount: booking.totalAmount || booking.totalPrice
      })) : [];
      
      setBookings(normalizedBookings);
      logger.debug(`Fetched and normalized ${normalizedBookings.length} bookings for user ${user.id}`);
    } catch (err) {
      logger.error("Error fetching bookings:", err);
      setError("Failed to load bookings. Please try again later.");
      // Set bookings to empty array on error to avoid map errors
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createBooking = useCallback(async (bookingData: Partial<Booking>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Make sure we have userId in the booking data
      if (!bookingData.userId && user) {
        bookingData.userId = user.id;
      }
      
      logger.debug("Creating booking with data:", bookingData);
      const newBooking = await bookingService.createBooking(bookingData);
      
      // Validate the response
      if (!newBooking) {
        throw new Error('No booking data returned from server');
      }
      
      // Check if we have a valid booking with an ID
      if (!newBooking.id) {
        throw new Error('Invalid booking ID returned from server');
      }

      setBookings(prevBookings => [...prevBookings, newBooking]);
      
      // For debugging
      logger.debug("Booking created successfully:", newBooking);
      
      // Return the entire booking object
      return newBooking;
    } catch (err) {
      logger.error("Error creating booking:", err);
      setError("Failed to create booking. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getBookingById = useCallback(async (bookingId: string) => {
    // Enhanced validation before making the API call
    if (!bookingId) {
      const errorMsg = "Missing booking ID";
      logger.error(errorMsg);
      setError(errorMsg);
      throw new Error(errorMsg);
    }
    
    // Ensure bookingId is a string, not an object
    if (typeof bookingId !== 'string' || bookingId === '[object Object]') {
      const errorMsg = `Invalid booking ID format: ${String(bookingId)}`;
      logger.error(errorMsg);
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setLoading(true);
    setError(null);
    
    try {
      // Log the validated booking ID for debugging
      logger.debug(`Fetching booking with validated ID: "${bookingId}"`);
      const booking = await bookingService.getBookingById(bookingId);
      
      // Normalize booking data if found
      if (booking) {
        // Ensure all necessary properties are available
        const normalizedBooking = {
          ...booking,
          // Ensure consistent naming for fields that might have different property names
          movieName: booking.movieName || booking.movieTitle,
          date: booking.date || booking.showtimeDate,
          time: booking.time || booking.showtimeTime,
          totalAmount: booking.totalAmount || booking.totalPrice
        };
        return normalizedBooking;
      }
      
      return booking;
    } catch (err) {
      logger.error(`Error fetching booking ${bookingId}:`, err);
      setError("Failed to fetch booking details. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    bookings,
    loading,
    error,
    fetchUserBookings,
    createBooking,
    getBookingById
  };
};