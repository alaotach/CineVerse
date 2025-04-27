import { jsPDF } from 'jspdf';
import { Booking } from '../types/booking';
import { format, parse, isValid } from 'date-fns';
import { logger } from '../utils/logger';
import QRCode from 'qrcode';

export const usePdf = () => {
  const generateTicketPdf = async (booking: Booking) => {
    try {
      logger.debug('Generating PDF ticket for booking:', booking);
      
      // Enhanced validation with fallbacks for missing data
      if (!booking || !booking.id) {
        throw new Error('Invalid booking data: missing booking ID');
      }
      
      // Get movie name from either movieName or movieTitle properties with fallback
      const movieName = booking.movieName || booking.movieTitle || booking.title || 'Movie Ticket';
      const trailerUrl = booking.trailerUrl || 'https://www.youtube.com'; // Default trailer URL
      
      logger.debug(`Using movie name: ${movieName}`);
      logger.debug(`Using trailer URL: ${trailerUrl}`);
      
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5'
      });
      
      // Set font
      doc.setFont('helvetica', 'normal');
      
      // PDF header with title
      doc.setFillColor(67, 97, 238); // #4361ee
      doc.rect(0, 0, 148, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text('MOVIE TICKET', 74, 10, { align: 'center' });
      doc.setFontSize(12);
      doc.text('CineVerse - Your Premium Experience', 74, 18, { align: 'center' });
      
      // Reset text color for content
      doc.setTextColor(0, 0, 0);
      
      // Movie details
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(movieName, 10, 35);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Format date for display with improved handling
      let displayDate = 'N/A';
      try {
        // Log the raw date for debugging
        logger.debug(`Raw booking date: "${booking.date}", type: ${typeof booking.date}`);
        
        if (booking.date) {
          let parsedDate: Date | null = null;
          
          // Try parsing as ISO string first
          if (typeof booking.date === 'string') {
            // Clean up date string - remove any time component if present
            const cleanDateStr = booking.date.split('T')[0];
            
            // Try parsing with different formats
            try {
              // Try ISO format (YYYY-MM-DD)
              parsedDate = parse(cleanDateStr, 'yyyy-MM-dd', new Date());
              if (isValid(parsedDate)) {
                displayDate = format(parsedDate, 'MMMM dd, yyyy');
                logger.debug(`Successfully parsed date as: ${displayDate}`);
              }
            } catch (e) {
              // Try other formats
              try {
                parsedDate = new Date(booking.date);
                if (isValid(parsedDate)) {
                  displayDate = format(parsedDate, 'MMMM dd, yyyy');
                  logger.debug(`Successfully parsed date using Date constructor: ${displayDate}`);
                }
              } catch (e2) {
                logger.error('Error parsing date with multiple methods:', e2);
              }
            }
          }
          
          // If we still don't have a valid date, use the original string
          if (displayDate === 'N/A' && typeof booking.date === 'string') {
            displayDate = booking.date;
          }
        }
      } catch (error) {
        logger.error('Error formatting date:', error);
        displayDate = booking.date || 'N/A';
      }
      
      // Create columns for info
      const leftCol = 10;
      const rightCol = 80;
      let y = 45;
      
      // Add booking info
      doc.setFont('helvetica', 'bold');
      doc.text('Booking ID:', leftCol, y);
      doc.setFont('helvetica', 'normal');
      const bookingIdDisplay = booking.id ? booking.id.substring(0, 10) + '...' : 'N/A';
      doc.text(bookingIdDisplay, leftCol + 25, y);
      
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Cinema:', leftCol, y);
      doc.setFont('helvetica', 'normal');
      doc.text(booking.cinemaName || 'N/A', leftCol + 25, y);
      
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Date:', leftCol, y);
      doc.setFont('helvetica', 'normal');
      doc.text(displayDate, leftCol + 25, y);
      
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Time:', leftCol, y);
      doc.setFont('helvetica', 'normal');
      doc.text(booking.time || booking.showtimeTime || 'N/A', leftCol + 25, y);
      
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Seats:', leftCol, y);
      doc.setFont('helvetica', 'normal');
      const seatsText = Array.isArray(booking.seats) ? booking.seats.join(', ') : 'N/A';
      doc.text(seatsText, leftCol + 25, y);
      
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Screen:', leftCol, y);
      doc.setFont('helvetica', 'normal');
      doc.text(booking.screenType || 'Standard', leftCol + 25, y);
      
      // Pricing details
      y += 15;
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT DETAILS', leftCol, y);
      
      // Use booking.totalAmount or booking.totalPrice with fallback to 0
      const amountNumber = booking.totalAmount || booking.totalPrice || 0;
      
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.text('Ticket Price:', leftCol, y);
      doc.text(`INR ${(amountNumber * 0.74).toFixed(2)}`, rightCol, y);
      
      y += 6;
      doc.text('Convenience Fee:', leftCol, y);
      doc.text(`INR ${(amountNumber * 0.08).toFixed(2)}`, rightCol, y);
      
      y += 6;
      doc.text('GST (18%):', leftCol, y);
      doc.text(`INR ${(amountNumber * 0.18).toFixed(2)}`, rightCol, y);
      
      y += 7;
      doc.line(leftCol, y, rightCol + 20, y);
      
      y += 7;
      doc.setFont('helvetica', 'bold');
      doc.text('Total Amount:', leftCol, y);
      doc.text(`INR ${amountNumber.toFixed(2)}`, rightCol, y);
      
      // Generate QR Code for the trailer URL
      const qrCodeCanvas = document.createElement('canvas');
      await QRCode.toCanvas(qrCodeCanvas, trailerUrl, { width: 100 });
      const qrCodeImage = qrCodeCanvas.toDataURL('image/png');
      
      // Add QR Code to the PDF
      doc.addImage(qrCodeImage, 'PNG', 110, 40, 28, 28);
      doc.setFontSize(8);
      doc.text('Scan for Trailer', 124, 72, { align: 'center' });
      
      // Add terms & conditions
      y += 20;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Important Information:', leftCol, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      
      const terms = [
        'Please arrive at least 15 minutes before the show starts',
        'Outside food and beverages are not allowed inside the cinema',
        'Keep this ticket handy for verification at the entrance',
        'Ticket once purchased cannot be exchanged or refunded'
      ];
      
      terms.forEach(term => {
        doc.text('• ' + term, leftCol, y);
        y += 4;
      });
      
      // Footer
      y = doc.internal.pageSize.height - 10;
      doc.setFontSize(8);
      doc.text('This e-ticket is valid when presented with a valid ID. © CineVerse', 74, y, { align: 'center' });
      
      // Save the PDF with a sanitized filename
      // Ensure movieName is safe for filenames
      const safeMovieName = movieName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const bookingIdPart = booking.id ? booking.id.substring(0, 8) : 'ticket';
      const filename = `ticket_${safeMovieName}_${bookingIdPart}.pdf`;
      
      doc.save(filename);
      logger.debug(`PDF generated successfully: ${filename}`);
      
      return true;
    } catch (error) {
      logger.error('Error generating PDF:', error);
      throw new Error('Failed to generate e-ticket');
    }
  };
  
  return { generateTicketPdf };
};
