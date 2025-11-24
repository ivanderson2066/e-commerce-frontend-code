"use client";

import { useState } from "react";
import { ShoppingBag, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  text?: string;
}

export function AddToCartButton({ 
  product, 
  className, 
  variant = "default", 
  size = "default",
  showIcon = true,
  text = "Adicionar ao Carrinho"
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addItem(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <Button 
      onClick={handleAddToCart} 
      disabled={product.stock === 0 || isAdded}
      variant={variant}
      size={size}
      className={cn("transition-all duration-300", className)}
    >
      {isAdded ? (
        <>
          <Check className="mr-2 h-5 w-5" />
          Adicionado
        </>
      ) : (
        <>
          {showIcon && <ShoppingBag className="mr-2 h-5 w-5" />}
          {product.stock === 0 ? "Indisponível" : text}
        </>
      )}
    </Button>
  );
}
