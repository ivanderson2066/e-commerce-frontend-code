"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, RefreshCw, XCircle, ShoppingBag, Clock, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Pega dados da URL (retorno do Mercado Pago)
  const orderId = searchParams.get("order") || searchParams.get("external_reference");
  const paymentId = searchParams.get("payment_id") || searchParams.get("collection_id");
  const statusParam = searchParams.get("status") || searchParams.get("collection_status");

  const [status, setStatus] = useState("loading"); // 'loading' | 'paid' | 'pending' | 'error'
  const { clearCart } = useCart();
  
  // Controle de Polling
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const attempts = useRef(0);

  // 1. Lógica Inicial Inteligente
  useEffect(() => {
    if (!orderId) {
        setStatus("error");
        return;
    }

    // Limpa carrinho se tivermos um número de pedido (indica sucesso na criação)
    clearCart();

    // Se a URL já diz o status, usamos isso para renderizar a UI imediatamente
    if (statusParam === 'approved') {
        setStatus('paid');
        // Mesmo pago, fazemos um sync para garantir que o banco atualize
        syncOrder(orderId, paymentId);
    } else {
        // Se voltou do MP como Pendente ou sem status, iniciamos o polling imediatamente
        setStatus('pending');
        startPolling(orderId, paymentId);
    }

    return () => stopPolling();
  }, [orderId, paymentId, statusParam]);

  const startPolling = (oId: string, pId: string | null) => {
      stopPolling();
      // Verifica imediatamente
      checkStatus(oId, pId);
      // E depois a cada 3s
      pollingRef.current = setInterval(() => checkStatus(oId, pId), 3000); 
  };

  const stopPolling = () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
  };

  const syncOrder = async (oId: string, pId: string | null) => {
      try {
        await fetch('/api/orders/sync-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: oId, paymentId: pId })
        });
      } catch (e) { console.error(e); }
  };

  const checkStatus = async (oId: string, pId: string | null) => {
    attempts.current++;
    
    try {
        // AQUI ESTAVA O ERRO: Faltava o header Content-Type
        const res = await fetch('/api/orders/sync-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // CORREÇÃO CRÍTICA
            body: JSON.stringify({ orderId: oId, paymentId: pId })
        });
        
        const data = await res.json();
        
        if (data.status === 'paid' || data.status === 'approved') {
            setStatus("paid");
            toast.success("Pagamento confirmado!");
            stopPolling();
        } else {
            // Se ainda não pagou, mantém pending
            if (status === 'loading') setStatus("pending");
            
            // Para o polling automático após 60s para não gastar recursos
            if (attempts.current > 20) stopPolling();
        }
    } catch (e) { 
        console.error(e); 
        // Se der erro de rede, tenta de novo na próxima rodada sem mudar a UI
    }
  };

  // Renderização de Erro
  if (status === 'error' || !orderId) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-stone-50">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-stone-800">Pedido não encontrado</h1>
        <Button asChild className="mt-6 bg-emerald-700 text-white hover:bg-emerald-800 rounded-full px-8">
            <Link href="/">Voltar para a Loja</Link>
        </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 text-center max-w-md w-full animate-in fade-in zoom-in duration-300">
        
        {/* ESTADO: CARREGANDO (Apenas inicial curto) */}
        {status === 'loading' && (
            <div className="py-10">
                <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mx-auto mb-4"/>
                <h2 className="text-xl font-bold text-stone-700">Verificando pagamento...</h2>
            </div>
        )}

        {/* ESTADO: PAGO (Sucesso) */}
        {status === 'paid' && (
            <div>
                <div className="flex justify-center mb-6">
                    <div className="rounded-full bg-green-100 p-4 shadow-inner">
                        <CheckCircle className="w-16 h-16 text-green-600"/>
                    </div>
                </div>
                <h1 className="text-2xl font-serif font-bold text-stone-800 mb-2">Pagamento Confirmado!</h1>
                <p className="text-gray-600 mb-8 text-sm">
                    Obrigado! O pedido <span className="font-bold text-emerald-700">#{orderId}</span> foi aprovado.
                </p>
                <div className="space-y-3">
                    <Button asChild className="w-full bg-emerald-700 hover:bg-emerald-800 text-white h-12 rounded-full text-base font-medium">
                        <Link href="/account/orders">Acompanhar Entrega</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full h-12 rounded-full border-stone-200">
                        <Link href="/">Continuar Comprando</Link>
                    </Button>
                </div>
            </div>
        )}

        {/* ESTADO: PENDENTE (Quando volta do MP sem pagar ou processando) */}
        {status === 'pending' && (
            <div>
                <div className="flex justify-center mb-6">
                    <div className="rounded-full bg-amber-100 p-4 shadow-inner">
                        <Clock className="w-16 h-16 text-amber-600"/>
                    </div>
                </div>
                <h1 className="text-2xl font-serif font-bold text-stone-800 mb-2">Estamos quase lá!</h1>
                <p className="text-stone-600 mb-6 text-sm px-2">
                    O pedido <strong>#{orderId}</strong> foi recebido. Estamos apenas aguardando a confirmação final do banco.
                </p>
                
                {/* Aviso informativo */}
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-6 text-xs text-amber-800 text-left flex items-start gap-3">
                    <Loader2 className="h-4 w-4 animate-spin shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">Verificando automaticamente...</p>
                        <p className="mt-1">Se você já pagou no app do banco, aguarde alguns segundos nesta tela.</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button 
                        onClick={() => checkStatus(orderId, paymentId)} 
                        variant="outline" 
                        className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-11"
                    >
                        <RefreshCw className="w-4 h-4 mr-2"/> Verificar Agora
                    </Button>
                    
                    <Button asChild className="w-full bg-stone-900 hover:bg-stone-800 text-white h-12 rounded-full">
                        <Link href="/account/orders">
                            Ver em Meus Pedidos <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </Button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-stone-50">Carregando...</div>}>
      <SuccessContent />
    </Suspense>
  );
}