'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Trash2, Plus, Minus, Heart, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      toast.success('Produto removido do carrinho');
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = '/checkout';
    }, 500);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#F7FAF7] py-12">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-6 py-12">
            <ShoppingBag className="h-20 w-20 text-gray-300" />
            <h1 className="font-serif text-3xl font-bold text-[#374151]">
              Seu carrinho está vazio
            </h1>
            <p className="text-gray-600 text-center max-w-md">
              Explore nossos produtos naturais e adicione seus favoritos ao carrinho.
            </p>
            <Link
              href="/category/todos"
              className="mt-4 inline-flex min-w-[200px] cursor-pointer items-center justify-center rounded-full bg-[#2F7A3E] px-8 py-3 text-base font-bold text-white shadow-lg transition-all hover:bg-[#266332] hover:shadow-xl"
            >
              <span>Continuar Comprando</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = totalPrice;
  const shippingEstimate = subtotal > 100 ? 0 : Math.round(subtotal * 0.1);
  const discount = subtotal > 200 ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal + shippingEstimate - discount;

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
          <h1 className="font-serif text-3xl font-bold text-[#374151]">Seu Carrinho</h1>
          <span className="ml-auto text-sm font-medium text-gray-600">
            {items.length} {items.length === 1 ? 'item' : 'itens'}
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Items List */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-32 sm:w-32">
                    {item.images && item.images[0] ? (
                      <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <Link
                          href={`/product/${item.slug || item.id}`}
                          className="font-medium text-[#374151] hover:text-[#2F7A3E] transition-colors"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-[#2F7A3E]">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="h-4 w-4 text-gray-600" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(item.id, parseInt(e.target.value) || 1)
                          }
                          className="w-12 rounded border border-gray-200 text-center py-1 text-sm font-medium"
                          min="1"
                        />
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          removeItem(item.id);
                          toast.success('Produto removido');
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded hover:bg-red-50 transition-colors group"
                      >
                        <Trash2 className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping Button */}
            <div className="mt-6">
              <Link
                href="/category/todos"
                className="inline-flex items-center gap-2 text-[#2F7A3E] font-medium hover:text-[#266332] transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Continuar Comprando
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 h-fit sticky top-20">
            <h2 className="font-serif text-xl font-bold text-[#374151] mb-6">Resumo do Pedido</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-[#374151]">R$ {subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Desconto (5%)</span>
                  <span>-R$ {discount.toFixed(2)}</span>
                </div>
              )}

              {shippingEstimate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frete estimado</span>
                  <span className="font-medium text-[#374151]">
                    R$ {shippingEstimate.toFixed(2)}
                  </span>
                </div>
              )}

              {shippingEstimate === 0 && (
                <div className="flex justify-between text-sm text-green-600 bg-green-50 p-2 rounded">
                  <span>Frete grátis</span>
                  <span>✓</span>
                </div>
              )}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between">
                <span className="font-bold text-[#374151]">Total</span>
                <span className="font-serif text-2xl font-bold text-[#2F7A3E]">
                  R$ {total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-[#2F7A3E] hover:bg-[#266332] text-white py-3 rounded-full font-bold transition-all hover:shadow-lg"
              >
                {isLoading ? 'Carregando...' : 'Ir para Checkout'}
              </Button>

              <button
                onClick={() => clearCart()}
                className="w-full py-2 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Limpar Carrinho
              </button>
            </div>

            {/* Info Messages */}
            <div className="mt-6 space-y-2 text-xs text-gray-500 border-t pt-4">
              <p>✓ Frete grátis em compras acima de R$ 100</p>
              <p>✓ 5% de desconto em compras acima de R$ 200</p>
              <p>✓ Pague via PIX e ganhe 3% de desconto</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
