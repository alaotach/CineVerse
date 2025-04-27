import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Film, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Movie } from '../../types/movie';

interface HeroSectionProps {
  movies: Movie[];
  loading: boolean;
}

const HeroSection = ({ movies, loading }: HeroSectionProps) => {
  const [currentMovie, setCurrentMovie] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  
  // Rotate through featured movies every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (movies.length > 0) {
        setCurrentMovie((prev) => (prev + 1) % Math.min(movies.length, 3));
      }
    }, 8000);
    
    return () => clearInterval(interval);
  }, [movies.length]);

  // Extract YouTube video ID for embedding
  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return '';
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : '';
  };

  // If loading, show a placeholder
  if (loading) {
    return (
      <div className="relative h-[70vh] md:h-[80vh] bg-background-dark flex items-center justify-center">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-background-light rounded w-3/4"></div>
              <div className="h-4 bg-background-light rounded w-full"></div>
              <div className="h-4 bg-background-light rounded w-full"></div>
              <div className="h-4 bg-background-light rounded w-2/3"></div>
              <div className="pt-4 flex space-x-4">
                <div className="h-10 bg-background-light rounded w-32"></div>
                <div className="h-10 bg-background-light rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no movies are available yet, show no movies message
  if (movies.length === 0) {
    return (
      <div className="relative h-[70vh] md:h-[80vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-background-dark" />
        <div className="relative text-center">
          <Film className="h-20 w-20 text-neon-blue/30 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">No Movie Shows Available</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            We're currently updating our catalog with exciting new releases.
            Please check back soon for the latest movies.
          </p>
          <Link to="/admin" className="btn-primary">
            Add Movies
          </Link>
        </div>
      </div>
    );
  }

  const movie = movies[currentMovie];
  const hasTrailer = !!movie.trailerUrl;

  return (
    <div className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{ 
          backgroundImage: `url(${movie.banner || movie.poster})`,
          opacity: 0.4
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background-dark/60 via-background-dark/80 to-background-dark" />

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 relative h-full flex items-center">
        <div className="max-w-2xl">
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {movie.title}
            </h1>
            <p className="text-lg text-gray-300 md:text-xl">
              {movie.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                to={`/movie/${movie.id}`} 
                className="btn-primary"
              >
                Book Now
              </Link>
              <button 
                className="btn-secondary flex items-center justify-center"
                onClick={() => hasTrailer && setShowTrailer(true)}
                disabled={!hasTrailer}
                title={hasTrailer ? "Watch trailer" : "No trailer available"}
              >
                <Play size={18} className="mr-2" /> Watch Trailer
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && movie.trailerUrl && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80" onClick={() => setShowTrailer(false)}>
          <div className="w-full max-w-4xl aspect-video" onClick={e => e.stopPropagation()}>
            <div className="relative w-full h-0 pb-[56.25%]">
              <iframe
                src={`${getYoutubeEmbedUrl(movie.trailerUrl)}?autoplay=1`}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                title={`${movie.title} Trailer`}
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

      {/* Pagination Indicators */}
      {movies.length > 1 && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
          {movies.slice(0, Math.min(movies.length, 3)).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentMovie(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentMovie 
                  ? 'bg-neon-blue w-8' 
                  : 'bg-gray-500 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSection;