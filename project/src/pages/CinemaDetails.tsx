import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Container, Typography, Box, Tab, Tabs, 
  Paper, Card, CardContent, Divider,
  Grid, Button, CircularProgress, Alert
} from '@mui/material';
import { format } from 'date-fns';
import useCinemas from '../hooks/useCinemas';
import useMovies from '../hooks/useMovies';
import CinemaDetailsComponent from '../components/common/CinemaDetails';
import { Movie } from '../types/movie';
import { Showtime } from '../types/cinema';
import { useNavigate } from 'react-router-dom';

const CinemaDetails: React.FC = () => {
  const { cinemaId } = useParams<{ cinemaId: string }>();
  const navigate = useNavigate();
  const { loadCinemaById, loadCinemaShowtimes, selectedCinema, cinemaShowtimes, loading, error } = useCinemas();
  const { movies, loadMovies, moviesLoading } = useMovies();
  const [currentDate, setCurrentDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Group showtimes by movie
  const showtimesByMovie: Record<number, Showtime[]> = {};
  cinemaShowtimes.forEach(showtime => {
    if (showtime.date === currentDate) {
      if (!showtimesByMovie[showtime.movieId]) {
        showtimesByMovie[showtime.movieId] = [];
      }
      showtimesByMovie[showtime.movieId].push(showtime);
    }
  });

  useEffect(() => {
    if (cinemaId) {
      const id = parseInt(cinemaId);
      loadCinemaById(id);
      loadCinemaShowtimes(id);
    }
    loadMovies();
  }, [cinemaId, loadCinemaById, loadCinemaShowtimes, loadMovies]);

  // Get movie data for showtimes
  const getMovieForShowtime = (movieId: number): Movie | undefined => {
    return movies.find(movie => movie.id === movieId);
  };

  // Handle booking button click
  const handleBookTickets = (showtime: Showtime) => {
    const movie = getMovieForShowtime(showtime.movieId);
    if (movie) {
      navigate(`/movies/${movie.id}/booking`, {
        state: { 
          showtime,
          movieTitle: movie.title
        }
      });
    }
  };

  if (loading || moviesLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Loading cinema details...</Typography>
      </Container>
    );
  }

  if (error || !selectedCinema) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          {error || "Cinema not found. Please try again later."}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <CinemaDetailsComponent cinema={selectedCinema} />
      
      <Typography variant="h5" sx={{ mb: 2 }}>
        Now Showing
      </Typography>
      
      {Object.keys(showtimesByMovie).length > 0 ? (
        Object.entries(showtimesByMovie).map(([movieId, showtimes]) => {
          const movie = getMovieForShowtime(parseInt(movieId));
          
          if (!movie) return null;
          
          return (
            <Card key={movieId} sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4} md={3}>
                    {movie.poster && (
                      <img 
                        src={movie.poster} 
                        alt={movie.title}
                        style={{ width: '100%', borderRadius: '4px' }}
                      />
                    )}
                  </Grid>
                  <Grid item xs={12} sm={8} md={9}>
                    <Typography variant="h6" gutterBottom>
                      {movie.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {movie.duration} mins • {movie.language} • {movie.rating}
                    </Typography>
                    
                    <Typography variant="body2" paragraph>
                      {movie.description?.substring(0, 150)}
                      {movie.description && movie.description.length > 150 ? '...' : ''}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Showtimes
                    </Typography>
                    
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {showtimes.map(showtime => (
                        <Button 
                          key={showtime.id}
                          variant="outlined"
                          size="small"
                          onClick={() => handleBookTickets(showtime)}
                          sx={{ minWidth: '90px' }}
                        >
                          {showtime.time}
                        </Button>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No showtimes available for today.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default CinemaDetails;
