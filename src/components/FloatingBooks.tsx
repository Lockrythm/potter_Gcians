import { motion } from 'framer-motion';
import hpCollection from '@/assets/hp-collection.jpeg';
import hpPhilosophersStone from '@/assets/hp-philosophers-stone.jpeg';

interface FloatingBookProps {
  src: string;
  alt: string;
  className?: string;
  delay?: number;
  duration?: number;
}

function FloatingBook({ src, alt, className = '', delay = 0, duration = 5 }: FloatingBookProps) {
  return (
    <motion.div
      className={`absolute ${className}`}
      animate={{
        y: [0, -25, 0],
        rotate: [-3, 3, -3],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      <motion.img
        src={src}
        alt={alt}
        className="w-24 h-32 md:w-32 md:h-44 object-cover rounded-lg shadow-2xl border-2 border-secondary/30"
        style={{
          boxShadow: '0 25px 50px -12px hsl(var(--primary) / 0.4), 0 0 30px hsl(var(--secondary) / 0.3)',
        }}
        whileHover={{
          scale: 1.1,
          rotate: 0,
          boxShadow: '0 30px 60px -15px hsl(var(--secondary) / 0.6)',
        }}
      />
    </motion.div>
  );
}

export function FloatingBooks() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <FloatingBook
        src={hpCollection}
        alt="Harry Potter Collection"
        className="left-[5%] top-[20%] opacity-70"
        delay={0}
        duration={5}
      />
      <FloatingBook
        src={hpPhilosophersStone}
        alt="Harry Potter and the Philosopher's Stone"
        className="right-[8%] top-[35%] opacity-60"
        delay={0.5}
        duration={6}
      />
      
      {/* Additional floating decorative elements */}
      <motion.div
        className="absolute left-[15%] bottom-[25%] text-5xl opacity-40"
        animate={{
          y: [0, -15, 0],
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      >
        📜
      </motion.div>
      
      <motion.div
        className="absolute right-[20%] bottom-[20%] text-4xl opacity-50"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.7,
        }}
      >
        🪄
      </motion.div>
    </div>
  );
}
