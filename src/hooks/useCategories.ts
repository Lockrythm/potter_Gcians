import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Category } from '@/types/book';
import { friendlyFirestoreError } from '@/lib/firebase-errors';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedCategories = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Category[];

        setCategories(fetchedCategories);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching categories:', err);
        setError(friendlyFirestoreError(err, 'Failed to load categories'));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { categories, loading, error };
}
