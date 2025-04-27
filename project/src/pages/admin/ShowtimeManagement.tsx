import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Calendar } from 'lucide-react';
import { useCinemas } from '../../hooks/useCinemas';
import { useMovies } from '../../hooks/useMovies';
import ShowtimeForm from './ShowtimeForm';
import { Showtime } from '../../types/movie';
import { formatDateToYYYYMMDD } from '../../utils/dateUtils';
import { cinemaService } from '../../services/cinemaService';
import { logger } from '../../utils/logger';

interface ShowtimeWithMovieTitle extends Showtime {
  movieTitle?: string;
}

const ShowtimeManagement = () => {
  const { cinemas, getShowtimesByMovie, refreshData } = useCinemas();
  const { movies } = useMovies();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState<Showtime | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Extract all showtimes from cinemas
  const allShowtimes: ShowtimeWithMovieTitle[] = [];
  
  cinemas.forEach(cinema => {
    if (cinema.showtimes) {
      cinema.showtimes.forEach(showtime => {
        const movie = movies.find(m => m.id === showtime.movieId);
        allShowtimes.push({
          ...showtime,
          movieTitle: movie?.title
        });
      });
    }
  });
  
  // Filter showtimes based on search term
  const filteredShowtimes = allShowtimes.filter(showtime => {
    const movieTitle = showtime.movieTitle?.toLowerCase() || '';
    const cinemaName = showtime.cinemaName.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return movieTitle.includes(searchLower) || 
           cinemaName.includes(searchLower) ||
           showtime.date.includes(searchLower) ||
           showtime.time.includes(searchLower);
  });
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleAddShowtime = () => {
    setEditingShowtime(null);
    setShowForm(true);
  };
  
  const handleEditShowtime = (showtime: Showtime) => {
    setEditingShowtime(showtime);
    setShowForm(true);
  };
  
  const handleSaveShowtime = async (showtimeData: Showtime) => {
    setLoading(true);
    
    try {
      if (editingShowtime?.id) {
        // Update existing showtime
        await cinemaService.updateShowtime(showtimeData);
        logger.debug("Updated showtime with ID:", editingShowtime.id);
      } else {
        // Add new showtime
        await cinemaService.addShowtime(showtimeData);
        logger.debug("Added new showtime:", showtimeData);
      }
      
      setShowForm(false);
      setEditingShowtime(null);
      
      // Refresh cinemas data to get updated showtimes
      await refreshData();
    } catch (error) {
      logger.error("Error saving showtime:", error);
      alert("There was an error saving the showtime. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingShowtime(null);
  };
  
  const handleDeleteShowtime = async (showtimeId: string) => {
    if (confirm("Are you sure you want to delete this showtime? This action cannot be undone.")) {
      try {
        setLoading(true);
        await cinemaService.deleteShowtime(showtimeId);
        
        // Refresh cinemas data to get updated showtimes
        await refreshData();
      } catch (error) {
        logger.error(`Error deleting showtime ${showtimeId}:`, error);
        alert("There was an error deleting the showtime. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <div>
      {showForm ? (
        <ShowtimeForm
          initialData={editingShowtime}
          onSave={handleSaveShowtime}
          onCancel={handleCancelForm}
          movies={movies}
          cinemas={cinemas}
          loading={loading}
        />
      ) : (
        <div>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
            <button 
              onClick={handleAddShowtime}
              className="btn-primary flex items-center"
            >
              <Plus size={18} className="mr-2" />
              Add New Showtime
            </button>
            
            <div className="relative w-full md:w-auto md:min-w-[320px]">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search showtimes..."
                className="input-field pr-10 w-full"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          
          {/* Showtimes Table */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-background-dark">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Movie</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Cinema</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Time</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Screen Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Price</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredShowtimes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                        {searchTerm 
                          ? "No showtimes match your search criteria" 
                          : "No showtimes added yet. Create your first showtime!"}
                      </td>
                    </tr>
                  ) : (
                    filteredShowtimes.map((showtime) => {
                      const movie = movies.find(m => m.id === showtime.movieId);
                      
                      return (
                        <tr 
                          key={showtime.id} 
                          className="hover:bg-background-dark/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              {movie?.poster && (
                                <div className="h-10 w-8 rounded overflow-hidden flex-shrink-0 mr-3">
                                  <img 
                                    src={movie.poster} 
                                    alt={movie.title}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              )}
                              <span>{movie?.title || `Movie ID: ${showtime.movieId}`}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">{showtime.cinemaName}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <Calendar size={14} className="text-gray-400 mr-2" />
                              {formatDate(showtime.date)}
                            </div>
                          </td>
                          <td className="px-4 py-3">{showtime.time}</td>
                          <td className="px-4 py-3">{showtime.screenType}</td>
                          <td className="px-4 py-3">₹{showtime.price.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => handleEditShowtime(showtime)}
                                className="p-1.5 text-gray-400 hover:text-white bg-background-light rounded-md transition-colors"
                                aria-label="Edit showtime"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteShowtime(showtime.id)}
                                className="p-1.5 text-gray-400 hover:text-error bg-background-light rounded-md transition-colors"
                                aria-label="Delete showtime"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
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

export default ShowtimeManagement;
