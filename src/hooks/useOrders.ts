import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types/order';
import { friendlyFirestoreError } from '@/lib/firebase-errors';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            items: data.items || [],
            customerInfo: data.customerInfo || {},
            total: data.total || 0,
            status: data.status || 'pending',
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : new Date(data.createdAt),
          } as Order;
        });
        setOrders(ordersData);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching orders:', err);
        setError(friendlyFirestoreError(err, 'Failed to load orders'));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  };

  return { orders, loading, error, updateOrderStatus };
}
