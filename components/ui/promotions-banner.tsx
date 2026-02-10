'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-client';
import { Loader2, ArrowRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface Promotion {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
  discount_amount: number;
  image: string;
  active: boolean;
  start_date: string;
  end_date: string;
}

interface PromotionProduct {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  images: string[];
  slug?: string;
}

interface PromotionsBannerProps {
  products?: PromotionProduct[];
}

export function PromotionsBanner({ products = [] }: PromotionsBannerProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);

  useEffect(() => {
    async function loadPromotions() {
      try {
        const now = new Date().toISOString();
        const { data } = await supabase
          .from('promotions')
          .select('*')
          .eq('active', true)
          .or(`start_date.is.null,start_date.lte.${now}`)
          .or(`end_date.is.null,end_date.gte.${now}`)
          .order('created_at', { ascending: false });

        if (data) {
          const validPromotions = data.filter((p) => {
             const start = p.start_date ? new Date(p.start_date) : null;
             const end = p.end_date ? new Date(p.end_date) : null;
             const current = new Date();
             if (start && current < start) return false;
             if (end && current > end) return false;
             return true;
          });
          setPromotions(validPromotions);
        }
      } catch (error) {
        console.error('Error loading promotions:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPromotions();
  }, []);

  if (loading) {
    return null;
  }

  if (promotions.length === 0 && products.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[#F7FAF7] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Banner Carousel - only if there are banner promotions */}
        {promotions.length > 0 && (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100" ref={emblaRef}>
            <div className="flex">
              {promotions.map((promo) => (
                <div key={promo.id} className="relative min-w-full flex-[0_0_100%]">
                  <div className="relative aspect-[21/9] md:aspect-[3/1] w-full overflow-hidden">
                    {promo.image ? (
                      <Image
                        src={promo.image}
                        alt={promo.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-r from-[#2F7A3E] to-[#5AA96A]" />
                    )}
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-8 md:px-16 lg:px-24">
                      <div className="max-w-xl text-white animate-in slide-in-from-left duration-700">
                        <div className="inline-block rounded-full bg-[#2F7A3E] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white mb-4">
                          Oferta Especial
                        </div>
                        <h2 className="font-serif text-3xl font-bold md:text-5xl mb-4 leading-tight">
                          {promo.name}
                        </h2>
                        <p className="text-lg text-gray-100 mb-6 max-w-md">
                          {promo.description}
                        </p>
                        
                        <div className="flex items-center gap-4">
                           {(promo.discount_percentage > 0 || promo.discount_amount > 0) && (
                             <div className="flex items-center justify-center bg-white text-[#2F7A3E] font-bold rounded-full h-12 px-6 text-lg">
                               {promo.discount_percentage > 0 ? `${promo.discount_percentage}% OFF` : `R$ ${promo.discount_amount} OFF`}
                             </div>
                           )}
                           <Link 
                             href="/category/todos" 
                             className="flex items-center gap-2 text-white font-bold hover:underline decoration-2 underline-offset-4"
                           >
                             Aproveitar Agora <ArrowRight className="h-5 w-5" />
                           </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Promotion Products Grid */}
        {products.length > 0 && (
          <div className={promotions.length > 0 ? 'mt-8' : ''}>
            <h3 className="font-serif text-2xl font-bold text-[#374151] mb-6 flex items-center gap-2">
              <span className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">PROMO</span>
              Produtos em Promocao
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => {
                const hasDiscount = product.original_price && product.original_price > product.price;
                const discountPercent = hasDiscount
                  ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
                  : 0;
                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug || product.id}`}
                    className="group flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-all hover:border-[#2F7A3E]"
                  >
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <span className="text-gray-400 text-sm">Sem imagem</span>
                        </div>
                      )}
                      {hasDiscount && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                          -{discountPercent}%
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col flex-1 justify-between">
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-[#2F7A3E] transition-colors">
                        {product.name}
                      </h4>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="font-bold text-lg text-[#2F7A3E]">
                          R$ {product.price.toFixed(2)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-gray-500 line-through">
                            R$ {product.original_price!.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
