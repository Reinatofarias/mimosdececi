ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'admin';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_zip_code TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_street TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_number TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_complement TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_neighborhood TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_city TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_state TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stock_decremented_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_order_code ON orders(order_code);
CREATE INDEX IF NOT EXISTS idx_orders_source ON orders(source);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

UPDATE orders
SET order_code = 'MDC-' || upper(substr(replace(id::text, '-', ''), 1, 8))
WHERE order_code IS NULL;

ALTER TABLE product_images ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_status_availability ON products(product_status, availability);
