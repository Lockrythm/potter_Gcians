export type BookCondition = 'New' | 'Used';
export type BookType = 'buy' | 'rent' | 'both';

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string; // Dynamic category from Firestore
  condition: BookCondition;
  type: BookType;
  buyPrice: number;
  rentPrice7Days: number;
  rentPrice14Days: number;
  rentPrice30Days: number;
  imageUrl: string;
  isAvailable: boolean;
  createdAt: Date;
}

export type RentDuration = 7 | 14 | 30;

export interface CartItem {
  book: Book;
  quantity: number;
  purchaseType: 'buy' | 'rent';
  rentDuration?: RentDuration;
}

export interface Category {
  id: string;
  name: string;
  createdAt: Date;
}
