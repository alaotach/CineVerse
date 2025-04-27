import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

const SearchBar = ({ onSearch, initialValue = '' }: SearchBarProps) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Mock suggestions based on input (a real implementation would use a trie)
  const mockSuggestions = [
    "Dune", "Dune: Part Two", "Inception", "Interstellar", 
    "The Matrix", "Avengers", "The Dark Knight", "Pulp Fiction",
    "Shawshank Redemption", "Fight Club", "Parasite", "Joker",
    "The Godfather", "Avatar", "Titanic", "Star Wars"
  ];

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  useEffect(() => {
    // Handle clicks outside the search component to close suggestions
    const handleOutsideClick = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim()) {
      // Filter suggestions that start with or contain the input value
      const filtered = mockSuggestions.filter(
        item => item.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      onSearch('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    onSearch('');
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => query.trim() && setShowSuggestions(true)}
          placeholder="Search movies..."
          className="input-field pr-20"
          aria-label="Search movies"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="p-1 text-gray-400 hover:text-white"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
          <button
            type="submit"
            className="ml-1 p-1.5 bg-neon-blue rounded-md text-white hover:bg-neon-blue/90 transition-colors"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        </div>
      </form>
      
      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute mt-1 w-full glass-card divide-y divide-gray-700 z-10 animate-in fade-in slide-in-from-top-5">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left text-gray-200 hover:bg-background-dark hover:text-white transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;