"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  daysToDeliver: number;
  estimatedDate?: string;
  company?: { name: string; picture: string };
}

interface ShippingContextType {
  selectedShipping: ShippingOption | null;
  shippingOptions: ShippingOption[];
  // Atualizado para aceitar itens também
  calculateShipping: (cep: string, items: any[]) => Promise<void>;
  selectShipping: (option: ShippingOption) => void;
  isLoading: boolean;
}

const ShippingContext = createContext<ShippingContextType | undefined>(undefined);

export function ShippingProvider({ children }: { children: ReactNode }) {
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const calculateShipping = async (cep: string, items: any[]) => {
    setIsLoading(true);
    setShippingOptions([]);
    setSelectedShipping(null);

    try {
      // Chama a API que criamos no Passo 1
      const response = await fetch("/api/checkout/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep, items }),
      });

      if (!response.ok) throw new Error("Falha ao calcular frete");

      const data = await response.json();

      // Formata os dados para exibir na tela
      const formattedOptions: ShippingOption[] = data.map((opt: any) => {
          const deliveryDate = new Date();
          deliveryDate.setDate(deliveryDate.getDate() + opt.daysToDeliver);
          
          return {
            id: String(opt.id),
            name: `${opt.name}`, // Ex: SEDEX
            price: opt.price,
            daysToDeliver: opt.daysToDeliver,
            estimatedDate: deliveryDate.toLocaleDateString('pt-BR')
          };
      });

      setShippingOptions(formattedOptions);
      
      // Seleciona a opção mais barata automaticamente
      if (formattedOptions.length > 0) {
          const sorted = formattedOptions.sort((a, b) => a.price - b.price);
          setSelectedShipping(sorted[0]);
      }

    } catch (error) {
      console.error(error);
      toast.error("Erro ao calcular frete. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectShipping = (option: ShippingOption) => {
    setSelectedShipping(option);
  };

  return (
    <ShippingContext.Provider
      value={{
        selectedShipping,
        shippingOptions,
        calculateShipping,
        selectShipping,
        isLoading
      }}
    >
      {children}
    </ShippingContext.Provider>
  );
}

export function useShipping() {
  const context = useContext(ShippingContext);
  if (!context) {
    throw new Error("useShipping must be used within a ShippingProvider");
  }
  return context;
}