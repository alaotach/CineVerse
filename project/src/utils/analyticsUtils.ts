import { Booking } from '../types/movie';
import { logger } from './logger';

export const analyticsUtils = {
  // Get daily revenue for the last n days
  getDailyRevenue: (bookings: Booking[], days: number): { day: string, revenue: number }[] => {
    try {
      // If there are no bookings, return empty data structure
      if (!Array.isArray(bookings) || bookings.length === 0) {
        return Array(days).fill(null).map((_, i) => ({
          day: getDayName(i, days),
          revenue: 0
        }));
      }
      
      // Create a map for daily totals
      const dailyRevenue: Record<string, number> = {};
      const dailyMap: Record<string, string> = {};
      
      // Initialize with zeros for the last n days
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1) + i);
        
        const day = getDayName(i, days);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        dailyRevenue[day] = 0;
        dailyMap[dateStr] = day;
      }
      
      // Sum revenue by date
      bookings.forEach(booking => {
        if (booking.cancelled) return;
        
        const bookingDate = booking.date || booking.showtimeDate || booking.bookingDate;
        if (bookingDate && dailyMap[bookingDate]) {
          const day = dailyMap[bookingDate];
          const amount = parseFloat(String(booking.totalPrice || booking.totalAmount || 0));
          
          if (!isNaN(amount)) {
            dailyRevenue[day] += amount;
          }
        }
      });
      
      // Convert to array format
      return Object.keys(dailyRevenue).map(day => ({
        day,
        revenue: dailyRevenue[day]
      }));
    } catch (error) {
      logger.error('Error calculating daily revenue:', error);
      return Array(days).fill(null).map((_, i) => ({
        day: getDayName(i, days),
        revenue: 0
      }));
    }
  },

  // Get daily user activity for the last n days
  getUserActivity: (bookings: Booking[], days: number): { day: string, users: number }[] => {
    try {
      // If there are no bookings, return empty data structure
      if (!Array.isArray(bookings) || bookings.length === 0) {
        return Array(days).fill(null).map((_, i) => ({
          day: getDayName(i, days),
          users: 0
        }));
      }
      
      // Create a map for daily users
      const dailyUserSet: Record<string, Set<string>> = {};
      const dailyMap: Record<string, string> = {};
      
      // Initialize empty sets for the last n days
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1) + i);
        
        const day = getDayName(i, days);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        dailyUserSet[day] = new Set<string>();
        dailyMap[dateStr] = day;
      }
      
      // Count unique users by date
      bookings.forEach(booking => {
        // Skip cancelled bookings
        if (booking.cancelled) return;
        
        const userId = booking.userId;
        if (!userId) return;
        
        const bookingDate = booking.date || booking.showtimeDate || booking.bookingDate;
        if (bookingDate && dailyMap[bookingDate]) {
          const day = dailyMap[bookingDate];
          dailyUserSet[day].add(String(userId));
        }
      });
      
      // Convert to array format with user counts
      return Object.keys(dailyUserSet).map(day => ({
        day,
        users: dailyUserSet[day].size
      }));
    } catch (error) {
      logger.error('Error calculating user activity:', error);
      return Array(days).fill(null).map((_, i) => ({
        day: getDayName(i, days),
        users: 0
      }));
    }
  },

  // Get performance metrics by movie
  getMoviePerformance: (bookings: Booking[], movieTitleMap: Record<number, string>): any[] => {
    try {
      if (!Array.isArray(bookings) || bookings.length === 0) {
        return [];
      }
      
      // Group bookings by movie
      const movieStats: Record<string, any> = {};
      
      bookings.forEach(booking => {
        // Skip cancelled bookings
        if (booking.cancelled) return;
        
        const movieId = booking.movieId;
        if (!movieId) return;
        
        const movieIdStr = String(movieId);
        
        if (!movieStats[movieIdStr]) {
          // Use provided title from the map or from the booking itself
          const title = movieTitleMap[movieId] || 
                       booking.movieTitle || 
                       booking.movieName || 
                       `Movie #${movieId}`;
          
          movieStats[movieIdStr] = {
            id: movieId,
            title: title,
            bookings: 0,
            seats: 0,
            revenue: 0,
            poster: booking.moviePoster || ''
          };
        }
        
        // Update stats
        movieStats[movieIdStr].bookings += 1;
        movieStats[movieIdStr].seats += Array.isArray(booking.seats) ? booking.seats.length : 0;
        movieStats[movieIdStr].revenue += parseFloat(String(booking.totalPrice || booking.totalAmount || 0));
      });
      
      // Convert to array and sort by revenue
      return Object.values(movieStats).sort((a, b) => b.revenue - a.revenue);
    } catch (error) {
      logger.error('Error calculating movie performance:', error);
      return [];
    }
  }
};

// Helper function to get day names
function getDayName(index: number, totalDays: number): string {
  // For weekly view
  if (totalDays <= 7) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay(); // 0 (Sunday) to 6 (Saturday)
    const adjustedToday = today === 0 ? 6 : today - 1; // Convert to 0 (Monday) to 6 (Sunday)
    
    // Calculate the day index accounting for wrapping around the week
    const dayIndex = (adjustedToday - (totalDays - 1) + index) % 7;
    return days[dayIndex >= 0 ? dayIndex : dayIndex + 7];
  }
  
  // For monthly view
  if (totalDays <= 31) {
    const date = new Date();
    date.setDate(date.getDate() - (totalDays - 1) + index);
    return date.getDate().toString();
  }
  
  // For yearly view
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = new Date();
  date.setMonth(date.getMonth() - (totalDays - 1) + index);
  return months[date.getMonth()];
}
