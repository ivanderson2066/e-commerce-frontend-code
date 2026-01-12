'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

// Tipagem exata conforme sua tabela 'public.addresses'
export type Address = {
  id: string;
  user_id: string;
  label: string;        // Ex: "Minha Casa"
  name: string;         // Nome do destinatário
  address: string;      // Rua/Logradouro (no banco é 'address', não 'street')
  number: string;
  complement?: string;
  neighborhood: string; // Bairro
  city: string;
  state: string;
  zip_code: string;     // CEP (no banco é 'zip_code', não 'cep')
  phone: string;        // Telefone
  is_primary: boolean;  // Padrão (no banco é 'is_primary', não 'is_default')
  created_at?: string;
};

type AddressesContextType = {
  addresses: Address[];
  loading: boolean;
  addAddress: (address: Omit<Address, 'id' | 'created_at' | 'user_id'>) => Promise<Address | null>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  refreshAddresses: () => Promise<void>;
};

const AddressesContext = createContext<AddressesContextType | undefined>(undefined);

export function AddressesProvider({ children }: { children: React.ReactNode }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAddresses = async () => {
    if (!user) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false }) // Endereço padrão primeiro
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const addAddress = async (addressData: Omit<Address, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) {
      toast.error("Faça login para adicionar endereços");
      return null;
    }

    try {
      // Se for o primeiro endereço da lista, forçamos ser o primário
      const isFirstAddress = addresses.length === 0;
      
      const payload = {
        ...addressData,
        user_id: user.id, // Injeta o ID do usuário logado
        is_primary: isFirstAddress ? true : (addressData.is_primary || false)
      };

      const { data, error } = await supabase
        .from('addresses')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      // Atualiza estado local
      setAddresses((prev) => {
        const newList = [data, ...prev];
        return newList.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
      });
      
      toast.success("Endereço adicionado com sucesso!");
      return data;
    } catch (error: any) {
      console.error('Error adding address:', error);
      toast.error(error.message || "Erro ao salvar endereço.");
      return null;
    }
  };

  const updateAddress = async (id: string, addressUpdate: Partial<Address>) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .update(addressUpdate)
        .eq('id', id);

      if (error) throw error;

      setAddresses((prev) =>
        prev.map((addr) => (addr.id === id ? { ...addr, ...addressUpdate } : addr))
      );
      
      toast.success("Endereço atualizado.");
    } catch (error: any) {
      console.error('Error updating address:', error);
      toast.error("Erro ao atualizar endereço.");
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', id);

      if (error) throw error;

      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
      toast.success("Endereço removido.");
    } catch (error: any) {
      console.error('Error deleting address:', error);
      toast.error("Erro ao remover endereço.");
    }
  };

  const setDefaultAddress = async (id: string) => {
    if (!user) return;

    // Atualização Otimista (UI primeiro)
    const previousAddresses = [...addresses];
    setAddresses((prev) => 
        prev.map(addr => ({
            ...addr,
            is_primary: addr.id === id
        })).sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
    );

    try {
      // 1. Remove is_primary de todos os endereços do usuário (exceto o que estamos ativando, por segurança)
      await supabase
        .from('addresses')
        .update({ is_primary: false })
        .eq('user_id', user.id)
        .neq('id', id);

      // 2. Define o endereço escolhido como is_primary
      const { error } = await supabase
        .from('addresses')
        .update({ is_primary: true })
        .eq('id', id);

      if (error) throw error;

      toast.success("Endereço padrão definido.");
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error("Erro ao definir padrão.");
      setAddresses(previousAddresses); // Reverte se der erro
    }
  };

  return (
    <AddressesContext.Provider
      value={{
        addresses,
        loading,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        refreshAddresses: fetchAddresses,
      }}
    >
      {children}
    </AddressesContext.Provider>
  );
}

export const useAddresses = () => {
  const context = useContext(AddressesContext);
  if (context === undefined) {
    throw new Error('useAddresses must be used within an AddressesProvider');
  }
  return context;
};