import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCart } from '@/contexts/CartContext';
import { openWhatsAppCheckout } from '@/lib/whatsapp';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Trash2, Send, Sparkles } from 'lucide-react';
import { CheckoutForm } from './CheckoutForm';
import { CustomerInfo } from '@/types/order';
import { toast } from '@/hooks/use-toast';

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, getTotal, clearCart } = useCart();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    // Open WhatsApp INSTANTLY - don't wait for Firebase
    openWhatsAppCheckout(items, customerInfo);
    
    toast({
      title: 'Order Sent!',
      description: 'Complete the WhatsApp message to confirm your order.',
    });
    
    // Save to Firebase with proper date/time
    const now = new Date();
    const orderData = {
      items: items.map(item => ({
        bookId: item.book.id,
        bookTitle: item.book.title,
        bookAuthor: item.book.author,
        bookImageUrl: item.book.imageUrl,
        quantity: item.quantity,
        purchaseType: item.purchaseType,
        rentDuration: item.rentDuration || null,
        price: getItemPrice(item),
      })),
      customerInfo,
      total: getTotal(),
      status: 'pending',
      orderDate: now.toISOString(),
      orderDateFormatted: now.toLocaleString('en-PK', {
        dateStyle: 'full',
        timeStyle: 'short',
      }),
      createdAt: serverTimestamp(),
    };
    
    // Save to Firebase with proper error handling
    addDoc(collection(db, 'orders'), orderData)
      .then((docRef) => {
        console.log('Order saved with ID:', docRef.id);
      })
      .catch(err => {
        console.error('Order save failed:', err);
        toast({
          title: 'Warning',
          description: 'Order sent to WhatsApp but failed to save to database.',
          variant: 'destructive',
        });
      });
    
    clearCart();
    setCustomerInfo({});
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full p-0">
        <SheetHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <motion.span 
              className="text-2xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              🦉
            </motion.span>
            The Trunk
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <motion.div 
            className="flex-1 flex flex-col items-center justify-center text-center p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.span 
              className="text-6xl mb-4"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              📦
            </motion.span>
            <p className="text-muted-foreground">Your trunk is empty</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add some books from the library
            </p>
          </motion.div>
        ) : (
          <>
            {/* Scrollable area for items + form */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="px-6 py-4 space-y-4">
                {/* Cart Items */}
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => (
                    <motion.div 
                      key={`${item.book.id}-${item.purchaseType}-${item.rentDuration}`} 
                      className="flex gap-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                    >
                      {/* Book Image */}
                      <motion.div 
                        className="w-16 h-20 rounded bg-muted overflow-hidden flex-shrink-0"
                        whileHover={{ scale: 1.05 }}
                      >
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
                      </motion.div>

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
                            className="h-6 w-6 hover:bg-secondary/20 hover:border-secondary"
                            onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm w-6 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 hover:bg-secondary/20 hover:border-secondary"
                            onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem(item.book.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <Separator />

                {/* Customer Details Form */}
                <CheckoutForm customerInfo={customerInfo} onChange={setCustomerInfo} />
              </div>
            </ScrollArea>

            {/* Fixed footer - ALWAYS visible */}
            <div className="flex-shrink-0 border-t border-border px-6 py-4 bg-background space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Tribute</span>
                <motion.span 
                  className="text-xl font-bold text-primary"
                  key={getTotal()}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  Rs {getTotal()}
                </motion.span>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full magical-glow bg-secondary text-secondary-foreground hover:bg-secondary/90 relative overflow-hidden group"
                size="lg"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <Send className="mr-2 h-5 w-5" />
                {isSubmitting ? 'Sending...' : 'Send Owl (WhatsApp)'}
                <Sparkles className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
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
