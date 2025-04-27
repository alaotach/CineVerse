export interface Cinema {
  id: number;
  name: string;
  location: string;
  address: string;
  screens: number;
  amenities: string[];
  contact: string;
  image?: string;
}

export interface CinemaWithShowtimes extends Cinema {
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
  bookedSeats: string[];
}
