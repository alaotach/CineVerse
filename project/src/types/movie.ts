// Types for our movie booking system

export interface Movie {
  id: number;
  title: string;
  poster: string;
  banner?: string;
  description: string;
  rating: number;
  duration: string;
  releaseDate: string;
  genres: string[];
  language: string;
  director: string;
  cast: string[];
  trailerUrl?: string;
  showings?: number;
}

export interface Cinema {
  id: number;
  name: string;
  location: string;
  screens: number;
  totalSeats: number;
  showtimes: Showtime[];
}

export interface Showtime {
  id: string;
  movieId: number;
  cinemaId: number;
  cinemaName: string;
  date: string;
  time: string;
  screenType: string;
  price: number;
}

export interface Booking {
  id: string;
  userId: string;
  movieId: number;
  movieTitle: string;
  moviePoster: string;
  showtimeId: string;
  showtimeDate: string;
  showtimeTime: string;
  cinemaId: number;
  cinemaName: string;
  screenType: string;
  seats: string[];
  totalPrice: number;
  bookingDate: string;
  cancelled: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface BookingRequest {
  movieId: number;
  movieTitle: string;
  showtimeId: string;
  showtimeDate: string;
  showtimeTime: string;
  cinemaId: number;
  cinemaName: string;
  screenType: string;
  seats: string[];
  totalPrice: number;
}