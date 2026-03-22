-- Paste this entirely into the Supabase SQL Editor and click "Run"

-- 1. Create the `products` table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  packSize TEXT NOT NULL,
  categoryId TEXT NOT NULL,
  image TEXT,
  isAvailable BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS) and allow public read access
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to products" 
ON products FOR SELECT 
TO public 
USING (true);

-- 3. Insert the starting mock vegetables
INSERT INTO products (id, name, price, packSize, categoryId, isAvailable, image)
VALUES 
  ('p1', 'Fresh Spinach (Palak)', 40, '1 Bunch (approx 250g)', 'leafy', true, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=400&auto=format&fit=crop'),
  ('p2', 'Red Tomatoes', 60, '1 kg', 'essentials', true, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=400&auto=format&fit=crop'),
  ('p3', 'Potatoes', 40, '1 kg', 'roots', true, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=400&auto=format&fit=crop'),
  ('p4', 'Onions', 50, '1 kg', 'essentials', true, 'https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?q=80&w=400&auto=format&fit=crop'),
  ('p5', 'Fresh Coriander', 20, '1 Bunch', 'leafy', true, 'https://images.unsplash.com/photo-1596483501980-60b77b102b4d?q=80&w=400&auto=format&fit=crop'),
  ('p6', 'Bananas (Robusta)', 70, '1 Dozen', 'fruits', true, 'https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?q=80&w=400&auto=format&fit=crop'),
  ('p7', 'Carrots', 60, '500g', 'roots', true, 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=400&auto=format&fit=crop'),
  ('p8', 'Apples (Fuji)', 180, '4 pcs (~700g)', 'fruits', false, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?q=80&w=400&auto=format&fit=crop')
ON CONFLICT (id) DO NOTHING;
