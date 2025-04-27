import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Users, Ticket } from 'lucide-react';
import Chart from '../../components/admin/Chart';
import { analyticsUtils } from '../../utils/analyticsUtils';
import { logger } from '../../utils/logger';
import { bookingService } from '../../services/bookingService';
import { Booking, Movie } from '../../types/movie';
import { useMovies } from '../../hooks/useMovies';

const Analytics = () => {
  const { movies } = useMovies();
  const [period, setPeriod] = useState('week');
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Fetch analytics data from the API directly
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Try to get analytics data from the API
        const data = await bookingService.getAnalytics();
        setAnalyticsData(data);
        logger.debug('Fetched analytics data from API:', data);
        
        // Also fetch all bookings for any custom analytics
        const bookings = await bookingService.getAllBookings();
        setAllBookings(bookings || []);
        
        logger.debug(`Loaded analytics data and ${bookings ? bookings.length : 0} bookings`);
      } catch (error) {
        logger.error('Error fetching analytics data:', error);
        
        // Fallback: Calculate analytics from bookings if API fails
        try {
          const bookings = await bookingService.getAllBookings();
          setAllBookings(bookings || []); 
          
          if (bookings && bookings.length > 0) {
            // Create analytics data structure from bookings
            const validBookings = bookings.filter(booking => !booking.cancelled);
            const totalRevenue = validBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
            const uniqueUsers = new Set(bookings.map(booking => booking.userId).filter(Boolean)).size;
            
            setAnalyticsData({
              totalBookings: validBookings.length,
              totalRevenue: totalRevenue,
              uniqueUsers: uniqueUsers,
              dailyRevenue: analyticsUtils.getDailyRevenue(bookings, 7),
              userActivity: analyticsUtils.getUserActivity(bookings, 7),
            });
            
            logger.debug(`Fallback: Created analytics from ${bookings.length} bookings`);
          } else {
            setAnalyticsData({
              totalBookings: 0,
              totalRevenue: 0,
              uniqueUsers: 0,
              dailyRevenue: [],
              userActivity: [],
              topMovies: []
            });
            logger.debug('No booking data available for analytics');
          }
        } catch (fallbackError) {
          logger.error('Error in fallback analytics calculation:', fallbackError);
          setAnalyticsData(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [period]); // Now period is included as a dependency to refresh data when it changes

  // Create a map of movie IDs to titles for the analytics utility
  const movieTitlesMap = (movies || []).reduce<Record<number, string>>((acc, movie) => {
    if (movie && movie.id) {
      acc[movie.id] = movie.title;
    }
    return acc;
  }, {});

  // Create a map of movie IDs to posters for the analytics utility
  const moviePostersMap = (movies || []).reduce<Record<number, string>>((acc, movie) => {
    if (movie && movie.id) {
      acc[movie.id] = movie.poster;
    }
    return acc;
  }, {});

  // Use topMovies directly from the API response if available, or calculate it using the utility
  const topMovies = analyticsData?.topMovies || 
    analyticsUtils.getMoviePerformance(allBookings, movieTitlesMap);
  
  // Update the posters from our movie data when available
  topMovies.forEach(movie => {
    if (moviePostersMap[movie.id]) {
      movie.poster = moviePostersMap[movie.id];
    }
  });

  // Get chart data based on selected period
  const getDaysForPeriod = () => {
    switch(period) {
      case 'month': return 30;
      case 'year': return 12; // For year, we group by months instead of days
      default: return 7; // week
    }
  };

  // Use analytics data if available
  const dailyRevenue = analyticsData?.dailyRevenue || [];
  const userActivity = analyticsData?.userActivity || [];

  // Only use non-cancelled bookings for calculations
  const validBookings = Array.isArray(allBookings) 
    ? allBookings.filter(booking => !booking.cancelled)
    : [];

  // Safe access to analytics data with fallbacks
  const getTotalBookings = () => analyticsData?.totalBookings || validBookings.length || 0;
  const getTotalRevenue = () => analyticsData?.totalRevenue || 
    validBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
  const getActiveUsers = () => analyticsData?.uniqueUsers || 
    new Set((validBookings || []).map(booking => booking.userId).filter(Boolean)).size;

  // Previous period values (simulated 10-15% lower for demo)
  const prevPeriodBookings = Math.max(1, Math.floor(getTotalBookings() * 0.85)); 
  const prevPeriodRevenue = Math.max(0.01, getTotalRevenue() * 0.90);
  const prevPeriodUsers = Math.max(1, Math.floor(getActiveUsers() * 0.88));

  // Calculate percentage changes
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) {
      return { value: 100, display: 'New' };
    }
    const percentage = Math.round(((current - previous) / previous) * 100);
    return { value: percentage, display: `${Math.abs(percentage)}%` };
  };

  const bookingsChange = calculatePercentageChange(getTotalBookings(), prevPeriodBookings);
  const revenueChange = calculatePercentageChange(getTotalRevenue(), prevPeriodRevenue);
  const usersChange = calculatePercentageChange(getActiveUsers(), prevPeriodUsers);

  // Calculate upcoming shows (simplified)
  const upcomingShowsCount = (movies || []).length ? (movies || []).length * 3 : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loader"></div>
        <span className="ml-3">Loading analytics data...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Analytics Period Filter */}
      <div className="flex justify-end mb-6">
        <div className="glass-card p-1 inline-flex">
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-1.5 text-sm rounded-md ${
              period === 'week'
                ? 'bg-neon-blue text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-1.5 text-sm rounded-md ${
              period === 'month'
                ? 'bg-neon-blue text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-4 py-1.5 text-sm rounded-md ${
              period === 'year'
                ? 'bg-neon-blue text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Bookings</p>
              <h3 className="text-2xl font-bold">{getTotalBookings()}</h3>
              <p className={`text-sm mt-2 ${bookingsChange.value >= 0 ? 'text-neon-blue' : 'text-error'}`}>
                {bookingsChange.value >= 0 ? '↑' : '↓'} {bookingsChange.display} {bookingsChange.value !== 0 ? (bookingsChange.value >= 0 ? 'increase' : 'decrease') : ''}
              </p>
            </div>
            <div className="bg-neon-blue/10 p-3 rounded-lg">
              <Ticket className="text-neon-blue" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm mb-1">Revenue</p>
              <h3 className="text-2xl font-bold">₹{getTotalRevenue().toFixed(2)}</h3>
              <p className={`text-sm mt-2 ${revenueChange.value >= 0 ? 'text-neon-teal' : 'text-error'}`}>
                {revenueChange.value >= 0 ? '↑' : '↓'} {revenueChange.display} {revenueChange.value !== 0 ? (revenueChange.value >= 0 ? 'increase' : 'decrease') : ''}
              </p>
            </div>
            <div className="bg-neon-teal/10 p-3 rounded-lg">
              <TrendingUp className="text-neon-teal" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm mb-1">Active Users</p>
              <h3 className="text-2xl font-bold">{getActiveUsers()}</h3>
              <p className={`text-sm mt-2 ${usersChange.value >= 0 ? 'text-neon-purple' : 'text-error'}`}>
                {usersChange.value >= 0 ? '↑' : '↓'} {usersChange.display} {usersChange.value !== 0 ? (usersChange.value >= 0 ? 'increase' : 'decrease') : ''}
              </p>
            </div>
            <div className="bg-neon-purple/10 p-3 rounded-lg">
              <Users className="text-neon-purple" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm mb-1">Upcoming Shows</p>
              <h3 className="text-2xl font-bold">{upcomingShowsCount}</h3>
              <p className="text-neon-pink text-sm mt-2">Next: Today, 5:30 PM</p>
            </div>
            <div className="bg-neon-pink/10 p-3 rounded-lg">
              <Calendar className="text-neon-pink" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Revenue ({period})</h3>
          <div className="h-64">
            <Chart 
              data={Array.isArray(dailyRevenue) ? dailyRevenue : []}
              xKey="day"
              yKey="revenue"
              color="#4361ee"
              prefix="₹"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4">User Activity ({period})</h3>
          <div className="h-64">
            <Chart 
              data={Array.isArray(userActivity) ? userActivity : []}
              xKey="day"
              yKey="users"
              color="#7209b7"
            />
          </div>
        </motion.div>
      </div>

      {/* Top Movies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 mb-8"
      >
        <h3 className="text-lg font-semibold mb-4">Top Performing Movies</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Movie</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Bookings</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Seats Sold</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Revenue</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Occupancy Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {Array.isArray(topMovies) && topMovies.length > 0 ? (
                topMovies.map((movie) => {
                  // Calculate occupancy rate based on seats sold
                  const totalAvailableSeats = 200; // This would be from database in production
                  const occupancyRate = movie.seats > 0 
                    ? Math.min(Math.round((movie.seats / totalAvailableSeats) * 100), 100)
                    : 0;

                  return (
                    <tr key={movie.id} className="hover:bg-background-dark/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-9 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={movie.poster} 
                              alt={movie.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                // Fallback for missing images
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/90x120?text=No+Image';
                              }}
                            />
                          </div>
                          <span className="font-medium">{movie.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">{movie.bookings}</td>
                      <td className="px-4 py-3 text-right">{movie.seats}</td>
                      <td className="px-4 py-3 text-right">₹{movie.revenue.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end">
                          <span className="mr-2">{occupancyRate}%</span>
                          <div className="w-16 bg-background-dark rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                occupancyRate > 60 ? 'bg-neon-blue' : 'bg-neon-teal'
                              }`}
                              style={{ width: `${occupancyRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                    No booking data available yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;