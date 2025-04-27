import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-9xl font-bold text-neon-blue mb-4">404</h1>
          <h2 className="text-2xl md:text-3xl mb-8">Page Not Found</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <Link to="/" className="btn-primary inline-flex items-center">
            <Home size={18} className="mr-2" />
            Back to Homepage
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;