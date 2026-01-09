'use client';

import { useEffect, useState } from 'react';
import { CategoryCarousel } from '@/components/ui/category-carousel';
import { supabase } from '@/lib/supabase-client';
import Link from 'next/link';
import { Loader2, ArrowRight } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string; // Adicionado caso exista no futuro
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
    <div className="w-full bg-[#FDFDFD] min-h-screen font-sans selection:bg-[#2F7A3E] selection:text-white">
      {/* Breadcrumb - Minimalista */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-10 opacity-95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-gray-500 hover:text-[#2F7A3E] transition-colors">
                  Início
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-gray-300" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-[#2F7A3E]">
                  Todas as Categorias
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Header - Com toque de design editorial */}
      <div className="bg-white pb-16 pt-12 md:pt-20 border-b border-gray-100">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          {loading ? (
            <div className="flex flex-col items-center gap-6 animate-pulse">
              <div className="h-12 bg-gray-100 w-1/2 rounded-lg"></div>
              <div className="h-4 bg-gray-50 w-2/3 rounded-full"></div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out">
              <span className="inline-block py-1 px-3 rounded-full bg-[#2F7A3E]/10 text-[#2F7A3E] text-xs font-bold tracking-wider uppercase mb-4">
                Coleções Exclusivas
              </span>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#1A1A1A] mb-6 tracking-tight">
                Explore Nossas Categorias
              </h1>
              <p className="text-gray-500 text-lg md:text-xl leading-relaxed font-light mx-auto max-w-2xl">
                Uma seleção cuidadosa de produtos naturais e sustentáveis, pensados para o seu bem-estar e harmonia com a natureza.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-7xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#2F7A3E]" />
            <p className="text-gray-400 text-sm tracking-wide">Carregando coleções...</p>
          </div>
        ) : categories.length > 0 ? (
          <div className="space-y-24">
            {/* Seção 1: Destaque Carrossel (Opcional, se quiser manter) */}
            {/* <div className="space-y-8 animate-in fade-in duration-700 delay-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-serif font-bold text-[#1A1A1A]">Destaques</h2>
              </div>
              <CategoryCarousel categories={categories} />
            </div> */}

            {/* Seção 2: Grid Imersivo */}
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map((category, index) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="group relative h-[420px] rounded-xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#2F7A3E]/10 transition-all duration-500 ease-out transform hover:-translate-y-1"
                  >
                    {/* Imagem de Fundo com Zoom Suave */}
                    {category.image ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                        style={{ backgroundImage: `url(${category.image})` }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#2F7A3E] to-[#1A4D2E]" />
                    )}

                    {/* Overlay Gradiente Sofisticado */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                    {/* Conteúdo Flutuante */}
                    <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <span className="text-[#A7E3B0] text-xs font-bold tracking-widest uppercase mb-2 block opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                          Categoria
                        </span>
                        <h3 className="text-3xl font-serif font-bold mb-3 group-hover:text-[#F7FAF7] transition-colors">
                          {category.name}
                        </h3>
                        <div className="h-0.5 w-12 bg-[#2F7A3E] mb-4 group-hover:w-full transition-all duration-500 ease-out" />
                        
                        <div className="flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 text-[#A7E3B0]">
                          Explorar Produtos <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-32 text-center max-w-md mx-auto">
            <div className="bg-gray-50 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Nada por aqui ainda</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Estamos preparando nossas coleções. Volte em breve para novidades incríveis.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-[#2F7A3E] px-8 py-3.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-[#2F7A3E]/20 hover:bg-[#235c2e] hover:shadow-xl hover:shadow-[#2F7A3E]/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              Voltar ao Início
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}