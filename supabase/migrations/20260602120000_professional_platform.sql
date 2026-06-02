-- Professional platform evolution for Mimos de Ceci.
-- Run this migration in Supabase before relying on the new admin fields in production.

CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  alt_text TEXT DEFAULT '',
  width INTEGER,
  height INTEGER,
  size_bytes INTEGER,
  mime_type TEXT,
  sort_order INTEGER DEFAULT 0,
  is_cover BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_order ON product_images(product_id, sort_order);
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_one_cover ON product_images(product_id) WHERE is_cover = true;

ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'available';
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_status TEXT DEFAULT 'published';
ALTER TABLE products ADD COLUMN IF NOT EXISTS variations JSONB DEFAULT '[]';

ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS reminder_notes TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]';

ALTER TABLE coupons ADD COLUMN IF NOT EXISTS min_order_value INTEGER DEFAULT 0;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS max_discount_value INTEGER;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS max_uses INTEGER DEFAULT 100;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS current_uses INTEGER DEFAULT 0;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ DEFAULT now();
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS usage_type TEXT DEFAULT 'multiple';
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS applies_to JSONB DEFAULT '{"product_ids":[],"category_ids":[]}';
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Product Images viewable" ON product_images;
CREATE POLICY "Public Product Images viewable" ON product_images FOR SELECT USING (true);

-- Service role continues to manage admin-only tables through server-side actions.
