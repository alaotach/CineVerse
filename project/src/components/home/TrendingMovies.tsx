import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Movie } from '../../types/movie';
import MovieCard from '../movies/MovieCard';

interface TrendingMoviesProps {
  movies: Movie[];
  loading: boolean;
}

const TrendingMovies = ({ movies, loading }: TrendingMoviesProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    
    const { scrollWidth, clientWidth } = sliderRef.current;
    const scrollAmount = direction === 'left' ? -300 : 300;
    
    sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    
    // Update scroll position after scrolling
    setTimeout(() => {
      if (!sliderRef.current) return;
      setScrollPosition(sliderRef.current.scrollLeft);
    }, 300);
  };

  const handleScroll = () => {
    if (!sliderRef.current) return;
    setScrollPosition(sliderRef.current.scrollLeft);
  };

  // Calculate if we can scroll left/right
  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = sliderRef.current 
    ? scrollPosition < sliderRef.current.scrollWidth - sliderRef.current.clientWidth - 10
    : false;

  if (loading) {
    return (
      <div className="mt-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl md:text-3xl font-bold">Trending Now</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div 
              key={index} 
              className="aspect-[2/3] glass-card animate-pulse bg-background-light"
            />
          ))}
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold">Trending Now</h2>
        <Link to="/" className="text-neon-blue hover:text-neon-blue/80 transition-colors">
          View All
        </Link>
      </div>
      
      <div className="relative">
        {/* Scroll Left Button */}
        <button
          onClick={() => scroll('left')}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background-dark/80 p-2 rounded-full shadow-lg transition ${
            canScrollLeft 
              ? 'opacity-100 hover:bg-neon-blue/20' 
              : 'opacity-0 cursor-default'
          }`}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
        </button>
        
        {/* Movie Slider */}
        <div 
          ref={sliderRef}
          className="flex overflow-x-auto scrollbar-hide py-4 px-1 gap-4 scroll-smooth"
          onScroll={handleScroll}
        >
          {movies.map((movie) => (
            <div key={movie.id} className="flex-none w-64 md:w-72">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
        
        {/* Scroll Right Button */}
        <button
          onClick={() => scroll('right')}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background-dark/80 p-2 rounded-full shadow-lg transition ${
            canScrollRight 
              ? 'opacity-100 hover:bg-neon-blue/20' 
              : 'opacity-0 cursor-default'
          }`}
          disabled={!canScrollRight}
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default TrendingMovies;