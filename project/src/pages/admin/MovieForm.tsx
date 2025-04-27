import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Film, X, Plus, Video } from 'lucide-react';

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
  trailerUrl?: string;
}

interface MovieFormProps {
  initialData: MovieFormData | null;
  onSave: (data: MovieFormData) => void;
  onCancel: () => void;
}

const MovieForm = ({ initialData, onSave, onCancel }: MovieFormProps) => {
  const isEditing = !!initialData?.id;
  
  const [formData, setFormData] = useState<MovieFormData>({
    title: '',
    poster: '',
    banner: '',
    description: '',
    duration: '',
    releaseDate: '',
    genres: [],
    language: '',
    rating: 0,
    director: '',
    cast: [''],
    trailerUrl: '',
    ...initialData
  });
  
  const [newGenre, setNewGenre] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Available languages and genres
  const languages = ["English", "Spanish", "French", "Korean", "Japanese", "Hindi"];
  const availableGenres = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", 
    "Documentary", "Drama", "Fantasy", "Horror", "Mystery", 
    "Romance", "Sci-Fi", "Thriller"
  ];
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  // Add a new genre
  const handleAddGenre = () => {
    if (newGenre && !formData.genres.includes(newGenre)) {
      setFormData({
        ...formData,
        genres: [...formData.genres, newGenre]
      });
      setNewGenre('');
    }
  };
  
  // Remove a genre
  const handleRemoveGenre = (genre: string) => {
    setFormData({
      ...formData,
      genres: formData.genres.filter(g => g !== genre)
    });
  };
  
  // Add a new cast member
  const handleAddCastMember = () => {
    setFormData({
      ...formData,
      cast: [...formData.cast, '']
    });
  };
  
  // Update cast member
  const handleCastChange = (index: number, value: string) => {
    const newCast = [...formData.cast];
    newCast[index] = value;
    setFormData({ ...formData, cast: newCast });
  };
  
  // Remove a cast member
  const handleRemoveCastMember = (index: number) => {
    const newCast = [...formData.cast];
    newCast.splice(index, 1);
    setFormData({ ...formData, cast: newCast });
  };
  
  // Validate form before submission
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.poster.trim()) newErrors.poster = 'Poster URL is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required';
    if (!formData.releaseDate.trim()) newErrors.releaseDate = 'Release date is required';
    if (formData.genres.length === 0) newErrors.genres = 'At least one genre is required';
    if (!formData.language.trim()) newErrors.language = 'Language is required';
    if (formData.rating < 0 || formData.rating > 10) newErrors.rating = 'Rating must be between 0 and 10';
    if (!formData.director.trim()) newErrors.director = 'Director is required';
    if (formData.cast.filter(c => c.trim()).length === 0) newErrors.cast = 'At least one cast member is required';
    if (formData.trailerUrl && !isValidYoutubeUrl(formData.trailerUrl)) newErrors.trailerUrl = 'Please enter a valid YouTube URL';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Check if URL is a valid YouTube URL
  const isValidYoutubeUrl = (url: string) => {
    if (!url) return true; // Allow empty trailer URLs
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})(.*)$/;
    return youtubeRegex.test(url);
  };
  
  // Extract YouTube video ID from URL for preview
  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : '';
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Remove empty cast members
    const cleanedData = {
      ...formData,
      cast: formData.cast.filter(c => c.trim())
    };
    
    if (validateForm()) {
      onSave(cleanedData);
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
            <Film className="mr-2" />
            {isEditing ? 'Edit Movie' : 'Add New Movie'}
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
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                  Movie Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`input-field ${errors.title ? 'border-error' : ''}`}
                  placeholder="Enter movie title"
                />
                {errors.title && <p className="mt-1 text-sm text-error">{errors.title}</p>}
              </div>
              
              <div>
                <label htmlFor="poster" className="block text-sm font-medium text-gray-300 mb-1">
                  Poster URL*
                </label>
                <input
                  type="text"
                  id="poster"
                  name="poster"
                  value={formData.poster}
                  onChange={handleChange}
                  className={`input-field ${errors.poster ? 'border-error' : ''}`}
                  placeholder="Enter poster image URL"
                />
                {errors.poster && <p className="mt-1 text-sm text-error">{errors.poster}</p>}
              </div>
              
              <div>
                <label htmlFor="banner" className="block text-sm font-medium text-gray-300 mb-1">
                  Banner URL (Optional)
                </label>
                <input
                  type="text"
                  id="banner"
                  name="banner"
                  value={formData.banner}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter banner image URL"
                />
              </div>
              
              <div>
                <label htmlFor="trailerUrl" className="block text-sm font-medium text-gray-300 mb-1">
                  <div className="flex items-center">
                    <Video size={16} className="mr-1 text-neon-blue" />
                    Trailer URL (YouTube)
                  </div>
                </label>
                <input
                  type="text"
                  id="trailerUrl"
                  name="trailerUrl"
                  value={formData.trailerUrl}
                  onChange={handleChange}
                  className={`input-field ${errors.trailerUrl ? 'border-error' : ''}`}
                  placeholder="e.g. https://www.youtube.com/watch?v=..."
                />
                {errors.trailerUrl && <p className="mt-1 text-sm text-error">{errors.trailerUrl}</p>}
                {formData.trailerUrl && !errors.trailerUrl && (
                  <div className="mt-2 border border-gray-700 rounded-lg overflow-hidden aspect-video">
                    <iframe
                      src={getYoutubeEmbedUrl(formData.trailerUrl)}
                      title="Trailer Preview"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">
                  Duration*
                </label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className={`input-field ${errors.duration ? 'border-error' : ''}`}
                  placeholder="e.g. 2h 15m"
                />
                {errors.duration && <p className="mt-1 text-sm text-error">{errors.duration}</p>}
              </div>
              
              <div>
                <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-300 mb-1">
                  Release Date*
                </label>
                <input
                  type="text"
                  id="releaseDate"
                  name="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleChange}
                  className={`input-field ${errors.releaseDate ? 'border-error' : ''}`}
                  placeholder="e.g. March 15, 2025"
                />
                {errors.releaseDate && <p className="mt-1 text-sm text-error">{errors.releaseDate}</p>}
              </div>
              
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-1">
                  Language*
                </label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className={`input-field ${errors.language ? 'border-error' : ''}`}
                >
                  <option value="">Select language</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                {errors.language && <p className="mt-1 text-sm text-error">{errors.language}</p>}
              </div>
              
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-300 mb-1">
                  Rating (0-10)*
                </label>
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.rating}
                  onChange={handleChange}
                  className={`input-field ${errors.rating ? 'border-error' : ''}`}
                  placeholder="Enter rating"
                />
                {errors.rating && <p className="mt-1 text-sm text-error">{errors.rating}</p>}
              </div>
            </div>
            
            {/* Additional Information */}
            <div className="space-y-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className={`input-field ${errors.description ? 'border-error' : ''}`}
                  placeholder="Enter movie description"
                ></textarea>
                {errors.description && <p className="mt-1 text-sm text-error">{errors.description}</p>}
              </div>
              
              <div>
                <label htmlFor="director" className="block text-sm font-medium text-gray-300 mb-1">
                  Director*
                </label>
                <input
                  type="text"
                  id="director"
                  name="director"
                  value={formData.director}
                  onChange={handleChange}
                  className={`input-field ${errors.director ? 'border-error' : ''}`}
                  placeholder="Enter director's name"
                />
                {errors.director && <p className="mt-1 text-sm text-error">{errors.director}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Genres*
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.genres.map((genre) => (
                    <div 
                      key={genre}
                      className="bg-background-dark px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      <span>{genre}</span>
                      <button 
                        type="button"
                        onClick={() => handleRemoveGenre(genre)}
                        className="ml-2 text-gray-400 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <select
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    className={`input-field rounded-r-none flex-grow ${errors.genres ? 'border-error' : ''}`}
                  >
                    <option value="">Select genre</option>
                    {availableGenres
                      .filter(g => !formData.genres.includes(g))
                      .map((genre) => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))
                    }
                  </select>
                  <button
                    type="button"
                    onClick={handleAddGenre}
                    disabled={!newGenre}
                    className="bg-neon-blue/80 hover:bg-neon-blue text-white px-3 rounded-r-lg"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                {errors.genres && <p className="mt-1 text-sm text-error">{errors.genres}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Cast* 
                </label>
                <div className="space-y-3">
                  {formData.cast.map((actor, index) => (
                    <div key={index} className="flex">
                      <input
                        type="text"
                        value={actor}
                        onChange={(e) => handleCastChange(index, e.target.value)}
                        className={`input-field rounded-r-none flex-grow ${
                          errors.cast && formData.cast.every(c => !c.trim())
                            ? 'border-error'
                            : ''
                        }`}
                        placeholder={`Cast member ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCastMember(index)}
                        disabled={formData.cast.length <= 1}
                        className={`px-3 text-white rounded-r-lg ${
                          formData.cast.length <= 1
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-error/80 hover:bg-error'
                        }`}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddCastMember}
                    className="text-sm text-neon-blue hover:text-white transition-colors flex items-center"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Cast Member
                  </button>
                </div>
                {errors.cast && <p className="mt-1 text-sm text-error">{errors.cast}</p>}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {isEditing ? 'Update Movie' : 'Add Movie'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default MovieForm;