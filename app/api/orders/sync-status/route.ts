import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { getPaymentStatus } from '@/lib/mercado-pago-config';

export async function POST(request: NextRequest) {
  try {
    // Agora aceitamos também paymentId (queryId ou collection_id) vindo do frontend
    const { orderId, paymentId: paymentIdFromFront } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID é obrigatório' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Buscar o pedido no banco de dados
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_number', orderId)
      .single();

    if (error || !order) {
      console.error('[Sync] Pedido não encontrado:', orderId);
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    // Se já estiver pago, retorna logo
    if (order.status === 'paid' || order.status === 'approved') {
       return NextResponse.json({ 
          orderId: order.order_number, 
          status: 'paid',
          paymentId: order.payment_id
       });
    }

    // DECISÃO INTELIGENTE:
    // Usamos o ID que já está no banco OU o que veio do frontend (URL de retorno)
    // Isso resolve o problema de o Webhook ainda não ter chegado.
    const idToVerify = order.payment_id || paymentIdFromFront;

    if (idToVerify) {
      console.log(`[Sync] Verificando status no MP para pedido ${orderId} (ID Pagamento: ${idToVerify})...`);
      
      try {
        const paymentMP = await getPaymentStatus(idToVerify);

        if (paymentMP) {
            const mpStatus = paymentMP.status;
            console.log(`[Sync] Status retornado pelo MP: ${mpStatus}`);

            let newStatus = order.status;

            if (mpStatus === 'approved') {
                newStatus = 'paid';
            } else if (mpStatus === 'cancelled' || mpStatus === 'rejected') {
                newStatus = 'cancelled';
            }

            // Se o status mudou OU se precisamos salvar o payment_id que faltava
            if (newStatus !== order.status || !order.payment_id) {
                const { error: updateError } = await supabaseAdmin
                .from('orders')
                .update({ 
                    status: newStatus,
                    payment_id: String(idToVerify), // Garante que salvamos o ID
                    updated_at: new Date().toISOString()
                })
                .eq('id', order.id);

                if (!updateError) {
                    console.log(`[Sync] Pedido ${orderId} atualizado para ${newStatus} com PaymentID ${idToVerify}.`);
                    order.status = newStatus; 
                    order.payment_id = String(idToVerify);
                } else {
                    console.error('[Sync] Erro ao atualizar banco:', updateError);
                }
            }
        }
      } catch (err) {
        console.error('[Sync] Erro ao consultar API do Mercado Pago:', err);
      }
    } else {
        console.log(`[Sync] Pedido ${orderId} sem ID de pagamento para verificar.`);
    }

    return NextResponse.json({ 
      orderId: order.order_number, 
      status: order.status,
      paymentId: order.payment_id
    });

  } catch (error: any) {
    console.error('[Sync] Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}