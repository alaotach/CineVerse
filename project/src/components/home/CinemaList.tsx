import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, CardMedia,
  CardActionArea, Chip, useTheme, Link
} from '@mui/material';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Cinema } from '../../types/cinema';

interface CinemaListProps {
  cinemas: Cinema[];
  title?: string;
}

const CinemaList: React.FC<CinemaListProps> = ({ 
  cinemas, 
  title = "Popular Cinemas" 
}) => {
  const theme = useTheme();
  
  // Default fallback image for cinemas without images
  const defaultImage = "https://via.placeholder.com/300x200?text=Cinema";

  return (
    <Box sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {title}
      </Typography>
      
      <Grid container spacing={3}>
        {cinemas.map(cinema => (
          <Grid item key={cinema.id} xs={12} sm={6} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              <CardActionArea 
                component={RouterLink}
                to={`/cinemas/${cinema.id}`}
                sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={cinema.image || defaultImage}
                  alt={cinema.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" noWrap>
                    {cinema.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {cinema.location}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
                    <LocalMoviesIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {cinema.screens} {cinema.screens === 1 ? 'Screen' : 'Screens'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {cinema.amenities.slice(0, 3).map((amenity, index) => (
                      <Chip 
                        key={index} 
                        label={amenity} 
                        size="small" 
                        variant="outlined"
                      />
                    ))}
                    {cinema.amenities.length > 3 && (
                      <Chip 
                        label={`+${cinema.amenities.length - 3}`} 
                        size="small" 
                        variant="outlined"
                        color="primary"
                      />
                    )}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
        
        {cinemas.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No cinemas available at the moment.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
      
      {cinemas.length > 0 && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Link 
            component={RouterLink} 
            to="/cinemas"
            underline="hover"
            color="primary"
            sx={{ typography: 'subtitle1' }}
          >
            View All Cinemas
          </Link>
        </Box>
      )}
    </Box>
  );
};

export default CinemaList;
