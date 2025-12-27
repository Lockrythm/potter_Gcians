import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { BookCard } from '@/components/BookCard';
import { FilterDrawer } from '@/components/FilterDrawer';
import { useBooks } from '@/hooks/useBooks';
import { Skeleton } from '@/components/ui/skeleton';

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const { books, loading, error } = useBooks({
    category: category || undefined,
    condition: condition || undefined,
    type: type || undefined,
    searchQuery: searchQuery || undefined,
  });

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (condition) params.set('condition', condition);
    if (type) params.set('type', type);
    if (searchQuery) params.set('search', searchQuery);
    setSearchParams(params, { replace: true });
  }, [category, condition, type, searchQuery, setSearchParams]);

  const handleClearFilters = () => {
    setCategory('');
    setCondition('');
    setType('');
    setSearchQuery('');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearch={handleSearch} />
      <CartDrawer />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            The <span className="text-primary">Library</span>
          </h1>
          <p className="text-muted-foreground">
            Browse our magical collection. Buy or rent your favorite books.
          </p>
        </motion.div>

        {/* Filter Bar */}
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <FilterDrawer
            selectedCategory={category}
            selectedCondition={condition}
            selectedType={type}
            onCategoryChange={setCategory}
            onConditionChange={setCondition}
            onTypeChange={setType}
            onClearFilters={handleClearFilters}
          />
          
          {/* Active Filter Tags */}
          <div className="flex gap-2 flex-wrap">
            {category && (
              <span className="text-xs px-2 py-1 rounded-full bg-secondary/20 text-secondary border border-secondary/30">
                {category}
              </span>
            )}
            {condition && (
              <span className="text-xs px-2 py-1 rounded-full bg-secondary/20 text-secondary border border-secondary/30">
                {condition}
              </span>
            )}
            {type && (
              <span className="text-xs px-2 py-1 rounded-full bg-secondary/20 text-secondary border border-secondary/30">
                {type}
              </span>
            )}
          </div>
        </motion.div>

        {/* Search Query Display */}
        {searchQuery && (
          <motion.p 
            className="text-sm text-muted-foreground mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Showing results for "<span className="text-secondary">{searchQuery}</span>"
          </motion.p>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please check your Firebase configuration in the environment variables.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && books.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.span 
              className="text-6xl block mb-4"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              📚
            </motion.span>
            <p className="text-muted-foreground">No books found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or search query
            </p>
          </motion.div>
        )}

        {/* Books Grid */}
        {!loading && !error && books.length > 0 && (
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <BookCard book={book} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Results Count */}
        {!loading && !error && books.length > 0 && (
          <motion.p 
            className="text-sm text-muted-foreground text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Showing {books.length} book{books.length !== 1 ? 's' : ''}
          </motion.p>
        )}
      </main>
    </div>
  );
}
