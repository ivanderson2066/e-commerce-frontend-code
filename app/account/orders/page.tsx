"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import Link from "next/link";
import { Package, ChevronRight, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setOrders(data);
      }
      setLoading(false);
    }

    fetchOrders();
  }, [user]);

  // Formatação de Moeda
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Formatação de Data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Badge de Status (Design do HTML)
  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      delivered: 'bg-green-100 text-green-800 ring-green-600/20',
      paid: 'bg-green-100 text-green-800 ring-green-600/20', // Pago geralmente é verde
      shipped: 'bg-blue-100 text-blue-800 ring-blue-700/20',
      pending: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
      cancelled: 'bg-red-100 text-red-800 ring-red-600/20'
    };

    const labels: Record<string, string> = {
      delivered: 'Entregue',
      paid: 'Pago',
      shipped: 'Enviado',
      pending: 'Processando',
      cancelled: 'Cancelado'
    };

    const style = styles[status] || 'bg-gray-100 text-gray-800 ring-gray-600/20';
    const label = labels[status] || status;

    return (
      <span className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-semibold ring-1 ring-inset ${style}`}>
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight tracking-tight text-[#333333]">
          Meus Pedidos
        </h1>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-[#dce1d7] p-12 text-center shadow-sm">
            <div className="bg-[#e9ede4] p-4 rounded-full mb-4">
                <Package className="h-8 w-8 text-[#556B2F]" />
            </div>
            <h3 className="text-lg font-bold text-[#333333] mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-500 mb-6 max-w-xs">Parece que você ainda não fez nenhuma compra conosco.</p>
            <Button asChild className="bg-[#556B2F] hover:bg-[#435725] text-white rounded-lg h-11 px-8">
                <Link href="/">Começar a Comprar</Link>
            </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#dce1d7] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#F9F9F9] border-b border-[#dce1d7]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider" scope="col">Número</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider" scope="col">Data</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider" scope="col">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider" scope="col">Status</th>
                  <th className="relative px-6 py-4" scope="col"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dce1d7] bg-white">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F9F9F9]/50 transition-colors group">
                    <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-[#333333]">
                      #{order.order_number || order.id.slice(0, 8)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-5 text-sm font-bold text-[#333333]">
                      {formatCurrency(Number(order.total || order.total_amount))}
                    </td>
                    <td className="whitespace-nowrap px-6 py-5 text-sm">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-5 text-right text-sm font-medium">
                      <Link 
                        href={`/account/orders/${order.id}`}
                        className="inline-flex items-center justify-center rounded-lg border border-[#556B2F] bg-transparent px-4 py-2 text-sm font-semibold text-[#556B2F] shadow-sm transition-all hover:bg-[#556B2F] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:ring-offset-2"
                      >
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}