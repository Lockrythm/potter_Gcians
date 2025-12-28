import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { BottomNav } from '@/components/BottomNav';
import { ProductCard } from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { productCategories } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import libraryBg from '@/assets/library-bg.jpg';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const { products, loading, error } = useProducts({
    category: category || undefined,
    searchQuery: searchQuery || undefined,
  });

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (searchQuery) params.set('search', searchQuery);
    setSearchParams(params, { replace: true });
  }, [category, searchQuery, setSearchParams]);

  const handleClearFilters = () => {
    setCategory('');
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
          alt="Background" 
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
              The <span className="text-primary">Store</span>
            </h1>
            <p className="text-muted-foreground dark:text-white/70">
              Browse our collection of essential academic supplies and equipment.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-6 animate-fade-in">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filter Products</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Category</h4>
                    <div className="flex flex-wrap gap-2">
                      {productCategories.map((cat) => (
                        <Button
                          key={cat}
                          variant={category === cat ? 'secondary' : 'outline'}
                          size="sm"
                          onClick={() => setCategory(category === cat ? '' : cat)}
                        >
                          {cat}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {(category || searchQuery) && (
                    <Button 
                      variant="ghost" 
                      className="w-full text-destructive"
                      onClick={handleClearFilters}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Active Filter Tags */}
            <div className="flex gap-2 flex-wrap">
              {category && (
                <Badge variant="secondary" className="gap-1">
                  {category}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setCategory('')}
                  />
                </Badge>
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
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <span className="text-6xl block mb-4">📦</span>
              <p className="text-muted-foreground dark:text-white/70">No products found</p>
              <p className="text-sm text-muted-foreground dark:text-white/60">
                Try adjusting your filters or search query
              </p>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-fade-in">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Results Count */}
          {!loading && !error && products.length > 0 && (
            <p className="text-sm text-muted-foreground dark:text-white/70 text-center mt-8">
              Showing {products.length} product{products.length !== 1 ? 's' : ''}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
