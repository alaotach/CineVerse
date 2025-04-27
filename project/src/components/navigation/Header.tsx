import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, User, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background-dark bg-opacity-90 backdrop-blur-sm shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Film className="h-8 w-8 text-neon-blue mr-2" />
            <span className="text-xl font-poppins font-bold">CineVerse</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/" className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}>
              Home
            </Link>
            {isAuthenticated && (
              <Link to="/my-bookings" className={`nav-link ${isActive('/my-bookings') ? 'nav-link-active' : ''}`}>
                My Bookings
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'nav-link-active' : ''}`}>
                Admin Panel
              </Link>
            )}
            {isAuthenticated ? (
              <button 
                onClick={logout}
                className="ml-4 btn-secondary"
              >
                Logout
              </button>
            ) : (
              <Link to="/login" className="ml-4 flex items-center btn-primary">
                <User className="h-4 w-4 mr-2" />
                Login
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden glass-card m-4 mt-0 p-4 animate-in fade-in slide-in-from-top">
          <nav className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'text-neon-blue' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            {isAuthenticated && (
              <Link 
                to="/my-bookings" 
                className={`nav-link ${isActive('/my-bookings') ? 'text-neon-blue' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                My Bookings
              </Link>
            )}
            {isAuthenticated && (
              <Link 
                to="/admin" 
                className={`nav-link ${isActive('/admin') ? 'text-neon-blue' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Panel
              </Link>
            )}
            {isAuthenticated ? (
              <button 
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="btn-secondary w-full mt-2"
              >
                Logout
              </button>
            ) : (
              <Link 
                to="/login" 
                className="btn-primary w-full mt-2 flex items-center justify-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-4 w-4 mr-2" />
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;