import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Star, Clock, Calendar, MessageSquare, X, Volume2, VolumeX } from 'lucide-react';
import { useMovies } from '../hooks/useMovies';
import { useCinemas } from '../hooks/useCinemas';
import MovieShowtimes from '../components/booking/MovieShowtimes';
import NotFound from './NotFound';
import { logger } from '../utils/logger';
import { getNextDays, formatDateToYYYYMMDD, debugDate } from '../utils/dateUtils';
import { Movie } from '../types/movie';
import { movieService } from '../services/movieService';
import LoadingScreen from '../components/common/LoadingScreen';

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { loading: contextLoading } = useMovies();
  const { cinemas } = useCinemas();
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get today's date as the starting point for showtimes
  const today = new Date();
  const formattedToday = formatDateToYYYYMMDD(today);
  
  // Initialize selected date with today's date
  const [selectedDate, setSelectedDate] = useState<string>(formattedToday);
  const [showTrailer, setShowTrailer] = useState(false);
  const [autoplayTrailer, setAutoplayTrailer] = useState(true);
  const [muted, setMuted] = useState(true);
  
  // Fetch movie directly from the API
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!id) return;
        
        const movieId = parseInt(id);
        if (isNaN(movieId)) {
          setError("Invalid movie ID");
          return;
        }
        
        const movieData = await movieService.getMovieById(movieId);
        // Ensure that all properties exist to prevent "cannot read property of undefined" errors
        if (movieData) {
          // Add default values for any potentially missing properties
          setMovie({
            ...movieData,
            genres: Array.isArray(movieData.genres) ? movieData.genres : [],
            cast: Array.isArray(movieData.cast) ? movieData.cast : [],
            rating: movieData.rating || 0,
            duration: movieData.duration || "Unknown",
            releaseDate: movieData.releaseDate || "Unknown",
            language: movieData.language || "Unknown",
            director: movieData.director || "Unknown",
          });
        } else {
          setError("Movie not found");
        }
      } catch (error) {
        logger.error(`Error fetching movie with id ${id}:`, error);
        setError("Failed to load movie details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovie();
    window.scrollTo(0, 0);
  }, [id]);

  // Generate dates for date selection - get the next 7 days
  const dates = getNextDays(7);

  useEffect(() => {
    // Debug the date format when it changes
    debugDate("Selected date in MovieDetails", selectedDate);
  }, [selectedDate]);

  // This ensures the cinemas state is properly passed to MovieShowtimes
  useEffect(() => {
    logger.debug(`MovieDetails has ${cinemas?.length || 0} cinemas available`);
    logger.debug(`Selected date in MovieDetails: ${selectedDate}`);
  }, [cinemas, selectedDate]);

  // Extract YouTube video ID for embedding
  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return '';
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : '';
  };

  const getYoutubeAutoplayUrl = (url?: string) => {
    const baseUrl = getYoutubeEmbedUrl(url);
    if (!baseUrl) return '';
    return `${baseUrl}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&loop=1&modestbranding=1&playsinline=1&rel=0&enablejsapi=1`;
  };

  // When date is selected, log it for debugging
  const handleDateSelection = (dateValue: string) => {
    logger.debug(`Selecting date: ${dateValue}`);
    setSelectedDate(dateValue);
  };

  if (loading || contextLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center">
        <div className="max-w-md glass-card p-8 text-center">
          <p className="text-xl mb-4 text-error">{error}</p>
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!movie) {
    return <NotFound />;
  }

  // Safely access properties with nullish coalescing
  const { 
    title, 
    banner, 
    poster, 
    description, 
    rating = 0, 
    duration = '', 
    releaseDate = '', 
    genres = [], 
    language = '', 
    director = '', 
    cast = [],
    trailerUrl = ''
  } = movie;

  // Check if trailer is available to autoplay or display banner
  const hasTrailer = !!trailerUrl;

  return (
    <div className="pt-16 md:pt-20">
      {/* Banner or Trailer Section */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        {hasTrailer && autoplayTrailer ? (
          // Trailer Video (auto-playing at banner position)
          <div className="absolute inset-0 bg-black">
            <div className="relative w-full h-full">
              <iframe
                src={getYoutubeAutoplayUrl(trailerUrl)}
                className="w-full h-full"
                title={`${title} Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              
              {/* Gradient overlay to ensure content visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/70 to-background-dark/30 pointer-events-none"></div>
              
              {/* Controls */}
              <div className="absolute bottom-4 right-4 flex items-center space-x-3">
                <button 
                  className="p-2 rounded-full bg-background-dark/80 text-white hover:bg-background-dark"
                  onClick={() => setMuted(!muted)}
                  title={muted ? "Unmute" : "Mute"}
                >
                  {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <button 
                  className="p-2 rounded-full bg-background-dark/80 text-white hover:bg-background-dark"
                  onClick={() => setAutoplayTrailer(false)}
                  title="Show poster"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Static Banner/Poster Image
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${banner || poster})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-background-dark/30" />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <button 
                className="p-4 rounded-full bg-neon-blue/20 border border-neon-blue hover:bg-neon-blue/30 transition-colors"
                onClick={() => trailerUrl && setShowTrailer(true)}
                disabled={!trailerUrl}
                title={trailerUrl ? "Watch trailer" : "No trailer available"}
              >
                <Play size={40} className="text-white" />
              </button>
            </div>
            
            {/* Show "Autoplay trailer" button if trailer exists */}
            {hasTrailer && !autoplayTrailer && (
              <div className="absolute bottom-4 right-4">
                <button
                  onClick={() => setAutoplayTrailer(true)}
                  className="px-4 py-2 bg-neon-blue rounded text-white text-sm flex items-center"
                >
                  <Play size={16} className="mr-2" />
                  Autoplay trailer
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Trailer Modal */}
      {showTrailer && trailerUrl && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80" onClick={() => setShowTrailer(false)}>
          <div className="w-full max-w-4xl aspect-video" onClick={e => e.stopPropagation()}>
            <div className="relative w-full h-0 pb-[56.25%]">
              <iframe
                src={`${getYoutubeEmbedUrl(trailerUrl)}?autoplay=1`}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                title={`${title} Trailer`}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              ></iframe>
            </div>
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-background-dark/80 text-white hover:bg-background-dark"
              onClick={() => setShowTrailer(false)}
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 md:px-6 -mt-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Movie Poster */}
          <div className="md:col-span-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card overflow-hidden"
            >
              <img 
                src={poster} 
                alt={title} 
                className="w-full h-auto rounded-xl"
              />
            </motion.div>
          </div>

          {/* Movie Details */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
              
              {/* Ensure genres is an array before mapping */}
              <div className="flex flex-wrap gap-3 mb-6">
                {Array.isArray(genres) && genres.map((genre, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 rounded-full text-sm bg-background-light"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 mr-2" />
                  <div>
                    <p className="text-lg font-semibold">{rating}/10</p>
                    <p className="text-sm text-gray-400">Rating</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-lg font-semibold">{duration}</p>
                    <p className="text-sm text-gray-400">Duration</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-lg font-semibold">{releaseDate}</p>
                    <p className="text-sm text-gray-400">Release</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-lg font-semibold">{language}</p>
                    <p className="text-sm text-gray-400">Language</p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6 leading-relaxed">{description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Director</h3>
                  <p className="text-gray-300">{director}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Cast</h3>
                  <p className="text-gray-300">
                    {Array.isArray(cast) ? cast.join(', ') : ''}
                  </p>
                </div>
              </div>

              {/* Trailer button (only show if not auto-playing) */}
              {trailerUrl && !autoplayTrailer && (
                <button 
                  onClick={() => setShowTrailer(true)}
                  className="btn-secondary flex items-center justify-center mb-8"
                >
                  <Play size={18} className="mr-2" /> Watch Trailer
                </button>
              )}

              {/* Date Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Select Date</h3>
                <div className="flex overflow-x-auto scrollbar-hide pb-4 gap-3">
                  {dates.map((date) => (
                    <button
                      key={date.value}
                      onClick={() => handleDateSelection(date.value)}
                      className={`flex-none w-16 h-20 rounded-lg flex flex-col items-center justify-center transition-all ${
                        selectedDate === date.value
                          ? 'bg-neon-blue text-white'
                          : 'glass-card text-gray-300 hover:border-neon-blue'
                      }`}
                    >
                      <span className="text-sm">{date.day}</span>
                      <span className="text-lg font-bold">{date.date}</span>
                      <span className="text-xs">{date.month}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Showtimes */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Cinema & Showtime</h3>
                {cinemas && cinemas.length > 0 ? (
                  <MovieShowtimes 
                    movieId={movie.id} 
                    cinemas={cinemas}
                    selectedDate={selectedDate}
                  />
                ) : (
                  <div className="glass-card p-6 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-gray-400">Loading cinema data...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;