import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import libraryBg from '@/assets/library-hero-bg.jpg';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${libraryBg})` }}
      />
      
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-background/95" />
      
      {/* Magical Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-secondary rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute left-[10%] top-[30%] text-6xl opacity-60"
        animate={{
          y: [0, -15, 0],
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        📖
      </motion.div>

      <motion.div
        className="absolute right-[15%] top-[25%] text-5xl opacity-50"
        animate={{
          y: [0, -20, 0],
          rotate: [5, -5, 5],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      >
        👓
      </motion.div>

      <motion.div
        className="absolute left-[20%] bottom-[25%] text-4xl opacity-40"
        animate={{
          y: [0, -12, 0],
          x: [0, 5, 0],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      >
        ✨
      </motion.div>

      <motion.div
        className="absolute right-[10%] bottom-[30%] text-5xl opacity-50"
        animate={{
          y: [0, -18, 0],
          rotate: [-3, 3, -3],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.3,
        }}
      >
        🪶
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Decorative Badge */}
          <motion.div 
            className="mb-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary/20 border border-secondary/40 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <span className="text-xl">⚡</span>
            <span className="text-sm font-medium text-secondary">
              The Magical Book Bank
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-primary-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Unlock the{' '}
            <span className="text-secondary magical-text-glow">Secrets</span>
            <br />
            of Your <span className="text-secondary magical-text-glow">Semester</span>.
          </motion.h1>

          {/* Subtext */}
          <motion.p 
            className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Discover affordable textbooks, rare notes, and essential academic scrolls. 
            Rent or buy with a flick of a wand.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Button
              asChild
              size="lg"
              className="magical-button text-lg px-8 py-6 bg-primary border-2 border-secondary text-secondary hover:bg-secondary hover:text-primary-foreground transition-all duration-300"
            >
              <Link to="/library">
                Enter the Library
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 bg-transparent border-2 border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 backdrop-blur-sm"
            >
              <Link to="/library?type=rent">
                Rent Books
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-secondary magical-text-glow">500+</div>
              <div className="text-sm text-primary-foreground/70">Books</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-secondary magical-text-glow">20+</div>
              <div className="text-sm text-primary-foreground/70">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-secondary magical-text-glow">50%</div>
              <div className="text-sm text-primary-foreground/70">Savings</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
