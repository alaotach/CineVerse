from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import logging
from datetime import datetime, timedelta
import requests

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                   filename='bridge.log',
                   handlers=[
                       logging.FileHandler("bridge.log"),
                       logging.StreamHandler()
                   ])
logger = logging.getLogger('bridge-api')

# Path to data directory
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend', 'data')

# Ensure data directory exists
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)
    logger.info(f"Created data directory: {DATA_DIR}")

# Configuration
BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8080/api")

# Helper functions to load and save JSON data
def load_json_data(filename):
    filepath = os.path.join(DATA_DIR, filename)
    try:
        if os.path.exists(filepath):
            with open(filepath, 'r') as file:
                return json.load(file)
        else:
            logger.warning(f"File not found: {filepath}")
            return []
    except Exception as e:
        logger.error(f"Error loading {filename}: {str(e)}")
        return []

def save_json_data(filename, data):
    filepath = os.path.join(DATA_DIR, filename)
    try:
        with open(filepath, 'w') as file:
            json.dump(data, file, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error saving {filename}: {str(e)}")
        return False

def forward_request(endpoint, method='GET', data=None, params=None):
    url = f"{BACKEND_URL}/{endpoint}"
    logger.info(f"{method} request to {url}")
    
    try:
        if method == 'GET':
            response = requests.get(url, params=params)
        elif method == 'POST':
            response = requests.post(url, json=data)
        elif method == 'PUT':
            response = requests.put(url, json=data)
        elif method == 'DELETE':
            response = requests.delete(url)
        else:
            return jsonify({"error": "Invalid method"}), 400
        
        return response.json(), response.status_code
    except requests.RequestException as e:
        logger.error(f"Error forwarding request to {url}: {e}")
        return {"error": str(e)}, 500

# API Health Check
@app.route('/api/health', methods=['GET'])
@app.route('/api/status', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "API server is running"})

# Movies API
@app.route('/api/movies', methods=['GET'])
def get_all_movies():
    movies = load_json_data('movies.json')
    return jsonify(movies)

@app.route('/api/movies/<int:id>', methods=['GET'])
def get_movie_by_id(id):
    movies = load_json_data('movies.json')
    movie = next((m for m in movies if m["id"] == id), None)
    if movie:
        return jsonify(movie)
    return jsonify({"error": "Movie not found"}), 404

# Cinemas API
@app.route('/api/cinemas', methods=['GET'])
def get_all_cinemas():
    cinemas = load_json_data('cinemas.json')
    return jsonify(cinemas)

@app.route('/api/cinemas/<int:id>', methods=['GET'])
def get_cinema_by_id(id):
    cinemas = load_json_data('cinemas.json')
    cinema = next((c for c in cinemas if c["id"] == id), None)
    if cinema:
        return jsonify(cinema)
    return jsonify({"error": "Cinema not found"}), 404

# Showtimes API
@app.route('/api/showtimes', methods=['GET', 'POST'])
def get_showtimes():
    if request.method == 'GET':
        showtimes = load_json_data('showtimes.json')
        
        # Filter by movie ID if provided
        movie_id = request.args.get('movieId')
        if movie_id:
            try:
                movie_id = int(movie_id)
                showtimes = [s for s in showtimes if s.get("movieId") == movie_id]
            except ValueError:
                pass
        
        # Filter by date if provided
        date = request.args.get('date')
        if date:
            showtimes = [s for s in showtimes if s.get("date") == date]
        
        return jsonify(showtimes)
    elif request.method == 'POST':
        # Create a new showtime
        try:
            showtime_data = request.json
            if not showtime_data:
                return jsonify({"error": "Invalid or missing showtime data"}), 400
            
            # Validate required fields
            required_fields = ['movieId', 'cinemaId', 'date', 'time', 'price']
            for field in required_fields:
                if field not in showtime_data:
                    return jsonify({"error": f"Missing required field: {field}"}), 400
            
            # Generate showtime ID if not provided
            if 'id' not in showtime_data:
                showtime_data['id'] = f"show-{int(datetime.now().timestamp())}"
            
            # Add cinema name if not provided but cinema exists
            if 'cinemaName' not in showtime_data and showtime_data.get('cinemaId'):
                cinemas = load_json_data('cinemas.json')
                cinema = next((c for c in cinemas if c.get('id') == showtime_data['cinemaId']), None)
                if cinema:
                    showtime_data['cinemaName'] = cinema.get('name', '')
            
            # Set default screen type if not provided
            if 'screenType' not in showtime_data:
                showtime_data['screenType'] = 'Standard'
            
            # Load existing showtimes
            showtimes = load_json_data('showtimes.json')
            
            # Check if a showtime with this ID already exists
            existing_showtime = next((s for s in showtimes if s.get('id') == showtime_data['id']), None)
            if existing_showtime:
                return jsonify({"error": f"Showtime with ID {showtime_data['id']} already exists"}), 409
            
            # Add the new showtime
            showtimes.append(showtime_data)
            
            # Save the updated showtimes list
            if save_json_data('showtimes.json', showtimes):
                logger.info(f"Created new showtime with ID: {showtime_data['id']}")
                return jsonify(showtime_data), 201
            else:
                return jsonify({"error": "Failed to save showtime"}), 500
                
        except Exception as e:
            logger.error(f"Error creating showtime: {str(e)}")
            return jsonify({"error": f"Failed to create showtime: {str(e)}"}), 500

# NEW ENDPOINT: Get booked seats for a specific showtime
@app.route('/api/showtimes/<string:showtime_id>/seats', methods=['GET'])
def get_booked_seats(showtime_id):
    try:
        # Load all bookings
        bookings = load_json_data('bookings.json')
        
        # Filter bookings for this showtime and exclude cancelled bookings
        showtime_bookings = [b for b in bookings 
                            if (b.get("showtimeId") == showtime_id or b.get("showtime_id") == showtime_id) 
                            and not b.get("cancelled", False)]
        
        # Extract all seats
        booked_seats = []
        for booking in showtime_bookings:
            if booking.get("seats") and isinstance(booking["seats"], list):
                booked_seats.extend(booking["seats"])
        
        logger.info(f"Found {len(booked_seats)} booked seats for showtime {showtime_id}")
        
        # Return as a JSON array
        return jsonify(booked_seats)
    except Exception as e:
        logger.error(f"Error getting booked seats for showtime {showtime_id}: {str(e)}")
        return jsonify({"error": f"Failed to get booked seats: {str(e)}"}), 500

# Bookings API - FIXED to handle both GET and POST methods
@app.route('/api/bookings', methods=['GET', 'POST'])
def bookings_endpoint():
    if request.method == 'GET':
        # Return all bookings
        bookings = load_json_data('bookings.json')
        return jsonify(bookings)
    elif request.method == 'POST':
        # Create a new booking
        booking_data = request.json
        if not booking_data:
            return jsonify({"error": "Invalid booking data"}), 400
            
        bookings = load_json_data('bookings.json')
        
        # Generate a new ID if not provided
        if not booking_data.get("id"):
            booking_data["id"] = f"booking-{len(bookings) + 1}"
        
        # Add created timestamp if not provided
        if not booking_data.get("created"):
            booking_data["created"] = datetime.now().isoformat()
        
        # Set default status
        if not booking_data.get("status"):
            booking_data["status"] = "confirmed"
            
        # Add to bookings list
        bookings.append(booking_data)
        
        # Save updated bookings
        if save_json_data('bookings.json', bookings):
            return jsonify(booking_data), 201
        else:
            return jsonify({"error": "Failed to save booking"}), 500

# User Bookings API - FIXED paths to match what frontend expects
@app.route('/api/bookings/user', methods=['GET'])
@app.route('/api/bookings/user/<string:user_id>', methods=['GET'])
def get_user_bookings(user_id=None):
    bookings = load_json_data('bookings.json')
    
    # If no user_id is provided, try to get it from query parameters
    if user_id is None:
        user_id = request.args.get('userId', '1')  # Default to '1' for testing
    
    # Convert user_id to string to ensure consistent comparison
    user_id = str(user_id)
    
    # Filter bookings by user_id
    user_bookings = [b for b in bookings if str(b.get("userId")) == user_id]
    
    logger.info(f"Found {len(user_bookings)} bookings for user {user_id}")
    return jsonify(user_bookings)

@app.route('/api/bookings/<string:booking_id>', methods=['GET'])
def get_booking_by_id(booking_id):
    bookings = load_json_data('bookings.json')
    booking = next((b for b in bookings if str(b["id"]) == str(booking_id)), None)
    if booking:
        return jsonify(booking)
    return jsonify({"error": "Booking not found"}), 404

# Analytics API
@app.route('/api/admin/analytics', methods=['GET'])
def get_analytics():
    bookings = load_json_data('bookings.json')
    
    # Filter out cancelled bookings
    valid_bookings = [b for b in bookings if not b.get('cancelled', False)]
    
    # Calculate total revenue, bookings, and unique users
    total_bookings = len(valid_bookings)
    total_revenue = sum(float(b.get('totalPrice', 0)) for b in valid_bookings)
    unique_users = len(set(str(b.get('userId', '')) for b in valid_bookings))
    
    # Get current day of week
    today = datetime.now()
    
    # Calculate daily revenue for the past week
    days_of_week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    daily_revenue = []
    daily_users = []
    
    # Initialize with zeros
    for day in days_of_week:
        daily_revenue.append({'day': day, 'revenue': 0})
        daily_users.append({'day': day, 'users': 0})
    
    # Calculate revenue for each day
    for booking in valid_bookings:
        # Get booking date
        booking_date_str = booking.get('bookingDate') or booking.get('date') or booking.get('created')
        if booking_date_str:
            try:
                # Try to parse the date string
                booking_date = None
                if 'T' in booking_date_str:  # ISO format
                    booking_date = datetime.fromisoformat(booking_date_str.replace('Z', '+00:00'))
                else:  # YYYY-MM-DD format
                    booking_date = datetime.strptime(booking_date_str, '%Y-%m-%d')
                
                if booking_date:
                    # Get day of week index (0 = Monday)
                    day_idx = booking_date.weekday()
                    
                    # Add revenue to the corresponding day
                    daily_revenue[day_idx]['revenue'] += float(booking.get('totalPrice', 0))
                    
                    # Add user to the set of users for this day
                    user_id = str(booking.get('userId', ''))
                    if user_id:
                        # Just increment by 1 for simplicity
                        daily_users[day_idx]['users'] += 1
            except Exception as e:
                logger.error(f"Error parsing date {booking_date_str}: {str(e)}")
    
    # Process movie statistics
    movie_stats = {}
    for booking in valid_bookings:
        movie_id = booking.get('movieId')
        if movie_id:
            if movie_id not in movie_stats:
                movie_stats[movie_id] = {
                    'id': movie_id,
                    'title': booking.get('movieTitle') or booking.get('movieName') or 'Unknown',
                    'poster': booking.get('moviePoster') or '',
                    'bookings': 0,
                    'revenue': 0,
                    'seats': 0
                }
            
            movie_stats[movie_id]['bookings'] += 1
            movie_stats[movie_id]['revenue'] += float(booking.get('totalPrice', 0))
            movie_stats[movie_id]['seats'] += len(booking.get('seats', []))
    
    # Convert movie stats to a list and sort by revenue
    top_movies = list(movie_stats.values())
    top_movies.sort(key=lambda x: x['revenue'], reverse=True)
    
    # Construct the final analytics object
    analytics = {
        'totalRevenue': total_revenue,
        'totalBookings': total_bookings,
        'uniqueUsers': unique_users,
        'dailyRevenue': daily_revenue,
        'userActivity': daily_users,
        'topMovies': top_movies
    }
    
    return jsonify(analytics)

# Cinema routes
@app.route('/bridge/cinemas', methods=['GET'])
def get_cinemas():
    return forward_request('cinemas')

@app.route('/bridge/cinemas/<int:cinema_id>', methods=['GET'])
def get_cinema(cinema_id):
    return forward_request(f'cinemas/{cinema_id}')

@app.route('/bridge/cinemas/<int:cinema_id>/showtimes', methods=['GET'])
def get_cinema_showtimes(cinema_id):
    return forward_request(f'cinemas/{cinema_id}/showtimes')

# Admin routes for cinema management
@app.route('/bridge/admin/cinemas', methods=['POST'])
def add_cinema():
    return forward_request('admin/cinemas', method='POST', data=request.json)

@app.route('/bridge/admin/cinemas/<int:cinema_id>', methods=['PUT'])
def update_cinema(cinema_id):
    return forward_request(f'admin/cinemas/{cinema_id}', method='PUT', data=request.json)

@app.route('/bridge/admin/cinemas/<int:cinema_id>', methods=['DELETE'])
def delete_cinema(cinema_id):
    return forward_request(f'admin/cinemas/{cinema_id}', method='DELETE')

# Status route
@app.route('/bridge/status', methods=['GET'])
def get_status():
    return forward_request('status')

# Analytics routes
@app.route('/bridge/admin/analytics', methods=['GET'])
def get_analytics_bridge():
    return forward_request('admin/analytics')

# Run server
if __name__ == '__main__':
    logger.info("Starting bridge API server...")
    # Create sample data files if they don't exist
    for file in ['movies.json', 'cinemas.json', 'showtimes.json', 'bookings.json']:
        if not os.path.exists(os.path.join(DATA_DIR, file)):
            save_json_data(file, [])
    
    logger.info("Starting CookMyShow bridge on http://localhost:3001/bridge")
    app.run(host='localhost', port=3001, debug=True)
