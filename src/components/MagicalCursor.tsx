import { useEffect, useState, useRef, useCallback } from 'react';

export function MagicalCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const lastUpdate = useRef(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Throttle to 60fps max
    const now = Date.now();
    if (now - lastUpdate.current < 16) return;
    lastUpdate.current = now;
    
    setPosition({ x: e.clientX, y: e.clientY });
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove]);

  if (!isVisible) return null;

  return (
    <div 
      className="pointer-events-none fixed z-[9999] hidden md:block w-5 h-5 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
      style={{ 
        left: position.x, 
        top: position.y,
        willChange: 'transform'
      }}
    >
      <div className="w-full h-full rounded-full bg-secondary/40 blur-[2px]" />
      <div className="absolute inset-1 rounded-full bg-secondary/70" />
    </div>
  );
}
