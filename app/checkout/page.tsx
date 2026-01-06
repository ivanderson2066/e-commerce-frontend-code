'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { useShipping } from '@/lib/shipping-context';
import { useAddresses, Address } from '@/lib/addresses-context';
import { SavedAddressSelector } from '@/components/checkout/saved-address-selector';
import { formatCardNumber, maskCEP } from '@/lib/payment-utils';
import { ChevronLeft, AlertCircle, CheckCircle, Copy, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type CheckoutStep = 'shipping' | 'payment' | 'confirmation';
type PaymentMethod = 'card' | 'pix';

interface OrderData {
  orderId: string;
  items: any[];
  shippingAddress: any;
  shippingOption: any;
  paymentMethod: string;
  total: number;
  transactionId: string; // QR Code (Copia e Cola)
  pixQRCodeBase64?: string; // Imagem Base64
  paymentId?: string; // ID do pagamento no MP (Importante para verificação)
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const { addresses } = useAddresses();

  const {
    selectedShipping,
    shippingOptions,
    calculateShipping,
    selectShipping,
    isLoading: isShippingLoading,
    error: shippingError,
  } = useShipping();

  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [error, setError] = useState<string>('');
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  // Estados para Polling do PIX
  const [pixStatus, setPixStatus] = useState<'pending' | 'paid'>('pending');
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    city: '',
    state: '',
    cpf: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [showShippingOptions, setShowShippingOptions] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);

  useEffect(() => {
    if (shippingError) setError(shippingError);
  }, [shippingError]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const handleAddressSelect = (address: Address | null) => {
    setSelectedAddress(address);
    if (address) {
      setFormData((prev) => ({
        ...prev,
        street: address.street,
        number: address.number,
        complement: address.complement || '',
        city: address.city,
        state: address.state,
        cep: address.cep,
      }));
    }
  };

  // Polling Logic para PIX Transparente
  useEffect(() => {
    // Só ativa se estiver na etapa de confirmação, for PIX e tivermos os IDs
    if (step === 'confirmation' && orderData?.paymentMethod === 'PIX' && pixStatus === 'pending') {
      const checkPixStatus = async () => {
        try {
          const response = await fetch('/api/orders/sync-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: orderData.orderId,
              paymentId: orderData.paymentId, // Enviamos o ID do pagamento para checagem
            }),
          });
          const data = await response.json();

          if (data.status === 'paid' || data.status === 'approved') {
            setPixStatus('paid');
            toast.success('Pagamento PIX confirmado!');
            if (pollingInterval.current) clearInterval(pollingInterval.current);

            // Redireciona para a página de sucesso definitiva ou pedidos após 2s
            setTimeout(() => router.push('/account/orders'), 3000);
          }
        } catch (err) {
          console.error('Erro ao verificar PIX:', err);
        }
      };

      // Verifica a cada 3 segundos
      pollingInterval.current = setInterval(checkPixStatus, 3000);

      // Primeira verificação imediata
      checkPixStatus();

      return () => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);
      };
    }
  }, [step, orderData, pixStatus, router]);

  if (!user) return null; // O layout já redireciona, mas por segurança

  if (items.length === 0 && step === 'shipping') {
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

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'cep') formattedValue = maskCEP(value.replace(/\D/g, '').slice(0, 8));
    if (name === 'cpf') formattedValue = value.replace(/\D/g, '').slice(0, 11);
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleCalculateShipping = async () => {
    const cleanCep = formData.cep.replace(/\D/g, '');
    if (cleanCep.length < 8) {
      setError('CEP inválido. Digite 8 números.');
      return;
    }
    setError('');
    setShowShippingOptions(false);
    try {
      await calculateShipping(cleanCep);
      setShowShippingOptions(true);
    } catch (err) {
      console.error('Erro no componente ao calcular frete', err);
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipping) {
      setError('Selecione uma opção de frete para continuar.');
      return;
    }
    if (!formData.street || !formData.number || !formData.city || !formData.state) {
      setError('Preencha todos os dados de endereço.');
      return;
    }
    setError('');
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

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

      const response = await fetch('/api/mercado-pago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Erro ao criar pagamento');

      const { type, payload: mpData, order } = data;

      if (type === 'preference') {
        const initPoint = mpData?.init_point || mpData?.sandbox_init_point;
        if (initPoint) {
          window.location.href = initPoint;
          return;
        }
      }

      if (type === 'pix') {
        const orderObj: OrderData = {
          orderId: order.order_number,
          items: items,
          shippingAddress: formData,
          shippingOption: selectedShipping,
          paymentMethod: 'PIX',
          total: order.total,
          transactionId: mpData.qr_code,
          pixQRCodeBase64: mpData.qr_code_base64,
          paymentId: mpData.payment_id, // Importante: Salvar o ID para fazer polling
        };
        setOrderData(orderObj);
        setStep('confirmation');
        clearCart();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao processar pagamento.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyPix = () => {
    if (orderData?.transactionId) {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
          .writeText(orderData.transactionId)
          .then(() => {
            setPixCopied(true);
            setTimeout(() => setPixCopied(false), 2000);
            toast.success('Código PIX copiado!');
          })
          .catch(() => {
            // Fallback to legacy method
            copyToClipboardLegacy(orderData.transactionId);
          });
      } else {
        // Fallback for non-secure contexts
        copyToClipboardLegacy(orderData.transactionId);
      }
    }
  };

  const copyToClipboardLegacy = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2000);
      toast.success('Código PIX copiado!');
    } catch (err) {
      toast.error('Não foi possível copiar. Copie manualmente.');
      console.error('Copy error:', err);
    } finally {
      document.body.removeChild(textarea);
    }
  };

  if (step === 'confirmation' && orderData) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-emerald-50 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white border border-emerald-200 p-8 text-center shadow-sm rounded-xl">
            {pixStatus === 'paid' ? (
              // TELA DE SUCESSO APÓS PAGAMENTO DETECTADO
              <div className="animate-in zoom-in duration-500">
                <CheckCircle className="h-20 w-20 text-emerald-600 mx-auto mb-6" />
                <h1 className="text-3xl font-serif font-medium text-emerald-900 mb-2">
                  Pagamento Recebido!
                </h1>
                <p className="text-gray-600 mb-6">
                  Seu pedido <strong>{orderData.orderId}</strong> foi confirmado.
                </p>
                <Button
                  asChild
                  className="w-full bg-emerald-800 text-white hover:bg-emerald-900 h-12 text-lg"
                >
                  <Link href="/account/orders">Ver Meus Pedidos</Link>
                </Button>
              </div>
            ) : (
              // TELA DE QR CODE COM POLLING
              <>
                <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-6" />
                <h1 className="text-3xl font-serif font-medium text-emerald-900 mb-2">
                  Pedido Gerado!
                </h1>
                <p className="text-gray-600 mb-6">
                  Número do pedido: <strong>{orderData.orderId}</strong>
                </p>

                {orderData.paymentMethod === 'PIX' && (
                  <div className="mb-8 p-6 bg-stone-50 border-2 border-dashed border-emerald-300 rounded-xl text-left relative">
                    {/* Indicador de Polling */}
                    <div className="absolute top-2 right-2 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full animate-pulse">
                      <RefreshCw className="h-3 w-3 animate-spin" /> Aguardando pagamento...
                    </div>

                    <div className="text-center mb-4">
                      <p className="font-bold text-lg text-emerald-800 mb-1">Pagamento via PIX</p>
                      <p className="text-sm text-gray-500">Use o App do seu banco para pagar</p>
                    </div>

                    {orderData.pixQRCodeBase64 && (
                      <div className="flex justify-center mb-4">
                        <img
                          src={`data:image/png;base64,${orderData.pixQRCodeBase64}`}
                          alt="QR Code PIX"
                          className="w-48 h-48 object-contain mix-blend-multiply"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-500 uppercase">
                        Código Copia e Cola:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={orderData.transactionId}
                          readOnly
                          className="flex-1 px-3 py-2 text-xs font-mono border border-gray-300 bg-white rounded outline-none focus:border-emerald-500"
                        />
                        <Button
                          onClick={handleCopyPix}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {pixCopied ? 'Copiado!' : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    asChild
                    className="w-full bg-emerald-800 text-white hover:bg-emerald-900 h-12 text-lg"
                  >
                    <Link href="/account/orders">Acompanhar Pedido</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-12 border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                  >
                    <Link href="/">Voltar à Loja</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Renderização normal do form de checkout (Steps 1 e 2)
  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <button
          onClick={() => {
            if (step === 'payment') setStep('shipping');
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
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm">
              <div className="flex gap-4 mb-12 border-b border-gray-100">
                <div
                  className={`pb-3 border-b-2 transition-all ${step === 'shipping' ? 'border-emerald-600 text-emerald-800 font-bold' : 'border-transparent text-gray-400'}`}
                >
                  1. Entrega
                </div>
                <div
                  className={`pb-3 border-b-2 transition-all ${step === 'payment' ? 'border-emerald-600 text-emerald-800 font-bold' : 'border-transparent text-gray-400'}`}
                >
                  2. Pagamento
                </div>
              </div>

              {step === 'shipping' && (
                <form onSubmit={handleShippingSubmit} className="space-y-6">
                  {/* Seletor de Endereços Salvos */}
                  {user && addresses.length > 0 && (
                    <SavedAddressSelector
                      onAddressSelect={handleAddressSelect}
                      selectedAddressId={selectedAddress?.id}
                    />
                  )}

                  {/* Campos do formulário de envio (mantidos do seu código original) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleShippingChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CPF (Obrigatório)
                      </label>
                      <input
                        type="text"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleShippingChange}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleShippingChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex gap-4 items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CEP
                          </label>
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
                          {isShippingLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Calcular Frete'
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Endereço
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleShippingChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                      <input
                        type="text"
                        name="number"
                        value={formData.number}
                        onChange={handleShippingChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleShippingChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleShippingChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  {showShippingOptions && (
                    <div className="space-y-3 mt-6 bg-stone-50 p-4 rounded-lg border border-stone-100">
                      <p className="font-bold text-sm text-gray-700 mb-2">Opções de Entrega:</p>
                      {shippingOptions.map((option) => (
                        <label
                          key={option.id}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer bg-white ${selectedShipping?.id === option.id ? 'border-emerald-500 ring-1 ring-emerald-500' : 'hover:border-emerald-300'}`}
                        >
                          <input
                            type="radio"
                            name="shipping"
                            checked={selectedShipping?.id === option.id}
                            onChange={() => selectShipping(option)}
                            className="mr-4"
                          />
                          <div className="flex-1 flex justify-between">
                            <span className="font-bold">{option.name}</span>
                            <span className="font-bold text-emerald-700">
                              R$ {option.price.toFixed(2)}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={!selectedShipping}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white"
                    >
                      Ir para Pagamento
                    </Button>
                  </div>
                </form>
              )}

              {step === 'payment' && (
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <label
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600' : 'hover:bg-stone-50'}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-bold text-gray-900">Cartão de Crédito / Boleto</p>
                        <p className="text-xs text-gray-500">Checkout seguro via Mercado Pago</p>
                      </div>
                    </label>

                    <label
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'pix' ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600' : 'hover:bg-stone-50'}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="pix"
                        checked={paymentMethod === 'pix'}
                        onChange={() => setPaymentMethod('pix')}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-bold text-gray-900">PIX (Aprovação Imediata)</p>
                        <p className="text-xs text-gray-500">Gera QR Code instantâneo</p>
                      </div>
                    </label>
                  </div>

                  <div className="flex justify-between pt-6 border-t mt-6">
                    <Button type="button" variant="ghost" onClick={() => setStep('shipping')}>
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isProcessing}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white min-w-[200px]"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...
                        </>
                      ) : (
                        'Finalizar Pedido'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
          {/* Resumo Lateral (Mantido simples para economizar espaço) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl border border-gray-200 sticky top-20 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Resumo</h3>
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>R$ {(totalPrice + shippingPrice).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
