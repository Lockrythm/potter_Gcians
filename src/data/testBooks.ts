import hpCollection from '@/assets/hp-collection.jpeg';
import hpPhilosophersStone from '@/assets/hp-philosophers-stone.jpeg';
import { Book } from '@/types/book';

// Static test books that can be used when Firebase is not configured
export const TEST_BOOKS: Omit<Book, 'id'>[] = [
  {
    title: "Harry Potter: The Complete Collection",
    author: "J.K. Rowling",
    category: "Fiction",
    condition: "New",
    type: "both",
    imageUrl: hpCollection,
    buyPrice: 4500,
    rentPrice7Days: 200,
    rentPrice14Days: 350,
    rentPrice30Days: 500,
    isAvailable: true,
    createdAt: new Date(),
  },
  {
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    category: "Fiction",
    condition: "Used",
    type: "both",
    imageUrl: hpPhilosophersStone,
    buyPrice: 800,
    rentPrice7Days: 50,
    rentPrice14Days: 80,
    rentPrice30Days: 120,
    isAvailable: true,
    createdAt: new Date(),
  },
];
