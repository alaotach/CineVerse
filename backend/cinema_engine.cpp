#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
#include <algorithm>
#include <fstream>
#include <sstream>
#include <mutex>
#include <memory>
#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include <pybind11/stl_bind.h>
#include <pybind11/functional.h>
#include <ctime>
#include <random>
#include <unordered_set>
#include <chrono>
#include <iomanip>
#include <nlohmann/json.hpp>
#include <filesystem> // Include filesystem for path resolution

#ifdef _WIN32
#include <direct.h>
#include <windows.h>
#else
#include <sys/stat.h>
#endif

namespace py = pybind11;
using json = nlohmann::json;

// Forward declarations
class Movie;
class Cinema;
class Showtime;
class BookingSystem;

// Function to generate unique IDs
std::string generate_uuid() {
    static std::random_device rd;
    static std::mt19937 gen(rd());
    static std::uniform_int_distribution<> dis(0, 15);
    static std::uniform_int_distribution<> dis2(8, 11);

    std::stringstream ss;
    ss << std::hex;

    for (int i = 0; i < 8; i++) {
        ss << dis(gen);
    }
    ss << "-";
    for (int i = 0; i < 4; i++) {
        ss << dis(gen);
    }
    ss << "-4";
    for (int i = 3; i > 0; i--) {
        ss << dis(gen);
    }
    ss << "-";
    ss << dis2(gen);
    for (int i = 0; i < 3; i++) {
        ss << dis(gen);
    }
    ss << "-";
    for (int i = 0; i < 12; i++) {
        ss << dis(gen);
    };
    return ss.str();
}

// Function to get current date as string
std::string get_current_date() {
    auto now = std::chrono::system_clock::now();
    auto in_time_t = std::chrono::system_clock::to_time_t(now);

    std::stringstream ss;
    ss << std::put_time(std::localtime(&in_time_t), "%Y-%m-%d");
    return ss.str();
}

// Helper function to trim whitespace from a string
std::string trim(const std::string& str) {
    size_t first = str.find_first_not_of(" \t\n\r");
    if (first == std::string::npos)
        return "";
    size_t last = str.find_last_not_of(" \t\n\r");
    return str.substr(first, last - first + 1);
}

// Movie class
class Movie {
public:
    Movie() = default;
    
    Movie(int id, std::string title, std::string poster, std::string banner, 
          std::string description, double rating, std::string duration,
          std::string releaseDate, std::string genres, std::string language,
          std::string director, std::string cast) 
        : id_(id), title_(std::move(title)), poster_(std::move(poster)), 
          banner_(std::move(banner)), description_(std::move(description)),
          rating_(rating), duration_(std::move(duration)), 
          releaseDate_(std::move(releaseDate)), genres_(std::move(genres)),
          language_(std::move(language)), director_(std::move(director)),
          cast_(std::move(cast)) {}
          
    // Getters
    int getId() const { return id_; }
    std::string getTitle() const { return title_; }
    std::string getPoster() const { return poster_; }
    std::string getBanner() const { return banner_; }
    std::string getDescription() const { return description_; }
    double getRating() const { return rating_; }
    std::string getDuration() const { return duration_; }
    std::string getReleaseDate() const { return releaseDate_; }
    std::string getGenres() const { return genres_; }
    std::string getLanguage() const { return language_; }
    std::string getDirector() const { return director_; }
    std::string getCast() const { return cast_; }
    
    // Convert to Python dictionary
    py::dict to_dict() const {
        py::dict movie_dict;
        movie_dict["id"] = id_;
        movie_dict["title"] = title_;
        movie_dict["poster"] = poster_;
        movie_dict["banner"] = banner_;
        movie_dict["description"] = description_;
        movie_dict["rating"] = rating_;
        movie_dict["duration"] = duration_;
        movie_dict["releaseDate"] = releaseDate_;
        
        // Parse genres into a list
        py::list genres_list;
        std::istringstream genres_stream(genres_);
        std::string genre;
        while (std::getline(genres_stream, genre, ',')) {
            genre = trim(genre);
            if (!genre.empty()) {
                genres_list.append(genre);
            }
        }
        movie_dict["genres"] = genres_list;
        
        movie_dict["language"] = language_;
        movie_dict["director"] = director_;
        
        // Parse cast into a list
        py::list cast_list;
        std::istringstream cast_stream(cast_);
        std::string actor;
        while (std::getline(cast_stream, actor, ',')) {
            actor = trim(actor);
            if (!actor.empty()) {
                cast_list.append(actor);
            }
        }
        movie_dict["cast"] = cast_list;
        
        return movie_dict;
    }
    
    // Create from Python dictionary
    static Movie from_dict(const py::dict& dict) {
        if (!dict.contains("id") || !dict.contains("title")) {
            throw std::runtime_error("Invalid movie dictionary - missing required fields");
        }
        
        // Extract genres from list and join them
        std::string genres;
        if (dict.contains("genres")) {
            py::list genres_list = dict["genres"];
            bool first = true;
            for (const auto& genre : genres_list) {
                if (!first) genres += ", ";
                genres += genre.cast<std::string>();
                first = false;
            }
        }
        
        // Extract cast from list and join them
        std::string cast;
        if (dict.contains("cast")) {
            py::list cast_list = dict["cast"];
            bool first = true;
            for (const auto& actor : cast_list) {
                if (!first) cast += ", ";
                cast += actor.cast<std::string>();
                first = false;
            }
        }
        
        return Movie(
            dict["id"].cast<int>(),
            dict["title"].cast<std::string>(),
            dict.contains("poster") ? dict["poster"].cast<std::string>() : "",
            dict.contains("banner") ? dict["banner"].cast<std::string>() : "",
            dict.contains("description") ? dict["description"].cast<std::string>() : "",
            dict.contains("rating") ? dict["rating"].cast<double>() : 0.0,
            dict.contains("duration") ? dict["duration"].cast<std::string>() : "",
            dict.contains("releaseDate") ? dict["releaseDate"].cast<std::string>() : "",
            genres,
            dict.contains("language") ? dict["language"].cast<std::string>() : "",
            dict.contains("director") ? dict["director"].cast<std::string>() : "",
            cast
        );
    }
    
    // Create from JSON
    static Movie from_json(const json& j) {
        if (!j.contains("id") || !j.contains("title")) {
            throw std::runtime_error("Invalid movie JSON - missing required fields");
        }
        
        // Extract genres from list and join them
        std::string genres;
        if (j.contains("genres") && !j["genres"].is_null() && j["genres"].is_array()) {
            bool first = true;
            for (const auto& genre : j["genres"]) {
                if (!first) genres += ", ";
                genres += genre.get<std::string>();
                first = false;
            }
        }
        
        // Extract cast from list and join them
        std::string cast;
        if (j.contains("cast") && !j["cast"].is_null() && j["cast"].is_array()) {
            bool first = true;
            for (const auto& actor : j["cast"]) {
                if (!first) cast += ", ";
                cast += actor.get<std::string>();
                first = false;
            }
        }
        
        return Movie(
            j["id"].get<int>(),
            j["title"].get<std::string>(),
            j.contains("poster") && !j["poster"].is_null() ? j["poster"].get<std::string>() : "",
            j.contains("banner") && !j["banner"].is_null() ? j["banner"].get<std::string>() : "",
            j.contains("description") && !j["description"].is_null() ? j["description"].get<std::string>() : "",
            j.contains("rating") && !j["rating"].is_null() ? j["rating"].get<double>() : 0.0,
            j.contains("duration") && !j["duration"].is_null() ? j["duration"].get<std::string>() : "",
            j.contains("releaseDate") && !j["releaseDate"].is_null() ? j["releaseDate"].get<std::string>() : "",
            genres,
            j.contains("language") && !j["language"].is_null() ? j["language"].get<std::string>() : "",
            j.contains("director") && !j["director"].is_null() ? j["director"].get<std::string>() : "",
            cast
        );
    }

private:
    int id_ = 0;
    std::string title_;
    std::string poster_;
    std::string banner_;
    std::string description_;
    double rating_ = 0.0;
    std::string duration_;
    std::string releaseDate_;
    std::string genres_;
    std::string language_;
    std::string director_;
    std::string cast_;
};

// Showtime class
class Showtime {
public:
    Showtime() = default;
    
    Showtime(std::string id, int movieId, int cinemaId, std::string cinemaName,
             std::string date, std::string time, std::string screenType, double price)
        : id_(std::move(id)), movieId_(movieId), cinemaId_(cinemaId), 
          cinemaName_(std::move(cinemaName)), date_(std::move(date)), 
          time_(std::move(time)), screenType_(std::move(screenType)), price_(price) {}
    
    // Getters
    std::string getId() const { return id_; }
    int getMovieId() const { return movieId_; }
    int getCinemaId() const { return cinemaId_; }
    std::string getCinemaName() const { return cinemaName_; }
    std::string getDate() const { return date_; }
    std::string getTime() const { return time_; }
    std::string getScreenType() const { return screenType_; }
    double getPrice() const { return price_; }
    
    // Methods for seats
    bool isSeatBooked(const std::string& seat) const {
        return std::find(bookedSeats_.begin(), bookedSeats_.end(), seat) != bookedSeats_.end();
    }
    
    void bookSeat(const std::string& seat) {
        if (!isSeatBooked(seat)) {
            bookedSeats_.push_back(seat);
        }
    }
    
    void unbookSeat(const std::string& seat) {
        auto it = std::find(bookedSeats_.begin(), bookedSeats_.end(), seat);
        if (it != bookedSeats_.end()) {
            bookedSeats_.erase(it);
        }
    }
    
    std::vector<std::string> getBookedSeats() const { 
        return bookedSeats_; 
    }
    
    // Convert to Python dictionary
    py::dict to_dict() const {
        py::dict showtime_dict;
        showtime_dict["id"] = id_;
        showtime_dict["movieId"] = movieId_;
        showtime_dict["cinemaId"] = cinemaId_;
        showtime_dict["cinemaName"] = cinemaName_;
        showtime_dict["date"] = date_;
        showtime_dict["time"] = time_;
        showtime_dict["screenType"] = screenType_;
        showtime_dict["price"] = price_;
        
        py::list booked_seats_list;
        for (const auto& seat : bookedSeats_) {
            booked_seats_list.append(seat);
        }
        showtime_dict["bookedSeats"] = booked_seats_list;
        
        return showtime_dict;
    }
    
    // Create from Python dictionary
    static Showtime from_dict(const py::dict& dict) {
        if (!dict.contains("id") || !dict.contains("movieId") || !dict.contains("cinemaId")) {
            throw std::runtime_error("Invalid showtime dictionary - missing required fields");
        }
        
        Showtime showtime(
            dict["id"].cast<std::string>(),
            dict["movieId"].cast<int>(),
            dict["cinemaId"].cast<int>(),
            dict.contains("cinemaName") ? dict["cinemaName"].cast<std::string>() : "",
            dict.contains("date") ? dict["date"].cast<std::string>() : "",
            dict.contains("time") ? dict["time"].cast<std::string>() : "",
            dict.contains("screenType") ? dict["screenType"].cast<std::string>() : "Standard",
            dict.contains("price") ? dict["price"].cast<double>() : 0.0
        );
        
        // Load booked seats if available
        if (dict.contains("bookedSeats")) {
            py::list seats = dict["bookedSeats"];
            for (const auto& seat : seats) {
                showtime.bookSeat(seat.cast<std::string>());
            }
        }
        
        return showtime;
    }
    
    // Create from JSON
    static Showtime from_json(const json& j) {
        if (!j.contains("id") || !j.contains("movieId") || !j.contains("cinemaId")) {
            throw std::runtime_error("Invalid showtime JSON - missing required fields");
        }
        
        Showtime showtime(
            j["id"].get<std::string>(),
            j["movieId"].get<int>(),
            j["cinemaId"].get<int>(),
            j.contains("cinemaName") && !j["cinemaName"].is_null() ? j["cinemaName"].get<std::string>() : "",
            j.contains("date") && !j["date"].is_null() ? j["date"].get<std::string>() : "",
            j.contains("time") && !j["time"].is_null() ? j["time"].get<std::string>() : "",
            j.contains("screenType") && !j["screenType"].is_null() ? j["screenType"].get<std::string>() : "Standard",
            j.contains("price") && !j["price"].is_null() ? j["price"].get<double>() : 0.0
        );
        
        // Load booked seats if available
        if (j.contains("bookedSeats") && !j["bookedSeats"].is_null() && j["bookedSeats"].is_array()) {
            for (const auto& seat : j["bookedSeats"]) {
                if (seat.is_string()) {
                    showtime.bookSeat(seat.get<std::string>());
                }
            }
        }
        
        return showtime;
    }

private:
    std::string id_;
    int movieId_ = 0;
    int cinemaId_ = 0;
    std::string cinemaName_;
    std::string date_;
    std::string time_;
    std::string screenType_;
    double price_ = 0.0;
    std::vector<std::string> bookedSeats_;
};

// Cinema class
class Cinema {
public:
    Cinema() = default;
    
    Cinema(int id, std::string name, std::string location, int screens, int totalSeats)
        : id_(id), name_(std::move(name)), location_(std::move(location)), 
          screens_(screens), totalSeats_(totalSeats) {}
    
    // Getters
    int getId() const { return id_; }
    std::string getName() const { return name_; }
    std::string getLocation() const { return location_; }
    int getScreens() const { return screens_; }
    int getTotalSeats() const { return totalSeats_; }
    
    // Add a showtime to this cinema
    void addShowtime(const Showtime& showtime) {
        showtimes_.push_back(showtime);
    }
    
    const std::vector<Showtime>& getShowtimes() const {
        return showtimes_;
    }
    
    // Convert to Python dictionary
    py::dict to_dict() const {
        py::dict cinema_dict;
        cinema_dict["id"] = id_;
        cinema_dict["name"] = name_;
        cinema_dict["location"] = location_;
        cinema_dict["screens"] = screens_;
        cinema_dict["totalSeats"] = totalSeats_;
        
        py::list showtimes_list;
        for (const auto& showtime : showtimes_) {
            showtimes_list.append(showtime.to_dict());
        }
        cinema_dict["showtimes"] = showtimes_list;
        
        return cinema_dict;
    }
    
    // Create from Python dictionary
    static Cinema from_dict(const py::dict& dict) {
        if (!dict.contains("id") || !dict.contains("name")) {
            throw std::runtime_error("Invalid cinema dictionary - missing required fields");
        }
        
        Cinema cinema(
            dict["id"].cast<int>(),
            dict["name"].cast<std::string>(),
            dict.contains("location") ? dict["location"].cast<std::string>() : "",
            dict.contains("screens") ? dict["screens"].cast<int>() : 1,
            dict.contains("totalSeats") ? dict["totalSeats"].cast<int>() : 100
        );
        
        if (dict.contains("showtimes")) {
            py::list showtimes = dict["showtimes"];
            for (const auto& item : showtimes) {
                try {
                    cinema.addShowtime(Showtime::from_dict(item.cast<py::dict>()));
                } catch (const std::exception& e) {
                    std::cerr << "Warning: Failed to parse showtime - " << e.what() << std::endl;
                }
            }
        }
        
        return cinema;
    }
    
    // Create from JSON
    static Cinema from_json(const json& j) {
        if (!j.contains("id") || !j.contains("name")) {
            throw std::runtime_error("Invalid cinema JSON - missing required fields");
        }
        
        Cinema cinema(
            j["id"].get<int>(),
            j["name"].get<std::string>(),
            j.contains("location") && !j["location"].is_null() ? j["location"].get<std::string>() : "",
            j.contains("screens") && !j["screens"].is_null() ? j["screens"].get<int>() : 1,
            j.contains("totalSeats") && !j["totalSeats"].is_null() ? j["totalSeats"].get<int>() : 100
        );
        
        if (j.contains("showtimes") && !j["showtimes"].is_null() && j["showtimes"].is_array()) {
            for (const auto& showtime_json : j["showtimes"]) {
                try {
                    cinema.addShowtime(Showtime::from_json(showtime_json));
                } catch (const std::exception& e) {
                    std::cerr << "Warning: Failed to parse showtime - " << e.what() << std::endl;
                }
            }
        }
        
        return cinema;
    }

private:
    int id_ = 0;
    std::string name_;
    std::string location_;
    int screens_ = 0;
    int totalSeats_ = 0;
    std::vector<Showtime> showtimes_;
};

// Booking class
class Booking {
public:
    Booking() = default;
    
    Booking(std::string id, std::string userId, int movieId, std::string movieTitle,
            std::string moviePoster, std::string showtimeId, std::string showtimeDate,
            std::string showtimeTime, int cinemaId, std::string cinemaName,
            std::string screenType, std::vector<std::string> seats, double totalPrice,
            std::string bookingDate, bool cancelled = false)
        : id_(std::move(id)), userId_(std::move(userId)), movieId_(movieId), 
          movieTitle_(std::move(movieTitle)), moviePoster_(std::move(moviePoster)),
          showtimeId_(std::move(showtimeId)), showtimeDate_(std::move(showtimeDate)),
          showtimeTime_(std::move(showtimeTime)), cinemaId_(cinemaId),
          cinemaName_(std::move(cinemaName)), screenType_(std::move(screenType)),
          seats_(std::move(seats)), totalPrice_(totalPrice),
          bookingDate_(std::move(bookingDate)), cancelled_(cancelled) {}
    
    // Getters
    std::string getId() const { return id_; }
    std::string getUserId() const { return userId_; }
    int getMovieId() const { return movieId_; }
    std::string getMovieTitle() const { return movieTitle_; }
    std::string getMoviePoster() const { return moviePoster_; }
    std::string getShowtimeId() const { return showtimeId_; }
    std::string getShowtimeDate() const { return showtimeDate_; }
    std::string getShowtimeTime() const { return showtimeTime_; }
    int getCinemaId() const { return cinemaId_; }
    std::string getCinemaName() const { return cinemaName_; }
    std::string getScreenType() const { return screenType_; }
    std::vector<std::string> getSeats() const { return seats_; }
    double getTotalPrice() const { return totalPrice_; }
    std::string getBookingDate() const { return bookingDate_; }
    bool isCancelled() const { return cancelled_; }
    
    // Setters
    void cancel() { cancelled_ = true; }
    void restore() { cancelled_ = false; }
    
    // Convert to Python dictionary
    py::dict to_dict() const {
        py::dict booking_dict;
        booking_dict["id"] = id_;
        booking_dict["userId"] = userId_;
        booking_dict["movieId"] = movieId_;
        booking_dict["movieTitle"] = movieTitle_;
        booking_dict["moviePoster"] = moviePoster_;
        booking_dict["showtimeId"] = showtimeId_;
        booking_dict["showtimeDate"] = showtimeDate_;
        booking_dict["showtimeTime"] = showtimeTime_;
        booking_dict["cinemaId"] = cinemaId_;
        booking_dict["cinemaName"] = cinemaName_;
        booking_dict["screenType"] = screenType_;
        booking_dict["seats"] = seats_;
        booking_dict["totalPrice"] = totalPrice_;
        booking_dict["bookingDate"] = bookingDate_;
        booking_dict["cancelled"] = cancelled_;
        return booking_dict;
    }
    
    // Create from Python dictionary
    static Booking from_dict(const py::dict& dict) {
        if (!dict.contains("userId") || !dict.contains("movieId") || !dict.contains("showtimeId")) {
            throw std::runtime_error("Invalid booking dictionary - missing required fields");
        }
        
        std::vector<std::string> seats;
        if (dict.contains("seats")) {
            py::list seats_list = dict["seats"];
            for (const auto& seat : seats_list) {
                seats.push_back(seat.cast<std::string>());
            }
        }
        
        return Booking(
            dict.contains("id") ? dict["id"].cast<std::string>() : generate_uuid(),
            dict["userId"].cast<std::string>(),
            dict["movieId"].cast<int>(),
            dict.contains("movieTitle") ? dict["movieTitle"].cast<std::string>() : "",
            dict.contains("moviePoster") ? dict["moviePoster"].cast<std::string>() : "",
            dict["showtimeId"].cast<std::string>(),
            dict.contains("showtimeDate") ? dict["showtimeDate"].cast<std::string>() : "",
            dict.contains("showtimeTime") ? dict["showtimeTime"].cast<std::string>() : "",
            dict.contains("cinemaId") ? dict["cinemaId"].cast<int>() : 0,
            dict.contains("cinemaName") ? dict["cinemaName"].cast<std::string>() : "",
            dict.contains("screenType") ? dict["screenType"].cast<std::string>() : "Standard",
            seats,
            dict.contains("totalPrice") ? dict["totalPrice"].cast<double>() : 0.0,
            dict.contains("bookingDate") ? dict["bookingDate"].cast<std::string>() : get_current_date(),
            dict.contains("cancelled") ? dict["cancelled"].cast<bool>() : false
        );
    }
    
    // Create from JSON
    static Booking from_json(const json& j) {
        if (!j.contains("userId") || !j.contains("movieId") || !j.contains("showtimeId")) {
            throw std::runtime_error("Invalid booking JSON - missing required fields");
        }
        
        std::vector<std::string> seats;
        if (j.contains("seats") && !j["seats"].is_null() && j["seats"].is_array()) {
            for (const auto& seat : j["seats"]) {
                if (seat.is_string()) {
                    seats.push_back(seat.get<std::string>());
                }
            }
        }
        
        return Booking(
            j.contains("id") && !j["id"].is_null() ? j["id"].get<std::string>() : generate_uuid(),
            j["userId"].get<std::string>(),
            j["movieId"].get<int>(),
            j.contains("movieTitle") && !j["movieTitle"].is_null() ? j["movieTitle"].get<std::string>() : "",
            j.contains("moviePoster") && !j["moviePoster"].is_null() ? j["moviePoster"].get<std::string>() : "",
            j["showtimeId"].get<std::string>(),
            j.contains("showtimeDate") && !j["showtimeDate"].is_null() ? j["showtimeDate"].get<std::string>() : "",
            j.contains("showtimeTime") && !j["showtimeTime"].is_null() ? j["showtimeTime"].get<std::string>() : "",
            j.contains("cinemaId") && !j["cinemaId"].is_null() ? j["cinemaId"].get<int>() : 0,
            j.contains("cinemaName") && !j["cinemaName"].is_null() ? j["cinemaName"].get<std::string>() : "",
            j.contains("screenType") && !j["screenType"].is_null() ? j["screenType"].get<std::string>() : "Standard",
            seats,
            j.contains("totalPrice") && !j["totalPrice"].is_null() ? j["totalPrice"].get<double>() : 0.0,
            j.contains("bookingDate") && !j["bookingDate"].is_null() ? j["bookingDate"].get<std::string>() : get_current_date(),
            j.contains("cancelled") && !j["cancelled"].is_null() ? j["cancelled"].get<bool>() : false
        );
    }

private:
    std::string id_;
    std::string userId_;
    int movieId_ = 0;
    std::string movieTitle_;
    std::string moviePoster_;
    std::string showtimeId_;
    std::string showtimeDate_;
    std::string showtimeTime_;
    int cinemaId_ = 0;
    std::string cinemaName_;
    std::string screenType_;
    std::vector<std::string> seats_;
    double totalPrice_ = 0.0;
    std::string bookingDate_;
    bool cancelled_ = false;
};

// Booking System class - main class that manages all operations
class BookingSystem {
public:
    BookingSystem() {
        // Try to load existing bookings when the system starts
        try {
            loadBookings("bookings");
            if (bookings_.empty()) {
                std::cout << "No bookings found. Initializing with an empty list." << std::endl;
            }
        } catch (const std::exception& e) {
            std::cerr << "Warning: Failed to load existing bookings: " << e.what() << std::endl;
            bookings_.clear(); // Ensure bookings_ is initialized
        }
    }
    
    ~BookingSystem() {
        // Remove the call to saveBookings to prevent overwriting the file on shutdown
        // std::cout << "Bookings are not saved automatically on shutdown anymore." << std::endl;
    }
    
    // Movie operations
    void loadMovies(const std::string& filename) {
        std::lock_guard<std::mutex> lock(mutex_);
        movies_.clear();

        try {
            // Read the JSON file
            std::ifstream file(filename);
            if (!file.is_open()) {
                std::cerr << "Error: Could not open file " << filename << std::endl;
                return;
            }

            json data;
            try {
                file >> data;
            } catch (const json::parse_error& e) {
                std::cerr << "Error parsing JSON in file " << filename << ": " << e.what() << std::endl;
                return;
            }

            // Process the movies
            if (data.is_array()) {
                for (const auto& movie_json : data) {
                    try {
                        Movie movie = Movie::from_json(movie_json);
                        movies_.push_back(movie);
                    } catch (const std::exception& e) {
                        std::cerr << "Error parsing movie: " << e.what() << std::endl;
                    }
                }
            }

            // Add movies from existing bookings if not already loaded
            for (const auto& booking : bookings_) {
                int movieId = booking.getMovieId();
                auto it = std::find_if(movies_.begin(), movies_.end(),
                                       [movieId](const Movie& m) { return m.getId() == movieId; });
                if (it == movies_.end()) {
                    // Create a placeholder movie with minimal details from the booking
                    Movie placeholderMovie(
                        movieId,
                        booking.getMovieTitle(),
                        booking.getMoviePoster(),
                        "", // No banner available
                        "", // No description available
                        0.0, // No rating available
                        "", // No duration available
                        "", // No release date available
                        "", // No genres available
                        "", // No language available
                        "", // No director available
                        ""  // No cast available
                    );
                    movies_.push_back(placeholderMovie);
                }
            }

            std::cout << "Loaded " << movies_.size() << " movies from " << filename << std::endl;
        } catch (const std::exception& e) {
            std::cerr << "Error loading movies from " << filename << ": " << e.what() << std::endl;
        }
    }
    
    std::vector<Movie> getAllMovies() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return movies_;
    }
    
    Movie getMovieById(int id) const {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it = std::find_if(movies_.begin(), movies_.end(),
                               [id](const Movie& m) { return m.getId() == id; });
        if (it != movies_.end()) {
            return *it;
        }
        // Return empty movie if not found
        return Movie();
    }

    bool addMovie(const py::dict& movieData) {
        try {
            // Validate required fields
            if (!movieData.contains("id") || !movieData.contains("title")) {
                throw std::runtime_error("Missing required movie data fields");
            }

            // Handle string to numeric conversion for rating if needed
            double rating = 0.0;
            if (movieData.contains("rating")) {
                if (py::isinstance<py::float_>(movieData["rating"])) {
                    rating = movieData["rating"].cast<double>();
                } else if (py::isinstance<py::int_>(movieData["rating"])) {
                    rating = static_cast<double>(movieData["rating"].cast<int>());
                } else if (py::isinstance<py::str>(movieData["rating"])) {
                    try {
                        rating = std::stod(movieData["rating"].cast<std::string>());
                    } catch (const std::exception& e) {
                        std::cerr << "Warning: Could not convert rating to number: " << e.what() << std::endl;
                    }
                }
            }

            // Create a copy of the dictionary to modify
            py::dict movieDataCopy = movieData.attr("copy")();
            
            // Update the rating value with the converted numeric value
            movieDataCopy["rating"] = rating;

            // Create movie object from Python dictionary
            Movie movie = Movie::from_dict(movieDataCopy);
            
            // Check if movie with this ID already exists
            int movieId = movie.getId();
            auto it = std::find_if(movies_.begin(), movies_.end(),
                                   [movieId](const Movie& m) { return m.getId() == movieId; });
            
            // Lock for thread safety
            std::lock_guard<std::mutex> lock(mutex_);
            
            // If movie exists, update it; otherwise add new movie
            if (it != movies_.end()) {
                *it = movie;
                std::cout << "Updated movie with ID: " << movieId << std::endl;
            } else {
                movies_.push_back(movie);
                std::cout << "Added new movie with ID: " << movieId << std::endl;
            }
            
            return true;
        } catch (const std::exception& e) {
            std::cerr << "Error adding movie: " << e.what() << std::endl;
            return false;
        }
    }

    bool saveMovies(const std::string& filename) const {
        try {
            // Resolve the correct path
            std::filesystem::path basePath = std::filesystem::canonical(std::filesystem::current_path());
            while (basePath.filename() != "backend" && basePath.has_parent_path()) {
                basePath = basePath.parent_path(); // Traverse up to find the "backend" directory
            }
            if (basePath.filename() != "backend") {
                throw std::runtime_error("Error: Could not locate the backend directory.");
            }
            std::filesystem::path dataDir = basePath / "data";
            std::filesystem::path fullPath = dataDir / (filename + ".json");
    
            // Ensure the data directory exists
            if (!std::filesystem::exists(dataDir)) {
                std::filesystem::create_directories(dataDir);
            }
    
            // Convert movies to JSON
            json movies_json = json::array();
            for (const auto& movie : movies_) {
                json movie_json;
                movie_json["id"] = movie.getId();
                movie_json["title"] = movie.getTitle();
                movie_json["poster"] = movie.getPoster();
                movie_json["banner"] = movie.getBanner();
                movie_json["description"] = movie.getDescription();
                movie_json["rating"] = movie.getRating();
                movie_json["duration"] = movie.getDuration();
                movie_json["releaseDate"] = movie.getReleaseDate();
                
                // Parse genres string into JSON array
                std::string genres_str = movie.getGenres();
                json genres_json = json::array();
                std::istringstream genres_stream(genres_str);
                std::string genre;
                while (std::getline(genres_stream, genre, ',')) {
                    genre = trim(genre);
                    if (!genre.empty()) {
                        genres_json.push_back(genre);
                    }
                }
                movie_json["genres"] = genres_json;
                
                movie_json["language"] = movie.getLanguage();
                movie_json["director"] = movie.getDirector();
                
                // Parse cast string into JSON array
                std::string cast_str = movie.getCast();
                json cast_json = json::array();
                std::istringstream cast_stream(cast_str);
                std::string actor;
                while (std::getline(cast_stream, actor, ',')) {
                    actor = trim(actor);
                    if (!actor.empty()) {
                        cast_json.push_back(actor);
                    }
                }
                movie_json["cast"] = cast_json;
                
                movies_json.push_back(movie_json);
            }
            
            // Write JSON to file with explicit open mode
            std::ofstream file(fullPath, std::ios::out | std::ios::trunc);
            if (!file.is_open()) {
                throw std::runtime_error("Could not open file " + fullPath.string() + " for writing");
            }

            file << movies_json.dump(2); // Write formatted JSON
            file.close();

            std::cout << "Successfully saved " << movies_.size() << " movies to " << fullPath << std::endl;
            return true;
        } catch (const std::exception& e) {
            std::cerr << "Error saving movies to " << filename << ": " << e.what() << std::endl;
            return false;
        }
    }
    
    // Cinema operations
    void loadCinemas(const std::string& filename) {
        std::lock_guard<std::mutex> lock(mutex_);
        cinemas_.clear();
        
        try {
            // Read the JSON file
            std::ifstream file(filename);
            if (!file.is_open()) {
                std::cerr << "Error: Could not open file " << filename << std::endl;
                return;
            }
            
            json data;
            try {
                file >> data;
            } catch (const json::parse_error& e) {
                std::cerr << "Error parsing JSON in file " << filename << ": " << e.what() << std::endl;
                return;
            }
            
            // Process the cinemas
            if (data.is_array()) {
                for (const auto& cinema_json : data) {
                    try {
                        Cinema cinema = Cinema::from_json(cinema_json);
                        cinemas_.push_back(cinema);
                    } catch (const std::exception& e) {
                        std::cerr << "Error parsing cinema: " << e.what() << std::endl;
                    }
                }
            }
            
            std::cout << "Loaded " << cinemas_.size() << " cinemas from " << filename << std::endl;
        } catch (const std::exception& e) {
            std::cerr << "Error loading cinemas from " << filename << ": " << e.what() << std::endl;
        }
    }
    
    std::vector<Cinema> getAllCinemas() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return cinemas_;
    }
    
    Cinema getCinemaById(int id) const {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it = std::find_if(cinemas_.begin(), cinemas_.end(),
                              [id](const Cinema& c) { return c.getId() == id; });
        if (it != cinemas_.end()) {
            return *it;
        }
        // Return empty cinema if not found
        return Cinema();
    }

    bool addCinema(const py::dict& cinemaData) {
        try {
            // Validate required fields
            if (!cinemaData.contains("id") || !cinemaData.contains("name")) {
                throw std::runtime_error("Missing required cinema data fields");
            }

            // Create cinema object from Python dictionary
            Cinema cinema = Cinema::from_dict(cinemaData);
            
            // Check if cinema with this ID already exists
            int cinemaId = cinema.getId();
            auto it = std::find_if(cinemas_.begin(), cinemas_.end(),
                                   [cinemaId](const Cinema& c) { return c.getId() == cinemaId; });
            
            // Lock for thread safety
            std::lock_guard<std::mutex> lock(mutex_);
            
            // If cinema exists, update it; otherwise add new cinema
            if (it != cinemas_.end()) {
                *it = cinema;
                std::cout << "Updated cinema with ID: " << cinemaId << std::endl;
            } else {
                cinemas_.push_back(cinema);
                std::cout << "Added new cinema with ID: " << cinemaId << std::endl;
            }
            
            return true;
        } catch (const std::exception& e) {
            std::cerr << "Error adding cinema: " << e.what() << std::endl;
            return false;
        }
    }
    
    bool saveCinemas(const std::string& filename) const {
        try {
            // Resolve the correct path
            std::filesystem::path basePath = std::filesystem::canonical(std::filesystem::current_path());
            while (basePath.filename() != "backend" && basePath.has_parent_path()) {
                basePath = basePath.parent_path(); // Traverse up to find the "backend" directory
            }
            if (basePath.filename() != "backend") {
                throw std::runtime_error("Error: Could not locate the backend directory.");
            }
            std::filesystem::path dataDir = basePath / "data";
            std::filesystem::path fullPath = dataDir / (filename + ".json");
    
            // Ensure the data directory exists
            if (!std::filesystem::exists(dataDir)) {
                std::filesystem::create_directories(dataDir);
            }
    
            // Convert cinemas to JSON
            json cinemas_json = json::array();
            for (const auto& cinema : cinemas_) {
                json cinema_json;
                cinema_json["id"] = cinema.getId();
                cinema_json["name"] = cinema.getName();
                cinema_json["location"] = cinema.getLocation();
                cinema_json["screens"] = cinema.getScreens();
                cinema_json["totalSeats"] = cinema.getTotalSeats();
                
                // Convert showtimes to JSON array
                json showtimes_json = json::array();
                for (const auto& showtime : cinema.getShowtimes()) {
                    json showtime_json;
                    showtime_json["id"] = showtime.getId();
                    showtime_json["movieId"] = showtime.getMovieId();
                    showtime_json["cinemaId"] = showtime.getCinemaId();
                    showtime_json["cinemaName"] = showtime.getCinemaName();
                    showtime_json["date"] = showtime.getDate();
                    showtime_json["time"] = showtime.getTime();
                    showtime_json["screenType"] = showtime.getScreenType();
                    showtime_json["price"] = showtime.getPrice();
                    
                    // Add booked seats array
                    json seats_json = json::array();
                    for (const auto& seat : showtime.getBookedSeats()) {
                        seats_json.push_back(seat);
                    }
                    showtime_json["bookedSeats"] = seats_json;
                    
                    showtimes_json.push_back(showtime_json);
                }
                cinema_json["showtimes"] = showtimes_json;
                
                cinemas_json.push_back(cinema_json);
            }
            
            // Write JSON to file with explicit open mode
            std::ofstream file(fullPath, std::ios::out | std::ios::trunc);
            if (!file.is_open()) {
                throw std::runtime_error("Could not open file " + fullPath.string() + " for writing");
            }

            file << cinemas_json.dump(2); // Write formatted JSON
            file.close();

            std::cout << "Successfully saved " << cinemas_.size() << " cinemas to " << fullPath << std::endl;
            return true;
        } catch (const std::exception& e) {
            std::cerr << "Error saving cinemas to " << filename << ": " << e.what() << std::endl;
            return false;
        }
    }
    
    // Showtime operations
    bool addShowtime(const py::dict& showtimeData) {
        try {
            // Validate required fields
            if (!showtimeData.contains("id") || !showtimeData.contains("movieId") || 
                !showtimeData.contains("cinemaId") || !showtimeData.contains("date") || 
                !showtimeData.contains("time") || !showtimeData.contains("price")) {
                throw std::runtime_error("Missing required showtime data fields");
            }

            // Extract data
            std::string id = showtimeData["id"].cast<std::string>();
            int movieId = showtimeData["movieId"].cast<int>();
            int cinemaId = showtimeData["cinemaId"].cast<int>();
            std::string cinemaName = showtimeData.contains("cinemaName") ? 
                                     showtimeData["cinemaName"].cast<std::string>() : "";
            std::string date = showtimeData["date"].cast<std::string>();
            std::string time = showtimeData["time"].cast<std::string>();
            std::string screenType = showtimeData.contains("screenType") ? 
                                     showtimeData["screenType"].cast<std::string>() : "Standard";
            double price = showtimeData["price"].cast<double>();

            // Create showtime object
            Showtime showtime(id, movieId, cinemaId, cinemaName, date, time, screenType, price);

            // Lock for thread safety
            std::lock_guard<std::mutex> lock(mutex_);

            // Find the cinema and add the showtime
            auto it = std::find_if(cinemas_.begin(), cinemas_.end(),
                                   [cinemaId](const Cinema& c) { return c.getId() == cinemaId; });
            if (it != cinemas_.end()) {
                it->addShowtime(showtime);
                std::cout << "Added showtime with ID: " << id << " to cinema: " << cinemaId << std::endl;
                return true;
            } else {
                throw std::runtime_error("Cinema with ID " + std::to_string(cinemaId) + " not found");
            }
        } catch (const std::exception& e) {
            std::cerr << "Error adding showtime: " << e.what() << std::endl;
            return false;
        }
    }

    std::vector<Showtime> getShowtimesByMovie(int movieId) const {
        std::lock_guard<std::mutex> lock(mutex_);
        std::vector<Showtime> result;
        
        for (const auto& cinema : cinemas_) {
            for (const auto& showtime : cinema.getShowtimes()) {
                if (showtime.getMovieId() == movieId) {
                    result.push_back(showtime);
                }
            }
        }
        
        return result;
    }
    
    std::vector<Showtime> getShowtimesByDate(const std::string& date) const {
        std::lock_guard<std::mutex> lock(mutex_);
        std::vector<Showtime> result;
        
        for (const auto& cinema : cinemas_) {
            for (const auto& showtime : cinema.getShowtimes()) {
                if (showtime.getDate() == date) {
                    result.push_back(showtime);
                }
            }
        }
        
        return result;
    }
    
    std::vector<Showtime> getShowtimesByMovieAndDate(int movieId, const std::string& date) const {
        std::lock_guard<std::mutex> lock(mutex_);
        std::vector<Showtime> result;
        
        for (const auto& cinema : cinemas_) {
            for (const auto& showtime : cinema.getShowtimes()) {
                if (showtime.getMovieId() == movieId && showtime.getDate() == date) {
                    result.push_back(showtime);
                }
            }
        }
        
        return result;
    }
    
    Showtime getShowtimeById(const std::string& id) const {
        std::lock_guard<std::mutex> lock(mutex_);
        for (const auto& cinema : cinemas_) {
            for (const auto& showtime : cinema.getShowtimes()) {
                if (showtime.getId() == id) {
                    return showtime;
                }
            }
        }
        
        // Return empty showtime if not found
        return Showtime();
    }
    
    std::vector<std::string> getBookedSeatsForShowtime(const std::string& showtimeId) const {
        std::lock_guard<std::mutex> lock(mutex_);
        return getBookedSeatsForShowtimeInternal(showtimeId);
    }
    
    // Booking operations
    Booking createBooking(const py::dict& bookingData) {
        try {
            // Generate booking ID
            std::string bookingId = generate_uuid();
            
            // Check if the required fields are present
            if (!bookingData.contains("userId") || 
                !bookingData.contains("movieId") || 
                !bookingData.contains("showtimeId") ||
                !bookingData.contains("seats") ||
                !bookingData.contains("totalPrice")) {
                throw std::runtime_error("Missing required booking data fields");
            }
            
            // Extract data from booking data
            std::string userId = bookingData["userId"].cast<std::string>();
            int movieId = bookingData["movieId"].cast<int>();
            std::string movieTitle = bookingData.contains("movieTitle") ? 
                                     bookingData["movieTitle"].cast<std::string>() : "";
            std::string moviePoster = bookingData.contains("moviePoster") ? 
                                      bookingData["moviePoster"].cast<std::string>() : "";
            std::string showtimeId = bookingData["showtimeId"].cast<std::string>();
            std::string showtimeDate = bookingData.contains("showtimeDate") ? 
                                       bookingData["showtimeDate"].cast<std::string>() : "";
            std::string showtimeTime = bookingData.contains("showtimeTime") ? 
                                       bookingData["showtimeTime"].cast<std::string>() : "";
            int cinemaId = bookingData.contains("cinemaId") ? 
                           bookingData["cinemaId"].cast<int>() : 0;
            std::string cinemaName = bookingData.contains("cinemaName") ? 
                                     bookingData["cinemaName"].cast<std::string>() : "";
            std::string screenType = bookingData.contains("screenType") ? 
                                     bookingData["screenType"].cast<std::string>() : "Standard";
            
            // Extract seats from booking data
            std::vector<std::string> seats;
            if (py::isinstance<py::list>(bookingData["seats"])) {
                py::list seatsList = bookingData["seats"];
                for (const auto& seat : seatsList) {
                    seats.push_back(seat.cast<std::string>());
                }
            } else {
                throw std::runtime_error("Seats must be provided as a list");
            }
            
            double totalPrice = bookingData["totalPrice"].cast<double>();
            
            // Get current date
            std::string bookingDate = get_current_date();
            
            // Lock for the critical section
            std::lock_guard<std::mutex> lock(mutex_);
            
            // Verify the seats are not already booked
            std::vector<std::string> bookedSeats = getBookedSeatsForShowtimeInternal(showtimeId);
            for (const auto& seat : seats) {
                if (std::find(bookedSeats.begin(), bookedSeats.end(), seat) != bookedSeats.end()) {
                    throw std::runtime_error("Seat " + seat + " is already booked");
                }
            }
            
            // Create booking
            Booking booking(
                bookingId, userId, movieId, movieTitle, moviePoster, showtimeId,
                showtimeDate, showtimeTime, cinemaId, cinemaName, screenType,
                seats, totalPrice, bookingDate, false
            );
            
            // Add to bookings
            bookings_.push_back(booking);
            
            // Verify booking was added
            auto it = std::find_if(bookings_.begin(), bookings_.end(),
                                [&bookingId](const Booking& b) { return b.getId() == bookingId; });
            if (it == bookings_.end()) {
                throw std::runtime_error("Failed to add booking to internal storage");
            }
            
            // Update showtime seats in memory
            updateShowtimeSeats(showtimeId, seats, true);
            
            // Save bookings
            saveBookings("bookings");
            
            // Log successful booking creation
            std::cout << "Created booking with ID: " << bookingId << " for user: " << userId 
                      << ", movie: " << movieId << ", showtime: " << showtimeId 
                      << ", seats: " << seats.size() << std::endl;
            
            return booking;
        } catch (const std::exception& e) {
            std::cerr << "Error creating booking: " << e.what() << std::endl;
            throw; // Re-throw to let Python handle the exception
        }
    }
    
    Booking getBookingById(const std::string& id) const {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it = std::find_if(bookings_.begin(), bookings_.end(),
                              [id](const Booking& b) { return b.getId() == id; });
        if (it != bookings_.end()) {
            return *it;
        }
        // Return empty booking if not found
        return Booking();
    }
    
    bool cancelBooking(const std::string& id) {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it = std::find_if(bookings_.begin(), bookings_.end(),
                              [id](const Booking& b) { return b.getId() == id; });
        if (it != bookings_.end()) {
            // Cancel booking
            it->cancel();
            
            // Update showtime seats
            updateShowtimeSeats(it->getShowtimeId(), it->getSeats(), false);
            
            // Save bookings
            saveBookings("bookings");
            
            return true;
        }
        return false;
    }
    
    bool restoreBooking(const std::string& id) {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it = std::find_if(bookings_.begin(), bookings_.end(),
                              [id](const Booking& b) { return b.getId() == id; });
        if (it != bookings_.end() && it->isCancelled()) {
            // Check if seats are still available
            const std::vector<std::string>& requestedSeats = it->getSeats();
            
            // Get all booked seats for this showtime excluding this booking
            std::vector<std::string> bookedSeats;
            for (const auto& booking : bookings_) {
                if (booking.getShowtimeId() == it->getShowtimeId() && 
                    !booking.isCancelled() && 
                    booking.getId() != id) {
                    const auto& seats = booking.getSeats();
                    bookedSeats.insert(bookedSeats.end(), seats.begin(), seats.end());
                }
            }
            
            // Check for overlap with currently booked seats
            for (const auto& seat : requestedSeats) {
                if (std::find(bookedSeats.begin(), bookedSeats.end(), seat) != bookedSeats.end()) {
                    // Seat already booked by someone else
                    return false;
                }
            }
            
            // Restore booking
            it->restore();
            
            // Update showtime seats
            updateShowtimeSeats(it->getShowtimeId(), it->getSeats(), true);
            
            // Save bookings
            saveBookings("bookings");
            
            return true;
        }
        return false;
    }
    
    std::vector<Booking> getBookingsByUser(const std::string& userId) const {
        std::lock_guard<std::mutex> lock(mutex_);
        std::vector<Booking> result;
        
        for (const auto& booking : bookings_) {
            if (booking.getUserId() == userId) {
                result.push_back(booking);
            }
        }
        
        return result;
    }
    
    std::vector<Booking> getAllBookings() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return bookings_;
    }
    
    // Analytics operations
    py::dict getAnalytics() const {
        std::lock_guard<std::mutex> lock(mutex_);
        py::dict analytics;
        
        // Calculate total bookings
        int totalBookings = 0;
        double totalRevenue = 0.0;
        std::unordered_set<std::string> uniqueUsers;
        
        for (const auto& booking : bookings_) {
            if (!booking.isCancelled()) {
                totalBookings++;
                totalRevenue += booking.getTotalPrice();
                uniqueUsers.insert(booking.getUserId());
            }
        }
        
        analytics["totalBookings"] = totalBookings;
        analytics["totalRevenue"] = totalRevenue;
        analytics["uniqueUsers"] = static_cast<int>(uniqueUsers.size());
        
        // Calculate daily revenues
        std::map<std::string, double> dailyRevenue;
        std::map<int, int> movieBookings;
        std::map<std::string, int> screenTypeBookings;
        
        for (const auto& booking : bookings_) {
            if (!booking.isCancelled()) {
                dailyRevenue[booking.getBookingDate()] += booking.getTotalPrice();
                movieBookings[booking.getMovieId()]++;
                screenTypeBookings[booking.getScreenType()]++;
            }
        }
        
        // Convert daily revenue to Python dict
        py::dict revenueByDay;
        for (const auto& pair : dailyRevenue) {
            const std::string& day = pair.first;
            double revenue = pair.second;
            revenueByDay[day.c_str()] = revenue;
        }
        analytics["revenueByDay"] = revenueByDay;
        
        // Convert movie popularity to Python dict
        py::dict popularMovies;
        for (const auto& pair : movieBookings) {
            int movieId = pair.first;
            int count = pair.second;
            popularMovies[py::int_(movieId)] = count;
        }
        analytics["moviePopularity"] = popularMovies;
        
        // Convert screen type popularity to Python dict
        py::dict screenTypePopularity;
        for (const auto& pair : screenTypeBookings) {
            const std::string& screenType = pair.first;
            int count = pair.second;
            screenTypePopularity[screenType.c_str()] = count;
        }
        analytics["screenTypePopularity"] = screenTypePopularity;
        
        // Calculate average booking value
        if (totalBookings > 0) {
            analytics["averageBookingValue"] = totalRevenue / totalBookings;
        } else {
            analytics["averageBookingValue"] = 0.0;
        }
        
        // Cancellation rate
        int cancelledBookings = 0;
        for (const auto& booking : bookings_) {
            if (booking.isCancelled()) {
                cancelledBookings++;
            }
        }
        
        if (totalBookings + cancelledBookings > 0) {
            analytics["cancellationRate"] = static_cast<double>(cancelledBookings) / 
                                          (totalBookings + cancelledBookings);
        } else {
            analytics["cancellationRate"] = 0.0;
        }
        
        return analytics;
    }
    
    // Data persistence
    void saveData() const {
        std::lock_guard<std::mutex> lock(mutex_);
        
        // Check if this is being called during shutdown
        static bool is_shutdown_in_progress = false;
        if (is_shutdown_in_progress) {
            std::cout << "Warning: Data saving during shutdown is disabled. No data will be saved." << std::endl;
            return;
        }

        // For manual saves during application runtime
        try {
            saveBookings("bookings");
            std::cout << "Successfully saved " << bookings_.size() << " bookings" << std::endl;
            
            saveMovies("movies");
            std::cout << "Successfully saved " << movies_.size() << " movies" << std::endl;
            
            saveCinemas("cinemas");
            std::cout << "Successfully saved " << cinemas_.size() << " cinemas" << std::endl;
        } catch (const std::exception& e) {
            std::cerr << "Error in saveData: " << e.what() << std::endl;
        }
    }

    // Mark shutdown in progress to prevent data saving during termination
    void markShutdownInProgress() {
        static bool is_shutdown_in_progress = true;
        std::cout << "Shutdown in progress. Data saving is disabled." << std::endl;
    }

private:
    std::vector<Movie> movies_;
    std::vector<Cinema> cinemas_;
    std::vector<Booking> bookings_;
    mutable std::mutex mutex_;
    
    // Helper methods
    void updateShowtimeSeats(const std::string& showtimeId, const std::vector<std::string>& seats, bool isBooking) {
        // This would update the seats in a persistent storage in a production system
        std::string operation = isBooking ? "Booked" : "Unbooked";
        std::cout << operation << " seats for showtime " << showtimeId << ": ";
        for (const auto& seat : seats) {
            std::cout << seat << " ";
        }
        std::cout << std::endl;
    }
    
    // Non-locking version for internal use when lock is already held
    std::vector<std::string> getBookedSeatsForShowtimeInternal(const std::string& showtimeId) const {
        std::vector<std::string> bookedSeats;
        
        for (const auto& booking : bookings_) {
            if (booking.getShowtimeId() == showtimeId && !booking.isCancelled()) {
                auto seats = booking.getSeats();
                bookedSeats.insert(bookedSeats.end(), seats.begin(), seats.end());
            }
        }
        
        return bookedSeats;
    }
    
    void loadBookings(const std::string& filename) {
        bookings_.clear();
        
        try {
            // Dynamically resolve the correct path to the backend directory
            std::filesystem::path basePath = std::filesystem::canonical(std::filesystem::current_path());
            while (basePath.filename() != "backend" && basePath.has_parent_path()) {
                basePath = basePath.parent_path(); // Traverse up to find the "backend" directory
            }
            if (basePath.filename() != "backend") {
                throw std::runtime_error("Error: Could not locate the backend directory.");
            }
            std::filesystem::path fullPath = basePath / "data" / (filename + ".json");
            
            std::ifstream file(fullPath);
            if (!file.is_open()) {
                std::cerr << "Error: Could not open file " << fullPath << std::endl;
                return;
            }
            
            json data;
            try {
                file >> data;
            } catch (const json::parse_error& e) {
                std::cerr << "Error parsing JSON in file " << fullPath << ": " << e.what() << std::endl;
                return;
            }
            
            // Process the bookings
            if (data.is_array()) {
                for (const auto& booking_json : data) {
                    try {
                        Booking booking = Booking::from_json(booking_json);
                        bookings_.push_back(booking);

                        // Restore associated movie details
                        if (booking_json.contains("movieDetails")) {
                            const auto& movie_json = booking_json["movieDetails"];
                            int movieId = movie_json["id"].get<int>();
                            auto it = std::find_if(movies_.begin(), movies_.end(),
                                                   [movieId](const Movie& m) { return m.getId() == movieId; });
                            if (it == movies_.end()) {
                                movies_.push_back(Movie::from_json(movie_json));
                            }
                        }
                    } catch (const std::exception& e) {
                        std::cerr << "Error parsing booking: " << e.what() << std::endl;
                    }
                }
            }
            
            std::cout << "Loaded " << bookings_.size() << " bookings from " << fullPath << std::endl;
        } catch (const std::exception& e) {
            std::cerr << "Error loading bookings from " << filename << ": " << e.what() << std::endl;
        }
    }
    
    void saveBookings(const std::string& filename) const {
        try {
            // Dynamically resolve the correct path to the backend directory
            std::filesystem::path basePath = std::filesystem::canonical(std::filesystem::current_path());
            while (basePath.filename() != "backend" && basePath.has_parent_path()) {
                basePath = basePath.parent_path(); // Traverse up to find the "backend" directory
            }
            if (basePath.filename() != "backend") {
                throw std::runtime_error("Error: Could not locate the backend directory.");
            }
            std::filesystem::path dataDir = basePath / "data";
            std::filesystem::path fullPath = dataDir / (filename + ".json");
    
            // Ensure the data directory exists
            if (!std::filesystem::exists(dataDir)) {
                std::filesystem::create_directories(dataDir);
            }
    
            // Convert bookings to JSON
            json bookings_json = json::array();
            for (const auto& booking : bookings_) {
                json booking_json;
                booking_json["id"] = booking.getId();
                booking_json["userId"] = booking.getUserId();
                booking_json["movieId"] = booking.getMovieId();
                booking_json["movieTitle"] = booking.getMovieTitle();
                booking_json["moviePoster"] = booking.getMoviePoster();
                booking_json["showtimeId"] = booking.getShowtimeId();
                booking_json["showtimeDate"] = booking.getShowtimeDate();
                booking_json["showtimeTime"] = booking.getShowtimeTime();
                booking_json["cinemaId"] = booking.getCinemaId();
                booking_json["cinemaName"] = booking.getCinemaName();
                booking_json["screenType"] = booking.getScreenType();
    
                // Add seats
                json seats_json = json::array();
                for (const auto& seat : booking.getSeats()) {
                    seats_json.push_back(seat);
                }
                booking_json["seats"] = seats_json;
    
                booking_json["totalPrice"] = booking.getTotalPrice();
                booking_json["bookingDate"] = booking.getBookingDate();
                booking_json["cancelled"] = booking.isCancelled();

                // Add associated movie details
                auto it = std::find_if(movies_.begin(), movies_.end(),
                                       [&booking](const Movie& m) { return m.getId() == booking.getMovieId(); });
                if (it != movies_.end()) {
                    booking_json["movieDetails"] = {
                        {"id", it->getId()},
                        {"title", it->getTitle()},
                        {"poster", it->getPoster()},
                        {"banner", it->getBanner()},
                        {"description", it->getDescription()},
                        {"rating", it->getRating()},
                        {"duration", it->getDuration()},
                        {"releaseDate", it->getReleaseDate()},
                        {"genres", it->getGenres()},
                        {"language", it->getLanguage()},
                        {"director", it->getDirector()},
                        {"cast", it->getCast()}
                    };
                }
    
                bookings_json.push_back(booking_json);
            }
            
            // Write JSON to file with explicit open mode
            std::ofstream file(fullPath, std::ios::out | std::ios::trunc);
            if (!file.is_open()) {
                throw std::runtime_error("Could not open file " + fullPath.string() + " for writing");
            }

            file << bookings_json.dump(4); // Write formatted JSON
            file.close();

            std::cout << "Successfully saved " << bookings_.size() << " bookings to " << fullPath << std::endl;
        } catch (const std::exception& e) {
            std::cerr << "Error saving bookings to " << filename << ": " << e.what() << std::endl;
        }
    }
};

// Create a pybind11 module to expose the C++ classes to Python
PYBIND11_MODULE(cinema_engine, m) {
    m.doc() = "CookMyShow Backend Engine";
    
    py::class_<Movie>(m, "Movie")
        .def(py::init<>())
        .def(py::init<int, std::string, std::string, std::string, std::string, double, std::string, 
                      std::string, std::string, std::string, std::string, std::string>())
        .def("getId", &Movie::getId)
        .def("getTitle", &Movie::getTitle)
        .def("getPoster", &Movie::getPoster)
        .def("getBanner", &Movie::getBanner)
        .def("getDescription", &Movie::getDescription)
        .def("getRating", &Movie::getRating)
        .def("getDuration", &Movie::getDuration)
        .def("getReleaseDate", &Movie::getReleaseDate)
        .def("getGenres", &Movie::getGenres)
        .def("getLanguage", &Movie::getLanguage)
        .def("getDirector", &Movie::getDirector)
        .def("getCast", &Movie::getCast)
        .def("to_dict", &Movie::to_dict)
        .def_static("from_dict", &Movie::from_dict);
    
    py::class_<Cinema>(m, "Cinema")
        .def(py::init<>())
        .def(py::init<int, std::string, std::string, int, int>())
        .def("getId", &Cinema::getId)
        .def("getName", &Cinema::getName)
        .def("getLocation", &Cinema::getLocation)
        .def("getScreens", &Cinema::getScreens)
        .def("getTotalSeats", &Cinema::getTotalSeats)
        .def("addShowtime", &Cinema::addShowtime)
        .def("getShowtimes", &Cinema::getShowtimes)
        .def("to_dict", &Cinema::to_dict)
        .def_static("from_dict", &Cinema::from_dict);
    
    py::class_<Showtime>(m, "Showtime")
        .def(py::init<>())
        .def(py::init<std::string, int, int, std::string, std::string, std::string, std::string, double>())
        .def("getId", &Showtime::getId)
        .def("getMovieId", &Showtime::getMovieId)
        .def("getCinemaId", &Showtime::getCinemaId)
        .def("getCinemaName", &Showtime::getCinemaName)
        .def("getDate", &Showtime::getDate)
        .def("getTime", &Showtime::getTime)
        .def("getScreenType", &Showtime::getScreenType)
        .def("getPrice", &Showtime::getPrice)
        .def("isSeatBooked", &Showtime::isSeatBooked)
        .def("bookSeat", &Showtime::bookSeat)
        .def("unbookSeat", &Showtime::unbookSeat)
        .def("getBookedSeats", &Showtime::getBookedSeats)
        .def("to_dict", &Showtime::to_dict)
        .def_static("from_dict", &Showtime::from_dict);
    
    py::class_<Booking>(m, "Booking")
        .def(py::init<>())
        .def(py::init<std::string, std::string, int, std::string, std::string, std::string, 
                    std::string, std::string, int, std::string, std::string, 
                    std::vector<std::string>, double, std::string, bool>())
        .def("getId", &Booking::getId)
        .def("getUserId", &Booking::getUserId)
        .def("getMovieId", &Booking::getMovieId)
        .def("getMovieTitle", &Booking::getMovieTitle)
        .def("getMoviePoster", &Booking::getMoviePoster)
        .def("getShowtimeId", &Booking::getShowtimeId)
        .def("getShowtimeDate", &Booking::getShowtimeDate)
        .def("getShowtimeTime", &Booking::getShowtimeTime)
        .def("getCinemaId", &Booking::getCinemaId)
        .def("getCinemaName", &Booking::getCinemaName)
        .def("getScreenType", &Booking::getScreenType)
        .def("getSeats", &Booking::getSeats)
        .def("getTotalPrice", &Booking::getTotalPrice)
        .def("getBookingDate", &Booking::getBookingDate)
        .def("isCancelled", &Booking::isCancelled)
        .def("cancel", &Booking::cancel)
        .def("restore", &Booking::restore)
        .def("to_dict", &Booking::to_dict)
        .def_static("from_dict", &Booking::from_dict);
    
    py::class_<BookingSystem>(m, "BookingSystem")
        .def(py::init<>())
        .def("loadMovies", &BookingSystem::loadMovies)
        .def("getAllMovies", &BookingSystem::getAllMovies)
        .def("getMovieById", &BookingSystem::getMovieById)
        .def("addMovie", &BookingSystem::addMovie)  // Add binding for addMovie
        .def("saveMovies", &BookingSystem::saveMovies)  // Add binding for saveMovies
        .def("loadCinemas", &BookingSystem::loadCinemas)
        .def("getAllCinemas", &BookingSystem::getAllCinemas)
        .def("getCinemaById", &BookingSystem::getCinemaById)
        .def("addCinema", &BookingSystem::addCinema)  // Add binding for addCinema
        .def("saveCinemas", &BookingSystem::saveCinemas)  // Add binding for saveCinemas
        .def("getShowtimesByMovie", &BookingSystem::getShowtimesByMovie)
        .def("getShowtimesByDate", &BookingSystem::getShowtimesByDate)
        .def("getShowtimesByMovieAndDate", &BookingSystem::getShowtimesByMovieAndDate)
        .def("getShowtimeById", &BookingSystem::getShowtimeById)
        .def("getBookedSeatsForShowtime", &BookingSystem::getBookedSeatsForShowtime)
        .def("addShowtime", &BookingSystem::addShowtime)
        .def("createBooking", &BookingSystem::createBooking)
        .def("getBookingById", &BookingSystem::getBookingById)
        .def("cancelBooking", &BookingSystem::cancelBooking)
        .def("restoreBooking", &BookingSystem::restoreBooking)
        .def("getBookingsByUser", &BookingSystem::getBookingsByUser)
        .def("getAllBookings", &BookingSystem::getAllBookings)
        .def("getAnalytics", &BookingSystem::getAnalytics)
        .def("saveData", &BookingSystem::saveData)
        .def("markShutdownInProgress", &BookingSystem::markShutdownInProgress);
}