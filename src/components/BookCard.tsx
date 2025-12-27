import { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, RentDuration } from '@/types/book';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, Sparkles } from 'lucide-react';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const { addItem } = useCart();
  const [purchaseType, setPurchaseType] = useState<'buy' | 'rent'>(
    book.type === 'rent' ? 'rent' : 'buy'
  );
  const [rentDuration, setRentDuration] = useState<RentDuration>(14);
  const [isHovered, setIsHovered] = useState(false);

  const canBuy = book.type === 'buy' || book.type === 'both';
  const canRent = book.type === 'rent' || book.type === 'both';

  const getDisplayPrice = () => {
    if (purchaseType === 'buy') {
      return book.buyPrice;
    }
    switch (rentDuration) {
      case 7:
        return book.rentPrice7Days;
      case 14:
        return book.rentPrice14Days;
      case 30:
        return book.rentPrice30Days;
      default:
        return 0;
    }
  };

  const handleAddToCart = () => {
    addItem(book, purchaseType, purchaseType === 'rent' ? rentDuration : undefined);
  };

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden bg-card border-border/50 hover:border-secondary/50 transition-colors duration-300 relative">
        {/* Magical Glow Effect on Hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            boxShadow: isHovered 
              ? '0 20px 40px -15px hsl(var(--secondary) / 0.3), inset 0 0 0 1px hsl(var(--secondary) / 0.2)' 
              : '0 0 0 0 transparent',
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Book Cover */}
        <div className="relative aspect-[3/4] bg-muted overflow-hidden">
          {book.imageUrl ? (
            <motion.img
              src={book.imageUrl}
              alt={book.title}
              className="w-full h-full object-cover"
              loading="lazy"
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.4 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
              <motion.span 
                className="text-4xl"
                animate={{ rotate: isHovered ? [0, -10, 10, 0] : 0 }}
                transition={{ duration: 0.5 }}
              >
                📖
              </motion.span>
            </div>
          )}
          
          {/* Condition Badge */}
          <Badge
            variant={book.condition === 'New' ? 'default' : 'secondary'}
            className="absolute top-2 right-2"
          >
            {book.condition}
          </Badge>

          {/* Sparkle Effect on Hover */}
          {isHovered && (
            <motion.div
              className="absolute top-2 left-2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <Sparkles className="h-4 w-4 text-secondary" />
            </motion.div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Title & Author */}
          <h3 className="font-semibold text-card-foreground line-clamp-2 mb-1">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">{book.author}</p>

          {/* Category Badge */}
          <div className="mb-3">
            <Badge variant="outline" className="text-xs border-secondary/30 text-secondary">
              {book.category}
            </Badge>
          </div>

          {/* Buy/Rent Toggle */}
          {canBuy && canRent && (
            <div className="flex gap-1 mb-3">
              <Button
                variant={purchaseType === 'buy' ? 'default' : 'outline'}
                size="sm"
                className={`flex-1 text-xs transition-all ${
                  purchaseType === 'buy' ? 'bg-primary text-primary-foreground' : ''
                }`}
                onClick={() => setPurchaseType('buy')}
              >
                Buy
              </Button>
              <Button
                variant={purchaseType === 'rent' ? 'default' : 'outline'}
                size="sm"
                className={`flex-1 text-xs transition-all ${
                  purchaseType === 'rent' ? 'bg-primary text-primary-foreground' : ''
                }`}
                onClick={() => setPurchaseType('rent')}
              >
                Rent
              </Button>
            </div>
          )}

          {/* Rent Duration Selector */}
          {purchaseType === 'rent' && canRent && (
            <Select
              value={rentDuration.toString()}
              onValueChange={(val) => setRentDuration(parseInt(val) as RentDuration)}
            >
              <SelectTrigger className="mb-3 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Days - Rs {book.rentPrice7Days}</SelectItem>
                <SelectItem value="14">14 Days - Rs {book.rentPrice14Days}</SelectItem>
                <SelectItem value="30">30 Days - Rs {book.rentPrice30Days}</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Price & Add to Cart */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-secondary">
                Rs {getDisplayPrice()}
              </span>
              {purchaseType === 'rent' && (
                <span className="text-xs text-muted-foreground ml-1">
                  /{rentDuration}d
                </span>
              )}
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                <ShoppingBag className="h-4 w-4 mr-1" />
                Add
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
