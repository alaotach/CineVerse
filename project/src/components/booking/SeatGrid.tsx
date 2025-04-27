import { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { logger } from '../../utils/logger';

interface SeatGridProps {
  showtimeId: string;
  bookedSeats: string[];
  onSeatToggle: (seatId: string, isSelected: boolean) => void;
}

// Using memo to prevent unnecessary re-renders when parent re-renders
const SeatGrid = memo(({ showtimeId, bookedSeats, onSeatToggle }: SeatGridProps) => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  
  // Log booked seats for debugging - only when they actually change
  useEffect(() => {
    logger.debug(`Showtime ${showtimeId} has ${bookedSeats.length} booked seats:`, bookedSeats);
  }, [bookedSeats.length, showtimeId]);
  
  // Generate seats grid (10 rows, 16 seats per row)
  const rows = 'ABCDEFGHIJ'.split('');
  const seatsPerRow = 16;
  
  // Premium rows (middle rows are premium)
  const premiumRows = ['H', 'I', 'J'];
  
  // Use useCallback to prevent recreation of function on each render
  const toggleSeat = useCallback((seatId: string) => {
    // Check if seat is already booked
    if (bookedSeats.includes(seatId)) {
      return;
    }
    
    setSelectedSeats(prev => {
      const isSelected = prev.includes(seatId);
      const newSelectedSeats = isSelected
        ? prev.filter(seat => seat !== seatId)
        : [...prev, seatId];
      
      // Call parent callback with updated state
      onSeatToggle(seatId, !isSelected);
      return newSelectedSeats;
    });
  }, [bookedSeats, onSeatToggle]);
  
  const getSeatStatus = useCallback((seatId: string) => {
    if (bookedSeats.includes(seatId)) return 'booked';
    if (selectedSeats.includes(seatId)) return 'selected';
    if (premiumRows.includes(seatId[0])) return 'premium';
    return 'available';
  }, [bookedSeats, selectedSeats]);
  
  // Calculate row-specific properties for the staircase effect
  const getRowProperties = (rowIndex: number) => {
    // Total rows
    const totalRows = rows.length;
    
    // Calculate vertical elevation for staircase effect
    const baseElevation = 16; // Base elevation step
    const yOffset = rowIndex * baseElevation;
    
    // Calculate Z position with a more dramatic curve
    // Front rows appear farther away (more negative Z)
    const zMin = -200; // Farthest point (front row)
    const zMax = -50;  // Closest point (back row)
    const zCurve = (rowIndex / (totalRows - 1)) ** 1.5; // Non-linear curve for better effect
    const zPosition = zMin + (zMax - zMin) * zCurve;
    
    // Scale based on position - smaller for front rows, larger for back rows
    const scaleMin = 0.75;  // Smallest scale (front row)
    const scaleMax = 1.02;  // Largest scale (back row)
    const scale = scaleMin + (scaleMax - scaleMin) * (rowIndex / (totalRows - 1));
    
    // Width scaling for perspective effect - narrower at front, wider at back
    const widthMin = 0.85;  // Front row width scale
    const widthMax = 1.05;  // Back row width scale
    const widthScale = widthMin + (widthMax - widthMin) * (rowIndex / (totalRows - 1));
    
    return { yOffset, zPosition, scale, widthScale };
  };
  
  // ...existing code...

  // Pre-calculate the entire seat grid to avoid recalculations during render
  const seatsView = rows.map((row, rowIndex) => {
    const { yOffset, zPosition, scale, widthScale } = getRowProperties(rowIndex);
    
    return (
      <div 
        key={row} 
        className="flex items-center justify-center seat-row relative"
        style={{
          transform: `translateY(${-yOffset}px) translateZ(${zPosition}px) scale(${scale})`,
          width: `${widthScale * 100}%`,
          marginBottom: '12px',
          transformOrigin: 'center bottom',
          zIndex: 10 - rowIndex // Front rows appear above back rows
        }}
      >
        <div className="w-6 sm:w-8 text-center text-gray-400 font-medium row-label">{row}</div>
        <div className="flex flex-1 justify-center gap-1 xs:gap-2 sm:gap-3">
          {Array.from({ length: seatsPerRow }).map((_, colIndex) => {
            const seatNumber = colIndex + 1;
            const seatId = `${row}${seatNumber}`;
            const status = getSeatStatus(seatId);
            
            // Create a gap in the middle (aisle) - make it wider
            const isLeftSide = colIndex < seatsPerRow / 2 - 1;
            const isRightSide = colIndex > seatsPerRow / 2;
            
            if (!isLeftSide && !isRightSide) {
              return <div key={`gap-${colIndex}`} className="w-3 sm:w-8"></div>;
            }
            
            // Seat style classes based on status with responsively sized seats
            let seatClass = 'w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 text-xs flex items-center justify-center cursor-pointer transition-all duration-200 seat-3d rounded-t-md';
            
            switch (status) {
              case 'booked':
                seatClass += ' bg-gray-600 cursor-not-allowed seat-booked';
                break;
              case 'selected':
                seatClass += ' bg-neon-blue text-white seat-selected';
                break;
              case 'premium':
                seatClass += ' bg-background-light border border-neon-purple hover:bg-neon-purple hover:text-white seat-premium';
                break;
              default:
                seatClass += ' bg-background-light border border-gray-700 hover:border-gray-500 seat-available';
            }
            
            return (
              <div className="seat-wrapper" key={seatId}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className={seatClass}
                  disabled={status === 'booked'}
                  onClick={() => toggleSeat(seatId)}
                  aria-label={`Seat ${seatId}`}
                >
                  {seatNumber}
                </motion.button>
                {/* Seat leg - adds to the theater seat look */}
                <div className="seat-leg"></div>
              </div>
            );
          })}
        </div>
        <div className="w-6 sm:w-8 text-center text-gray-400 font-medium row-label">{row}</div>
      </div>
    );
  });
  
  // Row numbers view - make this part of the 3D transform
  const rowNumbersView = (
    <div 
      className="flex w-full justify-center"
      style={{
        transform: `translateZ(-200px) scale(0.75)`, // Match the front row position
        width: '85%',
        marginTop: '1.5rem'
      }}
    >
      <div className="flex flex-1 justify-center gap-1 xs:gap-2 sm:gap-3">
        {Array.from({ length: seatsPerRow }).map((_, colIndex) => {
          const seatNumber = colIndex + 1;
          
          // Create a gap in the middle (aisle) - make it wider to match seat layout
          const isLeftSide = colIndex < seatsPerRow / 2 - 1;
          const isRightSide = colIndex > seatsPerRow / 2;
          
          if (!isLeftSide && !isRightSide) {
            return <div key={`gap-${colIndex}`} className="w-3 sm:w-8"></div>;
          }
          
          return (
            <div 
              key={`num-${seatNumber}`}
              className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs text-gray-500"
            >
              {seatNumber}
            </div>
          );
        })}
      </div>
    </div>
  );
  
  
  return (
    <div className="flex flex-col items-center w-full overflow-hidden">
      {/* Theater container with 3D perspective */}
      <div className="w-full relative">
        {/* Screen with 3D effect */}
        <div className="screen-container">
          <div className="screen-surface">
            <div className="screen-glow"></div>
          </div>
          <div className="screen-edge"></div>
          <div className="screen-label">SCREEN</div>
        </div>
        
        {/* Theater floor with subtle pattern */}
        <div className="theater-floor-container">
          <div className="theater-floor"></div>
          <div className="theater-carpet"></div>
        </div>
        
        {/* Aisle lighting */}
        <div className="aisle-lights">
          <div className="aisle-light left"></div>
          <div className="aisle-light right"></div>
        </div>
        
        {/* Seating area with 3D perspective */}
        <div className="seats-container">
          {seatsView}
        </div>
      </div>
      
      {/* Seat numbers along bottom */}
      {rowNumbersView}
    </div>
  );
});

// Add display name for debugging
SeatGrid.displayName = 'SeatGrid';

export default SeatGrid;