@echo off
echo ===================================
echo Starting CookMyShow Backend Server
echo ===================================

REM Create directories if they don't exist
if not exist backend\data mkdir backend\data

REM Check if we have sample data
if not exist backend\data\movies.json (
  echo Creating sample data files...
  
  echo [ > backend\data\movies.json
  echo   { >> backend\data\movies.json
  echo     "id": 1, >> backend\data\movies.json
  echo     "title": "Avengers: Endgame", >> backend\data\movies.json
  echo     "poster": "https://example.com/avengers-poster.jpg", >> backend\data\movies.json
  echo     "banner": "https://example.com/avengers-banner.jpg", >> backend\data\movies.json
  echo     "description": "The Avengers take a final stand against Thanos in Marvel Studios' conclusion to 22 films.", >> backend\data\movies.json
  echo     "duration": "3h 1m", >> backend\data\movies.json
  echo     "releaseDate": "April 26, 2019", >> backend\data\movies.json
  echo     "genres": ["Action", "Adventure", "Sci-Fi"], >> backend\data\movies.json
  echo     "language": "English", >> backend\data\movies.json
  echo     "rating": 8.4, >> backend\data\movies.json
  echo     "director": "Anthony Russo, Joe Russo", >> backend\data\movies.json
  echo     "cast": ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth", "Scarlett Johansson"] >> backend\data\movies.json
  echo   }, >> backend\data\movies.json
  echo   { >> backend\data\movies.json
  echo     "id": 2, >> backend\data\movies.json
  echo     "title": "Interstellar", >> backend\data\movies.json
  echo     "poster": "https://example.com/interstellar-poster.jpg", >> backend\data\movies.json
  echo     "banner": "https://example.com/interstellar-banner.jpg", >> backend\data\movies.json
  echo     "description": "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.", >> backend\data\movies.json
  echo     "duration": "2h 49m", >> backend\data\movies.json
  echo     "releaseDate": "November 7, 2014", >> backend\data\movies.json
  echo     "genres": ["Adventure", "Drama", "Sci-Fi"], >> backend\data\movies.json
  echo     "language": "English", >> backend\data\movies.json
  echo     "rating": 8.6, >> backend\data\movies.json
  echo     "director": "Christopher Nolan", >> backend\data\movies.json
  echo     "cast": ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"] >> backend\data\movies.json
  echo   } >> backend\data\movies.json
  echo ] >> backend\data\movies.json
  
  echo [ > backend\data\cinemas.json
  echo   { >> backend\data\cinemas.json
  echo     "id": 1, >> backend\data\cinemas.json
  echo     "name": "CineVerse Deluxe", >> backend\data\cinemas.json
  echo     "location": "Downtown Plaza, Main Street", >> backend\data\cinemas.json
  echo     "screens": 8, >> backend\data\cinemas.json
  echo     "totalSeats": 1200, >> backend\data\cinemas.json
  echo     "amenities": ["IMAX", "4DX", "VIP Seating", "Dolby Atmos"] >> backend\data\cinemas.json
  echo   }, >> backend\data\cinemas.json
  echo   { >> backend\data\cinemas.json
  echo     "id": 2, >> backend\data\cinemas.json
  echo     "name": "CineVerse Premium", >> backend\data\cinemas.json
  echo     "location": "Westfield Mall, 5th Avenue", >> backend\data\cinemas.json
  echo     "screens": 6, >> backend\data\cinemas.json
  echo     "totalSeats": 900, >> backend\data\cinemas.json
  echo     "amenities": ["Luxury Recliners", "Dine-in", "IMAX"] >> backend\data\cinemas.json
  echo   } >> backend\data\cinemas.json
  echo ] >> backend\data\cinemas.json
)

REM Start the bridge server
echo Starting Bridge server...
cd bridge
start cmd /k "echo Starting Bridge server... && python app.py"

REM Wait a moment before showing instructions
timeout /t 3 > nul

echo ==============================================
echo Server is starting!
echo API will be available at: http://localhost:3001
echo ==============================================
echo If server fails to start, try:
echo 1. Install Python 3.7+ if not already installed
echo 2. Run: pip install flask flask-cors
echo 3. Run this script again
echo ==============================================

REM Return to the root folder
cd ..
