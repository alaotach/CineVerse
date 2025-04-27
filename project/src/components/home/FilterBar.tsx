import { useState } from 'react';
import { Filter, X } from 'lucide-react';

interface FilterBarProps {
  onFilterChange: (type: string, value: string | number) => void;
  filters: {
    genre: string;
    language: string;
    rating: number;
  };
  onClear: () => void;
}

const FilterBar = ({ onFilterChange, filters, onClear }: FilterBarProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const genres = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", 
    "Documentary", "Drama", "Fantasy", "Horror", "Mystery", 
    "Romance", "Sci-Fi", "Thriller"
  ];

  const languages = ["English", "Spanish", "French", "Korean", "Japanese", "Hindi"];
  
  const ratings = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const isFiltersActive = filters.genre || filters.language || filters.rating > 0;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <button 
          onClick={toggleFilters}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            showFilters || isFiltersActive 
              ? 'bg-neon-blue/20 text-white' 
              : 'bg-background-light text-gray-300'
          }`}
        >
          <Filter size={18} />
          <span>Filters</span>
          {isFiltersActive && (
            <span className="ml-1 inline-flex justify-center items-center w-5 h-5 text-xs bg-neon-blue rounded-full">
              {(filters.genre ? 1 : 0) + (filters.language ? 1 : 0) + (filters.rating > 0 ? 1 : 0)}
            </span>
          )}
        </button>

        {isFiltersActive && (
          <button 
            onClick={onClear}
            className="text-sm text-gray-400 hover:text-white flex items-center"
          >
            <X size={14} className="mr-1" />
            Clear all
          </button>
        )}
      </div>

      {showFilters && (
        <div className="glass-card p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-5">
          {/* Genre Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
            <select 
              value={filters.genre}
              onChange={(e) => onFilterChange('genre', e.target.value)}
              className="input-field"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
            <select 
              value={filters.language}
              onChange={(e) => onFilterChange('language', e.target.value)}
              className="input-field"
            >
              <option value="">All Languages</option>
              {languages.map((language) => (
                <option key={language} value={language}>{language}</option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Rating</label>
            <select 
              value={filters.rating}
              onChange={(e) => onFilterChange('rating', Number(e.target.value))}
              className="input-field"
            >
              <option value="0">Any Rating</option>
              {ratings.map((rating) => (
                <option key={rating} value={rating}>{rating}+ ⭐</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {isFiltersActive && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.genre && (
            <div className="bg-background-light px-3 py-1 rounded-full text-sm flex items-center">
              <span>Genre: {filters.genre}</span>
              <button 
                onClick={() => onFilterChange('genre', '')}
                className="ml-2 text-gray-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
          )}
          
          {filters.language && (
            <div className="bg-background-light px-3 py-1 rounded-full text-sm flex items-center">
              <span>Language: {filters.language}</span>
              <button 
                onClick={() => onFilterChange('language', '')}
                className="ml-2 text-gray-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
          )}
          
          {filters.rating > 0 && (
            <div className="bg-background-light px-3 py-1 rounded-full text-sm flex items-center">
              <span>Rating: {filters.rating}+ ⭐</span>
              <button 
                onClick={() => onFilterChange('rating', 0)}
                className="ml-2 text-gray-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;