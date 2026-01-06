'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ChevronLeft, Trash2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  slug: string;
  images?: string[];
  description?: string;
}

export default function WishlistPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/account/favorites');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('wishlist');
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading wishlist:', error);
      }
    }
  }, []);

  const removeFromWishlist = (productId: string) => {
    const updated = wishlist.filter((item) => item.id !== productId);
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    toast.success('Produto removido dos favoritos');
  };

  const clearWishlist = () => {
    setWishlist([]);
    localStorage.setItem('wishlist', JSON.stringify([]));
    toast.success('Favoritos limpos');
  };

  if (!mounted) {
    return null;
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#F7FAF7] py-12">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-6 py-12">
            <Heart className="h-20 w-20 text-gray-300" />
            <h1 className="font-serif text-3xl font-bold text-[#374151]">
              Sua lista de favoritos está vazia
            </h1>
            <p className="text-gray-600 text-center max-w-md">
              Adicione seus produtos favoritos para acompanhar e comprar mais tarde.
            </p>
            <Link
              href="/category/todos"
              className="mt-4 inline-flex min-w-[200px] cursor-pointer items-center justify-center rounded-full bg-[#2F7A3E] px-8 py-3 text-base font-bold text-white shadow-lg transition-all hover:bg-[#266332] hover:shadow-xl"
            >
              <span>Explorar Produtos</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalValue = wishlist.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-[#F7FAF7] py-8 sm:py-12">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Link
            href="/category/todos"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-[#374151]" />
          </Link>
          <h1 className="font-serif text-3xl font-bold text-[#374151]">Meus Favoritos</h1>
          <span className="ml-auto text-sm font-medium text-gray-600">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'itens'}
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Items Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {item.images && item.images[0] ? (
                      <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <ShoppingBag className="h-12 w-12 text-gray-300" />
                      </div>
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </button>

                    {/* Heart Icon */}
                    <div className="absolute top-2 left-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md">
                      <Heart className="h-5 w-5 text-[#2F7A3E] fill-[#2F7A3E]" />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 p-4 flex flex-col gap-3">
                    <Link
                      href={`/product/${item.slug || item.id}`}
                      className="font-medium text-[#374151] hover:text-[#2F7A3E] transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>

                    {item.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                    )}

                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-lg font-bold text-[#2F7A3E]">
                        R$ {item.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link
                        href={`/product/${item.slug || item.id}`}
                        className="flex-1 rounded-full bg-[#2F7A3E] px-4 py-2 text-center text-sm font-bold text-white hover:bg-[#266332] transition-colors"
                      >
                        Ver
                      </Link>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="flex items-center justify-center rounded-full border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="mt-8">
              <Link
                href="/category/todos"
                className="inline-flex items-center gap-2 text-[#2F7A3E] font-medium hover:text-[#266332] transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Continuar Comprando
              </Link>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 h-fit sticky top-20">
            <h2 className="font-serif text-xl font-bold text-[#374151] mb-6">Resumo</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total de Itens</span>
                <span className="font-medium text-[#374151]">{wishlist.length}</span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="font-bold text-[#374151]">Valor Total</span>
                  <span className="font-serif text-2xl font-bold text-[#2F7A3E]">
                    R$ {totalValue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  // Here you would add all items to cart and redirect
                  toast.success('Todos os itens foram adicionados ao carrinho!');
                }}
                className="w-full bg-[#2F7A3E] hover:bg-[#266332] text-white py-3 rounded-full font-bold transition-all hover:shadow-lg"
              >
                Comprar Todos
              </button>

              <button
                onClick={clearWishlist}
                className="w-full py-2 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Limpar Favoritos
              </button>
            </div>

            {/* Info */}
            <div className="mt-6 text-xs text-gray-500 space-y-2 border-t pt-4">
              <p>✓ Comparação de preços facilitada</p>
              <p>✓ Acompanhamento de promoções</p>
              <p>✓ Listas salvas para compras futuras</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
