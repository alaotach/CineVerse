import { useState } from 'react';
import { motion } from 'framer-motion';
import { Film, BarChart2, Users, AlertTriangle, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import MovieManagement from './MovieManagement';
import Analytics from './Analytics';
import CinemaManagement from './CinemaManagement';
import ShowtimeManagement from './ShowtimeManagement';

type TabType = 'movies' | 'cinemas' | 'showtimes' | 'analytics';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<TabType>('movies');
  const { isAuthenticated, isAdmin, showLoginPrompt } = useAuth();
  
  if (!isAuthenticated) {
    return (
      <div className="pt-20 min-h-screen">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="max-w-lg mx-auto text-center glass-card p-8">
            <AlertTriangle size={48} className="mx-auto mb-4 text-warning" />
            <h1 className="text-2xl font-bold mb-4">Login Required</h1>
            <p className="text-gray-300 mb-6">
              Please login to access the admin panel.
            </p>
            <button 
              onClick={showLoginPrompt}
              className="btn-primary"
            >
              Login Now
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="pt-20 min-h-screen">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="max-w-lg mx-auto text-center glass-card p-8">
            <AlertTriangle size={48} className="mx-auto mb-4 text-error" />
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-300 mb-6">
              You don't have permission to access the admin panel.
            </p>
            <Link to="/" className="btn-primary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pt-16 md:pt-20 min-h-screen">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-gray-300">Manage movies, cinemas, showtimes, and view analytics</p>
        </motion.div>
        
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-gray-700 mb-6 scrollbar-hide">
          <button
            onClick={() => setActiveTab('movies')}
            className={`flex items-center px-4 py-3 font-medium mr-4 transition-colors border-b-2 ${
              activeTab === 'movies'
                ? 'text-neon-blue border-neon-blue'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            <Film size={18} className="mr-2" />
            Movies
          </button>
          <button
            onClick={() => setActiveTab('cinemas')}
            className={`flex items-center px-4 py-3 font-medium mr-4 transition-colors border-b-2 ${
              activeTab === 'cinemas'
                ? 'text-neon-blue border-neon-blue'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            <Users size={18} className="mr-2" />
            Cinemas
          </button>
          <button
            onClick={() => setActiveTab('showtimes')}
            className={`flex items-center px-4 py-3 font-medium mr-4 transition-colors border-b-2 ${
              activeTab === 'showtimes'
                ? 'text-neon-blue border-neon-blue'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            <Calendar size={18} className="mr-2" />
            Showtimes
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'analytics'
                ? 'text-neon-blue border-neon-blue'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            <BarChart2 size={18} className="mr-2" />
            Analytics
          </button>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'movies' && <MovieManagement />}
        {activeTab === 'cinemas' && <CinemaManagement />}
        {activeTab === 'showtimes' && <ShowtimeManagement />}
        {activeTab === 'analytics' && <Analytics />}
      </div>
    </div>
  );
};

export default AdminPanel;