ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS production_assignee TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS production_due_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS production_checklist JSONB DEFAULT '[
    {"key":"inputs","label":"Separar insumos","done":false},
    {"key":"assembly","label":"Montar pedido","done":false},
    {"key":"personalization","label":"Revisar personalizacao","done":false},
    {"key":"packaging","label":"Embalar","done":false},
    {"key":"final_review","label":"Conferencia final","done":false}
  ]',
  ADD COLUMN IF NOT EXISTS production_notes TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS production_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS production_completed_at TIMESTAMPTZ;

UPDATE orders
SET production_checklist = '[
  {"key":"inputs","label":"Separar insumos","done":false},
  {"key":"assembly","label":"Montar pedido","done":false},
  {"key":"personalization","label":"Revisar personalizacao","done":false},
  {"key":"packaging","label":"Embalar","done":false},
  {"key":"final_review","label":"Conferencia final","done":false}
]'
WHERE production_checklist IS NULL OR production_checklist = '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_orders_production_due_date ON orders(production_due_date);
CREATE INDEX IF NOT EXISTS idx_orders_production_assignee ON orders(production_assignee);
