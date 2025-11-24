"use client";

import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase-client";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, ChevronLeft, Loader2 } from 'lucide-react';
import { useEffect, useState } from "react";

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  items: any[];
}

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error("Erro ao buscar pedidos:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-stone-50">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-medium mb-4">Acesso Necessário</h2>
          <Button asChild className="bg-stone-900 text-white hover:bg-stone-800 rounded-none">
            <Link href="/login">Fazer Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium hover:text-muted-foreground mb-8"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>

        <div className="bg-white border border-stone-200 p-8">
          <h1 className="text-3xl font-serif font-medium mb-2">Meus Pedidos</h1>
          <p className="text-muted-foreground mb-8">Acompanhe todos os seus pedidos aqui.</p>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhum pedido encontrado</p>
              <p className="text-muted-foreground mb-6">Você ainda não realizou nenhuma compra.</p>
              <Button asChild className="bg-stone-900 text-white hover:bg-stone-800 rounded-none">
                <Link href="/">Explorar Produtos</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-stone-200 p-4 rounded-lg flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <p className="font-medium text-lg">Pedido #{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')} • {order.items.length} item(s)
                    </p>
                  </div>
                  <div className="flex flex-col md:items-end justify-center">
                    <span className={`inline-block px-3 py-1 text-xs font-bold uppercase rounded mb-2 w-fit
                      ${order.status === 'paid' || order.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                      {order.status === 'approved' ? 'Pago' : order.status === 'pending' ? 'Pendente' : order.status}
                    </span>
                    <p className="font-medium">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}