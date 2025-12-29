import { ExplorePost, ExploreCategory } from '@/types/explore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { BookOpen, MessageSquare, HelpCircle, Bell, MessagesSquare, User } from 'lucide-react';

interface ExplorePostCardProps {
  post: ExplorePost;
  index?: number;
}

const categoryConfig: Record<ExploreCategory, { icon: typeof BookOpen; color: string; label: string }> = {
  books: { icon: BookOpen, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', label: 'Books' },
  confessions: { icon: MessageSquare, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', label: 'Confessions' },
  help: { icon: HelpCircle, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400', label: 'Help' },
  notices: { icon: Bell, color: 'bg-green-500/10 text-green-600 dark:text-green-400', label: 'Notices' },
  general: { icon: MessagesSquare, color: 'bg-muted text-muted-foreground', label: 'General' },
};

function formatRelativeTime(timestamp: any): string {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

export function ExplorePostCard({ post, index = 0 }: ExplorePostCardProps) {
  const config = categoryConfig[post.category] || categoryConfig.general;
  const Icon = config.icon;
  const displayName = post.isAnonymous ? 'Anonymous' : post.authorName;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 group h-full">
        <CardContent className="p-4 space-y-3 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <Badge className={`${config.color} border-0 shrink-0`}>
              <Icon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>

          {/* Content */}
          <p className="text-sm text-foreground leading-relaxed flex-1">
            {post.content}
          </p>

          {/* Footer */}
          <div className="pt-2 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{displayName}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
