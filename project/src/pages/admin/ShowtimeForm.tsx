import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, X, Clock, Film, MapPin } from 'lucide-react';
import { Movie, Cinema, Showtime } from '../../types/movie';
import { formatDateToYYYYMMDD } from '../../utils/dateUtils';

interface ShowtimeFormData {
  id?: string;
  movieId: number;
  cinemaId: number;
  cinemaName: string;
  date: string;
  time: string;
  screenType: string;
  price: number;
}

interface ShowtimeFormProps {
  initialData: Showtime | null;
  onSave: (data: ShowtimeFormData) => void;
  onCancel: () => void;
  movies: Movie[];
  cinemas: Cinema[];
  loading: boolean;
}

const ShowtimeForm = ({ initialData, onSave, onCancel, movies, cinemas, loading }: ShowtimeFormProps) => {
  const isEditing = !!initialData?.id;
  
  const [formData, setFormData] = useState<ShowtimeFormData>({
    movieId: 0,
    cinemaId: 0,
    cinemaName: '',
    date: formatDateToYYYYMMDD(new Date()),
    time: '12:00 PM',
    screenType: 'Standard',
    price: 12.99,
    ...initialData
  });
  
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Set selected cinema when cinemaId changes
  useEffect(() => {
    if (formData.cinemaId) {
      const cinema = cinemas.find(c => c.id === formData.cinemaId);
      if (cinema) {
        setSelectedCinema(cinema);
        
        // Also update the cinema name in form data
        setFormData(prev => ({
          ...prev,
          cinemaName: cinema.name
        }));
      }
    }
  }, [formData.cinemaId, cinemas]);
  
  // Available screen types
  const screenTypes = ['Standard', 'IMAX', '3D', '4DX', 'Dolby Atmos', 'VIP', 'Premium'];
  
  // Standard times
  const standardTimes = [
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', 
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', 
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
    '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
    '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
    '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM',
    '10:00 PM', '10:30 PM', '11:00 PM'
  ];
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for numeric values
    if (name === 'price') {
      const price = parseFloat(value);
      setFormData({ ...formData, [name]: isNaN(price) ? 0 : price });
    } else if (name === 'movieId' || name === 'cinemaId') {
      setFormData({ ...formData, [name]: parseInt(value, 10) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  // Validate form before submission
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.movieId) newErrors.movieId = 'Movie is required';
    if (!formData.cinemaId) newErrors.cinemaId = 'Cinema is required';
    if (!formData.date.trim()) newErrors.date = 'Date is required';
    if (!formData.time.trim()) newErrors.time = 'Time is required';
    if (!formData.screenType.trim()) newErrors.screenType = 'Screen type is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };
  
  // Format date for display
  const formatDateForInput = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center">
            <Calendar className="mr-2" />
            {isEditing ? 'Edit Showtime' : 'Add New Showtime'}
          </h2>
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Movie Selection */}
            <div>
              <label htmlFor="movieId" className="block text-sm font-medium text-gray-300 mb-1">
                <div className="flex items-center">
                  <Film size={16} className="mr-1 text-neon-blue" />
                  Movie*
                </div>
              </label>
              <select
                id="movieId"
                name="movieId"
                value={formData.movieId}
                onChange={handleChange}
                className={`input-field ${errors.movieId ? 'border-error' : ''}`}
              >
                <option value={0}>Select a movie</option>
                {movies.map((movie) => (
                  <option key={movie.id} value={movie.id}>
                    {movie.title}
                  </option>
                ))}
              </select>
              {errors.movieId && <p className="mt-1 text-sm text-error">{errors.movieId}</p>}
              
              {formData.movieId > 0 && (
                <div className="mt-2 flex items-center">
                  {movies.find(m => m.id === formData.movieId)?.poster && (
                    <div className="h-16 w-12 rounded overflow-hidden">
                      <img 
                        src={movies.find(m => m.id === formData.movieId)?.poster} 
                        alt={movies.find(m => m.id === formData.movieId)?.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="ml-3">
                    <p className="text-white">{movies.find(m => m.id === formData.movieId)?.title}</p>
                    <p className="text-sm text-gray-400">{movies.find(m => m.id === formData.movieId)?.duration}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Cinema Selection */}
            <div>
              <label htmlFor="cinemaId" className="block text-sm font-medium text-gray-300 mb-1">
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1 text-neon-blue" />
                  Cinema*
                </div>
              </label>
              <select
                id="cinemaId"
                name="cinemaId"
                value={formData.cinemaId}
                onChange={handleChange}
                className={`input-field ${errors.cinemaId ? 'border-error' : ''}`}
              >
                <option value={0}>Select a cinema</option>
                {cinemas.map((cinema) => (
                  <option key={cinema.id} value={cinema.id}>
                    {cinema.name}
                  </option>
                ))}
              </select>
              {errors.cinemaId && <p className="mt-1 text-sm text-error">{errors.cinemaId}</p>}
              
              {selectedCinema && (
                <div className="mt-2">
                  <p className="text-white">{selectedCinema.name}</p>
                  <p className="text-sm text-gray-400">{selectedCinema.location}</p>
                </div>
              )}
            </div>
            
            {/* Date Selection */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1 text-neon-blue" />
                  Date*
                </div>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formatDateForInput(formData.date)}
                onChange={handleChange}
                className={`input-field ${errors.date ? 'border-error' : ''}`}
                min={formatDateForInput(new Date().toISOString())}
              />
              {errors.date && <p className="mt-1 text-sm text-error">{errors.date}</p>}
            </div>
            
            {/* Time Selection */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-1">
                <div className="flex items-center">
                  <Clock size={16} className="mr-1 text-neon-blue" />
                  Time*
                </div>
              </label>
              <select
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={`input-field ${errors.time ? 'border-error' : ''}`}
              >
                <option value="">Select time</option>
                {standardTimes.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              {errors.time && <p className="mt-1 text-sm text-error">{errors.time}</p>}
            </div>
            
            {/* Screen Type */}
            <div>
              <label htmlFor="screenType" className="block text-sm font-medium text-gray-300 mb-1">
                Screen Type*
              </label>
              <select
                id="screenType"
                name="screenType"
                value={formData.screenType}
                onChange={handleChange}
                className={`input-field ${errors.screenType ? 'border-error' : ''}`}
              >
                <option value="">Select screen type</option>
                {screenTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.screenType && <p className="mt-1 text-sm text-error">{errors.screenType}</p>}
            </div>
            
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
                Ticket Price*
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`input-field pl-8 ${errors.price ? 'border-error' : ''}`}
                  placeholder="0.00"
                />
              </div>
              {errors.price && <p className="mt-1 text-sm text-error">{errors.price}</p>}
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                isEditing ? 'Update Showtime' : 'Create Showtime'
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ShowtimeForm;
