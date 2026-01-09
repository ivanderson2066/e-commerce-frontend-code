// CAMINHO DO ARQUIVO: lib/shipping-context.tsx

"use client";

import { createContext, useContext, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { Address } from "./addresses-context";

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  daysToDeliver: number;
  estimatedDate: string;
  companyPicture?: string;
}

interface ShippingContextType {
  selectedShipping: ShippingOption | null;
  shippingOptions: ShippingOption[];
  selectedAddress: Address | null;
  calculateShipping: (cep: string) => Promise<void>;
  selectShipping: (option: ShippingOption) => void;
  selectAddress: (address: Address | null) => void;
  isLoading: boolean;
  error: string | null;
}

const ShippingContext = createContext<ShippingContextType | undefined>(undefined);

export function ShippingProvider({ children }: { children: React.ReactNode }) {
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedAddress, setSelectedAddressState] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { items } = useCart();

  const calculateShipping = async (cep: string) => {
    setIsLoading(true);
    setError(null);
    setShippingOptions([]);
    setSelectedShipping(null);

    try {
      const response = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cep,
          items: items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // Se não for JSON (ex: 404 HTML page), lança erro específico
        const text = await response.text();
        console.error("Resposta não-JSON recebida:", text);
        throw new Error("Erro de comunicação com o servidor (Rota não encontrada ou erro interno)");
      }

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || data.details || 'Falha ao calcular frete';
        console.error("Erro detalhado do backend:", data);
        throw new Error(errorMessage);
      }
      
      if (Array.isArray(data) && data.length > 0) {
        const sortedOptions = data.sort((a: ShippingOption, b: ShippingOption) => a.price - b.price);
        setShippingOptions(sortedOptions);
        setSelectedShipping(sortedOptions[0]);
      } else {
        setError("Nenhuma opção de entrega disponível para este CEP.");
      }

    } catch (err: any) {
      console.error("Erro no contexto de frete:", err);
      setError(err.message || "Erro ao conectar com serviço de frete.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectShipping = (option: ShippingOption) => {
    setSelectedShipping(option);
  };

  const selectAddress = (address: Address | null) => {
    setSelectedAddressState(address);
  };

  return (
    <ShippingContext.Provider
      value={{
        selectedShipping,
        shippingOptions,
        selectedAddress,
        calculateShipping,
        selectShipping,
        selectAddress,
        isLoading,
        error
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
