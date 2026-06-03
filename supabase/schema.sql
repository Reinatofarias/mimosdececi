-- ═══════════════════════════════════════════
-- ESQUEMA DO BANCO DE DADOS - MIMOS DE CECI
-- ═══════════════════════════════════════════
-- Copie todo este conteúdo e cole no SQL Editor do Supabase para inicializar o banco.

-- 1. CATEGORIAS
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '🎁',
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. DATAS COMEMORATIVAS (Ocasiões)
CREATE TABLE occasions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  date_month_day TEXT,
  description TEXT DEFAULT '',
  banner_image TEXT DEFAULT '',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PRODUTOS
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  short_description TEXT DEFAULT '',
  price INTEGER NOT NULL,            -- Preço em centavos (ex: 5000 = R$ 50,00)
  cost_price INTEGER DEFAULT 0,      -- Custo de produção em centavos
  original_price INTEGER,
  images TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela associativa Produtos <-> Ocasiões
CREATE TABLE product_occasions (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  occasion_id UUID REFERENCES occasions(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, occasion_id)
);

-- 4. PEDIDOS
CREATE TYPE order_status AS ENUM (
  'new', 'confirmed', 'in_production', 'ready', 'delivered', 'cancelled'
);

CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  status order_status DEFAULT 'new',
  notes TEXT DEFAULT '',
  total_price INTEGER DEFAULT 0,
  total_cost INTEGER DEFAULT 0,
  payment_method TEXT DEFAULT 'pix',
  payment_status TEXT DEFAULT 'pending',
  coupon_code TEXT,
  discount_amount INTEGER DEFAULT 0,
  cancelled_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_price INTEGER NOT NULL,
  product_cost INTEGER DEFAULT 0,
  quantity INTEGER DEFAULT 1
);

-- 5. PROMOÇÕES
CREATE TABLE promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
  discount_value INTEGER NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  badge_text TEXT DEFAULT 'Promoção',
  banner_image TEXT,
  active BOOLEAN DEFAULT true,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  stackable BOOLEAN DEFAULT false,   -- NÃO acumula com cupons
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE promotion_products (
  promotion_id UUID REFERENCES promotions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (promotion_id, product_id)
);

CREATE TABLE promotion_categories (
  promotion_id UUID REFERENCES promotions(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (promotion_id, category_id)
);

-- 6. CUPONS (Ex: MIMO10, NATAL20)
CREATE TABLE coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
  discount_value INTEGER NOT NULL,
  min_order_value INTEGER,
  max_discount_value INTEGER,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  usage_type TEXT CHECK (usage_type IN ('single', 'multiple')) DEFAULT 'multiple',
  max_uses INTEGER NOT NULL DEFAULT 100,
  current_uses INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE coupon_products (
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (coupon_id, product_id)
);

CREATE TABLE coupon_categories (
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (coupon_id, category_id)
);

-- 7. VITRINE (SHOWCASE)
CREATE TABLE showcase_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT DEFAULT '',
  subtitle TEXT,
  sort_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. CONFIGURAÇÕES GERAIS
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO settings (key, value) VALUES
  ('whatsapp_number', '"5581992265790"'),
  ('store_name', '"Mimos de Ceci"'),
  ('store_tagline', '"Presentes Personalizados"'),
  ('global_banner', '{"text": "", "active": false, "backgroundColor": "#F4929E", "textColor": "#FFFFFF"}');

-- ═══════════════════════════════════════════
-- ÍNDICES DE PERFORMANCE
-- ═══════════════════════════════════════════
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_promotions_active_dates ON promotions(active, start_date, end_date);
CREATE INDEX idx_coupons_code ON coupons(code);

-- ═══════════════════════════════════════════
-- TRIGGERS DE UPDATED_AT
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_categories_updated BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_promotions_updated BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_coupons_updated BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ═══════════════════════════════════════════
-- Por padrão, dados inativos não são lidos por usuários públicos (anon)

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Proteção Máxima para Financeiro e Cupons (Sem política de leitura pública)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_occasions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Products viewable" ON products FOR SELECT USING (active = true);
CREATE POLICY "Public Categories viewable" ON categories FOR SELECT USING (active = true);
CREATE POLICY "Public Promotions viewable" ON promotions FOR SELECT USING (active = true AND now() BETWEEN start_date AND end_date);
CREATE POLICY "Public Occasions viewable" ON occasions FOR SELECT USING (active = true);
CREATE POLICY "Public Showcase viewable" ON showcase_sections FOR SELECT USING (visible = true);
CREATE POLICY "Public Settings viewable" ON settings FOR SELECT USING (true);

-- Os buckets de imagens devem ser criados manualmente no painel Storage do Supabase:
-- 1. 'product-images' (Público)
-- 2. 'banners' (Público)
-- 3. 'logos' (Público)
