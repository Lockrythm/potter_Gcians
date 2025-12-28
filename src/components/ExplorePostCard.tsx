import { ExplorePost } from '@/types/explore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { BookOpen, Package, Briefcase, User, Phone } from 'lucide-react';

interface ExplorePostCardProps {
  post: ExplorePost;
  index?: number;
}

const typeIcons = {
  book: BookOpen,
  product: Package,
  service: Briefcase,
};

const typeColors = {
  book: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  product: 'bg-green-500/10 text-green-600 dark:text-green-400',
  service: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
};

export function ExplorePostCard({ post, index = 0 }: ExplorePostCardProps) {
  const Icon = typeIcons[post.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 group">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          <Badge className={`absolute top-2 left-2 ${typeColors[post.type]} border-0`}>
            <Icon className="h-3 w-3 mr-1" />
            {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
          </Badge>
        </div>

        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {post.description}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              Rs {post.price.toLocaleString()}
            </span>
          </div>

          <div className="pt-2 border-t border-border/50 space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{post.authorName}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{post.authorContact}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
