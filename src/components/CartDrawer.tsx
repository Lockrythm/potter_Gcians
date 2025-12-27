import { useCart } from '@/contexts/CartContext';
import { openWhatsAppCheckout } from '@/lib/whatsapp';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, Send } from 'lucide-react';

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, getTotal, clearCart } = useCart();

  const getItemPrice = (item: typeof items[0]) => {
    if (item.purchaseType === 'buy') {
      return item.book.buyPrice;
    }
    switch (item.rentDuration) {
      case 7:
        return item.book.rentPrice7Days;
      case 14:
        return item.book.rentPrice14Days;
      case 30:
        return item.book.rentPrice30Days;
      default:
        return 0;
    }
  };

  const handleCheckout = () => {
    openWhatsAppCheckout(items);
    clearCart();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="text-2xl">🦉</span>
            The Trunk
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <span className="text-6xl mb-4">📦</span>
            <p className="text-muted-foreground">Your trunk is empty</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add some books from the library
            </p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => (
                <div key={`${item.book.id}-${item.purchaseType}-${item.rentDuration}`} className="flex gap-3">
                  {/* Book Image */}
                  <div className="w-16 h-20 rounded bg-muted overflow-hidden flex-shrink-0">
                    {item.book.imageUrl ? (
                      <img
                        src={item.book.imageUrl}
                        alt={item.book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl">📖</span>
                      </div>
                    )}
                  </div>

                  {/* Book Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1">
                      {item.book.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {item.purchaseType === 'buy'
                        ? 'Buy'
                        : `Rent - ${item.rentDuration} days`}
                    </p>
                    <p className="text-sm font-semibold text-primary mt-1">
                      Rs {getItemPrice(item)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-auto text-destructive"
                        onClick={() => removeItem(item.book.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Total & Checkout */}
            <div className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Tribute</span>
                <span className="text-xl font-bold text-primary">Rs {getTotal()}</span>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full magical-glow bg-secondary text-secondary-foreground hover:bg-secondary/90"
                size="lg"
              >
                <Send className="mr-2 h-5 w-5" />
                Send Owl (WhatsApp)
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Your order will be sent via WhatsApp for confirmation
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
