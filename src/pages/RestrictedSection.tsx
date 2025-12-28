import { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAllBooks } from '@/hooks/useBooks';
import { useAllProducts } from '@/hooks/useAllProducts';
import { useCategories } from '@/hooks/useCategories';
import { useOrders } from '@/hooks/useOrders';
import { Book, BookCondition, BookType, Category } from '@/types/book';
import { Product, productCategories } from '@/types/product';
import { Order } from '@/types/order';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Lock, Eye, EyeOff, Tag, BookOpen, Home, ArrowLeft, ShoppingBag, ChevronDown, ChevronUp, Package } from 'lucide-react';
import potterLogo from '@/assets/potter-logo.png';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'potter2024';

interface BookFormData {
  title: string;
  author: string;
  category: string;
  condition: BookCondition;
  type: BookType;
  buyPrice: number;
  rentPrice7Days: number;
  rentPrice14Days: number;
  rentPrice30Days: number;
  isAvailable: boolean;
}

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: number;
  isAvailable: boolean;
}

const initialBookFormData: BookFormData = {
  title: '',
  author: '',
  category: '',
  condition: 'New',
  type: 'both',
  buyPrice: 0,
  rentPrice7Days: 0,
  rentPrice14Days: 0,
  rentPrice30Days: 0,
  isAvailable: true,
};

const initialProductFormData: ProductFormData = {
  name: '',
  description: '',
  category: '',
  price: 0,
  isAvailable: true,
};

export default function RestrictedSection() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Book dialog state
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookFormData, setBookFormData] = useState<BookFormData>(initialBookFormData);
  const [bookImageFile, setBookImageFile] = useState<File | null>(null);
  const [isBookSubmitting, setIsBookSubmitting] = useState(false);
  
  // Product dialog state
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState<ProductFormData>(initialProductFormData);
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [isProductSubmitting, setIsProductSubmitting] = useState(false);
  
  // Category management
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const { books, loading: booksLoading, error: booksError } = useAllBooks();
  const { products, loading: productsLoading, error: productsError } = useAllProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { orders, loading: ordersLoading, updateOrderStatus } = useOrders();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({ title: 'Welcome to the Restricted Section', description: 'You now have full access.' });
    } else {
      toast({ title: 'Access Denied', description: 'Invalid password', variant: 'destructive' });
    }
  };

  // ============== Book CRUD ==============
  const openAddBookDialog = () => {
    setEditingBook(null);
    setBookFormData(initialBookFormData);
    setBookImageFile(null);
    setIsBookDialogOpen(true);
  };

  const openEditBookDialog = (book: Book) => {
    setEditingBook(book);
    setBookFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      condition: book.condition,
      type: book.type,
      buyPrice: book.buyPrice,
      rentPrice7Days: book.rentPrice7Days,
      rentPrice14Days: book.rentPrice14Days,
      rentPrice30Days: book.rentPrice30Days,
      isAvailable: book.isAvailable,
    });
    setBookImageFile(null);
    setIsBookDialogOpen(true);
  };

  const handleBookImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBookImageFile(e.target.files[0]);
    }
  };

  const uploadBookImage = async (): Promise<string | null> => {
    if (!bookImageFile) return null;
    const storageRef = ref(storage, `books/${Date.now()}_${bookImageFile.name}`);
    const snapshot = await uploadBytes(storageRef, bookImageFile);
    return getDownloadURL(snapshot.ref);
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBookSubmitting(true);

    try {
      let imageUrl = editingBook?.imageUrl || '';
      if (bookImageFile) {
        const uploadedUrl = await uploadBookImage();
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      const bookData = {
        ...bookFormData,
        imageUrl,
        createdAt: editingBook ? editingBook.createdAt : serverTimestamp(),
      };

      if (editingBook) {
        await updateDoc(doc(db, 'books', editingBook.id), bookData);
        toast({ title: 'Book Updated', description: `"${bookFormData.title}" has been updated.` });
      } else {
        await addDoc(collection(db, 'books'), bookData);
        toast({ title: 'Book Added', description: `"${bookFormData.title}" has been added to the library.` });
      }

      setIsBookDialogOpen(false);
      setBookFormData(initialBookFormData);
      setBookImageFile(null);
      setEditingBook(null);
    } catch (err) {
      console.error('Error saving book:', err);
      toast({ title: 'Error', description: 'Failed to save book. Check console for details.', variant: 'destructive' });
    } finally {
      setIsBookSubmitting(false);
    }
  };

  const handleBookDelete = async (book: Book) => {
    if (!confirm(`Are you sure you want to delete "${book.title}"?`)) return;

    try {
      await deleteDoc(doc(db, 'books', book.id));
      toast({ title: 'Book Deleted', description: `"${book.title}" has been removed.` });
    } catch (err) {
      console.error('Error deleting book:', err);
      toast({ title: 'Error', description: 'Failed to delete book.', variant: 'destructive' });
    }
  };

  const toggleBookAvailability = async (book: Book) => {
    try {
      await updateDoc(doc(db, 'books', book.id), { isAvailable: !book.isAvailable });
      toast({
        title: book.isAvailable ? 'Book Hidden' : 'Book Visible',
        description: `"${book.title}" is now ${book.isAvailable ? 'hidden' : 'visible'} in the library.`,
      });
    } catch (err) {
      console.error('Error toggling availability:', err);
      toast({ title: 'Error', description: 'Failed to update availability.', variant: 'destructive' });
    }
  };

  // ============== Product CRUD ==============
  const openAddProductDialog = () => {
    setEditingProduct(null);
    setProductFormData(initialProductFormData);
    setProductImageFile(null);
    setIsProductDialogOpen(true);
  };

  const openEditProductDialog = (product: Product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      isAvailable: product.isAvailable,
    });
    setProductImageFile(null);
    setIsProductDialogOpen(true);
  };

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProductImageFile(e.target.files[0]);
    }
  };

  const uploadProductImage = async (): Promise<string | null> => {
    if (!productImageFile) return null;
    const storageRef = ref(storage, `products/${Date.now()}_${productImageFile.name}`);
    const snapshot = await uploadBytes(storageRef, productImageFile);
    return getDownloadURL(snapshot.ref);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProductSubmitting(true);

    try {
      let imageUrl = editingProduct?.imageUrl || '';
      if (productImageFile) {
        const uploadedUrl = await uploadProductImage();
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      const productData = {
        ...productFormData,
        imageUrl,
        createdAt: editingProduct ? editingProduct.createdAt : serverTimestamp(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        toast({ title: 'Product Updated', description: `"${productFormData.name}" has been updated.` });
      } else {
        await addDoc(collection(db, 'products'), productData);
        toast({ title: 'Product Added', description: `"${productFormData.name}" has been added to the store.` });
      }

      setIsProductDialogOpen(false);
      setProductFormData(initialProductFormData);
      setProductImageFile(null);
      setEditingProduct(null);
    } catch (err) {
      console.error('Error saving product:', err);
      toast({ title: 'Error', description: 'Failed to save product. Check console for details.', variant: 'destructive' });
    } finally {
      setIsProductSubmitting(false);
    }
  };

  const handleProductDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    try {
      await deleteDoc(doc(db, 'products', product.id));
      toast({ title: 'Product Deleted', description: `"${product.name}" has been removed.` });
    } catch (err) {
      console.error('Error deleting product:', err);
      toast({ title: 'Error', description: 'Failed to delete product.', variant: 'destructive' });
    }
  };

  const toggleProductAvailability = async (product: Product) => {
    try {
      await updateDoc(doc(db, 'products', product.id), { isAvailable: !product.isAvailable });
      toast({
        title: product.isAvailable ? 'Product Hidden' : 'Product Visible',
        description: `"${product.name}" is now ${product.isAvailable ? 'hidden' : 'visible'} in the store.`,
      });
    } catch (err) {
      console.error('Error toggling availability:', err);
      toast({ title: 'Error', description: 'Failed to update availability.', variant: 'destructive' });
    }
  };

  // ============== Category CRUD ==============
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsAddingCategory(true);

    try {
      await addDoc(collection(db, 'categories'), {
        name: newCategoryName.trim(),
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Category Added', description: `"${newCategoryName}" has been created.` });
      setNewCategoryName('');
    } catch (err) {
      console.error('Error adding category:', err);
      toast({ title: 'Error', description: 'Failed to add category.', variant: 'destructive' });
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`Delete category "${category.name}"? Books with this category won't be deleted.`)) return;

    try {
      await deleteDoc(doc(db, 'categories', category.id));
      toast({ title: 'Category Deleted', description: `"${category.name}" has been removed.` });
    } catch (err) {
      console.error('Error deleting category:', err);
      toast({ title: 'Error', description: 'Failed to delete category.', variant: 'destructive' });
    }
  };

  // Password Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-secondary/20">
          <CardHeader className="text-center">
            <img src={potterLogo} alt="Potter" className="h-12 w-auto mx-auto mb-4 dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
            <CardTitle>The Restricted Section</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              This area is for authorized personnel only.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                <Lock className="mr-2 h-4 w-4" />
                Enter
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Button variant="link" asChild className="text-muted-foreground">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={potterLogo} alt="Potter" className="h-8 sm:h-10 w-auto dark:drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]" />
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                Restricted Section
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Manage books, products & orders</p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="books" className="space-y-4 sm:space-y-6">
          {/* Mobile-friendly horizontal scrollable tabs */}
          <ScrollArea className="w-full">
            <TabsList className="bg-muted inline-flex w-auto min-w-full sm:w-auto">
              <TabsTrigger value="books" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Books</span>
                <span className="xs:hidden">📚</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Products</span>
                <span className="xs:hidden">📦</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <Tag className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Categories</span>
                <span className="xs:hidden">🏷️</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Orders</span>
                <span className="xs:hidden">🛒</span>
                {orders.filter(o => o.status === 'pending').length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-[10px] sm:text-xs">
                    {orders.filter(o => o.status === 'pending').length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </ScrollArea>

          {/* Books Tab */}
          <TabsContent value="books" className="animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-muted-foreground">{books.length} books total</p>
              <Button onClick={openAddBookDialog} size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Book
              </Button>
            </div>

            {booksError && (
              <div className="text-center py-12 text-destructive">{booksError}</div>
            )}

            {booksLoading && (
              <div className="text-center py-12 text-muted-foreground">Loading books...</div>
            )}

            {!booksLoading && !booksError && (
              <Card className="border-border/50">
                <CardContent className="p-0">
                  <ScrollArea className="w-full">
                    <div className="min-w-[600px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Book</TableHead>
                            <TableHead className="hidden sm:table-cell">Category</TableHead>
                            <TableHead className="hidden md:table-cell">Type</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {books.map((book) => (
                            <TableRow key={book.id}>
                              <TableCell>
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="w-8 h-12 sm:w-10 sm:h-14 bg-muted rounded overflow-hidden flex-shrink-0">
                                    {book.imageUrl ? (
                                      <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-sm">📖</div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-xs sm:text-sm line-clamp-1">{book.title}</p>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">{book.author}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <Badge variant="outline" className="border-secondary/30 text-xs">
                                  {book.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Badge variant="outline" className="capitalize text-xs">{book.type}</Badge>
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm">Rs {book.buyPrice}</TableCell>
                              <TableCell>
                                <Switch
                                  checked={book.isAvailable}
                                  onCheckedChange={() => toggleBookAvailability(book)}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => openEditBookDialog(book)}>
                                    <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-destructive" onClick={() => handleBookDelete(book)}>
                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {books.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                No books yet. Add your first book!
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-muted-foreground">{products.length} products total</p>
              <Button onClick={openAddProductDialog} size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>

            {productsError && (
              <div className="text-center py-12 text-destructive">{productsError}</div>
            )}

            {productsLoading && (
              <div className="text-center py-12 text-muted-foreground">Loading products...</div>
            )}

            {!productsLoading && !productsError && (
              <Card className="border-border/50">
                <CardContent className="p-0">
                  <ScrollArea className="w-full">
                    <div className="min-w-[500px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="hidden sm:table-cell">Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell>
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                                    {product.imageUrl ? (
                                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-sm">📦</div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-xs sm:text-sm line-clamp-1">{product.name}</p>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <Badge variant="outline" className="border-secondary/30 text-xs">
                                  {product.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm">Rs {product.price}</TableCell>
                              <TableCell>
                                <Switch
                                  checked={product.isAvailable}
                                  onCheckedChange={() => toggleProductAvailability(product)}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => openEditProductDialog(product)}>
                                    <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-destructive" onClick={() => handleProductDelete(product)}>
                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {products.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                No products yet. Add your first product!
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="animate-fade-in">
            <Card className="border-border/50">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Manage Categories</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Categories for book filtering on the library page.
                </p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
                {/* Add Category */}
                <div className="flex gap-2 sm:gap-3">
                  <Input
                    placeholder="New category name..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                    className="text-sm"
                  />
                  <Button 
                    onClick={handleAddCategory} 
                    disabled={isAddingCategory || !newCategoryName.trim()}
                    size="sm"
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shrink-0"
                  >
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Add</span>
                  </Button>
                </div>

                {/* Categories List */}
                {categoriesLoading ? (
                  <p className="text-muted-foreground text-sm">Loading categories...</p>
                ) : categories.length === 0 ? (
                  <p className="text-muted-foreground py-8 text-center text-sm">
                    No categories yet. Add your first category above.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50 border border-border/50"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Tag className="h-3 w-3 sm:h-4 sm:w-4 text-secondary" />
                          <span className="text-sm">{category.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCategory(category)}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="animate-fade-in">
            <Card className="border-border/50">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                  Customer Orders
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  View and manage orders placed via WhatsApp
                </p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                {ordersLoading ? (
                  <p className="text-muted-foreground py-8 text-center text-sm">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <p className="text-muted-foreground py-8 text-center text-sm">
                    No orders yet. Orders will appear here when customers checkout.
                  </p>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-border/50 rounded-lg overflow-hidden"
                      >
                        {/* Order Header */}
                        <div
                          className="flex items-center justify-between p-3 sm:p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors gap-2"
                          onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-xs sm:text-sm truncate">
                              {order.customerInfo?.name || 'Anonymous'}
                            </p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                              {order.customerInfo?.phone || 'No phone'} • {order.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              variant={
                                order.status === 'completed' ? 'default' :
                                order.status === 'confirmed' ? 'secondary' :
                                order.status === 'cancelled' ? 'destructive' : 'outline'
                              }
                              className="capitalize text-[10px] sm:text-xs"
                            >
                              {order.status}
                            </Badge>
                            <span className="font-bold text-secondary text-xs sm:text-sm">Rs {order.total}</span>
                            {expandedOrderId === order.id ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Order Details */}
                        {expandedOrderId === order.id && (
                          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 border-t border-border/50 animate-fade-in">
                            {/* Customer Info */}
                            {order.customerInfo && Object.values(order.customerInfo).some(v => v) && (
                              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                                {order.customerInfo.type && (
                                  <div>
                                    <span className="text-muted-foreground">Type:</span>{' '}
                                    <span className="capitalize">{order.customerInfo.type === 'college' ? 'College Student' : 'Outsider'}</span>
                                  </div>
                                )}
                                {order.customerInfo.semester && (
                                  <div>
                                    <span className="text-muted-foreground">Semester:</span>{' '}
                                    {order.customerInfo.semester}
                                  </div>
                                )}
                                {order.customerInfo.department && (
                                  <div className="col-span-2">
                                    <span className="text-muted-foreground">Department:</span>{' '}
                                    {order.customerInfo.department}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Order Items - Books */}
                            {order.items && order.items.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">📚 Books:</p>
                                {order.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm">
                                    <div className="w-6 h-8 sm:w-8 sm:h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                                      {item.bookImageUrl ? (
                                        <img src={item.bookImageUrl} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px]">📖</div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate">{item.bookTitle}</p>
                                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                                        {item.purchaseType === 'buy' ? 'Buy' : `Rent (${item.rentDuration} days)`}
                                        {item.quantity > 1 && ` x${item.quantity}`}
                                      </p>
                                    </div>
                                    <span className="font-medium shrink-0">Rs {item.price * item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Order Items - Products */}
                            {order.productItems && order.productItems.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">📦 Products:</p>
                                {order.productItems.map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted rounded overflow-hidden flex-shrink-0">
                                      {item.productImageUrl ? (
                                        <img src={item.productImageUrl} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px]">📦</div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate">{item.productName}</p>
                                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                                        {item.quantity > 1 && `x${item.quantity}`}
                                      </p>
                                    </div>
                                    <span className="font-medium shrink-0">Rs {item.price * item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Status Update */}
                            <div className="pt-2 border-t border-border/30">
                              <span className="text-[10px] sm:text-xs text-muted-foreground block mb-2">Update status:</span>
                              <div className="flex flex-wrap gap-1">
                                {(['pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
                                  <Button
                                    key={status}
                                    size="sm"
                                    variant={order.status === status ? 'default' : 'outline'}
                                    className={`text-[10px] sm:text-xs h-6 sm:h-7 px-2 sm:px-3 capitalize ${order.status === status ? 'bg-secondary text-secondary-foreground' : ''}`}
                                    onClick={() => updateOrderStatus(order.id, status)}
                                  >
                                    {status}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Book Dialog */}
        <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm">Title</Label>
                  <Input
                    id="title"
                    value={bookFormData.title}
                    onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                    required
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author" className="text-sm">Author</Label>
                  <Input
                    id="author"
                    value={bookFormData.author}
                    onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                    required
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm">Category</Label>
                  <Select
                    value={bookFormData.category}
                    onValueChange={(val) => setBookFormData({ ...bookFormData, category: val })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition" className="text-sm">Condition</Label>
                  <Select
                    value={bookFormData.condition}
                    onValueChange={(val) => setBookFormData({ ...bookFormData, condition: val as BookCondition })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Used">Used</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm">Type</Label>
                  <Select
                    value={bookFormData.type}
                    onValueChange={(val) => setBookFormData({ ...bookFormData, type: val as BookType })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy Only</SelectItem>
                      <SelectItem value="rent">Rent Only</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buyPrice" className="text-sm">Buy Price (Rs)</Label>
                  <Input
                    id="buyPrice"
                    type="number"
                    value={bookFormData.buyPrice}
                    onChange={(e) => setBookFormData({ ...bookFormData, buyPrice: parseInt(e.target.value) || 0 })}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="image" className="text-sm">Book Cover</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleBookImageChange}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rent7" className="text-xs sm:text-sm">Rent 7d (Rs)</Label>
                  <Input
                    id="rent7"
                    type="number"
                    value={bookFormData.rentPrice7Days}
                    onChange={(e) => setBookFormData({ ...bookFormData, rentPrice7Days: parseInt(e.target.value) || 0 })}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rent14" className="text-xs sm:text-sm">Rent 14d (Rs)</Label>
                  <Input
                    id="rent14"
                    type="number"
                    value={bookFormData.rentPrice14Days}
                    onChange={(e) => setBookFormData({ ...bookFormData, rentPrice14Days: parseInt(e.target.value) || 0 })}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rent30" className="text-xs sm:text-sm">Rent 30d (Rs)</Label>
                  <Input
                    id="rent30"
                    type="number"
                    value={bookFormData.rentPrice30Days}
                    onChange={(e) => setBookFormData({ ...bookFormData, rentPrice30Days: parseInt(e.target.value) || 0 })}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="available"
                  checked={bookFormData.isAvailable}
                  onCheckedChange={(checked) => setBookFormData({ ...bookFormData, isAvailable: checked })}
                />
                <Label htmlFor="available" className="text-sm">Available in library</Label>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsBookDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" disabled={isBookSubmitting} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full sm:w-auto">
                  {isBookSubmitting ? 'Saving...' : editingBook ? 'Update Book' : 'Add Book'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Product Dialog */}
        <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productName" className="text-sm">Product Name</Label>
                  <Input
                    id="productName"
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    required
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productDescription" className="text-sm">Description</Label>
                  <Textarea
                    id="productDescription"
                    value={productFormData.description}
                    onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                    className="text-sm min-h-[80px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productCategory" className="text-sm">Category</Label>
                    <Select
                      value={productFormData.category}
                      onValueChange={(val) => setProductFormData({ ...productFormData, category: val })}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {productCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productPrice" className="text-sm">Price (Rs)</Label>
                    <Input
                      id="productPrice"
                      type="number"
                      value={productFormData.price}
                      onChange={(e) => setProductFormData({ ...productFormData, price: parseInt(e.target.value) || 0 })}
                      required
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productImage" className="text-sm">Product Image</Label>
                  <Input
                    id="productImage"
                    type="file"
                    accept="image/*"
                    onChange={handleProductImageChange}
                    className="text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="productAvailable"
                    checked={productFormData.isAvailable}
                    onCheckedChange={(checked) => setProductFormData({ ...productFormData, isAvailable: checked })}
                  />
                  <Label htmlFor="productAvailable" className="text-sm">Available in store</Label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsProductDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" disabled={isProductSubmitting} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full sm:w-auto">
                  {isProductSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
