"use client";

import { useAuth } from "@/lib/auth-context";
import { Edit2, Loader2 } from 'lucide-react';
import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AccountPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isNameOpen, setIsNameOpen] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  
  // O Layout já cuida do redirecionamento se não houver user
  if (!user) return null; 

  const currentUser = user;
  const [fullName, setFullName] = useState(currentUser.user_metadata?.full_name || "");
  const [phone, setPhone] = useState(currentUser.user_metadata?.phone || "");

  const handleUpdateName = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      if (error) throw error;
      
      toast.success("Nome atualizado com sucesso!");
      setIsNameOpen(false);
      // Recarregar página para atualizar contexto ou atualizar estado local se possível
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar nome.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePhone = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        data: { phone: phone }
      });

      if (error) throw error;
      
      toast.success("Telefone atualizado com sucesso!");
      setIsPhoneOpen(false);
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar telefone.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#EAEAEA] animate-in fade-in duration-500">
      <div className="pb-6 border-b border-[#E0E0E0]">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2F4F4F]">Meu Perfil</h1>
        <p className="mt-2 text-gray-500">Gerencie suas informações pessoais e de segurança.</p>
      </div>

      <div className="mt-8 space-y-6">
        <div className="grid grid-cols-1 gap-y-6">
          
          {/* Nome */}
          <div className="group">
            <label className="block text-sm font-medium text-[#333333] mb-2">Nome Completo</label>
            <div className="flex items-center justify-between p-4 bg-[#F9F9F9] rounded-lg border border-transparent group-hover:border-[#E0E0E0] transition-colors">
              <p className="text-gray-700 font-medium">
                {user.user_metadata?.full_name || 'Usuário'}
              </p>
              
              <Dialog open={isNameOpen} onOpenChange={setIsNameOpen}>
                <DialogTrigger asChild>
                  <button className="text-sm font-medium text-[#556B2F] hover:underline flex items-center gap-1">
                    <Edit2 className="h-3 w-3" /> Editar
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Nome</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input 
                        id="name" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNameOpen(false)}>Cancelar</Button>
                    <Button onClick={handleUpdateName} disabled={loading} className="bg-[#2F7A3E]">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Email */}
          <div className="group">
            <label className="block text-sm font-medium text-[#333333] mb-2">E-mail</label>
            <div className="flex items-center justify-between p-4 bg-[#F9F9F9] rounded-lg border border-transparent group-hover:border-[#E0E0E0] transition-colors">
              <p className="text-gray-700 font-medium">{user.email}</p>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Verificado</span>
            </div>
          </div>

          {/* Telefone */}
          <div className="group">
            <label className="block text-sm font-medium text-[#333333] mb-2">Telefone</label>
            <div className="flex items-center justify-between p-4 bg-[#F9F9F9] rounded-lg border border-transparent group-hover:border-[#E0E0E0] transition-colors">
              <p className="text-gray-500 italic">
                {currentUser.user_metadata?.phone || "Nenhum telefone cadastrado"}
              </p>
              
              <Dialog open={isPhoneOpen} onOpenChange={setIsPhoneOpen}>
                <DialogTrigger asChild>
                  <button className="text-sm font-bold text-[#556B2F] hover:underline">
                    {currentUser.user_metadata?.phone ? "Alterar" : "Adicionar"}
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{currentUser.user_metadata?.phone ? "Alterar Telefone" : "Adicionar Telefone"}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input 
                        id="phone" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsPhoneOpen(false)}>Cancelar</Button>
                    <Button onClick={handleUpdatePhone} disabled={loading} className="bg-[#2F7A3E]">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* ID Técnico */}
          <div className="pt-4 mt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-mono">ID do Cliente: {user.id}</p>
          </div>

        </div>
      </div>
    </div>
  );
}