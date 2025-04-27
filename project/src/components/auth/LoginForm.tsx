import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onRegisterClick: () => void;
}

const LoginForm = ({ onRegisterClick }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-error/20 text-error rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="Enter your password"
            required
          />
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            className="btn-primary w-full flex justify-center items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loader mr-2"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-gray-400 text-sm">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onRegisterClick}
              className="text-neon-blue hover:text-blue-400 transition-colors"
            >
              Register
            </button>
          </p>
          
          <p className="mt-4 text-gray-500 text-xs">
            For demo: admin@example.com / password (admin) <br />
            or user@example.com / password (user)
          </p>
        </div>
      </form>
    </motion.div>
  );
};

export default LoginForm;
