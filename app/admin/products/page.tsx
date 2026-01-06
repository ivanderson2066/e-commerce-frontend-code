"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Package, Edit, Trash, Star } from 'lucide-react';
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { ProductForm } from "../product-form"; 

export default function AdminProductsPage() {
  const { user, isLoading: authLoading } = useAuth();
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);

  // Paginação (Visual/Simulada para manter o design)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const { data: prods } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      const { data: cats } = await supabase.from('categories').select('*');
      setProducts(prods || []);
      setCategories(cats || []);
    } catch (error) {
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', deletingProduct.id);
      if (error) throw error;
      
      toast.success("Produto excluído com sucesso.");
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao excluir: " + error.message);
    } finally {
      setDeletingProduct(null);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchData();
  }, [user, authLoading]);

  // Filtro
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica de Paginação do Front
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="flex flex-col gap-6 font-sans text-[#333333]">
        
        {/* Header e Ações */}
        <header className="flex flex-wrap justify-between items-center gap-4">
            <h1 className="text-[#333333] text-4xl font-bold leading-tight font-serif">Produtos</h1>
            <div className="flex gap-4">
                {/* Busca estilizada */}
                <div className="relative group hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#556B2F] transition-colors" />
                    <input 
                        placeholder="Buscar produto..." 
                        className="pl-9 h-10 rounded-full bg-white border border-[#E0E0E0] text-sm focus:ring-2 focus:ring-[#556B2F]/20 focus:border-[#556B2F] outline-none w-64 shadow-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <button 
                    onClick={() => setIsCreateOpen(true)} 
                    className="flex min-w-[84px] items-center justify-center gap-2 overflow-hidden rounded-full h-10 px-6 bg-[#556B2F] text-white text-sm font-bold leading-normal shadow-sm hover:bg-[#556B2F]/90 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    <span className="truncate">Criar Produto</span>
                </button>
            </div>
        </header>

        {/* Tabela Card */}
        <div className="bg-white p-0 md:p-6 rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-[#E0E0E0]">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left">
                    <thead>
                        <tr className="border-b border-[#E0E0E0]">
                            <th className="px-4 py-3 text-left text-[#666666] text-xs font-medium uppercase tracking-wider">Nome</th>
                            <th className="px-4 py-3 text-left text-[#666666] text-xs font-medium uppercase tracking-wider">Preço</th>
                            <th className="px-4 py-3 text-left text-[#666666] text-xs font-medium uppercase tracking-wider">Estoque</th>
                            <th className="px-4 py-3 text-left text-[#666666] text-xs font-medium uppercase tracking-wider">Categoria</th>
                            <th className="px-4 py-3 text-left text-[#666666] w-28 text-xs font-medium uppercase tracking-wider text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0E0E0]">
                        {loadingData ? (
                            <tr><td colSpan={5} className="text-center py-10 text-[#666666]">Carregando produtos...</td></tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-10 text-[#666666]">Nenhum produto encontrado.</td></tr>
                        ) : (
                            currentProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-[#e9ede2]/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-md w-10 h-10 bg-gray-100 border border-[#E0E0E0] overflow-hidden flex items-center justify-center">
                                                {product.images?.[0] ? (
                                                    <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <Package className="h-5 w-5 text-gray-400" />
                                                )}
                                            </div>
                                            <span className="text-[#333333] text-sm font-medium leading-normal">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-[#666666] text-sm font-normal leading-normal">
                                        {formatCurrency(product.price)}
                                    </td>
                                    <td className="px-4 py-3 text-[#666666] text-sm font-normal leading-normal">
                                        <span className={product.stock < 5 ? "text-red-600 font-bold" : ""}>{product.stock}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e9ede2] text-[#556B2F]">
                                            {product.category || 'Geral'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {product.featured ? (
                                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100">
                                                <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                                            </div>
                                        ) : (
                                            <span className="text-gray-300">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 w-28">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => setEditingProduct(product)}
                                                className="flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-[#666666] hover:bg-gray-100 transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Editar
                                            </button>
                                            <button 
                                                onClick={() => setDeletingProduct(product)}
                                                className="flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <Trash className="w-4 h-4" />
                                                Deletar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginação */}
            <div className="flex items-center justify-center pt-6 pb-2">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex size-9 items-center justify-center text-[#666666] hover:text-[#556B2F] hover:bg-[#e9ede2] rounded-md disabled:opacity-50 disabled:hover:bg-transparent"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Lógica simples de paginação para mostrar páginas próximas
                    let p = i + 1;
                    if (totalPages > 5 && currentPage > 3) p = currentPage - 2 + i;
                    if (p > totalPages) return null;

                    return (
                        <button 
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`text-sm font-normal leading-normal flex size-9 items-center justify-center rounded-md transition-colors ${
                                currentPage === p 
                                    ? "bg-[#556B2F] text-white font-bold" 
                                    : "text-[#666666] hover:bg-[#e9ede2]"
                            }`}
                        >
                            {p}
                        </button>
                    );
                })}
                
                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="flex size-9 items-center justify-center text-[#666666] hover:text-[#556B2F] hover:bg-[#e9ede2] rounded-md disabled:opacity-50 disabled:hover:bg-transparent"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* MODALS (Mantidos funcionais) */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent className="max-w-2xl rounded-xl">
                <DialogHeader><DialogTitle className="font-serif text-2xl text-[#333333]">Novo Produto</DialogTitle></DialogHeader>
                <ProductForm 
                    categories={categories}
                    onSuccess={() => { setIsCreateOpen(false); fetchData(); }}
                    onCancel={() => setIsCreateOpen(false)}
                />
            </DialogContent>
        </Dialog>

        <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
            <DialogContent className="max-w-2xl rounded-xl">
                <DialogHeader><DialogTitle className="font-serif text-2xl text-[#333333]">Editar Produto</DialogTitle></DialogHeader>
                {editingProduct && (
                    <ProductForm 
                        initialData={editingProduct}
                        categories={categories}
                        onSuccess={() => { setEditingProduct(null); fetchData(); }}
                        onCancel={() => setEditingProduct(null)}
                    />
                )}
            </DialogContent>
        </Dialog>

        <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
            <AlertDialogContent className="rounded-xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-serif text-xl text-[#333333]">Excluir Produto</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza que deseja apagar <b>{deletingProduct?.name}</b>? Esta ação é irreversível.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-lg border-gray-200">Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 rounded-lg text-white">
                        Sim, excluir
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}