import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment, MerchantOrder } from 'mercadopago';
import { getSupabaseAdmin } from '@/lib/supabase-server';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' });
const paymentClient = new Payment(client);
const orderClient = new MerchantOrder(client);

export async function POST(request: NextRequest) {
  try {
    // IMPORTANTE: O await aqui é obrigatório para a Vercel não matar o processo
    await processMPEvent(request);
    
    return NextResponse.json({ status: "received" });
  } catch (error) {
    console.error("❌ [Webhook] Erro Fatal no Handler:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

async function processMPEvent(request: Request) {
  try {
    const url = new URL(request.url);

    let body: any = {};
    try { body = await request.json(); } catch {}

    const topic = url.searchParams.get("topic") || body?.topic || body?.type;
    const id = url.searchParams.get("id") || url.searchParams.get("data.id") || body?.resource || body?.data?.id || body?.id;

    console.log(`🔔 [Webhook] Evento: ${topic} | ID: ${id}`);

    if (!topic || !id) return;

    // ░░░░░░░░░░░░░
    // 1. MERCHANT_ORDER
    // ░░░░░░░░░░░░░
    if (topic === "merchant_order") {
      const order = await orderClient.get({ merchantOrderId: id });

      if (!order) return console.log("⚠️ merchant_order não encontrada");

      // Forçamos 'as any' para evitar problemas de tipagem com o SDK
      const payments = (order.payments || []) as any[];
      const payment = payments.find((p) => p.status === 'approved') || payments[0];
      
      if (!payment) return console.log("⚠️ Nenhum pagamento dentro da merchant_order");

      console.log("📦 merchant_order -> pagamento:", payment.id, payment.status);

      await updateOrder(payment.id, payment.status, order.external_reference);
      return;
    }

    // ░░░░░░░░░░░░░
    // 2. PAYMENT
    // ░░░░░░░░░░░░░
    if (topic === "payment") {
      const payment = await paymentClient.get({ id }) as any;

      if (!payment) return;

      const status = payment.status;
      const ref = payment.external_reference;

      console.log(`💰 payment -> Status: ${status} | ID: ${id} | Ref: ${ref}`);

      await updateOrder(id, status, ref);
      return;
    }

  } catch (e) {
    console.error("❌ Erro ao processar webhook:", e);
  }
}

async function updateOrder(paymentId: any, status: any, ref: any) {
  const supabase = getSupabaseAdmin();

  let orderStatus = "pending";
  if (status === "approved") orderStatus = "paid";
  if (status === "rejected" || status === "cancelled") orderStatus = "cancelled";
  if (status === "in_process" || status === "authorized") orderStatus = "pending";

  console.log(`🔄 [Supabase] Atualizando pedido ${ref} -> ${orderStatus}`);

  const updatePayload = {
      status: orderStatus,
      payment_id: String(paymentId),
      updated_at: new Date().toISOString()
  };

  // 1. Tenta atualizar pelo Número do Pedido (external_reference)
  // CORREÇÃO: Usamos .select() sem argumentos para evitar erro de tipagem "0-1 arguments expected"
  let { data, error } = await supabase
    .from("orders")
    .update(updatePayload)
    .eq("order_number", ref)
    .select();

  // 2. Fallback: Se falhou (data vazio ou null), tenta pelo ID do Pagamento
  if (error || !data || data.length === 0) {
      console.warn(`⚠️ [Supabase] Falha por Order Number. Tentando por Payment ID...`);
      
      const retry = await supabase
        .from("orders")
        .update({ status: orderStatus, updated_at: new Date().toISOString() })
        .eq("payment_id", String(paymentId))
        .select();
      
      if (!retry.error && retry.data && retry.data.length > 0) {
          console.log(`✅ [Supabase] Recuperado! Atualizado via Payment ID.`);
      } else {
          console.error(`❌ [Supabase] Falha total. Verifique permissões (Service Role) ou se o pedido existe.`);
      }
  } else {
      console.log("✅ [Supabase] Sucesso via Order Number.");
  }
}