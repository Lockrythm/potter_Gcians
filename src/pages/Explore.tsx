import { useState } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useExplorePosts } from '@/hooks/useExplorePosts';
import { ExplorePost, ExplorePostType, explorePostTypes } from '@/types/explore';
import { ExplorePostCard } from '@/components/ExplorePostCard';
import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Plus, Loader2, Compass, BookOpen, Package, Briefcase, Sparkles } from 'lucide-react';

const WHATSAPP_NUMBER = '923126203644';

export default function Explore() {
  const { posts, loading, error } = useExplorePosts('approved');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [activeFilter, setActiveFilter] = useState<ExplorePostType | 'all'>('all');
  
  const [formData, setFormData] = useState({
    type: 'product' as ExplorePostType,
    title: '',
    description: '',
    price: 0,
    authorName: '',
    authorContact: '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const generatePostWhatsAppMessage = (data: typeof formData): string => {
    const typeEmoji = data.type === 'book' ? '📚' : data.type === 'product' ? '📦' : '💼';
    return `🆕 New Explore Post Submitted!

${typeEmoji} Type: ${data.type.toUpperCase()}
📝 Title: ${data.title}
💬 Description: ${data.description || 'No description'}
💰 Price: Rs ${data.price}

👤 Submitted by: ${data.authorName}
📞 Contact: ${data.authorContact}

⏳ Status: Pending Approval
🕐 Submitted at: ${new Date().toLocaleString()}

Please review this post in the admin panel.`;
  };

  const buildWhatsAppNotificationUrl = (data: typeof formData) => {
    const message = generatePostWhatsAppMessage(data);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
  };

  const openWhatsAppNotification = (url: string, win?: Window | null) => {
    if (win && !win.closed) {
      win.location.href = url;
      return;
    }
    window.open(url, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({ title: 'Missing title', description: 'Please enter a title for your post.', variant: 'destructive' });
      return;
    }
    if (!formData.authorName.trim()) {
      toast({ title: 'Missing name', description: 'Please enter your name.', variant: 'destructive' });
      return;
    }
    if (!formData.authorContact.trim()) {
      toast({ title: 'Missing contact', description: 'Please enter your contact information.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    // Open WhatsApp window synchronously (avoids popup blockers)
    const waUrl = buildWhatsAppNotificationUrl(formData);
    const waWindow = window.open('', '_blank');

    try {
      let imageUrl = '';
      if (imageFile) {
        const storageRef = ref(storage, `explore/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const postData = {
        type: formData.type,
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: formData.price || 0,
        authorName: formData.authorName.trim(),
        authorContact: formData.authorContact.trim(),
        imageUrl,
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'explore_posts'), postData);

      // Send WhatsApp notification
      openWhatsAppNotification(waUrl, waWindow);

      toast({
        title: 'Post Submitted!',
        description: 'Your post is pending admin approval. We\'ll notify you once it\'s live.',
      });

      setFormData({
        type: 'product',
        title: '',
        description: '',
        price: 0,
        authorName: '',
        authorContact: '',
      });
      setImageFile(null);
      setIsDialogOpen(false);
    } catch (err) {
      waWindow?.close();
      console.error('Error submitting post:', err);
      toast({ title: 'Error', description: 'Failed to submit post. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPosts = activeFilter === 'all' 
    ? posts 
    : posts.filter(post => post.type === activeFilter);

  const filterTabs = [
    { value: 'all', label: 'All', icon: Compass },
    { value: 'book', label: 'Books', icon: BookOpen },
    { value: 'product', label: 'Products', icon: Package },
    { value: 'service', label: 'Services', icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <CartDrawer />
      <BottomNav />

      {/* Hero Section */}
      <section className="relative pt-20 pb-8 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wider">Community Marketplace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Explore & Share
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover books, products, and services shared by our community. 
              Have something to offer? Submit your post for approval!
            </p>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Post</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: ExplorePostType) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {explorePostTypes.map((type) => (
                          <SelectItem key={type} value={type} className="capitalize">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="What are you offering?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your item or service..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Price (Rs)</Label>
                    <Input
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Image</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Your Name *</Label>
                      <Input
                        value={formData.authorName}
                        onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact *</Label>
                      <Input
                        value={formData.authorContact}
                        onChange={(e) => setFormData({ ...formData, authorContact: e.target.value })}
                        placeholder="Phone/Email"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit for Approval'
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Posts are reviewed before going live
                    </p>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="sticky top-16 z-30 bg-background/95 backdrop-blur-lg border-b border-border/50 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as ExplorePostType | 'all')}>
            <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:inline-flex">
              {filterTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-1.5 text-xs sm:text-sm"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="text-center py-20 text-destructive">{error}</div>
          )}

          {!loading && !error && filteredPosts.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <Compass className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold text-lg mb-2">No posts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to share something with the community!
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </CardContent>
            </Card>
          )}

          {!loading && !error && filteredPosts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredPosts.map((post, index) => (
                <ExplorePostCard key={post.id} post={post} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
