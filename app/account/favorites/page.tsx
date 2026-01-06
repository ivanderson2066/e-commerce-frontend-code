'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useFavorites } from '@/lib/favorites-context';
import { supabase } from '@/lib/supabase-client';
import { ProductCard } from '@/components/ui/product-card';
import { Heart, ShoppingBag, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  slug?: string;
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavoriteProducts() {
      if (favoritesLoading) return;

      try {
        setLoading(true);

        if (!user?.id) {
          setProducts([]);
          setLoading(false);
          return;
        }

        if (favorites.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // Buscar produtos pelos IDs dos favoritos salvos no banco
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .in('id', favorites);

        if (error) {
          console.error('Error loading favorite products:', error);
          setProducts([]);
          return;
        }

        setProducts(data || []);
      } catch (error) {
        console.error('Error:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadFavoriteProducts();
  }, [favorites, favoritesLoading, user?.id]);

  if (loading || favoritesLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-[#2F7A3E] mb-4" />
        <p className="text-gray-600">Carregando seus favoritos...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-24 w-24 bg-gradient-to-br from-[#2F7A3E]/10 to-[#A7E3B0]/10 rounded-full flex items-center justify-center mb-6">
          <Heart className="h-12 w-12 text-[#2F7A3E]" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#374151] mb-2">
          Seus Favoritos
        </h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Você ainda não adicionou nenhum produto aos seus favoritos. Explore nossa coleção e salve seus produtos favoritos!
        </p>
        <Link
          href="/category/todos"
          className="inline-flex items-center justify-center rounded-full bg-[#2F7A3E] px-8 py-3 text-base font-bold text-white hover:bg-[#266332] transition-all hover:shadow-lg gap-2"
        >
          <ShoppingBag className="h-5 w-5" />
          Explorar Produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#374151]">Seus Favoritos</h1>
        <p className="text-gray-600 mt-1">
          {products.length} {products.length === 1 ? 'produto' : 'produtos'} adicionado(s)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
