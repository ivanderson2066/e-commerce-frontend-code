'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth-context';
import { supabase } from './supabase-client';
import { toast } from 'sonner';

export interface Address {
  id: string;
  user_id: string;
  name: string;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  cep: string;
  country: string;
  is_default: boolean;
  address_type: 'shipping' | 'billing' | 'both';
  created_at: string;
  updated_at: string;
}

interface AddressesContextType {
  addresses: Address[];
  defaultAddress: Address | null;
  loading: boolean;
  addAddress: (
    address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => Promise<Address | null>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<Address | null>;
  deleteAddress: (id: string) => Promise<boolean>;
  setDefaultAddress: (id: string) => Promise<boolean>;
  loadAddresses: () => Promise<void>;
}

const AddressesContext = createContext<AddressesContextType | undefined>(undefined);

export function AddressesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);

  // Load addresses when user authenticates
  useEffect(() => {
    if (user?.id) {
      loadAddresses();
    } else {
      setAddresses([]);
    }
  }, [user?.id]);

  const loadAddresses = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Sort by is_default in memory if available
      const sorted = data
        ? [...data].sort((a: any, b: any) => {
            if (a.is_default === b.is_default) return 0;
            return a.is_default ? -1 : 1;
          })
        : [];

      setAddresses((sorted as Address[]) || []);
    } catch (error: any) {
      console.error('Error loading addresses:', error?.message || error);
      toast.error('Erro ao carregar endereços');
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (
    address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    if (!user?.id) {
      toast.error('Faça login para adicionar endereços');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert([
          {
            user_id: user.id,
            ...address,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setAddresses([...addresses, data]);
      toast.success('Endereço adicionado com sucesso!');
      return data;
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Erro ao adicionar endereço');
      return null;
    }
  };

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    if (!user?.id) {
      toast.error('Faça login para editar endereços');
      return null;
    }

    try {
      // Remove user_id and timestamps from updates
      const { user_id, created_at, updated_at, ...safeUpdates } = updates as any;

      const { data, error } = await supabase
        .from('addresses')
        .update(safeUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setAddresses(addresses.map((addr) => (addr.id === id ? data : addr)));
      toast.success('Endereço atualizado com sucesso!');
      return data;
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Erro ao atualizar endereço');
      return null;
    }
  };

  const deleteAddress = async (id: string) => {
    if (!user?.id) {
      toast.error('Faça login para deletar endereços');
      return false;
    }

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setAddresses(addresses.filter((addr) => addr.id !== id));
      toast.success('Endereço removido com sucesso!');
      return true;
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Erro ao remover endereço');
      return false;
    }
  };

  const setDefaultAddress = async (id: string) => {
    if (!user?.id) {
      toast.error('Faça login para definir endereço padrão');
      return false;
    }

    try {
      // Remove default from all addresses
      const { error: unsetError } = await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      if (unsetError) throw unsetError;

      // Set new default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setAddresses(
        addresses.map((addr) => ({
          ...addr,
          is_default: addr.id === id,
        }))
      );

      toast.success('Endereço padrão definido!');
      return true;
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Erro ao definir endereço padrão');
      return false;
    }
  };

  const defaultAddress = addresses.find((addr) => addr.is_default) || addresses[0] || null;

  return (
    <AddressesContext.Provider
      value={{
        addresses,
        defaultAddress,
        loading,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        loadAddresses,
      }}
    >
      {children}
    </AddressesContext.Provider>
  );
}

export function useAddresses() {
  const context = useContext(AddressesContext);
  if (context === undefined) {
    throw new Error('useAddresses must be used within AddressesProvider');
  }
  return context;
}
