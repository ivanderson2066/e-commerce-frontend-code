"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Leaf } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // O redirectTo aponta para uma rota que vamos criar para processar a troca
      // Lembre-se de configurar a URL do site no Painel do Supabase > Auth > URL Configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/account/update-password`,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      toast.success("Link de recuperação enviado!");
    } catch (error: any) {
      console.error("Erro reset:", error);
      toast.error(error.message || "Erro ao enviar email. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#f9f9f9] p-4 text-[#333333]">
      
      {/* HEADER */}
      <header className="absolute top-0 flex w-full max-w-5xl items-center justify-center p-6 sm:p-8">
        <Link href="/" className="flex items-center gap-3 text-[#333333] hover:opacity-80 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center text-[#2D5A4B]">
             <Leaf className="h-full w-full" />
          </div>
          <h2 className="text-xl font-bold font-serif tracking-wide">Caiçara Mix</h2>
        </Link>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex w-full max-w-md flex-col items-center z-10">
        <div className="w-full rounded-xl bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.05)] border border-[#e0e0e0]">
          
          <div className="text-center">
            <h1 className="font-serif text-[28px] font-bold leading-tight text-[#333333]">
              Recuperar Senha
            </h1>
            <p className="mt-2 text-base text-[#333333]/80">
              {success 
                ? "Verifique sua caixa de entrada (e spam)."
                : "Digite seu e-mail para receber um link de recuperação."
              }
            </p>
          </div>

          {success ? (
            <div className="mt-8 flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
                <div className="rounded-lg bg-green-50 p-4 text-center text-sm text-[#2D5A4B] border border-green-100">
                    <p className="font-semibold">Email enviado com sucesso!</p>
                    <p className="mt-1">Se o email <strong>{email}</strong> estiver cadastrado, você receberá as instruções em instantes.</p>
                </div>
                <Link href="/login">
                    <button className="flex h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-[#2D5A4B] text-white text-base font-bold tracking-wide transition-opacity hover:opacity-90 mt-4">
                        Voltar para Login
                    </button>
                </Link>
            </div>
          ) : (
            <form onSubmit={handleRecover} className="mt-8 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                <label 
                    htmlFor="email" 
                    className="text-sm font-medium text-[#333333]"
                >
                    Endereço de e-mail
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="h-12 w-full rounded-lg border border-[#e0e0e0] bg-transparent px-4 text-base placeholder:text-[#333333]/50 focus:border-[#2D5A4B] focus:outline-none focus:ring-2 focus:ring-[#2D5A4B]/20 transition-all"
                />
                </div>

                <button 
                    type="submit"
                    disabled={loading}
                    className="flex h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-[#2D5A4B] text-white text-base font-bold tracking-wide transition-all hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <span>Enviar Link de Recuperação</span>
                )}
                </button>
            </form>
          )}

          {!success && (
            <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-[#2D5A4B] hover:underline font-medium flex items-center justify-center gap-1">
                   <ArrowLeft className="h-3 w-3" /> Lembrou a senha? Voltar
                </Link>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="absolute bottom-0 w-full p-6 text-center">
        <p className="text-sm text-[#333333]/60">© 2024 Caiçara Mix</p>
      </footer>
    </div>
  );
}