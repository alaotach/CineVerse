from flask import Flask, request, jsonify, abort
from flask_cors import CORS
import json
import os
import configparser
import argparse
import sqlite3
from datetime import datetime, timedelta
import uuid
import hashlib
import jwt  # You may need to install PyJWT: pip install PyJWT
import logging
import sys
import signal
sys.path.append('.')

# Import the C++ engine
import cinema_engine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("backend.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Load configuration
config = configparser.ConfigParser()
config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config.ini')
if os.path.exists(config_path):
    config.read(config_path)
else:
    # Default configuration
    config['Backend'] = {
        'PORT': '8080',
        'HOST': 'localhost',
        'DEBUG': 'True',
        'DATABASE': 'movies.db'
    }

# Create Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://localhost:4173"]}})  # Enable CORS for all routes

# Initialize the C++ booking system
booking_system = cinema_engine.BookingSystem()

# Load initial data
data_dir = os.path.join(os.path.dirname(__file__), 'data')
booking_system.loadMovies(os.path.join(data_dir, "movies.json"))
booking_system.loadCinemas(os.path.join(data_dir, "cinemas.json"))

# JWT Secret key - should be in environment variables in production
JWT_SECRET = "your-secret-key-should-be-more-secure"
JWT_EXPIRY = 24  # hours

# File paths
CINEMAS_FILE = 'data/cinemas.json'
MOVIES_FILE = 'data/movies.json'
SHOWTIMES_FILE = 'data/showtimes.json'
BOOKINGS_FILE = 'data/bookings.json'
USERS_FILE = 'data/users.json'

# Load data from JSON files
def load_data(filename):
    data_path = os.path.join(os.path.dirname(__file__), 'data', f"{filename}.json")
    if os.path.exists(data_path):
        with open(data_path, 'r') as f:
            return json.load(f)
    return []

# Save data to JSON files
def save_data(filename, data):
    data_path = os.path.join(os.path.dirname(__file__), 'data', f"{filename}.json")
    with open(data_path, 'w') as f:
        json.dump(data, f, indent=2)
    return True

# Helper function for password hashing (simple SHA-256 for this example)
# In production, use a proper password hashing library like bcrypt
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Helper function to generate JWT token
def generate_token(user):
    payload = {
        'sub': user['id'],
        'name': user['name'],
        'email': user['email'],
        'isAdmin': user['isAdmin'],
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRY)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

# Authentication middleware
def auth_required(f):
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "No token provided"}), 401
        
        token = auth_header.split(" ")[1] if len(auth_header.split(" ")) > 1 else auth_header
        
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            # Add user to request context (not directly supported in Flask without flask-restful)
            # For our example, we'll use this to get the user ID
            request.user_id = payload['sub']
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        
        return f(*args, **kwargs)
    decorated.__name__ = f.__name__
    return decorated

# Authentication endpoints
@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.json
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "Email and password are required"}), 400
        
        email = data['email']
        password = data['password']
        
        # Load users data
        users = load_data('users')
        
        # Find user by email
        user = next((u for u in users if u['email'] == email), None)
        
        # Check if user exists and password is correct
        # In production, you should use proper password hashing (bcrypt, etc.)
        if not user or hash_password(password) != user.get('password'):
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Generate JWT token
        token = generate_token(user)
        
        # Don't return the password in the response
        user_data = {k: v for k, v in user.items() if k != 'password'}
        
        return jsonify({
            "token": token,
            "user": user_data
        }), 200
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({"error": "An error occurred during login"}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.json
        if not data or 'email' not in data or 'password' not in data or 'name' not in data:
            return jsonify({"error": "Name, email and password are required"}), 400
        
        email = data['email']
        password = data['password']
        name = data['name']
        
        # Load users data
        users = load_data('users')
        
        # Check if user already exists
        if any(u['email'] == email for u in users):
            return jsonify({"error": "Email already registered"}), 409
        
        # Create new user
        new_user = {
            "id": str(uuid.uuid4()),
            "name": name,
            "email": email,
            "password": hash_password(password),
            "isAdmin": False
        }
        
        # Add user to database
        users.append(new_user)
        save_data('users', users)
        
        # Generate token for the new user
        token = generate_token(new_user)
        
        # Don't return the password in the response
        user_data = {k: v for k, v in new_user.items() if k != 'password'}
        
        return jsonify({
            "token": token,
            "user": user_data
        }), 201
    except Exception as e:
        logger.error(f"Register error: {str(e)}")
        return jsonify({"error": "An error occurred during registration"}), 500

@app.route('/api/auth/verify', methods=['GET'])
def verify_token():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "No token provided"}), 401
        
        token = auth_header.split(" ")[1] if len(auth_header.split(" ")) > 1 else auth_header
        
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            user_id = payload['sub']
            
            # Load users data
            users = load_data('users')
            
            # Find user by ID
            user = next((u for u in users if u['id'] == user_id), None)
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            # Don't return the password
            user_data = {k: v for k, v in user.items() if k != 'password'}
            
            return jsonify({
                "user": user_data
            }), 200
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
    except Exception as e:
        logger.error(f"Verify token error: {str(e)}")
        return jsonify({"error": "An error occurred while verifying the token"}), 500

# Add the admin endpoints for bookings and analytics

@app.route('/api/admin/bookings', methods=['GET'])
def get_admin_bookings():
    try:
        # Get all bookings from the C++ backend
        bookings = booking_system.getAllBookings()
        # Convert C++ objects to Python dictionaries
        bookings_dicts = [booking.to_dict() for booking in bookings]
        return jsonify(bookings_dicts)
    except Exception as e:
        logger.error(f"Error fetching admin bookings: {str(e)}")
        return jsonify({"error": "Failed to fetch bookings"}), 500

@app.route('/api/admin/analytics', methods=['GET'])
def get_analytics():
    cinemas = load_data('cinemas')
    movies = load_data('movies')
    bookings = load_data('bookings')
    showtimes = load_data('showtimes')
    
    # Calculate analytics
    cinema_bookings = {}
    movie_bookings = {}
    
    for booking in bookings:
        # Count bookings per cinema
        cinema_id = booking.get('cinemaId')
        if cinema_id:
            cinema_bookings[cinema_id] = cinema_bookings.get(cinema_id, 0) + 1
        
        # Count bookings per movie
        movie_id = booking.get('movieId')
        if movie_id:
            movie_bookings[movie_id] = movie_bookings.get(movie_id, 0) + 1
    
    analytics = {
        "totalCinemas": len(cinemas),
        "totalMovies": len(movies),
        "totalBookings": len(bookings),
        "totalShowtimes": len(showtimes),
        "cinemaBookings": cinema_bookings,
        "movieBookings": movie_bookings
    }
    
    return jsonify(analytics)

# Get base endpoint
@app.route('/api', methods=['GET'])
def base():
    return jsonify({"message": "CookMyShow API is running"})

# Status endpoint
@app.route('/api/status', methods=['GET'])
def status():
    logger.info("Status endpoint accessed")
    return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()})

# Movies endpoints
@app.route('/api/movies', methods=['GET', 'POST'])
def movies():
    if request.method == 'GET':
        try:
            # Get movies from the C++ backend
            movies = booking_system.getAllMovies()
            # Convert C++ objects to Python dictionaries
            movie_dicts = [movie.to_dict() for movie in movies]
            logger.info(f"Returned {len(movie_dicts)} movies")
            return jsonify(movie_dicts)
        except Exception as e:
            logger.error(f"Error fetching movies: {str(e)}")
            # Fallback to reading from JSON file if C++ backend fails
            movies = load_data('movies')
            logger.info(f"Returned {len(movies)} movies from JSON fallback")
            return jsonify(movies)
    elif request.method == 'POST':
        try:
            # Get movie data from request
            movie_data = request.json
            
            # Validate required fields
            if not movie_data or not all(k in movie_data for k in ['title', 'description']):
                return jsonify({"error": "Missing required fields (title, description)"}), 400
            
            # Generate an ID for the movie if not provided
            if 'id' not in movie_data:
                # Find the max movie ID and increment by 1
                movies = booking_system.getAllMovies()
                max_id = 0
                for movie in movies:
                    if movie.getId() > max_id:
                        max_id = movie.getId()
                movie_data['id'] = max_id + 1
            
            # Add default values for optional fields if not provided
            if 'poster' not in movie_data:
                movie_data['poster'] = ""
            if 'banner' not in movie_data:
                movie_data['banner'] = ""
            if 'rating' not in movie_data:
                movie_data['rating'] = 0.0
            else:
                # Ensure rating is a float
                try:
                    movie_data['rating'] = float(movie_data['rating'])
                except (ValueError, TypeError):
                    movie_data['rating'] = 0.0
                    
            if 'duration' not in movie_data:
                movie_data['duration'] = ""
            if 'releaseDate' not in movie_data:
                movie_data['releaseDate'] = datetime.now().strftime('%Y-%m-%d')
            if 'genres' not in movie_data or not movie_data['genres']:
                movie_data['genres'] = []
            if 'language' not in movie_data:
                movie_data['language'] = ""
            if 'director' not in movie_data:
                movie_data['director'] = ""
            if 'cast' not in movie_data or not movie_data['cast']:
                movie_data['cast'] = []
            
            # Create movie using the C++ backend
            success = booking_system.addMovie(movie_data)
            if not success:
                return jsonify({"error": "Failed to create movie"}), 500
                
            # Save movies to disk to persist changes
            booking_system.saveMovies("movies")
                
            # Get the created movie back to return its details
            movie = booking_system.getMovieById(movie_data['id'])
            if movie.getId() == 0:  # Check if movie was found
                return jsonify({"error": "Movie created but retrieval failed"}), 500
                
            movie_dict = movie.to_dict()
            
            logger.info(f"Created new movie with ID {movie_dict['id']}")
            return jsonify(movie_dict), 201
            
        except Exception as e:
            logger.error(f"Error creating movie: {str(e)}")
            # If the C++ backend doesn't support this yet, we can implement a fallback
            try:
                # Get movie data from request
                movie_data = request.json
                
                # Validate required fields
                if not movie_data or not all(k in movie_data for k in ['title', 'description']):
                    return jsonify({"error": "Missing required fields (title, description)"}), 400
                
                # Load existing movies
                movies = load_data('movies')
                
                # Generate an ID for the movie if not provided
                if 'id' not in movie_data:
                    # Find the max movie ID and increment by 1
                    max_id = 0
                    for movie in movies:
                        if movie['id'] > max_id:
                            max_id = movie['id']
                    movie_data['id'] = max_id + 1
                
                # Add movie to the list
                movies.append(movie_data)
                
                # Save updated movies list
                save_data('movies', movies)
                
                logger.info(f"Created new movie with ID {movie_data['id']} using JSON fallback")
                return jsonify(movie_data), 201
                
            except Exception as fallback_error:
                logger.error(f"Error in fallback movie creation: {str(fallback_error)}")
                return jsonify({"error": "Failed to create movie"}), 500

@app.route('/api/movies/<int:movie_id>', methods=['GET'])
def get_movie(movie_id):
    try:
        # Get movie from the C++ backend
        movie = booking_system.getMovieById(movie_id)
        if movie.getId() != 0:  # Check if movie was found
            movie_dict = movie.to_dict()
            logger.info(f"Returned movie with ID {movie_id}")
            return jsonify(movie_dict)
        
        logger.warning(f"Movie with ID {movie_id} not found")
        return jsonify({"error": f"Movie with ID {movie_id} not found"}), 404
    except Exception as e:
        logger.error(f"Error fetching movie {movie_id}: {str(e)}")
        # Fallback to reading from JSON file if C++ backend fails
        movies = load_data('movies')
        movie = next((m for m in movies if m['id'] == movie_id), None)
        if movie:
            logger.info(f"Returned movie with ID {movie_id} from JSON fallback")
            return jsonify(movie)
        return jsonify({"error": f"Movie with ID {movie_id} not found"}), 404

# Cinemas endpoints
@app.route('/api/cinemas', methods=['GET', 'POST'])
def cinemas():
    if request.method == 'GET':
        try:
            # Get cinemas from the C++ backend
            cinemas = booking_system.getAllCinemas()
            # Convert C++ objects to Python dictionaries
            cinema_dicts = [cinema.to_dict() for cinema in cinemas]
            logger.info(f"Returned {len(cinema_dicts)} cinemas")
            return jsonify(cinema_dicts)
        except Exception as e:
            logger.error(f"Error fetching cinemas: {str(e)}")
            # Fallback to reading from JSON file if C++ backend fails
            cinemas = load_data('cinemas')
            logger.info(f"Returned {len(cinemas)} cinemas from JSON fallback")
            return jsonify(cinemas)
    
    elif request.method == 'POST':
        try:
            # Get cinema data from request
            cinema_data = request.json
            
            # Validate required fields
            if not cinema_data or not all(k in cinema_data for k in ['name', 'location', 'screens', 'totalSeats']):
                return jsonify({"error": "Missing required fields (name, location, screens, totalSeats)"}), 400
            
            # Generate an ID for the cinema if not provided
            if 'id' not in cinema_data:
                # Find the max cinema ID and increment by 1
                cinemas = booking_system.getAllCinemas()
                max_id = 0
                for cinema in cinemas:
                    if cinema.getId() > max_id:
                        max_id = cinema.getId()
                cinema_data['id'] = max_id + 1
            
            # Create cinema using the C++ backend
            success = booking_system.addCinema(cinema_data)
            if not success:
                return jsonify({"error": "Failed to create cinema"}), 500
                
            # Save cinemas to persist to disk
            booking_system.saveCinemas("cinemas")
                
            # Get the created cinema back to return its details
            cinema = booking_system.getCinemaById(cinema_data['id'])
            if cinema.getId() == 0:  # Check if cinema was found
                return jsonify({"error": "Cinema created but retrieval failed"}), 500
                
            cinema_dict = cinema.to_dict()
            
            logger.info(f"Created new cinema with ID {cinema_dict['id']}")
            return jsonify(cinema_dict), 201
            
        except Exception as e:
            logger.error(f"Error creating cinema: {str(e)}")
            return jsonify({"error": "Failed to create cinema"}), 500

@app.route('/api/cinemas/<int:cinema_id>', methods=['GET'])
def get_cinema(cinema_id):
    try:
        # Get cinema from the C++ backend
        cinema = booking_system.getCinemaById(cinema_id)
        if cinema.getId() != 0:  # Check if cinema was found
            cinema_dict = cinema.to_dict()
            logger.info(f"Returned cinema with ID {cinema_id}")
            return jsonify(cinema_dict)
        
        logger.warning(f"Cinema with ID {cinema_id} not found")
        return jsonify({"error": f"Cinema with ID {cinema_id} not found"}), 404
    except Exception as e:
        logger.error(f"Error fetching cinema {cinema_id}: {str(e)}")
        # Fallback to reading from JSON file if C++ backend fails
        cinemas = load_data('cinemas')
        cinema = next((c for c in cinemas if c['id'] == cinema_id), None)
        if cinema:
            logger.info(f"Returned cinema with ID {cinema_id} from JSON fallback")
            return jsonify(cinema)
        return jsonify({"error": f"Cinema with ID {cinema_id} not found"}), 404

@app.route('/api/cinemas/<int:cinema_id>/showtimes', methods=['GET'])
def get_cinema_showtimes(cinema_id):
    showtimes = load_data('showtimes')
    cinema_showtimes = [s for s in showtimes if s['cinemaId'] == cinema_id]
    
    logger.info(f"Returned {len(cinema_showtimes)} showtimes for cinema ID {cinema_id}")
    return jsonify(cinema_showtimes)

@app.route('/api/admin/cinemas', methods=['POST'])
def add_cinema():
    if not request.json:
        abort(400, description="Invalid request data")
    
    cinemas = load_data('cinemas')
    
    # Generate ID if not provided
    new_cinema = request.json
    if 'id' not in new_cinema:
        max_id = max([c['id'] for c in cinemas]) if cinemas else 0
        new_cinema['id'] = max_id + 1
    
    cinemas.append(new_cinema)
    save_data('cinemas', cinemas)
    
    logger.info(f"Added new cinema with ID {new_cinema['id']}")
    return jsonify(new_cinema), 201

@app.route('/api/admin/cinemas/<int:cinema_id>', methods=['PUT'])
def update_cinema(cinema_id):
    if not request.json:
        abort(400, description="Invalid request data")
    
    cinemas = load_data('cinemas')
    cinema_index = next((i for i, c in enumerate(cinemas) if c['id'] == cinema_id), None)
    
    if cinema_index is None:
        logger.warning(f"Cinema with ID {cinema_id} not found for update")
        abort(404, description="Cinema not found")
    
    cinemas[cinema_index].update(request.json)
    save_data('cinemas', cinemas)
    
    logger.info(f"Updated cinema with ID {cinema_id}")
    return jsonify(cinemas[cinema_index])

@app.route('/api/admin/cinemas/<int:cinema_id>', methods=['DELETE'])
def delete_cinema(cinema_id):
    cinemas = load_data('cinemas')
    cinema_index = next((i for i, c in enumerate(cinemas) if c['id'] == cinema_id), None)
    
    if cinema_index is None:
        logger.warning(f"Cinema with ID {cinema_id} not found for deletion")
        abort(404, description="Cinema not found")
    
    deleted_cinema = cinemas.pop(cinema_index)
    save_data('cinemas', cinemas)
    
    logger.info(f"Deleted cinema with ID {cinema_id}")
    return jsonify({"message": f"Cinema {cinema_id} deleted successfully"})

# Showtimes endpoints
@app.route('/api/showtimes', methods=['GET', 'POST'])
def showtimes():
    if request.method == 'GET':
        movie_id = request.args.get('movieId')
        date = request.args.get('date')
        
        try:
            # Get showtimes from the C++ backend based on filters
            if movie_id and date:
                movie_id = int(movie_id)
                showtimes = booking_system.getShowtimesByMovieAndDate(movie_id, date)
            elif movie_id:
                movie_id = int(movie_id)
                showtimes = booking_system.getShowtimesByMovie(movie_id)
            elif date:
                showtimes = booking_system.getShowtimesByDate(date)
            else:
                # This would get all showtimes - not implemented in our C++ backend
                # For now, we'll read from JSON file
                showtimes = []
                cinemas = booking_system.getAllCinemas()
                for cinema in cinemas:
                    for showtime in cinema.getShowtimes():
                        showtimes.append(showtime)
            
            # Convert C++ objects to Python dictionaries
            showtime_dicts = [showtime.to_dict() for showtime in showtimes]
            logger.info(f"Returned {len(showtime_dicts)} showtimes")
            return jsonify(showtime_dicts)
        except Exception as e:
            logger.error(f"Error fetching showtimes: {str(e)}")
            # Fallback to reading from JSON file if C++ backend fails
            cinemas = load_data('cinemas')
            all_showtimes = []
            for cinema in cinemas:
                if 'showtimes' in cinema:
                    all_showtimes.extend(cinema['showtimes'])
            
            if movie_id:
                movie_id = int(movie_id)
                all_showtimes = [s for s in all_showtimes if s['movieId'] == movie_id]
            
            if date:
                all_showtimes = [s for s in all_showtimes if s['date'] == date]
            
            logger.info(f"Returned {len(all_showtimes)} showtimes from JSON fallback")
            return jsonify(all_showtimes)
    
    elif request.method == 'POST':
        try:
            # Get showtime data from request
            showtime_data = request.json
            
            # Validate required fields
            if not showtime_data or not all(k in showtime_data for k in ['cinemaId', 'movieId', 'date', 'time', 'price']):
                return jsonify({"error": "Missing required fields (cinemaId, movieId, date, time, price)"}), 400
            
            # Generate a UUID for the showtime if not provided
            if 'id' not in showtime_data:
                showtime_data['id'] = str(uuid.uuid4())
                
            # Get cinema details to set the cinema name if not provided
            if 'cinemaName' not in showtime_data:
                try:
                    cinema = booking_system.getCinemaById(showtime_data['cinemaId'])
                    if cinema.getId() != 0:  # Valid cinema found
                        showtime_data['cinemaName'] = cinema.getName()
                except Exception:
                    pass  # Proceed without cinema name if we can't get it
            
            # Create showtime using the C++ backend (adds to cinema)
            success = booking_system.addShowtime(showtime_data)
            if not success:
                return jsonify({"error": "Failed to create showtime"}), 500
            
            # Save cinemas to persist the new showtime
            booking_system.saveCinemas("cinemas")
            
            # Also save to showtimes.json for separate access
            try:
                # Load existing showtimes or create empty list
                all_showtimes = load_data('showtimes') or []
                
                # Check if the showtime already exists (by ID)
                showtime_exists = any(s.get('id') == showtime_data['id'] for s in all_showtimes)
                
                if not showtime_exists:
                    # Add the new showtime to the list
                    all_showtimes.append(showtime_data)
                    # Save updated showtimes list
                    save_data('showtimes', all_showtimes)
                    logger.info(f"Added showtime {showtime_data['id']} to showtimes.json")
                
            except Exception as e:
                logger.error(f"Error saving showtime to showtimes.json: {str(e)}")
                # Continue even if saving to showtimes.json fails
            
            # Get the created showtime back to return its details
            showtime = booking_system.getShowtimeById(showtime_data['id'])
            if showtime.getId() == "":  # Check if showtime was found
                return jsonify({"error": "Showtime created but retrieval failed"}), 500
                
            showtime_dict = showtime.to_dict()
            
            logger.info(f"Created new showtime with ID {showtime_dict['id']}")
            return jsonify(showtime_dict), 201
            
        except Exception as e:
            logger.error(f"Error creating showtime: {str(e)}")
            return jsonify({"error": "Failed to create showtime"}), 500

@app.route('/api/showtimes/<string:showtime_id>', methods=['GET'])
def get_showtime(showtime_id):
    try:
        # Get showtime from the C++ backend
        showtime = booking_system.getShowtimeById(showtime_id)
        if showtime.getId() != "":  # Check if showtime was found
            showtime_dict = showtime.to_dict()
            logger.info(f"Returned showtime with ID {showtime_id}")
            return jsonify(showtime_dict)
        
        logger.warning(f"Showtime with ID {showtime_id} not found")
        return jsonify({"error": f"Showtime with ID {showtime_id} not found"}), 404
    except Exception as e:
        logger.error(f"Error fetching showtime {showtime_id}: {str(e)}")
        # Fallback to reading from JSON file if C++ backend fails
        cinemas = load_data('cinemas')
        for cinema in cinemas:
            if 'showtimes' in cinema:
                showtime = next((s for s in cinema['showtimes'] if s['id'] == showtime_id), None)
                if showtime:
                    logger.info(f"Returned showtime with ID {showtime_id} from JSON fallback")
                    return jsonify(showtime)
        
        return jsonify({"error": f"Showtime with ID {showtime_id} not found"}), 404

# Booked seats endpoint
@app.route('/api/showtimes/<string:showtime_id>/seats', methods=['GET'])
def get_booked_seats(showtime_id):
    try:
        # Get booked seats from the C++ backend
        booked_seats = booking_system.getBookedSeatsForShowtime(showtime_id)
        logger.info(f"Returned {len(booked_seats)} booked seats for showtime ID {showtime_id}")
        return jsonify(booked_seats)
    except Exception as e:
        logger.error(f"Error fetching seats for showtime {showtime_id}: {str(e)}")
        # Fallback to reading from JSON file if C++ backend fails
        bookings = load_data('bookings')
        booked_seats = []
        for booking in bookings:
            if booking['showtimeId'] == showtime_id and not booking['cancelled']:
                booked_seats.extend(booking['seats'])
        
        logger.info(f"Returned {len(booked_seats)} booked seats from JSON fallback")
        return jsonify(booked_seats)

# Bookings endpoints
@app.route('/api/bookings', methods=['POST'])
def create_booking():
    try:
        # Get booking data from request
        booking_data = request.json
        
        # Create booking using the C++ backend
        booking = booking_system.createBooking(booking_data)
        booking_dict = booking.to_dict()
        
        logger.info(f"Created new booking with ID {booking_dict['id']}")
        return jsonify(booking_dict)
    except Exception as e:
        logger.error(f"Error creating booking: {str(e)}")
        return jsonify({"error": "Failed to create booking"}), 500

@app.route('/api/bookings/<id>', methods=['GET'])
def get_booking(id):
    try:
        # Get booking from the C++ backend
        booking = booking_system.getBookingById(id)
        if booking.getId() != "":  # Check if booking was found
            booking_dict = booking.to_dict()
            logger.info(f"Returned booking with ID {id}")
            return jsonify(booking_dict)
        
        logger.warning(f"Booking with ID {id} not found")
        return jsonify({"error": "Booking not found"}), 404
    except Exception as e:
        logger.error(f"Error fetching booking {id}: {str(e)}")
        # Fallback to reading from JSON file if C++ backend fails
        bookings = load_data('bookings')
        booking = next((b for b in bookings if b.get('id') == id), None)
        if booking:
            logger.info(f"Returned booking with ID {id} from JSON fallback")
            return jsonify(booking)
        
        return jsonify({"error": "Booking not found"}), 404

@app.route('/api/bookings/<id>/cancel', methods=['POST'])
def cancel_booking(id):
    try:
        # Cancel booking using the C++ backend
        result = booking_system.cancelBooking(id)
        if result:
            logger.info(f"Cancelled booking with ID {id}")
            return jsonify({"success": True})
        
        logger.warning(f"Booking with ID {id} not found for cancellation")
        return jsonify({"error": "Booking not found"}), 404
    except Exception as e:
        logger.error(f"Error cancelling booking {id}: {str(e)}")
        return jsonify({"error": f"Failed to cancel booking {id}"}), 500

@app.route('/api/bookings/<id>/restore', methods=['POST'])
def restore_booking(id):
    try:
        # Restore booking using the C++ backend
        result = booking_system.restoreBooking(id)
        if result:
            logger.info(f"Restored booking with ID {id}")
            return jsonify({"success": True})
        
        logger.warning(f"Booking with ID {id} not found for restoration")
        return jsonify({"error": "Booking not found"}), 404
    except Exception as e:
        logger.error(f"Error restoring booking {id}: {str(e)}")
        return jsonify({"error": f"Failed to restore booking {id}"}), 500

# User bookings endpoint
@app.route('/api/users/<string:user_id>/bookings', methods=['GET'])
def get_user_bookings(user_id):
    try:
        # Get user's bookings from the C++ backend
        bookings = booking_system.getBookingsByUser(user_id)
        # Convert C++ objects to Python dictionaries
        booking_dicts = [booking.to_dict() for booking in bookings]
        logger.info(f"Found {len(booking_dicts)} bookings for user {user_id}")
        return jsonify(booking_dicts)
    except Exception as e:
        logger.error(f"Error fetching bookings for user {user_id}: {str(e)}")
        # Fallback to reading from JSON file if C++ backend fails
        bookings = load_data('bookings')
        user_bookings = [b for b in bookings if b.get('userId') == user_id]
        logger.info(f"Found {len(user_bookings)} bookings for user {user_id} from JSON fallback")
        return jsonify(user_bookings)

# Add a function to ensure showtimes.json exists and is in sync with cinema data
def sync_showtimes():
    try:
        # Get all cinemas and their showtimes
        cinemas = booking_system.getAllCinemas()
        
        # Extract all showtimes
        all_showtimes = []
        for cinema in cinemas:
            cinema_dict = cinema.to_dict()
            if 'showtimes' in cinema_dict:
                all_showtimes.extend(cinema_dict['showtimes'])
        
        # Save to showtimes.json
        save_data('showtimes', all_showtimes)
        logger.info(f"Synchronized {len(all_showtimes)} showtimes to showtimes.json")
        
    except Exception as e:
        logger.error(f"Error synchronizing showtimes: {str(e)}")

# Add a signal handler to save data when the server shuts down - now disabled
def signal_handler(sig, frame):
    logger.info("Shutdown signal received. Data saving on shutdown is disabled.")
    sys.exit(0)

# Function to handle cleanup when Flask is running in debug mode - now disabled
def cleanup():
    logger.info("Flask cleanup initiated. Data saving on shutdown is disabled.")
    # Do nothing - data saving disabled

# Register signal handlers
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

# Run the application
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Run the CookMyShow backend server')
    parser.add_argument('--port', type=int, help='Port to run the server on')
    args = parser.parse_args()
    
    port = args.port if args.port else int(config['Backend'].get('PORT', 8080))
    host = config['Backend'].get('HOST', 'localhost')
    debug = config['Backend'].getboolean('DEBUG', True)
    
    # Register Flask's atexit handler for cleanup
    import atexit
    atexit.register(cleanup)
    
    # Ensure showtimes.json is in sync with cinema data
    sync_showtimes()
    
    logger.info(f"Starting CookMyShow backend on http://{host}:{port}/api - Data will NOT be saved on shutdown")
    app.run(host=host, port=port, debug=debug)