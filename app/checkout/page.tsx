// CAMINHO DO ARQUIVO: app/checkout/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useShipping } from "@/lib/shipping-context"; // Importa do contexto atualizado
import { formatCardNumber, maskCEP } from "@/lib/payment-utils";
import { ChevronLeft, AlertCircle, CheckCircle, Copy, Loader2 } from 'lucide-react';

type CheckoutStep = "shipping" | "payment" | "confirmation";
type PaymentMethod = "card" | "pix";

interface OrderData {
  orderId: string;
  items: any[];
  shippingAddress: any;
  shippingOption: any;
  paymentMethod: string;
  total: number;
  transactionId: string;
  pixQRCode?: string;
  pixQRCodeBase64?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  
  // Hook de Frete (Agora conectado à API via Contexto)
  const { 
    selectedShipping, 
    shippingOptions, 
    calculateShipping, 
    selectShipping, 
    isLoading: isShippingLoading,
    error: shippingError 
  } = useShipping();
  
  const [step, setStep] = useState<CheckoutStep>("shipping");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [error, setError] = useState<string>("");
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    city: "",
    state: "",
    cpf: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [showShippingOptions, setShowShippingOptions] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);

  // Atualiza erro local se o contexto de frete reportar erro
  useEffect(() => {
    if (shippingError) {
      setError(shippingError);
    }
  }, [shippingError]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return null;

  if (items.length === 0 && step === "shipping") {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-stone-50">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-medium text-stone-900 mb-4">Carrinho Vazio</h2>
          <Button asChild className="bg-emerald-700 text-white hover:bg-emerald-800 rounded-none">
            <Link href="/">Continuar Comprando</Link>
          </Button>
        </div>
      </div>
    );
  }

  const shippingPrice = selectedShipping?.price || 0;
  const finalTotal = totalPrice + shippingPrice;

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === "cep") {
      // Limita e formata CEP
      formattedValue = maskCEP(value.replace(/\D/g, "").slice(0, 8));
    }
    
    if (name === "cpf") {
      // Limita CPF (formatação básica)
      formattedValue = value.replace(/\D/g, "").slice(0, 11); 
    }
    
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  // --- CÁLCULO DE FRETE REAL ---
  const handleCalculateShipping = async () => {
    const cleanCep = formData.cep.replace(/\D/g, '');
    
    if (cleanCep.length < 8) {
      setError("CEP inválido. Digite 8 números.");
      return;
    }
    
    setError("");
    setShowShippingOptions(false); // Esconde opções antigas enquanto carrega
    
    try {
      // Chama a API do Melhor Envio (via Contexto -> API Route)
      await calculateShipping(cleanCep);
      setShowShippingOptions(true);
    } catch (err) {
      // O erro já é tratado no contexto, mas podemos adicionar log extra aqui se necessário
      console.error("Erro no componente ao calcular frete", err);
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedShipping) {
      setError("Selecione uma opção de frete para continuar.");
      return;
    }
    if (!formData.street || !formData.number || !formData.city || !formData.state) {
        setError("Preencha todos os dados de endereço.");
        return;
    }
    
    setError("");
    setStep("payment");
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError("");

    try {
      const payload = {
        items: items,
        shippingPrice: shippingPrice,
        customerEmail: formData.email,
        customerName: formData.fullName,
        shippingAddress: formData,
        userId: user.id,
        paymentMethod: paymentMethod,
      };

      const response = await fetch("/api/mercado-pago/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar pagamento");
      }

      const { type, payload: mpData, order } = data;

      // CASO 1: CARTÃO (Redirect)
      if (type === 'preference') {
        const initPoint = mpData?.init_point || mpData?.sandbox_init_point;
        if (initPoint) {
           window.location.href = initPoint;
           return;
        }
      }

      // CASO 2: PIX (QR Code)
      if (type === 'pix') {
         const orderObj: OrderData = {
            orderId: order.order_number,
            items: items,
            shippingAddress: formData,
            shippingOption: selectedShipping,
            paymentMethod: "PIX",
            total: order.total,
            transactionId: mpData.qr_code,
            pixQRCodeBase64: mpData.qr_code_base64
         };
         setOrderData(orderObj);
         setStep("confirmation");
         clearCart();
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao processar pagamento. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyPix = () => {
    if (orderData?.transactionId) {
      navigator.clipboard.writeText(orderData.transactionId);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2000);
    }
  };

  if (step === "confirmation" && orderData) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-emerald-50 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white border border-emerald-200 p-8 text-center shadow-sm rounded-xl">
            <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-6" />
            <h1 className="text-3xl font-serif font-medium text-emerald-900 mb-2">Pedido Confirmado!</h1>
            <p className="text-gray-600 mb-6">Obrigado por sua compra. O número do seu pedido é <strong>{orderData.orderId}</strong>.</p>

            {orderData.paymentMethod === "PIX" && (
                <div className="mb-8 p-6 bg-stone-50 border-2 border-dashed border-emerald-300 rounded-xl text-left">
                  <div className="text-center mb-4">
                    <p className="font-bold text-lg text-emerald-800 mb-1">Pagamento via PIX</p>
                    <p className="text-sm text-gray-500">O código expira em 30 minutos</p>
                  </div>

                  {orderData.pixQRCodeBase64 && (
                    <div className="flex justify-center mb-4">
                        <img 
                            src={`data:image/png;base64,${orderData.pixQRCodeBase64}`} 
                            alt="QR Code PIX" 
                            className="w-48 h-48 object-contain"
                        />
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase">Código Copia e Cola:</p>
                    <div className="flex gap-2">
                        <input
                        type="text"
                        value={orderData.transactionId}
                        readOnly
                        className="flex-1 px-3 py-2 text-xs font-mono border border-gray-300 bg-white rounded"
                        />
                        <Button
                        onClick={handleCopyPix}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                        {pixCopied ? "Copiado!" : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                  </div>
                </div>
              )}

            <div className="space-y-3">
              <Button asChild className="w-full bg-emerald-800 text-white hover:bg-emerald-900 h-12 text-lg">
                <Link href="/account/orders">Acompanhar Pedido</Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-12 border-emerald-200 text-emerald-800 hover:bg-emerald-50">
                <Link href="/">Voltar à Loja</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <button
          onClick={() => {
              if(step === 'payment') setStep('shipping');
              else router.back();
          }}
          className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 mb-8"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm">
              {/* Steps */}
              <div className="flex gap-4 mb-12 border-b border-gray-100">
                <div className={`pb-3 border-b-2 transition-all ${step === "shipping" ? "border-emerald-600 text-emerald-800 font-bold" : "border-transparent text-gray-400"}`}>1. Entrega</div>
                <div className={`pb-3 border-b-2 transition-all ${step === "payment" ? "border-emerald-600 text-emerald-800 font-bold" : "border-transparent text-gray-400"}`}>2. Pagamento</div>
              </div>

              {step === "shipping" && (
                <form onSubmit={handleShippingSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleShippingChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">CPF (Obrigatório)</label>
                      <input type="text" name="cpf" value={formData.cpf} onChange={handleShippingChange} placeholder="000.000.000-00" maxLength={14} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleShippingChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    
                    {/* CEP e Cálculo */}
                    <div className="md:col-span-2">
                        <div className="flex gap-4 items-end">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                            <input 
                                type="text" 
                                name="cep" 
                                value={formData.cep} 
                                onChange={handleShippingChange} 
                                required 
                                placeholder="00000-000"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                            />
                          </div>
                          <Button 
                            type="button" 
                            onClick={handleCalculateShipping} 
                            disabled={isShippingLoading || formData.cep.replace(/\D/g, '').length < 8}
                            variant="secondary"
                            className="min-w-[140px]"
                          >
                            {isShippingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Calcular Frete"}
                          </Button>
                        </div>
                    </div>
                    
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Endereço (Rua, Nº, Bairro)</label>
                        <input type="text" name="street" value={formData.street} onChange={handleShippingChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                        <input type="text" name="number" value={formData.number} onChange={handleShippingChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                        <input type="text" name="complement" value={formData.complement} onChange={handleShippingChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                        <input type="text" name="city" value={formData.city} onChange={handleShippingChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <input type="text" name="state" value={formData.state} onChange={handleShippingChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                  </div>

                  {/* Opções de Frete */}
                  {showShippingOptions && (
                    <div className="space-y-3 mt-6 bg-stone-50 p-4 rounded-lg border border-stone-100">
                        <p className="font-bold text-sm text-gray-700 mb-2">Opções de Entrega:</p>
                        
                        {shippingOptions.length === 0 && !isShippingLoading ? (
                            <p className="text-sm text-red-500">Nenhuma opção de entrega encontrada para este CEP.</p>
                        ) : (
                            shippingOptions.map((option) => (
                            <label key={option.id} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all bg-white ${selectedShipping?.id === option.id ? 'border-emerald-500 ring-1 ring-emerald-500' : 'hover:border-emerald-300'}`}>
                                <input 
                                    type="radio" 
                                    name="shipping" 
                                    checked={selectedShipping?.id === option.id} 
                                    onChange={() => selectShipping(option)} 
                                    className="mr-4 text-emerald-600 focus:ring-emerald-500" 
                                />
                                <div className="flex-1 flex justify-between items-center">
                                    <div>
                                        <span className="font-bold text-stone-800">{option.name}</span>
                                        <span className="text-xs text-gray-500 block">Chega em aprox. {option.daysToDeliver} dias úteis</span>
                                        {option.companyPicture && (
                                            <img src={option.companyPicture} alt={option.name} className="h-6 mt-1 opacity-75" />
                                        )}
                                    </div>
                                    <span className="font-bold text-emerald-700">{option.price === 0 ? 'Grátis' : `R$ ${option.price.toFixed(2)}`}</span>
                                </div>
                            </label>
                            ))
                        )}
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                      <Button type="submit" size="lg" disabled={!selectedShipping} className="bg-emerald-700 hover:bg-emerald-800 text-white w-full md:w-auto">
                        Ir para Pagamento
                      </Button>
                  </div>
                </form>
              )}

              {step === "payment" && (
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600' : 'hover:bg-stone-50'}`}>
                        <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="mr-3" />
                        <div className="flex-1">
                            <p className="font-bold text-gray-900">Cartão de Crédito / Boleto</p>
                            <p className="text-xs text-gray-500">Checkout seguro via Mercado Pago</p>
                        </div>
                    </label>

                    <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'pix' ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600' : 'hover:bg-stone-50'}`}>
                        <input type="radio" name="paymentMethod" value="pix" checked={paymentMethod === 'pix'} onChange={() => setPaymentMethod('pix')} className="mr-3" />
                        <div className="flex-1">
                            <p className="font-bold text-gray-900">PIX (Aprovação Imediata)</p>
                            <p className="text-xs text-gray-500">Gera QR Code instantâneo - Rápido e Seguro</p>
                        </div>
                    </label>
                  </div>

                  <div className="flex justify-between pt-6 border-t mt-6">
                      <Button type="button" variant="ghost" onClick={() => setStep("shipping")}>Voltar</Button>
                      <Button type="submit" size="lg" disabled={isProcessing} className="bg-emerald-700 hover:bg-emerald-800 text-white min-w-[200px]">
                        {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processando...</> : (paymentMethod === 'pix' ? 'Gerar PIX' : 'Pagar com Cartão')}
                      </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Resumo Lateral */}
          <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl border border-gray-200 sticky top-20 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 text-lg font-serif">Resumo do Pedido</h3>
                <div className="space-y-3 mb-4 text-sm text-gray-600">
                   {items.map(item => (
                       <div key={item.id} className="flex justify-between items-start border-b border-gray-50 pb-2">
                           <span className="max-w-[70%]">{item.quantity}x {item.name}</span>
                           <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
                       </div>
                   ))}
                </div>
                <div className="pt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>R$ {totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-emerald-700 font-medium">
                        <span>Frete {selectedShipping ? `(${selectedShipping.name})` : ''}</span>
                        <span>{selectedShipping ? (selectedShipping.price === 0 ? 'Grátis' : `R$ ${selectedShipping.price.toFixed(2)}`) : 'Calculando...'}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xl pt-4 border-t mt-2 text-stone-900">
                        <span>Total</span>
                        <span>R$ {finalTotal.toFixed(2)}</span>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}