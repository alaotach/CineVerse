import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, MapPin } from 'lucide-react';
import { useCinemas } from '../../hooks/useCinemas';

const CinemaManagement = () => {
  const { cinemas } = useCinemas();
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredCinemas = cinemas.filter(cinema => 
    cinema.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cinema.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // These would be implemented in a real application
  const handleAddCinema = () => {
    alert('Add cinema functionality would be implemented here');
  };
  
  const handleEditCinema = (cinemaId: number) => {
    alert(`Edit cinema with ID ${cinemaId}`);
  };
  
  const handleDeleteCinema = (cinemaId: number) => {
    alert(`Delete cinema with ID ${cinemaId}`);
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <button 
          onClick={handleAddCinema}
          className="btn-primary flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add New Cinema
        </button>
        
        <div className="relative w-full md:w-auto md:min-w-[320px]">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search cinemas..."
            className="input-field pr-10 w-full"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>
      
      {/* Cinemas Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-background-dark">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Cinema</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Location</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Screens</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Total Seats</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredCinemas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                    {searchTerm 
                      ? "No cinemas match your search criteria" 
                      : "No cinemas added yet. Create your first cinema!"}
                  </td>
                </tr>
              ) : (
                filteredCinemas.map((cinema) => (
                  <tr 
                    key={cinema.id} 
                    className="hover:bg-background-dark/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-300">{cinema.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{cinema.name}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center">
                        <MapPin size={14} className="text-gray-400 mr-1" />
                        <span>{cinema.location}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{cinema.screens}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{cinema.totalSeats}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleEditCinema(cinema.id)}
                          className="p-1.5 text-gray-400 hover:text-white bg-background-light rounded-md transition-colors"
                          aria-label="Edit cinema"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCinema(cinema.id)}
                          className="p-1.5 text-gray-400 hover:text-error bg-background-light rounded-md transition-colors"
                          aria-label="Delete cinema"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CinemaManagement;