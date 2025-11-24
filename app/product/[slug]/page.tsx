"use client"; 

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Truck, ShieldCheck, Loader2 } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { supabase } from "@/lib/supabase-client";

export default function ProductPage() {
  const params = useParams();
  
  // CORREÇÃO: Adicionado '|| ""' para garantir tipo string e evitar o erro de tipo
  const slug = (Array.isArray(params?.slug) ? params.slug[0] : params?.slug) || "";

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    async function fetchProduct() {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
      
      let query = supabase.from('products').select('*');
      
      if (isUUID) {
        query = query.eq('id', slug);
      } else {
        query = query.eq('slug', slug);
      }

      const { data, error } = await query.single();

      if (error) {
        console.error("Erro ao buscar produto:", error);
      } else {
        setProduct(data);
      }
      setLoading(false);
    }

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-700" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Produto não encontrado</h1>
        <Button asChild><a href="/">Voltar para a loja</a></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Início</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/category/${product.category}`}>
                {product.category}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        <div className="space-y-4">
          <div className="relative aspect-square bg-secondary overflow-hidden rounded-lg border border-gray-100">
            <Image
              src={product.images?.[0] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.slice(1).map((img: string, idx: number) => (
                <div key={idx} className="relative aspect-square bg-secondary overflow-hidden rounded cursor-pointer hover:opacity-80 border border-gray-100">
                  <Image
                    src={img || "/placeholder.svg"}
                    alt={`${product.name} view ${idx + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-900">{product.name}</h1>
            <p className="text-2xl font-medium text-emerald-700">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
            </p>
          </div>

          <div className="prose prose-stone text-muted-foreground">
            <p>{product.description}</p>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              {product.stock > 0 ? `${product.stock} unidades em estoque` : "Esgotado"}
            </div>
            
            <div className="flex gap-4">
              <AddToCartButton 
                product={product} 
                size="lg" 
                className="flex-1 h-14 text-lg" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8">
            <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-lg">
              <Truck className="h-6 w-6 text-stone-600 mt-1" />
              <div>
                <h4 className="font-medium text-sm">Frete Grátis</h4>
                <p className="text-xs text-muted-foreground">Para compras acima de R$ 299,00</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-stone-600 mt-1" />
              <div>
                <h4 className="font-medium text-sm">Garantia de Satisfação</h4>
                <p className="text-xs text-muted-foreground">7 dias para troca ou devolução</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}