import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ExplorePost, ExplorePostStatus } from '@/types/explore';

export function useExplorePosts(statusFilter?: ExplorePostStatus) {
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let q = query(collection(db, 'explore_posts'), orderBy('createdAt', 'desc'));
    
    if (statusFilter) {
      q = query(
        collection(db, 'explore_posts'),
        where('status', '==', statusFilter),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const postsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ExplorePost[];
        setPosts(postsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching explore posts:', err);
        setError('Failed to load posts');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [statusFilter]);

  return { posts, loading, error };
}

export function useAllExplorePosts() {
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'explore_posts'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const postsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ExplorePost[];
        setPosts(postsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching all explore posts:', err);
        setError('Failed to load posts');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { posts, loading, error };
}
