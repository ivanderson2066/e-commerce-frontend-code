"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/lib/auth-context";
import { Leaf, Loader2 } from 'lucide-react';
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (tab === 'login') {
        if (!formData.email || !formData.password) {
           toast.error("Preencha todos os campos.");
           setIsLoading(false);
           return;
        }
        await login(formData.email, formData.password);
        toast.success("Bem-vindo de volta!");
        router.push("/");
      } else {
        if (!formData.name || !formData.email || !formData.password) {
            toast.error("Preencha todos os campos obrigatórios.");
            setIsLoading(false);
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error("As senhas não coincidem.");
            setIsLoading(false);
            return;
        }
        await register(formData.name, formData.email, formData.password);
        toast.success("Conta criada com sucesso!");
        router.push("/");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Ocorreu um erro. Verifique seus dados.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 bg-[#F9F9F7] font-sans text-[#333333]">
      
      {/* Header: Logo CENTRALIZADO */}
      <header className="absolute top-0 left-0 w-full p-6 md:p-8 flex justify-center z-10">
        <Link href="/" className="flex items-center gap-3 text-[#3A5A40] hover:opacity-80 transition-opacity group">
            <Leaf className="h-8 w-8 text-[#3A5A40] group-hover:text-[#A3B18A] transition-colors" />
            <h2 className="text-2xl font-bold font-serif leading-tight tracking-[-0.015em]">Caiçara Mix</h2>
        </Link>
      </header>

      {/* Card Principal */}
      <main className="w-full max-w-lg bg-white rounded-xl shadow-lg overflow-hidden z-0 border border-gray-100 mt-12 mb-12 relative">
        <div className="p-8 lg:p-12">
          <div className="text-center mb-10">
            <h1 className="text-[#3A5A40] font-serif text-3xl font-bold leading-tight tracking-[-0.015em] mb-2">
              {tab === 'login' ? 'Bem-vindo(a)' : 'Crie sua conta'}
            </h1>
            <p className="text-gray-600 text-base font-normal leading-normal">
              {tab === 'login' ? 'Faça login ou crie uma conta para começar.' : 'Preencha seus dados para começar.'}
            </p>
          </div>

          {/* Tabs de Navegação */}
          <div className="flex border-b border-gray-200 mb-8">
            <button 
                type="button"
                onClick={() => setTab('login')}
                className={`flex-1 py-3 px-4 text-center font-medium border-b-2 transition-colors focus:outline-none ${
                    tab === 'login' 
                    ? 'border-[#3A5A40] text-[#3A5A40]' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
                Login
            </button>
            <button 
                type="button"
                onClick={() => setTab('register')}
                className={`flex-1 py-3 px-4 text-center font-medium border-b-2 transition-colors focus:outline-none ${
                    tab === 'register' 
                    ? 'border-[#3A5A40] text-[#3A5A40]' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
                Cadastro
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {tab === 'register' && (
                <label className="flex flex-col w-full">
                    <p className="text-[#333333] text-sm font-medium leading-normal pb-2">Nome</p>
                    <input 
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Seu nome completo" 
                        className="flex w-full rounded-lg border border-gray-300 bg-[#F9F9F7] h-12 px-4 text-base focus:border-[#3A5A40] focus:ring-2 focus:ring-[#3A5A40]/50 outline-none transition-all placeholder:text-gray-400"
                    />
                </label>
            )}

            <label className="flex flex-col w-full">
                <p className="text-[#333333] text-sm font-medium leading-normal pb-2">Email</p>
                <input 
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Digite seu email" 
                    className="flex w-full rounded-lg border border-gray-300 bg-[#F9F9F7] h-12 px-4 text-base focus:border-[#3A5A40] focus:ring-2 focus:ring-[#3A5A40]/50 outline-none transition-all placeholder:text-gray-400"
                />
            </label>

            {tab === 'register' && (
                <label className="flex flex-col w-full">
                    <p className="text-[#333333] text-sm font-medium leading-normal pb-2">Telefone</p>
                    <input 
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(XX) XXXXX-XXXX" 
                        className="flex w-full rounded-lg border border-gray-300 bg-[#F9F9F7] h-12 px-4 text-base focus:border-[#3A5A40] focus:ring-2 focus:ring-[#3A5A40]/50 outline-none transition-all placeholder:text-gray-400"
                    />
                </label>
            )}

            {/* Senha */}
            <label className="flex flex-col w-full relative">
                <p className="text-[#333333] text-sm font-medium leading-normal pb-2">Senha</p>
                <div className="relative w-full">
                    <input 
                        name="password"
                        type="password" 
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Digite sua senha" 
                        className="flex w-full rounded-lg border border-gray-300 bg-[#F9F9F7] h-12 px-4 text-base focus:border-[#3A5A40] focus:ring-2 focus:ring-[#3A5A40]/50 outline-none transition-all placeholder:text-gray-400"
                    />
                </div>
            </label>

            {tab === 'register' && (
                <label className="flex flex-col w-full">
                    <p className="text-[#333333] text-sm font-medium leading-normal pb-2">Confirmar senha</p>
                    <input 
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirme sua senha" 
                        className="flex w-full rounded-lg border border-gray-300 bg-[#F9F9F7] h-12 px-4 text-base focus:border-[#3A5A40] focus:ring-2 focus:ring-[#3A5A40]/50 outline-none transition-all placeholder:text-gray-400"
                    />
                </label>
            )}

            {tab === 'login' && (
                <a href="#" className="text-sm text-[#3A5A40] hover:underline text-right -mt-2 font-medium">
                    Esqueci minha senha
                </a>
            )}

            <button 
                type="submit"
                disabled={isLoading}
                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-[#3A5A40] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-opacity-90 transition-colors disabled:opacity-70 mt-2 shadow-md"
            >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (tab === 'login' ? 'Entrar' : 'Criar Conta')}
            </button>

          </form>
        </div>
      </main>

      <footer className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center justify-center text-center z-10">
        <p className="text-gray-500 text-sm">Beleza que vem da natureza.</p>
        <Link href="/" className="text-sm text-[#3A5A40] hover:underline mt-1 font-medium">
            Voltar para a Página Inicial
        </Link>
      </footer>
    </div>
  );
}