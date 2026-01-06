'use client';

import { useEffect, useState } from 'react';
import { CategoryCarousel } from '@/components/ui/category-carousel';
import { supabase } from '@/lib/supabase-client';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <div className="w-full bg-[#F7FAF7] min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="hover:text-[#2F7A3E]">Início</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-[#2F7A3E]">
                  Todas as Categorias
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 pb-12 pt-8">
        <div className="container mx-auto px-4 text-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 bg-gray-100 w-1/3 animate-pulse rounded-full"></div>
              <div className="h-4 bg-gray-100 w-1/2 animate-pulse rounded-full"></div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#374151] mb-4">
                Todas as Categorias
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto font-light">
                Explore nossa seleção completa de categorias de produtos naturais e sustentáveis.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#2F7A3E]" />
          </div>
        ) : categories.length > 0 ? (
          <>
            {/* Carousel View for Desktop */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-[#374151] mb-6">Explore por Carrossel</h2>
              <CategoryCarousel categories={categories} />
            </div>

            {/* Grid View for Mobile/Desktop */}
            <div>
              <h2 className="text-2xl font-bold text-[#374151] mb-6">Ou navegue pela grade</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="group relative overflow-hidden rounded-2xl h-80 flex items-center justify-center shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    {/* Background Image */}
                    {category.image && (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url(${category.image})` }}
                      />
                    )}

                    {/* Overlay */}
                    <div className={`absolute inset-0 ${category.image ? 'bg-black/40' : 'bg-gradient-to-br from-[#2F7A3E]/50 to-[#A7E3B0]/50'} group-hover:bg-black/50 transition-colors`} />

                    {/* Content */}
                    <div className="relative z-10 text-center px-6">
                      <h3 className="text-3xl font-bold font-serif text-white mb-2 group-hover:text-[#A7E3B0] transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-white/90 text-sm font-medium">
                        Explorar
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-500 text-lg mb-6">Nenhuma categoria encontrada.</p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-[#2F7A3E] px-8 py-3 text-base font-bold text-white shadow-lg transition-transform hover:scale-105"
            >
              Voltar à Página Inicial
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
