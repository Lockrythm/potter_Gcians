import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center fade-in">
          {/* Decorative element */}
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
            <span className="text-2xl">📚</span>
            <span className="text-sm font-medium text-muted-foreground">
              Semester books at magical prices
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Unlock Your{' '}
            <span className="text-primary">Magical</span>{' '}
            <span className="text-secondary">Potential</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
            Buy or rent textbooks for your semester. Affordable books delivered 
            with a simple WhatsApp message.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="magical-glow bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Link to="/library">
                Browse the Library
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-secondary text-secondary hover:bg-secondary/10"
            >
              <Link to="/library?type=rent">
                Rent Books
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Books</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-secondary">8</div>
              <div className="text-sm text-muted-foreground">Semesters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">50%</div>
              <div className="text-sm text-muted-foreground">Savings</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
