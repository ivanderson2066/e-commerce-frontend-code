"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ChevronLeft, Search, User, Shield, Mail, Calendar, Loader2 } from 'lucide-react';
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  last_sign_in?: string;
}

export default function AdminUsersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!authLoading) {
        if (!user || user.role !== "admin") {
             // O template já lida com acesso negado visualmente abaixo
        } else {
            fetchUsers();
        }
    }
  }, [user, authLoading]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Chama a API que criamos no Passo 1
      const res = await fetch('/api/admin/users');
      
      if (!res.ok) throw new Error('Falha ao buscar usuários');
      
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error("Erro ao carregar lista de usuários");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filtro de busca no navegador
  const filteredUsers = users.filter(u => 
    (u.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Acesso Negado</h2>
          <Button onClick={() => router.push("/")} className="mt-4">Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <div className="container mx-auto px-4 py-12">
        
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <Link href="/admin" className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-3xl font-serif font-medium">Gerenciar Usuários</h1>
            </div>
            <div className="text-sm text-muted-foreground font-medium">
                Total: {users.length}
            </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm mb-6">
            <div className="flex items-center gap-2">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Buscar por nome ou email..." 
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </div>

        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-stone-100">
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead>Último Acesso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
                        </div>
                    </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">Nenhum usuário encontrado.</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((userData) => (
                    <TableRow key={userData.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium">{userData.name}</p>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Mail className="h-3 w-3" /> {userData.email}
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            {userData.role === 'admin' ? (
                                <Badge className="bg-emerald-600 hover:bg-emerald-700">
                                    <Shield className="h-3 w-3 mr-1" /> Admin
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-stone-600">Cliente</Badge>
                            )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(userData.created_at).toLocaleDateString('pt-BR')}
                            </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                            {userData.last_sign_in 
                                ? new Date(userData.last_sign_in).toLocaleString('pt-BR') 
                                : 'Nunca acessou'}
                        </TableCell>
                    </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}