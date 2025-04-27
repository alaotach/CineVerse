import { Movie } from '../../types/movie';
import MovieCard from './MovieCard';

interface MovieGridProps {
  movies: Movie[];
  loading: boolean;
  emptyMessage?: string;
}

const MovieGrid = ({ movies, loading, emptyMessage = "No movies available" }: MovieGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, index) => (
          <div 
            key={index} 
            className="flex flex-col gap-2 animate-pulse"
          >
            <div className="aspect-[2/3] glass-card bg-background-light"></div>
            <div className="h-5 bg-background-light rounded w-3/4"></div>
            <div className="h-4 bg-background-light rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-xl text-gray-300">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};

export default MovieGrid;