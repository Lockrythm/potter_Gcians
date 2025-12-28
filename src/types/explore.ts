export type ExplorePostType = 'book' | 'product' | 'service';
export type ExplorePostStatus = 'pending' | 'approved' | 'rejected';

export interface ExplorePost {
  id: string;
  type: ExplorePostType;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  authorName: string;
  authorContact: string;
  status: ExplorePostStatus;
  createdAt: any;
  updatedAt?: any;
  adminNotes?: string;
}

export const explorePostTypes: ExplorePostType[] = ['book', 'product', 'service'];
