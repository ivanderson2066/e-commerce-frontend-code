"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Package, 
  MapPin, 
  CreditCard, 
  Calendar, 
  RefreshCw,
  Check,
  Truck,
  User,
  AlertCircle
} from 'lucide-react';
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const statusSteps = [
    { id: 'pending', label: 'Realizado' },
    { id: 'paid', label: 'Pago' },
    { id: 'shipped', label: 'Enviado' },
    { id: 'delivered', label: 'Entregue' },
  ];

  useEffect(() => {
    if (authLoading || !user || !id) return;

    async function fetchOrderDetails() {
      try {
        setLoading(true);
        
        // 1. Buscar Pedido
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();
        
        if (orderError) throw orderError;
        setOrder(orderData);

        // 2. Buscar Itens na tabela relacional
        // Importante: fazemos o join com products para pegar a imagem atualizada
        const { data: relationalItems, error: itemsError } = await supabase
          .from('order_items')
          .select('*, product:products(name, images)')
          .eq('order_id', id);
          
        if (relationalItems && relationalItems.length > 0) {
            console.log("Itens encontrados na tabela:", relationalItems);
            setItems(relationalItems);
        } else {
            // 3. Fallback: Se não achar na tabela, tenta ler do JSON salvo no pedido
            console.log("Fallback: Lendo itens do JSON do pedido", orderData.items);
            if (orderData.items && Array.isArray(orderData.items)) {
                const jsonItems = orderData.items.map((i: any) => ({
                    id: i.id || Math.random().toString(),
                    quantity: i.quantity,
                    price: i.unit_price || i.price,
                    product_name: i.title || i.name || 'Produto',
                    product: {
                        name: i.title || i.name,
                        // Tenta achar a imagem em várias propriedades comuns
                        images: i.picture_url ? [i.picture_url] : (i.image ? [i.image] : [])
                    }
                }));
                setItems(jsonItems);
            }
        }

      } catch (error: any) {
        console.error(error);
        toast.error("Erro ao carregar: " + error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetails();
  }, [id, user, authLoading]);

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setUpdating(true);
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setOrder({ ...order, status: newStatus });
      toast.success("Status atualizado!");
    } catch (error) {
      toast.error("Erro ao atualizar.");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const map: any = { pending: 'Pendente', paid: 'Pago', shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado', approved: 'Aprovado' };
    return map[status] || status;
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Helper para renderizar a imagem do item
  const renderItemImage = (item: any) => {
      // Tenta pegar do relacionamento product.images
      let imgUrl = item.product?.images?.[0];
      
      // Se não tiver, tenta pegar do próprio item (caso salvo como JSON)
      if (!imgUrl) imgUrl = item.picture_url || item.image;

      if (imgUrl) {
          return <img src={imgUrl} alt="Produto" className="h-full w-full object-cover" />;
      }
      return <Package className="h-8 w-8 text-gray-300" />;
  };

  if (loading) return <div className="p-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A6B53]"></div></div>;
  if (!order) return null;

  const currentStepIndex = statusSteps.findIndex(s => {
      if (s.id === 'paid' && (order.status === 'approved' || order.status === 'paid')) return true;
      return s.id === order.status;
  });

  return (
    <div className="font-sans text-[#333333] animate-in fade-in duration-500 pb-20">
      
      <header className="mb-8">
        <Button variant="ghost" onClick={() => router.push('/admin/orders')} className="mb-4 pl-0 hover:bg-transparent text-gray-500 hover:text-[#4A6B53]">
            <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <div className="flex flex-wrap justify-between items-end gap-4">
            <div>
                <h1 className="text-3xl font-bold font-serif text-[#1A1A1A]">Pedido #{order.order_number || order.id.slice(0, 6)}</h1>
                <p className="text-gray-500 mt-1 text-sm">
                    Realizado em {new Date(order.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>
            <div className={`px-4 py-1.5 rounded-full font-bold text-sm border ${order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                {getStatusLabel(order.status).toUpperCase()}
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
            {/* Lista de Itens */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <h2 className="font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#4A6B53]" /> Itens ({items.length})
                </h2>
                <div className="divide-y divide-gray-50">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 py-4">
                            <div className="h-16 w-16 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                                {renderItemImage(item)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-[#1A1A1A] text-sm truncate">{item.product_name || item.product?.name || 'Produto'}</h3>
                                <p className="text-xs text-gray-500 mt-1">Qtd: {item.quantity}</p>
                            </div>
                            <p className="font-bold text-[#1A1A1A] text-sm">{formatCurrency(item.price || 0)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Resumo Financeiro */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>{formatCurrency(Number(order.total || order.total_amount) - Number(order.shipping_price || 0))}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Frete</span>
                        <span>{formatCurrency(Number(order.shipping_price || 0))}</span>
                    </div>
                    <div className="flex justify-between pt-3 mt-3 border-t border-gray-100 font-bold text-lg text-[#4A6B53]">
                        <span>Total</span>
                        <span>{formatCurrency(Number(order.total || order.total_amount))}</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
            {/* Status */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <h2 className="font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-[#4A6B53]" /> Status
                </h2>
                <Select disabled={updating} onValueChange={handleStatusUpdate} value={order.status}>
                    <SelectTrigger className="w-full h-10 rounded-xl bg-gray-50 border-gray-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                        <SelectItem value="shipped">Enviado</SelectItem>
                        <SelectItem value="delivered">Entregue</SelectItem>
                        <SelectItem value="cancelled" className="text-red-600">Cancelado</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Cliente */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <h2 className="font-bold text-[#1A1A1A] mb-4 text-sm uppercase tracking-wider text-gray-400">Entrega</h2>
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
                    <Avatar className="h-10 w-10"><AvatarFallback className="bg-[#E8F0E9] text-[#4A6B53] font-bold">CL</AvatarFallback></Avatar>
                    <div>
                        <p className="font-bold text-[#1A1A1A] text-sm">{order.shipping_address?.fullName}</p>
                        <p className="text-xs text-gray-500">Cliente</p>
                    </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                    <p>{order.shipping_address?.street}, {order.shipping_address?.number}</p>
                    <p>{order.shipping_address?.neighborhood}</p>
                    <p>{order.shipping_address?.city} - {order.shipping_address?.state}</p>
                    <p className="font-mono text-[#4A6B53] mt-2">{order.shipping_address?.zipCode}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}