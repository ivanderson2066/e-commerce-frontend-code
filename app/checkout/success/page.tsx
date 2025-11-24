"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, Package, Home, Loader2 } from "lucide-react";

// Componente interno que usa useSearchParams
function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!orderId) {
      // Se não tiver ID, volta pra home depois de um tempo ou mostra erro
      // router.push("/"); 
    }
  }, [orderId, router]);

  if (!mounted) return null;

  if (!orderId) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Pedido não encontrado</h1>
        <Button asChild>
          <Link href="/">Voltar para a Loja</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center animate-in fade-in zoom-in duration-500">
      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-green-100 p-6">
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>
      </div>
      
      <h1 className="text-3xl font-serif font-bold text-stone-800 mb-2">
        Pedido Confirmado!
      </h1>
      <p className="text-stone-600 mb-8 text-lg">
        Obrigado por sua compra. Seu pedido <span className="font-bold text-stone-900">#{orderId}</span> foi recebido com sucesso.
      </p>

      <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm max-w-md mx-auto mb-8 text-left">
        <h3 className="font-bold text-stone-800 mb-2 flex items-center gap-2">
          <Package className="h-5 w-5 text-emerald-600" /> Próximos Passos
        </h3>
        <ul className="text-sm text-stone-600 space-y-2 list-disc list-inside">
          <li>Você receberá um e-mail de confirmação.</li>
          <li>Enviaremos o código de rastreio assim que postado.</li>
          <li>Você pode acompanhar o status em "Meus Pedidos".</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-6 text-base rounded-full">
          <Link href="/account/orders">Acompanhar Pedido</Link>
        </Button>
        <Button asChild variant="outline" className="border-emerald-200 text-emerald-800 hover:bg-emerald-50 px-8 py-6 text-base rounded-full">
          <Link href="/">
             <Home className="mr-2 h-5 w-5" /> Voltar para a Loja
          </Link>
        </Button>
      </div>
    </div>
  );
}

// Componente da Página Principal (com Suspense)
export default function SuccessPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-stone-50">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-stone-500">Carregando confirmação...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}