'use client';

import { useState, useEffect } from 'react';
import { useAddresses, Address } from '@/lib/addresses-context';
import { X, Loader2 } from 'lucide-react';

interface AddressFormProps {
  editingAddress?: Address | null;
  onClose: () => void;
}

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function AddressForm({ editingAddress, onClose }: AddressFormProps) {
  const { addAddress, updateAddress } = useAddresses();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: editingAddress?.name || '',
    street: editingAddress?.street || '',
    number: editingAddress?.number || '',
    complement: editingAddress?.complement || '',
    city: editingAddress?.city || '',
    state: editingAddress?.state || '',
    cep: editingAddress?.cep || '',
    address_type: (editingAddress?.address_type || 'shipping') as 'shipping' | 'billing' | 'both',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setFormData((prev) => ({ ...prev, cep: formatted }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert('Por favor, dê um nome para este endereço');
      return false;
    }
    if (!formData.street.trim()) {
      alert('Por favor, preenchja o campo Rua');
      return false;
    }
    if (!formData.number.trim()) {
      alert('Por favor, preencha o número');
      return false;
    }
    if (!formData.city.trim()) {
      alert('Por favor, preencha a cidade');
      return false;
    }
    if (!formData.state) {
      alert('Por favor, selecione o estado');
      return false;
    }
    if (formData.cep.replace(/\D/g, '').length !== 8) {
      alert('Por favor, preencha o CEP corretamente (8 dígitos)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, formData);
      } else {
        await addAddress({
          ...formData,
          country: 'Brasil',
          is_default: false,
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold text-[#374151]">
            {editingAddress ? 'Editar Endereço' : 'Novo Endereço'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Nome do Endereço *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Casa, Trabalho, etc"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-[#2F7A3E] focus:ring-1 focus:ring-[#2F7A3E]"
            />
          </div>

          {/* Street */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Rua/Avenida *
            </label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="Ex: Rua das Flores"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-[#2F7A3E] focus:ring-1 focus:ring-[#2F7A3E]"
            />
          </div>

          {/* Number and Complement */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Número *
              </label>
              <input
                type="text"
                name="number"
                value={formData.number}
                onChange={handleChange}
                placeholder="123"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-[#2F7A3E] focus:ring-1 focus:ring-[#2F7A3E]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Complemento
              </label>
              <input
                type="text"
                name="complement"
                value={formData.complement}
                onChange={handleChange}
                placeholder="Apto, sala, etc (opcional)"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-[#2F7A3E] focus:ring-1 focus:ring-[#2F7A3E]"
              />
            </div>
          </div>

          {/* City and State */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Cidade *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="São Paulo"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-[#2F7A3E] focus:ring-1 focus:ring-[#2F7A3E]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Estado *
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-[#2F7A3E] focus:ring-1 focus:ring-[#2F7A3E]"
              >
                <option value="">Selecione</option>
                {BRAZILIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CEP */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">
              CEP *
            </label>
            <input
              type="text"
              name="cep"
              value={formData.cep}
              onChange={handleCEPChange}
              placeholder="12345-678"
              maxLength="9"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-[#2F7A3E] focus:ring-1 focus:ring-[#2F7A3E]"
            />
          </div>

          {/* Address Type */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Tipo de Endereço
            </label>
            <select
              name="address_type"
              value={formData.address_type}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-[#2F7A3E] focus:ring-1 focus:ring-[#2F7A3E]"
            >
              <option value="shipping">Entrega</option>
              <option value="billing">Cobrança</option>
              <option value="both">Entrega e Cobrança</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-[#2F7A3E] hover:bg-[#266332] disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-bold transition-all"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {editingAddress ? 'Atualizar Endereço' : 'Adicionar Endereço'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-bold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
