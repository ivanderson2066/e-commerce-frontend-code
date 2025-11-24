"use client";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/lib/cart-context';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderParam = searchParams?.get('order');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const { clearCart } = useCart();

  useEffect(() => {
    async function fetchStatus() {
      if (!orderParam) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/mercado-pago/status?order=${encodeURIComponent(orderParam)}`);
        if (!res.ok) throw new Error('Erro ao consultar status');
        const data = await res.json();
        const remoteStatus = data?.paymentInfo?.status || data?.merchantOrder?.status || data?.order?.status || null;
        setStatus(remoteStatus);

        // Clear cart client-side only when payment confirmed
        if (remoteStatus === 'approved' || remoteStatus === 'paid' || remoteStatus === 'authorized') {
          try {
            clearCart();
          } catch (err) {
            console.warn('Não foi possível limpar o carrinho localmente:', err);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
  }, [orderParam, clearCart]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-stone-50">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>
        <h1 className="text-3xl font-serif font-medium mb-2">Compra Confirmada!</h1>

        {loading ? (
          <p className="text-muted-foreground mb-4">Aguardando confirmação de pagamento...</p>
        ) : (
          <>
            <p className="text-muted-foreground mb-4">
              {status === 'approved' || status === 'paid'
                ? 'Pagamento confirmado. Um e-mail de confirmação foi enviado.'
                : 'Pagamento pendente ou não confirmado. Você receberá um e-mail quando o pagamento for processado.'}
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Você pode acompanhar seu pedido na página de pedidos.
            </p>
          </>
        )}

        <div className="space-y-3">
          <Button asChild className="w-full bg-stone-900 text-white hover:bg-stone-800 rounded-none">
            <Link href="/account/orders">Ver Pedidos</Link>
          </Button>
          <Button asChild variant="outline" className="w-full rounded-none border-black hover:bg-stone-100">
            <Link href="/">Continuar Comprando</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
