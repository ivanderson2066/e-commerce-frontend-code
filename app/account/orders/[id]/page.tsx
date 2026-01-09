"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  ChevronLeft, 
  Package, 
  MapPin, 
  CreditCard, 
  Truck,
  AlertCircle
} from 'lucide-react';
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        router.push("/login");
        return;
    }
    if (!id) return;

    async function fetchOrderDetails() {
      try {
        setLoading(true);
        
        // 1. Buscar Pedido (garantindo que é do usuário logado)
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .eq('user_id', user!.id)
          .single();
        
        if (orderError) throw orderError;
        if (!orderData) {
            toast.error("Pedido não encontrado.");
            router.push("/account/orders");
            return;
        }
        setOrder(orderData);

        // 2. Buscar Itens
        const { data: relationalItems, error: itemsError } = await supabase
          .from('order_items')
          .select('*, product:products(name, images)')
          .eq('order_id', id);
          
        if (relationalItems && relationalItems.length > 0) {
            setItems(relationalItems);
        } else {
            // Fallback para JSON
            if (orderData.items && Array.isArray(orderData.items)) {
                const jsonItems = orderData.items.map((i: any) => ({
                    id: i.id || Math.random().toString(),
                    quantity: i.quantity,
                    price: i.unit_price || i.price,
                    product_name: i.title || i.name || 'Produto',
                    product: {
                        name: i.title || i.name,
                        images: i.picture_url ? [i.picture_url] : (i.image ? [i.image] : [])
                    }
                }));
                setItems(jsonItems);
            }
        }

      } catch (error: any) {
        console.error(error);
        toast.error("Erro ao carregar detalhes do pedido.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetails();
  }, [id, user, authLoading, router]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      delivered: 'Entregue',
      paid: 'Pago',
      shipped: 'Enviado',
      pending: 'Processando',
      cancelled: 'Cancelado',
      approved: 'Aprovado'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#556B2F]"></div>
        </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/account/orders">
            <Button variant="ghost" size="icon">
                <ChevronLeft className="h-6 w-6" />
            </Button>
        </Link>
        <div>
            <h1 className="text-2xl font-serif font-bold text-[#333333]">Pedido #{order.order_number || order.id.slice(0, 8)}</h1>
            <p className="text-sm text-gray-500">Realizado em {formatDate(order.created_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Esquerda: Itens */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-[#EAEAEA] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#EAEAEA] flex justify-between items-center bg-gray-50/50">
                    <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Package className="h-5 w-5 text-[#556B2F]" /> Itens do Pedido
                    </h2>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase">
                        {getStatusLabel(order.status)}
                    </span>
                </div>
                <div className="divide-y divide-[#EAEAEA]">
                    {items.map((item, idx) => (
                        <div key={idx} className="p-6 flex gap-4">
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                                {item.product?.images?.[0] ? (
                                    <img 
                                      src={item.product.images[0]} 
                                      alt={item.product_name || item.product?.name} 
                                      className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                                        <Package className="h-8 w-8" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-1 flex-col justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-900">{item.product_name || item.product?.name}</h3>
                                    <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-bold text-[#333333]">
                                    {formatCurrency(Number(item.price))}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-[#EAEAEA] shadow-sm p-6">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                    <Truck className="h-5 w-5 text-[#556B2F]" /> Rastreamento e Entrega
                </h2>
                {order.tracking_code ? (
                    <div className="bg-[#F9F9F9] p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Código de Rastreio:</p>
                        <p className="text-lg font-mono font-bold text-[#333333] tracking-wider">{order.tracking_code}</p>
                        <Button variant="link" className="px-0 text-[#556B2F] h-auto mt-2">
                            Acompanhar Entrega &rarr;
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-start gap-3 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p>O código de rastreio será disponibilizado assim que o pedido for despachado.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Coluna Direita: Resumo e Info */}
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#EAEAEA] shadow-sm p-6">
                <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-[#556B2F]" /> Resumo Financeiro
                </h2>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>{formatCurrency(Number(order.total_amount || order.total) - (Number(order.shipping_cost) || 0))}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Frete</span>
                        <span>{formatCurrency(Number(order.shipping_cost) || 0)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg text-[#333333]">
                        <span>Total</span>
                        <span>{formatCurrency(Number(order.total_amount || order.total))}</span>
                    </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                     <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Método de Pagamento</p>
                     <p className="flex items-center gap-2 text-sm font-medium text-gray-700 capitalize">
                        {order.payment_method === 'pix' ? 'PIX' : 'Cartão de Crédito'}
                     </p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-[#EAEAEA] shadow-sm p-6">
                <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#556B2F]" /> Endereço de Entrega
                </h2>
                <div className="text-sm text-gray-600 space-y-1">
                    {order.shipping_address ? (
                        <>
                            <p className="font-medium text-gray-900">{order.shipping_address.name || user?.user_metadata?.full_name}</p>
                            <p>{order.shipping_address.street}, {order.shipping_address.number}</p>
                            <p>{order.shipping_address.neighborhood}</p>
                            <p>{order.shipping_address.city} - {order.shipping_address.state}</p>
                            <p className="mt-2 text-gray-500">{order.shipping_address.zip_code}</p>
                        </>
                    ) : (
                        <p className="italic text-gray-400">Endereço não disponível</p>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
