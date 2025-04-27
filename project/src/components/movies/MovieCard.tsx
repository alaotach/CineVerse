import { motion } from 'framer-motion';
import { Star, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Movie } from '../../types/movie';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  const { id, title, poster, rating, duration, genres } = movie;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="flex flex-col h-full"
    >
      <Link to={`/movie/${id}`} className="glass-card-hover overflow-hidden flex flex-col h-full">
        <div className="relative aspect-[2/3] overflow-hidden rounded-t-xl">
          <img 
            src={poster} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <span className="text-sm text-gray-300 mb-2">
              {genres.slice(0, 2).join(', ')}
              {genres.length > 2 && ' ...'}
            </span>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-white">{rating}/10</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-gray-300">{duration}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold line-clamp-1">{title}</h3>
          <div className="mt-auto pt-4">
            <button className="w-full btn-primary py-1.5">Book Now</button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default MovieCard;