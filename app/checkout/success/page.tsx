"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Home, Loader2, Clock, XCircle, RefreshCw } from "lucide-react";
import { useCart } from "@/lib/cart-context";

function SuccessContent() {
  const searchParams = useSearchParams();
  
  // Captura identificadores da URL
  const orderId = searchParams.get("order") || searchParams.get("external_reference");
  // O Mercado Pago retorna 'collection_id' ou 'payment_id'
  const urlPaymentId = searchParams.get("payment_id") || searchParams.get("collection_id");
  
  const [status, setStatus] = useState<string>("loading"); 
  const [loadingText, setLoadingText] = useState("A confirmar pagamento...");
  const { clearCart } = useCart();
  
  // Refs para controlar o polling
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const attempts = useRef(0);
  const MAX_ATTEMPTS = 30; // Aumentado para 90s (30 * 3s) para dar tempo do PIX

  useEffect(() => {
    if (orderId) {
      clearCart();
      
      // Primeira verificação imediata passando o ID que veio na URL
      checkStatus(orderId, urlPaymentId);

      // Inicia Polling (verifica a cada 3 segundos)
      pollingInterval.current = setInterval(() => {
        checkStatus(orderId, urlPaymentId);
      }, 3000);
    } else {
      setStatus("error");
    }

    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [orderId, urlPaymentId]);

  const checkStatus = async (oId: string, pId: string | null) => {
    try {
      attempts.current += 1;
      
      // Enviamos o pId (Payment ID da URL) para o backend usar caso não tenha no banco
      const response = await fetch('/api/orders/sync-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            orderId: oId,
            paymentId: pId 
        })
      });

      const data = await response.json();

      if (data.status === 'paid' || data.status === 'approved') {
        setStatus("paid");
        setLoadingText("Pagamento confirmado!");
        if (pollingInterval.current) clearInterval(pollingInterval.current);
      } else if (attempts.current >= MAX_ATTEMPTS) {
         setStatus("pending");
         if (pollingInterval.current) clearInterval(pollingInterval.current);
      } else {
         // Se ainda não está pago, mantemos 'pending' mas continuamos tentando
         // Só mostramos a UI de 'pending' se não estivermos no loading inicial
         if (status !== 'loading') setStatus("pending");
      }
    } catch (error) {
      console.error("Erro ao verificar status:", error);
    }
  };

  const manualRefresh = () => {
      setLoadingText("A verificar novamente...");
      setStatus("loading");
      attempts.current = 0; 
      checkStatus(orderId || "", urlPaymentId);
      
      if (!pollingInterval.current) {
          pollingInterval.current = setInterval(() => checkStatus(orderId || "", urlPaymentId), 3000);
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

  if (status === "loading") {
      return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-stone-50 animate-pulse">
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-stone-100 max-w-md w-full text-center">
                <Loader2 className="h-16 w-16 text-emerald-600 animate-spin mb-6 mx-auto" />
                <h2 className="text-xl font-bold text-stone-800">{loadingText}</h2>
                <p className="text-stone-500 mt-2 text-sm">A comunicar com o banco...</p>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-stone-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 max-w-md w-full text-center animate-in fade-in zoom-in duration-500">
        
        {status === "paid" ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-6 shadow-inner">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-serif font-bold text-stone-800 mb-2">
              Pagamento Confirmado!
            </h1>
            <p className="text-stone-600 mb-6">
              Obrigado! O pedido <strong>#{orderId}</strong> foi processado com sucesso.
            </p>
            <div className="space-y-3">
                <Button asChild className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-full h-12 text-lg">
                    <Link href="/account/orders">Acompanhar Pedido</Link>
                </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-amber-100 p-6 shadow-inner">
                <Clock className="h-16 w-16 text-amber-600" />
              </div>
            </div>
            <h1 className="text-2xl font-serif font-bold text-stone-800 mb-2">
              Aguardando Confirmação
            </h1>
            <p className="text-stone-600 mb-4 text-sm">
              Identificamos o seu pedido <strong>#{orderId}</strong>, mas a confirmação do pagamento ainda não chegou.
            </p>
            
            <div className="bg-amber-50 p-4 rounded-lg text-sm text-amber-900 mb-6 text-left border border-amber-200">
                <div className="flex items-start gap-2">
                    <Loader2 className="h-4 w-4 animate-spin mt-0.5 shrink-0" /> 
                    <div>
                        <strong>A verificar automaticamente...</strong>
                        <p className="mt-1 text-xs text-amber-800">Se já pagou o PIX, aguarde alguns segundos nesta tela.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <Button 
                    onClick={manualRefresh} 
                    variant="secondary"
                    className="w-full rounded-full h-12 gap-2"
                >
                    <RefreshCw className="w-4 h-4" /> Verificar Novamente
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">A carregar...</div>}>
      <SuccessContent />
    </Suspense>
  );
}