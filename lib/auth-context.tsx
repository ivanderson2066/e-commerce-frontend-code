"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase-client";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

// Mantendo sua interface User personalizada
export interface User {
  id: string;
  email?: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isAdmin: boolean; // Adicionado para suportar a lógica do painel Admin
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // Estado necessário para UI de Admin
  const router = useRouter();

  // Função auxiliar para verificar Admin (Lógica mantida para segurança)
  const checkIsAdmin = (currentUser: SupabaseUser | null) => {
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }
    
    // Verifica metadados (onde injetamos a role via SQL ou via Auth)
    const appMeta = currentUser.app_metadata || {};
    const userMeta = currentUser.user_metadata || {};

    // Verifica se é admin em qualquer um dos locais possíveis
    const hasAdminRole = 
      appMeta.role === 'admin' || 
      appMeta.admin === true || 
      userMeta.role === 'admin';
    
    setIsAdmin(hasAdminRole);
  };

  useEffect(() => {
    // Verificar sessão atual
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          role: session.user.user_metadata?.role || 'user',
        });
        checkIsAdmin(session.user);
      }
      setIsLoading(false);
    };

    fetchSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          role: session.user.user_metadata?.role || 'user',
        });
        checkIsAdmin(session.user);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: 'user', // Default role
        },
      },
    });

    if (error) {
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    router.push("/login");
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        isLoggedIn: !!user, 
        isLoading, 
        isAdmin, // Exportando para uso na Navbar e rotas protegidas
        login, 
        register, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}