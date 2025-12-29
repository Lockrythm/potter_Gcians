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
import { CartItem } from '@/types/book';

const WHATSAPP_NUMBER = '923126203644';

const categoryEmojis: Record<string, string> = {
  books: '📚',
  confessions: '🤫',
  help: '🆘',
  notices: '📢',
  general: '💬',
};

export function CartDrawer() {
  const { 
    items, 
    productItems,
    exploreItems,
    isOpen, 
    setIsOpen, 
    removeItem, 
    removeProductItem,
    removeExploreItem,
    updateQuantity, 
    updateProductQuantity,
    getTotal, 
    clearCart 
  } = useCart();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getBookItemPrice = (item: CartItem) => {
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
    // Build WhatsApp message including explore posts
    let message = '';
    
    // Add explore posts to message
    if (exploreItems.length > 0) {
      message += '🦉 *NEW EXPLORE POSTS*\n\n';
      exploreItems.forEach((item, idx) => {
        const emoji = categoryEmojis[item.category] || '💬';
        const contentPreview = item.content.length > 80 ? item.content.substring(0, 80) + '...' : item.content;
        message += `${idx + 1}. ${emoji} *${item.category.toUpperCase()}*\n`;
        message += `   Author: ${item.authorName}\n`;
        message += `   "${contentPreview}"\n`;
        message += `   Status: ⏳ Pending Approval\n\n`;
      });
    }
    
    // Add books/products if any
    if (items.length > 0 || productItems.length > 0) {
      openWhatsAppCheckout(items, productItems, customerInfo);
    } else if (exploreItems.length > 0) {
      // Only explore posts - open WhatsApp with explore message
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
    }
    
    toast({
      title: 'Order Sent!',
      description: 'Complete the WhatsApp message to confirm your order.',
    });
    
    // Save to Firebase with proper date/time (only if has books/products)
    if (items.length > 0 || productItems.length > 0) {
      const now = new Date();
      const orderData = {
        items: items.map(item => ({
          type: 'book',
          bookId: item.book.id,
          bookTitle: item.book.title,
          bookAuthor: item.book.author,
          bookImageUrl: item.book.imageUrl,
          quantity: item.quantity,
          purchaseType: item.purchaseType,
          rentDuration: item.rentDuration || null,
          price: getBookItemPrice(item),
        })),
        productItems: productItems.map(item => ({
          type: 'product',
          productId: item.product.id,
          productName: item.product.name,
          productImageUrl: item.product.imageUrl,
          quantity: item.quantity,
          price: item.product.price,
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
    }
    
    clearCart();
    setCustomerInfo({});
    setIsOpen(false);
  };

  const hasItems = items.length > 0 || productItems.length > 0 || exploreItems.length > 0;

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

        {!hasItems ? (
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
              Add some books, products, or posts
            </p>
          </motion.div>
        ) : (
          <>
            {/* Scrollable area for items + form */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="px-6 py-4 space-y-4">
                {/* Book Items */}
                {items.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">📚 Books</p>
                    <AnimatePresence mode="popLayout">
                      {items.map((item, index) => (
                        <motion.div 
                          key={`book-${item.book.id}-${item.purchaseType}-${item.rentDuration}`} 
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
                              Rs {getBookItemPrice(item)}
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
                  </>
                )}

                {/* Product Items */}
                {productItems.length > 0 && (
                  <>
                    {items.length > 0 && <Separator />}
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">📦 Products</p>
                    <AnimatePresence mode="popLayout">
                      {productItems.map((item, index) => (
                        <motion.div 
                          key={`product-${item.product.id}`} 
                          className="flex gap-3"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                          layout
                        >
                          {/* Product Image */}
                          <motion.div 
                            className="w-16 h-20 rounded bg-muted overflow-hidden flex-shrink-0"
                            whileHover={{ scale: 1.05 }}
                          >
                            {item.product.imageUrl ? (
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-2xl">📦</span>
                              </div>
                            )}
                          </motion.div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-1">
                              {item.product.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {item.product.category}
                            </p>
                            <p className="text-sm font-semibold text-primary mt-1">
                              Rs {item.product.price}
                            </p>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 hover:bg-secondary/20 hover:border-secondary"
                                onClick={() => updateProductQuantity(item.product.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm w-6 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 hover:bg-secondary/20 hover:border-secondary"
                                onClick={() => updateProductQuantity(item.product.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeProductItem(item.product.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </>
                )}

                {/* Explore Post Items */}
                {exploreItems.length > 0 && (
                  <>
                    {(items.length > 0 || productItems.length > 0) && <Separator />}
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">✨ Explore Posts</p>
                    <AnimatePresence mode="popLayout">
                      {exploreItems.map((item, index) => (
                        <motion.div 
                          key={item.id} 
                          className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                          layout
                        >
                          {/* Category Icon */}
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">{categoryEmojis[item.category] || '💬'}</span>
                          </div>

                          {/* Post Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium uppercase text-primary">{item.category}</span>
                              <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600">⏳ Pending</span>
                            </div>
                            <p className="text-sm line-clamp-2 text-foreground">
                              {item.content}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              By: {item.authorName}
                            </p>
                          </div>

                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeExploreItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </>
                )}

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
