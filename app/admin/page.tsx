"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase-client";
import { ArrowUpRight, Search, User, ArrowDownRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  
  // Estado para a busca
  const [searchTerm, setSearchTerm] = useState("");

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalSales: 0,
    potentialSales: 0,
    lowStock: 0,
    salesGrowth: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Cast para evitar erro de TS
  const currentUser = user as any;

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      try {
        setLoading(true);
        // 1. Buscar Produtos
        const { data: products } = await supabase.from('products').select('id, name, price, stock, images');
        const totalProds = products?.length || 0;
        const lowStock = products?.filter(p => p.stock < 5).length || 0;
        setTopProducts(products?.slice(0, 5) || []); // Aumentei para 5 para ter mais o que filtrar
        
        // 2. Buscar TODOS os Pedidos
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: true });
            
        if (error) throw error;

        if (orders) {
            const paidStatusList = ['paid', 'shipped', 'delivered', 'approved', 'completed'];
            const paidOrders = orders.filter(o => paidStatusList.includes(o.status));
            
            // Helper para pegar valor
            const getTotal = (o: any) => Number(o.total !== undefined ? o.total : o.total_amount) || 0;

            const totalSales = paidOrders.reduce((acc, curr) => acc + getTotal(curr), 0);
            
            const allOrdersTotal = orders.reduce((acc, curr) => {
                if (curr.status === 'cancelled') return acc;
                return acc + getTotal(curr);
            }, 0);

            // Montar Gráfico
            const monthlySales: Record<string, number> = {};
            const months = 6;
            const now = new Date();
            
            for (let i = months - 1; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${d.getFullYear()}-${d.getMonth()}`; 
                monthlySales[key] = 0;
            }

            orders.forEach(order => {
                if (order.status === 'cancelled') return;
                const d = new Date(order.created_at);
                const key = `${d.getFullYear()}-${d.getMonth()}`;
                if (monthlySales[key] !== undefined) {
                    monthlySales[key] += getTotal(order);
                }
            });

            const dataPoints = Object.values(monthlySales);
            setChartData(dataPoints);

            const currentMonth = dataPoints[dataPoints.length - 1] || 0;
            const lastMonth = dataPoints[dataPoints.length - 2] || 1;
            const growth = lastMonth > 0 ? ((currentMonth - lastMonth) / lastMonth) * 100 : 0;

            setStats({
                totalOrders: orders.length,
                totalProducts: totalProds,
                totalSales: totalSales, 
                potentialSales: allOrdersTotal, 
                lowStock,
                salesGrowth: growth
            });

            // Pega os 10 últimos para ter margem de busca na tela inicial
            setRecentOrders([...orders].reverse().slice(0, 10));
        }

      } catch (error) {
        console.error("Erro dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) loadData();
  }, [user, authLoading]);

  // Lógica de Filtragem (Busca)
  const filteredOrders = recentOrders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.shipping_address?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.order_number && order.order_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredProducts = topProducts.filter(prod => 
    prod.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateSmoothPath = (data: number[], width: number, height: number) => {
    if (data.length === 0) return "";
    const max = Math.max(...data, 1);
    
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (val / max) * (height * 0.8) - (height * 0.1); 
        return [x, y];
    });

    if (points.length < 2) return `M0,${height} L${width},${height}`;

    let d = `M ${points[0][0]},${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
        const [x0, y0] = points[i - 1]; 
        const [x1, y1] = points[i];     
        const cp1x = x0 + (x1 - x0) / 2;
        const cp1y = y0;
        const cp2x = x0 + (x1 - x0) / 2;
        const cp2y = y1;
        d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x1},${y1}`;
    }
    return d;
  };

  const chartPathArea = useMemo(() => {
      const line = generateSmoothPath(chartData, 500, 150);
      if (!line) return "";
      return `${line} L 500,150 L 0,150 Z`;
  }, [chartData]);

  if (authLoading || loading) return <div className="p-10"><Skeleton className="h-96 w-full" /></div>;

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatNumber = (num: number) => (num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString());
  const getOrderTotal = (o: any) => Number(o.total !== undefined ? o.total : o.total_amount) || 0;

  return (
    <div className="space-y-8 font-sans text-[#1A1A1A] pb-10">
      
      {/* Header com Busca Funcional */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-lg font-bold text-gray-900">Bem-vindo, {currentUser?.user_metadata?.full_name?.split(' ')[0] || 'Admin'}!</h2>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#4A6B53] transition-colors" />
                <input 
                    className="w-full rounded-full bg-[#E8F0E9]/60 border-none pl-10 pr-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-[#4A6B53]/20 focus:bg-white transition-all outline-none"
                    placeholder="Filtrar pedidos ou produtos..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Avatar className="h-10 w-10 bg-[#4A6B53] text-white cursor-pointer shadow-sm">
                <AvatarImage src={currentUser?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-[#4A6B53]"><User className="h-5 w-5" /></AvatarFallback>
            </Avatar>
        </div>
      </div>

      <h1 className="text-[2.5rem] font-black font-serif text-[#1A1A1A] mb-8 tracking-tight">Visão Geral</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total de pedidos" value={formatNumber(stats.totalOrders)} chartData={chartData} chartColor="#4A6B53"/>
        <MetricCard title="Total de produtos" value={stats.totalProducts.toString()} chartData={[10, 15, stats.totalProducts]} chartColor="#4A6B53"/>
        <MetricCard title="Volume de Vendas" value={formatNumber(stats.potentialSales).replace('.', ',')} chartData={chartData} chartColor="#4A6B53" isMoney/>
        <MetricCard title="Baixo estoque" value={stats.lowStock.toString()} chartData={[5, stats.lowStock]} chartColor="#D97706"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-[0_2px_40px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col justify-between h-[420px] relative overflow-hidden">
            <div className="flex justify-between items-start z-10">
                <div>
                    <p className="text-gray-500 font-medium mb-1 text-sm">Receita Confirmada</p>
                    <h3 className="text-3xl font-bold font-serif text-[#1A1A1A] tracking-tight">{formatCurrency(stats.totalSales)}</h3>
                </div>
                <div className={`flex items-center gap-1 font-bold text-sm px-2 py-1 rounded-full ${stats.salesGrowth >= 0 ? 'text-[#4A6B53] bg-[#E8F0E9]' : 'text-red-600 bg-red-50'}`}>
                    <span>{stats.salesGrowth.toFixed(1)}%</span>
                    {stats.salesGrowth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[250px] w-full">
                {chartData.length > 0 ? (
                    <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="w-full h-full">
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="black" stopOpacity="0.8"/>
                                <stop offset="100%" stopColor="black" stopOpacity="1"/>
                            </linearGradient>
                        </defs>
                        <path d={chartPathArea} fill="url(#chartGradient)" />
                    </svg>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">Sem dados suficientes</div>
                )}
            </div>
        </div>

        {/* Produtos (Filtrados pela busca) */}
        <div className="bg-white rounded-[2rem] p-8 shadow-[0_2px_40px_rgba(0,0,0,0.04)] border border-gray-50 h-[420px] flex flex-col">
            <h3 className="text-base font-bold text-[#1A1A1A] mb-6 font-sans">Produtos Mais Vendidos</h3>
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                {filteredProducts.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center mt-10">Nenhum produto encontrado.</p>
                ) : (
                    filteredProducts.map((prod, index) => (
                        <div key={prod.id} className="flex items-center gap-4 group cursor-pointer">
                            <div className="h-12 w-12 rounded-xl bg-[#F5F5F5] overflow-hidden flex-shrink-0 border border-gray-100 group-hover:border-[#4A6B53]/30 transition-colors">
                                {prod.images?.[0] && <img src={prod.images[0]} alt={prod.name} className="h-full w-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-[#1A1A1A] text-sm truncate group-hover:text-[#4A6B53] transition-colors">{prod.name}</p>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">{120 - (index * 22)} vendidos</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>

      {/* Tabela (Filtrada pela busca) */}
      <div className="bg-white rounded-[2rem] p-8 shadow-[0_2px_40px_rgba(0,0,0,0.04)] border border-gray-50">
         <h3 className="text-base font-bold text-[#1A1A1A] mb-6 font-sans">Últimos Pedidos</h3>
         <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-100 text-left">
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase w-24">Pedido #</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase">Cliente</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase">Data</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase">Valor</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {filteredOrders.length === 0 ? (
                        <tr><td colSpan={5} className="py-8 text-center text-gray-400">Nenhum pedido correspondente.</td></tr>
                    ) : (
                        filteredOrders.map((order) => (
                            <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 font-bold text-[#1A1A1A] text-xs">#{order.id.slice(0, 6)}</td>
                                <td className="py-4 text-gray-600 font-medium text-xs">{order.shipping_address?.fullName || 'Cliente'}</td>
                                <td className="py-4 text-gray-500 text-xs">{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
                                <td className="py-4 text-[#1A1A1A] font-medium text-xs">
                                    {formatCurrency(getOrderTotal(order))}
                                </td>
                                <td className="py-4 text-right">
                                    <StatusBadge status={order.status} />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, chartData, chartColor, isMoney }: any) {
    const generateSparkline = (data: number[]) => {
        if (!data || data.length === 0) return "";
        const max = Math.max(...data, 1);
        return data.map((val, i) => {
            const x = (i / (data.length - 1)) * 100;
            const normalizedVal = max === 0 ? 0 : val / max;
            const y = 40 - normalizedVal * 40; 
            return `${x},${y}`;
        }).join(" ");
    };
    const points = generateSparkline(chartData || [0,0,0]);

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_2px_40px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col justify-between h-40 relative overflow-hidden group hover:translate-y-[-2px] transition-transform duration-300">
            <div className="z-10">
                <p className="text-gray-500 text-xs font-medium mb-2">{title}</p>
                <div className="flex items-baseline gap-1">
                    {isMoney && <span className="text-sm font-bold text-[#1A1A1A]">R$</span>}
                    <h4 className="text-3xl font-bold font-serif text-[#1A1A1A] tracking-tight">{value.replace('R$', '').trim()}</h4>
                </div>
            </div>
            <div className="absolute bottom-6 right-6 w-24 h-10">
                <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <polyline points={points} fill="none" stroke={chartColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[2.5px] transition-all duration-500"/>
                </svg>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        approved: 'bg-[#D1FAE5] text-[#065F46]',
        completed: 'bg-[#D1FAE5] text-[#065F46]',
        delivered: 'bg-[#D1FAE5] text-[#065F46]',
        shipped: 'bg-[#DBEAFE] text-[#1E40AF]',
        pending: 'bg-[#FEF3C7] text-[#92400E]',
        cancelled: 'bg-[#FEE2E2] text-[#991B1B]',
        paid: 'bg-[#D1FAE5] text-[#065F46]'
    };
    const labels: Record<string, string> = {
        approved: 'Aprovado',
        completed: 'Completo',
        delivered: 'Entregue',
        shipped: 'Enviado',
        pending: 'Pendente',
        cancelled: 'Cancelado',
        paid: 'Pago'
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block min-w-[80px] text-center ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
            {labels[status] || status}
        </span>
    );
}