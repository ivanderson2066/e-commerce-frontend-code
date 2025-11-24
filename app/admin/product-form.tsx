"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "./image-upload";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Schema de validação
const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  price: z.coerce.number().min(0.01, "Preço deve ser maior que 0"),
  stock: z.coerce.number().min(0, "Estoque não pode ser negativo"),
  category: z.string().min(1, "Categoria é obrigatória"),
  images: z.array(z.string()).min(1, "Pelo menos uma imagem é necessária"),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: any | null;
  categories: any[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ initialData, categories, onSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description,
      price: initialData.price,
      stock: initialData.stock,
      category: initialData.category, // slug
      images: initialData.images || [],
    } : {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      category: "",
      images: [],
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      
      // Prepara objeto para salvar
      const productData = {
        ...data,
        slug: data.name.toLowerCase()
            .replace(/[áàãâä]/g, 'a')
            .replace(/[éèêë]/g, 'e')
            .replace(/[íìîï]/g, 'i')
            .replace(/[óòõôö]/g, 'o')
            .replace(/[úùûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-') + (initialData ? '' : `-${Math.floor(Math.random() * 1000)}`), // Garante slug único na criação
        category_id: categories.find(c => c.slug === data.category)?.id, // Relaciona com ID
      };

      if (initialData) {
        // UPDATE
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', initialData.id);

        if (error) throw error;
        toast.success("Produto atualizado com sucesso!");
      } else {
        // CREATE
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast.success("Produto criado com sucesso!");
      }

      onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao salvar produto.", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto px-1">
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* IMAGENS */}
            <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Imagens do Produto</FormLabel>
                <FormControl>
                    <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    onRemove={(url) => field.onChange(field.value.filter((current) => current !== url))}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nome do Produto</FormLabel>
                    <FormControl>
                        <Input disabled={loading} placeholder="Ex: Sérum Facial" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select 
                        disabled={loading} 
                        onValueChange={field.onChange} 
                        value={field.value} 
                        defaultValue={field.value}
                    >
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue defaultValue={field.value} placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.slug}>
                            {category.name}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                        <Input type="number" disabled={loading} placeholder="9.99" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Estoque (Qtd)</FormLabel>
                    <FormControl>
                        <Input type="number" disabled={loading} placeholder="10" {...field} />
                    </FormControl>
                    <FormDescription>Quantidade disponível para venda imediata.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                    <Textarea disabled={loading} placeholder="Detalhes do produto..." {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            <div className="flex justify-end gap-4 pt-4 border-t">
                <Button disabled={loading} variant="outline" onClick={onCancel} type="button">
                    Cancelar
                </Button>
                <Button disabled={loading} type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? "Salvar Alterações" : "Criar Produto"}
                </Button>
            </div>
        </form>
        </Form>
    </div>
  );
}