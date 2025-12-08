"use client";

import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus, Tag, Upload, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminCategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  
  // Estados do Formulário
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState(""); // URL para visualização
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Arquivo real
  const [uploading, setUploading] = useState(false);

  // Buscar categorias ao carregar
  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (!error) setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchCategories();
  }, [user]);

  // Gerar Slug automático
  useEffect(() => {
    if (!editingCategory && name) {
        setSlug(name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-').replace(/[^\w-]+/g, ''));
    }
  }, [name, editingCategory]);

  // Seleção de Imagem (Apenas Preview)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Cria URL temporária para mostrar na tela imediatamente
      setImage(URL.createObjectURL(file));
    }
  };

  // Salvar (Upload + Banco de Dados)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
        let finalImageUrl = image;

        // 1. Se tem arquivo novo, faz o upload para o Storage
        if (selectedFile) {
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('categories')
                .upload(filePath, selectedFile);

            if (uploadError) {
                // Erro específico para ajudar você a debugar
                if (uploadError.message.includes("violates row-level security") || uploadError.message.includes("Bucket not found")) {
                    throw new Error("Erro de permissão no Supabase. Por favor, execute o Script SQL fornecido no chat para configurar o Storage.");
                }
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('categories')
                .getPublicUrl(filePath);
            
            finalImageUrl = data.publicUrl;
        }

        // 2. Salva os dados na tabela 'categories'
        if (editingCategory) {
            const { error } = await supabase
                .from('categories')
                .update({ name, slug, image: finalImageUrl })
                .eq('id', editingCategory.id);
            if (error) throw error;
            toast.success("Categoria atualizada com sucesso!");
        } else {
            const { error } = await supabase
                .from('categories')
                .insert([{ name, slug, image: finalImageUrl }]);
            if (error) throw error;
            toast.success("Categoria criada com sucesso!");
        }

        // Limpar tudo
        setIsModalOpen(false);
        setEditingCategory(null);
        setName("");
        setSlug("");
        setImage("");
        setSelectedFile(null);
        fetchCategories();

    } catch (error: any) {
        console.error(error);
        toast.error("Erro: " + error.message);
    } finally {
        setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Tem certeza? Isso pode afetar produtos desta categoria.")) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) toast.error("Erro ao excluir");
    else {
        toast.success("Categoria excluída");
        fetchCategories();
    }
  };

  // Abrir modal de edição
  const openEdit = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setImage(cat.image || "");
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  // Abrir modal de criação
  const openCreate = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setImage("");
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-black font-serif text-[#1A1A1A]">Categorias</h1>
            <p className="text-gray-500 mt-1">Gerencie as categorias e imagens da loja.</p>
        </div>
        <Button onClick={openCreate} className="bg-[#4A6B53] hover:bg-[#3A5542] rounded-xl px-6">
            <Plus className="mr-2 h-4 w-4" /> Nova Categoria
        </Button>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden p-2">
        <Table>
            <TableHeader className="bg-transparent">
                <TableRow className="hover:bg-transparent border-b border-gray-100">
                    <TableHead className="pl-6 w-[100px]">Imagem</TableHead>
                    <TableHead className="font-bold text-gray-600">Nome</TableHead>
                    <TableHead className="font-bold text-gray-600">Slug</TableHead>
                    <TableHead className="text-right pr-6 font-bold text-gray-600">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-center h-24 text-gray-500">Carregando...</TableCell></TableRow>
                ) : categories.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center h-24 text-gray-500">Nenhuma categoria encontrada.</TableCell></TableRow>
                ) : (
                    categories.map((cat) => (
                        <TableRow key={cat.id} className="hover:bg-gray-50/50 border-b border-gray-50 last:border-0 transition-colors">
                            <TableCell className="pl-6 py-4">
                                <div className="h-12 w-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center relative group">
                                    {cat.image ? (
                                        <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <ImageIcon className="h-5 w-5 text-gray-400" />
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="font-medium text-[#1A1A1A] py-4">{cat.name}</TableCell>
                            <TableCell className="text-gray-500 py-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{cat.slug}</span></TableCell>
                            <TableCell className="text-right pr-6 py-4">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => openEdit(cat)} className="hover:bg-[#E8F0E9] hover:text-[#4A6B53] rounded-lg">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} className="hover:text-red-600 hover:bg-red-50 rounded-lg">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-2xl max-w-md bg-white">
            <DialogHeader>
                <DialogTitle className="font-serif text-xl text-[#1A1A1A]">{editingCategory ? 'Editar' : 'Nova'} Categoria</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                
                {/* Upload de Imagem */}
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="relative group h-40 w-full rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-300 hover:border-[#4A6B53] hover:bg-[#E8F0E9]/30 transition-all flex flex-col items-center justify-center cursor-pointer">
                        {image ? (
                            <>
                                <img src={image} alt="Preview" className="h-full w-full object-cover absolute inset-0" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white font-medium z-10">
                                    <Upload className="h-6 w-6 mb-2" />
                                    <span className="text-xs">Trocar Imagem</span>
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-4">
                                <div className="bg-white p-3 rounded-full shadow-sm mb-3 inline-block">
                                    <Upload className="h-6 w-6 text-[#4A6B53]" />
                                </div>
                                <p className="text-sm font-medium text-gray-700">Clique para adicionar foto</p>
                                <p className="text-xs text-gray-400 mt-1">PNG, JPG (Max 2MB)</p>
                            </div>
                        )}
                        
                        <input 
                            type="file" 
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer z-20"
                            onChange={handleImageSelect}
                            disabled={uploading}
                        />
                    </div>
                    {image && (
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { setImage(""); setSelectedFile(null); }}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2 text-xs"
                        >
                            <X className="h-3 w-3 mr-1" /> Remover foto atual
                        </Button>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Nome da Categoria</label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Móveis" required className="rounded-xl border-gray-200 focus:border-[#4A6B53] focus:ring-[#4A6B53]/20 h-11" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Slug (Automático)</label>
                        <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="ex: moveis" required className="rounded-xl bg-gray-50 border-gray-200 text-gray-500 h-11" />
                    </div>
                </div>

                <Button type="submit" disabled={uploading} className="w-full bg-[#4A6B53] hover:bg-[#3A5542] rounded-xl py-6 font-bold text-white shadow-lg shadow-[#4A6B53]/20 transition-all hover:translate-y-[-2px]">
                    {uploading ? 'Salvando...' : 'Salvar Categoria'}
                </Button>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}