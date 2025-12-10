"use client";

import { useAuth } from "@/lib/auth-context";
import { Edit2 } from 'lucide-react';

export default function AccountPage() {
  const { user } = useAuth();

  // O Layout já cuida do redirecionamento se não houver user, mas por segurança visual:
  if (!user) return null; 

  // CORREÇÃO: Cast para 'any' para evitar erro de TypeScript ao acessar user_metadata
  const currentUser = user as any;

  return (
    <div className="bg-white p-8 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#EAEAEA] animate-in fade-in duration-500">
      <div className="pb-6 border-b border-[#E0E0E0]">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2F4F4F]">Meu Perfil</h1>
        <p className="mt-2 text-gray-500">Gerencie suas informações pessoais e de segurança.</p>
      </div>

      <div className="mt-8 space-y-6">
        <div className="grid grid-cols-1 gap-y-6">
          
          {/* Nome */}
          <div className="group">
            <label className="block text-sm font-medium text-[#333333] mb-2">Nome Completo</label>
            <div className="flex items-center justify-between p-4 bg-[#F9F9F9] rounded-lg border border-transparent group-hover:border-[#E0E0E0] transition-colors">
              {/* Agora verifica user.name E user_metadata.full_name sem dar erro */}
              <p className="text-gray-700 font-medium">
                {user.name || currentUser.user_metadata?.full_name || 'Usuário'}
              </p>
              <button className="text-sm font-medium text-[#556B2F] hover:underline flex items-center gap-1">
                <Edit2 className="h-3 w-3" /> Editar
              </button>
            </div>
          </div>

          {/* Email */}
          <div className="group">
            <label className="block text-sm font-medium text-[#333333] mb-2">E-mail</label>
            <div className="flex items-center justify-between p-4 bg-[#F9F9F9] rounded-lg border border-transparent group-hover:border-[#E0E0E0] transition-colors">
              <p className="text-gray-700 font-medium">{user.email}</p>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Verificado</span>
            </div>
          </div>

          {/* Telefone */}
          <div className="group">
            <label className="block text-sm font-medium text-[#333333] mb-2">Telefone</label>
            <div className="flex items-center justify-between p-4 bg-[#F9F9F9] rounded-lg border border-transparent group-hover:border-[#E0E0E0] transition-colors">
              <p className="text-gray-500 italic">
                {currentUser.user_metadata?.phone || "Nenhum telefone cadastrado"}
              </p>
              <button className="text-sm font-bold text-[#556B2F] hover:underline">
                {currentUser.user_metadata?.phone ? "Alterar" : "Adicionar"}
              </button>
            </div>
          </div>

          {/* ID Técnico */}
          <div className="pt-4 mt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-mono">ID do Cliente: {user.id}</p>
          </div>

        </div>
      </div>
    </div>
  );
}