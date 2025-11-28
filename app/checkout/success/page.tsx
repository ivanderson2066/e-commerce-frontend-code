"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
// Corrected import: useSearchParams and useRouter are now in next/navigation
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Home, Loader2, Clock, XCircle } from "lucide-react";
import { useCart } from "@/lib/cart-context";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // O Mercado Pago envia 'external_reference' (nosso orderId) ou nós mandamos ?order=...
  const orderId = searchParams.get("order") || searchParams.get("external_reference");
  
  const [status, setStatus] = useState<string>("loading"); // loading, paid, pending, error
  const [loadingText, setLoadingText] = useState("Verificando pagamento...");
  const { clearCart } = useCart();

  useEffect(() => {
    if (orderId) {
      // Limpa o carrinho pois o pedido foi feito
      clearCart();
      
      // Inicia a sincronização
      syncStatus(orderId);
    } else {
      setStatus("error");
    }
  }, [orderId]);

  const syncStatus = async (id: string) => {
    try {
      // Chama nossa rota de Backend que verifica no Mercado Pago
      const response = await fetch('/api/orders/sync-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id })
      });

      const data = await response.json();

      if (data.status === 'paid' || data.status === 'approved') {
        setStatus("paid");
      } else {
        setStatus("pending");
      }
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
      setStatus("pending"); // Assume pendente em caso de erro de rede
    }
  };

  if (!orderId || status === "error") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-stone-900">Pedido não encontrado</h1>
        <Button asChild className="mt-6 bg-emerald-700 hover:bg-emerald-800 text-white">
          <Link href="/">Voltar para a Loja</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-stone-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 max-w-md w-full text-center animate-in fade-in zoom-in duration-500">
        
        {status === "loading" && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-16 w-16 text-emerald-600 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-stone-800">{loadingText}</h2>
            <p className="text-stone-500 mt-2">Aguarde um momento...</p>
          </div>
        )}

        {status === "paid" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-6">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-serif font-bold text-stone-800 mb-2">
              Pagamento Confirmado!
            </h1>
            <p className="text-stone-600 mb-6">
              Obrigado por sua compra. Seu pedido <strong>#{orderId}</strong> já está sendo preparado.
            </p>
            <div className="space-y-3">
                <Button asChild className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-full h-12">
                    <Link href="/account/orders">Ver Meus Pedidos</Link>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-full h-12">
                    <Link href="/">Continuar Comprando</Link>
                </Button>
            </div>
          </>
        )}

        {status === "pending" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-yellow-100 p-6">
                <Clock className="h-16 w-16 text-yellow-600" />
              </div>
            </div>
            <h1 className="text-2xl font-serif font-bold text-stone-800 mb-2">
              Pagamento em Processamento
            </h1>
            <p className="text-stone-600 mb-6">
              Recebemos seu pedido <strong>#{orderId}</strong>. Estamos aguardando a confirmação do banco.
            </p>
            <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800 mb-6 text-left">
                <p><strong>Nota:</strong> Se você pagou via PIX, a confirmação costuma ser imediata. Se pagou via Boleto, pode levar até 2 dias úteis.</p>
            </div>
            <div className="space-y-3">
                <Button 
                    onClick={() => syncStatus(orderId || "")} 
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-full h-12"
                >
                    Atualizar Status Agora
                </Button>
                <Button asChild variant="outline" className="w-full rounded-full h-12">
                    <Link href="/account/orders">Ver Meus Pedidos</Link>
                </Button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <SuccessContent />
    </Suspense>
  );
}