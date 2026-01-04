'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ProductCard } from '@/components/ui/product-card';
import { supabase } from '@/lib/supabase-client';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  slug?: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [sortBy, setSortBy] = useState<string>('relevancia');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Load products
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { data: productsData } = await supabase.from('products').select('*');
        const { data: categoriesData } = await supabase.from('categories').select('*');

        if (productsData) setProducts(productsData);
        if (categoriesData) setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'todas') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Sort
    if (sortBy === 'menor-preco') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'maior-preco') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'mais-novo') {
      filtered.reverse();
    }
    // default is "relevancia"

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-[#F7FAF7]">
      {/* Search Bar */}
      <section className="bg-white border-b border-gray-200 py-6 sm:py-8 sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-3 border border-gray-300 focus-within:border-[#2F7A3E] focus-within:ring-2 focus-within:ring-[#2F7A3E]/20 transition-all">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="O que você procura?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-base text-[#374151] placeholder-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:bg-gray-200 rounded-full text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-[#374151] font-medium"
            >
              <Filter className="h-5 w-5" />
              <span className="hidden sm:inline">Filtros</span>
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'} space-y-6`}>
            {/* Category Filter */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-[#374151] mb-4 flex items-center justify-between">
                Categorias
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer hover:text-[#2F7A3E]">
                  <input
                    type="radio"
                    name="category"
                    value="todas"
                    checked={selectedCategory === 'todas'}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-4 h-4 accent-[#2F7A3E]"
                  />
                  <span className="text-gray-700">Todas as Categorias</span>
                </label>
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center gap-3 cursor-pointer hover:text-[#2F7A3E]"
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat.name}
                      checked={selectedCategory === cat.name}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-4 h-4 accent-[#2F7A3E]"
                    />
                    <span className="text-gray-700">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort Filter */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-[#374151] mb-4">Ordenar por</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-[#374151] bg-white focus:border-[#2F7A3E] focus:ring-1 focus:ring-[#2F7A3E]"
              >
                <option value="relevancia">Relevância</option>
                <option value="menor-preco">Menor Preço</option>
                <option value="maior-preco">Maior Preço</option>
                <option value="mais-novo">Mais Novo</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(searchQuery || selectedCategory !== 'todas' || sortBy !== 'relevancia') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('todas');
                  setSortBy('relevancia');
                }}
                className="w-full py-2 px-4 rounded-full border border-[#2F7A3E] text-[#2F7A3E] font-medium hover:bg-[#2F7A3E]/5 transition-colors"
              >
                Limpar Filtros
              </button>
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-[#374151]">
                {searchQuery
                  ? `Resultados para "${searchQuery}"`
                  : selectedCategory === 'todas'
                    ? 'Todos os Produtos'
                    : `Produtos: ${selectedCategory}`}
              </h2>
              <span className="text-gray-600 text-sm font-medium">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F7A3E]"></div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="font-serif text-2xl font-bold text-[#374151] mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Tente ajustar seus filtros ou buscar por outro termo.
                </p>
                <Link
                  href="/category/todos"
                  className="inline-flex items-center justify-center rounded-full bg-[#2F7A3E] px-8 py-3 text-base font-bold text-white hover:bg-[#266332] transition-all hover:shadow-lg"
                >
                  Ver Todos os Produtos
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7FAF7] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F7A3E] mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando resultados...</p>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
