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

export function PromotionsBanner() {
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
          // Filter out expired ones if logic above missed edge cases
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
    return null; // Don't show anything while loading to avoid layout shift or show a skeleton
  }

  if (promotions.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[#F7FAF7] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
      </div>
    </section>
  );
}
