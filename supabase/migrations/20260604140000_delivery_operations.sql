ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_fee INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_window TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS delivery_notes TEXT DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_orders_delivery_window ON orders(delivery_window);
