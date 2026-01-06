'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useAddresses, Address } from '@/lib/addresses-context';
import { Plus, Edit2, Trash2, MapPin, Check } from 'lucide-react';
import { AddressForm } from '@/components/account/address-form';
import { toast } from 'sonner';

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
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F7A3E] mb-4"></div>
        <p className="text-gray-600">Carregando endereços...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#374151]">Meus Endereços</h1>
          <p className="text-gray-600 mt-1">Gerencie seus endereços de entrega e cobrança</p>
        </div>
        <button
          onClick={() => {
            setEditingAddress(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-[#2F7A3E] hover:bg-[#266332] text-white px-6 py-3 rounded-full font-bold transition-all hover:shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Novo Endereço
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <AddressForm editingAddress={editingAddress} onClose={handleFormClose} />
      )}

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-lg border border-gray-200">
          <div className="h-20 w-20 bg-gradient-to-br from-[#2F7A3E]/10 to-[#A7E3B0]/10 rounded-full flex items-center justify-center mb-6">
            <MapPin className="h-10 w-10 text-[#2F7A3E]" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#374151] mb-2">Nenhum endereço cadastrado</h3>
          <p className="text-gray-600 mb-6 max-w-md">
            Adicione seu primeiro endereço para facilitar suas compras e entregas.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-[#2F7A3E] hover:bg-[#266332] text-white px-6 py-3 rounded-full font-bold transition-all hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Adicionar Endereço
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="bg-white border-2 rounded-lg p-6 transition-all hover:shadow-md"
              style={{
                borderColor: address.is_default ? '#2F7A3E' : '#E5E7EB',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Address Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-[#374151]">{address.name}</h3>
                    {address.is_default && (
                      <span className="inline-flex items-center gap-1 bg-[#2F7A3E]/10 text-[#2F7A3E] px-3 py-1 rounded-full text-sm font-bold">
                        <Check className="h-4 w-4" />
                        Padrão
                      </span>
                    )}
                    <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold capitalize">
                      {address.address_type === 'both' ? 'Entrega & Cobrança' : address.address_type === 'shipping' ? 'Entrega' : 'Cobrança'}
                    </span>
                  </div>

                  <div className="text-gray-600 space-y-1">
                    <p>
                      {address.street}, {address.number}
                      {address.complement && ` - ${address.complement}`}
                    </p>
                    <p>
                      {address.city}, {address.state} - {address.cep}
                    </p>
                    <p className="text-sm text-gray-500">{address.country}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {!address.is_default && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-[#2F7A3E] hover:bg-[#2F7A3E]/10 rounded-lg transition-colors"
                      title="Definir como padrão"
                    >
                      <Check className="h-4 w-4" />
                      Padrão
                    </button>
                  )}

                  <button
                    onClick={() => handleEdit(address)}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="h-4 w-4" />
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(address.id)}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Deletar"
                  >
                    <Trash2 className="h-4 w-4" />
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
