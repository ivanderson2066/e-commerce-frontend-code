import { NextRequest, NextResponse } from 'next/server';
import { getMerchantOrder, verifyWebhookSignature, getPaymentStatus } from '@/lib/mercado-pago-config';
import { getSupabaseAdmin } from '@/lib/supabase-server';

// Webhook handler: valida assinatura e atualiza pedido no Supabase
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    // Tentar extrair assinatura de headers comuns (ajuste se necessário)
    const signature =
      request.headers.get('x-meli-signature') ||
      request.headers.get('x-hook-signature') ||
      request.headers.get('x-signature') ||
      request.headers.get('x-sent-signature') ||
      '';

    const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET || '';

    // Validate signature if secret available
    if (webhookSecret) {
      const verified = verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!verified) {
        console.warn('[v0] Assinatura de webhook inválida');
        return NextResponse.json({ received: false }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);
    console.log('[v0] Webhook recebido:', body);

    const { type, data } = body;

    if (type === 'payment') {
      const paymentId = data?.id;
      try {
        const payment = await getPaymentStatus(String(paymentId));
        const externalReference = payment?.external_reference || payment?.order?.external_reference;

        if (externalReference) {
      const supabaseAdmin = getSupabaseAdmin();
      await supabaseAdmin
        .from('orders')
        .update({ status: payment?.status || 'paid', payment_id: String(paymentId) })
        .eq('order_number', externalReference);

          console.log(`[v0] Pedido ${externalReference} atualizado para status: ${payment?.status}`);
        }
      } catch (err) {
        console.error('[v0] Erro ao processar payment webhook:', err);
      }
    } else if (type === 'merchant_order') {
      const merchantOrderId = data?.id;
      try {
        const merchantOrder = await getMerchantOrder(String(merchantOrderId));
        console.log('[v0] Detalhes da merchant order:', merchantOrder);

        const externalReference = merchantOrder?.external_reference;
        if (externalReference) {
          const supabaseAdmin = getSupabaseAdmin();
          await supabaseAdmin
            .from('orders')
            .update({ status: merchantOrder?.status || 'processing' })
            .eq('order_number', externalReference);

          console.log(`[v0] Pedido ${externalReference} atualizado para status: ${merchantOrder?.status}`);
        }
      } catch (error) {
        console.error('[v0] Erro ao processar merchant order:', error);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[v0] Erro ao processar webhook:', error);
    // Retornar 200 para evitar retries desnecessários se não for crítico
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Webhook endpoint ativo' });
}
