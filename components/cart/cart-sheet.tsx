"use client";

import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, X } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

// Adicionamos a interface
interface CartSheetProps {
  customTrigger?: ReactNode;
}

export function CartSheet({ customTrigger }: CartSheetProps) {
  const router = useRouter();
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const { user } = useAuth();

  const handleCheckout = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    router.push("/checkout");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {customTrigger ? (
            // Se tiver trigger customizado, renderiza ele
            customTrigger
        ) : (
            // Fallback para o botão padrão
            <Button variant="ghost" size="icon" className="relative">
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                {totalItems}
                </span>
            )}
            <span className="sr-only">Carrinho</span>
            </Button>
        )}
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md flex flex-col border-l border-gray-200 shadow-2xl">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="font-serif text-2xl text-[#374151]">Seu Carrinho ({totalItems})</SheetTitle>
        </SheetHeader>
        
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 text-gray-300" />
            </div>
            <div className="text-center">
                <p className="text-lg font-bold text-gray-900">Seu carrinho está vazio</p>
                <p className="text-sm text-gray-500 mt-1">Parece que você ainda não adicionou nada.</p>
            </div>
            <SheetClose asChild>
              <Button className="mt-4 bg-[#2F7A3E] hover:bg-[#266332] text-white rounded-full px-8">
                Começar a Comprar
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6 my-4">
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-2">
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                      <Image
                        src={item.images?.[0] || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between gap-2">
                        <h3 className="font-medium text-sm text-gray-900 line-clamp-2 leading-snug">{item.name}</h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="font-bold text-sm text-[#2F7A3E]">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                        </p>
                        <div className="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1 border border-gray-200">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:text-[#2F7A3E] transition-colors disabled:opacity-30"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-[#2F7A3E] transition-colors disabled:opacity-30"
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="space-y-4 pt-4 border-t bg-white">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Frete</span>
                  <span className="text-xs text-gray-400">Calculado no checkout</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-dashed">
                  <span className="font-bold text-lg text-gray-900">Total</span>
                  <span className="font-bold text-xl text-[#2F7A3E]">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice)}</span>
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                    <Button 
                    onClick={handleCheckout}
                    className="w-full h-12 text-base bg-[#2F7A3E] text-white hover:bg-[#266332] rounded-full shadow-lg shadow-green-100 font-bold" 
                    >
                    Finalizar Compra
                    <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </SheetClose>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}