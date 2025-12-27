import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Clock, MessageCircle, Sparkles } from 'lucide-react';
import potterLogo from '@/assets/potter-logo.png';

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Buy or Rent',
    description: 'Choose to buy books outright or rent them for 7, 14, or 30 days.',
  },
  {
    icon: Clock,
    title: 'Quick Ordering',
    description: 'No signup required. Order via WhatsApp in seconds.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Checkout',
    description: 'Send your order directly to us. Simple and hassle-free.',
  },
  {
    icon: Sparkles,
    title: 'Quality Books',
    description: 'All books are inspected for quality. New and used options available.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main>
        <Hero />

        {/* Features Section */}
        <section className="py-16 bg-muted/30 relative overflow-hidden">
          {/* Background particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-secondary/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="container mx-auto px-4">
            <motion.h2 
              className="text-3xl font-bold text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Why Choose <span className="text-primary">Potter</span>?
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="book-levitate bg-card h-full group cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <motion.div 
                        className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <feature.icon className="h-6 w-6 text-secondary" />
                      </motion.div>
                      <h3 className="font-semibold mb-2 group-hover:text-secondary transition-colors">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <motion.div 
            className="container mx-auto px-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Browse our magical collection and get them delivered with just a WhatsApp message.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                asChild
                size="lg"
                className="magical-button bg-primary hover:bg-primary/90"
              >
                <Link to="/library">
                  Explore the Library
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <motion.div 
              className="flex items-center justify-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <img src={potterLogo} alt="Potter" className="h-6 w-auto dark:drop-shadow-[0_0_6px_rgba(255,255,255,0.6)] dark:brightness-110" />
              <span>Potter Book Bank</span>
            </motion.div>
            <p className="mt-2">Affordable books for every adventure.</p>
            
            {/* Credits */}
            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground/70">
                Books provided by{' '}
                <span className="font-semibold text-secondary">Gcians BOOK BANK</span>
              </p>
              <p className="text-xs text-muted-foreground/50 mt-1">
                Thank you for supporting local book communities
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
