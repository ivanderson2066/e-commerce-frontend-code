"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { User, Package, Heart, MapPin, LogOut, Edit2 } from 'lucide-react';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    // Se não estiver logado, mostra tela de acesso negado bonita
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 bg-[#F7FAF7]">
        <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-2xl font-serif font-bold text-[#2F7A3E] mb-4">Acesso Necessário</h2>
          <p className="text-gray-500 mb-6">Você precisa estar conectado para acessar sua conta e ver seus pedidos.</p>
          <Link 
            href="/login" 
            className="inline-flex w-full justify-center items-center rounded-full bg-[#2F7A3E] px-6 py-3 text-base font-bold text-white shadow-md hover:bg-[#266332] transition-all"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* Sidebar de Navegação (Igual ao design) */}
          <aside className="w-full md:w-1/4">
            <div className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] h-full">
              <nav className="flex flex-col space-y-1">
                {/* Item Ativo: Meu Perfil */}
                <Link 
                  href="/account" 
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-[#2F4F4F] bg-[#E8F5E9]"
                >
                  <User className="h-5 w-5" />
                  <span>Meu Perfil</span>
                </Link>

                {/* Outros Links */}
                <Link 
                  href="/account/orders" 
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-[#E8F5E9] hover:text-[#2F4F4F] transition-colors duration-300"
                >
                  <Package className="h-5 w-5" />
                  <span>Meus Pedidos</span>
                </Link>

                <Link 
                  href="/account/favorites" 
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-[#E8F5E9] hover:text-[#2F4F4F] transition-colors duration-300"
                >
                  <Heart className="h-5 w-5" />
                  <span>Favoritos</span>
                </Link>

                <Link 
                  href="/account/addresses" 
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-[#E8F5E9] hover:text-[#2F4F4F] transition-colors duration-300"
                >
                  <MapPin className="h-5 w-5" />
                  <span>Endereços</span>
                </Link>

                {/* Botão Sair */}
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors duration-300 text-left mt-4 border-t border-gray-100"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sair</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Conteúdo Principal: Meu Perfil */}
          <main className="flex-1">
            <div className="bg-white p-8 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <div className="pb-6 border-b border-[#E0E0E0]">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2F4F4F]">Meu Perfil</h1>
                <p className="mt-2 text-gray-500">Gerencie suas informações pessoais e de segurança.</p>
              </div>

              <div className="mt-8 space-y-6">
                {/* Grid de Informações */}
                <div className="grid grid-cols-1 gap-y-6">
                  
                  {/* Campo Nome */}
                  <div className="group">
                    <label className="block text-sm font-medium text-[#333333] mb-2">Nome Completo</label>
                    <div className="flex items-center justify-between p-4 bg-[#F9F9F9] rounded-lg border border-transparent group-hover:border-[#E0E0E0] transition-colors">
                      <p className="text-gray-700 font-medium">{user.name}</p>
                      <button className="text-sm font-medium text-[#6B8E23] hover:underline flex items-center gap-1">
                        <Edit2 className="h-3 w-3" /> Editar
                      </button>
                    </div>
                  </div>

                  {/* Campo Email */}
                  <div className="group">
                    <label className="block text-sm font-medium text-[#333333] mb-2">E-mail</label>
                    <div className="flex items-center justify-between p-4 bg-[#F9F9F9] rounded-lg border border-transparent group-hover:border-[#E0E0E0] transition-colors">
                      <p className="text-gray-700 font-medium">{user.email}</p>
                      <button className="text-sm font-medium text-[#6B8E23] hover:underline flex items-center gap-1">
                         <Edit2 className="h-3 w-3" /> Alterar
                      </button>
                    </div>
                  </div>

                  {/* Campo Telefone (Exemplo Estático - Integrar depois se tiver no banco) */}
                  <div className="group">
                    <label className="block text-sm font-medium text-[#333333] mb-2">Telefone</label>
                    <div className="flex items-center justify-between p-4 bg-[#F9F9F9] rounded-lg border border-transparent group-hover:border-[#E0E0E0] transition-colors">
                      <p className="text-gray-500 italic">Nenhum telefone cadastrado</p>
                      <button className="text-sm font-bold text-[#6B8E23] hover:underline">
                        Adicionar
                      </button>
                    </div>
                  </div>

                  {/* ID do Cliente (Técnico, mas útil) */}
                  <div className="pt-4 mt-4 border-t border-gray-100">
                     <p className="text-xs text-gray-400">ID do Cliente: <span className="font-mono">{user.id}</span></p>
                  </div>

                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}