'use client';

import { useState } from 'react';
import { useAddresses, Address } from '@/lib/addresses-context';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  
  // Estado inicial
  const [formData, setFormData] = useState({
    label: editingAddress?.label || '',
    name: editingAddress?.name || '',
    address: editingAddress?.address || '',
    number: editingAddress?.number || '',
    complement: editingAddress?.complement || '',
    neighborhood: editingAddress?.neighborhood || '',
    city: editingAddress?.city || '',
    state: editingAddress?.state || '',
    zip_code: editingAddress?.zip_code || '',
    phone: editingAddress?.phone || '',
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
    const cepLength = formData.zip_code.replace(/\D/g, '').length;

    if (!formData.name.trim()) {
        toast.error('Por favor, informe o nome de quem receberá a entrega');
        return false;
    }
    
    if (cepLength !== 8) {
      toast.error('Por favor, preencha o CEP corretamente (8 dígitos)');
      return false;
    }

    if (!formData.address.trim()) {
      toast.error('Por favor, preencha o campo Rua');
      return false;
    }
    if (!formData.number.trim()) {
      toast.error('Por favor, preencha o número');
      return false;
    }
    if (!formData.neighborhood.trim()) {
        toast.error('Por favor, preencha o bairro');
        return false;
    }
    if (!formData.city.trim()) {
      toast.error('Por favor, preencha a cidade');
      return false;
    }
    if (!formData.state) {
      toast.error('Por favor, selecione o estado');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        label: formData.label || 'Casa', // Default label if empty
        name: formData.name,
        address: formData.address,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        phone: formData.phone,
        is_primary: false, 
      };

      if (editingAddress) {
        await updateAddress(editingAddress.id, payload);
      } else {
        await addAddress(payload);
      }
      onClose();
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Erro ao salvar endereço. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // FIX: Fullscreen overlay with solid background to prevent double scrollbar and transparency issues
    // Added animate-in matching other pages
    <div className="fixed inset-0 z-50 bg-[#EBF0EB] dark:bg-[#102214] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
      <div className="min-h-screen w-full flex flex-col p-6 md:p-10">
        <div className="flex flex-col max-w-4xl mx-auto w-full gap-8 pb-10">
            
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#3E5D3E] mb-2">
                    <button 
                        onClick={onClose} 
                        className="hover:underline flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer"
                        type="button"
                    >
                        <span className="material-symbols-outlined text-lg font-normal">arrow_back</span>
                        Voltar para Endereços
                    </button>
                </div>
                <h1 className="text-[#333333] dark:text-[#E0E0E0] text-4xl font-serif font-bold">
                    {editingAddress ? 'Editar Endereço' : 'Novo Endereço'}
                </h1>
                <p className="text-[#333333]/80 dark:text-[#E0E0E0]/80 text-base font-normal leading-normal">
                    Atualize as informações do seu local de entrega.
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-white dark:bg-[#102214]/50 p-8 rounded-xl border border-[#E0E0E0] dark:border-[#3a4d3a] shadow-sm">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    
                    {/* Apelido e Destinatário */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[#333333]/90 dark:text-[#E0E0E0]/90 text-sm font-semibold leading-normal" htmlFor="label">
                                Apelido do Local (Ex: Casa)
                            </label>
                            <input 
                                className="w-full rounded-lg border border-[#E0E0E0] dark:border-[#3a4d3a] bg-[#F9F9F9]/50 dark:bg-[#102214]/30 text-[#333333] dark:text-[#E0E0E0] focus:border-[#3E5D3E] focus:ring-1 focus:ring-[#3E5D3E] h-12 px-4 outline-none transition-all" 
                                id="label" 
                                type="text" 
                                name="label"
                                value={formData.label}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[#333333]/90 dark:text-[#E0E0E0]/90 text-sm font-semibold leading-normal" htmlFor="recipient">
                                Nome do Destinatário
                            </label>
                            <input 
                                className="w-full rounded-lg border border-[#E0E0E0] dark:border-[#3a4d3a] bg-[#F9F9F9]/50 dark:bg-[#102214]/30 text-[#333333] dark:text-[#E0E0E0] focus:border-[#3E5D3E] focus:ring-1 focus:ring-[#3E5D3E] h-12 px-4 outline-none transition-all" 
                                id="recipient" 
                                type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* CEP e Rua */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[#333333]/90 dark:text-[#E0E0E0]/90 text-sm font-semibold leading-normal" htmlFor="cep">
                                CEP
                            </label>
                            <input 
                                className="w-full rounded-lg border border-[#E0E0E0] dark:border-[#3a4d3a] bg-[#F9F9F9]/50 dark:bg-[#102214]/30 text-[#333333] dark:text-[#E0E0E0] focus:border-[#3E5D3E] focus:ring-1 focus:ring-[#3E5D3E] h-12 px-4 outline-none transition-all" 
                                id="cep" 
                                type="text" 
                                name="zip_code"
                                value={formData.zip_code}
                                onChange={handleCEPChange}
                                maxLength={9}
                            />
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-[#333333]/90 dark:text-[#E0E0E0]/90 text-sm font-semibold leading-normal" htmlFor="street">
                                Rua
                            </label>
                            <input 
                                className="w-full rounded-lg border border-[#E0E0E0] dark:border-[#3a4d3a] bg-[#F9F9F9]/50 dark:bg-[#102214]/30 text-[#333333] dark:text-[#E0E0E0] focus:border-[#3E5D3E] focus:ring-1 focus:ring-[#3E5D3E] h-12 px-4 outline-none transition-all" 
                                id="street" 
                                type="text" 
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Número e Complemento */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[#333333]/90 dark:text-[#E0E0E0]/90 text-sm font-semibold leading-normal" htmlFor="number">
                                Número
                            </label>
                            <input 
                                className="w-full rounded-lg border border-[#E0E0E0] dark:border-[#3a4d3a] bg-[#F9F9F9]/50 dark:bg-[#102214]/30 text-[#333333] dark:text-[#E0E0E0] focus:border-[#3E5D3E] focus:ring-1 focus:ring-[#3E5D3E] h-12 px-4 outline-none transition-all" 
                                id="number" 
                                type="text" 
                                name="number"
                                value={formData.number}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-[#333333]/90 dark:text-[#E0E0E0]/90 text-sm font-semibold leading-normal" htmlFor="complement">
                                Complemento (Opcional)
                            </label>
                            <input 
                                className="w-full rounded-lg border border-[#E0E0E0] dark:border-[#3a4d3a] bg-[#F9F9F9]/50 dark:bg-[#102214]/30 text-[#333333] dark:text-[#E0E0E0] focus:border-[#3E5D3E] focus:ring-1 focus:ring-[#3E5D3E] h-12 px-4 outline-none transition-all" 
                                id="complement" 
                                type="text" 
                                name="complement"
                                value={formData.complement}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Bairro, Cidade, Estado */}
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-[#333333]/90 dark:text-[#E0E0E0]/90 text-sm font-semibold leading-normal" htmlFor="neighborhood">
                                Bairro
                            </label>
                            <input 
                                className="w-full rounded-lg border border-[#E0E0E0] dark:border-[#3a4d3a] bg-[#F9F9F9]/50 dark:bg-[#102214]/30 text-[#333333] dark:text-[#E0E0E0] focus:border-[#3E5D3E] focus:ring-1 focus:ring-[#3E5D3E] h-12 px-4 outline-none transition-all" 
                                id="neighborhood" 
                                type="text" 
                                name="neighborhood"
                                value={formData.neighborhood}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-3">
                            <label className="text-[#333333]/90 dark:text-[#E0E0E0]/90 text-sm font-semibold leading-normal" htmlFor="city">
                                Cidade
                            </label>
                            <input 
                                className="w-full rounded-lg border border-[#E0E0E0] dark:border-[#3a4d3a] bg-[#F9F9F9]/50 dark:bg-[#102214]/30 text-[#333333] dark:text-[#E0E0E0] focus:border-[#3E5D3E] focus:ring-1 focus:ring-[#3E5D3E] h-12 px-4 outline-none transition-all" 
                                id="city" 
                                type="text" 
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-1">
                            <label className="text-[#333333]/90 dark:text-[#E0E0E0]/90 text-sm font-semibold leading-normal" htmlFor="state">
                                Estado
                            </label>
                            <select 
                                className="w-full rounded-lg border border-[#E0E0E0] dark:border-[#3a4d3a] bg-[#F9F9F9]/50 dark:bg-[#102214]/30 text-[#333333] dark:text-[#E0E0E0] focus:border-[#3E5D3E] focus:ring-1 focus:ring-[#3E5D3E] h-12 px-4 outline-none cursor-pointer transition-all" 
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                            >
                                <option value="">UF</option>
                                {BRAZILIAN_STATES.map((state) => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Telefone */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[#333333]/90 dark:text-[#E0E0E0]/90 text-sm font-semibold leading-normal" htmlFor="phone">
                            Telefone
                        </label>
                        <input 
                            className="w-full rounded-lg border border-[#E0E0E0] dark:border-[#3a4d3a] bg-[#F9F9F9]/50 dark:bg-[#102214]/30 text-[#333333] dark:text-[#E0E0E0] focus:border-[#3E5D3E] focus:ring-1 focus:ring-[#3E5D3E] h-12 px-4 outline-none transition-all" 
                            id="phone" 
                            type="text" 
                            name="phone"
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            maxLength={15}
                        />
                    </div>

                    {/* Botões */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-[#E0E0E0] dark:border-[#3a4d3a] mt-2">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-lg border border-[#E0E0E0] text-[#333333] dark:text-[#E0E0E0] dark:border-[#3a4d3a] font-medium hover:bg-white dark:hover:bg-white/5 transition-colors h-12"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="flex items-center justify-center gap-2 rounded-lg bg-[#3E5D3E] px-8 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-[#3E5D3E]/90 focus:outline-none focus:ring-2 focus:ring-[#3E5D3E] focus:ring-offset-2 h-12 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      </div>
      
      {/* Import Material Symbols for the arrow icon - only needed if not already in layout */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
    </div>
  );
}