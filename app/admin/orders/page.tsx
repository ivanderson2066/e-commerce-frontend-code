"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Search, Eye, Filter, Loader2, PackageX } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function AdminOrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

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

  useEffect(() => {
    if (!authLoading && user) {
        fetchOrders();
    }
  }, [user, authLoading, statusFilter]);

  const getOrderTotal = (order: any) => {
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

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.shipping_address?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.order_number && order.order_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (authLoading) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
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
                    placeholder="Buscar pedido..." 
                    className="pl-10 rounded-xl bg-white border-gray-200 focus:border-[#4A6B53] focus:ring-[#4A6B53]/20" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                />
            </div>
        </div>
      </div>

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
                    <TableRow>
                        <TableCell colSpan={6} className="text-center h-48 text-gray-500">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <Loader2 className="h-6 w-6 animate-spin text-[#4A6B53]" />
                                <p>Carregando pedidos...</p>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : filteredOrders.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center h-48 text-gray-500">
                            <div className="flex flex-col items-center justify-center gap-2 opacity-50">
                                <PackageX className="h-8 w-8" />
                                <p>Nenhum pedido encontrado.</p>
                            </div>
                        </TableCell>
                    </TableRow>
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
                                    onClick={() => router.push(`/admin/orders/${order.id}`)}
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
    </div>
  );
}