import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { FaTicketAlt, FaCalendarAlt, FaClock, FaChair, FaMapMarkerAlt } from 'react-icons/fa';
import { useBookings } from '../hooks/useBookings';
import { Booking } from '../types/booking';
import { logger } from '../utils/logger';

const MyBookings: React.FC = () => {
  const { bookings, loading, error, fetchUserBookings } = useBookings();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      fetchUserBookings();
    } catch (err) {
      logger.error("Error fetching bookings in MyBookings component:", err);
    }
  }, [fetchUserBookings]);

  const handleViewTicket = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  // Improved date formatting function with better error handling
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    
    try {
      // Try to parse as ISO date first
      return format(parseISO(dateString), 'MMMM dd, yyyy');
    } catch (error) {
      // If that fails, try alternate date formats
      try {
        // Try handling YYYY-MM-DD format directly
        const parts = dateString.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
          const day = parseInt(parts[2]);
          
          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            return format(new Date(year, month, day), 'MMMM dd, yyyy');
          }
        }
        
        // If all else fails, return the original string
        return dateString;
      } catch (innerError) {
        logger.error(`Error formatting date "${dateString}":`, innerError);
        return dateString;
      }
    }
  };

  // Safe formatting function for currency
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) {
      return '0.00';
    }
    return amount.toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-md" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Ensure bookings is an array before mapping over it
  const bookingsArray = Array.isArray(bookings) ? bookings : [];
  
  return (
    <div className="container mx-auto px-4 py-8 min-h-[70vh]">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">My Bookings</h1>
        
        {bookingsArray.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto text-center">
            <FaTicketAlt className="mx-auto text-4xl text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Bookings Found</h2>
            <p className="text-gray-600 mb-6">You haven't made any bookings yet.</p>
            <button 
              onClick={() => navigate('/')} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full transition duration-300"
            >
              Browse Movies
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookingsArray.map((booking) => (
              <div 
                key={booking.id} 
                className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 border border-gray-700"
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
                  <h3 className="text-xl font-bold truncate">{booking.movieTitle || booking.movieName}</h3>
                  <p className="text-sm opacity-90 text-white">{booking.cinemaName}</p>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="flex items-center text-gray-200">
                    <FaCalendarAlt className="mr-2 text-blue-400" />
                    <span>{formatDate(booking.showtimeDate || booking.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-200">
                    <FaClock className="mr-2 text-blue-400" />
                    <span>{booking.showtimeTime || booking.time || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-gray-200">
                    <FaChair className="mr-2 text-blue-400" />
                    <span>Seats: {booking.seats.join(', ')}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white">₹{formatCurrency(booking.totalAmount || booking.totalPrice)}</span>
                      <button 
                        onClick={() => handleViewTicket(booking)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-4 rounded-full text-sm transition duration-300"
                      >
                        View Ticket
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <h3 className="text-2xl font-bold">{selectedBooking.movieTitle || selectedBooking.movieName}</h3>
                <p className="text-sm opacity-90">Booking ID: {selectedBooking.id.substring(0, 8)}</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-blue-400 mr-3 text-xl flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-400">Cinema</p>
                    <p className="font-medium text-white">{selectedBooking.cinemaName}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FaCalendarAlt className="text-blue-400 mr-3 text-xl flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-400">Date & Time</p>
                    <p className="font-medium text-white">
                      {formatDate(selectedBooking.showtimeDate || selectedBooking.date)} at {selectedBooking.showtimeTime || selectedBooking.time || 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FaChair className="text-blue-400 mr-3 text-xl flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-400">Seats</p>
                    <p className="font-medium text-white">{selectedBooking.seats.join(', ')}</p>
                  </div>
                </div>
                
                <hr className="border-gray-700" />
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-400">Total Paid</p>
                    <p className="text-xl font-bold text-white">₹{formatCurrency(selectedBooking.totalAmount || selectedBooking.totalPrice)}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/booking-confirmation/${selectedBooking.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300"
                  >
                    View E-Ticket
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-900 px-6 py-4 flex justify-end">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-300 hover:text-white font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;