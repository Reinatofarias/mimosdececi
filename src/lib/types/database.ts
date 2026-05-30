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
  original_price: number | null;
  images: string[];
  category_id: string | null;
  tags: string[];
  featured: boolean;
  active: boolean;
  sort_order: number;
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
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}
