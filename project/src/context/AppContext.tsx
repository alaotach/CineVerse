import { createContext, ReactNode, useEffect, useState } from 'react';
import { Movie, Cinema, Booking, User, Showtime, BookingRequest } from '../types/movie';
import { authService } from '../services/authService';
import { movieService } from '../services/movieService';
import { cinemaService } from '../services/cinemaService';
import { bookingService } from '../services/bookingService';
import { logger } from '../utils/logger';

interface AppContextProps {
  isLoading: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
  movies: Movie[];
  cinemas: Cinema[];
  bookings: Booking[];
  addMovie: (movie: Omit<Movie, 'id'>) => Promise<Movie>;
  updateMovie: (id: number, movie: Partial<Movie>) => Promise<Movie>;
  deleteMovie: (id: number) => Promise<void>;
  addBooking: (booking: BookingRequest) => Promise<string>;
  cancelBooking: (id: string) => Promise<void>;
  restoreBooking: (id: string) => Promise<void>;
  addShowtime: (showtime: Showtime) => Promise<void>;
  updateShowtime: (showtime: Showtime) => Promise<void>;
  deleteShowtime: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const AppContext = createContext<AppContextProps>({
  isLoading: true,
  user: null,
  setUser: () => {},
  movies: [],
  cinemas: [],
  bookings: [],
  addMovie: async () => ({ id: 0 }) as Movie,
  updateMovie: async () => ({ id: 0 }) as Movie,
  deleteMovie: async () => {},
  addBooking: async () => '',
  cancelBooking: async () => {},
  restoreBooking: async () => {},
  addShowtime: async () => {},
  updateShowtime: async () => {},
  deleteShowtime: async () => {},
  refreshData: async () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // Refresh all data
  const refreshData = async () => {
    setIsLoading(true);
    try {
      try {
        const moviesData = await movieService.getAllMovies();
        setMovies(Array.isArray(moviesData) ? moviesData : []);
        logger.debug(`Successfully loaded ${moviesData.length} movies from API`);
      } catch (error) {
        logger.error('Error fetching movies:', error);
        setMovies([]);
      }
      
      try {
        const cinemasData = await cinemaService.getAllCinemas();
        setCinemas(Array.isArray(cinemasData) ? cinemasData : []);
        logger.debug(`Successfully loaded ${cinemasData.length} cinemas from API`);
      } catch (error) {
        logger.error('Error fetching cinemas:', error);
        setCinemas([]);
      }
      
      if (user) {
        try {
          const userBookings = await bookingService.getUserBookings(user.id);
          setBookings(Array.isArray(userBookings) ? userBookings : []);
          logger.debug(`Successfully loaded ${userBookings.length} bookings for user`);
        } catch (error) {
          // Since bookingService.getUserBookings now handles errors internally and returns an empty array,
          // this catch block should rarely be hit
          logger.error('Error fetching user bookings:', error);
          setBookings([]);
        }
      } else {
        // When no user is logged in, clear bookings
        setBookings([]);
      }
    } catch (error) {
      logger.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load initial data
  useEffect(() => {
    refreshData();
  }, []);
  
  // Add a new movie
  const addMovie = async (movie: Omit<Movie, 'id'>): Promise<Movie> => {
    try {
      const newMovie = await movieService.createMovie(movie);
      setMovies(prevMovies => [...prevMovies, newMovie]);
      return newMovie;
    } catch (error) {
      console.error('Error adding movie:', error);
      throw error;
    }
  };
  
  // Update an existing movie
  const updateMovie = async (id: number, movieData: Partial<Movie>): Promise<Movie> => {
    try {
      const updatedMovie = await movieService.updateMovie(id, movieData);
      setMovies(prevMovies => prevMovies.map(movie => 
        movie.id === id ? { ...movie, ...updatedMovie } : movie
      ));
      return updatedMovie;
    } catch (error) {
      console.error('Error updating movie:', error);
      throw error;
    }
  };
  
  // Delete a movie
  const deleteMovie = async (id: number) => {
    try {
      await movieService.deleteMovie(id);
      setMovies(prevMovies => prevMovies.filter(movie => movie.id !== id));
    } catch (error) {
      console.error('Error deleting movie:', error);
      throw error;
    }
  };
  
  // Add a new booking
  const addBooking = async (bookingData: BookingRequest): Promise<string> => {
    try {
      logger.debug('Creating booking:', bookingData);
      
      // Create booking through the service
      const newBooking = await bookingService.createBooking(bookingData);
      
      // Ensure we have a valid booking ID
      if (!newBooking || !newBooking.id || typeof newBooking.id !== 'string') {
        throw new Error('Invalid booking response: Missing or invalid booking ID');
      }
      
      // Add booking to state
      setBookings(prevBookings => [...prevBookings, newBooking]);
      
      logger.debug('Booking created:', newBooking);
      
      // Return the string ID, not the entire booking object
      return newBooking.id;
    } catch (error) {
      logger.error('Error adding booking:', error);
      throw error;
    }
  };
  
  // Cancel a booking
  const cancelBooking = async (id: string) => {
    try {
      await bookingService.cancelBooking(id);
      setBookings(prevBookings => prevBookings.map(booking => 
        booking.id === id ? { ...booking, cancelled: true } : booking
      ));
      logger.debug(`Booking ${id} cancelled successfully`);
    } catch (error) {
      logger.error('Error canceling booking:', error);
      throw error;
    }
  };
  
  // Restore a cancelled booking
  const restoreBooking = async (id: string) => {
    try {
      await bookingService.restoreBooking(id);
      setBookings(prevBookings => prevBookings.map(booking => 
        booking.id === id ? { ...booking, cancelled: false } : booking
      ));
      logger.debug(`Booking ${id} restored successfully`);
    } catch (error) {
      logger.error('Error restoring booking:', error);
      throw error;
    }
  };
  
  // Add a new showtime
  const addShowtime = async (showtime: Showtime): Promise<void> => {
    try {
      logger.debug('Adding showtime:', showtime);
      
      // Add showtime through service
      const newShowtime = await cinemaService.addShowtime(showtime);
      
      // Update the cinemas state with the new showtime
      setCinemas(prevCinemas => prevCinemas.map(cinema => 
        cinema.id === showtime.cinemaId
          ? { ...cinema, showtimes: [...cinema.showtimes, newShowtime] }
          : cinema
      ));
      
      logger.debug('Showtime added successfully');
    } catch (error) {
      logger.error('Error adding showtime:', error);
      throw error;
    }
  };
  
  // Update an existing showtime
  const updateShowtime = async (showtime: Showtime): Promise<void> => {
    try {
      logger.debug('Updating showtime:', showtime);
      
      // Update showtime through service
      await cinemaService.updateShowtime(showtime);
      
      // Update the state
      setCinemas(prevCinemas => {
        return prevCinemas.map(cinema => {
          if (cinema.id === showtime.cinemaId) {
            return {
              ...cinema,
              showtimes: cinema.showtimes.map(show => 
                show.id === showtime.id ? showtime : show
              )
            };
          }
          return cinema;
        });
      });
      
      logger.debug('Showtime updated successfully');
    } catch (error) {
      logger.error('Error updating showtime:', error);
      throw error;
    }
  };
  
  // Delete a showtime
  const deleteShowtime = async (id: string): Promise<void> => {
    try {
      logger.debug('Deleting showtime:', id);
      
      // Delete showtime through service
      await cinemaService.deleteShowtime(id);
      
      // Update the state
      setCinemas(prevCinemas => prevCinemas.map(cinema => ({
        ...cinema,
        showtimes: cinema.showtimes.filter(show => show.id !== id)
      })));
      
      logger.debug('Showtime deleted successfully');
    } catch (error) {
      logger.error('Error deleting showtime:', error);
      throw error;
    }
  };
  
  // Listen for auth changes
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          // When a user logs in, fetch their bookings
          logger.debug(`User logged in: ${user.id}. Fetching bookings...`);
          const userBookings = await bookingService.getUserBookings(user.id);
          setBookings(userBookings);
          logger.debug(`Loaded ${userBookings.length} bookings for user ${user.id}`);
        } catch (error) {
          logger.error('Error fetching user bookings:', error);
          setBookings([]);
        }
      } else {
        // When a user logs out, clear their bookings
        logger.debug('User logged out. Clearing bookings.');
        setBookings([]);
      }
    };
    
    loadUserData();
  }, [user?.id]); // React to changes in user ID specifically
  
  return (
    <AppContext.Provider value={{
      isLoading,
      user,
      setUser,
      movies,
      cinemas,
      bookings,
      addMovie,
      updateMovie,
      deleteMovie,
      addBooking,
      cancelBooking,
      restoreBooking,
      addShowtime,
      updateShowtime,
      deleteShowtime,
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
};