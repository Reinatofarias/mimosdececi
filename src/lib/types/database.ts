export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  cost_price?: number;
  original_price: number | null;
  images: string[];
  category_id: string | null;
  tags: string[];
  stock_quantity?: number;
  availability?: 'available' | 'made_to_order' | 'sold_out' | 'hidden';
  product_status?: 'draft' | 'published' | 'archived';
  variations?: ProductVariation[];
  featured: boolean;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface OrderAddress {
  customer_zip_code?: string;
  customer_street?: string;
  customer_number?: string;
  customer_complement?: string;
  customer_neighborhood?: string;
  customer_city?: string;
  customer_state?: string;
}

export interface ProductVariation {
  name: string;
  price_delta?: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  public_url: string;
  alt_text: string;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  mime_type: string | null;
  sort_order: number;
  is_cover: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShowcaseSection {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  sort_order: number;
  visible: boolean;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
