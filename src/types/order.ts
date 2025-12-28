import { CartItem } from './book';
import { ProductCartItem } from './product';

export interface CustomerInfo {
  type?: 'college' | 'outsider';
  semester?: string;
  department?: string;
  name?: string;
  phone?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  productItems?: ProductCartItem[] | any[];
  customerInfo: CustomerInfo;
  total: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
  orderDate?: string;
  orderDateFormatted?: string;
}
