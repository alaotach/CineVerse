import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  vx: number;
  vy: number;
  vr: number;
  opacity: number;
}

const ConfettiExplosion = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate confetti particles
    const colors = ['#4361ee', '#7209b7', '#f72585', '#4cc9f0', '#ffbe0b', '#fb5607'];
    const particleCount = 150;
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        size: Math.random() * 10 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20 - 3,
        vr: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    setParticles(newParticles);

    // Animation loop
    let animationFrameId: number;
    let lastTime = 0;

    const updateParticles = (time: number) => {
      if (!lastTime) lastTime = time;
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      setParticles(prevParticles => 
        prevParticles.map(particle => {
          // Update position
          const x = particle.x + particle.vx * deltaTime * 30;
          const y = particle.y + particle.vy * deltaTime * 30;
          
          // Apply gravity
          const vy = particle.vy + 9.8 * deltaTime;
          
          // Update rotation
          const rotation = (particle.rotation + particle.vr * deltaTime * 30) % 360;
          
          // Reduce opacity over time
          const opacity = particle.opacity - deltaTime * 0.5;
          
          return { ...particle, x, y, vy, rotation, opacity };
        }).filter(particle => particle.opacity > 0)
      );

      animationFrameId = requestAnimationFrame(updateParticles);
    };

    animationFrameId = requestAnimationFrame(updateParticles);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            opacity: particle.opacity,
            transition: 'opacity 0.5s',
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiExplosion;