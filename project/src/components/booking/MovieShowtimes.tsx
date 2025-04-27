import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Cinema, Showtime } from '../../types/movie';
import { logger } from '../../utils/logger';
import { Clock } from 'lucide-react';
import { cinemaService } from '../../services/cinemaService';
import { areDatesEqual, standardizeDate, debugDate } from '../../utils/dateUtils';

interface MovieShowtimesProps {
  movieId: number;
  cinemas: Cinema[];
  selectedDate: string;
}

const MovieShowtimes = ({ movieId, cinemas, selectedDate }: MovieShowtimesProps) => {
  const [selectedCinema, setSelectedCinema] = useState<number | null>(null);
  const [filteredShowtimes, setFilteredShowtimes] = useState<Record<number, Showtime[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, showLoginPrompt } = useAuth();

  // Fetch showtimes from API or extract from cinemas when selectedDate or movieId changes
  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Debug selected date
        debugDate("Selected date", selectedDate);
        
        // Log all available showtimes with their dates for debugging
        logger.debug(`Searching for showtimes for movie ${movieId} on date ${selectedDate}`);
        
        // Extract showtimes directly from cinemas prop with proper date comparison
        const extractedShowtimes: Showtime[] = [];
        
        cinemas.forEach(cinema => {
          if (cinema.showtimes && Array.isArray(cinema.showtimes)) {
            cinema.showtimes.forEach(showtime => {
              // Check for movieId match
              const movieIdMatches = showtime.movieId === movieId;
              
              // Check for date match using proper date comparison
              const dateMatches = areDatesEqual(showtime.date, selectedDate);
              
              if (movieIdMatches) {
                debugDate(`Showtime ${showtime.id} date`, showtime.date);
                logger.debug(`Comparing dates - Match: ${dateMatches}`);
              }
              
              if (movieIdMatches && dateMatches) {
                logger.debug(`Found matching showtime: ID=${showtime.id}, date=${showtime.date}`);
                extractedShowtimes.push(showtime);
              }
            });
          }
        });
        
        logger.debug(`Extracted ${extractedShowtimes.length} showtimes for date ${selectedDate}`);
        
        // Group showtimes by cinema
        const showtimesByCinema: Record<number, Showtime[]> = {};
        extractedShowtimes.forEach(showtime => {
          if (!showtimesByCinema[showtime.cinemaId]) {
            showtimesByCinema[showtime.cinemaId] = [];
          }
          showtimesByCinema[showtime.cinemaId].push(showtime);
        });
        
        setFilteredShowtimes(showtimesByCinema);
        
        // Auto-select first cinema with showtimes
        if (extractedShowtimes.length > 0) {
          const firstCinemaId = Object.keys(showtimesByCinema)[0];
          if (firstCinemaId && !selectedCinema) {
            setSelectedCinema(Number(firstCinemaId));
          }
        } else {
          setSelectedCinema(null);
        }
      } catch (error) {
        logger.error('Error in fetchShowtimes:', error);
        setError('Failed to load showtimes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchShowtimes();
  }, [movieId, selectedDate, cinemas]);

  const handleTimeClick = (cinemaId: number, time: string, showtimeId: string) => {
    logger.debug(`Showtime clicked: cinema=${cinemaId}, time=${time}, id=${showtimeId}, date=${selectedDate}`);
    
    if (!isAuthenticated) {
      logger.info("User not authenticated, showing login prompt");
      showLoginPrompt();
      return false;
    }
    return true;
  };

  // Count total showtimes
  const totalShowtimes = Object.values(filteredShowtimes)
    .reduce((sum, showtimes) => sum + showtimes.length, 0);

  if (loading) {
    return (
      <div className="glass-card p-6 text-center">
        <div className="inline-block w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-gray-400">Loading available showtimes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 text-center text-error">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 btn-secondary text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  // Get a list of cinemas that have showtimes for this movie and date
  const cinemasWithShowtimes = cinemas.filter(cinema => 
    filteredShowtimes[cinema.id] && filteredShowtimes[cinema.id].length > 0
  );

  if (totalShowtimes === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-gray-400">No showtimes available for this date.</p>
        <p className="text-sm text-gray-500 mt-2">Please try selecting another date.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cinemasWithShowtimes.map((cinema) => {
        const isSelected = selectedCinema === cinema.id;
        const dateShowtimes = filteredShowtimes[cinema.id] || [];
        
        return (
          <div 
            key={cinema.id}
            className={`glass-card transition-all ${
              isSelected 
                ? 'border-neon-blue shadow-[0_0_15px_rgba(67,97,238,0.3)]' 
                : 'hover:border-gray-600'
            }`}
          >
            {/* Cinema Header - Clickable to expand */}
            <div 
              className="p-4 flex justify-between items-center cursor-pointer"
              onClick={() => setSelectedCinema(isSelected ? null : cinema.id)}
            >
              <div>
                <h4 className="text-lg font-semibold">{cinema.name}</h4>
                <p className="text-sm text-gray-400">{cinema.location}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">
                  {dateShowtimes.length} {dateShowtimes.length === 1 ? 'Showtime' : 'Showtimes'}
                </span>
                <svg 
                  className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Showtimes - Visible when expanded */}
            {isSelected && (
              <div className="p-4 pt-0 border-t border-gray-700">
                <div className="flex flex-wrap gap-3">
                  {dateShowtimes.map((showtime) => (
                    <div key={showtime.id} className="flex flex-col items-center space-y-1">
                      <Link 
                        to={`/book/${movieId}/${showtime.id}`}
                        className={`px-4 py-2 glass-card hover:border-neon-blue hover:shadow-[0_0_10px_rgba(67,97,238,0.3)]
                        text-center min-w-20`}
                        onClick={(e) => {
                          if (!handleTimeClick(cinema.id, showtime.time, showtime.id)) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <div className="flex items-center justify-center">
                          <Clock size={14} className="mr-2 text-neon-blue" />
                          <span className="font-semibold">{showtime.time}</span>
                        </div>
                      </Link>
                      <span className="text-xs text-gray-400">{showtime.screenType}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MovieShowtimes;