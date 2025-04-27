import { Film } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <Film className="h-12 w-12 text-neon-blue mb-4" />
        <div className="bg-neon-blue h-1 w-40 rounded-full overflow-hidden">
          <div className="bg-neon-blue/30 h-full w-full animate-[loading_1.5s_ease-in-out_infinite]"></div>
        </div>
        <p className="mt-4 text-lg text-gray-300">Loading...</p>
      </div>
      
      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;