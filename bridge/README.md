# CookMyShow Python Bridge

This Python bridge connects the React frontend to the C++ backend for the CookMyShow project. It handles API routing, data transformation, and error handling.

## Features

- Routes API requests from the frontend to the C++ backend
- Handles date format normalization between systems
- Provides detailed logging for debugging
- Enables CORS for frontend access

## Setup and Installation

### Prerequisites

- Python 3.9+
- pip (Python package manager)

### Installation

1. Install the required Python packages:

```bash
pip install -r requirements.txt
```

2. Configure the C++ backend URL:

```bash
# Linux/Mac
export CPP_BACKEND_URL=http://localhost:8080/api

# Windows
set CPP_BACKEND_URL=http://localhost:8080/api
```

### Running the Bridge

```bash
python app.py
```

The server will start on port 5000 by default. You can change the port using the `PORT` environment variable.

## API Endpoints

The bridge exposes the same API endpoints as the C++ backend:

- `GET /status`: Check server status
- `GET /movies`: Get all movies
- `GET /movies/{id}`: Get a specific movie
- `GET /cinemas`: Get all cinemas
- `GET /showtimes`: Get all showtimes (with optional filters)
- `GET /showtimes/{id}/seats`: Get booked seats for a showtime
- `GET /users/{userId}/bookings`: Get bookings for a user
- `POST /bookings`: Create a new booking
- `POST /bookings/{id}/cancel`: Cancel a booking
- `POST /bookings/{id}/restore`: Restore a cancelled booking

## Date Normalization

The bridge provides a utility endpoint for normalizing dates:

- `POST /utils/normalize-date`: Convert a date string to YYYY-MM-DD format

Request body:
```json
{
  "date": "26-04-2023"
}
```

Response:
```json
{
  "original": "26-04-2023",
  "normalized": "2023-04-26"
}
```

## Logging

Logs are written to `bridge.log` and also displayed in the console.
