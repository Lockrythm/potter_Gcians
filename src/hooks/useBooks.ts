import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Book } from '@/types/book';

interface UseBookFilters {
  semester?: number;
  subject?: string;
  condition?: string;
  type?: string;
  searchQuery?: string;
}

export function useBooks(filters: UseBookFilters = {}) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    
    const booksRef = collection(db, 'books');
    let q = query(booksRef, where('isAvailable', '==', true), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let fetchedBooks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Book[];

        // Client-side filtering
        if (filters.semester) {
          fetchedBooks = fetchedBooks.filter((b) => b.semester === filters.semester);
        }
        if (filters.subject) {
          fetchedBooks = fetchedBooks.filter((b) => b.subject === filters.subject);
        }
        if (filters.condition) {
          fetchedBooks = fetchedBooks.filter((b) => b.condition === filters.condition);
        }
        if (filters.type) {
          fetchedBooks = fetchedBooks.filter(
            (b) => b.type === filters.type || b.type === 'both'
          );
        }
        if (filters.searchQuery) {
          const search = filters.searchQuery.toLowerCase();
          fetchedBooks = fetchedBooks.filter(
            (b) =>
              b.title.toLowerCase().includes(search) ||
              b.author.toLowerCase().includes(search) ||
              b.subject.toLowerCase().includes(search)
          );
        }

        setBooks(fetchedBooks);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching books:', err);
        setError('Failed to load books. Please check your Firebase configuration.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filters.semester, filters.subject, filters.condition, filters.type, filters.searchQuery]);

  return { books, loading, error };
}

export function useAllBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const booksRef = collection(db, 'books');
    const q = query(booksRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedBooks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Book[];

        setBooks(fetchedBooks);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching books:', err);
        setError('Failed to load books.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { books, loading, error };
}
