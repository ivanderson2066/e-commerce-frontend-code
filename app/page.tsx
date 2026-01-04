"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ProductCard } from "@/components/ui/product-card";
import { CategoryCarousel } from "@/components/ui/category-carousel";
import { supabase } from "@/lib/supabase-client";
// Importando ícones Lucide
import { Loader2, Leaf, Heart, Recycle, Star, Tag } from 'lucide-react';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .limit(4);
      
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*');

      if (productsData) setFeaturedProducts(productsData);
      if (categoriesData) setCategories(categoriesData);
      
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-0">
      {/* Hero Section */}
      <section 
        className="flex min-h-[50vh] flex-col items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-16 text-center md:min-h-[65vh] relative" 
        style={{
          backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAC6xwB2_wzqdr1U8wTfDkfd7mAyNNWmLZKWVpMjqK0bsWrGZpebvNALSTtZ96v7YU5khmash8QlZ5fvE9-a6aw_1gASaFzNTy10Yv-Qp7tosCUAalgN_MCxrwr9qZhn-psngD-01FRpRtAyYIdOjI577ydrM-dqulGNCjZWPaLlPhWo0oKVbB7YeqhcmNKAFZKe_jfNTUai_ClVTw4Not4RE5TeVZwgX2tPkfHy50qfoELxLPKjHr3wP3D-LV69twAxwo1H0h3wNWt")'
        }}
      >
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="relative z-10 flex max-w-2xl flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="font-serif text-4xl font-bold leading-tight text-white md:text-6xl drop-shadow-md">
            Beleza que Floresce da Natureza
          </h1>
          <p className="text-base font-normal leading-normal text-white/95 md:text-lg drop-shadow-sm max-w-lg">
            Descubra o poder dos cosméticos naturais, feitos com ingredientes puros da flora brasileira.
          </p>
          <Link href="/category/todos" className="mt-6 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#2F7A3E] px-8 py-4 text-lg font-bold leading-normal text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl hover:bg-[#266332]">
            <span className="truncate">Comprar Agora</span>
          </Link>
        </div>
      </section>

      {/* Ícones de Confiança */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 text-center sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-3">
            <Leaf className="h-10 w-10 text-[#5AA96A]" />
            <h3 className="font-serif text-lg font-bold text-[#374151]">100% Natural</h3>
            <p className="text-sm text-gray-600">Ingredientes puros e de origem sustentável.</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Heart className="h-10 w-10 text-[#5AA96A]" />
            <h3 className="font-serif text-lg font-bold text-[#374151]">Cruelty-Free</h3>
            <p className="text-sm text-gray-600">Não testamos em animais. Cuidamos de todas as formas de vida.</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Recycle className="h-10 w-10 text-[#5AA96A]" />
            <h3 className="font-serif text-lg font-bold text-[#374151]">Embalagens Sustentáveis</h3>
            <p className="text-sm text-gray-600">Nossas embalagens são pensadas para o bem do planeta.</p>
          </div>
        </div>
      </section>

      {/* Produtos em Destaque */}
      <section className="py-16 sm:py-24 bg-[#F7FAF7]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-3xl font-bold leading-tight tracking-[-0.015em] sm:text-4xl text-[#374151]">
              Produtos em Destaque
            </h2>
            <Link href="/category/todos" className="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full border border-[#2F7A3E] bg-transparent px-6 py-2 text-sm font-bold leading-normal text-[#2F7A3E] shadow-sm transition-colors hover:bg-[#2F7A3E]/10">
              <span className="truncate">Ver Mais</span>
            </Link>
          </div>

          {loading ? (
             <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-[#2F7A3E]" /></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 lg:gap-x-6 lg:gap-y-10">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="mt-8 text-center sm:hidden">
            <Link href="/category/todos" className="flex w-full min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full border border-[#2F7A3E] bg-transparent px-8 py-3 text-base font-bold leading-normal text-[#2F7A3E] shadow-sm transition-colors hover:bg-[#2F7A3E]/10">
                <span className="truncate">Ver todos os produtos</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Categorias em Carrossel */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-[#2F7A3E]/5 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="font-serif text-3xl font-bold leading-tight tracking-[-0.015em] sm:text-4xl text-[#374151] mb-2">
              Explore Nossas Categorias
            </h2>
            <p className="text-gray-600">Descubra a beleza natural em cada categoria</p>
          </div>

          {loading ? (
            <div className="h-80 w-full bg-gray-200 animate-pulse rounded-2xl"></div>
          ) : (
            <CategoryCarousel categories={categories} />
          )}
        </div>
      </section>

      {/* Promoções em Destaque */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-[#2F7A3E]/10 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold leading-tight tracking-[-0.015em] sm:text-4xl text-[#374151] mb-8">
            🎉 Promoções em Destaque
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
              <div className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
            </div>
          ) : (
            <>
              {/* Promoções Dinâmicas */}
              {featuredProducts && featuredProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {featuredProducts.slice(0, 2).map((promo: any) => (
                    <Link
                      key={promo.id}
                      href={`/product/${promo.id}`}
                      className="group relative flex min-h-[250px] items-end justify-start overflow-hidden rounded-2xl p-8 shadow-md transition-all hover:shadow-xl"
                    >
                      <div
                        className="absolute inset-0 h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{
                          backgroundImage: `url("${promo.images?.[0] || '/placeholder.svg'}")`,
                        }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="relative text-white z-10">
                        <span className="rounded-full bg-[#2F7A3E] px-3 py-1 text-xs font-bold uppercase tracking-wider">
                          Promoção
                        </span>
                        <h3 className="mt-3 font-serif text-3xl font-bold">
                          {promo.name}
                        </h3>
                        <p className="mt-1 text-green-100">
                          {promo.description || "Aproveite esta promoção especial"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Fallback Estático */}
                  <Link href="/category/skincare" className="group relative flex min-h-[250px] items-end justify-start overflow-hidden rounded-2xl p-8 shadow-md transition-all hover:shadow-xl">
                    <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-[#A7E3B0] to-[#2F7A3E]"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    <div className="relative text-white z-10">
                      <span className="rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-wider">
                        15% OFF
                      </span>
                      <h3 className="mt-3 font-serif text-3xl font-bold">Kit Skincare Natural</h3>
                      <p className="mt-1 text-green-100">Cuide da sua pele com ingredientes puros</p>
                    </div>
                  </Link>
                  <Link href="/category/cabelos" className="group relative flex min-h-[250px] items-end justify-start overflow-hidden rounded-2xl bg-gradient-to-br from-[#2F7A3E] to-[#1d5a2f] p-8 text-white shadow-md transition-all hover:shadow-xl">
                    <div className="absolute -bottom-6 -right-6 text-white/10 rotate-12">
                      <Tag className="h-48 w-48" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="font-serif text-3xl font-bold">Promoção PIX</h3>
                      <p className="mt-1 text-green-100">Pague via PIX e ganhe 3% de desconto adicional</p>
                    </div>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Testemunhos */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center font-serif text-3xl font-bold leading-tight tracking-[-0.015em] sm:text-4xl text-[#374151]">O que nossos clientes dizem</h2>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="rounded-xl bg-[#F7FAF7] p-8 text-center shadow-sm hover:shadow-md transition-shadow border border-[#e5e7eb]">
                    <div className="flex justify-center text-[#5AA96A] gap-1">
                        <Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" />
                    </div>
                    <blockquote className="mt-4 text-base italic text-gray-700">"Os produtos são incríveis! Minha pele nunca esteve tão saudável e radiante. Sinto a pureza da natureza em cada aplicação."</blockquote>
                    <cite className="mt-4 block font-bold not-italic text-[#2F7A3E]">- Ana Clara S.</cite>
                </div>
                <div className="rounded-xl bg-[#F7FAF7] p-8 text-center shadow-sm hover:shadow-md transition-shadow border border-[#e5e7eb]">
                    <div className="flex justify-center text-[#5AA96A] gap-1">
                        <Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" />
                    </div>
                    <blockquote className="mt-4 text-base italic text-gray-700">"Finalmente encontrei um shampoo sólido que funciona pro meu cabelo. Deixa limpo, macio e com um cheiro maravilhoso!"</blockquote>
                    <cite className="mt-4 block font-bold not-italic text-[#2F7A3E]">- Marcos L.</cite>
                </div>
            </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[#A7E3B0]/30 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-bold leading-tight tracking-[-0.015em] sm:text-4xl text-[#2F7A3E]">
                Junte-se à nossa comunidade
            </h2>
            <p className="mt-3 text-base text-gray-600">
                Receba novidades exclusivas e dicas de bem-estar natural.
            </p>
            <form className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <input 
                    className="w-full max-w-sm rounded-full border-gray-300 px-5 py-3 text-gray-700 shadow-sm focus:border-[#2F7A3E] focus:ring-[#2F7A3E] outline-none bg-white" 
                    placeholder="Seu melhor e-mail" 
                    type="email" 
                />
                <button className="flex w-full cursor-pointer items-center justify-center rounded-full bg-[#2F7A3E] px-8 py-3 text-base font-bold text-white shadow-md transition-transform hover:scale-105 sm:w-auto hover:bg-[#266332]" type="submit">
                    Inscrever
                </button>
            </form>
        </div>
      </section>
    </div>
  );
}
