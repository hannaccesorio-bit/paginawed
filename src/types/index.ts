export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  short_description: string;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  sku: string;
  barcode: string | null;
  track_inventory: boolean;
  inventory_quantity: number;
  allow_backorder: boolean;
  weight: number | null;
  dimensions: ProductDimensions | null;
  images: ProductImage[];
  category_id: string;
  category?: Category;
  department_id: string | null;
  department?: Department;
  brand_id: string | null;
  brand?: Brand;
  tags: string[];
  featured: boolean;
  status: 'draft' | 'active' | 'archived';
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  position: number;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  department_id: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  button_text: string;
  bg_color: string;
  text_color: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  is_featured: boolean;
  created_at: string;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
  variant_id: string | null;
  variant?: ProductVariant;
  added_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  price: number;
  compare_at_price: number | null;
  inventory_quantity: number;
  image_url: string | null;
  options: Record<string, string>;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  newsletter_subscribed: boolean;
  loyalty_points: number;
  referral_code: string;
  referred_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  type: 'shipping' | 'billing';
  first_name: string;
  last_name: string;
  company: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  financial_status: 'pending' | 'paid' | 'partially_refunded' | 'refunded';
  fulfillment_status: 'unfulfilled' | 'partial' | 'fulfilled';
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  items: OrderItem[];
  shipping_address: Address;
  billing_address: Address;
  notes: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  sku: string;
  quantity: number;
  price: number;
  total: number;
  product_image: string | null;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user?: User;
  rating: number;
  title: string | null;
  content: string;
  images: string[];
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  minimum_amount: number | null;
  maximum_uses: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  applies_to: 'all' | 'categories' | 'products' | 'collections';
  applicable_ids: string[];
  created_at: string;
}

export interface FlashSale {
  id: string;
  name: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  products: FlashSaleProduct[];
  created_at: string;
}

export interface FlashSaleProduct {
  product_id: string;
  flash_sale_price: number;
  quantity_limit: number | null;
  sold_quantity: number;
}

export interface SearchFilters {
  query?: string;
  category_ids?: string[];
  brand_ids?: string[];
  price_min?: number;
  price_max?: number;
  tags?: string[];
  in_stock?: boolean;
  on_sale?: boolean;
  featured?: boolean;
  sort_by?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'best_selling' | 'top_rated';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}