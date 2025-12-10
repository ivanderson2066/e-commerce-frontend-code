"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { CartSheet } from "@/components/cart/cart-sheet";
import { useAuth } from "@/lib/auth-context";
import { SearchModal } from "@/components/search/search-modal";
import { useCart } from "@/lib/cart-context";
import { Menu, User, LogOut, ShoppingBag, Search, Leaf, LayoutDashboard } from 'lucide-react';
import { supabase } from "@/lib/supabase-client";

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth(); // <--- Usando isAdmin do Contexto
  const { totalItems } = useCart();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .limit(6);

            if (error) {
                console.error("Erro ao buscar categorias no menu:", error);
            }
            
            if (data && data.length > 0) {
                setCategories(data);
            }
        } catch (err) {
            console.error("Erro crítico ao buscar categorias:", err);
        } finally {
            setLoadingCategories(false);
        }
    }
    fetchCategories();
  }, []);

  // LÓGICA DE OCULTAÇÃO ATUALIZADA
  // Oculta no login, registro E em todas as rotas administrativas
  if (pathname === "/login" || pathname === "/register" || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="relative z-50 flex flex-col whitespace-nowrap bg-[#F7FAF7] shadow-sm border-b border-gray-200/80 w-full max-w-full">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8 w-full">
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-transparent text-[#374151] transition-colors hover:bg-gray-200/50 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <Link href="/" className="flex items-center gap-2 text-[#2F7A3E] hover:opacity-80 transition-opacity">
            <Leaf className="h-8 w-8 flex-shrink-0" />
            <h2 className="font-serif text-xl font-bold tracking-[-0.015em] text-[#374151]">Caiçara Mix</h2>
          </Link>
        </div>

        <div className="hidden flex-1 px-8 lg:px-16 xl:px-24 md:block max-w-full overflow-hidden">
           <SearchModal customTrigger={
             <div className="relative w-full cursor-pointer group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-[#2F7A3E] transition-colors" />
                <input 
                    readOnly
                    className="w-full rounded-full border-transparent bg-gray-100 py-2.5 pl-11 pr-4 text-sm text-[#374151] placeholder-gray-500 focus:border-[#2F7A3E] focus:ring-[#2F7A3E] cursor-pointer hover:bg-white hover:shadow-sm transition-all" 
                    placeholder="O que você procura?" 
                />
             </div>
           } />
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <div className="md:hidden">
                <SearchModal />
            </div>

            {user ? (
                <div className="flex items-center gap-2">
                      {/* BOTAO ADMIN DESKTOP */}
                      {isAdmin && (
                          <Link href="/admin" className="hidden sm:flex h-10 cursor-pointer items-center justify-center gap-1 rounded-full bg-[#2F7A3E]/10 px-4 text-sm font-bold text-[#2F7A3E] hover:bg-[#2F7A3E]/20 transition-colors">
                             <LayoutDashboard className="h-4 w-4" />
                             ADMIN
                          </Link>
                      )}
                      <Link href="/account" className="hidden h-10 cursor-pointer items-center gap-2 rounded-full px-3 text-sm font-medium text-[#374151] transition-colors hover:bg-gray-200/50 sm:flex group">
                         <User className="h-5 w-5 group-hover:text-[#2F7A3E]" />
                         <span className="hidden lg:block group-hover:text-[#2F7A3E]">Minha Conta</span>
                     </Link>
                </div>
            ) : (
                <Link href="/login" className="hidden h-10 cursor-pointer items-center gap-2 rounded-full px-3 text-sm font-medium text-[#374151] transition-colors hover:bg-gray-200/50 sm:flex group">
                    <User className="h-5 w-5 group-hover:text-[#2F7A3E]" />
                    <span className="hidden lg:block group-hover:text-[#2F7A3E]">Entrar</span>
                </Link>
            )}

            <CartSheet customTrigger={
                <button className="relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-transparent text-[#374151] transition-colors hover:bg-gray-200/50 group">
                    <ShoppingBag className="h-6 w-6 group-hover:text-[#2F7A3E]" />
                    {totalItems > 0 && (
                        <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[#2F7A3E] text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-[#F7FAF7]">
                            {totalItems}
                        </span>
                    )}
                </button>
            } />
        </div>
      </div>
      
      <div className="w-full border-t border-gray-200/80 hidden md:block bg-white/50 backdrop-blur-sm overflow-hidden">
        <nav className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-4 py-3 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar">
            <Link href="/category/todos" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#2F7A3E] hover:font-bold whitespace-nowrap">
                Todas as Categorias
            </Link>
            
            {categories.map((cat) => (
                <Link 
                    key={cat.id} 
                    href={`/category/${cat.slug}`} 
                    className="text-sm font-medium text-gray-600 transition-colors hover:text-[#2F7A3E] hover:font-bold capitalize whitespace-nowrap"
                >
                    {cat.name}
                </Link>
            ))}

            {loadingCategories && (
                 <span className="text-xs text-gray-400 italic animate-pulse">Carregando...</span>
            )}
        </nav>
      </div>

      {isMenuOpen && (
         <div className="lg:hidden bg-white border-t border-gray-100 p-4 flex flex-col gap-4 absolute top-full w-full shadow-lg z-50 animate-in slide-in-from-top-5 max-h-[80vh] overflow-y-auto left-0 right-0">
             <nav className="flex flex-col gap-3">
                <Link href="/category/todos" className="text-base font-medium text-gray-700 py-2 border-b border-gray-50 hover:text-[#2F7A3E]" onClick={() => setIsMenuOpen(false)}>
                    Todas as Categorias
                </Link>
                
                {categories.map((cat) => (
                    <Link 
                        key={cat.id} 
                        href={`/category/${cat.slug}`} 
                        className="text-base font-medium text-gray-700 py-2 border-b border-gray-50 capitalize hover:text-[#2F7A3E]" 
                        onClick={() => setIsMenuOpen(false)}
                    >
                        {cat.name}
                    </Link>
                ))}
             </nav>
             <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
                {user ? (
                    <>
                        {/* BOTAO ADMIN MOBILE */}
                        {isAdmin && (
                             <Link href="/admin" className="flex items-center gap-2 text-[#2F7A3E] font-bold py-2 bg-green-50 rounded-md px-2" onClick={() => setIsMenuOpen(false)}>
                                <LayoutDashboard className="h-5 w-5" /> PAINEL ADMIN
                             </Link>
                        )}
                        <Link href="/account" className="flex items-center gap-2 text-[#2F7A3E] font-bold py-2 px-2" onClick={() => setIsMenuOpen(false)}>
                            <User className="h-5 w-5" /> Minha Conta
                        </Link>
                        <button onClick={() => {logout(); setIsMenuOpen(false)}} className="flex items-center gap-2 text-red-600 font-medium py-2 w-full text-left px-2">
                            <LogOut className="h-5 w-5" /> Sair
                        </button>
                    </>
                ) : (
                    <Link href="/login" className="flex items-center gap-2 text-[#2F7A3E] font-bold py-2" onClick={() => setIsMenuOpen(false)}>
                        <User className="h-5 w-5" /> Entrar / Cadastrar
                    </Link>
                )}
             </div>
         </div>
      )}
    </header>
  );
}