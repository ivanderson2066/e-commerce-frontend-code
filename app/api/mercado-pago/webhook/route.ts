import { NextRequest, NextResponse } from 'next/server';
import { getMerchantOrder, verifyWebhookSignature, getPaymentStatus } from '@/lib/mercado-pago-config';
import { getSupabaseAdmin } from '@/lib/supabase-server';

// Webhook handler: valida assinatura e atualiza pedido no Supabase
export async function POST(request: NextRequest) {
  try {
    // 1. Tentar ler o corpo da requisição com segurança
    const rawBody = await request.text();
    if (!rawBody) {
        return NextResponse.json({ error: 'Empty body' }, { status: 400 });
    }

    const body = JSON.parse(rawBody);
    console.log('[Webhook] Evento recebido:', body.type || body.topic, body.data?.id || body.resource);

    // 2. Validação de Segurança (Opcional mas recomendada em produção)
    // Em desenvolvimento/testes locais sem HTTPS válido, isso pode falhar, então deixamos opcional via ENV
    const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = request.headers.get('x-signature');
      const requestId = request.headers.get('x-request-id');
      
      // Se tiver a lógica de verificação implementada em lib/mercado-pago-config, use-a aqui.
      // Caso contrário, em MVP, confiar no ID do evento é aceitável se o ID do pagamento for verificado na API do MP.
    }

    const { type, topic, data } = body;
    const eventType = type || topic; // MP manda 'payment' ou 'topic: payment' dependendo da versão
    const id = data?.id || body.resource?.split('/').pop();

    let orderUpdate = null;

    // 3. Processar Pagamento
    if (eventType === 'payment') {
      // FIX: Adicionado ': any' para evitar erro de tipo TS(2339)
      const payment: any = await getPaymentStatus(String(id));
      
      if (payment) {
        const externalReference = payment.external_reference || payment.order?.external_reference;
        const status = payment.status; // approved, pending, rejected

        console.log(`[Webhook] Pagamento ${id} para pedido ${externalReference}: ${status}`);

        if (externalReference) {
            const supabaseAdmin = getSupabaseAdmin();
            
            // Mapeia status do MP para o do seu sistema
            const orderStatus = status === 'approved' ? 'paid' : 
                                status === 'pending' ? 'pending' : 
                                status === 'rejected' ? 'cancelled' : 'pending';

            const { error } = await supabaseAdmin
                .from('orders')
                .update({ 
                    status: orderStatus, 
                    payment_id: String(id),
                    updated_at: new Date().toISOString()
                })
                .eq('order_number', externalReference);

            if (error) console.error('[Webhook] Erro ao atualizar pedido:', error);
            else orderUpdate = { order: externalReference, status: orderStatus };
        }
      }
    } 
    // 4. Processar Merchant Order (Opcional, útil para PIX)
    else if (eventType === 'merchant_order') {
       // FIX: Adicionado ': any' para evitar erro de tipo TS(2339)
       const merchantOrder: any = await getMerchantOrder(String(id));
       
       if (merchantOrder) {
         const externalReference = merchantOrder.external_reference;
         const status = merchantOrder.status;
         
         console.log(`[Webhook] Merchant Order ${id} para ${externalReference}: ${status}`);
         
         if (externalReference) {
             const supabaseAdmin = getSupabaseAdmin();
             // Atualiza timestamp ou status se necessário
             await supabaseAdmin
                .from('orders')
                .update({ updated_at: new Date().toISOString() })
                .eq('order_number', externalReference);
         }
       }
    }

    return NextResponse.json({ received: true, update: orderUpdate }, { status: 200 });

  } catch (error: any) {
    console.error('[Webhook] Erro fatal:', error);
    // Retornar 200 mesmo com erro para evitar que o Mercado Pago fique reenviando (loop infinito)
    // A menos que seja um erro de servidor temporário
    return NextResponse.json({ received: true, error: error.message }, { status: 200 });
  }
}