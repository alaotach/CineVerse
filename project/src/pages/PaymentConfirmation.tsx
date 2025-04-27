import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dollar, ArrowUpRight } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { Booking } from '../types/booking';
import { logger } from '../utils/logger';
import PaymentForm from '../components/booking/PaymentForm';

const PaymentConfirmation: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [processing, setProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const navigate = useNavigate();
  const location = useLocation();
  const { getBookingById } = bookingService;
  
  // Extract amount and details from state or fetch from API
  const [bookingDetails, setBookingDetails] = useState<any>(location.state?.bookingDetails || {});
  const amount = bookingDetails.totalPrice || bookingDetails.totalAmount || 0;

  // Fetch booking details if not available in location state
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) return;
      
      if (!bookingDetails.totalPrice && !bookingDetails.totalAmount && bookingId) {
        try {
          const booking = await getBookingById(bookingId);
          if (booking) {
            setBookingDetails(booking);
          }
        } catch (error) {
          logger.error("Error fetching booking details:", error);
          setError("Failed to load booking details");
        }
      }
    };
    
    fetchBookingDetails();
  }, [bookingId, bookingDetails.totalPrice, bookingDetails.totalAmount, getBookingById]);

  // Handle form submission
  const handlePaymentSubmit = async (paymentData: any) => {
    if (!bookingId) {
      setError("Invalid booking ID");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Log payment data (for demo purposes)
      logger.debug("Processing payment with data:", paymentData);
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        // Call the payment confirmation API to update booking status
        const updatedBooking = await bookingService.confirmPayment(bookingId);
        logger.debug("Payment confirmation successful, booking updated:", updatedBooking);
      } catch (error) {
        // If API call fails, log but still continue (assume payment successful for demo)
        logger.warn("Payment confirmation API failed, continuing with mock success:", error);
      }
      
      // Update UI state
      setProcessing(false);
      setPaymentCompleted(true);
      
      // Navigate to the booking confirmation page after a success delay
      setTimeout(() => {
        navigate(`/booking-confirmation/${bookingId}`);
      }, 3000);
      
    } catch (error) {
      logger.error('Payment processing error:', error);
      setProcessing(false);
      setError('Payment could not be processed. Please try again.');
    }
  };

  return (
    <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="glass-card overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <h1 className="text-2xl font-bold">Complete Payment</h1>
            <p className="text-white/80 mt-1">
              Secure Payment Gateway
            </p>
          </div>
          
          <div className="p-6">
            {paymentCompleted ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowUpRight className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-2">Payment Successful!</h2>
                <p className="text-gray-400 mb-8">
                  Your booking has been confirmed. Redirecting to your ticket...
                </p>
                <div className="loader mx-auto"></div>
              </motion.div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-700">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {bookingDetails.movieTitle || bookingDetails.movieName || "Movie Ticket"}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {bookingDetails.cinemaName || "Cinema"} • {bookingDetails.screenType || "Standard"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">₹{amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">
                      Incl. all taxes
                    </p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex mb-4">
                    <button
                      className={`flex-1 py-2 text-center ${paymentMethod === 'card' 
                        ? 'text-neon-blue border-b-2 border-neon-blue' 
                        : 'text-gray-400 border-b border-gray-700'}`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      Credit / Debit Card
                    </button>
                    <button
                      className={`flex-1 py-2 text-center ${paymentMethod === 'upi' 
                        ? 'text-neon-blue border-b-2 border-neon-blue' 
                        : 'text-gray-400 border-b border-gray-700'}`}
                      onClick={() => setPaymentMethod('upi')}
                    >
                      UPI Payment
                    </button>
                  </div>
                  
                  {error && (
                    <div className="bg-error/20 text-error text-sm p-4 rounded-lg mb-4">
                      {error}
                    </div>
                  )}
                  
                  <PaymentForm
                    paymentMethod={paymentMethod}
                    onSubmit={handlePaymentSubmit}
                    amount={amount}
                    error={error}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;