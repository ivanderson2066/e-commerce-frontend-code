"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Search, Eye, Truck, CheckCircle, XCircle, Package, Filter } from 'lucide-react';
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function AdminOrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Cast seguro para evitar erros de TS se a interface User for estrita
  const currentUser = user as any;

  const fetchOrders = async () => {
    setLoading(true);
    try {
        let query = supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (statusFilter !== "all") {
            query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;

        if (error) {
            console.error(error);
            toast.error("Erro ao carregar pedidos.");
        } else {
            setOrders(data || []);
        }
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    const { data, error } = await supabase
      .from('order_items')
      .select('*, product:products(name, images)')
      .eq('order_id', orderId);
    if (!error && data) setOrderItems(data);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(`Status atualizado!`);
      fetchOrders();
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      toast.error("Erro ao atualizar status.");
    }
  };

  useEffect(() => {
    if (!authLoading) {
        // Verificação de segurança visual
        if (!user || (currentUser?.role !== 'admin' && currentUser?.user_metadata?.role !== 'admin')) {
            // O layout/middleware lida com o redirect, mas evitamos fetch desnecessário
        } else {
            fetchOrders();
        }
    }
  }, [user, authLoading, statusFilter]); // Recarrega ao mudar o filtro

  // Helper para garantir que o valor seja numérico (lê 'total' do BD)
  const getOrderTotal = (order: any) => {
      // Verifica 'total' (nome correto no schema) ou 'total_amount' (legado/fallback)
      const val = order.total !== undefined ? order.total : order.total_amount;
      return Number(val) || 0;
  };

  const formatCurrency = (val: any) => {
    const num = Number(val);
    if (isNaN(num)) return "R$ 0,00";
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
        paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        shipped: 'bg-blue-100 text-blue-700 border-blue-200',
        delivered: 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]',
        cancelled: 'bg-red-100 text-red-700 border-red-200',
        pending: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };
    
    const labels: any = {
        paid: 'Pago',
        approved: 'Aprovado',
        shipped: 'Enviado',
        delivered: 'Entregue',
        cancelled: 'Cancelado',
        pending: 'Pendente'
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-100 border-gray-200 text-gray-600'}`}>
            {labels[status] || status}
        </span>
    );
  };

  // Filtragem local por texto
  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.shipping_address?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.order_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header e Filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-black font-serif text-[#1A1A1A]">Pedidos</h1>
            <p className="text-gray-500 mt-1">Gerencie e atualize o status das vendas.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200">
                <Filter className="h-4 w-4 text-gray-400 ml-2" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] border-none shadow-none focus:ring-0 h-9 font-medium text-gray-600">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                        <SelectItem value="shipped">Enviado</SelectItem>
                        <SelectItem value="delivered">Entregue</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                    placeholder="Buscar por ID, Nome ou Nº Pedido..." 
                    className="pl-10 rounded-xl bg-white border-gray-200 focus:border-[#4A6B53] focus:ring-[#4A6B53]/20" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                />
            </div>
        </div>
      </div>

      {/* Tabela de Pedidos */}
      <div className="bg-white border border-gray-100 rounded-[2rem] shadow-[0_2px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        <Table>
            <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent border-b border-gray-100">
                    <TableHead className="pl-8 font-bold text-gray-600">ID / Nº</TableHead>
                    <TableHead className="font-bold text-gray-600">Cliente</TableHead>
                    <TableHead className="font-bold text-gray-600">Data</TableHead>
                    <TableHead className="font-bold text-gray-600">Valor Total</TableHead>
                    <TableHead className="font-bold text-gray-600">Status</TableHead>
                    <TableHead className="text-right pr-8 font-bold text-gray-600">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center h-32 text-gray-500">Carregando pedidos...</TableCell></TableRow>
                ) : filteredOrders.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center h-32 text-gray-500">Nenhum pedido encontrado.</TableCell></TableRow>
                ) : (
                    filteredOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-gray-50/50 border-b border-gray-50 last:border-0 transition-colors">
                            <TableCell className="font-medium text-[#1A1A1A] pl-8 py-5">
                                <div className="flex flex-col">
                                    <span className="font-mono text-xs text-gray-400">ID: {order.id.slice(0, 6)}...</span>
                                    {order.order_number && <span className="font-bold text-sm">#{order.order_number}</span>}
                                </div>
                            </TableCell>
                            <TableCell className="py-5">
                                <div className="flex flex-col">
                                    <span className="font-medium text-[#1A1A1A] text-sm">{order.shipping_address?.fullName || 'Desconhecido'}</span>
                                    <span className="text-xs text-gray-500">{order.shipping_address?.city} - {order.shipping_address?.state}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-gray-500 py-5 text-sm">
                                {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                <br />
                                <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                            </TableCell>
                            <TableCell className="py-5">
                                {/* CORREÇÃO: Usando helper getOrderTotal */}
                                <span className="font-bold text-[#4A6B53] bg-[#E8F0E9] px-2 py-1 rounded-lg text-sm">
                                    {formatCurrency(getOrderTotal(order))}
                                </span>
                            </TableCell>
                            <TableCell className="py-5">
                                {getStatusBadge(order.status)}
                            </TableCell>
                            <TableCell className="text-right pr-8 py-5">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="rounded-lg hover:bg-[#E8F0E9] hover:text-[#4A6B53] border-gray-200 h-9 font-medium" 
                                    onClick={() => { setSelectedOrder(order); fetchOrderItems(order.id); }}
                                >
                                    <Eye className="h-4 w-4 mr-2" /> Detalhes
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
      </div>

      {/* Modal Detalhes do Pedido */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl rounded-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 overflow-hidden bg-[#FCFCFC]">
            {/* Header Modal */}
            <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-center sticky top-0 z-10">
                <div>
                    <DialogTitle className="font-serif text-2xl font-bold text-[#1A1A1A] flex items-center gap-3">
                        Pedido #{selectedOrder?.order_number || selectedOrder?.id.slice(0, 6)}
                        {selectedOrder && getStatusBadge(selectedOrder.status)}
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">Realizado em {selectedOrder && new Date(selectedOrder.created_at).toLocaleString('pt-BR')}</p>
                </div>
            </div>
            
            {selectedOrder && (
                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Coluna Esquerda: Itens */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
                                <Package className="h-5 w-5 text-[#4A6B53]"/> Itens do Pedido
                            </h3>
                            <div className="space-y-4">
                                {orderItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                        <div className="h-16 w-16 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden shrink-0">
                                            {item.product?.images?.[0] ? (
                                                <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-300"><Package className="h-6 w-6"/></div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-[#1A1A1A] text-sm line-clamp-1">{item.product?.name || 'Produto Removido'}</p>
                                            <p className="text-sm text-gray-500">{item.quantity}x {formatCurrency(item.price)}</p>
                                        </div>
                                        <p className="font-bold text-[#1A1A1A] text-sm">
                                            {formatCurrency(item.price * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-2">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(selectedOrder.subtotal || getOrderTotal(selectedOrder))}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Frete</span>
                                    <span>{formatCurrency(selectedOrder.shipping_price || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 mt-2 border-t border-dashed border-gray-200">
                                    <span className="font-bold text-lg text-[#1A1A1A]">Total</span>
                                    <span className="font-black text-xl text-[#4A6B53]">{formatCurrency(getOrderTotal(selectedOrder))}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coluna Direita: Detalhes e Ações */}
                    <div className="space-y-6">
                        
                        {/* Card Endereço */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
                                <Truck className="h-5 w-5 text-[#4A6B53]"/> Entrega
                            </h3>
                            <div className="text-sm text-gray-600 space-y-2">
                                <p className="font-bold text-[#1A1A1A] text-base">{selectedOrder.shipping_address?.fullName}</p>
                                <p>{selectedOrder.shipping_address?.street}, {selectedOrder.shipping_address?.number}</p>
                                {selectedOrder.shipping_address?.complement && <p>{selectedOrder.shipping_address?.complement}</p>}
                                <p>{selectedOrder.shipping_address?.neighborhood}</p>
                                <p>{selectedOrder.shipping_address?.city} - {selectedOrder.shipping_address?.state}</p>
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">CEP</span>
                                    <p className="font-mono font-medium text-[#1A1A1A]">{selectedOrder.shipping_address?.zipCode}</p>
                                </div>
                            </div>
                        </div>

                        {/* Card Ações */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-[#1A1A1A] mb-4">Atualizar Status</h3>
                            <div className="flex flex-col gap-2">
                                <Button 
                                    variant="outline" 
                                    className="justify-start h-10 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200" 
                                    onClick={() => updateStatus(selectedOrder.id, 'paid')}
                                    disabled={['paid', 'shipped', 'delivered'].includes(selectedOrder.status)}
                                >
                                    <CheckCircle className="h-4 w-4 mr-3" /> Marcar como Pago
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="justify-start h-10 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200" 
                                    onClick={() => updateStatus(selectedOrder.id, 'shipped')}
                                    disabled={selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered'}
                                >
                                    <Truck className="h-4 w-4 mr-3" /> Marcar como Enviado
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="justify-start h-10 hover:bg-green-50 hover:text-green-700 hover:border-green-200" 
                                    onClick={() => updateStatus(selectedOrder.id, 'delivered')}
                                    disabled={selectedOrder.status === 'delivered'}
                                >
                                    <Package className="h-4 w-4 mr-3" /> Marcar como Entregue
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="justify-start h-10 text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 mt-2" 
                                    onClick={() => updateStatus(selectedOrder.id, 'cancelled')}
                                    disabled={selectedOrder.status === 'cancelled'}
                                >
                                    <XCircle className="h-4 w-4 mr-3" /> Cancelar Pedido
                                </Button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}