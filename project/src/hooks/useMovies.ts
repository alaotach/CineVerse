import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Movie } from '../types/movie';
import { logger } from '../utils/logger';
import { movieService } from '../services/movieService';

export const useMovies = () => {
  const { movies, addMovie, updateMovie, deleteMovie, isLoading, refreshData } = useContext(AppContext);
  const [cachedMovies, setCachedMovies] = useState<Record<number, Movie>>({});
  const [error, setError] = useState<string | null>(null);

  // Cache movies for faster access
  useEffect(() => {
    if (Array.isArray(movies)) {
      const movieMap: Record<number, Movie> = {};
      movies.forEach(movie => {
        movieMap[movie.id] = movie;
      });
      setCachedMovies(movieMap);
    }
  }, [movies]);

  const getMovieById = async (id: number): Promise<Movie | undefined> => {
    try {
      // First check the cache
      if (cachedMovies[id]) {
        return cachedMovies[id];
      }

      // If not in cache, fetch from API
      const movie = await movieService.getMovieById(id);
      
      // Update cache with the new movie
      setCachedMovies(prev => ({
        ...prev,
        [id]: movie
      }));
      
      return movie;
    } catch (error) {
      logger.error(`Error fetching movie with id ${id}:`, error);
      setError('Failed to load movie details. Please try again later.');
      return undefined;
    }
  };

  return {
    movies: Array.isArray(movies) ? movies : [],
    loading: isLoading,
    error,
    getMovieById,
    addMovie,
    updateMovie,
    deleteMovie,
    refreshData,
  };
};