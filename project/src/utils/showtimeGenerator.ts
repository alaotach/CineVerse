import { Showtime } from '../types/movie';
import { formatDateToYYYYMMDD } from './dateUtils';

/**
 * Generate realistic showtimes for movies
 */
export const generateShowtimes = (
  movieId: number,
  cinemaId: number,
  cinemaName: string,
  startDate?: Date,
  daysAhead = 7
): Showtime[] => {
  // Standard timeslots for movies
  const timeSlots = {
    standard: ['10:30 AM', '1:15 PM', '4:00 PM', '6:45 PM', '9:30 PM'],
    weekend: ['11:00 AM', '2:00 PM', '5:00 PM', '7:30 PM', '10:15 PM']
  };
  
  // Movie screen types with their prices
  const screenTypes = {
    'Standard': 12.99,
    'IMAX': 18.99,
    'VIP': 24.99,
    '4DX': 22.99
  };

  const showtimes: Showtime[] = [];
  const start = startDate || new Date();
  
  // Generate showtimes for the next X days
  for (let day = 0; day < daysAhead; day++) {
    const date = new Date(start);
    date.setDate(start.getDate() + day);
    
    // Format date as YYYY-MM-DD
    const formattedDate = formatDateToYYYYMMDD(date);
    
    // Determine if weekend for different timeslots
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const times = isWeekend ? timeSlots.weekend : timeSlots.standard;
    
    // Each movie gets 2-3 showtimes per day based on realistic scheduling
    const numShowtimes = Math.floor(Math.random() * 2) + 2;
    const selectedTimes = [...times].sort(() => 0.5 - Math.random()).slice(0, numShowtimes);
    
    selectedTimes.forEach((time, idx) => {
      // Choose screen type - premium screens more common on weekends and for popular movies (lower IDs)
      let screenType: keyof typeof screenTypes = 'Standard';
      
      // Premium screenings more common in evenings
      if (time === '6:45 PM' || time === '7:30 PM' || time === '9:30 PM' || time === '10:15 PM') {
        screenType = Math.random() > 0.4 ? 'IMAX' : screenType;
      }
      
      // VIP screenings more common for popular movies (lower IDs) and weekends
      if ((movieId <= 3 && Math.random() > 0.6) || (isWeekend && Math.random() > 0.7)) {
        screenType = 'VIP';
      }
      
      // 4DX for action movies (typically first in the list)
      if (movieId <= 2 && Math.random() > 0.8) {
        screenType = '4DX';
      }
      
      // Create the showtime
      showtimes.push({
        id: `show-${movieId}-${cinemaId}-${formattedDate}-${idx}`,
        movieId,
        cinemaId,
        cinemaName,
        date: formattedDate,
        time,
        screenType,
        price: screenTypes[screenType] + (Math.random() > 0.5 ? 0 : Math.random() > 0.5 ? 1 : -1)
      });
    });
  }
  
  return showtimes;
};
