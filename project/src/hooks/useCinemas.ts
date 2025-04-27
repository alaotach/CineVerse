import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Cinema, Showtime } from '../types/movie';
import { logger } from '../utils/logger';
import { cinemaService } from '../services/cinemaService';

export const useCinemas = () => {
  const { cinemas, isLoading, addShowtime, updateShowtime, deleteShowtime, refreshData } = useContext(AppContext);
  const [error, setError] = useState<string | null>(null);

  const getCinemaById = async (id: number): Promise<Cinema | undefined> => {
    try {
      return await cinemaService.getCinemaById(id);
    } catch (error) {
      logger.error(`Error fetching cinema with id ${id}:`, error);
      setError('Failed to load cinema. Please try again later.');
      return undefined;
    }
  };

  const getShowtimeById = async (id: string): Promise<Showtime | undefined> => {
    try {
      // Get all showtimes and find the one with matching id
      const allShowtimes = await cinemaService.getShowtimes();
      
      // Check if allShowtimes is an array before using find
      if (!Array.isArray(allShowtimes)) {
        logger.warn(`Expected an array of showtimes but received:`, allShowtimes);
        
        // Try to extract showtimes from cinemas as a fallback
        if (Array.isArray(cinemas)) {
          // Flatten all showtimes from all cinemas into a single array
          const flattenedShowtimes = cinemas.reduce((acc, cinema) => {
            if (cinema.showtimes && Array.isArray(cinema.showtimes)) {
              return [...acc, ...cinema.showtimes];
            }
            return acc;
          }, [] as Showtime[]);
          
          logger.debug(`Fallback: Found ${flattenedShowtimes.length} showtimes from cinemas context`);
          return flattenedShowtimes.find(showtime => showtime.id === id);
        }
        
        return undefined;
      }
      
      return allShowtimes.find(showtime => showtime.id === id);
    } catch (error) {
      logger.error(`Error fetching showtime with id ${id}:`, error);
      setError('Failed to load showtime. Please try again later.');
      
      // Fallback to looking in context
      if (Array.isArray(cinemas)) {
        for (const cinema of cinemas) {
          if (cinema.showtimes && Array.isArray(cinema.showtimes)) {
            const showtime = cinema.showtimes.find(s => s.id === id);
            if (showtime) return showtime;
          }
        }
      }
      
      return undefined;
    }
  };

  const getShowtimesByMovie = async (movieId: number, date?: string): Promise<Showtime[]> => {
    try {
      return await cinemaService.getShowtimes(movieId, date);
    } catch (error) {
      logger.error(`Error fetching showtimes for movie ${movieId}:`, error);
      setError('Failed to load showtimes. Please try again later.');
      return [];
    }
  };

  return {
    cinemas: Array.isArray(cinemas) ? cinemas : [],
    loading: isLoading,
    error,
    getCinemaById,
    getShowtimeById,
    getShowtimesByMovie,
    addShowtime,
    updateShowtime,
    deleteShowtime,
    refreshData,
  };
};