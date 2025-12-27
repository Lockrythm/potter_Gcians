import { useState } from 'react';
import { Book, RentDuration } from '@/types/book';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag } from 'lucide-react';

interface BookCardProps {
  book: Book;
  style?: React.CSSProperties;
}

export function BookCard({ book, style }: BookCardProps) {
  const { addItem } = useCart();
  const [purchaseType, setPurchaseType] = useState<'buy' | 'rent'>(
    book.type === 'rent' ? 'rent' : 'buy'
  );
  const [rentDuration, setRentDuration] = useState<RentDuration>(14);

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
    <Card className="book-levitate overflow-hidden bg-card" style={style}>
      {/* Book Cover */}
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        {book.imageUrl ? (
          <img
            src={book.imageUrl}
            alt={book.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
            <span className="text-4xl">📖</span>
          </div>
        )}
        
        {/* Condition Badge */}
        <Badge
          variant={book.condition === 'New' ? 'default' : 'secondary'}
          className="absolute top-2 right-2"
        >
          {book.condition}
        </Badge>
      </div>

      <CardContent className="p-4">
        {/* Title & Author */}
        <h3 className="font-semibold text-card-foreground line-clamp-2 mb-1">
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-2">{book.author}</p>

        {/* Subject & Semester */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            Sem {book.semester}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {book.subject}
          </Badge>
        </div>

        {/* Buy/Rent Toggle */}
        {canBuy && canRent && (
          <div className="flex gap-1 mb-3">
            <Button
              variant={purchaseType === 'buy' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setPurchaseType('buy')}
            >
              Buy
            </Button>
            <Button
              variant={purchaseType === 'rent' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 text-xs"
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
            <span className="text-lg font-bold text-primary">
              Rs {getDisplayPrice()}
            </span>
            {purchaseType === 'rent' && (
              <span className="text-xs text-muted-foreground ml-1">
                /{rentDuration}d
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="magical-glow bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            <ShoppingBag className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
