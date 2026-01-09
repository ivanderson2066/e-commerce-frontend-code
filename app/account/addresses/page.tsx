'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useAddresses, Address } from '@/lib/addresses-context';
import { Edit2, Trash2, Check, PlusCircle, Phone } from 'lucide-react';
import { AddressForm } from '@/components/account/address-form';
import { cn } from '@/lib/utils'; // Utilitário padrão do shadcn/ui se tiver, senão uso string template

export default function AddressesPage() {
  const { user } = useAuth();
  const { addresses, loading, deleteAddress, setDefaultAddress } = useAddresses();
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este endereço?')) return;
    await deleteAddress(id);
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultAddress(id);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A6C4A] mb-4"></div>
        <p className="text-gray-600">Carregando endereços...</p>
      </div>
    );
  }

  // Cor primária baseada no seu HTML: #4A6C4A
  const primaryColor = "text-[#4A6C4A]";
  const primaryBgHover = "hover:bg-[#4A6C4A]/10";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header da Página */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[#333333] text-4xl font-serif font-bold">Meus Endereços</h1>
        <p className="text-[#4A6C4A]/90 text-base font-normal leading-normal">
          Gerencie seus locais de entrega para agilizar suas compras.
        </p>
      </div>

      {/* Grid de Endereços */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Renderiza os Cards Existentes */}
        {addresses.map((address) => (
          <div 
            key={address.id} 
            className={`flex flex-col gap-4 bg-white p-6 rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md ${
                address.is_primary ? 'border-[#4A6C4A] bg-[#4A6C4A]/5' : 'border-[#E0E0E0]'
            }`}
          >
            {/* Header do Card */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-[#333333] text-lg font-bold leading-normal capitalize">
                    {address.label}
                </h3>
                {address.is_primary && (
                  <span className="text-xs font-semibold text-[#4A6C4A] bg-[#4A6C4A]/20 px-2 py-0.5 rounded-full">
                    Principal
                  </span>
                )}
              </div>
              
              {/* Ações */}
              <div className="flex items-center gap-1">
                {!address.is_primary && (
                    <button 
                        onClick={() => handleSetDefault(address.id)}
                        className={`flex items-center justify-center size-8 rounded-full ${primaryBgHover} transition-colors text-gray-400 hover:text-[#4A6C4A]`}
                        title="Definir como Padrão"
                    >
                        <Check size={18} />
                    </button>
                )}
                <button 
                    onClick={() => handleEdit(address)}
                    className={`flex items-center justify-center size-8 rounded-full ${primaryBgHover} transition-colors text-[#333333]/80`}
                    title="Editar"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                    onClick={() => handleDelete(address.id)}
                    className={`flex items-center justify-center size-8 rounded-full hover:bg-red-50 transition-colors text-[#333333]/80 hover:text-red-600`}
                    title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Corpo do Card (Detalhes) */}
            <div className={`border-t pt-4 ${address.is_primary ? 'border-[#4A6C4A]/20' : 'border-[#E0E0E0]'}`}>
              <p className="text-[#333333]/80 text-sm font-medium leading-relaxed mb-1">
                {address.name}
              </p>
              <p className="text-[#333333]/80 text-sm font-normal leading-relaxed">
                {address.address}, {address.number} {address.complement && ` - ${address.complement}`}
              </p>
              <p className="text-[#333333]/80 text-sm font-normal leading-relaxed capitalize">
                {address.neighborhood}, {address.city} - {address.state}
              </p>
              <p className="text-[#333333]/80 text-sm font-normal leading-relaxed mt-2">
                CEP: {address.zip_code}
              </p>
              {address.phone && (
                  <p className="text-[#333333]/60 text-xs font-normal leading-relaxed mt-1 flex items-center gap-1">
                    <Phone size={12} /> {address.phone}
                  </p>
              )}
            </div>
          </div>
        ))}

        {/* Botão "Adicionar Novo" (Estilo Card Tracejado) */}
        <button 
          onClick={() => {
            setEditingAddress(null);
            setShowForm(true);
          }}
          className="flex flex-col min-h-[228px] cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-dashed border-[#4A6C4A]/30 text-[#4A6C4A] transition-all hover:bg-[#4A6C4A]/5 hover:border-[#4A6C4A]/50 group"
        >
          <PlusCircle className="h-10 w-10 transition-transform group-hover:scale-110" strokeWidth={1.5} />
          <span className="text-base font-semibold">Adicionar Novo Endereço</span>
        </button>

      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <AddressForm editingAddress={editingAddress} onClose={handleFormClose} />
      )}
    </div>
  );
}