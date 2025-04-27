import { useState, useEffect } from 'react';
import { Alert, Button } from '@mui/material';
import { checkApiAvailability, apiHealthy } from '../../api/apiClient';
import { logger } from '../../utils/logger';
import { bookingService } from '../../services/bookingService';
import { movieService } from '../../services/movieService';
import { cinemaService } from '../../services/cinemaService';

/**
 * Component that displays a banner when the backend API is not available
 */
const BackendStatusBanner = () => {
  const [isApiAvailable, setIsApiAvailable] = useState(apiHealthy);
  const [checkCount, setCheckCount] = useState(0);
  const [usingMockData, setUsingMockData] = useState(false);

  const checkBackendStatus = async () => {
    try {
      const result = await checkApiAvailability();
      setIsApiAvailable(result.available);
      
      // Track if we're using mock data in any service
      const usingMockBookings = bookingService.isUsingMockData ? bookingService.isUsingMockData() : false;
      const usingMockMovies = movieService.isUsingMockData ? movieService.isUsingMockData() : false;
      const usingMockCinemas = cinemaService.isUsingMockData ? cinemaService.isUsingMockData() : false;
      
      const anyMockDataUsed = usingMockBookings || usingMockMovies || usingMockCinemas;
      setUsingMockData(anyMockDataUsed);
      
      if (!result.available || anyMockDataUsed) {
        logger.warn(`Backend API not responding. Status check #${checkCount + 1}`, result.error);
      } else {
        logger.debug(`Backend API is available. Status check #${checkCount + 1}`);
        // Reset mock data status if API is now available
        if (anyMockDataUsed) {
          if (bookingService.resetMockStatus) bookingService.resetMockStatus();
          if (movieService.resetMockStatus) movieService.resetMockStatus();
          if (cinemaService.resetMockStatus) cinemaService.resetMockStatus();
          setUsingMockData(false);
        }
      }
    } catch (error) {
      setIsApiAvailable(false);
      setUsingMockData(true);
      logger.error('Error checking backend status:', error);
    }
    
    setCheckCount(prev => prev + 1);
  };

  useEffect(() => {
    // Check API status when component mounts
    checkBackendStatus();
    
    // Set up polling to check API status periodically (every 30 seconds)
    const intervalId = setInterval(checkBackendStatus, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (isApiAvailable && !usingMockData) {
    return null;  // Don't show anything if API is available and not using mock data
  }

  return (
    <Alert 
      severity={usingMockData ? "info" : "warning"} 
      variant="filled"
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        width: '100%', 
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
      action={
        <Button 
          color="inherit" 
          size="small"
          onClick={checkBackendStatus}
        >
          Retry Connection
        </Button>
      }
    >
      {usingMockData 
        ? "Using demo data - some features may be limited"
        : "The booking system is currently unavailable. Some features may not work properly."}
    </Alert>
  );
};

export default BackendStatusBanner;
