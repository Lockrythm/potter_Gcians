export type ExploreCategory = 'books' | 'confessions' | 'help' | 'notices' | 'general';
export type ExplorePostStatus = 'pending' | 'approved' | 'rejected';

export interface ExplorePost {
  id: string;
  category: ExploreCategory;
  content: string; // max 400 chars
  authorName: string;
  isAnonymous: boolean;
  status: ExplorePostStatus;
  createdAt: any;
  updatedAt?: any;
  adminNotes?: string;
}

export const exploreCategories: ExploreCategory[] = ['books', 'confessions', 'help', 'notices', 'general'];
