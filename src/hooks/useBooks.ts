import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Book } from '@/types/book';
import { TEST_BOOKS } from '@/data/testBooks';
import { friendlyFirestoreError } from '@/lib/firebase-errors';

interface UseBookFilters {
  category?: string;
  condition?: string;
  type?: string;
  searchQuery?: string;
}

// Generate test books with IDs for display
const getTestBooksWithIds = (): Book[] => {
  return TEST_BOOKS.map((book, index) => ({
    ...book,
    id: `test-book-${index + 1}`,
  }));
};

export function useBooks(filters: UseBookFilters = {}) {
  const [books, setBooks] = useState<Book[]>(getTestBooksWithIds());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Start with test books immediately
    let testBooks = getTestBooksWithIds();

    // Apply filters to test books
    if (filters.category) {
      testBooks = testBooks.filter((b) => b.category === filters.category);
    }
    if (filters.condition) {
      testBooks = testBooks.filter((b) => b.condition === filters.condition);
    }
    if (filters.type) {
      testBooks = testBooks.filter((b) => b.type === filters.type || b.type === 'both');
    }
    if (filters.searchQuery) {
      const search = filters.searchQuery.toLowerCase();
      testBooks = testBooks.filter(
        (b) =>
          b.title.toLowerCase().includes(search) ||
          b.author.toLowerCase().includes(search) ||
          b.category.toLowerCase().includes(search)
      );
    }

    setBooks(testBooks);

    // Try to fetch from Firebase (will replace test books if successful)
    try {
      const booksRef = collection(db, 'books');
      const q = query(booksRef, where('isAvailable', '==', true), orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.docs.length > 0) {
            let fetchedBooks = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
            })) as Book[];

            // Apply filters
            if (filters.category) {
              fetchedBooks = fetchedBooks.filter((b) => b.category === filters.category);
            }
            if (filters.condition) {
              fetchedBooks = fetchedBooks.filter((b) => b.condition === filters.condition);
            }
            if (filters.type) {
              fetchedBooks = fetchedBooks.filter((b) => b.type === filters.type || b.type === 'both');
            }
            if (filters.searchQuery) {
              const search = filters.searchQuery.toLowerCase();
              fetchedBooks = fetchedBooks.filter(
                (b) =>
                  b.title.toLowerCase().includes(search) ||
                  b.author.toLowerCase().includes(search) ||
                  b.category.toLowerCase().includes(search)
              );
            }

            setBooks(fetchedBooks);
          }
          setError(null);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching books:', err);
          setError(friendlyFirestoreError(err, 'Failed to load books'));
          // Firebase error - keep showing test books
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(friendlyFirestoreError(err, 'Failed to load books'));
      // Firebase not configured - keep showing test books
      setLoading(false);
    }
  }, [filters.category, filters.condition, filters.type, filters.searchQuery]);

  return { books, loading, error };
}

export function useAllBooks() {
  const [books, setBooks] = useState<Book[]>(getTestBooksWithIds());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const booksRef = collection(db, 'books');
      const q = query(booksRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.docs.length > 0) {
            const fetchedBooks = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
            })) as Book[];
            setBooks(fetchedBooks);
          }
          setError(null);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching all books:', err);
          setError(friendlyFirestoreError(err, 'Failed to load books'));
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(friendlyFirestoreError(err, 'Failed to load books'));
      setLoading(false);
    }
  }, []);

  return { books, loading, error };
}
