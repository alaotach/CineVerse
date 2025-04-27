import { Link } from 'react-router-dom';
import { Film, Facebook, Twitter, Instagram, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-background-dark bg-opacity-95 border-t border-gray-800 pt-12 pb-6 mt-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <Film className="h-8 w-8 text-neon-blue mr-2" />
              <span className="text-xl font-poppins font-bold">CineVerse</span>
            </Link>
            <p className="text-gray-400 mb-4">
              Experience the magic of cinema with our premium booking experience. 
              Find the perfect seat and enjoy the show.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-neon-blue transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-neon-blue transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-neon-blue transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/my-bookings" className="text-gray-400 hover:text-white transition-colors">My Bookings</Link>
              </li>
              <li>
                <Link to="/admin" className="text-gray-400 hover:text-white transition-colors">Admin Panel</Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Action</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Comedy</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Drama</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Horror</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Sci-Fi</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-neon-blue mr-2 mt-0.5" />
                <span className="text-gray-400">support@cineverse.com</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 text-neon-blue mr-2 mt-0.5" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} CineVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;