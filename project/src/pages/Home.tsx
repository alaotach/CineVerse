import { useState, useEffect } from 'react';
import HeroSection from '../components/home/HeroSection';
import MovieGrid from '../components/movies/MovieGrid';
import TrendingMovies from '../components/home/TrendingMovies';
import SearchBar from '../components/home/SearchBar';
import FilterBar from '../components/home/FilterBar';
import { Movie } from '../types/movie';
import { movieService } from '../services/movieService';
import { logger } from '../utils/logger';

const Home = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    genre: '',
    language: '',
    rating: 0
  });

  // Fetch movies directly from the API
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await movieService.getAllMovies();
        setMovies(data);
      } catch (error) {
        logger.error('Error fetching movies:', error);
        setError('Failed to load movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovies();
  }, []);

  // Update filtered movies when movies, search query, or filters change
  useEffect(() => {
    if (!movies) return;
    
    let result = [...movies];
    
    // Apply search query
    if (searchQuery) {
      result = result.filter(movie => 
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply filters
    if (filters.genre) {
      result = result.filter(movie => 
        movie.genres.includes(filters.genre)
      );
    }
    
    if (filters.language) {
      result = result.filter(movie => 
        movie.language === filters.language
      );
    }
    
    if (filters.rating > 0) {
      result = result.filter(movie => 
        movie.rating >= filters.rating
      );
    }
    
    setFilteredMovies(result);
  }, [movies, searchQuery, filters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (type: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      genre: '',
      language: '',
      rating: 0
    });
    setSearchQuery('');
  };

  // Get top rated movies for trending section
  const trendingMovies = [...(movies || [])]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  return (
    <div className="pt-16 md:pt-20">
      <HeroSection movies={trendingMovies} loading={loading} />
      
      <div className="container mx-auto px-4 md:px-6 mt-8">
        <TrendingMovies movies={trendingMovies} loading={loading} />
        
        <div className="mt-12 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Explore Movies</h2>
            <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
          </div>
          
          <FilterBar 
            onFilterChange={handleFilterChange} 
            filters={filters}
            onClear={clearFilters}
          />
        </div>
        
        {error ? (
          <div className="glass-card p-8 text-center text-error">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 btn-secondary"
            >
              Retry
            </button>
          </div>
        ) : (
          <MovieGrid 
            movies={filteredMovies} 
            loading={loading} 
            emptyMessage={
              searchQuery || filters.genre || filters.language || filters.rating > 0
                ? "No movies match your search criteria"
                : "No movies available"
            }
          />
        )}
      </div>
    </div>
  );
};

export default Home;