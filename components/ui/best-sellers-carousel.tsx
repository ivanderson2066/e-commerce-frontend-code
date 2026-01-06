'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  images: string[];
  slug?: string;
  rating?: number;
  reviews_count?: number;
}

interface BestSellersCarouselProps {
  products: Product[];
  autoScroll?: boolean;
}

export function BestSellersCarousel({ products, autoScroll = true }: BestSellersCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect screen size for responsive items
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(2);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (!autoScroll || products.length <= itemsPerView) return;

    const startAutoScroll = () => {
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const maxIndex = Math.max(0, products.length - itemsPerView);
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, 5000);
    };

    startAutoScroll();

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [products.length, itemsPerView, autoScroll]);

  const resetAutoScroll = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
    if (autoScroll && products.length > itemsPerView) {
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const maxIndex = Math.max(0, products.length - itemsPerView);
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, 5000);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    resetAutoScroll();
  };

  const handleNext = () => {
    const maxIndex = Math.max(0, products.length - itemsPerView);
    setCurrentIndex((prev) => (prev >= maxIndex ? maxIndex : prev + 1));
    resetAutoScroll();
  };

  if (products.length === 0) {
    return null;
  }

  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < Math.max(0, products.length - itemsPerView);

  return (
    <div ref={containerRef} className="relative group">
      {/* Navigation Buttons */}
      {canScrollLeft && (
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all hover:bg-[#2F7A3E] hover:text-white -ml-6"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Carousel Container */}
      <div className="overflow-hidden">
        <div
          className="flex gap-6 transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
          }}
        >
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug || product.id}`}
              className="flex-shrink-0"
              style={{ width: `${100 / itemsPerView}%` }}
            >
              <div className="group/card flex flex-col gap-3 h-full">
                {/* Product Image Container */}
                <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-gray-100 border border-gray-200 group-hover/card:border-[#2F7A3E] transition-all duration-300">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover/card:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <span className="text-gray-400 text-sm">Sem imagem</span>
                    </div>
                  )}

                  {/* Best Seller Badge */}
                  <div className="absolute top-3 right-3 bg-[#2F7A3E] text-white px-3 py-1 rounded-full text-xs font-bold">
                    Campeão
                  </div>

                  {/* Rating */}
                  {product.rating && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-full">
                      <Star className="h-3 w-3 fill-[#5AA96A] text-[#5AA96A]" />
                      <span className="text-xs font-bold text-gray-800">
                        {product.rating.toFixed(1)}
                      </span>
                      {product.reviews_count && (
                        <span className="text-xs text-gray-600">
                          ({product.reviews_count})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Discount Badge */}
                  {product.original_price && product.original_price > product.price && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm group-hover/card:text-[#2F7A3E] transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-lg text-[#2F7A3E]">
                      R$ {product.price.toFixed(2)}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-xs text-gray-500 line-through">
                        R$ {product.original_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Right Navigation Button */}
      {canScrollRight && (
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all hover:bg-[#2F7A3E] hover:text-white -mr-6"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
