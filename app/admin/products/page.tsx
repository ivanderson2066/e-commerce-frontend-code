"use client";

// ESTE É O CONTEÚDO ORIGINAL QUE ESTAVA EM SEU ADMIN/PAGE.TSX
// (Com pequenas adaptações para remover o Header antigo, já que o layout.tsx trata disso)

import { useAuth } from "@/lib/auth-context";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Package, RefreshCw, Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
// Ajuste o caminho da importação se necessário. Assumindo que product-form.tsx está em app/admin/
import { ProductForm } from "../product-form"; 

export default function AdminProductsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);

  const fetchData = async () => {
    setLoadingData(true);
    const { data: prods } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    const { data: cats } = await supabase.from('categories').select('*');
    setProducts(prods || []);
    setCategories(cats || []);
    setLoadingData(false);
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', deletingProduct.id);
      if (error) throw error;
      toast.success("Produto excluído.");
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao excluir: " + error.message);
    } finally {
      setDeletingProduct(null);
    }
  };

  useEffect(() => {
    if (!authLoading && user && user.role === "admin") {
        fetchData();
    }
  }, [user, authLoading]);

  if (authLoading) return null; // Layout carrega skeleton ou loading

  // IMPORTANTE: Removemos o Header e a Sidebar manuais deste arquivo
  // pois agora eles vêm do app/admin/layout.tsx automaticamente.

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
                <Package className="h-6 w-6" /> Gerenciar Produtos
            </h2>
            <div className="flex gap-2">
                <Button variant="outline" onClick={fetchData} disabled={loadingData}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loadingData ? 'animate-spin' : ''}`} />
                    Atualizar
                </Button>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-[#4A6B53] hover:bg-[#3A5542]">
                    <Plus className="h-4 w-4 mr-2" /> Novo Produto
                </Button>
            </div>
        </div>

        {/* Tabela de Produtos */}
        <div className="bg-white border border-[#EAEAEA] rounded-lg shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-[#FCFCFC]">
                    <TableRow>
                        <TableHead className="w-[80px]">Imagem</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Estoque</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loadingData ? (
                        <TableRow><TableCell colSpan={6} className="text-center h-32 text-gray-500">Carregando...</TableCell></TableRow>
                    ) : products.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center h-32 text-gray-500">Nenhum produto.</TableCell></TableRow>
                    ) : (
                        products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <div className="h-10 w-10 relative rounded bg-gray-100 overflow-hidden">
                                        {product.images?.[0] && <img src={product.images[0]} alt="" className="object-cover w-full h-full"/>}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell className="capitalize">{product.category}</TableCell>
                                <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}</TableCell>
                                <TableCell>
                                    <span className={`font-bold ${product.stock === 0 ? 'text-red-600' : 'text-gray-700'}`}>{product.stock}</span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => setEditingProduct(product)}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setDeletingProduct(product)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>

        {/* MODALS (Mantidos iguais) */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>Novo Produto</DialogTitle></DialogHeader>
                <ProductForm categories={categories} onSuccess={() => { setIsCreateOpen(false); fetchData(); }} onCancel={() => setIsCreateOpen(false)} />
            </DialogContent>
        </Dialog>

        <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
            <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>Editar Produto</DialogTitle></DialogHeader>
                {editingProduct && (
                    <ProductForm initialData={editingProduct} categories={categories} onSuccess={() => { setEditingProduct(null); fetchData(); }} onCancel={() => setEditingProduct(null)} />
                )}
            </DialogContent>
        </Dialog>

        <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>Vai excluir {deletingProduct?.name} permanentemente.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Sim, excluir</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}