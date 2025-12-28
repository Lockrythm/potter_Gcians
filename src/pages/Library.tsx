import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { BottomNav } from '@/components/BottomNav';
import { BookCard } from '@/components/BookCard';
import { FilterDrawer } from '@/components/FilterDrawer';
import { VideoLoader } from '@/components/VideoLoader';
import { useBooks } from '@/hooks/useBooks';
import libraryBg from '@/assets/library-bg.jpg';

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
    <div className="min-h-screen relative pb-20 md:pb-0">
      {/* Background Image */}
      <div className="fixed inset-0 -z-10">
        <img 
          src={libraryBg} 
          alt="Library Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/80 dark:bg-background/85" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar onSearch={handleSearch} />
        <CartDrawer />
        <BottomNav />

        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground dark:text-white">
              The <span className="text-primary">Library</span>
            </h1>
            <p className="text-muted-foreground dark:text-white/70">
              Browse our magical collection. Buy or rent your favorite books.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-6 animate-fade-in">
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
          </div>

          {/* Search Query Display */}
          {searchQuery && (
            <p className="text-sm text-muted-foreground dark:text-white/70 mb-4 animate-fade-in">
              Showing results for "<span className="text-secondary">{searchQuery}</span>"
            </p>
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

          {/* Loading State - Video Loader */}
          {loading && <VideoLoader />}

          {/* Empty State */}
          {!loading && !error && books.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <span className="text-6xl block mb-4">📚</span>
              <p className="text-muted-foreground dark:text-white/70">No books found</p>
              <p className="text-sm text-muted-foreground dark:text-white/60">
                Try adjusting your filters or search query
              </p>
            </div>
          )}

          {/* Books Grid */}
          {!loading && !error && books.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-fade-in">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}

          {/* Results Count */}
          {!loading && !error && books.length > 0 && (
            <p className="text-sm text-muted-foreground dark:text-white/70 text-center mt-8">
              Showing {books.length} book{books.length !== 1 ? 's' : ''}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
