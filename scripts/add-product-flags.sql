-- Add best_seller and on_promotion flags to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS best_seller boolean DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS on_promotion boolean DEFAULT false;

-- Add indexes for the new flags
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON public.products(best_seller);
CREATE INDEX IF NOT EXISTS idx_products_on_promotion ON public.products(on_promotion);
