import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Book, RentDuration } from '@/types/book';
import { Product, ProductCartItem } from '@/types/product';
import { ExploreCategory } from '@/types/explore';

export interface ExploreCartItem {
  id: string;
  category: ExploreCategory;
  content: string;
  authorName: string;
  status: 'pending';
  createdAt: Date;
}

interface CartContextType {
  items: CartItem[];
  productItems: ProductCartItem[];
  exploreItems: ExploreCartItem[];
  addItem: (book: Book, purchaseType: 'buy' | 'rent', rentDuration?: RentDuration) => void;
  addProductItem: (product: Product) => void;
  addExploreItem: (item: Omit<ExploreCartItem, 'id' | 'createdAt'>) => void;
  removeItem: (bookId: string) => void;
  removeProductItem: (productId: string) => void;
  removeExploreItem: (itemId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  updateProductQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  itemCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'potter-cart';
const PRODUCT_CART_STORAGE_KEY = 'potter-product-cart';
const EXPLORE_CART_STORAGE_KEY = 'potter-explore-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  
  const [productItems, setProductItems] = useState<ProductCartItem[]>(() => {
    const stored = localStorage.getItem(PRODUCT_CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [exploreItems, setExploreItems] = useState<ExploreCartItem[]>(() => {
    const stored = localStorage.getItem(EXPLORE_CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(PRODUCT_CART_STORAGE_KEY, JSON.stringify(productItems));
  }, [productItems]);

  useEffect(() => {
    localStorage.setItem(EXPLORE_CART_STORAGE_KEY, JSON.stringify(exploreItems));
  }, [exploreItems]);

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

  const addProductItem = (product: Product) => {
    setProductItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }

      return [...prev, { product, quantity: 1 }];
    });
    setIsOpen(true);
  };

  const removeItem = (bookId: string) => {
    setItems((prev) => prev.filter((item) => item.book.id !== bookId));
  };

  const removeProductItem = (productId: string) => {
    setProductItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const addExploreItem = (item: Omit<ExploreCartItem, 'id' | 'createdAt'>) => {
    const newItem: ExploreCartItem = {
      ...item,
      id: `explore-${Date.now()}`,
      createdAt: new Date(),
    };
    setExploreItems((prev) => [...prev, newItem]);
    setIsOpen(true);
  };

  const removeExploreItem = (itemId: string) => {
    setExploreItems((prev) => prev.filter((item) => item.id !== itemId));
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

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProductItem(productId);
      return;
    }
    setProductItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setProductItems([]);
    setExploreItems([]);
  };

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

  const getTotal = () => {
    const booksTotal = items.reduce((total, item) => total + getBookItemPrice(item) * item.quantity, 0);
    const productsTotal = productItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
    return booksTotal + productsTotal;
  };

  const itemCount = items.reduce((count, item) => count + item.quantity, 0) + 
                    productItems.reduce((count, item) => count + item.quantity, 0) +
                    exploreItems.length;

  return (
    <CartContext.Provider
      value={{
        items,
        productItems,
        exploreItems,
        addItem,
        addProductItem,
        addExploreItem,
        removeItem,
        removeProductItem,
        removeExploreItem,
        updateQuantity,
        updateProductQuantity,
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
