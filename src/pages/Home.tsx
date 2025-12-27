import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Clock, MessageCircle, Sparkles } from 'lucide-react';

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Buy or Rent',
    description: 'Choose to buy textbooks outright or rent them for 7, 14, or 30 days.',
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
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose <span className="text-primary">Potter</span>?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((feature, index) => (
                <Card
                  key={feature.title}
                  className="book-levitate bg-card"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-6 w-6 text-secondary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Start Your Semester?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Browse our collection of textbooks and get them delivered with just a WhatsApp message.
            </p>
            <Button
              asChild
              size="lg"
              className="magical-glow bg-primary hover:bg-primary/90"
            >
              <Link to="/library">
                Explore the Library
              </Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <span>👓⚡</span>
              <span>Potter Book Bank</span>
            </p>
            <p className="mt-2">Affordable books for every semester.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
