import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Eye, X } from 'lucide-react';
import { useMovies } from '../../hooks/useMovies';
import MovieForm from './MovieForm';
import { logger } from '../../utils/logger'; // Add this import

interface MovieFormData {
  id?: number;
  title: string;
  poster: string;
  banner: string;
  description: string;
  duration: string;
  releaseDate: string;
  genres: string[];
  language: string;
  rating: number;
  director: string;
  cast: string[];
}

const MovieManagement = () => {
  const { movies, addMovie, updateMovie, deleteMovie } = useMovies();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState<MovieFormData | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<number | null>(null);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddMovie = () => {
    setEditingMovie(null);
    setShowForm(true);
  };
  
  const handleEditMovie = (movieId: number) => {
    const movie = movies.find(m => m.id === movieId);
    if (movie) {
      setEditingMovie({
        id: movie.id,
        title: movie.title,
        poster: movie.poster,
        banner: movie.banner || '',
        description: movie.description,
        duration: movie.duration,
        releaseDate: movie.releaseDate,
        genres: movie.genres,
        language: movie.language,
        rating: movie.rating,
        director: movie.director,
        cast: movie.cast
      });
      setShowForm(true);
    }
  };
  
  const handleSaveMovie = (movieData: MovieFormData) => {
    try {
      if (editingMovie?.id) {
        // Update existing movie
        updateMovie(editingMovie.id, movieData);
        logger.debug("Updated movie with ID:", editingMovie.id);
      } else {
        // Add new movie
        const movieWithDefaultProperties = {
          ...movieData,
          // Make sure the movie has all required properties for booking
          id: movieData.id || Math.floor(Date.now() / 1000), // Use timestamp as ID if not provided
        };
        addMovie(movieWithDefaultProperties);
        logger.debug("Added new movie:", movieWithDefaultProperties);
      }
      setShowForm(false);
      setEditingMovie(null);
    } catch (error) {
      logger.error("Error saving movie:", error);
      alert("There was an error saving the movie. Please try again.");
    }
  };
  
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingMovie(null);
  };
  
  const handleDeleteMovie = async (movieId: number) => {
    if (confirm("Are you sure you want to delete this movie? This action cannot be undone.")) {
      await deleteMovie(movieId);
    }
  };
  
  return (
    <div>
      {showForm ? (
        <MovieForm 
          initialData={editingMovie}
          onSave={handleSaveMovie}
          onCancel={handleCancelForm}
        />
      ) : (
        <div>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
            <button 
              onClick={handleAddMovie}
              className="btn-primary flex items-center"
            >
              <Plus size={18} className="mr-2" />
              Add New Movie
            </button>
            
            <div className="relative w-full md:w-auto md:min-w-[320px]">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search movies..."
                className="input-field pr-10 w-full"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          
          {/* Movies Table */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-background-dark">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Movie</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Release Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Genres</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Rating</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredMovies.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                        {searchTerm 
                          ? "No movies match your search criteria" 
                          : "No movies added yet. Create your first movie!"}
                      </td>
                    </tr>
                  ) : (
                    filteredMovies.map((movie) => (
                      <tr 
                        key={movie.id} 
                        className="hover:bg-background-dark/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-300">{movie.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="h-12 w-9 rounded overflow-hidden flex-shrink-0">
                              <img 
                                src={movie.poster} 
                                alt={movie.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium">{movie.title}</div>
                              <div className="text-xs text-gray-400">{movie.duration}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">{movie.releaseDate}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex flex-wrap gap-1">
                            {movie.genres.slice(0, 2).map((genre, index) => (
                              <span 
                                key={index} 
                                className="inline-block px-2 py-0.5 bg-background-light text-xs rounded-full"
                              >
                                {genre}
                              </span>
                            ))}
                            {movie.genres.length > 2 && (
                              <span className="inline-block px-2 py-0.5 bg-background-light text-xs rounded-full">
                                +{movie.genres.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-yellow-500">{movie.rating}/10</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => setSelectedMovie(selectedMovie === movie.id ? null : movie.id)}
                              className="p-1.5 text-gray-400 hover:text-white bg-background-light rounded-md transition-colors"
                              aria-label="View details"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => handleEditMovie(movie.id)}
                              className="p-1.5 text-gray-400 hover:text-white bg-background-light rounded-md transition-colors"
                              aria-label="Edit movie"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteMovie(movie.id)}
                              className="p-1.5 text-gray-400 hover:text-error bg-background-light rounded-md transition-colors"
                              aria-label="Delete movie"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          {/* Movie Details Panel (when selected) */}
                          {selectedMovie === movie.id && (
                            <div className="absolute right-0 mt-2 glass-card p-4 w-80 z-10 text-left">
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="font-semibold">{movie.title}</h3>
                                <button 
                                  onClick={() => setSelectedMovie(null)}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                              <p className="text-xs text-gray-300 mb-2 line-clamp-3">{movie.description}</p>
                              <div className="text-xs text-gray-400">
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
                                  <div>Director:</div>
                                  <div className="text-gray-300">{movie.director}</div>
                                  <div>Cast:</div>
                                  <div className="text-gray-300">{movie.cast.slice(0, 2).join(', ')}{movie.cast.length > 2 ? '...' : ''}</div>
                                  <div>Language:</div>
                                  <div className="text-gray-300">{movie.language}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieManagement;