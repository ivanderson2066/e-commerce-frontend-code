'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  slug?: string;
}

interface FeaturedCarouselProps {
  products: Product[];
}

export function FeaturedCarousel({ products }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll every 3 seconds
  useEffect(() => {
    if (products.length <= 1) return;

    const startAutoScroll = () => {
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % products.length);
      }, 3000);
    };

    startAutoScroll();

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [products.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
    // Reset auto-scroll timer
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
    autoScrollRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 3000);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
    // Reset auto-scroll timer
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
    autoScrollRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 3000);
  };

  if (products.length === 0) {
    return null;
  }

  const product = products[currentIndex];

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden rounded-2xl">
      {/* Carousel Container */}
      <div className="relative h-[400px] sm:h-[500px] md:h-[600px] bg-gray-100">
        {/* Products */}
        {products.map((item, index) => (
          <Link
            key={item.id}
            href={`/product/${item.slug || item.id}`}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={item.images[0] || '/placeholder.svg'}
              alt={item.name}
              fill
              className="object-cover"
              priority={index === currentIndex}
            />

            {/* Overlay with product info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6 sm:p-8">
              <div className="max-w-2xl">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white mb-2">
                  {item.name}
                </h3>
                <p className="text-lg sm:text-xl font-bold text-[#5AA96A] mb-4">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(item.price)}
                </p>
                <button className="inline-flex items-center justify-center rounded-full bg-[#2F7A3E] hover:bg-[#266332] text-white px-6 py-3 font-bold transition-all hover:shadow-lg">
                  Ver Detalhes
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Navigation Buttons */}
      {products.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
            aria-label="Previous product"
          >
            <ChevronLeft className="h-6 w-6 text-[#2F7A3E]" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
            aria-label="Next product"
          >
            <ChevronRight className="h-6 w-6 text-[#2F7A3E]" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {products.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                // Reset auto-scroll timer
                if (autoScrollRef.current) {
                  clearInterval(autoScrollRef.current);
                }
                autoScrollRef.current = setInterval(() => {
                  setCurrentIndex((prev) => (prev + 1) % products.length);
                }, 3000);
              }}
              className={`transition-all rounded-full ${
                index === currentIndex
                  ? 'bg-white w-8 h-2'
                  : 'bg-white/50 hover:bg-white/75 w-2 h-2'
              }`}
              aria-label={`Go to product ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
