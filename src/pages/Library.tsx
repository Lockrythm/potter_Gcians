import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { BookCard } from '@/components/BookCard';
import { BookFilters } from '@/components/BookFilters';
import { useBooks } from '@/hooks/useBooks';
import { Skeleton } from '@/components/ui/skeleton';

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [semester, setSemester] = useState(searchParams.get('semester') || '');
  const [subject, setSubject] = useState(searchParams.get('subject') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const { books, loading, error } = useBooks({
    semester: semester ? parseInt(semester) : undefined,
    subject: subject || undefined,
    condition: condition || undefined,
    type: type || undefined,
    searchQuery: searchQuery || undefined,
  });

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (semester) params.set('semester', semester);
    if (subject) params.set('subject', subject);
    if (condition) params.set('condition', condition);
    if (type) params.set('type', type);
    if (searchQuery) params.set('search', searchQuery);
    setSearchParams(params, { replace: true });
  }, [semester, subject, condition, type, searchQuery, setSearchParams]);

  const handleClearFilters = () => {
    setSemester('');
    setSubject('');
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
        <div className="mb-8 fade-in">
          <h1 className="text-3xl font-bold mb-2">
            The <span className="text-primary">Library</span>
          </h1>
          <p className="text-muted-foreground">
            Browse our collection of textbooks. Buy or rent for your semester.
          </p>
        </div>

        {/* Filters */}
        <BookFilters
          semester={semester}
          subject={subject}
          condition={condition}
          type={type}
          onSemesterChange={setSemester}
          onSubjectChange={setSubject}
          onConditionChange={setCondition}
          onTypeChange={setType}
          onClearFilters={handleClearFilters}
        />

        {/* Search Query Display */}
        {searchQuery && (
          <p className="text-sm text-muted-foreground mb-4">
            Showing results for "{searchQuery}"
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
          <div className="text-center py-12">
            <span className="text-6xl">📚</span>
            <p className="text-muted-foreground mt-4">No books found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or search query
            </p>
          </div>
        )}

        {/* Books Grid */}
        {!loading && !error && books.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {books.map((book, index) => (
              <BookCard
                key={book.id}
                book={book}
                style={{ animationDelay: `${index * 50}ms` }}
              />
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && books.length > 0 && (
          <p className="text-sm text-muted-foreground text-center mt-8">
            Showing {books.length} book{books.length !== 1 ? 's' : ''}
          </p>
        )}
      </main>
    </div>
  );
}
