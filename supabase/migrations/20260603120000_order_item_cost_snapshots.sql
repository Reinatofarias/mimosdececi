ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS product_cost INTEGER DEFAULT 0;

UPDATE order_items
SET product_cost = COALESCE(products.cost_price, 0)
FROM products
WHERE order_items.product_id = products.id
  AND COALESCE(order_items.product_cost, 0) = 0;

UPDATE orders
SET total_cost = COALESCE(item_costs.total_cost, 0)
FROM (
  SELECT order_id, SUM(COALESCE(product_cost, 0) * quantity) AS total_cost
  FROM order_items
  GROUP BY order_id
) AS item_costs
WHERE orders.id = item_costs.order_id
  AND COALESCE(orders.total_cost, 0) = 0;
