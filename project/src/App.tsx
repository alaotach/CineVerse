import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import SeatSelection from './pages/SeatSelection';
import BookingConfirmation from './pages/BookingConfirmation';
import PaymentConfirmation from './pages/PaymentConfirmation';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import AdminPanel from './pages/admin/AdminPanel';
import AuthModal from './components/auth/AuthModal';
import AppErrorBoundary from './components/common/AppErrorBoundary';
import ErrorHandler from './components/common/ErrorHandler';

function App() {
  return (
    <AppErrorBoundary>
      <AppProvider>
        {/* BrowserRouter was removed from here - it should only be in main.tsx */}
        <AuthModal />
        <Layout>
          <ErrorHandler>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/book/:movieId/:showtimeId" element={<SeatSelection />} />
              <Route path="/payment/:bookingId" element={<PaymentConfirmation />} />
              <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmation />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/*" element={<AdminPanel />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorHandler>
        </Layout>
      </AppProvider>
    </AppErrorBoundary>
  );
}

export default App;