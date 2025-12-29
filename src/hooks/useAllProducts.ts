import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types/product';
import { testProducts } from '@/data/testProducts';
import { friendlyFirestoreError } from '@/lib/firebase-errors';

// Hook to fetch ALL products (for admin panel - no filtering)
export function useAllProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            // Use test products if no Firebase products
            setProducts(testProducts);
          } else {
            const fetchedProducts = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
            })) as Product[];
            setProducts(fetchedProducts);
          }
          setError(null);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching products:', err);
          setError(friendlyFirestoreError(err, 'Failed to load products'));
          // Fallback to test products on error
          setProducts(testProducts);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up products listener:', err);
      setError(friendlyFirestoreError(err, 'Failed to load products'));
      setProducts(testProducts);
      setLoading(false);
    }
  }, []);

  return { products, loading, error };
}
