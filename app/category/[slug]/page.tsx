"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProductCard } from "@/components/ui/product-card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronDown, Loader2, SearchX } from 'lucide-react';
import { supabase } from "@/lib/supabase-client";
import Link from "next/link";

export default function CategoryPage() {
  const params = useParams();
  const rawSlug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const slug = rawSlug ? decodeURIComponent(rawSlug) : "";
  
  const [products, setProducts] = useState<any[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    if (!slug) return;

    async function fetchData() {
      setLoading(true);

      try {
        // 1. Tenta buscar informações da Categoria no banco
        let catInfo = null;
        
        if (slug === 'todos') {
            catInfo = {
                name: 'Todos os Produtos',
                description: 'Explore nossa seleção completa de produtos naturais e sustentáveis.',
                slug: 'todos'
            };
        } else {
            // Tenta buscar categoria exata pelo slug
            const { data: exactCat } = await supabase
                .from('categories')
                .select('*')
                .eq('slug', slug)
                .single();

            if (exactCat) {
                catInfo = exactCat;
            } else {
                // Se não achar categoria oficial, cria uma "virtual" baseada no nome
                // Isso impede a página de quebrar se o link for "rosto" mas a categoria for "cuidados-faciais"
                catInfo = {
                    name: slug.replace(/-/g, ' '), // 'oleos-essenciais' -> 'oleos essenciais'
                    description: `Confira nossa seleção especial de ${slug.replace(/-/g, ' ')}.`,
                    slug: slug
                };
            }
        }

        setCategoryInfo(catInfo);

        // 2. Buscar Produtos
        if (slug !== 'todos') {
            // Tenta filtrar pela coluna categoria (que deve guardar o slug ou nome)
            const { data: exactProducts } = await supabase
                .from('products')
                .select('*')
                .ilike('category', `%${slug}%`);

            if (exactProducts && exactProducts.length > 0) {
                setProducts(exactProducts);
            } else {
                // Fallback: Se não achou por categoria, busca por nome
                const { data: textSearchProducts } = await supabase
                    .from('products')
                    .select('*')
                    .ilike('name', `%${slug}%`);

                setProducts(textSearchProducts || []);
            }
        } else {
            // Se for 'todos', pega tudo
            const { data: allProducts } = await supabase
                .from('products')
                .select('*');
            setProducts(allProducts || []);
        }

      } catch (err) {
        console.error("Erro ao carregar categoria:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0; 
  });

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
                <BreadcrumbPage className="capitalize font-semibold text-[#2F7A3E]">
                    {categoryInfo?.name || 'Carregando...'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-white border-b border-gray-200 pb-12 pt-8">
        <div className="container mx-auto px-4 text-center">
          {loading && !categoryInfo ? (
             <div className="flex flex-col items-center gap-4">
                <div className="h-10 bg-gray-100 w-1/3 animate-pulse rounded-full"></div>
                <div className="h-4 bg-gray-100 w-1/2 animate-pulse rounded-full"></div>
             </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#374151] mb-4 capitalize">
                    {categoryInfo?.name}
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto font-light">
                    {categoryInfo?.description}
                </p>
            </div>
          )}
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 mb-8 justify-between items-center">
          <p className="text-gray-500 font-medium text-sm">
            Mostrando {products.length} produtos
          </p>

          <div className="relative">
            <select 
            className="pl-4 pr-10 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-700 bg-white cursor-pointer hover:border-[#2F7A3E] focus:outline-none focus:ring-2 focus:ring-[#2F7A3E]/20 transition-all appearance-none shadow-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            >
            <option value="popular">Mais Populares</option>
            <option value="price-asc">Menor Preço</option>
            <option value="price-desc">Maior Preço</option>
            </select>
            <ChevronDown className="h-4 w-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#2F7A3E]" />
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <SearchX className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Não encontramos produtos nesta categoria no momento. Tente explorar nossa coleção completa.
            </p>
            <Link href="/category/todos" className="inline-flex items-center justify-center rounded-full bg-[#2F7A3E] px-8 py-3 text-base font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#266332]">
              Ver Todos os Produtos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
