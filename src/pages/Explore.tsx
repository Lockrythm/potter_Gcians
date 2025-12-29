import { useState } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useExplorePosts } from '@/hooks/useExplorePosts';
import { ExploreCategory, exploreCategories } from '@/types/explore';
import { ExplorePostCard } from '@/components/ExplorePostCard';
import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { BottomNav } from '@/components/BottomNav';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { friendlyFirestoreError } from '@/lib/firebase-errors';
import { Plus, Loader2, Compass, BookOpen, MessageSquare, HelpCircle, Bell, MessagesSquare, Sparkles, ImageOff } from 'lucide-react';

const MAX_CONTENT_LENGTH = 400;

const categoryConfig: Record<ExploreCategory, { icon: typeof BookOpen; label: string }> = {
  books: { icon: BookOpen, label: 'Books' },
  confessions: { icon: MessageSquare, label: 'Confessions' },
  help: { icon: HelpCircle, label: 'Help' },
  notices: { icon: Bell, label: 'Notices' },
  general: { icon: MessagesSquare, label: 'General' },
};

export default function Explore() {
  const { posts, loading, error } = useExplorePosts('approved');
  const { addExploreItem } = useCart();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ExploreCategory | 'all'>('all');

  const [formData, setFormData] = useState({
    category: 'general' as ExploreCategory,
    content: '',
    authorName: '',
    isAnonymous: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!formData.content.trim()) {
      toast({ title: 'Missing content', description: 'Please write something to post.', variant: 'destructive' });
      return;
    }
    if (formData.content.length > MAX_CONTENT_LENGTH) {
      toast({ title: 'Content too long', description: `Maximum ${MAX_CONTENT_LENGTH} characters allowed.`, variant: 'destructive' });
      return;
    }
    if (!formData.isAnonymous && !formData.authorName.trim()) {
      toast({ title: 'Missing name', description: 'Please enter your name or post anonymously.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      const authorName = formData.isAnonymous ? 'Anonymous' : formData.authorName.trim();

      // TASK 1: Save to Firestore (background, for admin approval)
      const postData = {
        category: formData.category,
        content: formData.content.trim(),
        authorName,
        isAnonymous: formData.isAnonymous,
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'explore_posts'), postData);

      // TASK 2: Add to Owl Trunk (cart) immediately
      addExploreItem({
        category: formData.category,
        content: formData.content.trim(),
        authorName,
        status: 'pending',
      });

      toast({
        title: 'Post submitted successfully',
        description: 'Pending admin approval.',
      });

      // Clear form and close dialog
      setFormData({
        category: 'general',
        content: '',
        authorName: '',
        isAnonymous: false,
      });
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error submitting post:', err);
      toast({
        title: 'Submission Error',
        description: friendlyFirestoreError(err, 'Failed to submit post. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPosts = activeFilter === 'all' ? posts : posts.filter((post) => post.category === activeFilter);

  const filterTabs = [
    { value: 'all', label: 'All', icon: Compass },
    ...exploreCategories.map((cat) => ({
      value: cat,
      label: categoryConfig[cat].label,
      icon: categoryConfig[cat].icon,
    })),
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <CartDrawer />
      <BottomNav />

      {/* Hero Section */}
      <section className="relative pt-20 pb-8 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wider">Community Board</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Explore &amp; Share</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Share thoughts, ask for help, post confessions, or spread the word. All posts are reviewed before going live.
            </p>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
                <DialogHeader>
                  <DialogTitle>Create New Post</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  {/* Category */}
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={formData.category} onValueChange={(value: ExploreCategory) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {exploreCategories.map((cat) => {
                          const config = categoryConfig[cat];
                          const Icon = config.icon;
                          return (
                            <SelectItem key={cat} value={cat}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {config.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>What's on your mind? *</Label>
                      <span className={`text-xs ${formData.content.length > MAX_CONTENT_LENGTH ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {formData.content.length}/{MAX_CONTENT_LENGTH}
                      </span>
                    </div>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Share your thoughts, ask a question, or make a confession..."
                      rows={5}
                      maxLength={MAX_CONTENT_LENGTH + 50}
                    />
                  </div>

                  {/* Anonymous Toggle */}
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="anonymous" className="text-sm font-medium">
                        Post Anonymously
                      </Label>
                      <p className="text-xs text-muted-foreground">Your name won't be shown</p>
                    </div>
                    <Switch
                      id="anonymous"
                      checked={formData.isAnonymous}
                      onCheckedChange={(checked) => setFormData({ ...formData, isAnonymous: checked })}
                    />
                  </div>

                  {/* Author Name (if not anonymous) */}
                  {!formData.isAnonymous && (
                    <div className="space-y-2">
                      <Label>Your Name *</Label>
                      <Input value={formData.authorName} onChange={(e) => setFormData({ ...formData, authorName: e.target.value })} placeholder="Enter your name" />
                    </div>
                  )}

                  {/* Image Coming Soon Notice */}
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-dashed border-border">
                    <ImageOff className="h-5 w-5 text-muted-foreground shrink-0" />
                    <p className="text-xs text-muted-foreground">📸 Image posts are coming soon!</p>
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
                    <p className="text-xs text-muted-foreground text-center mt-2">Posts are reviewed before going live</p>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="sticky top-16 z-30 bg-background/95 backdrop-blur-lg border-b border-border/50 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as ExploreCategory | 'all')}>
            <TabsList className="w-full sm:w-auto grid grid-cols-6 sm:inline-flex overflow-x-auto">
              {filterTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3">
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
        <div className="max-w-4xl mx-auto">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && <div className="text-center py-20 text-destructive">{error}</div>}

          {!loading && !error && filteredPosts.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <Compass className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold text-lg mb-2">No posts yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to share something with the community!</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </CardContent>
            </Card>
          )}

          {!loading && !error && filteredPosts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
