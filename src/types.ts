export interface Product {
  id: number | string;
  name: string;
  category: string;
  subCategory?: string;
  price: number;
  originalPrice?: number;
  original_price?: number;
  description: string;
  image?: string;
  image_url?: string;
  galleryImages?: string[];
  isNew?: boolean;
  isTrending?: boolean;
  isBestseller?: boolean;
  features?: string[];
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | string;
  sizes?: string[];
  colors?: string[];
  rating: number;
  reviewsCount?: number;
  reviews_count?: number;
  stock?: number;
  badge?: string;
  tag?: string;
  is_featured?: boolean;
  is_active?: boolean;
}

export interface Category {
  id: string;
  name: string;
  itemCount: number;
  image: string;
  slug: string;
  subcategories: string[];
}

export interface CustomerReview {
  id: string;
  author: string;
  district: string;
  rating: number;
  date: string;
  comment: string;
  productName: string;
  verifiedPurchase: boolean;
}

export interface UserProfile {
  id: string;
  name?: string;
  phone?: string;
  created_at?: string;
}

export interface AuthErrorState {
  message: string;
  type?: 'invalid_code' | 'expired' | 'rate_limit' | 'network' | 'user_not_found' | 'general';
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  role?: 'customer' | 'admin';
  created_at?: string;
}

export interface SiteContentMap {
  top_banner?: {
    text: string;
  };
  hero_banner?: {
    title: string;
    subtitle: string;
    button_text: string;
    badge_text: string;
  };
  announcement_bar?: {
    text: string;
  };
  cod_trust_banner?: {
    title: string;
    subtitle: string;
  };
  footer?: {
    heading: string;
    description: string;
    contact_phone: string;
    contact_email: string;
  };
  [key: string]: any;
}

export interface FinancialMetrics {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  statusBreakdown: {
    processing: number;
    outForDelivery: number;
    delivered: number;
    cancelled: number;
  };
  dailyRevenue: { date: string; revenue: number; ordersCount: number }[];
}

export interface AdminUserItem {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'admin';
  created_at?: string;
  order_count?: number;
  total_spent?: number;
}

export interface OrderItem {
  id?: number;
  product_id: number | string;
  product_name: string;
  quantity: number;
  price: number;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  guest_email?: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  payment_method: string;
  subtotal: number;
  delivery_fee: number;
  total_price: number;
  status: 'Processing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  created_at: string;
  items?: OrderItem[];
}

export interface FilterState {
  category: string;
  searchQuery: string;
  sortBy: 'featured' | 'price_asc' | 'price_desc' | 'rating';
  maxPrice: number;
}

export type AuthMode = 'signup' | 'login';
export type AuthStep = 'email' | 'otp' | 'password' | 'success';

export interface AuthModalState {
  isOpen: boolean;
  mode: AuthMode;
  step: AuthStep;
  email: string;
  devOtp?: string;
}
