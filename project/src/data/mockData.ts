import { Movie, Cinema, Showtime } from '../types/movie';

// Mock Movies Data
export const mockMovies: Movie[] = [
  {
    id: 1,
    title: "Avengers: Endgame",
    poster: "https://images.pexels.com/photos/11902838/pexels-photo-11902838.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    banner: "https://images.pexels.com/photos/4220967/pexels-photo-4220967.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
    description: "The Avengers take a final stand against Thanos in Marvel Studios' conclusion to 22 films.",
    duration: "3h 1m",
    releaseDate: "April 26, 2019",
    genres: ["Action", "Adventure", "Sci-Fi"],
    language: "English",
    rating: 8.4,
    director: "Anthony Russo, Joe Russo",
    cast: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth", "Scarlett Johansson"],
    trailerUrl: "https://www.youtube.com/watch?v=TcMBFSGVi1c"
  },
  {
    id: 2,
    title: "Interstellar",
    poster: "https://images.pexels.com/photos/11418072/pexels-photo-11418072.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    banner: "https://images.pexels.com/photos/7161/sea-sky-space-clouds.jpg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    duration: "2h 49m",
    releaseDate: "November 7, 2014",
    genres: ["Adventure", "Drama", "Sci-Fi"],
    language: "English",
    rating: 8.6,
    director: "Christopher Nolan",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"],
    trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E"
  },
  {
    id: 3,
    title: "Dune: Part Two",
    poster: "https://images.pexels.com/photos/16972972/pexels-photo-16972972/free-photo-of-desert-landscape-at-sunset.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    banner: "https://images.pexels.com/photos/8721318/pexels-photo-8721318.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    duration: "2h 46m",
    releaseDate: "March 1, 2024",
    genres: ["Action", "Adventure", "Drama"],
    language: "English",
    rating: 8.8,
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Josh Brolin"],
    trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w"
  },
  {
    id: 4,
    title: "The Dark Knight",
    poster: "https://images.pexels.com/photos/2859016/pexels-photo-2859016.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    banner: "https://images.pexels.com/photos/1239162/pexels-photo-1239162.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    duration: "2h 32m",
    releaseDate: "July 18, 2008",
    genres: ["Action", "Crime", "Drama"],
    language: "English",
    rating: 9.0,
    director: "Christopher Nolan",
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine"],
    trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY"
  },
  {
    id: 5,
    title: "Parasite",
    poster: "https://images.pexels.com/photos/11078092/pexels-photo-11078092.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    banner: "https://images.pexels.com/photos/2035738/pexels-photo-2035738.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    duration: "2h 12m",
    releaseDate: "October 11, 2019",
    genres: ["Comedy", "Drama", "Thriller"],
    language: "Korean",
    rating: 8.5,
    director: "Bong Joon Ho",
    cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik"],
    trailerUrl: "https://www.youtube.com/watch?v=5xH0HfJHsaY"
  }
];

// Mock Cinemas Data
export const mockCinemas: Cinema[] = [
  {
    id: 1,
    name: "CineVerse Deluxe",
    location: "Downtown Plaza, Main Street",
    screens: 8,
    totalSeats: 1200,
    amenities: ["IMAX", "4DX", "VIP Seating", "Dolby Atmos"],
    showtimes: []
  },
  {
    id: 2,
    name: "CineVerse Premium",
    location: "Westfield Mall, 5th Avenue",
    screens: 6,
    totalSeats: 900,
    amenities: ["Luxury Recliners", "Dine-in", "IMAX"],
    showtimes: []
  },
  {
    id: 3,
    name: "CineVerse City Center",
    location: "City Center Mall, Park Lane",
    screens: 10,
    totalSeats: 1600,
    amenities: ["4DX", "VIP Lounge", "IMAX", "Dolby Atmos"],
    showtimes: []
  }
];

// Generate today and next 7 days in YYYY-MM-DD format
const generateDateStrings = (days: number) => {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
};

const dates = generateDateStrings(7);

// Mock Showtimes Data
export const mockShowtimes: Showtime[] = [
  // Avengers: Endgame showtimes
  {
    id: "st1",
    movieId: 1,
    cinemaId: 1,
    date: dates[0],
    time: "10:00",
    screenType: "IMAX",
    price: 14.99,
    seatsAvailable: 120,
    seatsBooked: ["A1", "A2", "B5", "C7", "D10"]
  },
  {
    id: "st2",
    movieId: 1,
    cinemaId: 1,
    date: dates[0],
    time: "14:30",
    screenType: "Standard",
    price: 9.99,
    seatsAvailable: 100,
    seatsBooked: ["E5", "E6", "F10", "G8"]
  },
  {
    id: "st3",
    movieId: 1,
    cinemaId: 2,
    date: dates[0],
    time: "18:00",
    screenType: "4DX",
    price: 16.99,
    seatsAvailable: 80,
    seatsBooked: ["A10", "B10", "C10"]
  },
  {
    id: "st4",
    movieId: 1,
    cinemaId: 3,
    date: dates[1],
    time: "13:00",
    screenType: "IMAX",
    price: 14.99,
    seatsAvailable: 120,
    seatsBooked: ["A1", "A2"]
  },

  // Interstellar showtimes  
  {
    id: "st5",
    movieId: 2,
    cinemaId: 1,
    date: dates[0],
    time: "12:00",
    screenType: "IMAX",
    price: 14.99,
    seatsAvailable: 120,
    seatsBooked: ["D5", "D6", "E7"]
  },
  {
    id: "st6",
    movieId: 2,
    cinemaId: 2,
    date: dates[0],
    time: "16:30",
    screenType: "Standard",
    price: 9.99,
    seatsAvailable: 100,
    seatsBooked: ["A5", "A6"]
  },
  {
    id: "st7",
    movieId: 2,
    cinemaId: 3,
    date: dates[1],
    time: "19:00",
    screenType: "IMAX",
    price: 14.99,
    seatsAvailable: 120,
    seatsBooked: ["F10", "F11"]
  },
  
  // Dune: Part Two showtimes
  {
    id: "st8",
    movieId: 3,
    cinemaId: 1,
    date: dates[0],
    time: "15:00",
    screenType: "IMAX",
    price: 14.99,
    seatsAvailable: 120,
    seatsBooked: ["J10", "J11", "J12"]
  },
  {
    id: "st9",
    movieId: 3,
    cinemaId: 2,
    date: dates[0],
    time: "20:30",
    screenType: "4DX",
    price: 16.99,
    seatsAvailable: 80,
    seatsBooked: ["D15", "E15"]
  },
  {
    id: "st10",
    movieId: 3,
    cinemaId: 3,
    date: dates[1],
    time: "17:00",
    screenType: "Standard",
    price: 9.99,
    seatsAvailable: 100,
    seatsBooked: ["B8", "B9", "C8", "C9"]
  },

  // The Dark Knight showtimes
  {
    id: "st11",
    movieId: 4,
    cinemaId: 1,
    date: dates[0],
    time: "17:15",
    screenType: "Standard",
    price: 9.99,
    seatsAvailable: 100,
    seatsBooked: ["H5", "H6"]
  },
  {
    id: "st12",
    movieId: 4,
    cinemaId: 3,
    date: dates[1],
    time: "20:00",
    screenType: "IMAX",
    price: 14.99,
    seatsAvailable: 120,
    seatsBooked: ["D12", "D13"]
  },
  
  // Parasite showtimes
  {
    id: "st13",
    movieId: 5,
    cinemaId: 2,
    date: dates[0],
    time: "19:00",
    screenType: "Standard",
    price: 9.99,
    seatsAvailable: 100,
    seatsBooked: ["F5", "F6"]
  },
  {
    id: "st14",
    movieId: 5,
    cinemaId: 3,
    date: dates[1],
    time: "15:45",
    screenType: "Standard",
    price: 9.99,
    seatsAvailable: 100,
    seatsBooked: ["A15", "B15"]
  }
];

// Add showtimes to respective cinemas
mockCinemas.forEach(cinema => {
  cinema.showtimes = mockShowtimes.filter(showtime => showtime.cinemaId === cinema.id);
});

// Other mock data can be added as needed
