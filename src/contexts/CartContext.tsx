import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Book, RentDuration } from '@/types/book';

interface CartContextType {
  items: CartItem[];
  addItem: (book: Book, purchaseType: 'buy' | 'rent', rentDuration?: RentDuration) => void;
  removeItem: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  itemCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'potter-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (book: Book, purchaseType: 'buy' | 'rent', rentDuration?: RentDuration) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.book.id === book.id &&
          item.purchaseType === purchaseType &&
          item.rentDuration === rentDuration
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }

      return [...prev, { book, quantity: 1, purchaseType, rentDuration }];
    });
    setIsOpen(true);
  };

  const removeItem = (bookId: string) => {
    setItems((prev) => prev.filter((item) => item.book.id !== bookId));
  };

  const updateQuantity = (bookId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(bookId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.book.id === bookId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemPrice = (item: CartItem) => {
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

  const getTotal = () => {
    return items.reduce((total, item) => total + getItemPrice(item) * item.quantity, 0);
  };

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        itemCount,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
