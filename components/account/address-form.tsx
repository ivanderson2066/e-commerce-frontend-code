'use client';

import { useState } from 'react';
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
  
  // Estado inicial alinhado com o banco de dados
  const [formData, setFormData] = useState({
    label: editingAddress?.label || '',       // Ex: "Casa" (antigo 'name' no seu form)
    name: editingAddress?.name || '',         // Novo: Nome do Destinatário (quem recebe)
    address: editingAddress?.address || '',   // Ex: Rua (antigo 'street')
    number: editingAddress?.number || '',
    complement: editingAddress?.complement || '',
    neighborhood: editingAddress?.neighborhood || '', // Novo: Obrigatório no banco
    city: editingAddress?.city || '',
    state: editingAddress?.state || '',
    zip_code: editingAddress?.zip_code || '', // Antigo 'cep'
    phone: editingAddress?.phone || '',       // Novo: Obrigatório no banco
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
        return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.slice(0, 11).replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setFormData((prev) => ({ ...prev, zip_code: formatted }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formatted }));
  };

  const validateForm = () => {
    if (!formData.label.trim()) {
      alert('Por favor, dê um nome para este endereço (ex: Casa)');
      return false;
    }
    if (!formData.name.trim()) {
        alert('Por favor, informe o nome de quem receberá a entrega');
        return false;
    }
    if (!formData.address.trim()) {
      alert('Por favor, preencha o campo Rua');
      return false;
    }
    if (!formData.number.trim()) {
      alert('Por favor, preencha o número');
      return false;
    }
    if (!formData.neighborhood.trim()) {
        alert('Por favor, preencha o bairro');
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
    if (formData.zip_code.replace(/\D/g, '').length !== 8) {
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
      // Objeto preparado para o banco de dados
      const payload = {
        label: formData.label,
        name: formData.name,
        address: formData.address,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        phone: formData.phone,
        is_primary: false, // Default
      };

      if (editingAddress) {
        await updateAddress(editingAddress.id, payload);
      } else {
        await addAddress(payload);
      }
      onClose();
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Erro ao salvar endereço. Verifique o console.');
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Label (Apelido do Endereço) */}
            <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                Apelido do Local *
                </label>
                <input
                type="text"
                name="label"
                value={formData.label}
                onChange={handleChange}
                placeholder="Ex: Minha Casa, Trabalho"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-[#2F7A3E] focus:ring-1 focus:ring-[#2F7A3E]"
                />
            </div>

            {/* Nome do Destinatário */}
            <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                Nome do Destinatário *
                </label>
                <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Quem vai receber?"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-[#2F7A3E] focus:ring-1 focus:ring-[#2F7A3E]"
                />
            </div>
          </div>

          {/* CEP & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                CEP *
                </label>
                <input
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleCEPChange}
                placeholder="00000-000"
                maxLength={9}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-[#2F7A3E] focus:ring-1 focus:ring-[#2F7A3E]"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                Telefone de Contato *
                </label>
                <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                maxLength={15}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-[#2F7A3E] focus:ring-1 focus:ring-[#2F7A3E]"
                />
            </div>
          </div>

          {/* Address (Rua) */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Rua/Avenida *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Ex: Rua das Flores"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-[#2F7A3E] focus:ring-1 focus:ring-[#2F7A3E]"
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
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-[#2F7A3E] focus:ring-1 focus:ring-[#2F7A3E]"
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
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-[#2F7A3E] focus:ring-1 focus:ring-[#2F7A3E]"
              />
            </div>
          </div>

          {/* Neighborhood (Bairro) */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Bairro *
            </label>
            <input
              type="text"
              name="neighborhood"
              value={formData.neighborhood}
              onChange={handleChange}
              placeholder="Ex: Centro"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-[#2F7A3E] focus:ring-1 focus:ring-[#2F7A3E]"
            />
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
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-[#2F7A3E] focus:ring-1 focus:ring-[#2F7A3E]"
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
                <option value="">UF</option>
                {BRAZILIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
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