'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth-context';
import { supabase } from './supabase-client';
import { toast } from 'sonner';

interface FavoritesContextType {
  favorites: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string, productName?: string) => Promise<void>;
  addFavorite: (productId: string, productName?: string) => Promise<void>;
  removeFavorite: (productId: string) => Promise<void>;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar favoritos ao montar ou quando o usuário muda
  useEffect(() => {
    if (user?.id) {
      loadFavorites();
    } else {
      // Para usuários não logados, carregar do localStorage
      const saved = localStorage.getItem('favorites');
      if (saved) {
        try {
          setFavorites(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading favorites from localStorage:', error);
        }
      }
    }
  }, [user?.id]);

  // Salvar em localStorage quando mudar (para usuários não logados)
  useEffect(() => {
    if (!user?.id) {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }, [favorites, user?.id]);

  const loadFavorites = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const favoriteIds = data?.map((fav) => fav.product_id) || [];
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (productId: string) => {
    return favorites.includes(productId);
  };

  const addFavorite = async (productId: string, productName: string = '') => {
    if (!user?.id) {
      // Para usuários não logados, apenas add ao localStorage
      if (!favorites.includes(productId)) {
        setFavorites([...favorites, productId]);
      }
      return;
    }

    try {
      const { error } = await supabase.from('favorites').insert([
        {
          user_id: user.id,
          product_id: productId,
        },
      ]);

      if (error) {
        if (error.code === '23505') {
          // Favorite already exists
          return;
        }
        throw error;
      }

      if (!favorites.includes(productId)) {
        setFavorites([...favorites, productId]);
      }
      toast.success(`${productName || 'Produto'} adicionado aos favoritos!`);
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast.error('Erro ao adicionar favorito');
    }
  };

  const removeFavorite = async (productId: string) => {
    if (!user?.id) {
      // Para usuários não logados, apenas remove do localStorage
      setFavorites(favorites.filter((id) => id !== productId));
      return;
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      setFavorites(favorites.filter((id) => id !== productId));
      toast.success('Removido dos favoritos!');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Erro ao remover favorito');
    }
  };

  const toggleFavorite = async (productId: string, productName: string = '') => {
    if (isFavorite(productId)) {
      await removeFavorite(productId);
    } else {
      await addFavorite(productId, productName);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        addFavorite,
        removeFavorite,
        loading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}
