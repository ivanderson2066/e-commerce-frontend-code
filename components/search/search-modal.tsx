"use client";

import { useState, useEffect, ReactNode } from "react";
import { Search, X } from 'lucide-react';
import { products } from "@/lib/data";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/supabase-client";

// Adicionamos a interface para aceitar customTrigger
interface SearchModalProps {
  customTrigger?: ReactNode;
}

export function SearchModal({ customTrigger }: SearchModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]); // Estado local para busca
  const router = useRouter();

  // Carregar produtos do Supabase ao montar (para busca rápida)
  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase.from('products').select('*');
      if (data) setProductsList(data);
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    if (query.trim()) {
      const filtered = productsList.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description?.toLowerCase().includes(query.toLowerCase()) ||
          p.category?.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query, productsList]);

  const handleProductClick = (productId: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/product/${productId}`);
  };

  return (
    <>
      {/* Lógica de Gatilho: Se tiver custom, usa ele. Se não, usa o padrão. */}
      {customTrigger ? (
        <div onClick={() => setIsOpen(true)}>{customTrigger}</div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-emerald-50 rounded transition-colors"
          title="Buscar"
        >
          <Search className="h-5 w-5 text-foreground" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50">
           {/* Overlay */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          {/* Modal Content */}
          <div className="fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 focus-within:border-[#2F7A3E] focus-within:ring-1 focus-within:ring-[#2F7A3E] transition-all">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="O que você procura hoje?"
                  className="flex-1 bg-transparent outline-none text-base text-gray-800 placeholder:text-gray-400"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="p-1 hover:bg-gray-200 rounded-full text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {query.trim() === "" ? (
                 <div className="p-8 text-center text-gray-500">
                    <p className="text-sm">Digite para buscar produtos...</p>
                 </div>
              ) : results.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {results.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left group"
                    >
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                        <Image
                          src={product.images?.[0] || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#2F7A3E] transition-colors">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 capitalize">
                          {product.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#2F7A3E]">
                            {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            }).format(product.price)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-sm font-medium">Nenhum produto encontrado</p>
                  <p className="text-xs mt-1">Tente buscar por outro termo</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}