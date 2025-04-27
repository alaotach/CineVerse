import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Movie } from '../../types/movie';
import { formatDateForDisplay } from '../../utils/dateUtils';

interface BookingSummaryProps {
  movie: Movie;
  showtime: {
    cinemaName: string;
    date: string;
    time: string;
    screenType: string;
    price: number;
  };
  selectedSeats: string[];
  totalPrice: number;
  onBookClick: () => void;
  processing: boolean;
}

// Use memo to prevent unnecessary re-renders
const BookingSummary = memo(({ 
  movie, 
  showtime, 
  selectedSeats, 
  totalPrice, 
  onBookClick,
  processing
}: BookingSummaryProps) => {
  // Safely format price with fallbacks
  const formatPrice = (price: number | undefined): string => {
    if (price === undefined || price === null || isNaN(price)) {
      return '0.00';
    }
    return price.toFixed(2);
  };
  
  // Memoize expensive calculations
  const formattedDate = useMemo(() => formatDateForDisplay(showtime?.date || ''), [showtime?.date]);
  const sortedSeats = useMemo(() => [...selectedSeats].sort().join(', '), [selectedSeats]);
  const ticketPriceDisplay = useMemo(() => 
    `₹${formatPrice(showtime?.price)} × ${selectedSeats.length}`, 
    [showtime?.price, selectedSeats.length]
  );
  
  const formattedTotalPrice = useMemo(() => 
    isNaN(totalPrice) ? '0.00' : totalPrice.toFixed(2),
    [totalPrice]
  );

  return (
    <div className="glass-card overflow-hidden">
      <div className="relative h-40 overflow-hidden">
        <img 
          src={movie.banner || movie.poster} 
          alt={movie.title}
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-background-dark/30"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <h2 className="text-xl font-bold">{movie.title}</h2>
          <p className="text-sm text-gray-300">{movie.duration}</p>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-400">Date</span>
            <span>{formattedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Time</span>
            <span>{showtime?.time || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Cinema</span>
            <span>{showtime?.cinemaName || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Screen</span>
            <span>{showtime?.screenType || '-'}</span>
          </div>
          
          <div className="border-t border-gray-700 my-3 pt-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Seats</span>
              <span>
                {selectedSeats.length > 0 
                  ? sortedSeats 
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-gray-400">Ticket price</span>
              <span>{ticketPriceDisplay}</span>
            </div>
          </div>
          
          <div className="border-t border-gray-700 my-3 pt-3">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>₹{formattedTotalPrice}</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={onBookClick}
          disabled={selectedSeats.length === 0 || processing}
          className={`btn-primary w-full py-3 flex items-center justify-center ${
            selectedSeats.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {processing ? (
            <>
              <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></span>
              Processing...
            </>
          ) : (
            `Book Tickets${selectedSeats.length ? ` (${selectedSeats.length})` : ''}`
          )}
        </button>
        
        <p className="mt-3 text-xs text-gray-500 text-center">
          By proceeding with the booking, you agree to our terms and conditions.
        </p>
      </div>
    </div>
  );
});

// Add display name for debugging
BookingSummary.displayName = 'BookingSummary';

export default BookingSummary;