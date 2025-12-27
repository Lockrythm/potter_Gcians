import { useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAllBooks } from '@/hooks/useBooks';
import { useCategories } from '@/hooks/useCategories';
import { Book, BookCondition, BookType, Category } from '@/types/book';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Lock, Eye, EyeOff, Tag, BookOpen } from 'lucide-react';

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

const initialFormData: BookFormData = {
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

export default function RestrictedSection() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState<BookFormData>(initialFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Category management
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const { books, loading, error } = useAllBooks();
  const { categories, loading: categoriesLoading } = useCategories();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({ title: 'Welcome to the Restricted Section', description: 'You now have full access.' });
    } else {
      toast({ title: 'Access Denied', description: 'Invalid password', variant: 'destructive' });
    }
  };

  const openAddDialog = () => {
    setEditingBook(null);
    setFormData(initialFormData);
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (book: Book) => {
    setEditingBook(book);
    setFormData({
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
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    const storageRef = ref(storage, `books/${Date.now()}_${imageFile.name}`);
    const snapshot = await uploadBytes(storageRef, imageFile);
    return getDownloadURL(snapshot.ref);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = editingBook?.imageUrl || '';
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      const bookData = {
        ...formData,
        imageUrl,
        createdAt: editingBook ? editingBook.createdAt : serverTimestamp(),
      };

      if (editingBook) {
        await updateDoc(doc(db, 'books', editingBook.id), bookData);
        toast({ title: 'Book Updated', description: `"${formData.title}" has been updated.` });
      } else {
        await addDoc(collection(db, 'books'), bookData);
        toast({ title: 'Book Added', description: `"${formData.title}" has been added to the library.` });
      }

      setIsDialogOpen(false);
      setFormData(initialFormData);
      setImageFile(null);
      setEditingBook(null);
    } catch (err) {
      console.error('Error saving book:', err);
      toast({ title: 'Error', description: 'Failed to save book. Check console for details.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (book: Book) => {
    if (!confirm(`Are you sure you want to delete "${book.title}"?`)) return;

    try {
      await deleteDoc(doc(db, 'books', book.id));
      toast({ title: 'Book Deleted', description: `"${book.title}" has been removed.` });
    } catch (err) {
      console.error('Error deleting book:', err);
      toast({ title: 'Error', description: 'Failed to delete book.', variant: 'destructive' });
    }
  };

  const toggleAvailability = async (book: Book) => {
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

  // Category CRUD
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
            <div className="text-4xl mb-2">🔒</div>
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">The Restricted Section</h1>
          <p className="text-muted-foreground">Manage your books and categories</p>
        </div>

        <Tabs defaultValue="books" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="books" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Books
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Categories
            </TabsTrigger>
          </TabsList>

          {/* Books Tab */}
          <TabsContent value="books">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">{books.length} books total</p>
              <Button onClick={openAddDialog} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Book
              </Button>
            </div>

            {error && (
              <div className="text-center py-12 text-destructive">{error}</div>
            )}

            {loading && (
              <div className="text-center py-12 text-muted-foreground">Loading books...</div>
            )}

            {!loading && !error && (
              <Card className="border-border/50">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Book</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Buy</TableHead>
                          <TableHead>Rent</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {books.map((book) => (
                          <TableRow key={book.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-14 bg-muted rounded overflow-hidden flex-shrink-0">
                                  {book.imageUrl ? (
                                    <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">📖</div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium line-clamp-1">{book.title}</p>
                                  <p className="text-xs text-muted-foreground">{book.author}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-secondary/30">
                                {book.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">{book.type}</Badge>
                            </TableCell>
                            <TableCell>Rs {book.buyPrice}</TableCell>
                            <TableCell className="text-xs">
                              7d: {book.rentPrice7Days}<br />
                              14d: {book.rentPrice14Days}<br />
                              30d: {book.rentPrice30Days}
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={book.isAvailable}
                                onCheckedChange={() => toggleAvailability(book)}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(book)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(book)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {books.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                              No books yet. Add your first book!
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Manage Categories</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Categories appear in the filter drawer on the library page.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Category */}
                <div className="flex gap-3">
                  <Input
                    placeholder="New category name..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <Button 
                    onClick={handleAddCategory} 
                    disabled={isAddingCategory || !newCategoryName.trim()}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                {/* Categories List */}
                {categoriesLoading ? (
                  <p className="text-muted-foreground">Loading categories...</p>
                ) : categories.length === 0 ? (
                  <p className="text-muted-foreground py-8 text-center">
                    No categories yet. Add your first category above.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50"
                      >
                        <div className="flex items-center gap-3">
                          <Tag className="h-4 w-4 text-secondary" />
                          <span>{category.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCategory(category)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Book Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="condition">Condition</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(val) => setFormData({ ...formData, condition: val as BookCondition })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Used">Used</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(val) => setFormData({ ...formData, type: val as BookType })}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="buyPrice">Buy Price (Rs)</Label>
                  <Input
                    id="buyPrice"
                    type="number"
                    value={formData.buyPrice}
                    onChange={(e) => setFormData({ ...formData, buyPrice: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="image">Book Cover</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rent7">Rent 7 Days (Rs)</Label>
                  <Input
                    id="rent7"
                    type="number"
                    value={formData.rentPrice7Days}
                    onChange={(e) => setFormData({ ...formData, rentPrice7Days: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rent14">Rent 14 Days (Rs)</Label>
                  <Input
                    id="rent14"
                    type="number"
                    value={formData.rentPrice14Days}
                    onChange={(e) => setFormData({ ...formData, rentPrice14Days: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rent30">Rent 30 Days (Rs)</Label>
                  <Input
                    id="rent30"
                    type="number"
                    value={formData.rentPrice30Days}
                    onChange={(e) => setFormData({ ...formData, rentPrice30Days: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="available"
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                />
                <Label htmlFor="available">Available in library</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  {isSubmitting ? 'Saving...' : editingBook ? 'Update Book' : 'Add Book'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
