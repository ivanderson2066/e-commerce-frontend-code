"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, RefreshCw, XCircle } from "lucide-react";
import { useCart } from "@/lib/cart-context";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Pega TODOS os IDs possíveis que o MP pode mandar
  const orderId = searchParams.get("order") || searchParams.get("external_reference");
  const paymentId = searchParams.get("payment_id") || searchParams.get("collection_id");
  const statusParam = searchParams.get("status") || searchParams.get("collection_status");

  const [status, setStatus] = useState("loading");
  const { clearCart } = useCart();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const attempts = useRef(0);

  // Se já vier aprovado na URL, mostra logo (UX melhor)
  useEffect(() => {
    if (statusParam === 'approved') setStatus('paid');
  }, [statusParam]);

  const checkStatus = async () => {
    if (!orderId) return;
    attempts.current++;

    try {
        // Chama a rota de sync que verifica direto no MP
        const res = await fetch('/api/orders/sync-status', {
            method: 'POST',
            body: JSON.stringify({ orderId, paymentId })
        });
        const data = await res.json();
        
        if (data.status === 'paid' || data.status === 'approved') {
            setStatus("paid");
            clearCart(); // Limpa carrinho só quando confirma
            if (pollingRef.current) clearInterval(pollingRef.current);
        } else if (attempts.current > 30 && status !== 'paid') {
            // Se passar 60s e não aprovar, para o polling automático
            if (pollingRef.current) clearInterval(pollingRef.current);
            setStatus("pending");
        }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (orderId) {
        // Verifica imediatamente ao carregar
        checkStatus();
        // E a cada 2 segundos
        pollingRef.current = setInterval(checkStatus, 2000);
    } else {
        setStatus("error");
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [orderId, paymentId]);

  if (!orderId) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold">Pedido não identificado</h1>
        <Button asChild className="mt-4"><Link href="/">Voltar</Link></Button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md w-full">
        
        {status === 'paid' ? (
            <div className="animate-in zoom-in duration-300">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4"/>
                <h1 className="text-2xl font-bold text-stone-800 mb-2">Pagamento Confirmado!</h1>
                <p className="text-gray-600 mb-6">Obrigado! Seu pedido <strong>#{orderId}</strong> já está a ser processado.</p>
                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <Link href="/account/orders">Ver Meus Pedidos</Link>
                </Button>
            </div>
        ) : (
            <div>
                <div className="relative mb-6">
                    <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mx-auto opacity-20"/>
                    <RefreshCw className="w-8 h-8 text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"/>
                </div>
                <h1 className="text-xl font-bold mb-2 text-stone-800">A confirmar pagamento...</h1>
                <p className="text-gray-500 text-sm mb-6">
                    Estamos a comunicar com o banco. <br/>
                    Se já pagou, aguarde alguns segundos.
                </p>
                <div className="space-y-3">
                    <Button onClick={checkStatus} variant="outline" className="w-full">
                        Verificar Novamente
                    </Button>
                    <Button asChild variant="ghost" className="w-full text-stone-400 hover:text-stone-600">
                        <Link href="/account/orders">Verificar mais tarde</Link>
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
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}