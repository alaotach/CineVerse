import React from 'react';
import { 
  Box, Typography, Paper, Chip, Grid, 
  Card, CardContent, CardMedia, Divider 
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import { Cinema } from '../../types/cinema';

interface CinemaDetailsProps {
  cinema: Cinema;
}

const CinemaDetails: React.FC<CinemaDetailsProps> = ({ cinema }) => {
  return (
    <Card sx={{ mb: 4 }}>
      {cinema.image && (
        <CardMedia
          component="img"
          height="200"
          image={cinema.image}
          alt={cinema.name}
          sx={{ objectFit: 'cover' }}
        />
      )}
      
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {cinema.name}
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" mb={1}>
              <LocationOnIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body1">
                {cinema.location}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              {cinema.address}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" mb={1}>
              <PhoneIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body1">
                {cinema.contact}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" sx={{ ml: 4 }}>
              <LocalMoviesIcon color="primary" sx={{ mr: 1 }} fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {cinema.screens} Screens
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Amenities
        </Typography>
        
        <Box display="flex" flexWrap="wrap" gap={1}>
          {cinema.amenities.map((amenity, index) => (
            <Chip 
              key={index}
              label={amenity}
              size="small"
              variant="outlined"
              color="primary"
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CinemaDetails;
