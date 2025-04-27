import { Booking } from '../types/booking';

// Mock bookings for fallback when API fails
export const mockBookings: Booking[] = [
  {
    id: 'mock1',
    userId: 'user1',
    movieId: 1,
    movieName: 'Avengers: Endgame',
    moviePoster: 'https://example.com/avengers-poster.jpg',
    cinemaId: 1,
    cinemaName: 'CineVerse Deluxe',
    screenType: 'IMAX',
    showtimeId: '1',
    date: '2025-04-27',
    time: '18:30',
    seats: ['A1', 'A2', 'A3'],
    totalAmount: 450,
    status: 'confirmed',
    paymentStatus: 'completed',
    created: '2025-04-25T10:30:00Z',
    cancelled: false
  },
  {
    id: 'mock2',
    userId: 'user1',
    movieId: 2,
    movieName: 'Interstellar',
    moviePoster: 'https://example.com/interstellar-poster.jpg',
    cinemaId: 2,
    cinemaName: 'CineVerse Premium',
    screenType: '4DX',
    showtimeId: '2',
    date: '2025-05-01',
    time: '20:00',
    seats: ['D5', 'D6'],
    totalAmount: 300,
    status: 'confirmed',
    paymentStatus: 'completed',
    created: '2025-04-26T15:45:00Z',
    cancelled: false
  },
  {
    id: 'mock3',
    userId: 'user2',
    movieId: 3,
    movieName: 'Dune: Part Two',
    moviePoster: 'https://example.com/dune-poster.jpg',
    cinemaId: 1,
    cinemaName: 'CineVerse Deluxe',
    screenType: 'Standard',
    showtimeId: '3',
    date: '2025-05-03',
    time: '14:30',
    seats: ['F10', 'F11', 'F12', 'F13'],
    totalAmount: 520,
    status: 'confirmed',
    paymentStatus: 'completed',
    created: '2025-04-26T09:15:00Z',
    cancelled: false
  }
];
