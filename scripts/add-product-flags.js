import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  // Test: try to read a product to see if columns already exist
  const { data, error } = await supabase
    .from('products')
    .select('id, best_seller, on_promotion')
    .limit(1);

  if (error && error.message.includes('best_seller')) {
    console.log('Columns do not exist yet. Please run this SQL in your Supabase SQL Editor:');
    console.log(`
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS best_seller boolean DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS on_promotion boolean DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON public.products(best_seller);
CREATE INDEX IF NOT EXISTS idx_products_on_promotion ON public.products(on_promotion);
    `);
    console.log('After running the SQL, the app will work correctly.');
  } else if (data) {
    console.log('Columns best_seller and on_promotion already exist! Migration not needed.');
  } else {
    console.log('Unexpected error:', error?.message);
    console.log('Please run the SQL manually in the Supabase SQL Editor.');
  }
}

migrate();
