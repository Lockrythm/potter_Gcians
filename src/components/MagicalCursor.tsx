import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SparkleTrail {
  id: number;
  x: number;
  y: number;
}

export function MagicalCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trails, setTrails] = useState<SparkleTrail[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let trailId = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
      
      // Add sparkle trail
      const newTrail: SparkleTrail = {
        id: trailId++,
        x: e.clientX + (Math.random() - 0.5) * 20,
        y: e.clientY + (Math.random() - 0.5) * 20,
      };
      
      setTrails((prev) => [...prev.slice(-8), newTrail]);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Remove old trails
  useEffect(() => {
    const interval = setInterval(() => {
      setTrails((prev) => prev.slice(-6));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      {/* Main cursor glow */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2"
            style={{ left: position.x, top: position.y }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <div className="w-full h-full rounded-full bg-secondary/30 blur-sm" />
            <div className="absolute inset-1 rounded-full bg-secondary/60" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sparkle trails */}
      <AnimatePresence>
        {trails.map((trail) => (
          <motion.div
            key={trail.id}
            className="absolute w-2 h-2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: trail.x, top: trail.y }}
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 0, opacity: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-full h-full rounded-full bg-secondary" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
