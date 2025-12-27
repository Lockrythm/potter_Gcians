import { ReactNode, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface PageFlipWrapperProps {
  children: ReactNode;
}

export function PageFlipWrapper({ children }: PageFlipWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Create page turn effect based on scroll
  const pageRotate = useTransform(scrollYProgress, [0, 0.1], [0, 0]);
  const pageOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 1]);

  return (
    <div ref={containerRef} className="relative">
      {/* Page corner effect */}
      <motion.div
        className="fixed top-0 right-0 w-32 h-32 pointer-events-none z-40"
        style={{
          opacity: pageOpacity,
          rotateZ: pageRotate,
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{ transform: 'rotate(90deg)' }}
        >
          <defs>
            <linearGradient id="pageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--secondary) / 0.3)" />
              <stop offset="100%" stopColor="hsl(var(--background) / 0)" />
            </linearGradient>
          </defs>
          <path
            d="M100 0 L100 100 L0 100 Q50 80 100 0"
            fill="url(#pageGradient)"
          />
        </svg>
      </motion.div>

      {/* Parchment texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-30 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {children}
    </div>
  );
}
