import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookings } from '../hooks/useBookings';
import { Booking } from '../types/booking';
import { format, parseISO } from 'date-fns';
import { FaTicketAlt, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaChair, FaFilm, FaDownload, FaPrint } from 'react-icons/fa';
import ConfettiExplosion from '../components/common/ConfettiExplosion';
import { usePdf } from '../services/pdfService';
import { logger } from '../utils/logger';

// Define how to read the booking ID from URL params
interface BookingParams {
  bookingId: string;
}

const BookingConfirmation: React.FC = () => {
  // Use type assertion to ensure bookingId is treated as a string
  const { bookingId } = useParams<BookingParams>();
  const { getBookingById, loading, error } = useBookings();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { generateTicketPdf } = usePdf();

  useEffect(() => {
    // Enhanced validation of the booking ID
    if (!bookingId) {
      setLocalError("No booking ID provided");
      logger.error("No booking ID provided in URL params");
      return;
    }
    
    // Check for the [object Object] issue specifically
    if (bookingId === '[object Object]' || bookingId.includes('[object')) {
      setLocalError("Invalid booking ID format");
      logger.error(`Invalid booking ID format detected: ${bookingId}`);
      return;
    }
    
    // Ensure bookingId is a valid string
    if (typeof bookingId !== 'string') {
      setLocalError(`Invalid booking ID type: ${typeof bookingId}`);
      logger.error(`Invalid booking ID type: ${typeof bookingId}`);
      return;
    }

    const fetchBooking = async () => {
      try {
        logger.debug(`Fetching booking with ID: "${bookingId}"`);
        const fetchedBooking = await getBookingById(bookingId);
        
        if (fetchedBooking) {
          // Ensure booking has all needed fields with proper fallbacks
          const enhancedBooking = {
            ...fetchedBooking,
            totalAmount: fetchedBooking.totalAmount || fetchedBooking.totalPrice || 0,
            status: fetchedBooking.status || 'confirmed',
            paymentStatus: fetchedBooking.paymentStatus || 'completed', // Default to completed
            movieName: fetchedBooking.movieName || fetchedBooking.movieTitle || fetchedBooking.title || 'Movie Ticket',
            // Ensure we have date and time values
            date: fetchedBooking.date || fetchedBooking.showtimeDate || new Date().toISOString().split('T')[0],
            time: fetchedBooking.time || fetchedBooking.showtimeTime || 'N/A'
          };
          
          // For debugging, log the date and time values
          logger.debug(`Booking date: ${enhancedBooking.date}, time: ${enhancedBooking.time}`);
          
          setBooking(enhancedBooking);
          logger.debug("Successfully fetched booking:", enhancedBooking);
        } else {
          setLocalError("Booking not found");
          logger.error(`Booking not found for ID ${bookingId}`);
        }
      } catch (err) {
        setLocalError("Failed to fetch booking details");
        logger.error("Failed to fetch booking:", err);
      }
    };
    
    fetchBooking();
    
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [bookingId, getBookingById]);

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
        return dateString; // Return original string if formatting fails
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

  const handleDownloadTicket = async () => {
    if (booking) {
      try {
        // Ensure the booking has valid date and time before generating the PDF
        const enhancedBooking = {
          ...booking,
          movieName: booking.movieName || booking.movieTitle || booking.title || 'Movie Ticket',
          date: booking.date || booking.showtimeDate || new Date().toISOString().split('T')[0],
          time: booking.time || booking.showtimeTime || 'N/A'
        };
        
        // Debug the booking data being used for the PDF
        logger.debug('Downloading E-ticket with booking data:', {
          id: enhancedBooking.id,
          movieName: enhancedBooking.movieName,
          date: enhancedBooking.date,
          time: enhancedBooking.time
        });
        
        await generateTicketPdf(enhancedBooking);
      } catch (error) {
        logger.error("Error generating PDF:", error);
        alert("Unable to generate ticket. Please try again.");
      }
    } else {
      alert("No booking information available to generate ticket.");
    }
  };

  const handlePrintTicket = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || localError || !booking) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-md" role="alert">
          <p className="font-bold">Error</p>
          <p>{error || localError || "Booking not found"}</p>
          <button 
            onClick={() => navigate('/my-bookings')} 
            className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  // Ensure amount is available and calculate breakdown
  const totalAmount = booking.totalAmount || booking.totalPrice || 0;
  const ticketPrice = totalAmount * 0.74;
  const convenienceFee = totalAmount * 0.08;
  const gst = totalAmount * 0.18;
  const displayStatus = "CONFIRMED"; // Always show as confirmed now

  // Get correct date and time from all possible properties
  const showDate = booking.showtimeDate || booking.date || 'N/A';
  const showTime = booking.showtimeTime || booking.time || 'N/A';

  return (
    <div className="container mx-auto px-4 py-8 min-h-[70vh]">
      {showConfetti && <ConfettiExplosion />}
      
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-700">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
                <p className="text-white opacity-90 mt-1">Your tickets are ready</p>
              </div>
              <FaTicketAlt className="text-4xl opacity-90" />
            </div>
          </div>
          
          <div className="p-6" id="printable-ticket">
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2 text-white">{booking.movieName || booking.movieTitle}</h2>
                <p className="text-gray-400 text-sm mb-4">Booking ID: {booking.id.substring(0, 8)}</p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="text-blue-400 mr-3 text-xl flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-gray-400">Cinema</p>
                      <p className="font-medium text-white">{booking.cinemaName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaCalendarAlt className="text-blue-400 mr-3 text-xl flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-gray-400">Show Date</p>
                      <p className="font-medium text-white">{formatDate(showDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaClock className="text-blue-400 mr-3 text-xl flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-gray-400">Show Time</p>
                      <p className="font-medium text-white">{showTime}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaChair className="text-blue-400 mr-3 text-xl flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-gray-400">Seats</p>
                      <p className="font-medium text-white">{booking.seats.join(', ')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaFilm className="text-blue-400 mr-3 text-xl flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-gray-400">Screen Type</p>
                      <p className="font-medium text-white">{booking.screenType}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-700 pt-4 md:pt-0 md:pl-6">
                <div className="p-4 bg-gray-800 rounded-lg mb-4">
                  <h3 className="font-semibold mb-2 text-white">Payment Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ticket Price</span>
                      <span className="text-white">₹{formatCurrency(ticketPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Convenience Fee</span>
                      <span className="text-white">₹{formatCurrency(convenienceFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">GST (18%)</span>
                      <span className="text-white">₹{formatCurrency(gst)}</span>
                    </div>
                    <div className="border-t border-gray-700 my-2"></div>
                    <div className="flex justify-between font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-white">₹{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center bg-green-800 p-3 rounded-lg border border-green-700">
                  <div className="text-green-300 font-medium">Status</div>
                  <div className="text-lg font-semibold text-white">CONFIRMED</div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-4 mt-4">
              <h3 className="font-semibold mb-2 text-white">Important Information</h3>
              <ul className="text-sm text-gray-300 space-y-1 list-disc pl-5">
                <li>Please arrive at least 15 minutes before the show starts</li>
                <li>Outside food and beverages are not allowed inside the cinema</li>
                <li>Keep this ticket handy for verification at the entrance</li>
                <li>Ticket once purchased cannot be exchanged or refunded</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gray-900 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex-1">
              <button 
                onClick={() => navigate('/my-bookings')} 
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Back to My Bookings
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleDownloadTicket}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-300"
              >
                <FaDownload className="mr-2" /> Download E-Ticket
              </button>
              
              <button
                onClick={handlePrintTicket}
                className="flex items-center bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition duration-300"
              >
                <FaPrint className="mr-2" /> Print Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;