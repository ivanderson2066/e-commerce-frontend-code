"use client";

import Image from "next/image";
import { Product } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { useFavorites } from "@/lib/favorites-context";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Check, Heart } from 'lucide-react'; // Importando Lucide

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isAdded, setIsAdded] = useState(false);
  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(product.id, product.name);
  };

  const handleViewDetails = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <div className="group flex flex-col gap-3 pb-3 cursor-pointer" onClick={handleViewDetails}>
      {/* Imagem Arredondada conforme Design */}
      <div className="relative w-full overflow-hidden rounded-xl bg-gray-100 aspect-[3/4] border border-transparent group-hover:border-[#2F7A3E]/20 transition-all">
        <Image
          src={product.images[0] || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Botão de Adicionar Rápido */}
        <button
            onClick={handleAddToCart}
            className={`absolute bottom-3 right-3 h-10 w-10 rounded-full shadow-md flex items-center justify-center transition-all duration-300 ${
                isAdded ? 'bg-[#2F7A3E] text-white opacity-100 translate-y-0' : 'bg-white text-[#2F7A3E] opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-[#2F7A3E] hover:text-white'
            }`}
            title="Adicionar ao carrinho"
        >
            {isAdded ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
        </button>

        {/* Botão de Favorito */}
        <button
            onClick={handleToggleFavorite}
            className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110"
            title={isFavorite(product.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
            <Heart
                className={`h-5 w-5 transition-all ${
                    isFavorite(product.id)
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-400 group-hover:text-red-500'
                }`}
            />
        </button>
      </div>

      {/* Informações */}
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-medium leading-normal text-[#374151] group-hover:text-[#2F7A3E] transition-colors line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm font-bold leading-normal text-[#5AA96A]">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
        </p>
      </div>
    </div>
  );
}
