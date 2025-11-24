export interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  email: string;
  name: string;
  paymentMethod?: "card" | "pix";
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
  timestamp: string;
  pixQRCode?: string;
  preferenceUrl?: string;
}

export async function processPayment(paymentData: PaymentData): Promise<PaymentResult> {
  try {
    // Simulate processing with real Mercado Pago integration ready
    const transactionId = `MP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate simulated PIX QR code for demonstration
    const pixQRCode = paymentData.paymentMethod === "pix" 
      ? `00020126580014br.gov.bcb.pix0136${Date.now()}123456789012345678${Math.random().toString(36).substr(2, 9)}`
      : undefined;

    return {
      success: true,
      transactionId,
      pixQRCode,
      message: "Pagamento processado com sucesso no Mercado Pago",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Erro ao processar pagamento:", error);
    throw new Error("Erro ao processar pagamento");
  }
}

// Server-backed preference creation (uses Next.js API route)
export async function createPreferenceServer(payload: {
  items: any[];
  shippingPrice: number;
  customerEmail: string;
  customerName: string;
  shippingAddress?: any;
  orderId?: string;
  userId?: string; // Added userId field
}) {
  const res = await fetch('/api/mercado-pago/create-preference', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'unknown' }));
    throw new Error(err?.error || 'Erro ao criar preferência no servidor');
  }

  return await res.json();
}

export function formatCardNumber(value: string): string {
  return value
    .replace(/\s/g, "")
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

export function maskCEP(value: string): string {
  return value.replace(/(\d{5})(\d{3})/, "$1-$2");
}