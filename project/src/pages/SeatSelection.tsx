import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMovies } from '../hooks/useMovies';
import { useCinemas } from '../hooks/useCinemas';
import { useBookings } from '../hooks/useBookings';
import { useAuth } from '../hooks/useAuth';
import { cinemaService } from '../services/cinemaService';
import SeatGrid from '../components/booking/SeatGrid';
import BookingSummary from '../components/booking/BookingSummary';
import NotFound from './NotFound';
import { logger } from '../utils/logger';
import LoadingScreen from '../components/common/LoadingScreen';
import { parseDate, formatDateToYYYYMMDD } from '../utils/dateUtils';

const SeatSelection = () => {
  const { movieId, showtimeId } = useParams<{ movieId: string; showtimeId: string }>();
  const { getMovieById, loading: moviesLoading } = useMovies();
  const { getShowtimeById, loading: cinemasLoading } = useCinemas();
  const { createBooking } = useBookings();
  const { user } = useAuth(); // Get current user
  const navigate = useNavigate();
  
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [allBookedSeats, setAllBookedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState<any>(null);
  const [showtime, setShowtime] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataFetched, setDataFetched] = useState(false);
  
  // This effect fetches movie data once
  useEffect(() => {
    const fetchMovie = async () => {
      if (!movieId || dataFetched) return;
      try {
        setLoading(true);
        const movieData = await getMovieById(Number(movieId));
        if (!movieData) {
          setError("Movie not found");
          return;
        }
        setMovie(movieData);
      } catch (err) {
        logger.error("Error fetching movie:", err);
        setError("Failed to load movie data");
      }
    };
    
    fetchMovie();
  }, [movieId, getMovieById, dataFetched]);
  
  // This effect fetches showtime data once
  useEffect(() => {
    const fetchShowtime = async () => {
      if (!showtimeId || dataFetched) return;
      try {
        logger.debug(`Fetching showtime with ID: ${showtimeId}`);
        const showtimeData = await getShowtimeById(showtimeId);
        
        if (showtimeData) {
          // Format date consistently
          const fixedShowtimeData = {
            ...showtimeData,
            date: showtimeData.date ? formatDateToYYYYMMDD(parseDate(showtimeData.date) || new Date()) : ''
          };
          setShowtime(fixedShowtimeData);
          logger.debug(`Successfully fetched showtime: ${JSON.stringify(fixedShowtimeData)}`);
        } else {
          logger.warn(`Showtime with ID ${showtimeId} not found`);
          setError("Showtime not found");
        }
      } catch (err) {
        logger.error("Error fetching showtime:", err);
        setError("Failed to load showtime data");
      } finally {
        setLoading(false);
        setDataFetched(true);
      }
    };
    
    if (showtimeId && !dataFetched) {
      fetchShowtime();
    }
  }, [showtimeId, getShowtimeById, dataFetched]);
  
  // This effect fetches booked seats from the new API endpoint
  useEffect(() => {
    const fetchBookedSeats = async () => {
      try {
        setLoading(true);
        if (!showtimeId) {
          logger.error("Missing showtime ID, cannot fetch booked seats");
          return;
        }
        
        logger.debug(`Fetching booked seats for showtime: ${showtimeId}`);
        const bookedSeats = await cinemaService.getBookedSeats(showtimeId);
        
        // Log the booked seats for debugging
        logger.debug(`Retrieved ${bookedSeats.length} booked seats: ${bookedSeats.join(', ')}`);
        
        setAllBookedSeats(bookedSeats);
      } catch (error) {
        logger.error("Error fetching booked seats:", error);
        // If there's an error, set to empty array to prevent breaking the UI
        setAllBookedSeats([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (showtimeId) {
      fetchBookedSeats();
    }
  }, [showtimeId]);
  
  // This effect scrolls to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // This effect updates total price when seats or showtime changes
  useEffect(() => {
    if (showtime) {
      const price = showtime.price !== undefined && !isNaN(showtime.price) ? showtime.price : 0;
      setTotalPrice(selectedSeats.length * price);
    }
  }, [selectedSeats, showtime]);
  
  // For debugging - only log once when data changes, not on every render
  useEffect(() => {
    if (movie && showtime) {
      logger.debug("SeatSelection data:", { movieId, showtimeId, movie, showtime });
    }
  }, [movieId, showtimeId, movie, showtime]);
  
  // Memoize cinema and showtime details to prevent unnecessary re-renders
  const cinemaDetails = useMemo(() => {
    if (!showtime) return { name: '', date: '', time: '', screenType: '' };
    
    return {
      name: showtime.cinemaName || '',
      date: showtime.date ? new Date(showtime.date).toLocaleDateString('en-US', { 
        weekday: 'short', month: 'short', day: 'numeric' 
      }) : '',
      time: showtime.time || '',
      screenType: showtime.screenType || ''
    };
  }, [showtime]);
  
  // Show loading screen only for initial data fetch
  if ((moviesLoading || cinemasLoading || loading) && !dataFetched) {
    return <LoadingScreen />;
  }
  
  // Show error if either movie or showtime not found
  if (!movie || !showtime || error) {
    return (
      <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center">
        <div className="max-w-md glass-card p-8 text-center">
          <p className="text-xl mb-4 text-error">{error || "Required data not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  const handleSeatToggle = (seatId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedSeats(prev => [...prev, seatId]);
    } else {
      setSelectedSeats(prev => prev.filter(seat => seat !== seatId));
    }
  };
  
  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      return;
    }
    
    setProcessing(true);
    
    try {
      // User should be available since we've already checked authentication
      if (!user || !user.id) {
        throw new Error("User information is missing");
      }
      
      // Prepare booking data
      const bookingData = {
        movieId: parseInt(movieId as string),
        movieTitle: movie.title,
        moviePoster: movie.poster,
        showtimeId: showtimeId,
        showtimeDate: showtime.date,
        showtimeTime: showtime.time,
        cinemaId: showtime.cinemaId,
        cinemaName: showtime.cinemaName,
        screenType: showtime.screenType,
        seats: selectedSeats,
        totalPrice: totalPrice,
        userId: user.id
      };
      
      logger.debug('Creating booking with data:', bookingData);
      const booking = await createBooking(bookingData);
      
      if (booking && booking.id) {
        logger.debug('Booking created successfully:', booking);
        
        // Important: Navigate to payment page first, not directly to confirmation
        navigate(`/payment/${booking.id}`, {
          state: { 
            bookingDetails: {
              ...booking,
              totalAmount: totalPrice
            } 
          }
        });
      } else {
        throw new Error("Failed to create booking");
      }
    } catch (error) {
      logger.error("Error creating booking:", error);
      setError("There was an error creating your booking. Please try again.");
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <div className="pt-16 md:pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-6 mb-8">
            <h1 className="text-2xl font-bold mb-1">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <div>{cinemaDetails.name}</div>
              <div>•</div>
              <div>{cinemaDetails.date}</div>
              <div>•</div>
              <div>{cinemaDetails.time}</div>
              <div>•</div>
              <div>{cinemaDetails.screenType}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="glass-card p-6">
                <div className="mb-6 text-center">
                  <h2 className="text-lg font-semibold mb-1">Select Your Seats</h2>
                  <p className="text-sm text-gray-400">Click on available seats to select them</p>
                </div>
                
                {/* The SeatGrid now has its own curved screen */}
                <div className="relative">
                  <SeatGrid 
                    showtimeId={showtimeId || ''} 
                    bookedSeats={allBookedSeats}
                    onSeatToggle={handleSeatToggle}
                  />
                </div>
                
                <div className="flex justify-center gap-8 mt-12">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-t-sm bg-background-light border border-gray-700"></div>
                    <span className="ml-2 text-sm text-gray-300">Available</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-t-sm bg-background-light border border-neon-purple"></div>
                    <span className="ml-2 text-sm text-gray-300">Premium</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-t-sm bg-neon-blue"></div>
                    <span className="ml-2 text-sm text-gray-300">Selected</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-t-sm bg-gray-600"></div>
                    <span className="ml-2 text-sm text-gray-300">Booked</span>
                  </div>
                </div>
              </div>
              
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">Legend</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-neon-blue">Regular Seats</span>
                    <p className="text-gray-400">Rows A-C, H-J</p>
                  </div>
                  <div>
                    <span className="font-semibold text-neon-purple">Premium Seats</span>
                    <p className="text-gray-400">Rows D-G (Center)</p>
                  </div>
                  <div>
                    <span className="font-semibold">Max Selection</span>
                    <p className="text-gray-400">10 seats per booking</p>
                  </div>
                  <div>
                    <span className="font-semibold">Seat Price</span>
                    <p className="text-gray-400">${showtime.price} per seat</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <BookingSummary 
                movie={movie}
                showtime={showtime}
                selectedSeats={selectedSeats}
                totalPrice={totalPrice}
                onBookClick={handleBooking}
                processing={processing}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;