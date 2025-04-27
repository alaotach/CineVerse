export interface Booking {
  id: string;
  userId: string; // User ID is required
  movieId: number;
  movieTitle?: string;
  movieName?: string;
  moviePoster: string;
  cinemaId: number;
  cinemaName: string;
  screenType: string;
  showtimeId: string;
  showtimeDate?: string;
  showtimeTime?: string;
  date?: string;
  time?: string;
  seats: string[];
  totalPrice?: number;
  totalAmount?: number;
  paymentStatus?: string;
  status?: string;
  bookingDate?: string;
  created?: string;
  cancelled?: boolean;
}

export interface BookingRequest {
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
  userId: string; // User ID is now required in the request
}
