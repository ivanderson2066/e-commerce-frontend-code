"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, LogOut, RefreshCw, Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
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
// Importação IMPORTANTE: Busca o formulário que está na mesma pasta
import { ProductForm } from "./product-form";

export default function AdminPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Estados para controlar os Modais (Pop-ups)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);

  // Função para buscar dados do Supabase
  const fetchData = async () => {
    setLoadingData(true);
    
    // 1. Busca Produtos
    const { data: prods, error: prodError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    // 2. Busca Categorias (para preencher o select do formulário)
    const { data: cats, error: catError } = await supabase
      .from('categories')
      .select('*');

    if (prodError || catError) {
      console.error('Erro ao buscar dados:', prodError, catError);
      toast.error("Erro ao carregar dados.");
    } else {
      setProducts(prods || []);
      setCategories(cats || []);
    }
    setLoadingData(false);
  };

  // Função para apagar produto
  const handleDelete = async () => {
    if (!deletingProduct) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deletingProduct.id);

      if (error) throw error;
      
      toast.success("Produto excluído.");
      fetchData(); // Atualiza a lista
    } catch (error: any) {
      toast.error("Erro ao excluir: " + error.message);
    } finally {
      setDeletingProduct(null);
    }
  };

  // Proteção de Rota e Carregamento Inicial
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "admin") {
         // Acesso negado será mostrado no render
      } else {
        fetchData();
      }
    }
  }, [user, authLoading]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  // Tela de Bloqueio se não for Admin
  if (user && user.role !== "admin") {
     return (
       <div className="min-h-screen flex items-center justify-center bg-stone-50">
         <div className="text-center">
           <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
           <p className="mb-4">Você não tem permissão de administrador.</p>
           <Button onClick={() => logout()}>Sair</Button>
         </div>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Menu Superior do Admin */}
      <header className="sticky top-0 z-40 bg-stone-900 text-white border-b border-stone-800 shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="font-serif font-bold text-emerald-400">ADMIN</div>
            <div className="h-4 w-px bg-stone-700 mx-2" />
            <nav className="hidden md:flex gap-4 text-sm font-medium">
                <Link href="/admin" className="text-emerald-400 font-bold">Produtos</Link>
                <Link href="/admin/orders" className="text-stone-400 hover:text-white transition-colors">Pedidos</Link>
                <Link href="/admin/users" className="text-stone-400 hover:text-white transition-colors">Usuários</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-stone-400 hover:text-white" asChild>
                <Link href="/" target="_blank">Ver Loja</Link>
            </Button>
            <Button onClick={() => { logout(); router.push("/"); }} size="sm" className="bg-stone-800 hover:bg-stone-700">
                <LogOut className="h-4 w-4 mr-2" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        
        {/* Cards de Estatísticas (Topo) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="text-stone-500 text-xs font-bold uppercase">Total Produtos</div>
                <div className="text-2xl font-bold text-stone-900">{products.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="text-stone-500 text-xs font-bold uppercase">Estoque Baixo</div>
                <div className="text-2xl font-bold text-amber-600">
                    {products.filter(p => p.stock < 5).length}
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="text-stone-500 text-xs font-bold uppercase">Valor em Estoque</div>
                <div className="text-lg font-bold text-emerald-700">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0)
                    )}
                </div>
            </div>
        </div>

        {/* Barra de Ações (Botão Novo Produto) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                <Package className="h-6 w-6" /> Gerenciar Produtos
            </h2>
            <div className="flex gap-2">
                <Button variant="outline" onClick={fetchData} disabled={loadingData}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loadingData ? 'animate-spin' : ''}`} />
                    Atualizar
                </Button>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" /> Novo Produto
                </Button>
            </div>
        </div>

        {/* Tabela de Produtos */}
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-stone-100">
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
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-32 text-stone-500">
                                Carregando dados...
                            </TableCell>
                        </TableRow>
                    ) : products.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-32 text-stone-500">
                                Nenhum produto encontrado. Clique em "Novo Produto" para começar.
                            </TableCell>
                        </TableRow>
                    ) : (
                        products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <div className="h-12 w-12 relative rounded bg-stone-100 overflow-hidden">
                                        {product.images?.[0] && (
                                            <img 
                                                src={product.images[0]} 
                                                alt={product.name} 
                                                className="object-cover w-full h-full"
                                            />
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {product.name}
                                    {product.stock < 5 && (
                                        <span className="ml-2 text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">
                                            BAIXO
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="capitalize">{product.category}</TableCell>
                                <TableCell>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                </TableCell>
                                <TableCell>
                                    <span className={`font-bold ${product.stock === 0 ? 'text-red-600' : 'text-stone-700'}`}>
                                        {product.stock}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => setDeletingProduct(product)}
                                                className="text-red-600 focus:text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
      </div>

      {/* MODAL DE CRIAÇÃO */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Novo Produto</DialogTitle>
            </DialogHeader>
            <ProductForm 
                categories={categories}
                onSuccess={() => {
                    setIsCreateOpen(false);
                    fetchData();
                }}
                onCancel={() => setIsCreateOpen(false)}
            />
        </DialogContent>
      </Dialog>

      {/* MODAL DE EDIÇÃO */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Editar Produto</DialogTitle>
            </DialogHeader>
            {editingProduct && (
                <ProductForm 
                    initialData={editingProduct}
                    categories={categories}
                    onSuccess={() => {
                        setEditingProduct(null);
                        fetchData();
                    }}
                    onCancel={() => setEditingProduct(null)}
                />
            )}
        </DialogContent>
      </Dialog>

      {/* DIALOG DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o produto 
                    <span className="font-bold text-stone-900"> {deletingProduct?.name} </span>
                    e removerá seus dados dos nossos servidores.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Sim, excluir
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}