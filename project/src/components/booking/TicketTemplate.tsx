import React from 'react';
import { Booking } from '../../types/booking';
import { format } from 'date-fns';
import { FaTicketAlt, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaChair, FaFilm } from 'react-icons/fa';

interface TicketTemplateProps {
  booking: Booking;
  showActions?: boolean;
}

const TicketTemplate: React.FC<TicketTemplateProps> = ({ booking, showActions = true }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden print:shadow-none">
      {/* Ticket Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white print:bg-gray-800">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">E-Ticket</h1>
            <p className="text-white opacity-90 mt-1">CineVerse</p>
          </div>
          <FaTicketAlt className="text-4xl opacity-90" />
        </div>
      </div>
      
      {/* Ticket Content */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2">{booking.movieName}</h2>
        <p className="text-gray-500 text-sm mb-4">Booking ID: {booking.id}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <FaMapMarkerAlt className="text-blue-600 mr-3 text-xl flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Cinema</p>
                <p className="font-medium">{booking.cinemaName}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <FaCalendarAlt className="text-blue-600 mr-3 text-xl flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Show Date</p>
                <p className="font-medium">{formatDate(booking.date)}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <FaClock className="text-blue-600 mr-3 text-xl flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Show Time</p>
                <p className="font-medium">{booking.time}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <FaChair className="text-blue-600 mr-3 text-xl flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Seats</p>
                <p className="font-medium">{booking.seats.join(', ')}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <FaFilm className="text-blue-600 mr-3 text-xl flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Screen Type</p>
                <p className="font-medium">{booking.screenType}</p>
              </div>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="text-green-600 font-medium">Status</div>
              <div className="text-lg font-semibold text-green-700">{booking.status.toUpperCase()}</div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Payment Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-bold">₹{booking.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status</span>
              <span className={`font-semibold ${booking.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                {booking.paymentStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h3 className="font-semibold mb-2">Important Information</h3>
          <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
            <li>Please arrive at least 15 minutes before the show starts</li>
            <li>Outside food and beverages are not allowed inside the cinema</li>
            <li>Keep this ticket handy for verification at the entrance</li>
            <li>Ticket once purchased cannot be exchanged or refunded</li>
          </ul>
        </div>
      </div>
      
      {/* QR Code (simplified as a placeholder) */}
      <div className="border-t border-gray-200 p-6 flex justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-gray-200 mx-auto mb-2 flex items-center justify-center">
            <span className="text-gray-500 text-xs">QR Code</span>
          </div>
          <p className="text-xs text-gray-500">Scan to verify ticket</p>
        </div>
      </div>
      
      {/* Footer with venue details */}
      <div className="bg-gray-50 p-4 text-center text-sm text-gray-600">
        <p>Thank you for choosing CineVerse!</p>
        <p className="text-xs mt-1">This is a computer-generated ticket and does not require a physical signature.</p>
      </div>
    </div>
  );
};

export default TicketTemplate;
