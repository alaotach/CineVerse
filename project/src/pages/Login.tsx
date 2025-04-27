import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

type AuthMode = 'login' | 'register';

const Login = () => {
  const { isAuthenticated } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="pt-16 md:pt-20 min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-16 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <Film className="h-12 w-12 text-neon-blue" />
          <h1 className="text-3xl font-bold mt-4">Welcome to CineVerse</h1>
          <p className="text-gray-400 mt-2">Your premium movie ticket booking experience</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-8">
            {authMode === 'login' ? (
              <LoginForm onRegisterClick={() => setAuthMode('register')} />
            ) : (
              <RegisterForm onLoginClick={() => setAuthMode('login')} />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;