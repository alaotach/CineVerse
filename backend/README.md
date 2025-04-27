# CineVerse Backend

This directory contains the backend server for the CineVerse movie booking application.

## Development Setup

### Running the Backend Server

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

The server should start on port 5000 by default.

## API Endpoints

The following API endpoints are available:

- `GET /movies` - Get all movies
- `GET /movies/:id` - Get a specific movie
- `GET /cinemas` - Get all cinemas
- `GET /cinemas/:id` - Get a specific cinema
- `GET /showtimes` - Get all showtimes
- `GET /showtimes/:id` - Get a specific showtime
- `GET /bookings/user` - Get bookings for the current user
- `POST /bookings` - Create a new booking
- `GET /bookings/:id` - Get a specific booking

## Troubleshooting

### Port Issues with Frontend Development

If you're seeing 404 or 500 errors when the frontend tries to access API endpoints, it might be because Vite's development server is trying to access the API endpoints directly rather than proxying them to the backend server.

Make sure your `vite.config.ts` is set up correctly to proxy API requests:

```typescript
export default defineConfig({
  // ... other config
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Make sure this points to port 5000
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

### Using Mock Data During Development

To use mock data instead of connecting to a real backend:

1. Set `VITE_USE_MOCK_DATA=true` in the frontend `.env` file
2. Restart the Vite development server

This is useful when working on the frontend without a running backend.
