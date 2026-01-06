"use client";

import { useState } from "react";
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
import { Loader2, Package } from "lucide-react";

// Componente de Preço (R$)
const MoneyInput = ({ className, value, onChange, ...props }: any) => {
  const format = (val: number) => {
    if (val === undefined || val === null) return "0,00";
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const numberValue = Number(rawValue) / 100;
    onChange(numberValue);
  };
  return (
    <div className="relative">
      <span className="absolute left-3 top-2.5 text-gray-500 font-medium">R$</span>
      <Input {...props} inputMode="numeric" className={`pl-10 ${className}`} value={format(value)} onChange={handleChange} />
    </div>
  );
};

// Componente de Peso (Kg)
const WeightInput = ({ className, value, onChange, ...props }: any) => {
  const format = (val: number) => {
    if (val === undefined || val === null) return "0,000";
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(val);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const numberValue = Number(rawValue) / 1000;
    onChange(numberValue);
  };
  return (
    <div className="relative">
      <Input {...props} inputMode="numeric" className={`pr-8 ${className}`} value={format(value)} onChange={handleChange} />
      <span className="absolute right-3 top-2.5 text-gray-500 font-medium text-xs">kg</span>
    </div>
  );
};

// NOVO COMPONENTE: Input Inteiro (Sem zeros à esquerda)
const IntegerInput = ({ className, value, onChange, ...props }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Remove tudo que não for número
    const rawVal = e.target.value.replace(/\D/g, "");
    
    // 2. Se estiver vazio, mantém vazio. Se tiver valor, converte para Number (isso remove zeros à esquerda: "05" vira 5)
    onChange(rawVal === "" ? "" : Number(rawVal));
  };

  return (
    <Input 
      {...props}
      // Usamos "text" + "numeric" para forçar o React a controlar a exibição exata da string
      type="text" 
      inputMode="numeric" 
      className={className}
      value={value} 
      onChange={handleChange}
    />
  );
};

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  price: z.coerce.number().min(0.01, "Preço deve ser maior que 0"),
  stock: z.coerce.number().min(0, "Estoque não pode ser negativo"),
  category: z.string().min(1, "Categoria é obrigatória"),
  images: z.array(z.union([z.string(), z.any()])).min(1, "Pelo menos uma imagem é necessária"),
  weight: z.coerce.number().min(0.001, "Peso obrigatório (mín. 1g)"),
  width: z.coerce.number().min(1, "Mínimo 1cm"),
  height: z.coerce.number().min(1, "Mínimo 1cm"),
  length: z.coerce.number().min(1, "Mínimo 1cm"),
  sales_count: z.coerce.number().min(0, "Vendas não pode ser negativo").optional(),
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
      category: initialData.category,
      images: initialData.images || [],
      weight: initialData.weight || 0.3,
      width: initialData.width || 15,
      height: initialData.height || 5,
      length: initialData.length || 20,
      sales_count: initialData.sales_count || 0,
    } : {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      category: "",
      images: [],
      weight: 0.300,
      width: 15,
      height: 5,
      length: 20,
      sales_count: 0,
    },
  });

  const preventInvalidChars = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["-", "+", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const processImages = async (mixedImages: (string | File)[]): Promise<string[]> => {
    const processedUrls: string[] = [];
    for (const item of mixedImages) {
      if (item instanceof File) {
        const fileExt = item.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, item);
        if (uploadError) throw new Error(`Erro ao enviar imagem ${item.name}: ${uploadError.message}`);
        const { data } = supabase.storage.from('products').getPublicUrl(filePath);
        processedUrls.push(data.publicUrl);
      } else {
        processedUrls.push(item);
      }
    }
    return processedUrls;
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      const finalImageUrls = await processImages(data.images);
      const selectedCategory = categories.find(c => c.slug === data.category);

      const productData = {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: Number(data.stock),
        category: data.category,
        category_id: selectedCategory?.id,
        images: finalImageUrls,
        featured: false,
        weight: data.weight,
        width: data.width,
        height: data.height,
        length: data.length,
        sales_count: data.sales_count || 0,
        ...(initialData ? {} : {
            slug: data.name.toLowerCase()
            .replace(/[áàãâä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[íìîï]/g, 'i').replace(/[óòõôö]/g, 'o').replace(/[úùûü]/g, 'u').replace(/[ç]/g, 'c')
            .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') + `-${Math.floor(Math.random() * 1000)}`
        })
      };

      if (initialData) {
        const { error } = await supabase.from('products').update(productData).eq('id', initialData.id);
        if (error) throw error;
        toast.success("Produto atualizado!");
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        toast.success("Produto criado!");
      }
      onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao salvar.", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto px-1">
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Imagens</FormLabel>
                <FormControl>
                    <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    onRemove={(itemToRemove) => {
                        const updated = field.value.filter((i) => i !== itemToRemove);
                        field.onChange(updated);
                    }}
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
                        <Input disabled={loading} placeholder="Ex: Creme Hidratante" {...field} />
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
                    <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue defaultValue={field.value} placeholder="Selecione..." />
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
                    <FormLabel>Preço de Venda</FormLabel>
                    <FormControl>
                        <MoneyInput value={field.value} onChange={field.onChange} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                {/* ESTOQUE AGORA USA IntegerInput PARA CORRIGIR O ZERO À ESQUERDA */}
                <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Estoque</FormLabel>
                    <FormControl>
                        <IntegerInput
                            disabled={loading}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="0"
                        />
                    </FormControl>
                    <FormDescription>Qtd. disponível.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="sales_count"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Vendas Registradas</FormLabel>
                    <FormControl>
                        <IntegerInput
                            disabled={loading}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="0"
                        />
                    </FormControl>
                    <FormDescription>Qtd. de vendas (para ranking de campeões).</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <div className="rounded-lg border p-4 bg-slate-50">
                <div className="flex items-center gap-2 mb-4">
                    <Package className="h-5 w-5 text-emerald-600" />
                    <h3 className="font-medium text-slate-900">Dimensões para Envio</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-xs">Peso (Kg)</FormLabel>
                        <FormControl>
                            <WeightInput value={field.value} onChange={field.onChange} disabled={loading} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    {/* Dimensões também usam IntegerInput para consistência */}
                    <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-xs">Largura (cm)</FormLabel>
                        <FormControl>
                            <IntegerInput disabled={loading} value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-xs">Altura (cm)</FormLabel>
                        <FormControl>
                            <IntegerInput disabled={loading} value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-xs">Comp. (cm)</FormLabel>
                        <FormControl>
                            <IntegerInput disabled={loading} value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            </div>

            <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                    <Textarea className="min-h-[100px]" disabled={loading} placeholder="Detalhes..." {...field} />
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
